// Simple geocoding utility for US cities
// In production, you would use Google Geocoding API or similar service

const cityCoordinates = {
  'Chicago, IL': { lat: 41.8781, lng: -87.6298 },
  'Atlanta, GA': { lat: 33.7490, lng: -84.3880 },
  'Los Angeles, CA': { lat: 34.0522, lng: -118.2437 },
  'Dallas, TX': { lat: 32.7767, lng: -96.7970 },
  'New York, NY': { lat: 40.7128, lng: -74.0060 },
  'Phoenix, AZ': { lat: 33.4484, lng: -112.0740 },
  'Miami, FL': { lat: 25.7617, lng: -80.1918 },
  'Seattle, WA': { lat: 47.6062, lng: -122.3321 },
  'Boston, MA': { lat: 42.3601, lng: -71.0589 },
  'Denver, CO': { lat: 39.7392, lng: -104.9903 },
  'Philadelphia, PA': { lat: 39.9526, lng: -75.1652 },
  'Houston, TX': { lat: 29.7604, lng: -95.3698 },
  'Detroit, MI': { lat: 42.3314, lng: -83.0458 },
  'Minneapolis, MN': { lat: 44.9778, lng: -93.2650 },
  'Portland, OR': { lat: 45.5152, lng: -122.6784 },
  'San Francisco, CA': { lat: 37.7749, lng: -122.4194 },
  'San Diego, CA': { lat: 32.7157, lng: -117.1611 },
  'Las Vegas, NV': { lat: 36.1699, lng: -115.1398 },
  'Charlotte, NC': { lat: 35.2271, lng: -80.8431 },
  'Nashville, TN': { lat: 36.1627, lng: -86.7816 },
  'Indianapolis, IN': { lat: 39.7684, lng: -86.1581 },
  'Columbus, OH': { lat: 39.9612, lng: -82.9988 },
  'Kansas City, MO': { lat: 39.0997, lng: -94.5786 },
  'Memphis, TN': { lat: 35.1495, lng: -90.0490 },
  'Baltimore, MD': { lat: 39.2904, lng: -76.6122 },
  'Milwaukee, WI': { lat: 43.0389, lng: -87.9065 },
  'Tampa, FL': { lat: 27.9506, lng: -82.4572 },
  'Jacksonville, FL': { lat: 30.3322, lng: -81.6557 },
  'Austin, TX': { lat: 30.2672, lng: -97.7431 },
  'Oklahoma City, OK': { lat: 35.4676, lng: -97.5164 },
  'Louisville, KY': { lat: 38.2527, lng: -85.7585 },
  'Cleveland, OH': { lat: 41.4993, lng: -81.6944 },
  'Pittsburgh, PA': { lat: 40.4406, lng: -79.9959 },
  'Cincinnati, OH': { lat: 39.1031, lng: -84.5120 },
  'St. Louis, MO': { lat: 38.6270, lng: -90.1994 },
  'Buffalo, NY': { lat: 42.8864, lng: -78.8784 },
  'Raleigh, NC': { lat: 35.7796, lng: -78.6382 },
  'Richmond, VA': { lat: 37.5407, lng: -77.4360 },
  'Birmingham, AL': { lat: 33.5207, lng: -86.8025 },
  'New Orleans, LA': { lat: 29.9511, lng: -90.0715 },
  'Omaha, NE': { lat: 41.2565, lng: -95.9345 },
  'Albuquerque, NM': { lat: 35.0844, lng: -106.6504 },
  'Tucson, AZ': { lat: 32.2226, lng: -110.9747 },
  'Fresno, CA': { lat: 36.7378, lng: -119.7871 },
  'Sacramento, CA': { lat: 38.5816, lng: -121.4944 },
  'Long Beach, CA': { lat: 33.7701, lng: -118.1937 },
  'Mesa, AZ': { lat: 33.4152, lng: -111.8315 },
  'Virginia Beach, VA': { lat: 36.8529, lng: -75.9780 },
  'Oakland, CA': { lat: 37.8044, lng: -122.2712 },
  'Minneapolis, MN': { lat: 44.9778, lng: -93.2650 },
  'Tulsa, OK': { lat: 36.1540, lng: -95.9928 },
  'Arlington, TX': { lat: 32.7357, lng: -97.1081 },
  'New Orleans, LA': { lat: 29.9511, lng: -90.0715 },
};

/**
 * Get coordinates for a city name
 * @param {string} cityName - City name in format "City, State"
 * @returns {Object|null} - { lat, lng } or null if not found
 */
export function getCityCoordinates(cityName) {
  if (!cityName) return null;
  
  // Try exact match first
  if (cityCoordinates[cityName]) {
    return cityCoordinates[cityName];
  }
  
  // Try case-insensitive match
  const normalized = Object.keys(cityCoordinates).find(
    key => key.toLowerCase() === cityName.toLowerCase()
  );
  
  if (normalized) {
    return cityCoordinates[normalized];
  }
  
  // Try partial match (e.g., "Chicago" matches "Chicago, IL")
  const partialMatch = Object.keys(cityCoordinates).find(
    key => key.toLowerCase().startsWith(cityName.toLowerCase()) ||
           cityName.toLowerCase().startsWith(key.toLowerCase().split(',')[0])
  );
  
  if (partialMatch) {
    return cityCoordinates[partialMatch];
  }
  
  // Default fallback - return a center point of US
  return { lat: 39.8283, lng: -98.5795 };
}

/**
 * Get route color based on lane status
 * @param {string} status - Lane status (Valid, Warning, Error)
 * @returns {string} - Hex color code
 */
export function getRouteColor(status) {
  switch (status) {
    case 'Valid':
      return '#10b981'; // emerald-500
    case 'Warning':
      return '#f59e0b'; // amber-500
    case 'Error':
      return '#ef4444'; // red-500
    default:
      return '#6b7280'; // slate-500
  }
}




