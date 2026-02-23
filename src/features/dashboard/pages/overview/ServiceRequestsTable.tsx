import React from "react";

import { Link } from "react-router-dom";

interface ServiceRequestsTableProps {
  isLoading: boolean;
}
// Mock service request data
const serviceRequests = [
  {
    id: "SR-2025-001",
    category: "Funding Application",
    status: "In Progress",
    submittedDate: "2025-11-15",
  },
  {
    id: "SR-2025-002",
    category: "Business Registration",
    status: "Pending Review",
    submittedDate: "2025-11-10",
  },
  {
    id: "SR-2025-003",
    category: "License Renewal",
    status: "Approved",
    submittedDate: "2025-11-05",
  },
];
export const ServiceRequestsTable: React.FC<ServiceRequestsTableProps> = ({
  isLoading,
}) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Approved":
        return "text-green-700";
      case "In Progress":
        return "text-blue-700";
      case "Pending Review":
        return "text-amber-700";
      case "On Hold":
        return "text-gray-700";
      case "Completed":
        return "text-purple-700";
      default:
        return "text-gray-700";
    }
  };
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-16 bg-gray-200 rounded w-full mb-2"
          ></div>
        ))}
      </div>
    );
  }
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Request ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Category
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Submitted Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {serviceRequests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {request.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`text-xs font-medium ${getStatusStyle(
                      request.status
                    )}`}
                  >
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.submittedDate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
