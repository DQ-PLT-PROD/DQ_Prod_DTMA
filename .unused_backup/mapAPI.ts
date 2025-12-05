// Map API service for Enterprise Journey
import { mockMapLocations } from './mockData';
// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
// Add some randomness to API delays to simulate network variability
const randomDelay = () => delay(500 + Math.random() * 1000);
// API function to fetch all map locations
export const fetchAllLocations = async () => {
  await randomDelay();
  return mockMapLocations;
};
// API function to fetch locations by region
export const fetchLocationsByRegion = async (region: string) => {
  await randomDelay();
  return mockMapLocations.filter(location => location.region.toLowerCase() === region.toLowerCase());
};
// API function to fetch location by ID
export const fetchLocationById = async (id: string) => {
  await randomDelay();
  const location = mockMapLocations.find(loc => loc.id === id);
  if (!location) {
    throw new Error(`Location with ID ${id} not found`);
  }
  return location;
};
// API function to fetch locations by type
export const fetchLocationsByType = async (type: string) => {
  await randomDelay();
  return mockMapLocations.filter(location => location.type.toLowerCase() === type.toLowerCase());
};
// API function to fetch locations within a bounding box
export const fetchLocationsInBoundingBox = async (southWest: [number, number], northEast: [number, number]) => {
  await randomDelay();
  const [swLat, swLng] = southWest;
  const [neLat, neLng] = northEast;
  return mockMapLocations.filter(location => {
    const [lat, lng] = location.position;
    return lat >= swLat && lat <= neLat && lng >= swLng && lng <= neLng;
  });
};
// API function to search locations by name or description
export const searchLocations = async (query: string) => {
  await randomDelay();
  const searchQuery = query.toLowerCase();
  return mockMapLocations.filter(location => location.name.toLowerCase().includes(searchQuery) || location.description.toLowerCase().includes(searchQuery) || location.region.toLowerCase().includes(searchQuery) || location.type.toLowerCase().includes(searchQuery));
};