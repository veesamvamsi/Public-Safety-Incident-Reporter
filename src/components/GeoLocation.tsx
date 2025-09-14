import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  IconButton, 
  Tooltip,
  Snackbar,
  Alert,
  Button,
  Divider,
} from '@mui/material';
import { 
  LocationOn, 
  MyLocation, 
  ContentCopy, 
  Refresh,
  Place,
} from '@mui/icons-material';

interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
  components?: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

interface GeoLocationProps {
  onLocationChange?: (location: Location | null) => void;
  initialLocation?: Location | null;
}

export default function GeoLocation({ onLocationChange, initialLocation }: GeoLocationProps) {
  const [location, setLocation] = useState<Location | null>(initialLocation || null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const getAddress = async (lat: number, lng: number) => {
    try {
      // Format coordinates to 6 decimal places for accuracy
      const formattedLat = lat.toFixed(6);
      const formattedLng = lng.toFixed(6);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${formattedLat}&lon=${formattedLng}&format=json&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'Transport_Incident_Reporter/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch address data');
      }

      const data = await response.json();

      if (!data || !data.address) {
        throw new Error('No address data found');
      }

      // Extract address components with fallbacks
      const addressComponents = {
        road: data.address.road || data.address.street || data.address.footway || data.address.path || '',
        suburb: data.address.suburb || data.address.neighbourhood || data.address.district || data.address.quarter || '',
        city: data.address.city || data.address.town || data.address.village || data.address.municipality || '',
        state: data.address.state || data.address.province || data.address.region || '',
        country: data.address.country || '',
        postcode: data.address.postcode || '',
      };

      // Create a formatted address
      const formatted = [
        addressComponents.road,
        [
          addressComponents.suburb,
          addressComponents.city,
          addressComponents.state,
          addressComponents.postcode,
          addressComponents.country
        ].filter(Boolean).join(', ')
      ].filter(Boolean).join('\n');

      return {
        formatted,
        components: addressComponents
      };
    } catch (error) {
      console.error('Error fetching address:', error);
      // Instead of throwing, return null to handle gracefully
      return null;
    }
  };

  const getLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (error) => {
            switch(error.code) {
              case error.PERMISSION_DENIED:
                reject(new Error('Please allow location access to use this feature'));
                break;
              case error.POSITION_UNAVAILABLE:
                reject(new Error('Location information is unavailable'));
                break;
              case error.TIMEOUT:
                reject(new Error('Location request timed out'));
                break;
              default:
                reject(new Error('An unknown error occurred'));
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      });

      // Get the address data
      const addressData = await getAddress(
        position.coords.latitude,
        position.coords.longitude
      );

      // Create the new location object
      const newLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        ...(addressData && {
          address: addressData.formatted,
          components: addressData.components
        })
      };

      // Update local state
      setLocation(newLocation);
      
      // Notify parent component
      if (onLocationChange) {
        onLocationChange(newLocation);
      }

      // Only set error if address lookup failed
      if (!addressData) {
        setError('Address lookup unavailable. Using coordinates only.');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to retrieve your location');
      console.error('Geolocation error:', error);
      // Notify parent component of error
      if (onLocationChange) {
        onLocationChange(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopySuccess(`${type} copied to clipboard`);
      },
      (err) => {
        console.error('Could not copy text: ', err);
        setCopySuccess('Failed to copy');
      }
    );
  };

  useEffect(() => {
    if (!initialLocation) {
      getLocation();
    }
  }, []);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        backgroundColor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        width: '100%',
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        width: '100%',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOn color="primary" />
          <Typography variant="h6" component="h2">
            Location Details
          </Typography>
        </Box>
        <Tooltip title="Get current location">
          <IconButton onClick={getLocation} disabled={loading}>
            <MyLocation />
          </IconButton>
        </Tooltip>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={20} />
          <Typography>Getting your location...</Typography>
        </Box>
      )}

      {error && (
        <Typography color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}

      {location && (
        <Box sx={{ width: '100%', mt: 1 }}>
          {location.components && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 1 
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Place color="primary" fontSize="small" />
                  <Typography variant="subtitle1" fontWeight="medium">
                    Address Details
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {location.address}
              </Typography>
            </Box>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 1 
          }}>
            <Typography variant="body2" color="text.secondary">
              Latitude:
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {location.latitude.toFixed(6)}°
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 1 
          }}>
            <Typography variant="body2" color="text.secondary">
              Longitude:
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {location.longitude.toFixed(6)}°
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <Typography variant="body2" color="text.secondary">
              Accuracy:
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              ±{Math.round(location.accuracy)} meters
            </Typography>
          </Box>
        </Box>
      )}

      <Snackbar
        open={!!copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setCopySuccess(null)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {copySuccess}
        </Alert>
      </Snackbar>
    </Paper>
  );
} 