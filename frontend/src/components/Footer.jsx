import React from "react";

export default function Footer({ onDownloadOffline }) {
  return (
    <footer className="w-full border-t border-zinc-800 bg-[#0d121f] px-4 py-3 sm:py-0 sm:h-12 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 text-xs font-mono text-zinc-400 select-none shrink-0">
      {/* Brand & Auditor Label */}
      <div className="flex items-center gap-2 text-center sm:text-left">
        <span className="text-zinc-200 font-semibold">SecScan Engine</span>
        <span className="text-zinc-600">|</span>
        <span className="text-zinc-500 text-[11px] sm:text-xs">
          Automated GitHub Security Auditor
        </span>
      </div>

      {/* Offline CLI Download Action */}
      <div className="flex items-center justify-center w-full sm:w-auto">
        <button
          type="button"
          onClick={onDownloadOffline}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#161f30] hover:bg-[#1c283f] text-cyan-300 hover:text-cyan-200 border border-cyan-800/60 px-3.5 py-1.5 rounded text-xs transition shadow-sm"
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
          </svg>
          <span>Download Offline CLI</span>
          <span className="bg-emerald-900/60 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded border border-emerald-700/50 shrink-0">
            v1.0 LIVE
          </span>
        </button>
      </div>

      {/* Credits (Visible on Tablet & Desktop) */}
      <div className="hidden md:flex items-center gap-2 text-zinc-500 text-[11px]">
        <span>MCA Final Year Thesis</span>
        <span>•</span>
        <span>React + FastAPI + Supabase</span>
      </div>
    </footer>
  );
}