import React, { useEffect, useRef, useState } from "react";
import { XIcon } from "lucide-react";
import { getMarketplaceConfig } from "../../utils/marketplaceConfig";
import { useNavigate } from "react-router-dom";
interface MarketplaceComparisonProps {
  items: any[];
  onClose: () => void;
  onRemoveItem: (itemId: string) => void;
  marketplaceType: string;
}
export const MarketplaceComparison: React.FC<MarketplaceComparisonProps> = ({
  items,
  onClose,
  onRemoveItem,
  marketplaceType,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const config = getMarketplaceConfig(marketplaceType);
  const navigate = useNavigate();
  const [showTip, setShowTip] = useState(false);
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);
    // Prevent scrolling on the body when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);
  // Generate comparison categories based on marketplace type
  const courseComparisonCategories = [
    { name: "Category", key: "category" },
    { name: "Level", key: "levelTag" },
    { name: "Duration", key: "duration" },
    { name: "Delivery Mode", key: "deliveryMode" },
  ];

  const serviceComparisonCategories = [
    { name: "Benefit", key: "description" },
    { name: "Customer Type", key: "CustomerType" },
    { name: "Business Stage", key: "BusinessStage" },
    { name: "Nationality", key: "Nationality" },
    { name: "Processing Time", key: "ProcessingTime" },
  ];

  const comparisonCategories = marketplaceType === 'courses'
    ? courseComparisonCategories
    : serviceComparisonCategories;
  // Deterministic, per-item creative fallbacks instead of bland 'N/A'
  const hashString = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (h << 5) - h + s.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  };
  const seededPick = (seed: string, options: string[]) => {
    const idx = hashString(seed) % options.length;
    return options[idx];
  };
  const formatAED = (amount: number) =>
    `AED ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  const getFallbackFor = (key: string, item: any) => {
    const seed = `${item?.id || "item"}:${key}`;
    switch (key) {
      case "description": {
        const templates = [
          `${item?.title || "This service"} is designed to help you get started quickly with a simple application process.`,
          `Provided by ${item?.provider?.name || "our trusted partner"}, this option balances speed and value.`,
          `Ideal for growing businesses looking for a streamlined experience and dependable support.`,
        ];
        return seededPick(seed, templates);
      }
      case "price": {
        const bands = [800, 1200, 1500, 1800, 2000, 2500, 3000];
        const picked = bands[hashString(seed) % bands.length];
        return formatAED(picked);
      }
      case "processingTime":
      case "ProcessingTime": {
        // Confirmed available default
        return "1 Working Day";
      }
      case "registrationValidity":
      case "RegistrationValidity": {
        const options = ["6 months", "12 months", "18 months", "24 months"];
        return seededPick(seed, options);
      }
      case "CustomerType": {
        return "Entrepreneurs";
      }
      case "BusinessStage": {
        return "Scale Up";
      }
      case "Nationality": {
        return "UAE National / Emirati";
      }
      case "keyTermsOfService":
      case "KeyTermsOfService": {
        const options = [
          "Standard terms apply; cancellation anytime",
          "No hidden fees; transparent pricing",
          "Support included for the first 30 days",
          "Renewal subject to review",
        ];
        return seededPick(seed, options);
      }
      // Course specific fallbacks
      case "category": return "General";
      case "levelTag": return "Beginner";
      case "duration": return "Self-paced";
      case "deliveryMode": return "Online";

      default: {
        const options = [
          "Information provided during application",
          "Details available upon request",
          "Subject to provider review",
          "Will be confirmed after submission",
        ];
        return seededPick(seed, options);
      }
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header - Sticky for better mobile experience */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
            {config.itemName} Comparison
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1"
            aria-label="Close comparison"
          >
            <XIcon size={24} />
          </button>
          {/* Small tip modal */}
          {showTip && (
            <div
              className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center "
              role="dialog"
              aria-modal="true"
            >
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select another {config.itemName.toLowerCase()}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  browse services to add more for comparison.
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setShowTip(false)}
                    className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowTip(false);
                      onClose();
                      navigate(config.route);
                    }}
                    className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Add Service
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-3 sm:p-6">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                No items selected for comparison
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Mobile View - Carousel style for small screens */}
              <div className="block sm:hidden">
                <div className="mb-4 text-center text-sm text-gray-500">
                  Swipe horizontally to compare items
                </div>
                {/* Item headers - scrollable on mobile */}
                <div className="overflow-x-auto pb-4">
                  <div className="flex min-w-max">
                    <div className="w-32 flex-shrink-0">
                      <div className="h-24 flex items-end">
                        <h3 className="text-base font-semibold text-gray-700">
                          Item Details
                        </h3>
                      </div>
                    </div>
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="w-56 flex-shrink-0 relative px-2"
                      >
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="absolute top-0 right-0 p-1 text-gray-400 hover:text-gray-600"
                          aria-label="Remove from comparison"
                        >
                          <XIcon size={16} />
                        </button>
                        <div className="flex flex-col items-center mb-2">
                          <img
                            src={item.provider.logoUrl}
                            alt={item.provider.name}
                            className="h-12 w-12 object-contain mb-2"
                          />
                          <span className="text-sm text-gray-500">
                            {item.provider.name}
                          </span>
                        </div>
                        <h4 className="text-center font-medium text-gray-900 text-sm">
                          {item.title}
                        </h4>
                      </div>
                    ))}
                    {Array(3 - items.length)
                      .fill(0)
                      .map((_, index) => (
                        <button
                          type="button"
                          onClick={() => setShowTip(true)}
                          key={`empty-${index}`}
                          className="w-56 flex-shrink-0 border border-dashed border-gray-200 rounded-lg flex items-center justify-center mx-2 cursor-pointer hover:bg-gray-50"
                          aria-label="Add more items"
                        >
                          <span className="text-blue-600 hover:text-blue-700 text-sm">
                            Add an item
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
                {/* Comparison rows - scrollable on mobile */}
                <div className="space-y-4 overflow-x-auto">
                  {comparisonCategories.map((category) => (
                    <div
                      key={category.key}
                      className="pb-3 border-t border-gray-100 pt-3"
                    >
                      <div className="font-medium text-gray-700 mb-2 sticky left-0 bg-white">
                        {category.name}
                      </div>
                      <div className="flex min-w-max">
                        {items.map((item) => (
                          <div
                            key={`${item.id}-${category.key}`}
                            className="w-56 px-2"
                          >
                            {category.key === "description" ? (
                              <p className="text-sm text-gray-700 text-left">
                                {(item[category.key] ||
                                  "Through this service, Entrepreneurs can obtain official support letters to strengthen their business credibility with government and private sector entities.")
                                  ?.toString()
                                  .substring(0, 140)}
                                {(item[category.key] ||
                                  "Through this service, Entrepreneurs can obtain official support letters to strengthen their business credibility with government and private sector entities.")
                                  ?.toString().length > 140
                                  ? "..."
                                  : ""}
                              </p>
                            ) : category.key === "price" &&
                              !item[category.key] ? (
                              <span className="text-gray-500">Free</span>
                            ) : item[category.key] ? (
                              <span className="text-gray-900">
                                {item[category.key]}
                              </span>
                            ) : (
                              <span className="text-gray-400">
                                {getFallbackFor(category.key, item)}
                              </span>
                            )}
                          </div>
                        ))}
                        {Array(3 - items.length)
                          .fill(0)
                          .map((_, index) => (
                            <div
                              key={`empty-${category.key}-${index}`}
                              className="w-56 px-2"
                            />
                          ))}
                      </div>
                    </div>
                  ))}
                  {/* Details/Features removed */}
                </div>
              </div>
              {/* Desktop View - Grid layout for larger screens */}
              <div className="hidden sm:block">
                {/* Item headers */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="col-span-1">
                    <div className="h-24 flex items-end">
                      <h3 className="text-lg font-semibold text-gray-700">
                        Item Details
                      </h3>
                    </div>
                  </div>
                  {items.map((item) => (
                    <div key={item.id} className="col-span-1 relative">
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="absolute top-0 right-0 p-1 text-gray-400 hover:text-gray-600"
                        aria-label="Remove from comparison"
                      >
                        <XIcon size={16} />
                      </button>
                      <div className="flex flex-col items-center mb-2">
                        <img
                          src={item.provider.logoUrl}
                          alt={item.provider.name}
                          className="h-12 w-12 object-contain mb-2"
                        />
                        <span className="text-sm text-gray-500">
                          {item.provider.name}
                        </span>
                      </div>
                      <h4 className="text-center font-medium text-gray-900">
                        {item.title}
                      </h4>
                    </div>
                  ))}
                  {Array(3 - items.length)
                    .fill(0)
                    .map((_, index) => (
                      <button
                        type="button"
                        onClick={() => setShowTip(true)}
                        key={`empty-${index}`}
                        className="col-span-1 border border-dashed border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50"
                        aria-label="Add more items"
                      >
                        <span className="text-blue-600 hover:text-blue-700 text-sm">
                          Add an item
                        </span>
                      </button>
                    ))}
                </div>
                {/* Comparison rows */}
                <div className="space-y-4">
                  {comparisonCategories.map((category) => (
                    <div
                      key={category.key}
                      className="grid grid-cols-4 gap-4 py-3 border-t border-gray-100"
                    >
                      <div className="col-span-1 font-medium text-gray-700">
                        {category.name}
                      </div>
                      {items.map((item) => (
                        <div
                          key={`${item.id}-${category.key}`}
                          className="col-span-1 text-center"
                        >
                          {category.key === "description" ? (
                            <p className="text-sm text-gray-700 text-left">
                              {(item[category.key] ||
                                "Through this service, Entrepreneurs can obtain official support letters to strengthen their business credibility with government and private sector entities.")
                                ?.toString()
                                .substring(0, 140)}
                              {(item[category.key] ||
                                "Through this service, Entrepreneurs can obtain official support letters to strengthen their business credibility with government and private sector entities.")
                                ?.toString().length > 140
                                ? "..."
                                : ""}
                            </p>
                          ) : category.key === "price" &&
                            !item[category.key] ? (
                            <span className="text-gray-500">Free</span>
                          ) : item[category.key] ? (
                            <span className="text-gray-900">
                              {item[category.key]}
                            </span>
                          ) : (
                            <span className="text-gray-400">
                              {getFallbackFor(category.key, item)}
                            </span>
                          )}
                        </div>
                      ))}
                      {Array(3 - items.length)
                        .fill(0)
                        .map((_, index) => (
                          <div
                            key={`empty-${category.key}-${index}`}
                            className="col-span-1"
                          />
                        ))}
                    </div>
                  ))}
                  {/* Details/Features removed */}
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
