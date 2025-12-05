import { useState } from "react";
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
}
export const MarketplaceGrid: React.FC<MarketplaceGridProps> = ({
  items,
  marketplaceType,
  bookmarkedItems,
  onToggleBookmark,
  onAddToComparison,
  promoCards = [],
}) => {
  const [quickViewItem, setQuickViewItem] = useState<MarketplaceItem | null>(
    null
  );
  const navigate = useNavigate();
  // Use fallback items if no items are provided or if items array is empty
  const displayItems =
    items && items.length > 0 ? items : getFallbackItems(marketplaceType);
  const totalItems = displayItems.length;
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
          Available Items ({totalItems})
        </h2>
        <div className="text-sm text-gray-500 hidden sm:block">
          Showing {totalItems} of {totalItems} items
        </div>
        {/* Mobile-friendly header */}
        <h2 className="text-lg font-medium text-gray-800 sm:hidden">
          {totalItems} Items Available
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
                  onQuickView={() => setQuickViewItem(item)}
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
                onAddToComparison={() => onAddToComparison(item)}
                onQuickView={() => setQuickViewItem(item)}
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
      {/* Quick View Modal */}
      {quickViewItem && (
        <MarketplaceQuickViewModal
          item={quickViewItem}
          marketplaceType={marketplaceType}
          onClose={() => setQuickViewItem(null)}
          onViewDetails={() => {
            setQuickViewItem(null);
            navigate(`/marketplace/${marketplaceType}/${quickViewItem.id}`);
          }}
          isBookmarked={bookmarkedItems.includes(quickViewItem.id)}
          onToggleBookmark={() => onToggleBookmark(quickViewItem.id)}
          onAddToComparison={() => {
            onAddToComparison(quickViewItem);
            setQuickViewItem(null);
          }}
        />
      )}
    </div>
  );
};
