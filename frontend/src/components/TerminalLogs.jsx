import React, { useEffect, useState, useRef } from 'react';

const TerminalLogs = ({ jobId }) => {
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (!jobId) return;

    // Convert HTTP render URL to WS protocol (https -> wss / http -> ws)
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//securescan-9cv9.onrender.com/ws/scan/${jobId}`;

    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLogs((prev) => [...prev, data]);
      setProgress(data.progress);
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed.');
    };

    return () => socket.close();
  }, [jobId]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-gray-950 text-green-400 font-mono p-4 rounded-lg border border-gray-800 shadow-2xl w-full max-w-3xl my-6">
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>SCANNING PROGRESS</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-green-500 h-full transition-all duration-300 ease-out" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Terminal Output */}
      <div className="h-48 overflow-y-auto space-y-2 text-sm pr-2">
        {logs.length === 0 ? (
          <p className="text-gray-600 animate-pulse">&gt; Waiting for stream initialization...</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="flex items-start space-x-2">
              <span className="text-blue-400">&gt;</span>
              <span className="text-gray-500">[{log.step}]</span>
              <span className={log.status === 'FAILED' ? 'text-red-500' : 'text-green-300'}>
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