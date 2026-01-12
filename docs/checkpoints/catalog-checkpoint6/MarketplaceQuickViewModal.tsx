import React, { useEffect, useRef } from 'react';
import { Tag } from '../ui/Tag';
import { CourseMeta } from '../ui/CourseMeta';
import { XIcon, BookmarkIcon, ScaleIcon } from 'lucide-react';
import { getMarketplaceConfig } from '../../utils/marketplaceConfig';

interface MarketplaceQuickViewModalProps {
  item: any;
  anchor: { x: number; y: number };
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

export const MarketplaceQuickViewModal: React.FC<MarketplaceQuickViewModalProps> = ({
  item,
  anchor,
  marketplaceType,
  onClose,
  onViewDetails,
  isBookmarked,
  onToggleBookmark,
  onAddToComparison,
  onPrimaryAction,
  onHover,
  onLeave
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const config = getMarketplaceConfig(marketplaceType);
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
    if (video && item.introVideoUrl) {
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

  const displayTags = [
    item.category,
    item.levelTag,
    item.audienceLevel,
    ...(Array.isArray(item.topicTags) ? item.topicTags.slice(0, 1) : []),
  ].filter(Boolean);

  return (
    <div
      className="fixed z-50 w-[360px] md:w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
      style={{ top: anchor.y, left: anchor.x }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div className="relative bg-black">
        {item.introVideoUrl ? (
          <video
            ref={videoRef}
            src={item.introVideoUrl}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-48 object-cover"
            controls
          />
        ) : (
          <img
            src={poster}
            alt={item.title}
            className="w-full h-48 object-cover"
          />
        )}
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
            <h3 className="text-lg font-semibold text-gray-900 leading-snug line-clamp-2">
              {item.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
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
};
