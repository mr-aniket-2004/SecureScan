import React from 'react';
import { GitBranch, ShieldCheck, Download, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Provide Repository URL',
      description: 'Paste any public GitHub repository link into the audit input bar.',
      icon: GitBranch,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    },
    {
      number: '02',
      title: 'Automated Deep Audit',
      description: 'Our backend clones the repo into memory, executing regex pattern scans for secrets and checking package manifests.',
      icon: ShieldCheck,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
    {
      number: '03',
      title: 'Review & Download Report',
      description: 'Inspect live metrics, exact line-by-line threat locations, and download an executive PDF security report.',
      icon: Download,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
  ];

  return (
    <div className="bg-slate-800/60 backdrop-blur border border-slate-700/80 rounded-2xl p-6 shadow-xl mb-8">
      <div className="flex items-center justify-between mb-4 border-b border-slate-700/60 pb-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
          How SecScan Works
        </h3>
        <span className="text-xs text-slate-400 font-mono">3-Step Execution Pipeline</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={step.number} className="relative flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2.5 rounded-xl border ${step.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black text-slate-600 font-mono">{step.number}</span>
                </div>

                <h4 className="text-white font-semibold text-base mb-1">{step.title}</h4>
                <p className="text-slate-400 text-xs leading-relaxed">{step.description}</p>
              </div>

              {/* Step divider arrow for desktop */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-slate-600">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}