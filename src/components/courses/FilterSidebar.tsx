import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
export interface FilterOption {
  id: string;
  name: string;
  description?: string;
  children?: FilterOption[];
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

type TooltipState = { content: string; top: number; left: number };

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
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96" : "max-h-0"
          }`}
      >
        <div className="max-h-60 overflow-y-scroll pr-2 custom-scrollbar">
          {children}
        </div>
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

  const [openOptionGroups, setOpenOptionGroups] = useState<Record<string, boolean>>({});
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  useEffect(() => {
    const next: Record<string, boolean> = {};
    filterConfig.forEach((config) => {
      config.options.forEach((option) => {
        if (option.children?.length) {
          next[`${config.id}:${option.id}`] = true;
        }
      });
    });
    setOpenOptionGroups(next);
  }, [filterConfig]);

  const toggleOptionGroup = (key: string) => {
    setOpenOptionGroups((prev) => {
      const current = prev[key] ?? true;
      return { ...prev, [key]: !current };
    });
  };

  const showTooltip = (target: HTMLElement, content: string) => {
    const rect = target.getBoundingClientRect();
    setTooltip({
      content,
      top: rect.top + rect.height / 2,
      left: rect.right + 8,
    });
  };

  const hideTooltip = () => setTooltip(null);

  useEffect(() => {
    if (!tooltip) return;
    const handleReflow = () => setTooltip(null);
    window.addEventListener('scroll', handleReflow, true);
    window.addEventListener('resize', handleReflow);
    return () => {
      window.removeEventListener('scroll', handleReflow, true);
      window.removeEventListener('resize', handleReflow);
    };
  }, [tooltip]);

  const renderOption = (configId: string, option: FilterOption, depth = 0) => {
    const selectedValue = filters[configId];
    const selectedIds = Array.isArray(selectedValue)
      ? selectedValue
      : selectedValue
        ? [selectedValue]
        : [];

    if (option.children?.length) {
      const groupKey = `${configId}:${option.id}`;
      const isOpen = openOptionGroups[groupKey] ?? true;
      const paddingClass = depth === 0 ? "" : "pl-4";
      return (
        <div key={groupKey} className={paddingClass}>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left font-medium text-gray-900 hover:bg-gray-50"
            onClick={() => toggleOptionGroup(groupKey)}
            aria-expanded={isOpen}
          >
            <span className={`${textSizeClass}`}>{option.name}</span>
            {isOpen ? (
              <ChevronUp size={16} className="text-gray-500" />
            ) : (
              <ChevronDown size={16} className="text-gray-500" />
            )}
          </button>
          {isOpen && (
            <div className={`mt-1 ${spacingClass}`}>
              {option.children.map((child) => renderOption(configId, child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    const isChecked = selectedIds.includes(option.id);
    const paddingClass = depth === 0 ? "" : "pl-4";

    return (
      <label
        key={`${configId}:${option.id}`}
        htmlFor={`${configId}-${option.id}`}
        className={`flex items-center rounded-md px-2 py-1 transition-colors cursor-pointer ${paddingClass} ${isChecked
          ? "bg-blue-50 border border-blue-200"
          : "hover:bg-gray-50 border border-transparent"
          }`}
      >
        <input
          type="checkbox"
          id={`${configId}-${option.id}`}
          checked={isChecked}
          onChange={() => onFilterChange(configId, option.id)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className={`ml-2 ${textSizeClass} text-gray-700 flex-1`}>
          {option.name}
        </span>
        {option.description && (
          <button
            type="button"
            className="relative ml-1 p-1 text-gray-400 hover:text-blue-500 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
            aria-label={`${option.name} info`}
            onMouseEnter={(event) => showTooltip(event.currentTarget, option.description)}
            onMouseLeave={hideTooltip}
            onFocus={(event) => showTooltip(event.currentTarget, option.description)}
            onBlur={hideTooltip}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            <Info size={14} className="pointer-events-none" />
          </button>
        )}
      </label>
    );
  };

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
    <>
      <div className="space-y-2">
        {filteredFilterConfig.map(config => (
          <AccordionSection
            key={config.id}
            title={config.title}
            isOpen={singleOpen ? openSection === config.id : openSections[config.id] || false}
            onToggle={() => toggleSection(config.id)}
          >
            <div className={spacingClass}>
              {config.options.map((option) => renderOption(config.id, option))}
            </div>
          </AccordionSection>
        ))}
      </div>
      {tooltip && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[99999] pointer-events-none"
          style={{ top: tooltip.top, left: tooltip.left, transform: 'translateY(-50%)' }}
        >
          <div className="w-56 p-3 text-xs text-white bg-gray-900 rounded-lg shadow-xl">
            {tooltip.content}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
