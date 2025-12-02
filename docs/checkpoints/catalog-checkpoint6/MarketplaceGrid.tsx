import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PromoCard } from "../PromoCard";
import { MarketplaceCard } from "./MarketplaceCard";
import { KnowledgeHubCard } from "./KnowledgeHubCard";
import { MarketplaceQuickViewModal } from "./MarketplaceQuickViewModal";
import { getFallbackItems } from "../../utils/fallbackData";
export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  provider: {
    name: string;
    logoUrl: string;
    description: string;
  };
  [key: string]: any; // For additional fields specific to each marketplace type
}
interface PromoCardData {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  gradientFrom: string;
  gradientTo: string;
}
interface MarketplaceGridProps {
  items: MarketplaceItem[];
  marketplaceType: string;
  bookmarkedItems: string[];
  onToggleBookmark: (itemId: string) => void;
  onAddToComparison: (item: MarketplaceItem) => void;
  promoCards?: PromoCardData[];
  onTagClick?: (
    type: "category" | "audienceLevel" | "levelTag" | "deliveryMode" | "topic",
    value: string
  ) => void;
}
export const MarketplaceGrid: React.FC<MarketplaceGridProps> = ({
  items,
  marketplaceType,
  bookmarkedItems,
  onToggleBookmark,
  onAddToComparison,
  promoCards = [],
  onTagClick,
}) => {
  const [quickViewItem, setQuickViewItem] = useState<{
    item: MarketplaceItem;
    anchor: { x: number; y: number };
  } | null>(null);
  const hideQuickViewTimer = useRef<NodeJS.Timeout | null>(null);
  const [isPointerFine, setIsPointerFine] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setIsPointerFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const clearHideTimer = () => {
    if (hideQuickViewTimer.current) {
      clearTimeout(hideQuickViewTimer.current);
      hideQuickViewTimer.current = null;
    }
  };

  const scheduleHideQuickView = () => {
    clearHideTimer();
    hideQuickViewTimer.current = setTimeout(() => {
      setQuickViewItem(null);
    }, 180);
  };

  const openQuickView = (
    item: MarketplaceItem,
    anchor: { x: number; y: number }
  ) => {
    clearHideTimer();
    const top = Math.max(20, anchor.y);
    const clampedLeft = Math.max(
      12,
      Math.min(anchor.x, window.innerWidth - 420)
    );
    setQuickViewItem({ item, anchor: { x: clampedLeft, y: top } });
  };

  const handlePrimaryAction = (item: MarketplaceItem) => {
    const effectiveUrl = item.formUrl || "https://www.tamm.abudhabi/en/login";
    if (effectiveUrl.startsWith("http")) {
      window.open(effectiveUrl, "_blank", "noopener,noreferrer");
      return;
    }
    const targetUrl = effectiveUrl.startsWith("/forms/")
      ? effectiveUrl
      : `/forms/${effectiveUrl.replace(/^\/+/, "")}`;
    navigate(targetUrl);
  };
  // Use fallback items if no items are provided or if items array is empty
  const displayItems =
    items && items.length > 0 ? items : getFallbackItems(marketplaceType);
  const totalItems = displayItems.length;
  const itemLabel = marketplaceType === "courses" ? "Courses" : "Items";
  if (totalItems === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          No items found
        </h3>
        <p className="text-gray-500">
          Try adjusting your filters or search criteria
        </p>
      </div>
    );
  }
  // Insert promo cards after every 6 regular items
  const itemsWithPromos = displayItems.reduce(
    (acc, item, index) => {
      acc.push({
        type: "item",
        data: item,
      });
      // Insert a promo card after every 6 items
      if (
        (index + 1) % 6 === 0 &&
        promoCards.length > 0 &&
        promoCards[Math.floor(index / 6) % promoCards.length]
      ) {
        const promoIndex = Math.floor(index / 6) % promoCards.length;
        acc.push({
          type: "promo",
          data: promoCards[promoIndex],
        });
      }
      return acc;
    },
    [] as Array<{
      type: "item" | "promo";
      data: any;
    }>
  );
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        {/* Responsive header - concise on mobile */}
        <h2 className="text-xl font-semibold text-gray-800 hidden sm:block">
          Showing {totalItems} {itemLabel}
        </h2>
        <div className="text-sm text-gray-500 hidden sm:block">
          Refine by 6XD dimension, role, level, or tags
        </div>
        {/* Mobile-friendly header */}
        <h2 className="text-lg font-medium text-gray-800 sm:hidden">
          {totalItems} {itemLabel}
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {itemsWithPromos.map((entry, idx) => {
          if (entry.type === "item") {
            const item = entry.data as MarketplaceItem;
            // Use KnowledgeHubCard for knowledge-hub marketplace type
            if (marketplaceType === "knowledge-hub") {
              return (
                <KnowledgeHubCard
                  key={`item-${item.id || idx}`}
                  item={item}
                  isBookmarked={bookmarkedItems.includes(item.id)}
                  onToggleBookmark={() => onToggleBookmark(item.id)}
                  onAddToComparison={() => onAddToComparison(item)}
                  onQuickView={() =>
                    openQuickView(item, {
                      x: window.innerWidth / 2 - 180,
                      y: window.scrollY + 160,
                    })
                  }
                />
              );
            }
            // Use standard MarketplaceCard for other marketplace types
            return (
              <div
                key={`item-${item.id || idx}`}
                onMouseEnter={(e) => {
                  if (!isPointerFine) return;
                  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                  openQuickView(item, {
                    x: rect.right + 12,
                    y: rect.top + window.scrollY,
                  });
                }}
                onMouseLeave={isPointerFine ? scheduleHideQuickView : undefined}
                onClick={(e) => {
                  if (isPointerFine) return;
                  e.stopPropagation();
                  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                  openQuickView(item, {
                    x: rect.right + 12,
                    y: rect.top + window.scrollY,
                  });
                }}
              >
                <MarketplaceCard
                  item={item}
                  marketplaceType={marketplaceType}
                  isBookmarked={bookmarkedItems.includes(item.id)}
                  onToggleBookmark={() => onToggleBookmark(item.id)}
                  onAddToComparison={() => onAddToComparison(item)}
                  onQuickView={() =>
                    openQuickView(item, {
                      x: window.innerWidth / 2 - 180,
                      y: window.scrollY + 160,
                    })
                  }
                  onTagClick={onTagClick}
                />
              </div>
            );
          } else if (entry.type === "promo") {
            const promo = entry.data as PromoCardData;
            return (
              <PromoCard
                key={`promo-${promo.id || idx}-${idx}`}
                title={promo.title}
                description={promo.description}
                icon={promo.icon}
                path={promo.path}
                gradientFrom={promo.gradientFrom || "from-blue-500"}
                gradientTo={promo.gradientTo || "to-purple-600"}
              />
            );
          }
          return null;
        })}
      </div>
      {/* Quick View Modal */}
      {quickViewItem && !isPointerFine && (
        <div
          className="fixed inset-0 z-40 bg-black/10"
          onClick={() => setQuickViewItem(null)}
        />
      )}
      {quickViewItem && (
        <MarketplaceQuickViewModal
          item={quickViewItem.item}
          anchor={quickViewItem.anchor}
          marketplaceType={marketplaceType}
          onClose={() => setQuickViewItem(null)}
          onViewDetails={() => {
            setQuickViewItem(null);
            navigate(`/marketplace/${marketplaceType}/${quickViewItem.item.id}`);
          }}
          isBookmarked={bookmarkedItems.includes(quickViewItem.item.id)}
          onToggleBookmark={() => onToggleBookmark(quickViewItem.item.id)}
          onAddToComparison={() => {
            onAddToComparison(quickViewItem.item);
            setQuickViewItem(null);
          }}
          onPrimaryAction={() => {
            handlePrimaryAction(quickViewItem.item);
            setQuickViewItem(null);
          }}
          onHover={() => clearHideTimer()}
          onLeave={scheduleHideQuickView}
        />
      )}
    </div>
  );
};
