import React from 'react';

export const LoadingAnimation: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-accent rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-gray-500 font-serif italic animate-pulse">Scouring the shelves...</p>
    </div>
  );
};