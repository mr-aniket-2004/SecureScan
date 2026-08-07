import React from "react";

export default function ScanForm({ repoUrl, setRepoUrl, onStartScan, loading, error, onQuickTest }) {
  return (
    <section className="bg-[#0D121F] border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-blue-400 font-mono">&gt;_</span> Audit Repository
        </h2>
        <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
          v1.0.0
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-6">
        Submit any public Git repository URL to scan for exposed API keys, secret credentials, and vulnerable package dependencies.
      </p>

      <form onSubmit={onStartScan} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="url"
            placeholder="https://github.com/username/repository.git"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            required
            disabled={loading}
            className="flex-1 bg-[#070A10] border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-mono"
          />
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3.5 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg ${
              loading
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 active:scale-95"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {loading ? "Initializing Audit..." : "Start Security Scan"}
          </button>
        </div>
      </form>

      <div className="mt-4 flex items-center space-x-2 text-xs">
        <span className="text-amber-400 flex items-center gap-1 font-medium">✨ Quick Test:</span>
        <button
          onClick={onQuickTest}
          type="button"
          disabled={loading}
          className="font-mono bg-slate-800/80 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700 hover:border-slate-600 transition"
        >
          mr-aniket-2004/Journey.git
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-950/40 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center space-x-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </section>
  );
}