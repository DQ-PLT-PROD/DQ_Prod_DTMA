import React from "react";
import { CalendarIcon, AlertTriangleIcon, FileClockIcon } from "lucide-react";

import { Link } from "react-router-dom";

interface ObligationsDeadlinesProps {
  isLoading: boolean;
}
// Mock obligations data
const obligations = [
  {
    id: 1,
    title: "Annual Financial Report",
    dueDate: "2025-12-15",
    status: "overdue",
    type: "reporting",
  },
  {
    id: 2,
    title: "Quarterly Performance Review",
    dueDate: "2025-12-30",
    status: "upcoming",
    type: "review",
  },
  {
    id: 3,
    title: "Business License Renewal",
    dueDate: "2025-11-20",
    status: "upcoming",
    type: "license",
  },
];
export const ObligationsDeadlines: React.FC<ObligationsDeadlinesProps> = ({
  isLoading,
}) => {
  const getStatusIcon = (status: string) => {
    if (status === "overdue") {
      return <AlertTriangleIcon className="h-5 w-5 text-red-500" />;
    }
    return <CalendarIcon className="h-5 w-5 text-gray-400" />;
  };
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-16 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }
  return (
    <div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Obligation
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Due Date
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {obligations.map((obligation) => (
            <tr key={obligation.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-2">
                    {getStatusIcon(obligation.status)}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      obligation.status === "overdue"
                        ? "text-red-600"
                        : "text-gray-700"
                    }`}
                  >
                    {obligation.title}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <FileClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-500">
                    {obligation.dueDate}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                <Link
                  to="/dashboard/reporting-obligations"
                  className="px-3 py-1 border border-gray-300 rounded-md text-xs text-gray-600 hover:text-blue-600 hover:border-blue-300 inline-block"
                >
                  Take Action
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 text-right">
        <Link
          to="/dashboard/reporting-obligations"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View All Obligations
        </Link>
      </div>
    </div>
  );
};
