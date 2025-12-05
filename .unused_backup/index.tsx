import React, { useCallback, useEffect, useState, Component } from 'react';
import MinimizedMap from './MinimizedMap';
import FullscreenMap from './FullscreenMap';
import MapControls from './MapControls';
import { fetchAllLocations, fetchLocationsByRegion } from '../../../../services/mapAPI';
export interface MapLocation {
  id: string;
  name: string;
  position: [number, number];
  description: string;
  address: string;
  contactPhone: string;
  type: string;
  region: string;
  services: string[];
  operatingHours: string;
}
export interface MapComponentProps {
  initialMode?: 'minimized' | 'fullscreen';
  centerCoordinates?: [number, number];
  zoom?: number;
  markers?: {
    position: [number, number];
    title: string;
    description?: string;
  }[];
  'data-id'?: string;
}
const MapComponent: React.FC<MapComponentProps> = ({
  initialMode = 'minimized',
  centerCoordinates = [25.276987, 55.296249],
  // Dubai coordinates
  zoom = 10,
  markers = [],
  'data-id': dataId
}) => {
  const [mapMode, setMapMode] = useState<'minimized' | 'fullscreen'>(initialMode);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  // Handle map mode toggle
  const toggleMapMode = useCallback(() => {
    setMapMode(prevMode => prevMode === 'minimized' ? 'fullscreen' : 'minimized');
    // When switching to fullscreen, prevent body scrolling
    if (mapMode === 'minimized') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [mapMode]);
  // Load map locations
  useEffect(() => {
    const loadLocations = async () => {
      setIsLoading(true);
      try {
        const data = selectedRegion ? await fetchLocationsByRegion(selectedRegion) : await fetchAllLocations();
        setLocations(data);
      } catch (error) {
        console.error('Error loading map locations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadLocations();
  }, [selectedRegion]);
  // Handle region filter change
  const handleRegionChange = (region: string | null) => {
    setSelectedRegion(region);
  };
  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  // Handle map load event
  const handleMapLoaded = useCallback(() => {
    setIsMapLoaded(true);
  }, []);
  // Convert locations to markers format
  const locationMarkers = locations.map(location => ({
    position: location.position,
    title: location.name,
    description: location.description,
    id: location.id,
    type: location.type,
    region: location.region
  }));
  // Combine provided markers with location markers
  const allMarkers = [...markers, ...locationMarkers];
  return <div data-id={dataId} className="relative">
      {mapMode === 'minimized' ? <MinimizedMap centerCoordinates={centerCoordinates} zoom={zoom} markers={allMarkers} onMapLoaded={handleMapLoaded} isLoading={isLoading} /> : <FullscreenMap centerCoordinates={centerCoordinates} zoom={zoom} markers={allMarkers} onMapLoaded={handleMapLoaded} isLoading={isLoading} onRegionChange={handleRegionChange} selectedRegion={selectedRegion} />}
      <MapControls mapMode={mapMode} onToggleMode={toggleMapMode} isMapLoaded={isMapLoaded} isLoading={isLoading} />
    </div>;
};
export default MapComponent;