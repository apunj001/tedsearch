import React from 'react';
import { GroundingChunk } from '../types';

interface SourceCardProps {
  chunk: GroundingChunk;
  index: number;
}

export const SourceCard: React.FC<SourceCardProps> = ({ chunk, index }) => {
  if (!chunk.web) return null;

  const { uri, title } = chunk.web;

  // Attempt to extract domain for display
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch (e) {
      return 'Web Source';
    }
  };

  return (
    <a
      href={uri}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-accent transition-all duration-200 group h-full"
    >
      <div className="flex items-center mb-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-bold text-gray-600 mr-2 group-hover:bg-accent group-hover:text-white transition-colors">
          {index + 1}
        </span>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
          {getDomain(uri)}
        </span>
      </div>
      <h3 className="text-sm font-medium text-ink line-clamp-2 group-hover:text-accent transition-colors">
        {title}
      </h3>
      <div className="mt-auto pt-3 flex items-center text-xs text-gray-400 group-hover:text-accent">
        <span>View source</span>
        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
    </a>
  );
};