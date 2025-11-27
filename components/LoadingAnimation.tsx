import React, { useState, useEffect } from 'react';

export const LoadingAnimation: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);

  const stages = [
    { label: 'Analyzing your description...', duration: 2000 },
    { label: 'Generating creative prompts...', duration: 3000 },
    { label: 'Creating front cover artwork...', duration: 4000 },
    { label: 'Designing back cover...', duration: 3000 },
    { label: 'Finalizing details...', duration: 2000 }
  ];

  useEffect(() => {
    let currentProgress = 0;
    let currentStage = 0;
    const totalDuration = stages.reduce((sum, s) => sum + s.duration, 0);
    const interval = 50; // Update every 50ms

    const timer = setInterval(() => {
      currentProgress += (100 / totalDuration) * interval;

      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(timer);
      }

      setProgress(Math.min(currentProgress, 100));

      // Update stage based on progress
      let accumulatedDuration = 0;
      for (let i = 0; i < stages.length; i++) {
        accumulatedDuration += stages[i].duration;
        if (currentProgress < (accumulatedDuration / totalDuration) * 100) {
          setStage(i);
          break;
        }
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6 max-w-md mx-auto">
      {/* Animated Icon */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full animate-pulse"></div>
        <div className="absolute inset-0 flex items-center justify-center text-4xl animate-bounce">
          🎨
        </div>
      </div>

      {/* Stage Label */}
      <p className="text-gray-700 font-medium text-center animate-fade-in">
        {stages[stage]?.label}
      </p>

      {/* Progress Bar */}
      <div className="w-full space-y-2">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-400 text-center font-mono">
          {Math.round(progress)}%
        </p>
      </div>

      {/* Tip */}
      <p className="text-xs text-gray-400 italic text-center px-4">
        Tip: The more detailed your description, the better the results!
      </p>
    </div>
  );
};