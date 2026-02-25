import React from "react";
import { BellIcon, ExternalLinkIcon } from "lucide-react";

interface AnnouncementsProps {
  isLoading: boolean;
  onViewAllClick?: () => void;
}
// Mock announcements data
const announcements = [
  {
    id: 1,
    title: "New Funding Opportunities Available",
    date: "2025-11-20",
    description:
      "Check out the new funding programs for small businesses in the technology sector.",
    link: "#",
  },
  {
    id: 2,
    title: "System Maintenance Notice",
    date: "2025-11-25",
    description:
      "The portal will be unavailable on November 25th from 22:00-23:00 for scheduled maintenance.",
    link: "#",
  },
  {
    id: 3,
    title: "Updated Business Registration Process",
    date: "2025-11-15",
    description:
      "We have simplified the business registration process. Learn about the changes.",
    link: "#",
  },
];
export const Announcements: React.FC<AnnouncementsProps> = ({
  isLoading,
  onViewAllClick,
}) => {
  const handleViewAllClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onViewAllClick?.();
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-24 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {announcements.map((announcement) => (
        <div
          key={announcement.id}
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-200 transition-colors"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <BellIcon className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {announcement.title}
              </p>
              <p className="text-xs text-gray-500 mt-1">{announcement.date}</p>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {announcement.description}
              </p>
              <a
                href={announcement.link}
                className="mt-2 inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                Read more
                <ExternalLinkIcon className="ml-1 h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      ))}
      <div className="pt-2 text-center">
        <button
          onClick={handleViewAllClick}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          View All Announcements
        </button>
      </div>
    </div>
  );
};
