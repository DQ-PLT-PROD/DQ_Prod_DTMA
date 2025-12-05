import React from 'react';
import { BookmarkIcon, ScaleIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export interface ServiceCardProps {
  item: {
    id: string;
    title: string;
    description: string;
    provider: {
      name: string;
      logoUrl: string;
    };
    tags?: string[];
    category?: string;
    deliveryMode?: string;
  };
  type: string;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onAddToComparison: () => void;
  onQuickView: () => void;
}
export const ServiceCard: React.FC<ServiceCardProps> = ({
  item,
  type,
  isBookmarked,
  onToggleBookmark,
  onAddToComparison,
  onQuickView
}) => {
  const navigate = useNavigate();
  // Generate route based on marketplace type
  const getItemRoute = () => {
    switch (type) {
      case 'courses':
        return `/courses/${item.id}`;
      case 'financial':
        return `/marketplace/financial/${item.id}`;
      case 'non-financial':
        return `/marketplace/non-financial/${item.id}`;
      default:
        return `/${type}/${item.id}`;
    }
  };
  // Generate appropriate CTA text based on marketplace type
  const getPrimaryCTAText = () => {
    switch (type) {
      case 'courses':
        return 'Enroll Now';
      case 'financial':
        return 'Apply Now';
      case 'non-financial':
        return 'Request Service';
      default:
        return 'Get Started';
    }
  };
  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(getItemRoute());
  };
  const handlePrimaryAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`${getItemRoute()}?action=true`);
  };
  // Display tags if available, otherwise use category and deliveryMode
  const displayTags = item.tags || [item.category, item.deliveryMode].filter(Boolean);
  return <div className="flex flex-col min-h-[340px] bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200" onClick={onQuickView}>
      {/* Card Header with fixed height for title and provider */}
      <div className="px-4 py-5 flex-grow flex flex-col">
        <div className="flex items-start mb-5">
          <img src={item.provider.logoUrl} alt={`${item.provider.name} logo`} className="h-12 w-12 object-contain rounded-md flex-shrink-0 mr-3" />
          <div className="flex-grow min-h-[72px] flex flex-col justify-center">
            <h3 className="font-bold text-gray-900 line-clamp-2 min-h-[48px] leading-snug">
              {item.title}
            </h3>
            <p className="text-sm text-gray-500 min-h-[20px] mt-1">
              {item.provider.name}
            </p>
          </div>
        </div>
        {/* Description with consistent height */}
        <div className="mb-5">
          <p className="text-sm text-gray-600 line-clamp-3 min-h-[60px] leading-relaxed">
            {item.description}
          </p>
        </div>
        {/* Tags and Actions in same row - fixed position */}
        <div className="flex justify-between items-center mt-auto">
          <div className="flex flex-wrap gap-1 max-w-[70%]">
            {displayTags.map((tag, index) => <span key={index} className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium truncate ${index === 0 ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                {tag}
              </span>)}
          </div>
          <div className="flex space-x-2 flex-shrink-0">
            <button onClick={e => {
            e.stopPropagation();
            onToggleBookmark();
          }} className={`p-1.5 rounded-full ${isBookmarked ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`} aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'} title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}>
              <BookmarkIcon size={16} className={isBookmarked ? 'fill-yellow-600' : ''} />
            </button>
            <button onClick={e => {
            e.stopPropagation();
            onAddToComparison();
          }} className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200" aria-label="Add to comparison" title="Add to comparison">
              <ScaleIcon size={16} />
            </button>
          </div>
        </div>
      </div>
      {/* Card Footer - with two buttons */}
      <div className="mt-auto border-t border-gray-100 p-4 pt-5">
        <div className="flex justify-between gap-2">
          <button onClick={handleViewDetails} className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors whitespace-nowrap min-w-[120px] flex-1">
            View Details
          </button>
          <button onClick={handlePrimaryAction} className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors whitespace-nowrap flex-1">
            {getPrimaryCTAText()}
          </button>
        </div>
      </div>
    </div>;
};