import * as React from "react";
import { CheckCircleIcon, XIcon, ScaleIcon } from "lucide-react";

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
        bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden
        ${!isFloating ? "" : "shadow-lg"}
      `}
    >
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-lg text-gray-900">
            {config.itemName} Details
          </h3>
          {isFloating && (
            <button
              onClick={onCloseFloating}
              className="p-1 hover:bg-gray-200 rounded transition-colors text-gray-600"
              aria-label="Hide card"
            >
              <XIcon size={16} />
            </button>
          )}
        </div>
      </div>
      <div className="p-4">
        <div className="space-y-2 mb-4">
          {detailItems.map((detail, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{detail.label}:</span>
              <span className="text-sm font-medium text-gray-900">
                {detail.value || "N/A"}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200 pt-4 mb-4">
          <h4 className="text-sm font-medium text-gray-800 mb-3">
            This service includes:
          </h4>
          <ul className="space-y-2">
            {highlights.slice(0, 4).map((highlight, index) => (
              <li key={index} className="flex items-start">
                <CheckCircleIcon
                  size={14}
                  className="text-green-500 mr-2 mt-1 flex-shrink-0"
                />
                <span className="text-sm text-gray-700">{highlight}</span>
              </li>
            ))}
          </ul>
          {highlights.length > 4 && (
            <div className="mt-2 text-xs text-gray-500">
              +{highlights.length - 4} more
            </div>
          )}
        </div>
        <button
          id="action-section"
          onClick={onPrimaryAction}
          className="w-full px-4 py-3 text-white font-bold rounded-md bg-gradient-to-r from-teal-500 via-blue-500 to-purple-600 hover:from-teal-600 hover:via-blue-600 hover:to-purple-700 transition-colors shadow-md mb-3"
        >
          {primaryAction}
        </button>
        <button
          onClick={onAddToComparison}
          className="w-full px-4 py-2.5 text-blue-600 font-medium bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center justify-center"
        >
          <ScaleIcon size={16} className="mr-2" />
          Add to Comparison
        </button>
      </div>
    </div>
  );
};

export default SummaryCard;
