import React from 'react';
import { Shield, HardDriveDownload, Globe, Heart } from 'lucide-react';

export default function Footer() {
  const handleOfflineClick = () => {
    alert("Offline Desktop App scanner (Electron / CLI package) coming soon in future releases!");
  };

  return (
    <footer className="border-t border-slate-800 bg-slate-900/90 backdrop-blur mt-16 py-8">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        
        {/* Left: Brand / Project info */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/20 p-1.5 rounded-lg border border-blue-500/30 text-blue-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-200">SecScan Engine</p>
            <p className="text-slate-500">Automated GitHub Security & Dependency Auditor</p>
          </div>
        </div>

        {/* Center: Future Feature Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOfflineClick}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 border border-slate-700 px-4 py-2 rounded-xl font-medium transition text-xs shadow-md"
          >
            <HardDriveDownload className="w-4 h-4 text-amber-400" />
            <span>Download Offline</span>
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded ml-1">
              Coming Soon
            </span>
          </button>
        </div>

        {/* Right: Copyright & Credits */}
        <div className="text-center md:text-right text-slate-500">
          <p>Academic Project • Final Year Security Audit Platform</p>
          <p className="mt-0.5 flex items-center justify-center md:justify-end gap-1">
            Built with React, FastAPI & Supabase
          </p>
        </div>

      </div>
    </footer>
  );
}