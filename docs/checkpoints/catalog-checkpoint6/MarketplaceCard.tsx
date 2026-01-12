import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMarketplaceConfig } from '../../utils/marketplaceConfig';
import { CourseTile } from '../CourseTile';

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
  onTagClick?: (type: string, value: string) => void;
}

export const MarketplaceCard: React.FC<MarketplaceItemProps> = ({
  item,
  marketplaceType,
  isBookmarked,
  onToggleBookmark,
  onAddToComparison,
  onQuickView,
}) => {
  const navigate = useNavigate();
  const config = getMarketplaceConfig(marketplaceType);

  const getItemRoute = () => {
    return `${config.route}/${item.id}`;
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('View Details Clicked - Navigating to:', getItemRoute());
    navigate(getItemRoute());
  };

  const handlePrimaryAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Primary Action Clicked:', {
      itemId: item.id,
      itemTitle: item.title,
      formUrl: item.formUrl,
      marketplaceType,
    });
    const effectiveUrl = item.formUrl || "https://www.tamm.abudhabi/en/login";
    if (effectiveUrl.startsWith('http')) {
      window.open(effectiveUrl, '_blank', 'noopener,noreferrer');
      console.log('Opening external URL:', effectiveUrl);
      return;
    }
    const targetUrl = effectiveUrl.startsWith('/forms/') ? effectiveUrl : `/forms/${effectiveUrl}`;
    console.log('Navigating to internal route:', targetUrl);
    navigate(targetUrl);
  };

  const topicTags = useMemo(() => {
    return Array.isArray(item.topicTags) ? item.topicTags : [];
  }, [item.topicTags]);

  const thumbnailUrl = useMemo(() => {
    return (
      item.introVideoPosterUrl ||
      item.heroImageUrl ||
      item.heroImage ||
      item.imageUrl ||
      item.thumbnailUrl ||
      item.provider?.logoUrl ||
      "/mzn_logo.png"
    );
  }, [
    item.introVideoPosterUrl,
    item.heroImageUrl,
    item.heroImage,
    item.imageUrl,
    item.thumbnailUrl,
    item.provider?.logoUrl,
  ]);

  return (
    <CourseTile
      title={item.title}
      description={item.description}
      providerName={item.provider?.name || "Provider"}
      providerLogoUrl={item.provider?.logoUrl || "/mzn_logo.png"}
      variant={marketplaceType === "courses" ? "course" : "classic"}
      thumbnailUrl={thumbnailUrl}
      category={item.category}
      levelTag={item.levelTag}
      audienceLevel={item.audienceLevel}
      topicTags={topicTags}
      duration={item.duration}
      lessonCount={item.lessonCount}
      rating={item.rating}
      reviewCount={item.reviewCount}
      primaryCtaLabel={config.primaryCTA}
      secondaryCtaLabel={config.secondaryCTA}
      onPrimaryClick={handlePrimaryAction}
      onSecondaryClick={handleViewDetails}
      onAddToComparison={onAddToComparison}
      onCardClick={onQuickView}
      onToggleBookmark={onToggleBookmark}
      isBookmarked={isBookmarked}
      showActions={false}
    />
  );
};
