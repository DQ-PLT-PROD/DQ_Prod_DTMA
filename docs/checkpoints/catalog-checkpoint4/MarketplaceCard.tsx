import React, { useMemo } from 'react';
import { ScaleIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMarketplaceConfig } from '../../utils/marketplaceConfig';
import { Tag } from '../ui/Tag';
import { CourseMeta } from '../ui/CourseMeta';

export interface MarketplaceItemProps {
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
    formUrl?: string; // Internal route for the form
    [key: string]: any;
  };
  marketplaceType: string;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onAddToComparison: () => void;
  onQuickView: () => void;
}

export const MarketplaceCard: React.FC<MarketplaceItemProps> = ({
  item,
  marketplaceType,
  isBookmarked,
  onToggleBookmark,
  onAddToComparison,
  onQuickView
}) => {
  const navigate = useNavigate();
  const config = getMarketplaceConfig(marketplaceType);

  // Generate route based on marketplace type
  const getItemRoute = () => {
    return `${config.route}/${item.id}`;
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('View Details Clicked - Navigating to:', getItemRoute());
    navigate(getItemRoute());
  };

  // Navigate to the formUrl when the primary action is clicked
  const handlePrimaryAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Log item details for debugging
    console.log('Primary Action Clicked:', {
      itemId: item.id,
      itemTitle: item.title,
      formUrl: item.formUrl,
      marketplaceType,
    });
    // Apply external fallback if formUrl is null/falsy
    const effectiveUrl = item.formUrl || "https://www.tamm.abudhabi/en/login";
    // Handle external: open in new tab
    if (effectiveUrl.startsWith('http')) {
      window.open(effectiveUrl, '_blank', 'noopener,noreferrer');
      console.log('Opening external URL:', effectiveUrl);
      return;
    }
    // Internal route: normalize with /forms/ prefix if needed
    const targetUrl = effectiveUrl.startsWith('/forms/') ? effectiveUrl : `/forms/${effectiveUrl}`;
    console.log('Navigating to internal route:', targetUrl);
    navigate(targetUrl);
  };

  const displayTags = useMemo(() => {
    if (item.tags && item.tags.length) return item.tags;
    const tags = [
      item.category,
      item.deliveryMode,
      item.levelTag,
      item.audienceLevel,
      ...(item.topicTags || []),
    ].filter(Boolean);
    return tags.slice(0, 4);
  }, [item]);

  const topicTags = useMemo(() => {
    return Array.isArray(item.topicTags) ? item.topicTags.slice(0, 3) : [];
  }, [item.topicTags]);

  return (
    <div
      className="flex flex-col min-h-[340px] bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border border-gray-100"
      onClick={onQuickView}
    >
      <div className="px-4 py-5 flex-grow flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <img
            src={item.provider.logoUrl}
            alt={`${item.provider.name} logo`}
            className="h-12 w-12 object-contain rounded-md flex-shrink-0 border border-gray-100"
          />
          <div className="flex-grow space-y-1">
            <div className="flex flex-wrap gap-1">
              {item.category ? <Tag variant="category">{item.category}</Tag> : null}
              {item.levelTag ? <Tag variant="level">{item.levelTag}</Tag> : null}
              {item.audienceLevel ? <Tag variant="audience">{item.audienceLevel}</Tag> : null}
            </div>
            <h3 className="font-semibold text-gray-900 line-clamp-2 leading-snug">
              {item.title}
            </h3>
            <p className="text-sm text-gray-500">
              {item.provider.name}
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
          {item.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {topicTags.map((tag, index) => (
            <Tag key={`${tag}-${index}`} variant="topic">
              {tag}
            </Tag>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <CourseMeta duration={item.duration} lessonCount={item.lessonCount} />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToComparison();
            }}
            className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
            aria-label="Add to comparison"
            title="Add to comparison"
          >
            <ScaleIcon size={16} />
          </button>
        </div>
      </div>
      <div className="mt-auto border-t border-gray-100 p-4 pt-4 bg-gray-50">
        <div className="flex justify-between gap-2">
          <button
            onClick={handleViewDetails}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors whitespace-nowrap min-w-[120px] flex-1"
          >
            {config.secondaryCTA}
          </button>
          <button
            onClick={handlePrimaryAction}
            className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors whitespace-nowrap flex-1"
          >
            {config.primaryCTA}
          </button>
        </div>
      </div>
    </div>
  );
};
