import React, { useState } from 'react';
import { SearchForm } from './components/SearchForm';
import { ResultsView } from './components/ResultsView';
import { LoadingAnimation } from './components/LoadingAnimation';
import { searchBookCovers } from './services/geminiService';
import { SearchResult, SearchState } from './types';
import { useHeadingLabels } from './utils/headingLabels';

const App: React.FC = () => {
  const [status, setStatus] = useState<SearchState>(SearchState.IDLE);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>("");
  const [showAbout, setShowAbout] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [flippedCover, setFlippedCover] = useState<number | null>(null);
  const headingLabels = useHeadingLabels();

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
            <h1 className="text-2xl font-serif font-bold text-ink tracking-tight">
              {headingLabels.appNamePrimary}
              <span className="text-accent">{headingLabels.appNameAccent}</span>
            </h1>
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
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-ink mb-4">{headingLabels.heroTitle}</h2>
                <button
                  onClick={() => setShowDemo(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-accent hover:text-indigo-700 transition-colors mb-4"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  See Example
                </button>
              </>
            )}
            <SearchForm onSearch={handleSearch} isLoading={status === SearchState.LOADING} />
            {status === SearchState.IDLE && (
              <div className="mt-6 flex justify-center">
                <div className="w-full max-w-md rounded-xl border border-dashed border-gray-300 bg-white/80 p-4 text-left shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 mb-3">
                    Layout sketch
                  </p>
                  <svg
                    viewBox="0 0 360 210"
                    role="img"
                    aria-label="Sketch of the intended layout with header, search, and results panels"
                    className="w-full h-auto"
                  >
                    <rect x="10" y="10" width="340" height="40" rx="6" fill="#F3F4F6" stroke="#CBD5F5" />
                    <text x="180" y="35" textAnchor="middle" fontSize="12" fill="#4B5563">Header</text>

                    <rect x="10" y="70" width="340" height="50" rx="10" fill="#EEF2FF" stroke="#A5B4FC" />
                    <text x="180" y="100" textAnchor="middle" fontSize="12" fill="#4338CA">Search input</text>

                    <rect x="10" y="140" width="165" height="55" rx="10" fill="#FFFFFF" stroke="#E5E7EB" />
                    <rect x="185" y="140" width="165" height="55" rx="10" fill="#FFFFFF" stroke="#E5E7EB" />
                    <text x="92" y="170" textAnchor="middle" fontSize="11" fill="#6B7280">Results</text>
                    <text x="267" y="170" textAnchor="middle" fontSize="11" fill="#6B7280">Gallery</text>
                  </svg>
                </div>
              </div>
            )}
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

      {/* Gallery Section - Only show when IDLE */}
      {status === SearchState.IDLE && (
        <section className="py-16 px-4 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-3">{headingLabels.galleryTitle}</h2>
              <p className="text-gray-600">See what others have created with CoverQuest</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {/* Example Cover 1 - Sci-Fi */}
              <div
                className="group cursor-pointer perspective-1000"
                onClick={() => setFlippedCover(flippedCover === 1 ? null : 1)}
              >
                <div className={`relative w-full aspect-[2/3] transition-transform duration-700 transform-style-3d ${flippedCover === 1 ? 'rotate-y-180' : ''}`}>
                  {/* Front */}
                  <div className="absolute inset-0 backface-hidden rounded-lg shadow-lg overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-black">
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white">
                      <div className="text-4xl mb-3">🚀</div>
                      <div className="text-xl font-bold text-center">NEBULA</div>
                      <div className="text-xs mt-2 opacity-75">Sci-Fi • Click to see example</div>
                    </div>
                  </div>
                  {/* Back */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-lg shadow-lg overflow-hidden">
                    <img
                      src="https://us-central1-ted-search-478518.cloudfunctions.net/imageProxy?url=https%3A%2F%2Fimage.pollinations.ai%2Fprompt%2Ffuturistic%2520space%2520station%2520orbiting%2520nebula%252C%2520sci-fi%2520book%2520cover%252C%2520vibrant%2520purple%2520and%2520blue%2520colors%252C%2520high%2520quality"
                      alt="Sci-Fi Example"
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Example Cover 2 - Romance */}
              <div
                className="group cursor-pointer perspective-1000"
                onClick={() => setFlippedCover(flippedCover === 2 ? null : 2)}
              >
                <div className={`relative w-full aspect-[2/3] transition-transform duration-700 transform-style-3d ${flippedCover === 2 ? 'rotate-y-180' : ''}`}>
                  <div className="absolute inset-0 backface-hidden rounded-lg shadow-lg overflow-hidden bg-gradient-to-br from-pink-400 via-rose-500 to-red-600">
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white">
                      <div className="text-4xl mb-3">💕</div>
                      <div className="text-xl font-bold text-center">HEARTS</div>
                      <div className="text-xs mt-2 opacity-75">Romance • Click to see example</div>
                    </div>
                  </div>
                  <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-lg shadow-lg overflow-hidden">
                    <img
                      src="https://us-central1-ted-search-478518.cloudfunctions.net/imageProxy?url=https%3A%2F%2Fimage.pollinations.ai%2Fprompt%2Fromantic%2520couple%2520silhouette%2520sunset%252C%2520romance%2520book%2520cover%252C%2520warm%2520pink%2520and%2520red%2520tones%252C%2520dreamy%2520atmosphere"
                      alt="Romance Example"
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Example Cover 3 - Mystery */}
              <div
                className="group cursor-pointer perspective-1000"
                onClick={() => setFlippedCover(flippedCover === 3 ? null : 3)}
              >
                <div className={`relative w-full aspect-[2/3] transition-transform duration-700 transform-style-3d ${flippedCover === 3 ? 'rotate-y-180' : ''}`}>
                  <div className="absolute inset-0 backface-hidden rounded-lg shadow-lg overflow-hidden bg-gradient-to-br from-gray-800 via-slate-700 to-gray-900">
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white">
                      <div className="text-4xl mb-3">🔍</div>
                      <div className="text-xl font-bold text-center">SHADOWS</div>
                      <div className="text-xs mt-2 opacity-75">Mystery • Click to see example</div>
                    </div>
                  </div>
                  <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-lg shadow-lg overflow-hidden">
                    <img
                      src="https://us-central1-ted-search-478518.cloudfunctions.net/imageProxy?url=https%3A%2F%2Fimage.pollinations.ai%2Fprompt%2Fdark%2520alley%2520noir%2520detective%252C%2520mystery%2520thriller%2520book%2520cover%252C%2520moody%2520shadows%252C%2520film%2520noir%2520style"
                      alt="Mystery Example"
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Example Cover 4 - Fantasy */}
              <div
                className="group cursor-pointer perspective-1000"
                onClick={() => setFlippedCover(flippedCover === 4 ? null : 4)}
              >
                <div className={`relative w-full aspect-[2/3] transition-transform duration-700 transform-style-3d ${flippedCover === 4 ? 'rotate-y-180' : ''}`}>
                  <div className="absolute inset-0 backface-hidden rounded-lg shadow-lg overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800">
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white">
                      <div className="text-4xl mb-3">🐉</div>
                      <div className="text-xl font-bold text-center">REALMS</div>
                      <div className="text-xs mt-2 opacity-75">Fantasy • Click to see example</div>
                    </div>
                  </div>
                  <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-lg shadow-lg overflow-hidden">
                    <img
                      src="https://us-central1-ted-search-478518.cloudfunctions.net/imageProxy?url=https%3A%2F%2Fimage.pollinations.ai%2Fprompt%2Fepic%2520dragon%2520flying%2520over%2520castle%252C%2520fantasy%2520book%2520cover%252C%2520magical%2520emerald%2520and%2520teal%2520colors%252C%2520detailed"
                      alt="Fantasy Example"
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Example Cover 5 - Thriller */}
              <div
                className="group cursor-pointer perspective-1000"
                onClick={() => setFlippedCover(flippedCover === 5 ? null : 5)}
              >
                <div className={`relative w-full aspect-[2/3] transition-transform duration-700 transform-style-3d ${flippedCover === 5 ? 'rotate-y-180' : ''}`}>
                  <div className="absolute inset-0 backface-hidden rounded-lg shadow-lg overflow-hidden bg-gradient-to-br from-red-900 via-orange-800 to-yellow-700">
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white">
                      <div className="text-4xl mb-3">⚡</div>
                      <div className="text-xl font-bold text-center">PULSE</div>
                      <div className="text-xs mt-2 opacity-75">Thriller • Click to see example</div>
                    </div>
                  </div>
                  <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-lg shadow-lg overflow-hidden">
                    <img
                      src="https://us-central1-ted-search-478518.cloudfunctions.net/imageProxy?url=https%3A%2F%2Fimage.pollinations.ai%2Fprompt%2Fintense%2520action%2520scene%2520explosion%252C%2520thriller%2520book%2520cover%252C%2520dramatic%2520red%2520and%2520orange%2520lighting%252C%2520high%2520energy"
                      alt="Thriller Example"
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Example Cover 6 - Horror */}
              <div
                className="group cursor-pointer perspective-1000"
                onClick={() => setFlippedCover(flippedCover === 6 ? null : 6)}
              >
                <div className={`relative w-full aspect-[2/3] transition-transform duration-700 transform-style-3d ${flippedCover === 6 ? 'rotate-y-180' : ''}`}>
                  <div className="absolute inset-0 backface-hidden rounded-lg shadow-lg overflow-hidden bg-gradient-to-br from-black via-red-950 to-gray-900">
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white">
                      <div className="text-4xl mb-3">👻</div>
                      <div className="text-xl font-bold text-center">HAUNTED</div>
                      <div className="text-xs mt-2 opacity-75">Horror • Click to see example</div>
                    </div>
                  </div>
                  <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-lg shadow-lg overflow-hidden">
                    <img
                      src="https://us-central1-ted-search-478518.cloudfunctions.net/imageProxy?url=https%3A%2F%2Fimage.pollinations.ai%2Fprompt%2Fcreepy%2520haunted%2520mansion%2520at%2520night%252C%2520horror%2520book%2520cover%252C%2520dark%2520atmosphere%252C%2520eerie%2520red%2520glow"
                      alt="Horror Example"
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-10">
              <p className="text-sm text-gray-500 italic">✨ All covers generated by AI based on simple descriptions</p>
            </div>
          </div>
        </section>
      )}

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
              <h3 className="text-lg font-semibold text-gray-800">{headingLabels.supportTitle}</h3>
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
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{headingLabels.aboutTitle}</h2>
            </div>

            <div className="space-y-4 text-gray-600 text-sm">
              <p>
                CoverQuest is an AI-powered book cover generation tool that creates unique front and back cover designs based on your descriptions.
              </p>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-800 mb-2">{headingLabels.developedByTitle}</h3>
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

      {/* Demo Modal */}
      {showDemo && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4 overflow-y-auto"
          onClick={() => setShowDemo(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 md:p-8 relative animate-scale-up my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDemo(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <span className="text-4xl mb-3 block">📖</span>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{headingLabels.demoTitle}</h2>
              <p className="text-sm text-gray-600">Transform your ideas into stunning book covers</p>
            </div>

            {/* Example Input */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-5 mb-6 border-2 border-indigo-200">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-base">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                {headingLabels.demoExampleTitle}
              </h3>
              <div className="space-y-2 text-gray-800 text-sm">
                <div className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-accent text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <p className="flex-1">A Supreme Court justice uncovers a conspiracy that threatens American democracy.</p>
                </div>
                <div className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-accent text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <p className="flex-1">The cover shows the iconic Supreme Court building at night, illuminated by dramatic lightning.</p>
                </div>
                <div className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-accent text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <p className="flex-1">Dark storm clouds gather overhead, symbolizing the political turmoil.</p>
                </div>
                <div className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-accent text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  <p className="flex-1">The mood is tense and cinematic, like a political thriller.</p>
                </div>
                <div className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-accent text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
                  <p className="flex-1">Art style should be photorealistic with dramatic lighting and rich, deep colors.</p>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2 rounded-full text-xs font-semibold flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI Generates in Seconds
              </div>
            </div>

            {/* Example Covers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Front Cover */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-800 text-center text-lg flex items-center justify-center gap-2">
                  <span className="text-2xl">📕</span>
                  {headingLabels.demoFrontCoverTitle}
                </h4>
                <div className="aspect-[2/3] rounded-xl shadow-2xl overflow-hidden border-4 border-gray-200 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative">
                  {/* Simulated book cover design */}
                  <div className="absolute inset-0 flex flex-col items-center justify-between p-8 text-white">
                    <div className="text-center flex-1 flex flex-col justify-center">
                      <div className="mb-6">
                        <div className="text-6xl mb-4">⚖️</div>
                        <div className="text-4xl font-bold mb-2">THE</div>
                        <div className="text-5xl font-bold mb-2">VERDICT</div>
                      </div>
                      <p className="text-sm opacity-75 italic">A Political Thriller</p>
                    </div>
                    <div className="text-xs opacity-50 text-center">
                      <p>AI-Generated Example</p>
                    </div>
                  </div>
                  {/* Lightning effect overlay */}
                  <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-yellow-400/20 to-transparent"></div>
                </div>
              </div>

              {/* Back Cover */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-800 text-center text-lg flex items-center justify-center gap-2">
                  <span className="text-2xl">📘</span>
                  {headingLabels.demoBackCoverTitle}
                </h4>
                <div className="aspect-[2/3] rounded-xl shadow-2xl overflow-hidden border-4 border-gray-200 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 relative">
                  {/* Simulated back cover design */}
                  <div className="absolute inset-0 flex flex-col p-8 text-white">
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="text-5xl mb-4">🏛️</div>
                        <p className="text-sm leading-relaxed opacity-90 max-w-xs mx-auto">
                          "A gripping tale of justice, power, and the fight to preserve democracy..."
                        </p>
                      </div>
                    </div>
                    <div className="text-xs opacity-50 text-center">
                      <p>AI-Generated Example</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <p className="text-gray-600 italic">✨ Your covers will be unique and tailored to your description</p>
              <button
                onClick={() => setShowDemo(false)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Create My Book Cover Now →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
