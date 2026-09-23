import React, { useState } from 'react';
import axios from 'axios';

export function DocumentImporter() {
  const [scribdUrl, setScribdUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scribdUrl.trim()) return;

    // 1. Initialize UI loading phase
    setIsLoading(true);
    setErrorMessage('');
    setStatusMessage('Initializing tracking transaction...');

    try {
      // 2. Dispatch payload to your updated Express router
      // If your backend routes use a prefix like /api, change this to '/api/import-document'
      const initResponse = await axios.post('/import-document', { url: scribdUrl });
      const { jobId } = initResponse.data;

      setStatusMessage('Processing document through background pipelines...');

      // 3. Establish an active interval loop polling TiDB every 2 seconds
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await axios.get(`/import-status/${jobId}`);
          const { status, error } = statusResponse.data;

          if (status === 'processing') {
            setStatusMessage('Parsing asset byte streams (this may take a moment)...');
          } 
          
          else if (status === 'completed') {
            clearInterval(pollInterval);
            setStatusMessage('Download ready!');
            setIsLoading(false);

            // 4. Redirect window path directly to the endpoint.
            // Since the server sends attachment headers, this opens a download box 
            // natively without redirecting the user away from the app.
            window.location.href = `/import-status/${jobId}`;
          } 
          
          else if (status === 'failed') {
            clearInterval(pollInterval);
            setIsLoading(false);
            setErrorMessage(`Import Failed: ${error || 'Unknown parsing exception'}`);
          }
        } catch (pollErr) {
          clearInterval(pollInterval);
          setIsLoading(false);
          setErrorMessage('Lost communication with the server state pool.');
        }
      }, 2000);

    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.response?.data?.error || 'Could not communicate with the API Gateway.');
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 max-w-2xl mx-auto mt-6">
      <h2 className="text-xl font-bold text-gray-800 mb-2">Import Lesson Materials</h2>
      <p className="text-sm text-gray-500 mb-4">
        Paste a Scribd link to fetch and download documents directly into your console.
      </p>

      <form onSubmit={handleImportSubmit} className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            placeholder="https://scribd.com..."
            value={scribdUrl}
            onChange={(e) => setScribdUrl(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Import'}
          </button>
        </div>
      </form>

      {/* SYSTEM PROGRESS ANCHORS */}
      {isLoading && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-sm font-medium text-blue-700">{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg text-sm text-red-600 font-medium">
          ⚠️ {errorMessage}
        </div>
      )}
    </div>
  );
}
