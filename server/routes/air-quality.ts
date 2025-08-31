import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// Input validation schema
const airQualityQuerySchema = z.object({
  city: z.string().min(1, 'City name is required'),
  lat: z.string().optional(),
  lon: z.string().optional(),
});

// Cache for API responses (in-memory, consider Redis for production)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes (Open-Meteo has higher rate limits)

router.get('/', async (req, res) => {
  try {
    // Validate query parameters
    const { city, lat, lon } = airQualityQuerySchema.parse(req.query);
    
    // Generate cache key
    const cacheKey = lat && lon ? `${lat},${lon}` : city;
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json(cached.data);
    }

    let latitude: number;
    let longitude: number;

    if (lat && lon) {
      // Use provided coordinates if available
      latitude = parseFloat(lat);
      longitude = parseFloat(lon);
    } else {
      // Get coordinates for the city using Open-Meteo geocoding
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
      const geoResponse = await fetch(geoUrl);
      const geoData = await geoResponse.json();
      
      if (!geoData.results || geoData.results.length === 0) {
        return res.status(404).json({ error: 'Location not found' });
      }
      
      latitude = geoData.results[0].latitude;
      longitude = geoData.results[0].longitude;
    }

    // Fetch air quality data from Open-Meteo
    const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?` +
      `latitude=${latitude}&longitude=${longitude}` +
      `&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi`;
    
    const response = await fetch(airQualityUrl);
    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Add timestamp and location info
    const result = {
      ...data,
      location: { latitude, longitude },
      timestamp: new Date().toISOString()
    };
    
    // Cache the response
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    res.json(result);
  } catch (error) {
    console.error('Air quality API error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to fetch air quality data' });
  }
});

export default router;
