import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMarketplaceConfig } from '../../utils/marketplaceConfig';
import { CourseTile } from '../CourseTile';
import { QuickViewAnchorRect } from './MarketplaceQuickViewModal';

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
  onQuickViewOpen?: (anchorRect: QuickViewAnchorRect) => void;
  onQuickViewClose?: () => void;
  onQuickViewHover?: () => void;
  isQuickViewActive?: boolean;
  isPointerFine?: boolean;
  hoverIntentDelay?: number;
  onTagClick?: (type: string, value: string) => void;
}

export const MarketplaceCard: React.FC<MarketplaceItemProps> = ({
  item,
  marketplaceType,
  isBookmarked,
  onToggleBookmark,
  onAddToComparison,
  onQuickViewOpen,
  onQuickViewClose,
  onQuickViewHover,
  isQuickViewActive = false,
  isPointerFine = true,
  hoverIntentDelay = 500,
}) => {
  const navigate = useNavigate();
  const config = getMarketplaceConfig(marketplaceType);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState<boolean>(isQuickViewActive);
  const [lastAnchorRect, setLastAnchorRect] = useState<QuickViewAnchorRect | null>(null);

  useEffect(() => {
    setIsQuickViewOpen(Boolean(isQuickViewActive));
  }, [isQuickViewActive]);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  const resolveAnchorRect = (): QuickViewAnchorRect | null => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return lastAnchorRect;
    const anchorRect = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };
    setLastAnchorRect(anchorRect);
    return anchorRect;
  };

  const triggerQuickView = () => {
    if (!onQuickViewOpen) return;
    const anchorRect = resolveAnchorRect();
    if (!anchorRect) return;
    onQuickViewOpen(anchorRect);
    setIsQuickViewOpen(true);
  };

  const handleMouseEnter = () => {
    if (!isPointerFine) return;
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    if (isQuickViewOpen && onQuickViewHover) {
      onQuickViewHover();
    }
    if (!onQuickViewOpen) return;
    hoverTimerRef.current = setTimeout(() => triggerQuickView(), hoverIntentDelay);
  };

  const handleMouseLeave = () => {
    if (!isPointerFine) return;
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    if (isQuickViewOpen && onQuickViewClose) {
      onQuickViewClose();
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    triggerQuickView();
  };

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
    <div
      ref={cardRef}
      className="h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
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
        // Click-through on the tile is wired to MarketplaceGrid's quick view orchestration
        onCardClick={handleCardClick}
        onToggleBookmark={onToggleBookmark}
        isBookmarked={isBookmarked}
        showActions={false}
      />
    </div>
  );
};
