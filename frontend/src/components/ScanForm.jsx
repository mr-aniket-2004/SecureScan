import React, { useState } from 'react';
import { Search, Loader2, Sparkles, Terminal } from 'lucide-react';

export default function ScanForm({ onScanSubmit, isLoading }) {
  const [repoUrl, setRepoUrl] = useState('');

  const sampleRepos = [
    'https://github.com/mr-aniket-2004/Journey.git',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (repoUrl.trim()) {
      onScanSubmit(repoUrl.trim());
    }
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 rounded-2xl p-6 shadow-2xl mb-8 relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Terminal className="w-5 h-5 text-blue-400" />
          Audit Repository
        </h2>
        <span className="text-xs text-slate-400 font-mono bg-slate-900/60 px-2.5 py-1 rounded-full border border-slate-700">
          v1.0.0
        </span>
      </div>

      <p className="text-slate-400 text-sm mb-6">
        Submit any public Git repository URL to scan for exposed API keys, secret credentials, and vulnerable package dependencies.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="url"
            required
            placeholder="https://github.com/username/repository.git"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            disabled={isLoading}
            className="w-full bg-slate-900/90 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-3.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm font-mono disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !repoUrl.trim()}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-semibold px-6 py-3.5 rounded-xl transition duration-150 shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>Start Security Scan</span>
            </>
          )}
        </button>
      </form>

      {/* Quick sample link */}
      <div className="mt-4 pt-4 border-t border-slate-700/50 flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <span className="flex items-center gap-1 text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Quick Test:
        </span>
        {sampleRepos.map((url) => (
          <button
            key={url}
            type="button"
            onClick={() => setRepoUrl(url)}
            className="font-mono text-blue-400 hover:text-blue-300 hover:underline bg-slate-900/50 px-2 py-0.5 rounded border border-slate-700/60 transition"
          >
            {url.replace('https://github.com/', '')}
          </button>
        ))}
      </div>
    </div>
  );
}