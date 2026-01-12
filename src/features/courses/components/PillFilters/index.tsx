import React, { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
interface FilterOption {
  value: string;
  label: string;
}
interface PillFiltersProps {
  options: FilterOption[];
  currentValue: string | null;
  onFilterChange?: (value: string) => void;
  "data-id"?: string;
}
export function PillFilters({
  options,
  currentValue,
  onFilterChange,
  "data-id": dataId,
}: PillFiltersProps) {
  const [showFiltersMenu, setShowFiltersMenu] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleFilterClick = (value: string) => {
    onFilterChange?.(value);
  };
  const checkOverflow = () => {
    if (filtersRef.current && containerRef.current) {
      const filtersWidth = filtersRef.current.scrollWidth;
      const containerWidth = containerRef.current.clientWidth;
      setShowNavigation(filtersWidth > containerWidth);
    }
  };
  useEffect(() => {
    checkOverflow();
    const resizeObserver = new ResizeObserver(() => {
      checkOverflow();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, [options]);
  const scrollLeft = () => {
    if (filtersRef.current) {
      filtersRef.current.scrollBy({
        left: -200,
        behavior: "smooth",
      });
    }
  };
  const scrollRight = () => {
    if (filtersRef.current) {
      filtersRef.current.scrollBy({
        left: 200,
        behavior: "smooth",
      });
    }
  };
  return (
    <div
      ref={containerRef}
      className="flex items-center w-full bg-white"
      data-id={dataId}
    >
      {showNavigation && (
        <button
          className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md transition-colors mr-2"
          onClick={scrollLeft}
          aria-label="Scroll filters left"
        >
          <ChevronLeft size={16} />
        </button>
      )}
      <div
        ref={filtersRef}
        className="flex overflow-x-auto scrollbar-hide flex-1 space-x-2"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleFilterClick(option.value)}
            className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all duration-200 flex-shrink-0 ${currentValue === option.value
                ? "bg-blue-100 text-blue-800 font-semibold border-2 border-blue-600"
                : "bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200 hover:text-gray-900"
              }`}
            aria-pressed={currentValue === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
      {showNavigation && (
        <>
          <button
            className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md transition-colors ml-2"
            onClick={scrollRight}
            aria-label="Scroll filters right"
          >
            <ChevronRight size={16} />
          </button>
          <div className="relative ml-2">
            <button
              className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md transition-colors"
              onClick={() => setShowFiltersMenu(!showFiltersMenu)}
              aria-label="Show all filters menu"
              aria-expanded={showFiltersMenu}
            >
              <MoreHorizontal size={16} />
            </button>
            {showFiltersMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowFiltersMenu(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                  <div className="py-1 max-h-64 overflow-y-auto">
                    {options.map((option) => (
                      <button
                        key={option.value}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${currentValue === option.value
                            ? "bg-blue-50 text-blue-600 font-semibold"
                            : "text-gray-700 hover:bg-gray-100"
                          }`}
                        onClick={() => {
                          handleFilterClick(option.value);
                          setShowFiltersMenu(false);
                        }}
                        role="menuitem"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
export type { FilterOption };
