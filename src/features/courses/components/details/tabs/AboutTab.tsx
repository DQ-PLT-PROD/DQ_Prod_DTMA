import React, { useMemo, useState } from "react";

interface AboutTabProps {
  itemDescription: string;
  item: any;
  config: { itemName: string } & Record<string, any>;
  highlights: string[];
}

const AboutTab: React.FC<AboutTabProps> = ({
  itemDescription,
  item,
  config,
  highlights,
}) => {
  // Normalize highlights: trim, dedupe, drop empties
  const normalizedHighlights = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const h of highlights || []) {
      const s = typeof h === "string" ? h.trim() : "";
      if (s && !seen.has(s.toLowerCase())) {
        seen.add(s.toLowerCase());
        out.push(s);
      }
    }
    return out;
  }, [highlights]);
  const [expanded, setExpanded] = useState(false);
  const visibleHighlights = expanded
    ? normalizedHighlights
    : normalizedHighlights.slice(0, 6);
  return (
    <div className="space-y-6">
      <p className="text-gray-600 text-lg mb-6">
        Learn more about this {config.itemName.toLowerCase()} and what it offers
        for your business.
      </p>
      <div className="prose max-w-none">
        <p className="text-gray-700 mb-5">{itemDescription}</p>
      </div>
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Key Highlights</h3>
        <ul className="space-y-2">
          {visibleHighlights.map((highlight, index) => (
            <li key={index} className="flex items-start">
              <span className="text-green-500 mr-3 mt-1">•</span>
              <span className="text-gray-700">{highlight}</span>
            </li>
          ))}
        </ul>
        {normalizedHighlights.length > 6 && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {expanded
              ? "Show less"
              : `Show ${normalizedHighlights.length - 6} more`}
          </button>
        )}
      </div>
    </div>
  );
};

export default AboutTab;
