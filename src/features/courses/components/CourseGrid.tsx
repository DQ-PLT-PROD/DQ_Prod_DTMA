import { useEffect, useState } from "react";
import { PromoCard } from "../../../components/PromoCard";
import { CourseTile } from "./CourseTile";

export interface CourseItem {
  id: string;
  title: string;
  description: string;
  [key: string]: any;
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
interface CourseGridProps {
  items: CourseItem[];
  bookmarkedItems: string[];
  onToggleBookmark: (itemId: string) => void;
  promoCards?: PromoCardData[];
  onTagClick?: (type: string, value: string) => void;
}
export const CourseGrid: React.FC<CourseGridProps> = ({
  items,
  bookmarkedItems,
  onToggleBookmark,
  promoCards = [],
  onTagClick,
}) => {
  const [isPointerFine, setIsPointerFine] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setIsPointerFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);



  // Use items passed in directly - no fallback data
  const displayItems = items || [];
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
      <div className="flex justify-between items-end mb-8">
        {/* Responsive header - concise on mobile */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 hidden sm:block mb-1" aria-live="polite">
            Showing {totalItems} Courses
          </h2>
          <div className="text-sm text-gray-500 hidden sm:block">
            Refine by category, industry, role, or level
          </div>
        </div>
        {/* Mobile-friendly header */}
        <h2 className="text-lg font-medium text-gray-800 sm:hidden" aria-live="polite">
          {totalItems} Courses
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {itemsWithPromos.map((entry, idx) => {
          if (entry.type === "item") {
            const item = entry.data as CourseItem;
            return (
              <CourseTile
                key={`item-${item.id || idx}`}
                item={item}
                enableHoverEffects={isPointerFine}
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
    </div>
  );
};
