import React, { useState } from 'react';

interface SearchFormProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto relative">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
        <div className="relative flex items-center bg-white rounded-lg shadow-xl">
          <div className="pl-4 text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="w-full p-4 pl-3 text-lg text-gray-700 bg-transparent border-none rounded-lg focus:ring-0 placeholder-gray-400 font-serif"
            placeholder="Enter a book title, author, or ISBN..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className={`m-2 px-6 py-2 rounded-md font-semibold text-white transition-all duration-200 ${query.trim() && !isLoading
                ? 'bg-gray-900 hover:bg-accent shadow-md'
                : 'bg-gray-300 cursor-not-allowed'
              }`}
          >
            {isLoading ? 'Searching...' : 'Find'}
          </button>
        </div>
      </div>
    </form>
  );
};