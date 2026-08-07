import React, { useEffect, useState, useRef } from 'react';

const TerminalLogs = ({ jobId, onComplete }) => {
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('CLONING');
  const terminalEndRef = useRef(null);

  // 1. Preserve onComplete reference without causing useEffect to re-trigger
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!jobId) return;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//securescan-9cv9.onrender.com/ws/scan/${jobId}`;
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        setLogs((prev) => [...prev, data]);
        if (data.progress !== undefined) setProgress(data.progress);
        if (data.step) setCurrentStep(data.step);

        // WHEN COMPLETED: Trigger callback and CLOSE the socket immediately
        if (data.step === 'COMPLETED' || data.status === 'COMPLETED') {
          setProgress(100);
          setCurrentStep('COMPLETED');
          
          if (onCompleteRef.current) {
            onCompleteRef.current(data.data || data);
          }

          // 2. Explicitly disconnect so the stream stops listening
          socket.close();
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed.');
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
    };
  }, [jobId]); // Depend ONLY on jobId to prevent reconnection loops

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-[#0B0F17] text-green-400 font-mono p-6 rounded-2xl border border-gray-800 shadow-2xl w-full max-w-4xl my-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-3 border-b border-gray-800/80 gap-2">
        <div className="flex items-center space-x-2">
          <span className={`w-2.5 h-2.5 rounded-full ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-500 animate-ping'}`}></span>
          <span className="text-xs font-bold tracking-wider text-white uppercase">
            Live Audit Stream
          </span>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className={`px-3 py-1 rounded-full font-bold uppercase border ${
            progress === 100 
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400' 
              : 'bg-blue-950/60 border-blue-500/40 text-blue-400'
          }`}>
            STAGE: {currentStep}
          </span>
          <span className="text-gray-300 font-bold">{progress}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-900 h-2.5 rounded-full overflow-hidden border border-gray-800">
          <div 
            className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full transition-all duration-300 ease-out" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stage Tracker */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6 text-xs">
        <div className={`p-2.5 rounded-xl border text-center transition-all ${
          progress >= 25 ? 'bg-blue-950/40 border-blue-500/40 text-blue-300' : 'bg-gray-900/40 border-gray-800 text-gray-600'
        }`}>
          <div className="font-bold">1. Copy Git Repo</div>
          <div className="text-[10px] opacity-70">Git Clone</div>
        </div>

        <div className={`p-2.5 rounded-xl border text-center transition-all ${
          progress >= 50 ? 'bg-amber-950/40 border-amber-500/40 text-amber-300' : 'bg-gray-900/40 border-gray-800 text-gray-600'
        }`}>
          <div className="font-bold">2. Start Scanning</div>
          <div className="text-[10px] opacity-70">Secret Regex</div>
        </div>

        <div className={`p-2.5 rounded-xl border text-center transition-all ${
          progress >= 75 ? 'bg-purple-950/40 border-purple-500/40 text-purple-300' : 'bg-gray-900/40 border-gray-800 text-gray-600'
        }`}>
          <div className="font-bold">3. Identify Threats</div>
          <div className="text-[10px] opacity-70">CVE Check</div>
        </div>

        <div className={`p-2.5 rounded-xl border text-center transition-all ${
          progress >= 100 ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-gray-900/40 border-gray-800 text-gray-600'
        }`}>
          <div className="font-bold">4. Complete</div>
          <div className="text-[10px] opacity-70">Summary Table</div>
        </div>
      </div>

      {/* Terminal View Output */}
      <div className="h-56 overflow-y-auto space-y-2 text-xs bg-[#05070C] p-4 rounded-xl border border-gray-800/80 pr-2">
        {logs.length === 0 ? (
          <p className="text-gray-600 animate-pulse">&gt; Waiting for stream initialization...</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="flex items-start space-x-2 font-mono">
              <span className="text-blue-400 select-none">&gt;</span>
              <span className="text-gray-500">[{log.step || 'INFO'}]</span>
              <span className={
                log.status === 'FAILED' 
                  ? 'text-red-500 font-bold' 
                  : log.step === 'COMPLETED' 
                  ? 'text-emerald-400 font-semibold' 
                  : 'text-green-300'
              }>
                {log.message}
              </span>
            </div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};

export default TerminalLogs;