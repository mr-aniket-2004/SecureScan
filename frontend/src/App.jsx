import React, { useState, useEffect } from 'react';
import { Shield, Lock } from 'lucide-react';
import HowItWorks from './components/HowItWorks';
import ScanForm from './components/ScanForm';
import ScanResult from './components/ScanResult';
import Footer from './components/Footer';
import OfflineDownload from './components/OfflineDownload';
import { triggerScan, fetchScanStatus } from './services/api';

export default function App() {
  const [currentJob, setCurrentJob] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);

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

  const handleScanSubmit = async (repoUrl) => {
    setIsLoading(true);
    setError('');
    setCurrentJob(null);

    try {
      const newJob = await triggerScan(repoUrl);
      setCurrentJob(newJob);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to trigger scan job. Ensure FastAPI backend is running on port 8000.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased flex flex-col justify-between">
      <div>
        <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-wide">SecScan Engine</h1>
                <p className="text-xs text-slate-400">Automated GitHub Security & Dependency Auditor</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>FastAPI + Supabase Active</span>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <HowItWorks />
          <ScanForm onScanSubmit={handleScanSubmit} isLoading={isLoading} />
          <ScanResult job={currentJob} />
        </main>
      </div>

      {/* Footer component with 'Download Offline' coming-soon action */}
      <Footer onOpenOfflineModal={() => setIsOfflineModalOpen(true)} />

      {/* Modal Component */}
      <OfflineDownload 
        isOpen={isOfflineModalOpen} 
        onClose={() => setIsOfflineModalOpen(false)} 
      />
    </div>
  );
}