import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LoaderIcon } from 'lucide-react';
interface FullscreenMapProps {
  centerCoordinates: [number, number];
  zoom: number;
  markers?: {
    position: [number, number];
    title: string;
    description?: string;
    id?: string;
    type?: string;
    region?: string;
  }[];
  onMapLoaded: () => void;
  isLoading?: boolean;
  onRegionChange?: (region: string | null) => void;
  selectedRegion?: string | null;
}
const FullscreenMap: React.FC<FullscreenMapProps> = ({
  centerCoordinates,
  zoom,
  markers = [],
  onMapLoaded,
  isLoading = false,
  onRegionChange,
  selectedRegion = null
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  // Get unique regions from markers for filter
  const regions = Array.from(new Set(markers.filter(m => m.region).map(m => m.region))) as string[];
  useEffect(() => {
    if (!mapRef.current) return;
    // Initialize map
    const map = L.map(mapRef.current, {
      center: centerCoordinates,
      zoom: zoom,
      zoomControl: true,
      scrollWheelZoom: true,
      dragging: true
    });
    // Add OpenStreetMap tiles with custom styling
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      className: 'map-tiles-enterprise'
    }).addTo(map);
    // Define marker icons based on type
    const getMarkerIcon = (type?: string) => {
      let iconUrl;
      switch (type) {
        case 'Headquarters':
          iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png';
          break;
        case 'Regional Office':
          iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png';
          break;
        case 'Innovation Center':
          iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png';
          break;
        case 'Support Center':
          iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png';
          break;
        case 'Economic Zone Office':
          iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png';
          break;
        case 'Trade Center':
          iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png';
          break;
        case 'Business Park':
          iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png';
          break;
        case 'Innovation Hub':
          iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png';
          break;
        default:
          iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png';
      }
      return L.icon({
        iconUrl,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
    };
    // Add markers
    markers.forEach(marker => {
      // Skip if filtered by region and doesn't match
      if (selectedRegion && marker.region && marker.region !== selectedRegion) {
        return;
      }
      const markerInstance = L.marker(marker.position, {
        icon: getMarkerIcon(marker.type),
        title: marker.title
      }).bindPopup(`
          <div class="map-popup">
            <h3 class="text-lg font-bold text-blue-600">${marker.title}</h3>
            ${marker.description ? `<p class="text-gray-700">${marker.description}</p>` : ''}
            ${marker.type ? `<p class="text-sm text-gray-500 mt-2"><strong>Type:</strong> ${marker.type}</p>` : ''}
            ${marker.region ? `<p class="text-sm text-gray-500"><strong>Region:</strong> ${marker.region}</p>` : ''}
          </div>
        `, {
        className: 'custom-popup',
        maxWidth: 300
      }).addTo(map);
      // Add click event to markers
      markerInstance.on('click', () => {
        setSelectedLocation(marker.id || null);
      });
    });
    // Add zoom controls to the top right
    map.zoomControl.setPosition('topright');
    // Store map reference
    leafletMapRef.current = map;
    // Notify parent when map is loaded
    onMapLoaded();
    // Clean up on unmount
    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, [centerCoordinates, zoom, markers, onMapLoaded, selectedRegion]);
  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const region = e.target.value === 'all' ? null : e.target.value;
    if (onRegionChange) {
      onRegionChange(region);
    }
  };
  return <div className="fixed inset-0 z-50 bg-white">
      <div className="absolute top-4 left-4 z-[60] bg-white p-3 rounded-lg shadow-md">
        <select value={selectedRegion || 'all'} onChange={handleRegionChange} className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All Regions</option>
          {regions.map(region => <option key={region} value={region}>
              {region}
            </option>)}
        </select>
      </div>
      <div ref={mapRef} className="w-full h-full" />
      {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-[70]">
          <LoaderIcon className="w-12 h-12 text-blue-600 animate-spin" />
        </div>}
      <style jsx>{`
        .map-tiles-enterprise {
          filter: saturate(0.8) contrast(1.1);
        }
        :global(.custom-popup .leaflet-popup-content-wrapper) {
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        :global(.custom-popup .leaflet-popup-content) {
          margin: 12px 16px;
          line-height: 1.4;
        }
        :global(.custom-popup .leaflet-popup-tip) {
          background-color: white;
        }
      `}</style>
    </div>;
};
export default FullscreenMap;