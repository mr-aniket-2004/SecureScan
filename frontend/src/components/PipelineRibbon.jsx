import React from "react";

export default function PipelineRibbon({ scanResult, isScanning, onSelectPreset }) {
  const currentStep = isScanning ? 2 : scanResult ? 3 : 1;

  return (
    <div className="w-full shrink-0 select-none border-b border-zinc-800">
      {/* 3-Step Execution Pipeline Ribbon with fluid touch scroll */}
      <section className="bg-[#0a0e18] px-3 sm:px-4 py-2 border-b border-zinc-800/60 overflow-x-auto scrollbar-none flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-3 sm:gap-6 min-w-max py-0.5">
          <span className="text-zinc-500 font-semibold tracking-wider text-[10px]">PIPELINE:</span>

          <div className={`flex items-center gap-1.5 ${currentStep >= 1 ? "text-cyan-300" : "text-zinc-500"}`}>
            <span className="w-4 h-4 rounded-full bg-cyan-950 border border-cyan-500/80 text-cyan-400 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
            <span className="whitespace-nowrap">Provide Repo URL</span>
          </div>
          <span className="text-zinc-700">→</span>

          <div className={`flex items-center gap-1.5 ${currentStep >= 2 ? "text-cyan-300" : "text-zinc-500"}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${currentStep >= 2 ? "bg-cyan-950 border border-cyan-500/80 text-cyan-400" : "bg-zinc-900 border border-zinc-800 text-zinc-600"}`}>2</span>
            <span className="whitespace-nowrap">AST & In-Memory Audit</span>
          </div>
          <span className="text-zinc-700">→</span>

          <div className={`flex items-center gap-1.5 ${currentStep >= 3 ? "text-cyan-300" : "text-zinc-500"}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${currentStep >= 3 ? "bg-cyan-950 border border-cyan-500/80 text-cyan-400" : "bg-zinc-900 border border-zinc-800 text-zinc-600"}`}>3</span>
            <span className="whitespace-nowrap">Threats & Remediation Engine</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-zinc-500 text-[11px] shrink-0 ml-4">
          <span>Engine: <strong className="text-emerald-400">v1.0.0 Ready</strong></span>
          <span>•</span>
          <span>Memory Limit: <strong className="text-zinc-300">128MB Sandboxed</strong></span>
        </div>
      </section>

      {/* Preset & Metric Quick Strip: Wraps naturally on small screens */}
      <div className="bg-[#0d121f]/50 px-3 sm:px-4 py-2 sm:py-0 sm:h-10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        {scanResult ? (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px]">
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> STATUS: COMPLETED
            </span>
            <span className="text-zinc-700 hidden sm:inline">|</span>
            <span className="shrink-0">SCORE: <strong className="text-amber-400">{scanResult.security_score || "Grade C"}</strong></span>
            <span className="text-zinc-700 hidden sm:inline">|</span>
            <span className="shrink-0">SECRETS: <strong className="text-zinc-200">{scanResult.exposed_secrets_count ?? 0}</strong></span>
            <span className="text-zinc-700 hidden sm:inline">|</span>
            <span className="shrink-0">VULNERABILITIES: <strong className="text-rose-400">{scanResult.vulnerabilities_count ?? (scanResult.findings?.length || 0)}</strong></span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-zinc-500 text-[10px] sm:text-[11px]">QUICK PRESETS:</span>
            <button
              type="button"
              onClick={() => onSelectPreset("https://github.com/mr-aniket-2004/Journey.git")}
              className="bg-[#121929] hover:bg-[#1a243a] text-cyan-300 hover:text-white px-2 py-0.5 rounded border border-cyan-900/50 text-[10px] sm:text-[11px] transition"
            >
              Journey.git
            </button>
            <button
              type="button"
              onClick={() => onSelectPreset("https://github.com/mr-aniket-2004/SecureScan.git")}
              className="bg-[#121929] hover:bg-[#1a243a] text-zinc-400 hover:text-white px-2 py-0.5 rounded border border-zinc-800 text-[10px] sm:text-[11px] transition"
            >
              SecureScan.git
            </button>
          </div>
        )}

        <div className="text-[10px] sm:text-[11px] text-zinc-500 font-mono hidden md:block truncate max-w-xs">
          {scanResult ? `Target: ${scanResult.repo_url || "Audited Repo"}` : "Mode: In-Memory Sandboxed"}
        </div>
      </div>
    </div>
  );
}