from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
import logging

class ConnectionManager:
    def __init__(self):
        # Maps job_id -> list of connected WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, job_id: str, websocket: WebSocket):
        await websocket.accept()
        if job_id not in self.active_connections:
            self.active_connections[job_id] = []
        self.active_connections[job_id].append(websocket)

    def disconnect(self, job_id: str, websocket: WebSocket):
        if job_id in self.active_connections:
            self.active_connections[job_id].remove(websocket)
            if not self.active_connections[job_id]:
                del self.active_connections[job_id]

    async def broadcast_log(self, job_id: str, step: str, message: str, progress: int, status: str = "IN_PROGRESS"):
        """
        Sends a JSON log message to all clients listening to a specific job_id.
        """
        if job_id in self.active_connections:
            payload = json.dumps({
                "step": step,
                "message": message,
                "progress": progress,  # Percentage 0-100
                "status": status
            })
            for connection in self.active_connections[job_id]:
                try:
                    await connection.send_text(payload)
                except Exception as e:
                    logging.error(f"Failed to send WS message: {e}")

ws_manager = ConnectionManager()