import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Tag } from '../ui/Tag';
import { CourseMeta } from '../ui/CourseMeta';
import { XIcon, BookmarkIcon, ScaleIcon, Volume2, VolumeX } from 'lucide-react';
import { getMarketplaceConfig } from '../../utils/marketplaceConfig';

export type QuickViewAnchorRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

interface MarketplaceQuickViewModalProps {
  item: any;
  anchorRect?: QuickViewAnchorRect | null;
  anchor?: { x: number; y: number };
  marketplaceType: string;
  onClose: () => void;
  onViewDetails: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onAddToComparison: () => void;
  onPrimaryAction?: () => void;
  onHover?: () => void;
  onLeave?: () => void;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const MarketplaceQuickViewModal: React.FC<MarketplaceQuickViewModalProps> = ({
  item,
  anchorRect,
  anchor,
  marketplaceType,
  onClose,
  onViewDetails,
  isBookmarked,
  onToggleBookmark,
  onAddToComparison,
  onPrimaryAction,
  onHover,
  onLeave,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const config = getMarketplaceConfig(marketplaceType);
  const [isMuted, setIsMuted] = useState(true);

  const poster =
    item.introVideoPosterUrl ||
    item.heroImageUrl ||
    item.heroImage ||
    item.imageUrl ||
    item.thumbnailUrl ||
    item.provider?.logoUrl ||
    '/mzn_logo.png';

  useEffect(() => {
    const video = videoRef.current;
    setIsMuted(true);
    if (video && item.introVideoUrl) {
      video.muted = true;
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(() => {});
      }
    }
    return () => {
      if (video) {
        video.pause();
      }
    };
  }, [item.introVideoUrl, item.id]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const anchoredPosition = useMemo(() => {
    if (!anchorRect) return null;
    if (typeof window === 'undefined') return null;
    const width = 420;
    const margin = 12;
    const prefersRight =
      anchorRect.left + anchorRect.width + width + margin <= window.innerWidth;
    const proposedLeft = prefersRight
      ? anchorRect.left + anchorRect.width + margin
      : anchorRect.left - width - margin;
    const left = clamp(proposedLeft, margin, window.innerWidth - width - margin);
    const top = clamp(anchorRect.top, margin, window.innerHeight - margin - 320);
    return {
      top,
      left,
      width,
      transformOrigin: prefersRight ? 'left top' : 'right top',
    };
  }, [anchorRect]);

  const fallbackPosition = useMemo(() => {
    if (anchorRect || !anchor) return null;
    return { top: anchor.y, left: anchor.x };
  }, [anchorRect, anchor]);

  if (typeof document === 'undefined') {
    return null;
  }

  const displayTags = [
    item.levelTag,
    item.audienceLevel,
    ...(Array.isArray(item.topicTags) ? item.topicTags.slice(0, 1) : []),
  ].filter(Boolean);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      const video = videoRef.current;
      if (video) {
        video.muted = next;
        const playPromise = video.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.catch(() => {});
        }
      }
      return next;
    });
  };

  const cardContent = (
    <div className="w-[360px] md:w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      <div className="relative bg-black">
        {item.introVideoUrl ? (
          <video
            ref={videoRef}
            src={item.introVideoUrl}
            poster={poster}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            className="w-full h-48 object-cover"
            controls={false}
          />
        ) : (
          <img
            src={poster}
            alt={item.title}
            className="w-full h-48 object-cover"
          />
        )}
        {item.introVideoUrl ? (
          <button
            onClick={toggleMute}
            className="absolute top-2 left-2 rounded-full bg-white/80 text-gray-800 hover:bg-white p-2 shadow-sm"
            aria-label={isMuted ? 'Unmute preview' : 'Mute preview'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        ) : null}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 rounded-full bg-white/80 text-gray-700 hover:bg-white p-1"
          aria-label="Close quick view"
        >
          <XIcon size={18} />
        </button>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            {item.category ? (
              <div className="text-[11px] uppercase tracking-wide font-semibold text-blue-700 mb-1">
                {item.category}
              </div>
            ) : null}
            <h3 className="text-lg font-semibold text-gray-900 leading-snug line-clamp-2">
              {item.title}
            </h3>
            {item.provider?.name ? (
              <p className="text-xs font-medium text-gray-500 mt-0.5">
                {item.provider.name}
              </p>
            ) : null}
            <p className="text-sm text-gray-600 line-clamp-2 mt-1.5">
              {item.description}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleBookmark}
              className={`p-2 rounded-full ${
                isBookmarked
                  ? 'bg-yellow-100 text-yellow-600'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              <BookmarkIcon size={16} className={isBookmarked ? 'fill-yellow-600' : ''} />
            </button>
            <button
              onClick={onAddToComparison}
              className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
              aria-label="Add to comparison"
            >
              <ScaleIcon size={16} />
            </button>
          </div>
        </div>

        {displayTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {displayTags.map((tag: string, idx: number) => (
              <Tag key={`${tag}-${idx}`} variant={idx === 0 ? 'category' : idx === 1 ? 'level' : 'topic'}>
                {tag}
              </Tag>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <CourseMeta duration={item.duration} lessonCount={item.lessonCount} />
          <span className="text-sm text-gray-600">{config.itemName} preview</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onViewDetails}
            className="flex-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            View course
          </button>
          <button
            onClick={() => {
              if (onPrimaryAction) {
                onPrimaryAction();
              } else {
                onViewDetails();
              }
            }}
            className="flex-1 px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow hover:from-blue-700 hover:to-purple-700 transition-colors"
          >
            {config.primaryCTA}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(
    <div
      className={
        anchoredPosition
          ? 'fixed inset-0 z-[60] pointer-events-none'
          : 'fixed inset-0 z-[60] flex items-center justify-center p-4'
      }
    >
      {!anchoredPosition ? (
        <div
          className="absolute inset-0 bg-black/40"
          onClick={onClose}
        />
      ) : null}
      <div
        className={anchoredPosition || fallbackPosition ? 'pointer-events-auto fixed' : 'pointer-events-auto relative'}
        style={
          anchoredPosition
            ? {
                top: anchoredPosition.top,
                left: anchoredPosition.left,
                width: anchoredPosition.width,
                transformOrigin: anchoredPosition.transformOrigin,
              }
            : fallbackPosition || undefined
        }
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
      >
        {cardContent}
      </div>
    </div>,
    document.body
  );
};
