import React, { useEffect, useState, useRef } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MoreVerticalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ServiceRequestDetails } from "./ServiceRequestDetails";
import { ServiceRequest } from "../../types";
import { StatusBadge } from "./StatusBadge";
import { getServiceEditRoute } from "./serviceFormRoutes";

interface ServiceRequestsTableProps {
  requests: ServiceRequest[];
  sortConfig: {
    key: keyof ServiceRequest;
    direction: "asc" | "desc";
  };
  onSort: (key: keyof ServiceRequest) => void;
}

export function ServiceRequestsTable({
  requests,
  sortConfig,
  onSort,
}: ServiceRequestsTableProps) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(
    null
  );
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActionMenuOpen(null);
      }
    }
    if (actionMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [actionMenuOpen]);

  const totalPages = Math.ceil(requests.length / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const paginatedRequests = requests.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRowsPerPage = parseInt(e.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const toggleActionMenu = (requestId: string) => {
    setActionMenuOpen(actionMenuOpen === requestId ? null : requestId);
  };

  const handleAction = (action: string, request: ServiceRequest) => {
    setActionMenuOpen(null);

    if (action === "view") {
      setSelectedRequest(request);
    } else if (action === "edit") {
      const editRoute = getServiceEditRoute(request.serviceName, request.id);
      navigate(editRoute);
    }
  };

  const renderSortIcon = (key: keyof ServiceRequest) => {
    if (sortConfig.key !== key) {
      return (
        <ChevronDownIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" />
      );
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUpIcon className="w-4 h-4 text-gray-700" />
    ) : (
      <ChevronDownIcon className="w-4 h-4 text-gray-700" />
    );
  };

  const canEdit = (request: ServiceRequest) => {
    return request.status === "draft";
  };

  const canCancel = (request: ServiceRequest) => {
    return request.status === "draft" || request.status === "under-review";
  };

  return (
    <div>
      {/* Desktop Table (large screens only) */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                onClick={() => onSort("serviceName")}
              >
                <div className="flex items-center">
                  Service Name
                  <span className="ml-1">{renderSortIcon("serviceName")}</span>
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                onClick={() => onSort("category")}
              >
                <div className="flex items-center">
                  Category
                  <span className="ml-1">{renderSortIcon("category")}</span>
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                onClick={() => onSort("status")}
              >
                <div className="flex items-center">
                  Status
                  <span className="ml-1">{renderSortIcon("status")}</span>
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                onClick={() => onSort("serviceProvider")}
              >
                <div className="flex items-center">
                  Service Provider
                  <span className="ml-1">{renderSortIcon("serviceProvider")}</span>
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                onClick={() => onSort("submittedDate")}
              >
                <div className="flex items-center">
                  Submitted Date
                  <span className="ml-1">{renderSortIcon("submittedDate")}</span>
                </div>
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedRequests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <button
                    className="hover:text-blue-600 focus:outline-none focus:text-blue-600"
                    onClick={() => setSelectedRequest(request)}
                  >
                    {request.serviceName}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={request.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.serviceProvider || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(request.submittedDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="relative">
                    <button
                      className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 p-2 rounded-full hover:bg-gray-100"
                      onClick={() => toggleActionMenu(request.id)}
                      aria-label="Actions menu"
                      aria-haspopup="true"
                      aria-expanded={actionMenuOpen === request.id}
                    >
                      <MoreVerticalIcon className="h-5 w-5" />
                    </button>
                    {actionMenuOpen === request.id && (
                      <div
                        ref={menuRef}
                        className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                      >
                        <div className="py-1" role="menu" aria-orientation="vertical">
                          <button
                            onClick={() => handleAction("view", request)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                          >
                            View Details
                          </button>
                          {request.status === "draft" && (
                            <button
                              onClick={() => handleAction("edit", request)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              role="menuitem"
                            >
                              Edit Request
                            </button>
                          )}
                          {request.status === "rejected" && (
                            <button
                              onClick={() => handleAction("resubmit", request)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              role="menuitem"
                            >
                              Resubmit
                            </button>
                          )}
                          {request.status === "draft" && (
                            <button
                              onClick={() => handleAction("delete", request)}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              role="menuitem"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards for Mobile + iPad */}
      <div className="lg:hidden">
        <div className="divide-y divide-gray-200">
          {paginatedRequests.map((request) => (
            <div key={request.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <button
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
                    onClick={() => setSelectedRequest(request)}
                  >
                    {request.serviceName}
                  </button>
                  <p className="text-sm text-gray-500 mt-1">{request.category}</p>
                </div>
                <StatusBadge status={request.status} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Provider:</p>
                  <p className="font-medium">{request.serviceProvider || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Submitted:</p>
                  <p className="font-medium">{formatDate(request.submittedDate)}</p>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <div className="relative">
                  <button
                    className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 p-2 rounded-full hover:bg-gray-100"
                    onClick={() => toggleActionMenu(request.id)}
                    aria-label="Actions menu"
                  >
                    <MoreVerticalIcon className="h-5 w-5" />
                  </button>
                  {actionMenuOpen === request.id && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        <button
                          onClick={() => handleAction("view", request)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          View Details
                        </button>
                        {request.status === "draft" && (
                          <button
                            onClick={() => handleAction("edit", request)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                          >
                            Edit Request
                          </button>
                        )}
                        {request.status === "rejected" && (
                          <button
                            onClick={() => handleAction("resubmit", request)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                          >
                            Resubmit
                          </button>
                        )}
                        {request.status === "draft" && (
                          <button
                            onClick={() => handleAction("delete", request)}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            role="menuitem"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedRequest && (
        <ServiceRequestDetails
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          allowEdit={canEdit(selectedRequest)}
          allowCancel={canCancel(selectedRequest)}
          onEdit={() => handleAction("edit", selectedRequest)}
          onCancel={() => handleAction("delete", selectedRequest)}
        />
      )}

      <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between lg:hidden">
          <button
            onClick={handlePreviousPage}
            disabled={page === 1}
            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${page === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={page === totalPages}
            className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${page === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
          >
            Next
          </button>
        </div>
        <div className="hidden lg:flex-1 lg:flex lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(startIndex + rowsPerPage, requests.length)}
              </span>{" "}
              of <span className="font-medium">{requests.length}</span> results
            </p>
          </div>
          <div className="flex items-center">
            <div className="mr-4">
              <label htmlFor="rows-per-page" className="mr-2 text-sm text-gray-600">
                Rows per page:
              </label>
              <select
                id="rows-per-page"
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                className="border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination
">
              <button
                onClick={handlePreviousPage}
                disabled={page === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${page === 1
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-500 hover:bg-gray-50"
                  }`}
              >
                <span className="sr-only">Previous</span>
                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              {[...Array(totalPages)].map((_, i) => {
                const pageNumber = i + 1;
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= page - 1 && pageNumber <= page + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setPage(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === pageNumber
                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                    >
                      {pageNumber}
                    </button>
                  );
                }
                if (
                  (pageNumber === 2 && page > 3) ||
                  (pageNumber === totalPages - 1 && page < totalPages - 2)
                ) {
                  return (
                    <span
                      key={pageNumber}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                    >
                      ...
                    </span>
                  );
                }
                return null;
              })}
              <button
                onClick={handleNextPage}
                disabled={page === totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${page === totalPages
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-500 hover:bg-gray-50"
                  }`}
              >
                <span className="sr-only">Next</span>
                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
