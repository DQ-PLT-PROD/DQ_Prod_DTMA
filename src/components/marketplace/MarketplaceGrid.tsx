import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PromoCard } from "../PromoCard";
import { MarketplaceCard } from "./MarketplaceCard";
import { KnowledgeHubCard } from "./KnowledgeHubCard";
import { MarketplaceQuickViewModal, QuickViewAnchorRect } from "./MarketplaceQuickViewModal";
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

  promoCards?: PromoCardData[];
  onTagClick?: (
    type: string,
    value: string
  ) => void;
}
export const MarketplaceGrid: React.FC<MarketplaceGridProps> = ({
  items,
  marketplaceType,
  bookmarkedItems,
  onToggleBookmark,

  promoCards = [],
  onTagClick,
}) => {
  // Active quick view payload plus the target coordinates captured from the triggering card
  const [quickViewItem, setQuickViewItem] = useState<{
    item: MarketplaceItem;
    anchorRect?: QuickViewAnchorRect | null;
    anchor?: { x: number; y: number };
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
    if (!quickViewItem) return;
    hideQuickViewTimer.current = setTimeout(() => {
      setQuickViewItem(null);
    }, 180);
  };

  const normalizeAnchorRect = (
    anchor?: QuickViewAnchorRect | DOMRect | null
  ): QuickViewAnchorRect | undefined => {
    if (!anchor) return undefined;
    return {
      top: anchor.top,
      left: anchor.left,
      width: anchor.width,
      height: anchor.height,
    };
  };

  const openQuickView = (
    item: MarketplaceItem,
    anchor?: QuickViewAnchorRect | DOMRect | { x: number; y: number } | null
  ) => {
    clearHideTimer();
    const anchorRect =
      anchor && "width" in (anchor as QuickViewAnchorRect | DOMRect)
        ? normalizeAnchorRect(anchor as QuickViewAnchorRect | DOMRect)
        : undefined;
    const anchorPoint =
      anchor && "x" in (anchor as { x: number; y: number })
        ? { x: (anchor as { x: number; y: number }).x, y: (anchor as { x: number; y: number }).y }
        : undefined;
    setQuickViewItem({ item, anchorRect, anchor: anchorPoint });
  };

  const handlePrimaryAction = (item: MarketplaceItem) => {
    if (marketplaceType === "courses") {
      navigate(`/learning?courseId=${encodeURIComponent(item.id)}`);
      return;
    }
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
      <div className="flex justify-between items-end mb-8">
        {/* Responsive header - concise on mobile */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 hidden sm:block mb-1" aria-live="polite">
            Showing {totalItems} {itemLabel}
          </h2>
          <div className="text-sm text-gray-500 hidden sm:block">
            Refine by category, industry, role, or level
          </div>
        </div>
        {/* Mobile-friendly header */}
        <h2 className="text-lg font-medium text-gray-800 sm:hidden" aria-live="polite">
          {totalItems} {itemLabel}
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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
              <MarketplaceCard
                key={`item-${item.id || idx}`}
                item={item}
                marketplaceType={marketplaceType}
                isBookmarked={bookmarkedItems.includes(item.id)}
                onToggleBookmark={() => onToggleBookmark(item.id)}

                onQuickViewOpen={(rect) => openQuickView(item, rect)}
                onQuickViewClose={scheduleHideQuickView}
                onQuickViewHover={clearHideTimer}
                isQuickViewActive={quickViewItem?.item.id === item.id}
                isPointerFine={isPointerFine}
                onTagClick={onTagClick}
              />
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
      {quickViewItem && (
        <MarketplaceQuickViewModal
          item={quickViewItem.item}
          anchorRect={quickViewItem.anchorRect}
          anchor={quickViewItem.anchor}
          marketplaceType={marketplaceType}
          onClose={() => setQuickViewItem(null)}
          onViewDetails={() => {
            setQuickViewItem(null);
            navigate(`/marketplace/${marketplaceType}/${quickViewItem.item.id}`);
          }}
          isBookmarked={bookmarkedItems.includes(quickViewItem.item.id)}
          onToggleBookmark={() => onToggleBookmark(quickViewItem.item.id)}

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
