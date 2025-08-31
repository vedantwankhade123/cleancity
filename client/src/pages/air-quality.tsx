import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AirQualityCard } from '@/components/air-quality/air-quality-card';
import { Loader2, MapPin, Search } from 'lucide-react';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
interface AirQualityPageProps {
  setShowLoginModal: (show: boolean) => void;
  setShowSignupModal: (show: boolean) => void;
  setAuthType: (type: 'user' | 'admin') => void;
}

// List of major Indian cities
const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad',
  'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur',
  'Lucknow', 'Kanpur', 'Nagpur', 'Visakhapatnam', 'Indore',
  'Thane', 'Bhopal', 'Patna', 'Vadodara', 'Ghaziabad','Amravati'
].sort();

const AirQualityPage: React.FC<AirQualityPageProps> = ({
  setShowLoginModal,
  setShowSignupModal,
  setAuthType,
}) => {
  const [location, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [city, setCity] = useState('Mumbai');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [customCity, setCustomCity] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLoadingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
        setLoadingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to retrieve your location');
        setLoadingLocation(false);
      }
    );
  };

  // Handle city selection from dropdown
  const handleCitySelect = (value: string) => {
    if (value === 'current') {
      getUserLocation();
      setCity('Your Location');
    } else if (value === 'custom') {
      setShowCustomInput(true);
      setCity('');
    } else {
      setShowCustomInput(false);
      setCity(value);
    }
  };

  // Handle search for custom city
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCity.trim()) {
      setCity(customCity.trim());
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        setShowLoginModal={setShowLoginModal}
        setShowSignupModal={setShowSignupModal}
        setAuthType={setAuthType}
      />
      
      <main className="flex-grow container mx-auto px-4 pt-28 pb-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2">Air Quality Index</h1>
            <p className="text-gray-600">Check real-time air quality information for cities across India</p>
          </div>
          
          <Card className="mb-6 sm:mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">Search Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="w-full">
                    <Select 
                      value={showCustomInput ? 'custom' : (city === 'Your Location' ? 'current' : city)} 
                      onValueChange={handleCitySelect}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            Use My Location
                          </div>
                        </SelectItem>
                        <div className="px-3 py-2 text-xs text-gray-500">Major Indian Cities</div>
                        {INDIAN_CITIES.map((cityOption) => (
                          <SelectItem key={cityOption} value={cityOption}>
                            {cityOption}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Enter custom location</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {showCustomInput && (
                    <form onSubmit={handleSearch} className="w-full flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter city name"
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                        className="flex-1 min-w-0"
                      />
                      <Button 
                        type="submit" 
                        disabled={!customCity.trim()}
                        className="shrink-0"
                      >
                        <Search className="h-4 w-4 sm:mr-2" />
                        <span className="sr-only sm:not-sr-only">Search</span>
                      </Button>
                    </form>
                  )}
                </div>
                
                {loadingLocation && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Detecting your location...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-6 md:grid-cols-2">
            <AirQualityCard city={city} />
            
            <Card>
              <CardHeader>
                <CardTitle>Air Quality Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-green-500"></div>
                      <span>Good (0-50)</span>
                    </div>
                    <span className="text-sm text-gray-500">Air quality is satisfactory</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
                      <span>Moderate (51-100)</span>
                    </div>
                    <span className="text-sm text-gray-500">Acceptable quality</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-orange-500"></div>
                      <span>Unhealthy for Sensitive Groups (101-150)</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-red-500"></div>
                      <span>Unhealthy (151-200)</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-purple-900"></div>
                      <span>Very Unhealthy (201-300)</span>
                    </div>
                    <span className="text-sm text-gray-500">Health alert</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-red-900"></div>
                      <span>Hazardous (301-500)</span>
                    </div>
                    <span className="text-sm text-gray-500">Health warning</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium mb-2">Health Recommendations</h3>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Check AQI before outdoor activities</li>
                    <li>• Keep windows closed when AQI is high</li>
                    <li>• Use air purifiers indoors</li>
                    <li>• Wear N95 masks when going outside in poor air quality</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Air Quality in {city || 'Your Location'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p>
                  The Air Quality Index (AQI) is an indicator of air pollution levels.
                  In India, air quality is a significant concern, especially in urban areas.
                  The AQI scale runs from 0 to 500, with higher values indicating worse air quality.
                </p>
                <p className="mt-4">
                  Common air pollutants in Indian cities include particulate matter (PM2.5 and PM10),
                  nitrogen dioxide (NO₂), sulfur dioxide (SO₂), carbon monoxide (CO), and ground-level ozone (O₃).
                  These pollutants can have adverse effects on health, particularly for children, the elderly,
                  and those with pre-existing respiratory conditions.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AirQualityPage;
