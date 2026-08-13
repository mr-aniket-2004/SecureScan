import React, { useEffect, useState } from 'react';
import { X, Bot, ShieldAlert, Code2, Loader2, AlertCircle } from 'lucide-react';


// TODO: Update this import path to point to where API_BASE_URL is defined in your project
// e.g., import { API_BASE_URL } from '../api/config';
const API_BASE_URL ='https://securescan-hg2e.onrender.com/api/v1';

export default function RemediationModal({ isOpen = true, onClose, finding }) {
  const [remediation, setRemediation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !finding) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const query = new URLSearchParams({
      issue_type: finding.issue_type || '',
      file_path: finding.file_path || '',
      line_number: finding.line_number || 1,
      validation_status: finding.validation_status || 'UNVERIFIED'
    });

    fetch(`${API_BASE_URL}/remediation?${query.toString()}`, {
      signal: controller.signal
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server returned status ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.status === 'SUCCESS' || data.remediation) {
          setRemediation(data.remediation || data);
        } else {
          setError(data.message || 'Failed to generate remediation guide.');
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return; // Ignore request cancellations
        console.error('Failed to fetch remediation:', err);
        setError('Unable to reach the remediation service. Please check backend network connectivity.');
      })
      .finally(() => setLoading(false));

    return () => {
      controller.abort(); // Cleanup fetch request on unmount/close
    };
  }, [isOpen, finding]);

  if (!isOpen || !finding) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/50">
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-base">
            <Bot className="w-5 h-5 text-blue-400" />
            AI Remediation Guide
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm font-medium">Generating AI Rotation Instructions...</p>
            </div>
          ) : error ? (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-6 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <p className="text-rose-300 font-medium text-sm">{error}</p>
            </div>
          ) : remediation ? (
            <>
              {/* Overview Box */}
              <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">{remediation.title || finding.issue_type}</h3>
                  <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md border ${
                    remediation.urgency === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {remediation.urgency || 'HIGH'}
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">{remediation.summary}</p>
              </div>

              {/* Action Steps */}
              {remediation.steps && remediation.steps.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-emerald-400" />
                    Recommended Action Steps
                  </h4>
                  <ul className="space-y-2">
                    {remediation.steps.map((step, idx) => (
                      <li key={idx} className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 font-mono">
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Code Fix Example */}
              {remediation.code_example && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-blue-400" />
                    Secure Implementation Fix
                  </h4>
                  <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto">
                    <code>{remediation.code_example}</code>
                  </pre>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}