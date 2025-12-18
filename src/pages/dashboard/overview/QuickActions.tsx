import React from "react";
import {
  FileTextIcon,
  ClipboardListIcon,
  HelpCircleIcon,
} from "lucide-react";

import { Link } from "react-router-dom";

export const QuickActions: React.FC = () => {
  // Handle navigation to home page services section with scrolling
  const handleCreateRequest = (e: React.MouseEvent) => {
    e.preventDefault();
    // Use hash navigation for better reliability
    window.location.href = '/#services-marketplaces';
  };

  const actions = [
    {
      id: "submit-request",
      label: "Create Request",
      icon: <FileTextIcon className="h-5 w-5" />,
      onClick: handleCreateRequest,
      primary: true,
      to: "/",
      customHandler: true,
    },

    {
      id: "view-requests",
      label: "View Requests",
      icon: <ClipboardListIcon className="h-5 w-5" />,
      onClick: () => console.log("View Requests clicked"),
      primary: false,
      to: "/dashboard/requests",
      customHandler: false,
    },
    {
      id: "contact-support",
      label: "Contact Support",
      icon: <HelpCircleIcon className="h-5 w-5" />,
      onClick: () => console.log("Contact Support clicked"),
      primary: false,
      to: "/dashboard/support",
      customHandler: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => {
        if (action.customHandler) {
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className={`flex flex-col items-center justify-center p-4 rounded-lg transition-colors ${action.primary
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-white border border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                }`}
            >
              <div
                className={`p-2 rounded-full mb-3 ${action.primary
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600"
                  }`}
              >
                {action.icon}
              </div>
              <span
                className={`text-sm font-medium ${action.primary ? "text-white" : "text-gray-700"
                  }`}
              >
                {action.label}
              </span>
            </button>
          );
        }

        return (
          <Link
            to={action.to}
            key={action.id}
            onClick={action.onClick}
            className={`flex flex-col items-center justify-center p-4 rounded-lg transition-colors ${action.primary
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-white border border-gray-200 hover:border-blue-300 hover:bg-gray-50"
              }`}
          >
            <div
              className={`p-2 rounded-full mb-3 ${action.primary
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600"
                }`}
            >
              {action.icon}
            </div>
            <span
              className={`text-sm font-medium ${action.primary ? "text-white" : "text-gray-700"
                }`}
            >
              {action.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
};
