import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Tag } from '../ui/Tag';
import { CourseMeta } from '../ui/CourseMeta';
import { XIcon, BookmarkIcon, ScaleIcon, Volume2, VolumeX } from 'lucide-react';
import { getMarketplaceConfig } from '../../utils/marketplaceConfig';
import { getCourseMedia } from '../../utils/courseMedia';

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

  onPrimaryAction,
  onHover,
  onLeave,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const config = getMarketplaceConfig(marketplaceType);
  const [isMuted, setIsMuted] = useState(true);
  const { videoUrl, poster } = getCourseMedia(item);

  useEffect(() => {
    const video = videoRef.current;
    setIsMuted(true);
    if (video && videoUrl) {
      video.muted = true;
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(() => { });
      }
    }
    return () => {
      if (video) {
        video.pause();
      }
    };
  }, [videoUrl, item.id]);

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
    if (!anchorRect || typeof window === 'undefined') return null;
    const margin = 12;
    const maxWidth = Math.max(margin * 2, window.innerWidth - margin * 2);
    const targetWidth = clamp(
      anchorRect.width * 1.1,
      Math.max(anchorRect.width, 320),
      Math.min(520, maxWidth)
    );
    const left = clamp(
      anchorRect.left - (targetWidth - anchorRect.width) / 2,
      margin,
      window.innerWidth - targetWidth - margin
    );
    const estimatedHeight = anchorRect.height * 1.15 + 220;
    const top = clamp(
      anchorRect.top,
      margin,
      Math.max(margin, window.innerHeight - estimatedHeight)
    );
    return { top, left, width: targetWidth };
  }, [anchorRect]);

  const fallbackPosition = useMemo(() => {
    if (anchorRect || !anchor) return null;
    if (typeof window === 'undefined') {
      return { top: anchor.y, left: anchor.x, width: 420 };
    }
    const width = 420;
    const left = clamp(anchor.x - width / 2, 12, window.innerWidth - width - 12);
    const top = clamp(anchor.y - 200, 12, window.innerHeight - 360);
    return { top, left, width };
  }, [anchorRect, anchor]);

  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const isPointerCoarse =
    typeof window !== 'undefined' &&
    !!window.matchMedia &&
    window.matchMedia('(pointer: coarse)').matches;

  const containerStyle =
    anchoredPosition || fallbackPosition
      ? {
        top: (anchoredPosition || fallbackPosition)!.top,
        left: (anchoredPosition || fallbackPosition)!.left,
        width: (anchoredPosition || fallbackPosition)!.width,
        transformOrigin: 'center top',
      }
      : undefined;

  const positionedStyle = useMemo(() => {
    if (containerStyle) return containerStyle;
    if (typeof window === 'undefined') return undefined;
    const width = 420;
    const left = clamp((window.innerWidth - width) / 2, 12, window.innerWidth - width - 12);
    const top = clamp(120, 12, window.innerHeight - 360);
    return { top, left, width, transformOrigin: 'center top' as const };
  }, [containerStyle]);

  const popClasses = isVisible
    ? 'opacity-100 scale-100 translate-y-0'
    : 'opacity-0 scale-[0.98] -translate-y-1';

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
          playPromise.catch(() => { });
        }
      }
      return next;
    });
  };

  const cardContent = (
    <div className="w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden ring-1 ring-black/5">
      <div className="relative w-full aspect-[16/9] bg-slate-900">
        {videoUrl ? (
          <video
            key={item?.id || videoUrl}
            ref={videoRef}
            src={videoUrl}
            poster={poster}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            className="w-full h-full object-cover"
            controls={false}
          />
        ) : (
          <img
            src={poster}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        )}
        {videoUrl ? (
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
          className="absolute top-2 right-2 rounded-full bg-white/85 text-gray-700 hover:bg-white p-1.5 shadow-sm"
          aria-label="Close quick view"
        >
          <XIcon size={18} />
        </button>
      </div>

      <div className="p-4 md:p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            {item.category ? (
              <div className="text-[11px] uppercase tracking-wide font-semibold text-blue-700 mb-1">
                {item.category}
              </div>
            ) : null}
            <h3 className="text-xl font-semibold text-gray-900 leading-snug">
              {item.title}
            </h3>
            {item.provider?.name ? (
              <p className="text-xs font-medium text-gray-500 mt-1">
                {item.provider.name}
              </p>
            ) : null}
            <p className="text-sm text-gray-700 leading-relaxed mt-2">
              {item.description}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onToggleBookmark}
              className={`p-2 rounded-full ${isBookmarked
                ? 'bg-yellow-100 text-yellow-600'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              <BookmarkIcon size={16} className={isBookmarked ? 'fill-yellow-600' : ''} />
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

        <div className="flex items-center justify-between gap-3">
          <CourseMeta duration={item.duration} lessonCount={item.lessonCount} />
          {item.levelTag ? (
            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-amber-50 text-amber-700 whitespace-nowrap">
              {item.levelTag}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            onClick={onViewDetails}
            className="flex-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            View course details
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
    <div className="fixed inset-0 z-[70]" aria-modal="true" role="dialog">
      <div
        className={`absolute inset-0 ${anchorRect ? 'bg-black/0 md:bg-black/0' : 'bg-black/30'} ${isPointerCoarse ? 'bg-black/10' : ''}`}
        onClick={onClose}
      />
      <div
        className={`absolute pointer-events-auto transition-all duration-200 ease-out ${popClasses}`}
        style={positionedStyle}
        onMouseEnter={onHover}
        onMouseLeave={() => {
          if (onLeave) {
            onLeave();
          } else {
            onClose();
          }
        }}
      >
        {cardContent}
      </div>
    </div>,
    document.body
  );
};
