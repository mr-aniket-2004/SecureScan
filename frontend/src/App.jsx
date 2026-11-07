import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PipelineRibbon from './components/PipelineRibbon';
import RemediationWorkbench from './components/RemediationWorkbench';
import Footer from './components/Footer';
import OfflineDownload from './components/OfflineDownload';
import { triggerScan, fetchScanStatus, getPdfDownloadUrl } from './services/api';
import { ShieldCheck, CheckCircle2, X, Download } from 'lucide-react';

export default function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [currentJob, setCurrentJob] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [logs, setLogs] = useState([
    'Daemon initialized and listening on port 8000',
    'Connected to Supabase session store',
    'Git in-memory orchestrator: IDLE',
  ]);
  const [showHealthyPopup, setShowHealthyPopup] = useState(false);

  // Exact polling effect from your original App.jsx
  useEffect(() => {
    let intervalId;

    if (currentJob && (currentJob.status === 'PENDING' || currentJob.status === 'IN_PROGRESS')) {
      intervalId = setInterval(async () => {
        try {
          const updatedJob = await fetchScanStatus(currentJob.id);
          setCurrentJob(updatedJob);

          if (updatedJob.status === 'COMPLETED' || updatedJob.status === 'FAILED') {
            setIsLoading(false);
            clearInterval(intervalId);

            if (updatedJob.status === 'COMPLETED') {
              const findingsCount = updatedJob.findings?.length || 0;
              setLogs((prev) => [
                ...prev,
                `Audit completed: ${findingsCount} security issue(s) detected.`,
              ]);
              if (findingsCount > 0) {
                setSelectedFinding(updatedJob.findings[0]);
              }

              // Healthy repo popup
              if (
                Number(updatedJob.secrets_found) === 0 &&
                Number(updatedJob.vulnerabilities_found) === 0
              ) {
                setShowHealthyPopup(true);
              }
            } else {
              setLogs((prev) => [...prev, 'Scan execution failed on server.']);
            }
          }
        } catch (err) {
          console.error('Failed to poll status:', err);
          setIsLoading(false);
          clearInterval(intervalId);
        }
      }, 2000);
    }

    return () => clearInterval(intervalId);
  }, [currentJob]);

  // Exact trigger logic from your original App.jsx
  const handleScanSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!repoUrl) return;

    setIsLoading(true);
    setError('');
    setCurrentJob(null);
    setSelectedFinding(null);

    setLogs((prev) => [
      ...prev,
      `Cloning ${repoUrl} in-memory...`,
      'Running regex secret scanners and AST dependency checker...',
    ]);

    try {
      const newJob = await triggerScan(repoUrl);
      setCurrentJob(newJob);
      setLogs((prev) => [...prev, `Job registered (ID: ${newJob.id}). Auditing repository...`]);
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Failed to trigger scan job. Ensure FastAPI backend is running on port 8000.';
      setError(errMsg);
      setLogs((prev) => [...prev, `Error: ${errMsg}`]);
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (currentJob?.id) {
      window.open(getPdfDownloadUrl(currentJob.id), '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-[#c9d1d9] font-sans antialiased flex flex-col">
      {/* 1. Top Navbar with Integrated Scan Form */}
      <Navbar
        repoUrl={repoUrl}
        setRepoUrl={setRepoUrl}
        onScan={handleScanSubmit}
        isScanning={isLoading}
        hasResults={currentJob?.status === 'COMPLETED'}
        onExportPdf={handleDownloadPdf}
      />

      {/* 2. Pipeline / How It Works Ribbon */}
      <PipelineRibbon
        scanResult={currentJob?.status === 'COMPLETED' ? currentJob : null}
        isScanning={isLoading}
        onSelectPreset={(preset) => setRepoUrl(preset)}
      />

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-500/10 border-b border-rose-500/30 text-rose-400 px-4 py-2 text-xs font-mono">
          {error}
        </div>
      )}

      {/* 3. Main Workspace: Split-View */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Pane: Detailed Findings & Logs */}
        <aside className="w-full md:w-105 lg:w-115 border-r border-zinc-800 flex flex-col bg-[#080c14] shrink-0">
          <div className="p-3 border-b border-zinc-800 bg-[#0a0e18] flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider">
              {currentJob?.status === 'COMPLETED' ? 'Detailed Findings' : 'Console Telemetry'}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded">
              {currentJob?.status === 'COMPLETED'
                ? `${currentJob.findings?.length || 0} items`
                : isLoading
                  ? 'IN PROGRESS'
                  : 'READY'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-zinc-900">
            {currentJob?.status === 'COMPLETED' && currentJob.findings?.length > 0 ? (
              currentJob.findings.map((f, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedFinding(f)}
                  className={`p-3.5 cursor-pointer transition ${selectedFinding === f
                    ? 'bg-zinc-900/60 border-l-2 border-rose-500'
                    : 'hover:bg-zinc-900/20 border-l-2 border-transparent'
                    }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                    <span className="text-rose-400 font-bold bg-rose-950/60 border border-rose-800/60 px-1.5 py-0.5 rounded">
                      {f.severity || 'HIGH'}
                    </span>
                    <span className="text-zinc-500 border border-zinc-800 px-1.5 py-0.5 rounded">
                      {f.status || 'UNVERIFIED'}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-white">{f.type || f.title}</p>
                  <p className="text-[11px] font-mono text-zinc-500 mt-1">
                    {f.file_path || f.file || 'manifest'} : Line {f.line_number || f.line || 1}
                  </p>
                  {f.match_preview && (
                    <div className="mt-2 text-[11px] font-mono bg-zinc-950 border border-zinc-800 px-2 py-1 rounded text-rose-300 truncate">
                      {f.match_preview}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-5 text-xs text-zinc-500 font-mono leading-relaxed">
                {isLoading
                  ? 'Audit job in progress... Polling AST and OSV databases.'
                  : 'No active audit running. Enter a GitHub repository link in the top bar or click a quick preset to scan.'}
              </div>
            )}
          </div>

          {/* Real-time Streaming Logs */}
          <div className="h-32 border-t border-zinc-800 bg-[#06080e] p-2.5 font-mono text-[11px] text-zinc-500 overflow-y-auto">
            {logs.map((log, idx) => (
              <p key={idx} className={idx === logs.length - 1 ? 'text-cyan-400' : ''}>
                {'>'} {log}
              </p>
            ))}
          </div>
        </aside>

        {/* Right Pane: Remediation Workbench */}
        <RemediationWorkbench finding={selectedFinding} />
      </main>

      {/* 4. Footer with Offline Download Modal Trigger */}
      <Footer onDownloadOffline={() => setIsOfflineModalOpen(true)} />

      {/* 5. Offline Download Modal */}
      <OfflineDownload
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
      />

      {showHealthyPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowHealthyPopup(false)}
        >
          <div
            className="relative w-full max-w-md bg-[#0a0e18] border border-emerald-500/30 rounded-2xl p-8 text-center shadow-2xl shadow-emerald-500/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowHealthyPopup(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30">
              <ShieldCheck className="w-10 h-10 text-emerald-400" />
            </div>

            <div className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-4 h-4" />
              Status: Completed
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">Repository is Healthy 🎉</h3>
            <p className="text-zinc-400 text-sm mb-6">
              The scan finished with no exposed secrets and no vulnerable dependencies. 0 risks found.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3">
                <p className="text-[11px] font-mono text-zinc-500 uppercase">Secrets</p>
                <p className="text-2xl font-bold text-emerald-400">0</p>
              </div>
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3">
                <p className="text-[11px] font-mono text-zinc-500 uppercase">Vulnerabilities</p>
                <p className="text-2xl font-bold text-emerald-400">0</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowHealthyPopup(false)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-semibold py-2.5 rounded-xl transition text-sm"
              >
                Got it
              </button>
              <button
                onClick={handleDownloadPdf}
                className="w-full inline-flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 active:scale-[0.98] text-zinc-200 font-semibold py-2.5 rounded-xl transition text-sm"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}