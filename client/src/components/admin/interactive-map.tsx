import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Report } from '@shared/schema';
import L from 'leaflet';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Flag, Loader2, CheckCircle, XCircle } from 'lucide-react';
import ReactDOMServer from 'react-dom/server';

interface InteractiveMapProps {
  reports: Report[];
  cityCoords?: [number, number];
}

const getStatusIcon = (status: string) => {
  let icon;
  let colorClass;

  switch (status) {
    case 'pending':
      icon = <Flag className="h-5 w-5" />;
      colorClass = 'text-gray-600 bg-gray-100 border-gray-400';
      break;
    case 'processing':
      icon = <Loader2 className="h-5 w-5 animate-spin" />;
      colorClass = 'text-orange-600 bg-orange-100 border-orange-400';
      break;
    case 'completed':
      icon = <CheckCircle className="h-5 w-5" />;
      colorClass = 'text-green-600 bg-green-100 border-green-400';
      break;
    case 'rejected':
      icon = <XCircle className="h-5 w-5" />;
      colorClass = 'text-red-600 bg-red-100 border-red-400';
      break;
    default:
      icon = <Flag className="h-5 w-5" />;
      colorClass = 'text-gray-600 bg-gray-100 border-gray-400';
  }

  return L.divIcon({
    html: ReactDOMServer.renderToString(
      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-md ${colorClass}`}>
        {icon}
      </div>
    ),
    className: 'bg-transparent border-none',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const InteractiveMap: React.FC<InteractiveMapProps> = ({ reports, cityCoords = [20.9374, 77.7796] }) => { // Default to Amravati
  const validReports = reports.filter(
    report => report.latitude && report.longitude && report.latitude !== '0' && report.longitude !== '0'
  );

  const mapCenter: [number, number] = validReports.length > 0
    ? [parseFloat(validReports[0].latitude), parseFloat(validReports[0].longitude)]
    : cityCoords;

  return (
    <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {validReports.map(report => (
        <Marker
          key={report.id}
          position={[parseFloat(report.latitude), parseFloat(report.longitude)]}
          icon={getStatusIcon(report.status)}
        >
          <Popup>
            <div className="w-64">
              <h4 className="font-bold mb-2">{report.title}</h4>
              <img src={report.imageUrl} alt={report.title} className="w-full h-32 object-cover rounded-md mb-2" />
              <p className="text-sm text-gray-600 mb-1"><strong>Status:</strong> {report.status}</p>
              <p className="text-sm text-gray-600 mb-2"><strong>Address:</strong> {report.address}</p>
              <Link href={`/admin/reports?id=${report.id}`}>
                <Button size="sm" className="w-full">View Details</Button>
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default InteractiveMap;