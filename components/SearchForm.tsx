import React, { useState } from 'react';

interface SearchFormProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [sentences, setSentences] = useState<string[]>(['', '', '', '', '']);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleSentenceChange = (index: number, value: string) => {
    const newSentences = [...sentences];
    newSentences[index] = value;
    setSentences(newSentences);
  };

  const filledCount = sentences.filter(s => s.trim().length > 10).length;
  const isValid = filledCount === 5;

  const fillExample = () => {
    setSentences([
      'A young astronaut discovers an ancient alien artifact on Mars',
      'The artifact glows with mysterious blue energy against the red Martian landscape',
      'In the background, Earth rises over the Martian horizon',
      'The scene has a sense of wonder and cosmic mystery',
      'Art style should be realistic sci-fi with dramatic lighting'
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && !isLoading && !isEvaluating) {
      onSearch(sentences.join('. '));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto relative">
      {/* Instruction Banner */}
      <div className="mb-6 p-5 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-indigo-900 mb-1">AI Cover Generator</h3>
            <p className="text-sm text-indigo-800/80 leading-relaxed">
              Provide <strong>5 distinct details</strong> about your book. The AI will evaluate your description quality before generating custom front and back covers.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {sentences.map((sentence, index) => (
          <div key={index} className="relative group transition-all duration-300">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-0 group-focus-within:opacity-20 transition duration-300"></div>
            <div className="relative flex items-center bg-white rounded-lg border border-gray-200 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 overflow-hidden">
              <div className="flex-shrink-0 w-10 h-full flex items-center justify-center bg-gray-50 border-r border-gray-100 text-gray-400 font-mono text-sm">
                {index + 1}
              </div>
              <input
                type="text"
                className="w-full p-3 text-gray-700 bg-transparent border-none focus:ring-0 placeholder-gray-300 text-sm"
                placeholder={`Detail ${index + 1} (e.g., "A lone astronaut standing on a red desert planet...")`}
                value={sentence}
                onChange={(e) => handleSentenceChange(index, e.target.value)}
                disabled={isLoading}
              />
              {sentence.trim().length > 10 && (
                <div className="pr-3 text-green-500 animate-fade-in">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500 font-medium">
            {filledCount}/5 details provided
          </div>
          <button
            type="button"
            onClick={fillExample}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Use Example
          </button>
        </div>

        <button
          type="submit"
          disabled={!isValid || isLoading}
          className={`px-8 py-3 rounded-lg font-bold text-white shadow-lg transition-all duration-200 flex items-center gap-2 ${isValid && !isLoading
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl transform hover:-translate-y-0.5'
            : 'bg-gray-300 cursor-not-allowed'
            }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <span>Generate Covers</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </>
          )}
        </button>
      </div>
    </form>
  );
};