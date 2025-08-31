import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AirQualityData {
  current: {
    time: string;
    pm10: number;
    pm2_5: number;
    carbon_monoxide: number;
    nitrogen_dioxide: number;
    sulphur_dioxide: number;
    ozone: number;
    us_aqi: number;
  };
  current_units: {
    time: string;
    pm10: string;
    pm2_5: string;
    carbon_monoxide: string;
    nitrogen_dioxide: string;
    sulphur_dioxide: string;
    ozone: string;
  };
}

const getAQICategory = (aqi: number) => {
  if (aqi <= 50) return { label: 'Good', color: 'bg-green-500', description: 'Air quality is satisfactory' };
  if (aqi <= 100) return { label: 'Moderate', color: 'bg-yellow-500', description: 'Air quality is acceptable' };
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: 'bg-orange-500', description: 'Members of sensitive groups may experience health effects' };
  if (aqi <= 200) return { label: 'Unhealthy', color: 'bg-red-500', description: 'Everyone may begin to experience health effects' };
  if (aqi <= 300) return { label: 'Very Unhealthy', color: 'bg-purple-900', description: 'Health alert: everyone may experience more serious health effects' };
  return { label: 'Hazardous', color: 'bg-red-900', description: 'Health warning of emergency conditions' };
};

export const AirQualityCard = ({ city = 'Mumbai' }) => {
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAirQuality = async () => {
      try {
        // First, get coordinates for the city
        const geocodingResponse = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );
        
        if (!geocodingResponse.ok) {
          throw new Error('Failed to fetch location data');
        }
        
        const locationData = await geocodingResponse.json();
        
        if (!locationData.results || locationData.results.length === 0) {
          throw new Error('Location not found');
        }
        
        const { latitude, longitude } = locationData.results[0];
        
        // Then get air quality data
        const weatherResponse = await fetch(
          `https://air-quality-api.open-meteo.com/v1/air-quality?` +
          `latitude=${latitude}&longitude=${longitude}` +
          `&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi`
        );
        
        if (!weatherResponse.ok) {
          throw new Error('Failed to fetch air quality data');
        }
        
        const data = await weatherResponse.json();
        setAirQuality(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching air quality:', err);
        setError('Failed to load air quality data. Please try again later.');
        // Set sample data for demo purposes
        setAirQuality({
          current: {
            time: new Date().toISOString(),
            pm10: 45,
            pm2_5: 25,
            carbon_monoxide: 0.5,
            nitrogen_dioxide: 20,
            sulphur_dioxide: 5,
            ozone: 30,
            us_aqi: 68
          },
          current_units: {
            time: 'iso8601',
            pm10: 'µg/m³',
            pm2_5: 'µg/m³',
            carbon_monoxide: 'mg/m³',
            nitrogen_dioxide: 'µg/m³',
            sulphur_dioxide: 'µg/m³',
            ozone: 'µg/m³'
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAirQuality();
    // Refresh data every 30 minutes
    const interval = setInterval(fetchAirQuality, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [city]);

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Air Quality Index</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error || !airQuality) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Air Quality Index</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || 'No data available'}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const aqiCategory = getAQICategory(airQuality.current.us_aqi);
  const aqi = airQuality.current.us_aqi;
  const pollutants = [
    { name: 'PM2.5', value: airQuality.current.pm2_5, unit: airQuality.current_units.pm2_5 },
    { name: 'PM10', value: airQuality.current.pm10, unit: airQuality.current_units.pm10 },
    { name: 'CO', value: airQuality.current.carbon_monoxide, unit: airQuality.current_units.carbon_monoxide },
    { name: 'NO₂', value: airQuality.current.nitrogen_dioxide, unit: airQuality.current_units.nitrogen_dioxide },
    { name: 'O₃', value: airQuality.current.ozone, unit: airQuality.current_units.ozone },
    { name: 'SO₂', value: airQuality.current.sulphur_dioxide, unit: airQuality.current_units.sulphur_dioxide },
  ];

  return (
    <Card className="w-full max-w-full sm:max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Air Quality in {city}</CardTitle>
        <div className="flex items-center space-x-2">
          <div className={`w-4 h-4 rounded-full ${aqiCategory.color}`} />
          <span className="text-sm text-gray-500">{aqiCategory.label}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-4xl font-bold">
              {aqi}
              <span className="text-sm font-normal text-gray-500 ml-1">AQI US</span>
            </div>
            <div className="text-sm text-gray-600">
              {aqiCategory.description}
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${aqiCategory.color}`}
              style={{ width: `${Math.min(100, (aqi / 3))}%` }}
            />
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
            {pollutants.map((pollutant) => (
              <div key={pollutant.name} className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                <div className="text-xs sm:text-sm text-gray-500">{pollutant.name}</div>
                <div className="text-sm sm:text-base font-medium">
                  {pollutant.value} <span className="text-[10px] sm:text-xs text-gray-500">{pollutant.unit}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-xs sm:text-sm text-gray-500 text-center sm:text-left">
            <p>Last updated: {new Date(airQuality.current.time).toLocaleString()}</p>
            <p className="mt-1">Data provided by Open-Meteo</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AirQualityCard;
