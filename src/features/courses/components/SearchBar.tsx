import React, { Component } from 'react';
/**
 * SearchBar Component
 *
 * A reusable search input component with clear functionality.
 * Used for searching courses in the marketplace.
 */

import { SearchIcon, XIcon } from 'lucide-react';
/**
 * Props for the SearchBar component
 */
interface SearchBarProps {
  /** Current search query value */
  searchQuery: string;
  /** Function to update the search query */
  setSearchQuery: (query: string) => void;
}
/**
 * SearchBar Component
 *
 * @param props - Component props
 * @returns A search input with clear button
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery
}) => {
  return <div className="relative">
    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
      <SearchIcon className="h-5 w-5 text-neutral-500" aria-hidden="true" />
    </div>
    <input type="text" className="block w-full pl-11 pr-10 py-3 text-sm border border-neutral-200 rounded-full bg-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200" placeholder="Search by title or description" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} aria-label="Search courses" />
    {searchQuery && <button className="absolute inset-y-0 right-0 flex items-center pr-4" onClick={() => setSearchQuery('')} aria-label="Clear search">
      <XIcon className="h-5 w-5 text-neutral-400 hover:text-neutral-600 transition-colors" />
    </button>}
  </div>;
};
