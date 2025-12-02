import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
export interface FilterOption {
  id: string;
  name: string;
}

export interface FilterConfig {
  id: string;
  title: string;
  options: FilterOption[];
}

interface AccordionSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export interface FilterSidebarProps {
  filters: Record<string, string | string[]>;
  filterConfig: FilterConfig[];
  onFilterChange: (filterType: string, value: string) => void;
  onResetFilters: () => void;
  isResponsive?: boolean;
  singleOpen?: boolean;
}

// Mapping of Media Types to their relevant Format options (uses filter labels)
const MEDIA_TYPE_FORMAT_MAPPING: Record<string, string[]> = {
  'News': ['Quick Reads'],
  'Reports': ['In-Depth Reports', 'Downloadable Templates'],
  'Toolkits & Templates': ['Interactive Tools', 'Downloadable Templates'],
  'Guides': ['Quick Reads', 'In-Depth Reports'],
  'Events': ['Live Events'],
  'Videos': ['Recorded Media'],
  'Podcasts': ['Recorded Media']
};
const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  isOpen,
  onToggle,
  children,
}) => {
  return (
    <div className="border-b border-gray-100 py-3">
      <button
        className="flex w-full justify-between items-center text-left font-medium text-gray-900 mb-2 px-1"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        {title}
        {isOpen ? (
          <ChevronUp size={16} className="text-gray-500" />
        ) : (
          <ChevronDown size={16} className="text-gray-500" />
        )}
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  filterConfig,
  onFilterChange,
  onResetFilters,
  isResponsive = false,
  singleOpen = false,
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.fromEntries(filterConfig.map((config) => [config.id, true]))
  );
  const [openSection, setOpenSection] = useState<string | null>(
    singleOpen ? filterConfig[0]?.id ?? null : null
  );

  useEffect(() => {
    if (singleOpen) {
      setOpenSection((prev) => {
        const ids = filterConfig.map((config) => config.id);
        if (prev && ids.includes(prev)) return prev;
        return filterConfig[0]?.id ?? null;
      });
    } else {
      setOpenSections(
        Object.fromEntries(filterConfig.map((config) => [config.id, true]))
      );
    }
  }, [filterConfig, singleOpen]);

  const toggleSection = (section: string) => {
    if (singleOpen) {
      setOpenSection((prev) => (prev === section ? null : section));
      return;
    }
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  const textSizeClass = isResponsive ? 'text-xs' : 'text-sm';
  const spacingClass = isResponsive ? 'space-y-1' : 'space-y-2';

  // Filter the format options based on selected media type
  const filteredFilterConfig = useMemo(() => {
    const selectedMediaType = Array.isArray(filters['mediaType'])
      ? filters['mediaType'][0]
      : (filters['mediaType'] as string | undefined);

    return filterConfig.map(config => {
      // Only filter the Format category if a Media Type is selected
      if (config.id === 'format' && selectedMediaType && MEDIA_TYPE_FORMAT_MAPPING[selectedMediaType]) {
        const allowedFormats = MEDIA_TYPE_FORMAT_MAPPING[selectedMediaType];
        return {
          ...config,
          options: config.options.filter(option => allowedFormats.includes(option.name))
        };
      }
      return config;
    });
  }, [filterConfig, filters]);

  return (
    <div className="space-y-2">
      {filteredFilterConfig.map(config => (
        <AccordionSection
          key={config.id}
          title={config.title}
          isOpen={singleOpen ? openSection === config.id : openSections[config.id] || false}
          onToggle={() => toggleSection(config.id)}
        >
          <div className={spacingClass}>
            {config.options.map((option) => {
              const selectedValue = filters[config.id];
              const isChecked = Array.isArray(selectedValue)
                ? selectedValue.includes(option.id)
                : selectedValue === option.id;
              return (
                <label
                  key={option.id}
                  htmlFor={`${config.id}-${option.id}`}
                  className={`flex items-center rounded-md px-2 py-1 transition-colors cursor-pointer ${
                    isChecked
                      ? "bg-blue-50 border border-blue-200"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <input
                    type="checkbox"
                    id={`${config.id}-${option.id}`}
                    checked={isChecked}
                    onChange={() => onFilterChange(config.id, option.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`ml-2 ${textSizeClass} text-gray-700`}>
                    {option.name}
                  </span>
                </label>
              );
            })}
          </div>
        </AccordionSection>
      ))}
    </div>
  );
};
