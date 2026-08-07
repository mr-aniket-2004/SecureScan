import React, { useState } from "react";
import axios from "axios";
import TerminalLogs from "./components/TerminalLogs";

function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [jobId, setJobId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState("");

  const API_BASE_URL = "https://securescan-9cv9.onrender.com";

  const handleStartScan = async (e) => {
    if (e) e.preventDefault();
    if (!repoUrl) return;

    setLoading(true);
    setError("");
    setScanResult(null);
    setJobId(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/scan`, {
        repo_url: repoUrl,
      });

      // Safely extract ID whether backend returns 'id' or 'job_id'
      const activeJobId = response.data.job_id || response.data.id;

      if (!activeJobId) {
        throw new Error("Backend returned an invalid job ID.");
      }

      setJobId(activeJobId);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to connect to backend server.",
      );
      setLoading(false);
    }
  };

  const handleQuickTest = () => {
    const testUrl = "https://github.com/mr-aniket-2004/Journey.git";
    setRepoUrl(testUrl);
  };

  const handleScanComplete = (finalData) => {
    setScanResult(finalData);
    setLoading(false);
  };

  const handleDownloadPDF = () => {
    if (!jobId) return;
    window.open(`${API_BASE_URL}/api/v1/scan/${jobId}/pdf`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#070A10] text-slate-100 font-sans antialiased pb-12">
      {/* 1. NAVBAR HEADER */}
      <header className="border-b border-slate-800/80 bg-[#0B0F17]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600/20 p-2.5 rounded-xl border border-blue-500/30 text-blue-400">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide leading-none flex items-center gap-2">
                SecScan Engine
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Automated GitHub Security & Dependency Auditor
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-emerald-950/40 border border-emerald-500/30 px-3.5 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono font-medium text-emerald-300">
              FastAPI + Supabase Active
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 mt-8 space-y-6">
        {/* 2. HOW SECSCAN WORKS PIPELINE CARD */}
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
            {/* Step 1 */}
            <div className="flex items-start space-x-4">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-blue-400 font-mono text-sm font-bold flex-shrink-0">
                01
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Provide Repository URL
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Paste any public GitHub repository link into the audit input
                  bar.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start space-x-4">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-amber-400 font-mono text-sm font-bold flex-shrink-0">
                02
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Automated Deep Audit
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Our backend clones the repo into memory, executing regex
                  pattern scans for secrets and checking package manifests.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start space-x-4">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-emerald-400 font-mono text-sm font-bold flex-shrink-0">
                03
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Review & Download Report
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Inspect live metrics, exact line-by-line threat locations, and
                  download an executive PDF security report.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. AUDIT REPOSITORY INPUT CARD */}
        <section className="bg-[#0D121F] border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-blue-400 font-mono">&gt;_</span> Audit
              Repository
            </h2>
            <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
              v1.0.0
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            Submit any public Git repository URL to scan for exposed API keys,
            secret credentials, and vulnerable package dependencies.
          </p>

          <form onSubmit={handleStartScan} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="url"
                placeholder="https://github.com/username/repository.git"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                required
                disabled={loading}
                className="flex-1 bg-[#070A10] border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-mono"
              />
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3.5 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg ${
                  loading
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 active:scale-95"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {loading ? "Initializing Audit..." : "Start Security Scan"}
              </button>
            </div>
          </form>

          {/* Quick Test Option */}
          <div className="mt-4 flex items-center space-x-2 text-xs">
            <span className="text-amber-400 flex items-center gap-1 font-medium">
              ✨ Quick Test:
            </span>
            <button
              onClick={handleQuickTest}
              type="button"
              disabled={loading}
              className="font-mono bg-slate-800/80 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700 hover:border-slate-600 transition"
            >
              mr-aniket-2004/Journey.git
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-950/40 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center space-x-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}
        </section>

        {/* 4. DYNAMIC CONTENT AREA (EMPTY STATE / TERMINAL STREAM / RESULTS) */}
        {!loading && !scanResult && (
          <section className="bg-[#0D121F] border border-slate-800 rounded-2xl p-12 text-center shadow-xl">
            <div className="w-12 h-12 bg-slate-800/80 border border-slate-700 rounded-2xl flex items-center justify-center mx-auto text-slate-500 mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-white mb-1">
              No Scan Active
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Enter a GitHub URL above and click "Start Security Scan" to
              generate a detailed audit report.
            </p>
          </section>
        )}

        {/* WebSocket Real-Time Terminal View */}
        {jobId && loading && (
          <div className="w-full flex justify-center">
            <TerminalLogs jobId={jobId} onComplete={handleScanComplete} />
          </div>
        )}

        {/* Audit Results Dashboard */}
        {scanResult && (
          <section className="bg-[#0D121F] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Scan Audit Summary
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  {scanResult.repo_url}
                </p>
              </div>

              <button
                onClick={handleDownloadPDF}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 self-start md:self-auto shadow-lg shadow-emerald-600/20"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download Executive PDF
              </button>
            </div>

            {/* Metric Score Cards */}
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
                  {scanResult.security_score}
                </span>
              </div>

              <div className="bg-[#070A10] p-4 rounded-xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">
                  Secrets Leaked
                </span>
                <span className="text-4xl font-black text-red-400">
                  {scanResult.secrets_found}
                </span>
              </div>

              <div className="bg-[#070A10] p-4 rounded-xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">
                  Vulnerabilities
                </span>
                <span className="text-4xl font-black text-amber-400">
                  {scanResult.vulnerabilities_found}
                </span>
              </div>
            </div>

            {/* Findings List & Remediation */}
            {scanResult.findings?.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-slate-300">
                  Detailed Findings Audit
                </h3>
                <div className="space-y-3">
                  {scanResult.findings.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-[#070A10] p-4 rounded-xl border border-slate-800 space-y-2"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono text-slate-400">
                          {item.file_path}:{item.line_number}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/50 font-bold font-mono">
                          {item.severity}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-white">
                        {item.issue_type}
                      </p>
                      {item.remediation && (
                        <p className="text-xs text-emerald-400 font-mono bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                          💡{" "}
                          <span className="font-bold">AI Fix Suggestion:</span>{" "}
                          {item.remediation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
