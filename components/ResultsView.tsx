import React, { useState, useEffect } from 'react';
import { SearchResult } from '../types';
import { SourceCard } from './SourceCard';
import { useHeadingLabels } from '../utils/headingLabels';

interface ResultsViewProps {
  result: SearchResult;
  query: string;
}

const BookCoverPlaceholder: React.FC<{ title: string; type: 'front' | 'back' }> = ({ title, type }) => {
  const isFront = type === 'front';

  return (
    <div className={`w-full aspect-[2/3] relative overflow-hidden shadow-inner border border-gray-200/50 ${isFront ? 'bg-[#f8f1e5]' : 'bg-[#f0efe9]'} rounded-sm flex flex-col p-4`}>
      {/* Texture overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]"></div>

      {/* Spine Shadow */}
      <div className={`absolute top-0 bottom-0 ${isFront ? 'left-0' : 'right-0'} w-3 bg-gradient-to-r ${isFront ? 'from-black/10 to-transparent' : 'from-transparent to-black/10'}`}></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full items-center justify-center text-center space-y-4">
        {isFront ? (
          <>
            <div className="w-full h-1 border-t-2 border-double border-amber-900/20"></div>
            <h4 className="font-serif font-bold text-ink/60 text-lg line-clamp-3 uppercase tracking-widest">{title}</h4>
            <div className="w-12 h-12 rounded-full border-2 border-amber-900/10 flex items-center justify-center">
              <span className="text-2xl text-amber-900/20">🎨</span>
            </div>
            <p className="text-xs font-sans text-gray-400 italic">Image unavailable</p>
            <div className="w-full h-1 border-b-2 border-double border-amber-900/20"></div>
          </>
        ) : (
          <>
            <div className="space-y-2 w-full opacity-30">
              <div className="h-2 bg-gray-400 rounded w-3/4 mx-auto"></div>
              <div className="h-2 bg-gray-400 rounded w-full"></div>
              <div className="h-2 bg-gray-400 rounded w-5/6 mx-auto"></div>
              <div className="h-2 bg-gray-400 rounded w-full"></div>
            </div>
            <div className="mt-auto bg-white p-1 w-16 h-10 border border-gray-300 flex items-center justify-center opacity-50">
              <div className="w-full h-4 bg-black repeating-linear-gradient-to-r from-black to-white"></div>
            </div>
            <p className="text-xs font-sans text-gray-400 italic mt-2">Back cover unavailable</p>
          </>
        )}
      </div>
    </div>
  );
};

export const ResultsView: React.FC<ResultsViewProps> = ({ result, query }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [savedUrls, setSavedUrls] = useState<string[]>([]);
  const headingLabels = useHeadingLabels();

  useEffect(() => {
    // Load saved URLs on mount to update UI state
    const existing = localStorage.getItem('saved_covers');
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        setSavedUrls(parsed.map((item: any) => item.url));
      } catch (e) {
        console.error("Error parsing saved covers", e);
      }
    }
  }, []);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Filter for unique URLs to avoid duplicates
  const uniqueChunks = result.groundingMetadata?.groundingChunks?.filter(
    (chunk, index, self) =>
      index === self.findIndex((c) => c.web?.uri === chunk.web?.uri)
  ) || [];

  // Parse the markdown text into sections
  const parseSections = (text: string) => {
    const sections = {
      front: '',
      back: '',
      details: '',
      intro: ''
    };

    // Split by ## Headers
    const parts = text.split(/^## /m);

    parts.forEach(part => {
      const trimmed = part.trim();
      if (trimmed.startsWith('Front Cover')) {
        sections.front = trimmed.replace(/^Front Cover/, '').trim();
      } else if (trimmed.startsWith('Back Cover')) {
        sections.back = trimmed.replace(/^Back Cover/, '').trim();
      } else if (trimmed.startsWith('Art Description') || trimmed.startsWith('Art Details')) {
        sections.details = trimmed.replace(/^(Art Description|Art Details)/, '').trim();
      } else if (!trimmed.startsWith('#') && trimmed.length > 0 && !sections.front) {
        sections.intro = trimmed;
      }
    });

    return sections;
  };

  const extractImage = (text: string) => {
    // Match standard markdown image: ![Alt](URL)
    const imgMatch = text.match(/!\[.*?\]\((.*?)\)/);
    let cleanText = text.replace(/!\[.*?\]\((.*?)\)/g, '').trim();

    // Remove any remaining URL-encoded strings (they start with http and contain %20, %2C, etc.)
    cleanText = cleanText.replace(/https?:\/\/[^\s]+/g, '').trim();

    // Remove any lines that are mostly URL encoding artifacts
    cleanText = cleanText.split('\n')
      .filter(line => {
        const urlEncodedChars = (line.match(/%[0-9A-F]{2}/gi) || []).length;
        return urlEncodedChars < 5; // If line has less than 5 encoded chars, keep it
      })
      .join('\n')
      .trim();

    return {
      imageUrl: imgMatch ? imgMatch[1] : null,
      text: cleanText
    };
  };

  const handleSaveImage = async (url: string, type: 'front' | 'back') => {
    if (!url) return;

    // 1. Persist to localStorage
    try {
      const newItem = {
        id: Date.now().toString(),
        query,
        url,
        type,
        savedAt: new Date().toISOString()
      };

      const existingJson = localStorage.getItem('saved_covers');
      const covers = existingJson ? JSON.parse(existingJson) : [];

      // Check for duplicates based on URL
      if (!covers.some((c: any) => c.url === url)) {
        const updatedCovers = [...covers, newItem];
        localStorage.setItem('saved_covers', JSON.stringify(updatedCovers));
        setSavedUrls(updatedCovers.map((c: any) => c.url));
      }
    } catch (err) {
      console.error("Failed to save to localStorage", err);
    }

    // 2. Download Image
    try {
      // Attempt to fetch blob for direct download (handles CORS if allowed by server)
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network error');

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${query.replace(/[^a-z0-9]/gi, '_')}-${type}-cover`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.warn("Direct download blocked by CORS or network error, opening in new tab as fallback.");
      // Fallback: Open in new tab
      window.open(url, '_blank');
    }
  };

  const sections = parseSections(result.text);
  const frontData = extractImage(sections.front);
  const backData = extractImage(sections.back);

  const renderText = (text: string) => {
    if (!text) return <p className="text-gray-400 italic text-sm">No description available.</p>;

    return text.split('\n').map((line, i) => {
      if (line.trim() === '') return <div key={i} className="h-2"></div>;

      // Handle Lists
      if (line.startsWith('* ') || line.startsWith('- ')) {
        return <li key={i} className="ml-4 list-disc text-gray-700 mb-1 text-sm">{line.replace(/^[\*\-] /, '')}</li>;
      }

      // Highlight specific fields like "Artist:"
      if (line.startsWith('**Artist:**') || line.startsWith('**Medium:**')) {
        const [label, ...rest] = line.split(':');
        return (
          <p key={i} className="mb-1 text-sm">
            <span className="font-bold text-accent">{label.replace(/\*\*/g, '')}:</span>
            <span className="text-ink ml-1 font-medium">{rest.join(':').trim()}</span>
          </p>
        );
      }

      // Standard bold parsing
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} className="mb-2 leading-relaxed text-gray-700 text-sm font-sans">
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

  const renderCoverSection = (data: { imageUrl: string | null, text: string }, type: 'front' | 'back') => {
    const isSaved = data.imageUrl && savedUrls.includes(data.imageUrl);

    return (
      <div className="flex flex-col gap-4">
        <div
          className={`group relative w-full max-w-[300px] mx-auto shadow-xl rounded-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 ${data.imageUrl ? 'cursor-zoom-in hover:shadow-2xl' : ''}`}
          onClick={() => data.imageUrl && setSelectedImage(data.imageUrl)}
        >
          {data.imageUrl ? (
            <>
              <div className="relative aspect-[2/3] w-full bg-gray-100">
                <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                  <svg className="w-8 h-8 animate-pulse" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
                </div>
                <img
                  src={data.imageUrl}
                  alt={`${type} cover artwork`}
                  crossOrigin="anonymous"
                  className="relative z-10 w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                {/* Hidden fallback */}
                <div className="hidden w-full h-full absolute inset-0 z-0">
                  <BookCoverPlaceholder title={query} type={type} />
                </div>
              </div>

              {/* View Label Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <p className="text-white text-xs font-medium text-center">Zoom Artwork</p>
              </div>
            </>
          ) : (
            <BookCoverPlaceholder title={query} type={type} />
          )}

          {/* Subtle Spine Shadow for realism */}
          <div className={`absolute top-0 bottom-0 ${type === 'front' ? 'left-0' : 'right-0'} w-2 bg-gradient-to-r from-black/20 to-transparent z-30 pointer-events-none`}></div>
        </div>

        {/* Save Button */}
        {data.imageUrl && (
          <div className="flex justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSaveImage(data.imageUrl!, type);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-sm text-xs font-semibold transition-colors border ${isSaved
                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-accent hover:border-accent'
                }`}
            >
              {isSaved ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Save Cover
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="animate-fade-in-up space-y-8">

      {/* Intro if present */}
      {sections.intro && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-sm text-gray-600 italic text-center max-w-3xl mx-auto">
          {sections.intro.replace(/\n/g, ' ')}
        </div>
      )}

      {/* Book Spread Container */}
      <div className="flex flex-col md:flex-row gap-0 bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-200 relative max-w-5xl mx-auto">

        {/* LEFT: Front Cover Artwork */}
        <div className="flex-1 bg-[#fdfbf7] p-6 md:p-10 border-b md:border-b-0 md:border-r border-gray-300 relative">
          <h3 className="text-center font-serif font-bold text-amber-800 mb-6 uppercase tracking-widest text-sm border-b border-amber-100 pb-3 flex items-center justify-center gap-2">
            <span>🎨</span> {headingLabels.resultsFrontCoverTitle}
          </h3>
          {renderCoverSection(frontData, 'front')}
        </div>

        {/* RIGHT: Back Cover */}
        <div className="flex-1 bg-[#f5f5f4] p-6 md:p-10 relative">
          <h3 className="text-center font-serif font-bold text-gray-600 mb-6 uppercase tracking-widest text-sm border-b border-gray-200 pb-3">
            {headingLabels.resultsBackCoverTitle}
          </h3>
          {renderCoverSection(backData, 'back')}
        </div>
      </div>

      {/* Log details to server */}
      {(() => {
        const logData = {
          query,
          frontPrompt: frontData.text,
          backPrompt: backData.text,
          artDetails: sections.details,
          sources: uniqueChunks
        };

        // Log to console for immediate debugging
        console.log('Cover Generation Details:', logData);

        // Send to Cloud Function for persistent logging
        fetch('https://us-central1-ted-search-478518.cloudfunctions.net/logGeneration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logData)
        }).catch(err => console.error('Failed to log to server:', err));

        return null;
      })()}



      {/* Lightbox Overlay */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in p-4 md:p-8 cursor-zoom-out"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2 z-50"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
            }}
            aria-label="Close"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            className="relative w-full h-full flex items-center justify-center animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Full size artwork"
              crossOrigin="anonymous"
              className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl border border-gray-800"
            />
          </div>
        </div>
      )}

    </div>
  );
};
