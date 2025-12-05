import React, { useEffect, useRef } from 'react';
import { ServiceItem } from '../../types/marketplace';
import { XIcon, Clock, Calendar, DollarSign, MapPin, BookmarkIcon, ScaleIcon, CheckCircleIcon, HomeIcon, ChevronRightIcon } from 'lucide-react';
interface ServiceQuickViewModalProps {
  service: ServiceItem;
  onClose: () => void;
  onViewDetails: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onAddToComparison: () => void;
  marketplaceType: string;
  primaryButtonText?: string;
}
export const ServiceQuickViewModal: React.FC<ServiceQuickViewModalProps> = ({
  service,
  onClose,
  onViewDetails,
  isBookmarked,
  onToggleBookmark,
  onAddToComparison,
  marketplaceType,
  primaryButtonText = 'Enroll Now'
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);
  // Extract key highlights from details (first 3)
  const keyHighlights = service.details?.slice(0, 3) || [];
  // Get title based on marketplace type
  const getMarketplaceTitle = () => {
    switch (marketplaceType) {
      case 'courses':
        return 'Course Preview';
      case 'financial':
        return 'Financial Service Preview';
      case 'non-financial':
        return 'Service Preview';
      default:
        return 'Item Preview';
    }
  };
  // Get breadcrumb title based on marketplace type
  const getBreadcrumbTitle = () => {
    switch (marketplaceType) {
      case 'courses':
        return 'Courses';
      case 'financial':
        return 'Financial Services';
      case 'non-financial':
        return 'Non-Financial Services';
      default:
        return 'Marketplace';
    }
  };
  return <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 truncate">
            {getMarketplaceTitle()}
          </h2>
          <div className="flex items-center space-x-3">
            <button onClick={onToggleBookmark} className={`p-2 rounded-full ${isBookmarked ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`} aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}>
              <BookmarkIcon size={18} className={isBookmarked ? 'fill-yellow-600' : ''} />
            </button>
            <button onClick={onAddToComparison} className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200" aria-label="Add to comparison">
              <ScaleIcon size={18} />
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
              <XIcon size={24} />
            </button>
          </div>
        </div>
        <div className="p-6">
          {/* Breadcrumbs */}
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
              <li className="inline-flex items-center">
                <a href="/" className="text-gray-600 hover:text-gray-900 inline-flex items-center text-sm">
                  <HomeIcon size={14} className="mr-1" />
                  <span>Home</span>
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRightIcon size={14} className="text-gray-400" />
                  <a href={`/marketplace/${marketplaceType}`} className="ml-1 text-gray-600 hover:text-gray-900 md:ml-2 text-sm">
                    {getBreadcrumbTitle()}
                  </a>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <ChevronRightIcon size={14} className="text-gray-400" />
                  <span className="ml-1 text-gray-500 md:ml-2 truncate max-w-[150px] text-sm">
                    {service.title}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
          <div className="flex items-center mb-4">
            <img src={service.provider.logoUrl} alt={`${service.provider.name} logo`} className="h-12 w-12 object-contain mr-4" />
            <div>
              <span className="text-sm text-gray-500">Provided by</span>
              <h3 className="text-lg font-medium text-gray-900">
                {service.provider.name}
              </h3>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {service.title}
          </h1>
          <div className="flex flex-wrap gap-2 mb-4">
            {service.tags && service.tags.map((tag, index) => <span key={index} className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${index % 3 === 0 ? 'bg-blue-50 text-blue-700 border border-blue-100' : index % 3 === 1 ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-purple-50 text-purple-700 border border-purple-100'}`}>
                  {tag}
                </span>)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {service.duration && <div className="flex items-center text-gray-700">
                <Clock className="mr-2" size={18} />
                <span>{service.duration}</span>
              </div>}
            {service.startDate && <div className="flex items-center text-gray-700">
                <Calendar className="mr-2" size={18} />
                <span>Starts {service.startDate}</span>
              </div>}
            {service.price && <div className="flex items-center text-gray-700">
                <DollarSign className="mr-2" size={18} />
                <span>{service.price}</span>
              </div>}
            {service.location && <div className="flex items-center text-gray-700">
                <MapPin className="mr-2" size={18} />
                <span>{service.location}</span>
              </div>}
          </div>
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Description
            </h3>
            <p className="text-gray-700">{service.description}</p>
          </div>
          {keyHighlights.length > 0 && <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Key Highlights
              </h3>
              <ul className="space-y-2">
                {keyHighlights.map((highlight, index) => <li key={index} className="flex items-start">
                    <CheckCircleIcon size={18} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{highlight}</span>
                  </li>)}
              </ul>
            </div>}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button onClick={onViewDetails} className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md border border-blue-200 hover:bg-blue-100 transition-colors">
              View Full Details
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-md hover:from-blue-700 hover:to-purple-700 transition-colors">
              {primaryButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>;
};