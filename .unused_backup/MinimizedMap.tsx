import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LoaderIcon } from 'lucide-react';
interface MinimizedMapProps {
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
}
const MinimizedMap: React.FC<MinimizedMapProps> = ({
  centerCoordinates,
  zoom,
  markers = [],
  onMapLoaded,
  isLoading = false
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  useEffect(() => {
    if (!mapRef.current) return;
    // Initialize map
    const map = L.map(mapRef.current, {
      center: centerCoordinates,
      zoom: zoom,
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: false,
      attributionControl: false
    });
    // Add OpenStreetMap tiles with custom styling
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      className: 'map-tiles-enterprise'
    }).addTo(map);
    // Custom marker icon with Enterprise Journey branding
    const customIcon = L.icon({
      iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    // Add markers
    markers.forEach(marker => {
      L.marker(marker.position, {
        icon: customIcon
      }).bindPopup(`<strong>${marker.title}</strong>${marker.description ? `<br>${marker.description}` : ''}`).addTo(map);
    });
    // Store map reference
    leafletMapRef.current = map;
    // Notify parent when map is loaded
    onMapLoaded();
    // Clean up on unmount
    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, [centerCoordinates, zoom, markers, onMapLoaded]);
  return <div className="rounded-lg overflow-hidden shadow-md bg-gray-100 border border-gray-200 relative">
      <div ref={mapRef} className="w-full h-[280px] md:h-[320px]" />
      {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
          <LoaderIcon className="w-8 h-8 text-blue-600 animate-spin" />
        </div>}
      <style jsx>{`
        .map-tiles-enterprise {
          filter: saturate(0.8) contrast(1.1);
        }
      `}</style>
    </div>;
};
export default MinimizedMap;