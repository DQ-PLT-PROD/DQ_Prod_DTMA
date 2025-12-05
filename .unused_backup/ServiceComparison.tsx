import React, { useEffect, useRef, useState } from "react";
import { ServiceItem } from "../../types/marketplace";
import { XIcon, Check, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getMarketplaceConfig } from "../../utils/marketplaceConfig";
interface ServiceComparisonProps {
  services: ServiceItem[];
  onClose: () => void;
  onRemoveService: (serviceId: string) => void;
  comparisonCategories: {
    name: string;
    key: string;
    optional?: boolean;
  }[];
  marketplaceType: string;
}
export const ServiceComparison: React.FC<ServiceComparisonProps> = ({
  services,
  onClose,
  onRemoveService,
  comparisonCategories,
  marketplaceType,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const config = getMarketplaceConfig(marketplaceType as any);
  const [showTip, setShowTip] = useState(false);
  // Limit to confirmed rows and provide defaults if missing
  const displayCategories = [
    { name: "Benefit", key: "description" },
    { name: "Customer Type", key: "CustomerType" },
    { name: "Business Stage", key: "BusinessStage" },
    { name: "Nationality", key: "Nationality" },
    { name: "Processing Time", key: "ProcessingTime" },
  ];
  const getFieldValue = (service: any, key: string) => {
    if (key === "description") {
      return (
        service[key] ||
        "Through this service, Entrepreneurs can obtain official support letters to strengthen their business credibility with government and private sector entities."
      );
    }
    if (service[key]) return service[key];
    switch (key) {
      case "CustomerType":
        return "Entrepreneurs";
      case "BusinessStage":
        return "Scale Up";
      case "Nationality":
        return "UAE National / Emirati";
      case "ProcessingTime":
        return "1 Working Day";
      default:
        return "";
    }
  };
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
  // Get title based on marketplace type
  const getComparisonTitle = () => {
    switch (marketplaceType) {
      case "courses":
        return "Course Comparison";
      case "financial":
        return "Financial Service Comparison";
      case "non-financial":
        return "Service Comparison";
      default:
        return "Item Comparison";
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
            {getComparisonTitle()}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1"
            aria-label="Close comparison"
          >
            <XIcon size={24} />
          </button>
        </div>
        <div className="p-3 sm:p-6">
          {services.length === 0 ? (
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
                {/* Service headers - scrollable on mobile */}
                <div className="overflow-x-auto pb-4">
                  <div className="flex min-w-max">
                    <div className="w-32 flex-shrink-0">
                      <div className="h-24 flex items-end">
                        <h3 className="text-base font-semibold text-gray-700">
                          Item Details
                        </h3>
                      </div>
                    </div>
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="w-56 flex-shrink-0 relative px-2"
                      >
                        <button
                          onClick={() => onRemoveService(service.id)}
                          className="absolute top-0 right-0 p-1 text-gray-400 hover:text-gray-600"
                          aria-label="Remove from comparison"
                        >
                          <XIcon size={16} />
                        </button>
                        <div className="flex flex-col items-center mb-2">
                          <img
                            src={service.provider.logoUrl}
                            alt={service.provider.name}
                            className="h-12 w-12 object-contain mb-2"
                          />
                          <span className="text-sm text-gray-500">
                            {service.provider.name}
                          </span>
                        </div>
                        <h4 className="text-center font-medium text-gray-900 text-sm">
                          {service.title}
                        </h4>
                      </div>
                    ))}
                    {Array(3 - services.length)
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
                  {displayCategories.map((category) => (
                    <div
                      key={category.key}
                      className="pb-3 border-t border-gray-100 pt-3"
                    >
                      <div className="font-medium text-gray-700 mb-2 sticky left-0 bg-white">
                        {category.name}
                      </div>
                      <div className="flex min-w-max">
                        {services.map((service) => (
                          <div
                            key={`${service.id}-${category.key}`}
                            className="w-56 px-2"
                          >
                            {category.key === "description" ? (
                              <p className="text-sm text-gray-700 text-left">
                                {getFieldValue(service, category.key)
                                  .toString()
                                  .substring(0, 140)}
                                {getFieldValue(service, category.key)
                                  .toString().length > 140
                                  ? "..."
                                  : ""}
                              </p>
                            ) : (
                              <span className="text-gray-900">
                                {getFieldValue(service, category.key)}
                              </span>
                            )}
                          </div>
                        ))}
                        {Array(3 - services.length)
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
                </div>
              </div>
              {/* Desktop View - Grid layout for larger screens */}
              <div className="hidden sm:block">
                {/* Service headers */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="col-span-1">
                    <div className="h-24 flex items-end">
                      <h3 className="text-lg font-semibold text-gray-700">
                        Item Details
                      </h3>
                    </div>
                  </div>
                  {services.map((service) => (
                    <div key={service.id} className="col-span-1 relative">
                      <button
                        onClick={() => onRemoveService(service.id)}
                        className="absolute top-0 right-0 p-1 text-gray-400 hover:text-gray-600"
                        aria-label="Remove from comparison"
                      >
                        <XIcon size={16} />
                      </button>
                      <div className="flex flex-col items-center mb-2">
                        <img
                          src={service.provider.logoUrl}
                          alt={service.provider.name}
                          className="h-12 w-12 object-contain mb-2"
                        />
                        <span className="text-sm text-gray-500">
                          {service.provider.name}
                        </span>
                      </div>
                      <h4 className="text-center font-medium text-gray-900">
                        {service.title}
                      </h4>
                    </div>
                  ))}
                  {Array(3 - services.length)
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
                  {displayCategories.map((category) => (
                    <div
                      key={category.key}
                      className="grid grid-cols-4 gap-4 py-3 border-t border-gray-100"
                    >
                      <div className="col-span-1 font-medium text-gray-700">
                        {category.name}
                      </div>
                      {services.map((service) => (
                        <div
                          key={`${service.id}-${category.key}`}
                          className="col-span-1 text-center"
                        >
                          {category.key === "description" ? (
                            <p className="text-sm text-gray-700 text-left">
                              {getFieldValue(service, category.key)
                                .toString()
                                .substring(0, 140)}
                              {getFieldValue(service, category.key)
                                .toString().length > 140
                                ? "..."
                                : ""}
                            </p>
                          ) : (
                            <span className="text-gray-900">
                              {getFieldValue(service, category.key)}
                            </span>
                          )}
                        </div>
                      ))}
                      {Array(3 - services.length)
                        .fill(0)
                        .map((_, index) => (
                          <div
                            key={`empty-${category.key}-${index}`}
                            className="col-span-1"
                          />
                        ))}
                    </div>
                  ))}
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
      {/* Small tip modal */}
      {showTip && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select another service</h3>
            <p className="text-sm text-gray-600 mb-4">You can now browse the marketplace to add up to 2 more services for comparison.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowTip(false)} className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
              <button onClick={() => { setShowTip(false); navigate(config.route); }} className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">Go to {config.itemNamePlural}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
