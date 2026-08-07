import React, { useState, useCallback } from "react";
import axios from "axios";

// Sub-components
import Header from "./components/Header";
import PipelineCard from "./components/PipelineCard";
import ScanForm from "./components/ScanForm";
import ScanResults from "./components/ScanResults";
import TerminalLogs from "./components/TerminalLogs";

function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [jobId, setJobId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState("");

  const API_BASE_URL = "https://securescan-9cv9.onrender.com";

  const resetScanState = () => {
    setError("");
    setScanResult(null);
    setJobId(null);
  };

  const handleStartScan = async (e) => {
  
    if (e) e.preventDefault();
    if (!repoUrl) return;

    setLoading(true);
    resetScanState();

    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/scan`, {
        repo_url: repoUrl,
      });

      const activeJobId = response.data.job_id || response.data.id;

      if (!activeJobId) {
        throw new Error("Backend returned an invalid job ID.");
      }

      setJobId(activeJobId);
    } catch (err) {
      console.error("[SCAN_INIT_ERROR]", err);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to connect to backend server."
      );
      setLoading(false);
    }
  };

  const handleQuickTest = () => {
    setRepoUrl("https://github.com/mr-aniket-2004/Journey.git");
  };

  const handleScanComplete = useCallback((finalData) => {
    console.log("=== BACKEND SCAN RESULT PAYLOAD ===", finalData);
    setScanResult(finalData);
    setLoading(false);
  }, []);

  const handleDownloadPDF = () => {
    if (!jobId) return;
    window.open(`${API_BASE_URL}/api/v1/scan/${jobId}/pdf`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#070A10] text-slate-100 font-sans antialiased pb-12">
      <Header />

      <main className="max-w-5xl mx-auto px-6 mt-8 space-y-6">
        <PipelineCard />

        <ScanForm
          repoUrl={repoUrl}
          setRepoUrl={setRepoUrl}
          onStartScan={handleStartScan}
          loading={loading}
          error={error}
          onQuickTest={handleQuickTest}
        />

        {/* Empty State */}
        {!jobId && !loading && !scanResult && (
          <section className="bg-[#0D121F] border border-slate-800 rounded-2xl p-12 text-center shadow-xl">
            <div className="w-12 h-12 bg-slate-800/80 border border-slate-700 rounded-2xl flex items-center justify-center mx-auto text-slate-500 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-white mb-1">No Scan Active</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Enter a GitHub URL above and click "Start Security Scan" to generate a detailed audit report.
            </p>
          </section>
        )}

        {/* Terminal Logs Component */}
        {jobId && (
          <div className="w-full flex justify-center">
            <TerminalLogs jobId={jobId} onComplete={handleScanComplete} />
          </div>
        )}

        {/* Scan Results Component */}
        {scanResult && (
          <ScanResults
            scanResult={scanResult}
            fallbackRepoUrl={repoUrl}
            onDownloadPDF={handleDownloadPDF}
          />
        )}
      </main>
    </div>
  );
}

export default App;