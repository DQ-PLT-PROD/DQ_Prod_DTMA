import React, { useEffect, useState } from 'react';
import { mockReportData } from './mockReportsData';
import {
    HomeIcon,
    ChevronRightIcon,
    CalendarIcon,
    UserIcon,
    ArrowUpRightIcon,
    AlertCircleIcon,
    ClockIcon,
    ChevronLeftIcon,
    ChevronRightIcon as ChevronRightPaginationIcon,
} from 'lucide-react';
import { ServiceRequestsFilters } from '../../../components/ServiceRequestsFilters';
export function AllUpcomingObligationsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [obligations, setObligations] = useState<any[]>([]);
    const [filteredObligations, setFilteredObligations] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState({
        startDate: null,
        endDate: null,
    });
    const [reportTypeFilter, setReportTypeFilter] = useState('all');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const obligationsPerPage = 10;
    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                // Simulate GraphQL API call
                await new Promise((resolve) => setTimeout(resolve, 800));
                setObligations(mockReportData.upcomingObligations);
                setFilteredObligations(mockReportData.upcomingObligations);
                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching obligations:', err);
                setError('Failed to load obligations. Please try again.');
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);
    // Filter obligations
    useEffect(() => {
        let filtered = obligations;
        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(
                (obligation) =>
                    obligation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    obligation.assignedTo
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    obligation.type.toLowerCase().includes(searchQuery.toLowerCase()),
            );
        }
        // Apply report type filter
        if (reportTypeFilter !== 'all') {
            filtered = filtered.filter(
                (obligation) =>
                    obligation.type.toLowerCase() === reportTypeFilter.toLowerCase(),
            );
        }
        // Apply date range filter
        if (dateRange.startDate || dateRange.endDate) {
            filtered = filtered.filter((obligation) => {
                const dueDate = new Date(obligation.dueDate);
                const startDateMatch =
                    !dateRange.startDate || dueDate >= new Date(dateRange.startDate);
                const endDateMatch =
                    !dateRange.endDate || dueDate <= new Date(dateRange.endDate);
                return startDateMatch && endDateMatch;
            });
        }
        setFilteredObligations(filtered);
        setCurrentPage(1);
    }, [searchQuery, reportTypeFilter, dateRange, obligations]);
    // Pagination
    const indexOfLastObligation = currentPage * obligationsPerPage;
    const indexOfFirstObligation = indexOfLastObligation - obligationsPerPage;
    const currentObligations = filteredObligations.slice(
        indexOfFirstObligation,
        indexOfLastObligation,
    );
    const totalPages = Math.ceil(filteredObligations.length / obligationsPerPage);
    // Status badge component
    const getStatusBadge = (status) => {
        switch (status.toLowerCase()) {
            case 'overdue':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertCircleIcon size={12} className="mr-1" />
                        Overdue
                    </span>
                );
            case 'due soon':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <ClockIcon size={12} className="mr-1" />
                        Due Soon
                    </span>
                );
            case 'upcoming':
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <CalendarIcon size={12} className="mr-1" />
                        Upcoming
                    </span>
                );
        }
    };
    // Action button component
    const getActionButton = (obligation) => {
        switch (obligation.status.toLowerCase()) {
            case 'overdue':
                return (
                    <button className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center">
                        Submit Now
                        <ArrowUpRightIcon size={12} className="ml-1" />
                    </button>
                );
            case 'due soon':
                return (
                    <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                        Prepare
                        <ArrowUpRightIcon size={12} className="ml-1" />
                    </button>
                );
            case 'upcoming':
            default:
                return (
                    <button className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 text-xs font-medium rounded-lg transition-colors flex items-center">
                        View
                        <ArrowUpRightIcon size={12} className="ml-1" />
                    </button>
                );
        }
    };
    // Breadcrumbs
    const Breadcrumbs = () => (
        <nav className="flex items-center text-sm text-gray-500 mb-6 p-6 pb-2">

            <a href="/dashboard/reporting-obligations" className="hover:text-blue-600">
                Reports & Reporting Obligations
            </a>
            <ChevronRightIcon size={14} className="mx-2" />
            <span className="text-gray-800 font-medium">
                All Upcoming Obligations
            </span>
        </nav>
    );
    if (isLoading) {
        return (
            <div className="min-h-screen">

                <div className="flex flex-1 overflow-hidden">

                    <div className="bg-gray-50 min-h-screen w-full">
                        <div className=" mx-auto">
                            <div className="bg-whitel shadow-sm  flex items-center justify-center h-screen">
                                <div className="text-center">
                                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-gray-600">Loading obligations...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="min-h-screen">

                <div className="flex flex-1 overflow-hidden">

                    <div className="bg-gray-50 min-h-screen w-full">
                        <div className=" mx-auto p-4 md:p-6 lg:p-8">
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <div className="text-center py-12">
                                    <div className="text-red-500 text-lg mb-2">Error</div>
                                    <p className="text-gray-600 mb-4">{error}</p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Retry
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen">

            <div className="flex flex-1 overflow-hidden">

                <div className="bg-gray-50 min-h-screen w-full">
                    <div className=" mx-auto p-4 md:p-6 lg:p-8">
                        <div className="p-6 pb-2">
                            <h1 className="text-2xl font-bold text-gray-900">
                                All Upcoming Obligations
                            </h1>
                        </div>
                        <Breadcrumbs />
                        {/* Filters Card */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="relative">
                                    <select
                                        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                        value={reportTypeFilter}
                                        onChange={(e) => setReportTypeFilter(e.target.value)}
                                    >
                                        <option value="all">All Report Types</option>
                                        <option value="financial">Financial</option>
                                        <option value="regulatory">Regulatory</option>
                                        <option value="compliance">Compliance</option>
                                        <option value="operational">Operational</option>
                                        <option value="environmental">Environmental</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                        <ChevronRightIcon
                                            size={16}
                                            className="transform rotate-90"
                                        />
                                    </div>
                                </div>
                                <div className="w-full sm:w-auto sm:max-w-lg">
                                    <ServiceRequestsFilters
                                        searchQuery={searchQuery}
                                        onSearchChange={setSearchQuery}
                                        dateRange={dateRange}
                                        onDateRangeChange={setDateRange as any}
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Data Table Card */}
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                            <div className="border-b border-gray-200 p-6">
                                <h2 className="text-lg font-bold text-gray-900">
                                    Upcoming Obligations
                                </h2>
                                <p className="text-sm text-gray-600">
                                    Reports you need to file soon
                                </p>
                            </div>
                            <div className="p-6">
                                {currentObligations.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                                        <p className="text-gray-500">
                                            No obligations found matching your filters.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full">
                                                <thead>
                                                    <tr className="border-b border-gray-200">
                                                        <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Obligation Name
                                                        </th>
                                                        <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Type
                                                        </th>
                                                        <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Status
                                                        </th>
                                                        <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Due Date
                                                        </th>
                                                        <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Assigned To
                                                        </th>
                                                        <th className="text-right py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentObligations.map((obligation, index) => (
                                                        <tr
                                                            key={obligation.id}
                                                            className={`hover:bg-gray-50 ${index !== currentObligations.length - 1 ? 'border-b border-gray-100' : ''}`}
                                                            style={{
                                                                minHeight: '3.5rem',
                                                            }}
                                                        >
                                                            <td className="py-3 px-6">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {obligation.name}
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-6">
                                                                <div className="text-sm text-gray-500">
                                                                    {obligation.type}
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-6">
                                                                {getStatusBadge(obligation.status)}
                                                            </td>
                                                            <td className="py-3 px-6">
                                                                <div className="text-sm text-gray-500">
                                                                    {obligation.dueDate}
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-6">
                                                                <div className="text-sm text-gray-500">
                                                                    {obligation.assignedTo}
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-6 text-right">
                                                                {getActionButton(obligation)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className="flex items-center justify-end mt-4 gap-2">
                                                <span className="text-sm text-gray-500 mr-4">
                                                    Showing {indexOfFirstObligation + 1} to{' '}
                                                    {Math.min(
                                                        indexOfLastObligation,
                                                        filteredObligations.length,
                                                    )}{' '}
                                                    of {filteredObligations.length} results
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        setCurrentPage(Math.max(1, currentPage - 1))
                                                    }
                                                    disabled={currentPage === 1}
                                                    className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}
                                                >
                                                    <ChevronLeftIcon size={16} />
                                                </button>
                                                {[...Array(totalPages)].map((_, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setCurrentPage(i + 1)}
                                                        className={`px-3 py-1 rounded-md ${currentPage === i + 1 ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                                                    >
                                                        {i + 1}
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() =>
                                                        setCurrentPage(
                                                            Math.min(totalPages, currentPage + 1),
                                                        )
                                                    }
                                                    disabled={currentPage === totalPages}
                                                    className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}
                                                >
                                                    <ChevronRightPaginationIcon size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
