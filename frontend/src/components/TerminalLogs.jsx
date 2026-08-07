import React, { useEffect, useState, useRef } from "react";

const TerminalLogs = ({ jobId, onComplete }) => {
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("CLONING");
  const terminalEndRef = useRef(null);
  
  // Ref to track if scan has already completed so we ignore duplicate events
  const isCompletedRef = useRef(false);
  
  // Stable ref for onComplete callback to avoid re-triggering useEffect
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!jobId) return;

    // Reset flags on new job
    isCompletedRef.current = false;

    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//securescan-9cv9.onrender.com/ws/scan/${jobId}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log(`[WS] Connected for Job: ${jobId}`);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Append log to stream
        setLogs((prev) => [...prev, data]);
        if (data.progress !== undefined) setProgress(data.progress);
        if (data.step) setCurrentStep(data.step);

        // Handle scan completion cleanly
        if ((data.step === "COMPLETED" || data.status === "COMPLETED") && !isCompletedRef.current) {
          isCompletedRef.current = true;
          setProgress(100);
          setCurrentStep("COMPLETED");

          if (onCompleteRef.current) {
            onCompleteRef.current(data.data || data);
          }

          // Gracefully close client side
          socket.close(1000, "Scan finished");
        }
      } catch (err) {
        console.error("[WS] Error parsing JSON payload:", err);
      }
    };

    socket.onerror = (error) => {
      console.error("[WS] Socket error encountered:", error);
    };

    socket.onclose = (event) => {
      console.log(`[WS] Connection closed (Code: ${event.code})`);
    };

    // Cleanup: disconnect socket when component unmounts or jobId changes
    return () => {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
    };
  }, [jobId]); // DEPEND STRICTLY ON jobId ONLY

  // Auto-scroll terminal output
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="bg-[#0B0F17] text-green-400 font-mono p-6 rounded-2xl border border-gray-800 shadow-2xl w-full max-w-4xl my-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-3 border-b border-gray-800/80 gap-2">
        <div className="flex items-center space-x-2">
          <span className={`w-2.5 h-2.5 rounded-full ${progress === 100 ? "bg-emerald-500" : "bg-blue-500 animate-ping"}`}></span>
          <span className="text-xs font-bold tracking-wider text-white uppercase">
            Live Audit Stream
          </span>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className={`px-3 py-1 rounded-full font-bold uppercase border ${
            progress === 100 
              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-400" 
              : "bg-blue-950/60 border-blue-500/40 text-blue-400"
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

      {/* Terminal View Output */}
      <div className="h-56 overflow-y-auto space-y-2 text-xs bg-[#05070C] p-4 rounded-xl border border-gray-800/80 pr-2">
        {logs.length === 0 ? (
          <p className="text-gray-600 animate-pulse">&gt; Waiting for stream initialization...</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="flex items-start space-x-2 font-mono">
              <span className="text-blue-400 select-none">&gt;</span>
              <span className="text-gray-500">[{log.step || "INFO"}]</span>
              <span className={
                log.status === "FAILED" 
                  ? "text-red-500 font-bold" 
                  : log.step === "COMPLETED" 
                  ? "text-emerald-400 font-semibold" 
                  : "text-green-300"
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