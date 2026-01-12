import React, { useState } from 'react';
import { Calendar, X, Search } from 'lucide-react';
interface DateRange {
    startDate: string | null;
    endDate: string | null;
}
interface ServiceRequestsFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    dateRange: DateRange;
    onDateRangeChange: (dateRange: DateRange) => void;
    'data-id'?: string;
}
export function ServiceRequestsFilters({
    searchQuery,
    onSearchChange,
    dateRange,
    onDateRangeChange,
    'data-id': dataId,
}: ServiceRequestsFiltersProps) {
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartDate = e.target.value;
        onDateRangeChange({
            ...dateRange,
            startDate: newStartDate || null,
        });
    };
    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEndDate = e.target.value;
        onDateRangeChange({
            ...dateRange,
            endDate: newEndDate || null,
        });
    };
    const clearDateRange = () => {
        onDateRangeChange({
            startDate: null,
            endDate: null,
        });
    };
    return (
        <div
            className="flex flex-row gap-2 mt-3 sm:mt-0 sm:ml-auto"
            data-id={dataId}
        >
            {/* Date range picker */}
            <div className="relative flex-1 sm:flex-none">
                <button
                    type="button"
                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                    className="w-full sm:w-auto flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md leading-5 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    aria-expanded={isDatePickerOpen}
                    aria-haspopup="true"
                >
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="truncate max-w-[80px] sm:max-w-none">
                        {dateRange.startDate && dateRange.endDate
                            ? `${new Date(dateRange.startDate).toLocaleDateString()} - ${new Date(dateRange.endDate).toLocaleDateString()}`
                            : 'Date Range'}
                    </span>
                    {(dateRange.startDate || dateRange.endDate) && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                clearDateRange();
                            }}
                            className="ml-1 sm:ml-2 text-gray-400 hover:text-gray-500"
                            aria-label="Clear date range"
                        >
                            <X className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                    )}
                </button>
                {isDatePickerOpen && (
                    <div className="absolute right-0 z-10 mt-2 bg-white border border-gray-300 rounded-md shadow-lg p-4 w-72 sm:w-80">
                        <div className="flex flex-col space-y-4">
                            <div>
                                <label
                                    htmlFor="start-date"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    id="start-date"
                                    value={dateRange.startDate || ''}
                                    onChange={handleStartDateChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="end-date"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    id="end-date"
                                    value={dateRange.endDate || ''}
                                    onChange={handleEndDateChange}
                                    min={dateRange.startDate || undefined}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={clearDateRange}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Clear
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsDatePickerOpen(false)}
                                    className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Search input */}
            <div className="relative flex-1 sm:flex-none">
                <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    <Search
                        className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
                        aria-hidden="true"
                    />
                </div>
                <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="block w-full pl-8 sm:pl-10 pr-3 py-1.5 sm:py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => onSearchChange('')}
                        className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center"
                        aria-label="Clear search"
                    >
                        <X
                            className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 hover:text-gray-500"
                            aria-hidden="true"
                        />
                    </button>
                )}
            </div>
        </div>
    );
}
