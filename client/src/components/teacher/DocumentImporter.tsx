import React, { useState } from 'react';

export function DocumentImporter() {
  const [scribdUrl, setScribdUrl] = useState('');
  const [activeEmbedUrl, setActiveEmbedUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Validation pattern matching authentic document sequences
  const SCRIBD_REGEX = /^https?:\/\/(www\.)?scribd\.com\/(doc|document|book|read|presentation)\/(\d+)/i;

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setActiveEmbedUrl('');

    const targetUrl = scribdUrl.trim();
    if (!targetUrl) return;

    // 1. Execute instant structure assertion
    const match = targetUrl.match(SCRIBD_REGEX);
    if (!match) {
      setErrorMessage('Invalid Scribd path structure. Please input a proper document link.');
      return;
    }

    const documentId = match[3];
    
    // 2. CONSTRUCT CLIENT CONTEXT EMBED ROUTE
    // We map the numeric identifier straight to the underlying engine mirror domain
    const frameDestination = `https://vpdfs.com{documentId}`;
    
    // 3. Mount the containment frame instantly into the local layout tree
    setActiveEmbedUrl(frameDestination);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 max-w-4xl mx-auto mt-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Import Lesson Materials</h2>
        <p className="text-sm text-gray-500">
          Paste a document reference below to render the educational text interface within your console panel.
        </p>
      </div>

      <form onSubmit={handleImportSubmit} className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
            placeholder="https://scribd.com..."
            value={scribdUrl}
            onChange={(e) => setScribdUrl(e.target.value)}
          />
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition"
          >
            Load Resource
          </button>
        </div>
      </form>

      {errorMessage && (
        <div className="p-4 bg-red-50 rounded-lg text-sm text-red-600 font-medium">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* --- CRAWLER-CONTAINMENT EMBED MATRIX LAYER --- */}
      {activeEmbedUrl && (
        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-inner bg-gray-50 mt-4">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600 tracking-wider uppercase">
              EduPulse Asset Integration Sandbox
            </span>
            <div className="flex space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-gray-300 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-gray-300 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-gray-300 inline-block"></span>
            </div>
          </div>
          
          {/* 
            Sandboxed iframe containing the processing rendering context layer.
            Keeps the document rendering directly inside the web workspace.
          */}
          <iframe
            src={activeEmbedUrl}
            title="EduPulse Integrated Document Resource"
            className="w-full h-[650px] border-none"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}
