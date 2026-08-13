import React from 'react';
import { Download, ShieldCheck, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { getPdfDownloadUrl } from '../services/api';

export default function ScanResult({ job }) {
  // Empty State before any scan is submitted
  if (!job) {
    return (
      <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
        <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-slate-300 font-semibold text-lg mb-1">No Scan Active</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Enter a GitHub URL above and click "Start Security Scan" to generate a detailed audit report.
        </p>
      </div>
    );
  }

  const isCompleted = job.status === 'COMPLETED';
  const isInProgress = job.status === 'IN_PROGRESS' || job.status === 'PENDING';

  const getScoreBadge = (score) => {
    switch (score) {
      case 'A':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          label: 'Grade A (Secure)',
        };
      case 'C':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          label: 'Grade C (Warning)',
        };
      case 'F':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          label: 'Grade F (Critical Risk)',
        };
      default:
        return {
          bg: 'bg-slate-700 border-slate-600 text-slate-300',
          label: 'Pending',
        };
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
      case 'HIGH':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  // Status badge styling for Feature 1 validation status
  const getValidationBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold';
      case 'REVOKED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
    }
  };

  const scoreInfo = getScoreBadge(job.security_score);

  return (
    <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 rounded-2xl p-6 shadow-2xl transition-all">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/80 pb-6 mb-6">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Target Repository</span>
          <h3 className="text-lg font-mono text-blue-400 font-semibold break-all mt-0.5">{job.repo_url}</h3>
          <p className="text-xs text-slate-500 font-mono mt-1">Job ID: {job.id}</p>
        </div>

        {isCompleted && (
          <a
            href={getPdfDownloadUrl(job.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm shadow-lg shadow-emerald-600/20 shrink-0"
          >
            <Download className="w-4 h-4" />
            Download PDF Report
          </a>
        )}
      </div>

      {/* Progress State */}
      {isInProgress && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 bg-slate-900/60 rounded-xl border border-slate-700/50 my-2">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <div className="text-center">
            <p className="text-white font-semibold text-base">Running Security Audit...</p>
            <p className="text-slate-400 text-xs mt-1">Cloning code repository, validating tokens, and inspecting package dependencies.</p>
          </div>
        </div>
      )}

      {/* Completed Results */}
      {isCompleted && (
        <>
          {/* Summary Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/80">
              <span className="text-slate-400 text-xs uppercase font-medium">Status</span>
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <p className="text-base font-semibold text-emerald-400 capitalize">{job.status}</p>
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/80">
              <span className="text-slate-400 text-xs uppercase font-medium">Security Score</span>
              <div className="mt-2">
                <span className={`inline-block px-3 py-1 text-xs font-bold rounded-lg border ${scoreInfo.bg}`}>
                  {scoreInfo.label}
                </span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/80">
              <span className="text-slate-400 text-xs uppercase font-medium">Exposed Secrets</span>
              <p className={`text-2xl font-bold mt-1 ${job.secrets_found > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                {job.secrets_found}
              </p>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/80">
              <span className="text-slate-400 text-xs uppercase font-medium">Vulnerabilities</span>
              <p className={`text-2xl font-bold mt-1 ${job.vulnerabilities_found > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
                {job.vulnerabilities_found}
              </p>
            </div>
          </div>

          {/* Detailed Findings Table */}
          <div>
            <h4 className="text-base font-semibold text-white mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Detailed Findings
              </span>
              <span className="text-xs font-normal text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-700">
                {job.findings?.length || 0} issues detected
              </span>
            </h4>

            {!job.findings || job.findings.length === 0 ? (
              <div className="bg-slate-900/60 p-8 rounded-xl text-center border border-slate-700/50">
                <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h5 className="text-white font-semibold text-base mb-1">Clean Scan Results!</h5>
                <p className="text-slate-400 text-xs">No leaked credentials or vulnerable package dependencies were found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-700/80 rounded-xl">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-xs font-semibold tracking-wider border-b border-slate-700/80">
                    <tr>
                      <th className="py-3.5 px-4">Severity</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4">File Path</th>
                      <th className="py-3.5 px-4">Line</th>
                      <th className="py-3.5 px-4">Match Preview</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 bg-slate-900/40">
                    {job.findings.map((finding, idx) => (
                      <tr key={finding.id || `finding-${idx}`} className="hover:bg-slate-700/30 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-md border ${getSeverityBadge(finding.severity)}`}>
                            {finding.severity}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-md border ${getValidationBadge(finding.validation_status)}`}>
                            {finding.validation_status || 'UNVERIFIED'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-white whitespace-nowrap">{finding.issue_type}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-300 text-xs whitespace-nowrap">{finding.file_path}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-400 text-xs whitespace-nowrap">{finding.line_number}</td>
                        <td className="py-3.5 px-4 font-mono text-rose-300 text-xs">
                          <span className="bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded inline-block max-w-xs truncate">
                            {finding.raw_match}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}