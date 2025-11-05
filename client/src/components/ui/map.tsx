import React, { useState, useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { LatLngExpression, LatLng, Icon } from "leaflet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, LocateFixed, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Fix for default icon issue with webpack
import "leaflet/dist/images/marker-icon.png";
import "leaflet/dist/images/marker-shadow.png";

const defaultIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapComponentProps {
  onLocationSelect: (latitude: string, longitude: string, address: string) => void;
  initialLatitude?: string;
  initialLongitude?: string;
  initialAddress?: string;
}

const DraggableMarker = ({ position, setPosition, onAddressUpdate }: { position: LatLng, setPosition: (pos: LatLng) => void, onAddressUpdate: (address: string) => void }) => {
  const markerRef = useRef<any>(null);
  const map = useMap();

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition(newPos);
          map.panTo(newPos);
          
          // Reverse geocode to get address
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPos.lat}&lon=${newPos.lng}`)
            .then(res => res.json())
            .then(data => {
              onAddressUpdate(data.display_name || "Address not found");
            });
        }
      },
    }),
    [map, setPosition, onAddressUpdate],
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={defaultIcon}
    />
  );
};

const MapRecenter = ({ center }: { center: LatLngExpression }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({
  onLocationSelect,
  initialLatitude,
  initialLongitude,
  initialAddress,
}) => {
  const [position, setPosition] = useState<LatLng>(new LatLng(20.9374, 77.7796)); // Default to Amravati
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([20.9374, 77.7796]);
  const [address, setAddress] = useState(initialAddress || "Amravati, Maharashtra, India");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialLatitude && initialLongitude) {
      const initialPos = new LatLng(parseFloat(initialLatitude), parseFloat(initialLongitude));
      setPosition(initialPos);
      setMapCenter([parseFloat(initialLatitude), parseFloat(initialLongitude)]);
    }
  }, [initialLatitude, initialLongitude]);

  useEffect(() => {
    onLocationSelect(position.lat.toString(), position.lng.toString(), address);
  }, [position, address, onLocationSelect]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    setIsLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newPos = new LatLng(parseFloat(lat), parseFloat(lon));
        setPosition(newPos);
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
        setAddress(display_name);
      } else {
        toast({ title: "Location not found", description: "Please try a different search term.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Search failed", description: "Could not connect to the location service.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newPos = new LatLng(latitude, longitude);
        setPosition(newPos);
        setMapCenter([latitude, longitude]);
        
        // Reverse geocode
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          .then(res => res.json())
          .then(data => {
            setAddress(data.display_name || "Current Location");
            setIsLoading(false);
          });
      },
      (error) => {
        toast({ title: "Geolocation Error", description: error.message, variant: "destructive" });
        setIsLoading(false);
      }
    );
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Search for a location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button type="submit" size="icon" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </form>
      <Button variant="outline" className="w-full gap-2" onClick={handleGetCurrentLocation} disabled={isLoading}>
        <LocateFixed className="h-4 w-4" />
        Use My Current Location
      </Button>
      <div className="h-64 w-full rounded-md overflow-hidden z-0">
        <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <DraggableMarker position={position} setPosition={setPosition} onAddressUpdate={setAddress} />
          <MapRecenter center={mapCenter} />
        </MapContainer>
      </div>
      <div className="p-2 bg-gray-100 rounded-md text-sm">
        <p className="font-semibold">Selected Address:</p>
        <p className="text-gray-600">{address}</p>
      </div>
    </div>
  );
};

export default MapComponent;