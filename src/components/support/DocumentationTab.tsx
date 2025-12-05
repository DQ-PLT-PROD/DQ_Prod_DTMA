import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  SearchIcon,
  BookOpenIcon,
  FileTextIcon,
  VideoIcon,
  ExternalLinkIcon,
} from "lucide-react";
// Documentation categories and resources
const documentationCategories = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: BookOpenIcon,
    resources: [
      {
        id: "r1",
        title: "Platform Overview",
        description:
          "Learn about the key features and capabilities of our platform.",
        type: "guide",
        url: "/coming-soon/documentation",
      },
      {
        id: "r2",
        title: "Quick Start Guide",
        description:
          "Get up and running with our platform in less than 10 minutes.",
        type: "guide",
        url: "/coming-soon/documentation",
      },
      {
        id: "r3",
        title: "Onboarding Video Tutorial",
        description: "Watch this comprehensive video guide to get started.",
        type: "video",
        url: "/coming-soon/documentation",
        duration: "8:24",
      },
    ],
  },
  {
    id: "user-guides",
    title: "User Guides",
    icon: FileTextIcon,
    resources: [
      {
        id: "r4",
        title: "Dashboard Navigation",
        description: "Learn how to effectively navigate and use the dashboard.",
        type: "guide",
        url: "/coming-soon/documentation",
      },
      {
        id: "r5",
        title: "User Management Guide",
        description: "Comprehensive guide to managing users and permissions.",
        type: "guide",
        url: "/coming-soon/documentation",
      },
      {
        id: "r6",
        title: "Data Import and Export",
        description: "Learn how to import and export data in various formats.",
        type: "guide",
        url: "/coming-soon/documentation",
      },
    ],
  },
  {
    id: "video-tutorials",
    title: "Video Tutorials",
    icon: VideoIcon,
    resources: [
      {
        id: "r7",
        title: "Advanced Features Walkthrough",
        description: "Discover the advanced features of our platform.",
        type: "video",
        url: "/coming-soon/documentation",
        duration: "15:30",
      },
      {
        id: "r8",
        title: "Reporting and Analytics Tutorial",
        description: "Learn how to generate and interpret reports.",
        type: "video",
        url: "/coming-soon/documentation",
        duration: "12:45",
      },
      {
        id: "r9",
        title: "Automation and Workflows",
        description:
          "Set up automated workflows to save time and reduce errors.",
        type: "video",
        url: "/coming-soon/documentation",
        duration: "10:15",
      },
    ],
  },
];
export default function DocumentationTab() {
  const [searchQuery, setSearchQuery] = useState("");
  // Filter resources based on search query
  const filteredCategories = searchQuery
    ? documentationCategories
        .map((category) => ({
          ...category,
          resources: category.resources.filter(
            (resource) =>
              resource.title
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              resource.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((category) => category.resources.length > 0)
    : documentationCategories;
  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Search documentation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {/* Documentation Categories */}
      {filteredCategories.length > 0 ? (
        filteredCategories.map((category) => (
          <div
            key={category.id}
            className="bg-white border border-gray-200 rounded-md overflow-hidden"
          >
            <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-gray-50">
              <category.icon className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                {category.title}
              </h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {category.resources.map((resource) => (
                  <Link
                    key={resource.id}
                    to={resource.url}
                    className="block border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between">
                      <h4 className="text-base font-medium text-blue-600">
                        {resource.title}
                      </h4>
                      {resource.type === "video" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          {resource.duration}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {resource.description}
                    </p>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      {resource.type === "guide" ? (
                        <FileTextIcon className="h-4 w-4 mr-1" />
                      ) : (
                        <VideoIcon className="h-4 w-4 mr-1" />
                      )}
                      <span className="capitalize">{resource.type}</span>
                      <ExternalLinkIcon className="h-4 w-4 ml-2" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg">
            No documentation matches your search criteria.
          </p>
          <p className="text-gray-400 mt-2">
            Try using different keywords or browse all categories.
          </p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => setSearchQuery("")}
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
}
