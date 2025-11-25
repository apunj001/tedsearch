import React from 'react';
import { SearchResult } from '../types';
import { SourceCard } from './SourceCard';

interface ResultsViewProps {
  result: SearchResult;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ result }) => {
  // Filter for unique URLs to avoid duplicates
  const uniqueChunks = result.groundingMetadata?.groundingChunks?.filter(
    (chunk, index, self) =>
      index === self.findIndex((c) => c.web?.uri === chunk.web?.uri)
  ) || [];

  // Simple formatter to handle bold text from markdown usually returned by Gemini
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Check for headers
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-xl font-serif font-bold text-ink mt-6 mb-3">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('* ')) {
         return <li key={i} className="ml-4 list-disc text-gray-700 mb-1">{line.replace('* ', '')}</li>;
      }
      // Bold text handling simple regex replacement for display
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} className="mb-3 leading-relaxed text-gray-700">
          {parts.map((part, j) => {
             if (part.startsWith('**') && part.endsWith('**')) {
                 return <strong key={j} className="font-semibold text-ink">{part.slice(2, -2)}</strong>;
             }
             return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in-up">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Text Description */}
        <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Gemini Analysis</h2>
          <div className="prose prose-amber max-w-none font-serif">
            {formatText(result.text)}
          </div>
        </div>

        {/* Sources / "Cover" links */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
              Found Sources
            </h2>
            <p className="text-sm text-gray-500 mb-4 italic">
              Select a source below to view the actual cover images.
            </p>
            
            {uniqueChunks.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {uniqueChunks.map((chunk, idx) => (
                  <SourceCard key={idx} chunk={chunk} index={idx} />
                ))}
              </div>
            ) : (
              <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-400 text-sm">
                No direct web sources found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};