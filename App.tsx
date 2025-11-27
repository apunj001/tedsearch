import React, { useState } from 'react';
import { SearchForm } from './components/SearchForm';
import { ResultsView } from './components/ResultsView';
import { LoadingAnimation } from './components/LoadingAnimation';
import { searchBookCovers } from './services/geminiService';
import { SearchResult, SearchState } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<SearchState>(SearchState.IDLE);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>("");
  const [showAbout, setShowAbout] = useState(false);

  const handleSearch = async (query: string) => {
    setStatus(SearchState.LOADING);
    setErrorMsg(null);
    setResult(null);
    setCurrentQuery(query);

    try {
      const data = await searchBookCovers(query);
      setResult(data);
      setStatus(SearchState.SUCCESS);
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to retrieve search results. Please try again.");
      setStatus(SearchState.ERROR);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full py-6 px-4 border-b border-gray-200 bg-paper">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📚</span>
            <h1 className="text-2xl font-serif font-bold text-ink tracking-tight">Cover<span className="text-accent">Quest</span></h1>
          </div>
          <nav className="hidden md:block">
            <button onClick={() => setShowAbout(true)} className="text-sm text-gray-500 hover:text-accent transition-colors">About</button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col px-4 pb-12">

        {/* Hero / Search Area */}
        <div className={`transition-all duration-500 ease-in-out flex flex-col items-center ${status === SearchState.IDLE ? 'justify-center min-h-[60vh]' : 'justify-start py-8'}`}>
          <div className="text-center mb-8 w-full max-w-2xl">
            {status === SearchState.IDLE && (
              <>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-ink mb-4">Discover Book Covers</h2>
                <p className="text-gray-500 text-lg mb-8">
                  Enter a title to explore editions, artwork styles, and find visual sources from around the web using Google Search.
                </p>
              </>
            )}
            <SearchForm onSearch={handleSearch} isLoading={status === SearchState.LOADING} />
          </div>

          {/* Content Rendering */}
          <div className="w-full">
            {status === SearchState.LOADING && <LoadingAnimation />}

            {status === SearchState.ERROR && (
              <div className="max-w-2xl mx-auto mt-8 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-center">
                {errorMsg}
              </div>
            )}

            {status === SearchState.SUCCESS && result && (
              <ResultsView result={result} query={currentQuery} />
            )}
          </div>
        </div>
      </main>

      {/* Floating Feedback Button */}
      <a
        href="mailto:apunj001@gmail.com?subject=CoverQuest Feedback&body=Hi, I wanted to share some feedback about CoverQuest:%0D%0A%0D%0A"
        className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center gap-2 font-semibold text-sm z-50"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Feedback
      </a>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-gray-200 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          {/* Donation Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-2xl">₿</span>
              <h3 className="text-lg font-semibold text-gray-800">Support CoverQuest</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              If you find this tool helpful, consider supporting development with Bitcoin
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  const address = 'bc1q2hhps0kwuwgxnvv4kwletscjq6un4r0lvenesh';
                  navigator.clipboard.writeText(address);
                  alert('Bitcoin address copied to clipboard!');
                }}
                className="group flex items-center gap-2 px-4 py-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-all duration-200"
              >
                <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.975.225.955.236c.535.136.63.486.615.766l-1.477 5.92c-.075.166-.24.406-.614.314.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.51 2.154 1.32.33.545-2.19c2.24.427 3.93.257 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.18 3.137.524 2.75 2.084v.006z" />
                </svg>
                <span className="text-sm font-mono text-gray-700 group-hover:text-orange-700">
                  Click to copy BTC address
                </span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Credits */}
          <p className="text-gray-400 text-xs">
            Powered by Google Gemini & Pollinations.ai
          </p>
        </div>
      </footer>

      {/* About Modal */}
      {showAbout && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4"
          onClick={() => setShowAbout(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 relative animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAbout(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <span className="text-4xl mb-3 block">📚</span>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">About CoverQuest</h2>
            </div>

            <div className="space-y-4 text-gray-600 text-sm">
              <p>
                CoverQuest is an AI-powered book cover generation tool that creates unique front and back cover designs based on your descriptions.
              </p>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-800 mb-2">Developed by</h3>
                <p className="font-medium text-gray-700">Sanshodhana LLC</p>
                <p className="text-xs text-gray-500 italic">An AI and Search Consultancy</p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs text-gray-500">
                  🌴 All development done in California
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4 text-xs text-gray-400">
                <p>Powered by Google Gemini & Pollinations.ai</p>
              </div>
            </div>

            <button
              onClick={() => setShowAbout(false)}
              className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;