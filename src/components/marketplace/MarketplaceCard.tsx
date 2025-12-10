import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMarketplaceConfig } from '../../utils/marketplaceConfig';
import { getCoursePoster } from '../../utils/courseMedia';
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

  isPointerFine?: boolean;
  onTagClick?: (type: string, value: string) => void;
  onQuickViewOpen?: (rect: any) => void;
  onQuickViewClose?: () => void;
  onQuickViewHover?: () => void;
  isQuickViewActive?: boolean;
}


export const MarketplaceCard: React.FC<MarketplaceItemProps> = ({
  item,
  marketplaceType,
  isBookmarked,
  onToggleBookmark,

  isPointerFine = true,
}) => {
  const navigate = useNavigate();
  const config = getMarketplaceConfig(marketplaceType);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (!isPointerFine) return;
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    // Delay the hover effect slightly to prevent accidental triggers
    hoverTimerRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (!isPointerFine) return;
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    setIsHovered(false);
  };

  const getItemRoute = () => {
    return `${config.route}/${item.id}`;
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(getItemRoute());
  };

  const handlePrimaryAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    const effectiveUrl = item.formUrl || "https://www.tamm.abudhabi/en/login";
    if (effectiveUrl.startsWith('http')) {
      window.open(effectiveUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    const targetUrl = effectiveUrl.startsWith('/forms/') ? effectiveUrl : `/forms/${effectiveUrl}`;
    navigate(targetUrl);
  };

  const topicTags = useMemo(() => {
    return Array.isArray(item.topicTags) ? item.topicTags : [];
  }, [item.topicTags]);

  const thumbnailUrl = useMemo(() => {
    return getCoursePoster(item);
  }, [item]);

  return (
    <div
      ref={cardRef}
      className="h-full relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ zIndex: isHovered ? 50 : 1 }}
    >
      <div
        className={`
          transition-all duration-300 ease-out
          ${isHovered ? 'absolute top-0 left-0 w-full z-50 transform scale-105 shadow-2xl' : 'h-full'}
        `}
      >
        <CourseTile
          title={item.title}
          description={item.description}
          providerName={item.provider?.name || "Provider"}
          providerLogoUrl={item.provider?.logoUrl || "/mzn_logo.png"}
          variant={marketplaceType === "courses" ? "course" : "classic"}
          thumbnailUrl={thumbnailUrl}
          videoUrl={item.introVideoUrl} // Pass videoUrl
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

          onCardClick={handleViewDetails}
          onToggleBookmark={onToggleBookmark}
          isBookmarked={isBookmarked}
          showActions={isHovered} // Show actions only on hover
          isHovered={isHovered}
        />
      </div>
      {/* Placeholder to maintain layout space when card is absolute/scaled */}
      {isHovered && <div className="h-full w-full invisible" />}
    </div>
  );
};
