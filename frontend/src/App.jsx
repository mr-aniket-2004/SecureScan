import React, { useState } from 'react';
import axios from 'axios';
import TerminalLogs from './components/TerminalLogs';

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [jobId, setJobId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');

  const handleStartScan = async (e) => {
    e.preventDefault();
    if (!repoUrl) return;

    setLoading(true);
    setError('');
    setScanResult(null);
    setJobId(null);

    try {
      // 1. Submit scan request to backend
      const response = await axios.post('https://securescan-9cv9.onrender.com/api/v1/scan', {
        repo_url: repoUrl
      });

      // 2. Save returned job_id to trigger TerminalLogs WebSocket connection
      const activeJobId = response.data.job_id;
      setJobId(activeJobId);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to initiate scan job.');
      setLoading(false);
    }
  };

  const handleScanComplete = (finalData) => {
    setScanResult(finalData);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-6">
      <header className="max-w-4xl w-full text-center my-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-blue-400 mb-2">
          🛡️ SecScan Engine
        </h1>
        <p className="text-gray-400">
          Automated GitHub Security, Secret Detection & Dependency Auditor
        </p>
      </header>

      {/* Input Form */}
      <div className="max-w-xl w-full bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
        <form onSubmit={handleStartScan} className="flex flex-col gap-4">
          <label className="text-sm font-semibold text-gray-300">
            GitHub Repository URL
          </label>
          <input
            type="url"
            placeholder="https://github.com/username/repository"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            required
            disabled={loading}
            className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
          />
          <button
            type="submit"
            disabled={loading}
            className={`py-3 px-6 rounded-lg font-bold text-white transition ${
              loading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/30'
            }`}
          >
            {loading ? 'Scanning in Progress...' : 'Start Security Scan'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Phase 1: Real-Time Live Terminal Stream */}
      {jobId && loading && (
        <TerminalLogs jobId={jobId} onComplete={handleScanComplete} />
      )}

      {/* Results View */}
      {scanResult && (
        <div className="max-w-3xl w-full my-6 bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-2xl font-bold mb-4">Scan Audit Summary</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-900 p-4 rounded text-center border border-slate-700">
              <span className="block text-gray-400 text-sm">Security Score</span>
              <span className="text-3xl font-black text-yellow-400">{scanResult.security_score}</span>
            </div>
            <div className="bg-slate-900 p-4 rounded text-center border border-slate-700">
              <span className="block text-gray-400 text-sm">Secrets Leaked</span>
              <span className="text-3xl font-black text-red-400">{scanResult.secrets_found}</span>
            </div>
            <div className="bg-slate-900 p-4 rounded text-center border border-slate-700">
              <span className="block text-gray-400 text-sm">Vulnerabilities</span>
              <span className="text-3xl font-black text-orange-400">{scanResult.vulnerabilities_found}</span>
            </div>
          </div>

          {/* AI Remediation View (Phase 2) */}
          {scanResult.findings?.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-300">🤖 AI Security Remediation Suggestions</h3>
              {scanResult.findings.map((item, idx) => (
                <div key={idx} className="bg-slate-900 p-4 rounded border border-slate-700 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-gray-400">{item.file_path}:{item.line_number}</span>
                    <span className="px-2 py-0.5 rounded bg-red-900/60 text-red-300 font-bold">{item.severity}</span>
                  </div>
                  <p className="text-sm font-semibold text-white">{item.issue_type}</p>
                  <p className="text-xs text-green-400 font-mono bg-slate-950 p-2 rounded">{item.remediation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;