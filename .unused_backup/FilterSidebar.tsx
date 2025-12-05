import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ProviderType } from './CourseMarketplace';
interface FilterSidebarProps {
  filters: {
    category: string;
    deliveryMode: string;
    duration: string;
    businessStage: string;
    provider: string;
  };
  onFilterChange: (filterType: string, value: string) => void;
  onResetFilters: () => void;
  isResponsive?: boolean;
  // New props for dynamic data
  categories: string[];
  deliveryModes: string[];
  businessStages: string[];
  providers: ProviderType[];
}
interface AccordionSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}
const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  isOpen,
  onToggle,
  children
}) => {
  return <div className="border-b border-gray-100 py-3">
      <button className="flex w-full justify-between items-center text-left font-medium text-gray-900 mb-2" onClick={onToggle}>
        {title}
        {isOpen ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
        {children}
      </div>
    </div>;
};
export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  isResponsive = false,
  categories = [],
  deliveryModes = [],
  businessStages = [],
  providers = []
}) => {
  const [openSections, setOpenSections] = useState({
    category: true,
    deliveryMode: true,
    duration: true,
    businessStage: true,
    provider: true
  });
  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  const textSizeClass = isResponsive ? 'text-sm' : 'text-sm';
  const spacingClass = isResponsive ? 'space-y-1' : 'space-y-2';
  // Duration options
  const durations = [{
    value: 'Short',
    label: 'Short (<1 week)'
  }, {
    value: 'Medium',
    label: 'Medium (1-4 weeks)'
  }, {
    value: 'Long',
    label: 'Long (1+ month)'
  }];
  return <div className="space-y-2">
      {/* Category filter */}
      <AccordionSection title="Course Category" isOpen={openSections.category} onToggle={() => toggleSection('category')}>
        <div className={spacingClass}>
          {categories.map(category => <div key={category} className="flex items-center">
              <input type="checkbox" id={`category-${category}`} checked={filters.category === category} onChange={() => onFilterChange('category', category)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor={`category-${category}`} className={`ml-2 ${textSizeClass} text-gray-700`}>
                {category}
              </label>
            </div>)}
        </div>
      </AccordionSection>
      {/* Delivery Mode filter */}
      <AccordionSection title="Delivery Mode" isOpen={openSections.deliveryMode} onToggle={() => toggleSection('deliveryMode')}>
        <div className={spacingClass}>
          {deliveryModes.map(mode => <div key={mode} className="flex items-center">
              <input type="checkbox" id={`mode-${mode}`} checked={filters.deliveryMode === mode} onChange={() => onFilterChange('deliveryMode', mode)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor={`mode-${mode}`} className={`ml-2 ${textSizeClass} text-gray-700`}>
                {mode}
              </label>
            </div>)}
        </div>
      </AccordionSection>
      {/* Duration filter */}
      <AccordionSection title="Duration" isOpen={openSections.duration} onToggle={() => toggleSection('duration')}>
        <div className={spacingClass}>
          {durations.map(duration => <div key={duration.value} className="flex items-center">
              <input type="checkbox" id={`duration-${duration.value}`} checked={filters.duration === duration.value} onChange={() => onFilterChange('duration', duration.value)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor={`duration-${duration.value}`} className={`ml-2 ${textSizeClass} text-gray-700`}>
                {duration.label}
              </label>
            </div>)}
        </div>
      </AccordionSection>
      {/* Business Stage filter */}
      <AccordionSection title="Business Stage" isOpen={openSections.businessStage} onToggle={() => toggleSection('businessStage')}>
        <div className={spacingClass}>
          {businessStages.map(stage => <div key={stage} className="flex items-center">
              <input type="checkbox" id={`stage-${stage}`} checked={filters.businessStage === stage} onChange={() => onFilterChange('businessStage', stage)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor={`stage-${stage}`} className={`ml-2 ${textSizeClass} text-gray-700`}>
                {stage}
              </label>
            </div>)}
        </div>
      </AccordionSection>
      {/* Provider filter */}
      <AccordionSection title="Provider" isOpen={openSections.provider} onToggle={() => toggleSection('provider')}>
        <div className={spacingClass}>
          {providers.map(provider => <div key={provider.name} className="flex items-center">
              <input type="checkbox" id={`provider-${provider.name}`} checked={filters.provider === provider.name} onChange={() => onFilterChange('provider', provider.name)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor={`provider-${provider.name}`} className={`ml-2 ${textSizeClass} text-gray-700`}>
                {provider.name}
              </label>
            </div>)}
        </div>
      </AccordionSection>
    </div>;
};