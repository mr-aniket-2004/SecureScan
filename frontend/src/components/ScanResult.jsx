import React from "react";

export default function ScanResults({ scanResult, fallbackRepoUrl, onDownloadPDF }) {
  const findingsList =
    scanResult?.findings ||
    scanResult?.secrets ||
    scanResult?.vulnerabilities ||
    scanResult?.results ||
    [];

  const hasMetricsIssues =
    (scanResult?.secrets_found ?? 0) > 0 ||
    (scanResult?.vulnerabilities_found ?? 0) > 0;

  const totalCount =
    findingsList.length > 0
      ? findingsList.length
      : hasMetricsIssues
      ? (scanResult?.secrets_found || 0) + (scanResult?.vulnerabilities_found || 0)
      : 0;

  return (
    <section className="bg-[#0D121F] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white">Scan Audit Summary</h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            {scanResult.repo_url || fallbackRepoUrl}
          </p>
        </div>

        <button
          onClick={onDownloadPDF}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 self-start md:self-auto shadow-lg shadow-emerald-600/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Executive PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#070A10] p-4 rounded-xl border border-slate-800 text-center">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">
            Security Grade
          </span>
          <span
            className={`text-4xl font-black ${
              scanResult.security_score === "A"
                ? "text-emerald-400"
                : scanResult.security_score === "C"
                ? "text-amber-400"
                : "text-red-500"
            }`}
          >
            {scanResult.security_score || "A"}
          </span>
        </div>

        <div className="bg-[#070A10] p-4 rounded-xl border border-slate-800 text-center">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">
            Secrets Leaked
          </span>
          <span className="text-4xl font-black text-red-400">
            {scanResult.secrets_found ?? 0}
          </span>
        </div>

        <div className="bg-[#070A10] p-4 rounded-xl border border-slate-800 text-center">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">
            Vulnerabilities
          </span>
          <span className="text-4xl font-black text-amber-400">
            {scanResult.vulnerabilities_found ?? 0}
          </span>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 tracking-wide uppercase font-mono">
            Detailed Findings
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Total Issues: {totalCount}
          </span>
        </div>

        {findingsList.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#070A10]">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-[#0D121F] text-slate-400 border-b border-slate-800">
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider w-28">
                    Severity
                  </th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">
                    Type
                  </th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">
                    File Path
                  </th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider w-20 text-center">
                    Line
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {findingsList.map((item, idx) => {
                  const severity = (item.severity || item.level || "HIGH").toUpperCase();
                  const type = item.type || item.issue_type || item.rule_name || "Unclassified Finding";
                  const filePath = item.file_path || item.file || item.path || "N/A";
                  const lineNo = item.line_number || item.line || item.line_no || "-";

                  return (
                    <React.Fragment key={idx}>
                      <tr className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded text-[11px] font-bold border ${
                              severity === "HIGH" || severity === "CRITICAL"
                                ? "bg-red-950/60 text-red-400 border-red-800/50"
                                : severity === "MEDIUM"
                                ? "bg-amber-950/60 text-amber-400 border-amber-800/50"
                                : "bg-blue-950/60 text-blue-400 border-blue-800/50"
                            }`}
                          >
                            {severity}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-200">{type}</td>
                        <td className="py-3 px-4 text-slate-400 break-all">{filePath}</td>
                        <td className="py-3 px-4 text-center font-bold text-slate-300">{lineNo}</td>
                      </tr>
                      {item.remediation && (
                        <tr className="bg-slate-950/40 border-b border-slate-800">
                          <td colSpan={4} className="px-4 py-2 text-[11px] text-emerald-400 font-sans">
                            💡 <span className="font-bold font-mono">AI Fix:</span> {item.remediation}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : hasMetricsIssues ? (
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-6 text-center text-xs text-amber-300 font-mono">
            ⚠️ Issues were flagged in the summary, but detailed line items were not provided in the backend response array.
          </div>
        ) : (
          <div className="bg-[#070A10] border border-slate-800 rounded-xl p-6 text-center text-xs text-slate-400 font-mono">
            ✅ No security vulnerabilities or leaked secrets detected.
          </div>
        )}
      </div>
    </section>
  );
}