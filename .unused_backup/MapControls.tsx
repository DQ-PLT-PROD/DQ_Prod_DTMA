import React, { useState, memo } from 'react';
import { MaximizeIcon, MinimizeIcon, LoaderIcon, MapPinIcon, SearchIcon, FilterIcon, LayersIcon, ChevronRightIcon, ChevronLeftIcon } from 'lucide-react';
interface MapControlsProps {
  mapMode: 'minimized' | 'fullscreen';
  onToggleMode: () => void;
  isMapLoaded: boolean;
  isLoading?: boolean;
}
/**
 * Loading indicator component for map
 */
const MapLoadingIndicator = memo(() => <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-70 rounded-lg z-30">
    <LoaderIcon className="w-8 h-8 text-blue-600 animate-spin" aria-label="Loading map data" />
  </div>);
MapLoadingIndicator.displayName = 'MapLoadingIndicator';
/**
 * Minimal search button for minimized mode
 */
const MinimalSearchButton = memo(() => {
  return <button className="p-2 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow
        focus:outline-none focus:ring-2 focus:ring-[#0030E3] focus:ring-opacity-50" aria-label="Open search">
      <SearchIcon className="w-4 h-4 text-[#0030E3]" />
    </button>;
});
MinimalSearchButton.displayName = 'MinimalSearchButton';
/**
 * Minimal primary selector for minimized mode
 */
const PrimarySelector = memo(() => {
  const [activeOption, setActiveOption] = useState<number>(0);
  const options = ['All', 'Offices', 'Services', 'Partners'];
  const handleNext = () => {
    setActiveOption(prev => prev === options.length - 1 ? 0 : prev + 1);
  };
  const handlePrev = () => {
    setActiveOption(prev => prev === 0 ? options.length - 1 : prev - 1);
  };
  return <div className="bg-white/90 backdrop-blur-sm rounded-full py-1 px-2 shadow-sm flex items-center">
      <button onClick={handlePrev} className="p-1 hover:bg-gray-100 rounded-full" aria-label="Previous option">
        <ChevronLeftIcon className="w-3 h-3 text-gray-600" />
      </button>
      <span className="text-xs font-medium text-gray-800 px-2">
        {options[activeOption]}
      </span>
      <button onClick={handleNext} className="p-1 hover:bg-gray-100 rounded-full" aria-label="Next option">
        <ChevronRightIcon className="w-3 h-3 text-gray-600" />
      </button>
    </div>;
});
PrimarySelector.displayName = 'PrimarySelector';
/**
 * Minimal secondary selector for minimized mode
 */
const SecondarySelector = memo(() => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const options = ['Standard', 'Satellite', 'Terrain'];
  const [selected, setSelected] = useState<string>(options[0]);
  return <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="bg-white/90 backdrop-blur-sm rounded-full py-1.5 px-3 text-xs font-medium text-gray-700 shadow-sm flex items-center" aria-label="Map layer options" aria-expanded={isOpen}>
        <LayersIcon className="w-3 h-3 mr-1 text-gray-600" />
        <span>{selected}</span>
      </button>
      {isOpen && <div className="absolute bottom-full left-0 mb-1 bg-white rounded-lg shadow-md py-1 w-32 z-40">
          {options.map(option => <button key={option} onClick={() => {
        setSelected(option);
        setIsOpen(false);
      }} className={`w-full text-left px-3 py-1.5 text-xs ${selected === option ? 'bg-blue-50 text-[#0030E3] font-medium' : 'hover:bg-gray-50 text-gray-700'}`}>
              {option}
            </button>)}
        </div>}
    </div>;
});
SecondarySelector.displayName = 'SecondarySelector';
/**
 * Controls for minimized map mode
 */
const MinimizedControls = memo(({
  onToggleMode,
  isMapLoaded,
  isLoading = false
}: Omit<MapControlsProps, 'mapMode'>) => <>
      {/* Top controls - Primary selector */}
      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-30">
        <PrimarySelector />
      </div>
      {/* Bottom-right controls - Search and expand */}
      <div className="absolute bottom-3 right-3 flex items-center gap-2 z-30">
        <MinimalSearchButton />
        {/* Expand button */}
        <button onClick={onToggleMode} className="p-2 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow
            focus:outline-none focus:ring-2 focus:ring-[#0030E3] focus:ring-opacity-50" aria-label="Expand map to fullscreen" disabled={!isMapLoaded || isLoading}>
          <MaximizeIcon className="w-4 h-4 text-[#0030E3]" />
        </button>
      </div>
      {/* Bottom-left controls - Location indicator and secondary selector */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 z-30">
        <div className="bg-white/90 backdrop-blur-sm rounded-full py-1.5 px-3 text-xs font-medium text-[#0030E3] shadow-sm flex items-center">
          <MapPinIcon className="w-3 h-3 mr-1" />
          <span>Enterprise</span>
        </div>
        <SecondarySelector />
      </div>
    </>);
MinimizedControls.displayName = 'MinimizedControls';
/**
 * Controls for fullscreen map mode
 */
const FullscreenControls = memo(({
  onToggleMode,
  isMapLoaded,
  isLoading = false
}: Omit<MapControlsProps, 'mapMode'>) => <>
      {/* Minimize button for fullscreen mode */}
      <button onClick={onToggleMode} className="absolute top-4 right-4 z-[60] p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow
        focus:outline-none focus:ring-2 focus:ring-[#0030E3] focus:ring-opacity-50" aria-label="Minimize map" disabled={!isMapLoaded || isLoading}>
        <MinimizeIcon className="w-5 h-5 text-[#0030E3]" />
      </button>
      {/* Search bar for fullscreen mode */}
      <div className="absolute top-4 left-4 z-[60] w-64">
        <div className="relative">
          <input type="text" placeholder="Search locations..." className="w-full py-2 pl-9 pr-3 bg-white rounded-lg shadow-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0030E3]" />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
      </div>
      {/* Filter controls for fullscreen mode */}
      <div className="absolute top-4 left-72 z-[60]">
        <button className="flex items-center gap-1 py-2 px-3 bg-white rounded-lg shadow-md text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0030E3]">
          <FilterIcon className="w-4 h-4 text-gray-600" />
          <span>Filter</span>
        </button>
      </div>
      {/* Legend for fullscreen mode */}
      <div className="absolute bottom-4 left-4 z-[60] bg-white p-3 rounded-lg shadow-md">
        <h3 className="text-sm font-bold text-gray-800 mb-1">
          Enterprise Journey Locations
        </h3>
        <p className="text-xs text-gray-600">Explore our global presence</p>
        <div className="mt-2 pt-2 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-1" aria-label="Headquarters location marker"></div>
            <span>Headquarters</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-1" aria-label="Regional Office location marker"></div>
            <span>Regional Office</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-1" aria-label="Innovation Center location marker"></div>
            <span>Innovation Center</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-1" aria-label="Support Center location marker"></div>
            <span>Support Center</span>
          </div>
        </div>
      </div>
      {/* Layer selector for fullscreen mode */}
      <div className="absolute bottom-4 right-4 z-[60]">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <button className="py-2 px-4 text-sm font-medium text-[#0030E3] border-b border-gray-100 w-full text-left hover:bg-gray-50">
            Standard View
          </button>
          <button className="py-2 px-4 text-sm text-gray-700 border-b border-gray-100 w-full text-left hover:bg-gray-50">
            Satellite View
          </button>
          <button className="py-2 px-4 text-sm text-gray-700 w-full text-left hover:bg-gray-50">
            Terrain View
          </button>
        </div>
      </div>
    </>);
FullscreenControls.displayName = 'FullscreenControls';
/**
 * MapControls component that displays different controls based on the current map mode
 */
const MapControls: React.FC<MapControlsProps> = ({
  mapMode,
  onToggleMode,
  isMapLoaded,
  isLoading = false
}) => {
  // Show loading indicator when map is loading
  if (!isMapLoaded && isLoading) {
    return <MapLoadingIndicator />;
  }
  // Render controls based on map mode
  return mapMode === 'minimized' ? <MinimizedControls onToggleMode={onToggleMode} isMapLoaded={isMapLoaded} isLoading={isLoading} /> : <FullscreenControls onToggleMode={onToggleMode} isMapLoaded={isMapLoaded} isLoading={isLoading} />;
};
export default memo(MapControls);