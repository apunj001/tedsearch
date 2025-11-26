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
            <a href="#" className="text-sm text-gray-500 hover:text-accent transition-colors">About</a>
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
      <footer className="py-6 text-center text-gray-400 text-sm border-t border-gray-200 bg-white">
        <p>Powered by Google Gemini & Google Search Grounding</p>
      </footer>
    </div>
  );
};

export default App;