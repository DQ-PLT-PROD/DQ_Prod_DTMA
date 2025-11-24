import * as React from "react";
import { CheckCircleIcon, XIcon, BookmarkIcon } from "lucide-react";

export interface SummaryDetailItem {
  label: string;
  value: string;
}

export interface SummaryCardProps {
  isFloating?: boolean;
  summaryCardRef?: React.RefObject<HTMLDivElement>;
  config: { itemName: string } & Record<string, any>;
  detailItems: SummaryDetailItem[];
  highlights: string[];
  primaryAction: string;
  onAddToComparison: () => void;
  onCloseFloating: () => void;
  onPrimaryAction?: () => void;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  isFloating = false,
  summaryCardRef,
  config,
  detailItems,
  highlights,
  primaryAction,
  onAddToComparison,
  onCloseFloating,
  onPrimaryAction,
}) => {
  return (
    <div
      ref={isFloating ? null : summaryCardRef}
      className={`
        bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300
        ${isFloating
          ? "fixed bottom-4 right-4 z-[60] w-80 shadow-2xl animate-in slide-in-from-bottom-4 fade-in"
          : "sticky top-24 shadow-lg z-30"
        }
      `}
    >
      {/* Header */}
      <div className="bg-gray-50/50 p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-gray-900">
            {isFloating ? config.itemName : "Course Summary"}
          </h3>
          {isFloating && (
            <button
              onClick={onCloseFloating}
              className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
              aria-label="Close summary card"
            >
              <XIcon size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="p-5">
        {/* Primary Action Button */}
        <button
          id="action-section"
          onClick={onPrimaryAction}
          className="w-full px-6 py-3.5 text-white font-bold text-base rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 mb-3"
        >
          {primaryAction}
        </button>

        {/* Add to Later Button (Secondary) */}
        <button
          onClick={onAddToComparison} // Using this for now as per request, but ideally should be a separate prop or reused
          className="w-full px-4 py-2.5 text-gray-600 font-medium bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center justify-center text-sm mb-6"
        >
          <BookmarkIcon size={16} className="mr-2" />
          Add to Later
        </button>

        {/* Details List */}
        <div className="space-y-3 mb-6">
          {detailItems.map((detail, index) => (
            <div key={index} className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-500">{detail.label}</span>
              <span className="text-sm font-semibold text-gray-900">
                {detail.value || "N/A"}
              </span>
            </div>
          ))}
        </div>

        {/* Highlights Section */}
        {highlights.length > 0 && (
          <div className="bg-blue-50/50 rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-3">
              This course includes:
            </h4>
            <ul className="space-y-2.5">
              {highlights.slice(0, 5).map((highlight, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircleIcon
                    size={16}
                    className="text-blue-600 mr-2.5 mt-0.5 flex-shrink-0"
                  />
                  <span className="text-sm text-gray-700 leading-snug">{highlight}</span>
                </li>
              ))}
            </ul>
            {highlights.length > 5 && (
              <div className="mt-3 pl-6 text-xs font-medium text-blue-600">
                +{highlights.length - 5} more items
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryCard;
