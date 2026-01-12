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
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>
      <input type="text" className="block w-full pl-10 pr-10 py-3 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Search by title or description" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} aria-label="Search courses" />
      {searchQuery && <button className="absolute inset-y-0 right-0 flex items-center pr-3" onClick={() => setSearchQuery('')} aria-label="Clear search">
          <XIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
        </button>}
    </div>;
};
