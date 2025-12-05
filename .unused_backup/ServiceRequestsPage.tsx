import React, { useEffect, useState } from "react";
import { ServiceRequestsHeader } from "./ServiceRequestsHeader";
import { ServiceRequestsFilters } from "./ServiceRequestsFilters";
import { ServiceRequestsTable } from "./ServiceRequestsTable";
import { EmptyState } from "./EmptyState";
import { mockServiceRequests } from "./mockData";
import {
  ServiceRequest,
  ServiceRequestStatus,
  DateRangeFilter,
} from "../../types";
export function ServiceRequestsPage({
  isLoggedIn,
  setIsOpen,
}: {
  isLoggedIn: boolean;
  setIsOpen: (value: boolean) => void;
}) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ServiceRequest[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [currentStatus, setCurrentStatus] = useState<
    ServiceRequestStatus | "all"
  >("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRangeFilter>({
    startDate: null,
    endDate: null,
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ServiceRequest;
    direction: "asc" | "desc";
  }>({
    key: "submittedDate",
    direction: "desc",
  });
  // Simulate API fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));
        setRequests(mockServiceRequests);
      } catch (error) {
        console.error("Error fetching service requests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  // Apply filters and sorting
  useEffect(() => {
    let result = [...requests];
    // Filter by status
    if (currentStatus !== "all") {
      result = result.filter((request) => request.status === currentStatus);
    }
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (request) =>
          request.serviceName.toLowerCase().includes(query) ||
          request.category.toLowerCase().includes(query)
      );
    }
    // Filter by date range
    if (dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999); // Include the end date fully
      result = result.filter((request) => {
        const submittedDate = new Date(request.submittedDate);
        return submittedDate >= startDate && submittedDate <= endDate;
      });
    }
    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (typeof aValue === "string" && typeof bValue === "string") {
        if (sortConfig.direction === "asc") {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }
      // Handle date sorting
      if (sortConfig.key === "submittedDate") {
        const dateA = new Date(a.submittedDate).getTime();
        const dateB = new Date(b.submittedDate).getTime();
        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });
    setFilteredRequests(result);
  }, [requests, currentStatus, searchQuery, dateRange, sortConfig]);
  const handleSort = (key: keyof ServiceRequest) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };
  const handleStatusChange = (status: ServiceRequestStatus | "all") => {
    setCurrentStatus(status);
  };
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };
  const handleDateRangeChange = (range: DateRangeFilter) => {
    setDateRange(range);
  };
  const handleRequestNewService = () => {
    console.log("Request new service clicked");
    // In a real app, this would navigate to a form or open a modal
  };
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <ServiceRequestsHeader
          onRequestNewService={handleRequestNewService}
          isLoggedIn={isLoggedIn}
          setIsOpen={setIsOpen}
        />
        <div className="bg-white rounded-lg shadow-sm mt-6">
          <ServiceRequestsFilters
            currentStatus={currentStatus}
            onStatusChange={handleStatusChange}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
          />
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredRequests.length > 0 ? (
            <ServiceRequestsTable
              requests={filteredRequests}
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          ) : (
            <EmptyState
              onRequestNewService={handleRequestNewService}
              hasFilters={
                currentStatus !== "all" ||
                !!searchQuery ||
                !!(dateRange.startDate && dateRange.endDate)
              }
              onClearFilters={() => {
                setCurrentStatus("all");
                setSearchQuery("");
                setDateRange({
                  startDate: null,
                  endDate: null,
                });
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
