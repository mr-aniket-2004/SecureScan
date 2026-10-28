import React, { useState } from 'react';
import { Download, Terminal, Check, Copy, ShieldCheck, Cpu, X } from 'lucide-react';

export default function OfflineDownload({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const installCommand = `irm https://raw.githubusercontent.com/mr-aniket-2004/SecureScan/main/install.ps1 | iex`;
  const downloadUrl = `https://github.com/mr-aniket-2004/SecureScan/releases/download/v1/securescan.exe`;

  const handleCopy = () => {
    navigator.clipboard.writeText(installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-[#0b0f19] border border-zinc-800 rounded-xl p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-6 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 text-zinc-400 hover:text-white rounded-lg bg-zinc-900 border border-zinc-800 transition"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5 sm:space-y-2 pr-6 sm:pr-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/60 text-cyan-400 text-[10px] sm:text-xs font-mono border border-cyan-800/40">
            <ShieldCheck className="w-3.5 h-3.5" /> Standalone CLI Tool
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
            SecScan Offline Auditor
          </h2>
          <p className="text-zinc-400 text-[11px] sm:text-xs max-w-md mx-auto leading-relaxed">
            Run regex detection and AST audits locally in your terminal—zero network traffic, sandboxed, and fast.
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Option 1: Terminal Installer */}
          <div className="bg-[#070a12] border border-zinc-800 rounded-lg p-3.5 sm:p-4 flex flex-col justify-between space-y-3 hover:border-cyan-500/40 transition">
            <div className="space-y-1.5">
              <div className="w-7 h-7 rounded bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
                <Terminal className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-white">Global Terminal Install</h3>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Downloads binary and registers system <code className="text-zinc-200 font-mono">PATH</code> automatically.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] sm:text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                PowerShell Command
              </label>
              <div className="bg-[#05070d] border border-zinc-800 rounded p-2 flex items-center justify-between gap-2 min-w-0">
                <code className="text-[10px] sm:text-[11px] font-mono text-emerald-400 truncate select-all">
                  {installCommand}
                </code>
                <button
                  onClick={handleCopy}
                  className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white shrink-0 transition"
                  title="Copy Command"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              {copied && (
                <p className="text-[10px] text-emerald-400 font-mono">Copied to clipboard!</p>
              )}
            </div>
          </div>

          {/* Option 2: Direct Binary Executable */}
          <div className="bg-[#070a12] border border-zinc-800 rounded-lg p-3.5 sm:p-4 flex flex-col justify-between space-y-3 hover:border-cyan-500/40 transition">
            <div className="space-y-1.5">
              <div className="w-7 h-7 rounded bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-white">Direct Binary</h3>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Download standalone <code className="text-zinc-200 font-mono">securescan.exe</code> from GitHub Releases.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                <span>v1.0.0</span>
                <span>Windows x64</span>
              </div>
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Download .exe (11.1 MB)</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}