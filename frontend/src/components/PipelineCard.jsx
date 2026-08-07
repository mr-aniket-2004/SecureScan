import React from "react";

export default function PipelineCard() {
  return (
    <section className="bg-[#0D121F] border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800/80 pb-4">
        <h2 className="text-xs font-bold font-mono tracking-widest text-slate-400 uppercase">
          How SecScan Works
        </h2>
        <span className="text-xs font-mono text-slate-500 bg-slate-800/50 px-2.5 py-1 rounded-md">
          3-Step Execution Pipeline
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        <div className="flex items-start space-x-4">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-blue-400 font-mono text-sm font-bold flex-shrink-0">
            01
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Provide Repository URL</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Paste any public GitHub repository link into the audit input bar.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-amber-400 font-mono text-sm font-bold flex-shrink-0">
            02
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Automated Deep Audit</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Our backend clones the repo into memory, executing regex pattern scans for secrets and checking package manifests.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-emerald-400 font-mono text-sm font-bold flex-shrink-0">
            03
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Review & Download Report</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Inspect live metrics, exact line-by-line threat locations, and download an executive PDF security report.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}