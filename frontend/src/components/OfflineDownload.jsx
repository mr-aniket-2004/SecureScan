import React, { useState } from 'react';
import { Download, Terminal, Check, Copy, ShieldCheck, Cpu, X } from 'lucide-react';

const OfflineDownload = ({ isOpen, onClose }) => {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
            <ShieldCheck className="w-4 h-4" /> Standalone CLI Tool
          </div>
          <h2 className="text-2xl font-bold text-white">SecScan Offline Security Auditor</h2>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            Run secret detection and vulnerability scanning locally in your terminal or CI/CD pipeline—100% offline, private, and fast.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Option 1: One-Line Terminal Installer */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-blue-500/40 transition-colors">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Terminal className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Global Terminal Install</h3>
              <p className="text-slate-400 text-xs">
                Downloads the binary and registers system <code className="text-slate-200">PATH</code> automatically.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                PowerShell Command
              </label>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between gap-2">
                <code className="text-[11px] font-mono text-emerald-400 truncate">
                  {installCommand}
                </code>
                <button
                  onClick={handleCopy}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Copy Command"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              {copied && (
                <p className="text-[10px] text-emerald-400 font-medium">Copied to clipboard!</p>
              )}
            </div>
          </div>

          {/* Option 2: Direct Binary Executable */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-blue-500/40 transition-colors">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Direct Binary Executable</h3>
              <p className="text-slate-400 text-xs">
                Download raw <code className="text-slate-200">securescan.exe</code> directly from GitHub Releases.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Version: v1.0.0</span>
                <span>Platform: Windows x64</span>
              </div>
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors shadow-lg shadow-blue-600/20"
              >
                <Download className="w-4 h-4" /> Download securescan.exe (11.1 MB)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineDownload;