import React, { useMemo } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { getCityCoordinates, getRouteColor } from '../utils/geocoding';
import { MapPin } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 39.8283,
  lng: -98.5795,
};

const defaultOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'all',
      elementType: 'geometry',
      stylers: [{ color: '#1e293b' }], // slate-800
    },
    {
      featureType: 'all',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#cbd5e1' }], // slate-300
    },
    {
      featureType: 'all',
      elementType: 'labels.text.stroke',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'all',
      elementType: 'labels',
      stylers: [{ fontWeight: 'normal' }], // Reduce font weight
    },
    {
      featureType: 'administrative',
      elementType: 'labels.text',
      stylers: [{ fontWeight: 'normal' }],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text',
      stylers: [{ fontWeight: 'normal' }],
    },
    {
      featureType: 'road',
      elementType: 'labels.text',
      stylers: [{ fontWeight: 'normal' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#0f172a' }], // slate-900
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#334155' }], // slate-700
    },
  ],
};

export default function MapView({ lanes, onLaneClick, selectedLanes }) {
  const [selectedLane, setSelectedLane] = React.useState(null);
  const [map, setMap] = React.useState(null);
  const [loadError, setLoadError] = React.useState(null);

  // Calculate bounds to fit all routes
  const bounds = useMemo(() => {
    if (!lanes || lanes.length === 0) return null;

    const allCoords = [];
    lanes.forEach(lane => {
      const origin = getCityCoordinates(lane.origin);
      const destination = getCityCoordinates(lane.destination);
      if (origin) allCoords.push(origin);
      if (destination) allCoords.push(destination);
    });

    if (allCoords.length === 0) return null;

    const lats = allCoords.map(c => c.lat);
    const lngs = allCoords.map(c => c.lng);

    return {
      north: Math.max(...lats) + 2,
      south: Math.min(...lats) - 2,
      east: Math.max(...lngs) + 2,
      west: Math.min(...lngs) - 2,
    };
  }, [lanes]);

  // Fit bounds when map loads
  React.useEffect(() => {
    if (map && bounds && window.google && window.google.maps) {
      const googleBounds = new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(bounds.south, bounds.west),
        new window.google.maps.LatLng(bounds.north, bounds.east)
      );
      map.fitBounds(googleBounds);
    }
  }, [map, bounds]);

  // Prepare routes data
  const routes = useMemo(() => {
    if (!lanes) return [];
    
    const validRoutes = lanes.map(lane => {
      const origin = getCityCoordinates(lane.origin);
      const destination = getCityCoordinates(lane.destination);
      
      if (!origin || !destination) {
        return null;
      }
      
      return {
        ...lane,
        originCoords: origin,
        destinationCoords: destination,
        color: getRouteColor(lane.status),
      };
    }).filter(Boolean);
    
    return validRoutes;
  }, [lanes]);

  // Get unique cities for markers
  const cityMarkers = useMemo(() => {
    const cities = new Map();
    
    routes.forEach(route => {
      if (!cities.has(route.origin)) {
        cities.set(route.origin, {
          name: route.origin,
          coords: route.originCoords,
          lanes: [],
        });
      }
      cities.get(route.origin).lanes.push(route);
      
      if (!cities.has(route.destination)) {
        cities.set(route.destination, {
          name: route.destination,
          coords: route.destinationCoords,
          lanes: [],
        });
      }
      cities.get(route.destination).lanes.push(route);
    });
    
    return Array.from(cities.values());
  }, [routes]);

  const handleMapLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  // Note: You'll need to add your Google Maps API key to the environment
  // For now, this will show a placeholder if the API key is missing
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  if (!apiKey) {
    return (
      <div className="w-full h-full flex items-center justify-center glass-card rounded-xl">
        <div className="text-center p-8">
          <MapPin className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Map View</h3>
          <p className="text-slate-400 mb-4">
            To enable map view, add your Google Maps API key to the environment variables.
          </p>
          <p className="text-sm text-slate-500">
            Set VITE_GOOGLE_MAPS_API_KEY in your .env file
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <LoadScript 
        googleMapsApiKey={apiKey}
        libraries={['places', 'geometry']}
        loadingElement={
          <div className="w-full h-full flex items-center justify-center bg-slate-900">
            <div className="text-white text-lg">Loading map...</div>
          </div>
        }
        onError={(error) => {
          console.error('Google Maps load error:', error);
          setLoadError('Failed to load Google Maps. Please check your API key.');
        }}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={4}
          options={defaultOptions}
          onLoad={handleMapLoad}
        >
          {/* Draw routes */}
          {routes.map((route, index) => {
            // Ensure coordinates are valid numbers
            if (!route.originCoords || !route.destinationCoords || 
                typeof route.originCoords.lat !== 'number' || 
                typeof route.destinationCoords.lat !== 'number' ||
                typeof route.originCoords.lng !== 'number' || 
                typeof route.destinationCoords.lng !== 'number') {
              return null;
            }
            
            const path = [
              { lat: route.originCoords.lat, lng: route.originCoords.lng },
              { lat: route.destinationCoords.lat, lng: route.destinationCoords.lng }
            ];
            
            return (
              <Polyline
                key={`route-${route.id}-${index}`}
                path={path}
                options={{
                  strokeColor: route.color || '#6b7280',
                  strokeOpacity: selectedLanes && selectedLanes.has(route.id) ? 1 : 0.6,
                  strokeWeight: selectedLanes && selectedLanes.has(route.id) ? 4 : 3,
                  zIndex: selectedLanes && selectedLanes.has(route.id) ? 1000 : 1,
                  geodesic: true,
                }}
                onClick={() => {
                  setSelectedLane(route);
                  if (onLaneClick) onLaneClick(route);
                }}
              />
            );
          })}

          {/* City markers */}
          {cityMarkers.map((city, index) => (
            <Marker
              key={`marker-${city.name}-${index}`}
              position={city.coords}
              label={{
                text: city.name.split(',')[0], // Just the city name
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 'normal',
              }}
            />
          ))}

          {/* Info window for selected route */}
          {selectedLane && (
            <InfoWindow
              position={selectedLane.originCoords}
              onCloseClick={() => setSelectedLane(null)}
            >
              <div className="p-2 text-sm">
                <div className="font-bold text-white mb-1">{selectedLane.id}</div>
                <div className="text-slate-300">
                  <div>{selectedLane.origin} → {selectedLane.destination}</div>
                  <div className="mt-1">
                    <span className={`font-medium ${
                      selectedLane.status === 'Valid' ? 'text-emerald-400' :
                      selectedLane.status === 'Warning' ? 'text-amber-400' :
                      'text-red-400'
                    }`}>
                      {selectedLane.status}
                    </span>
                    {' • '}
                    <span>{selectedLane.distance}mi</span>
                    {' • '}
                    <span>${selectedLane.baseRate}/mi</span>
                  </div>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 bg-opacity-90 z-50">
          <div className="text-center p-8">
            <MapPin className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Map Error</h3>
            <p className="text-slate-400 mb-4">{loadError}</p>
            <button
              onClick={() => {
                setLoadError(null);
                window.location.reload();
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

