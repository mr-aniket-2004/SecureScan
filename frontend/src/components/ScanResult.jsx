import React, { useState } from 'react';
import { Download, ShieldCheck, FileText, Loader2, CheckCircle2, Bot, AlertTriangle } from 'lucide-react';
import { getPdfDownloadUrl } from '../services/api';
import RemediationModal from './RemediationModal';

export default function ScanResult({ job }) {
  const [selectedFinding, setSelectedFinding] = useState(null);

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
  const isFailed = job.status === 'FAILED';

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

  // Normalizes finding data before sending it to RemediationModal
  const handleOpenFixGuide = (finding) => {
    const rawPath = finding.file_path || finding.file || 'Unknown Path';
    const normalizedPath = rawPath.replace(/\\/g, '/'); // Converts Windows backslashes to standard slashes

    setSelectedFinding({
      ...finding,
      file_path: normalizedPath,
      issue_type: finding.issue_type || finding.rule_id || 'Security Vulnerability',
      line_number: finding.line_number || finding.line || 1,
      validation_status: finding.validation_status || 'UNVERIFIED',
    });
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

      {/* Failed State */}
      {isFailed && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-8 text-center my-4">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <h4 className="text-rose-400 font-semibold text-lg mb-1">Scan Job Failed</h4>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            An error occurred while cloning or scanning this repository. Check your backend terminal output for details.
          </p>
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
                <table className="w-full text-left text-sm text-slate-300 border-collapse">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-xs font-semibold tracking-wider border-b border-slate-700/80">
                    <tr>
                      <th className="py-3.5 px-3">Severity</th>
                      <th className="py-3.5 px-3">Status</th>
                      <th className="py-3.5 px-3">Type</th>
                      <th className="py-3.5 px-3">File Path</th>
                      <th className="py-3.5 px-3">Line</th>
                      <th className="py-3.5 px-3">Match Preview</th>
                      <th className="py-3.5 px-3 text-right">AI Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 bg-slate-900/40">
                    {job.findings.map((finding, idx) => {
                      const displayPath = (finding.file_path || finding.file || 'Unknown').replace(/\\/g, '/');
                      return (
                        <tr key={finding.id || `finding-${idx}`} className="hover:bg-slate-700/30 transition-colors">
                          <td className="py-3.5 px-3">
                            <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-md border ${getSeverityBadge(finding.severity)}`}>
                              {finding.severity || 'MEDIUM'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-md border ${getValidationBadge(finding.validation_status)}`}>
                              {finding.validation_status || 'UNVERIFIED'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 font-medium text-white max-w-[160px] truncate" title={finding.issue_type}>
                            {finding.issue_type || 'Vulnerability'}
                          </td>
                          <td className="py-3.5 px-3 font-mono text-slate-300 text-xs max-w-[200px] truncate" title={displayPath}>
                            {displayPath}
                          </td>
                          <td className="py-3.5 px-3 font-mono text-slate-400 text-xs">
                            {finding.line_number || finding.line || 0}
                          </td>
                          <td className="py-3.5 px-3 font-mono text-rose-300 text-xs max-w-[180px] truncate">
                            <span className="bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded inline-block truncate max-w-full" title={finding.raw_match}>
                              {finding.raw_match || 'N/A'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <button
                              onClick={() => handleOpenFixGuide(finding)}
                              className="inline-flex items-center gap-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/40 text-blue-300 hover:text-white px-3 py-1 rounded-lg text-xs font-medium transition-all active:scale-95 shrink-0"
                            >
                              <Bot className="w-3.5 h-3.5" />
                              Fix Guide
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* AI Remediation Guide Modal */}
      {selectedFinding && (
        <RemediationModal
          finding={selectedFinding}
          onClose={() => setSelectedFinding(null)}
        />
      )}
    </div>
  );
}