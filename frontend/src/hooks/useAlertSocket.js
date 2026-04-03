import { useState, useEffect, useRef, useCallback } from "react";
import { API_BASE_URL } from "../config";

/**
 * Custom hook for WebSocket connection to receive real-time alerts.
 * Connects to ws://[API_BASE_URL]/api/ws/alerts
 * Auto-reconnects with exponential backoff (max 5 retries).
 * Falls back to polling if WebSocket is not supported.
 */
const useAlertSocket = (onNewAlert) => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const retriesRef = useRef(0);
  const maxRetries = 5;
  const pollingRef = useRef(null);

  const connect = useCallback(() => {
    // Check WebSocket support
    if (!window.WebSocket) {
      console.warn("WebSocket not supported, falling back to polling");
      startPolling();
      return;
    }

    try {
      const wsUrl = API_BASE_URL.replace(/^http/, 'ws') + '/api/ws/alerts';
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected for alerts");
        setIsConnected(true);
        retriesRef.current = 0; // Reset retries on successful connection
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "new_alert" && data.payload) {
            onNewAlert(data.payload);
          }
        } catch (e) {
          console.error("Error parsing WebSocket message:", e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;

        // Auto-reconnect with exponential backoff
        if (retriesRef.current < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, retriesRef.current), 30000);
          retriesRef.current += 1;
          console.log(`WebSocket disconnected. Reconnecting in ${delay}ms (attempt ${retriesRef.current}/${maxRetries})`);
          setTimeout(connect, delay);
        } else {
          console.warn("Max WebSocket retries reached, falling back to polling");
          startPolling();
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        ws.close();
      };
    } catch (e) {
      console.error("Failed to create WebSocket:", e);
      startPolling();
    }
  }, [onNewAlert]);

  const startPolling = useCallback(() => {
    if (pollingRef.current) return;

    pollingRef.current = setInterval(async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/alerts?limit=5`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Only push the latest alert if it's new
          if (data && data.length > 0) {
            onNewAlert(data[0]);
          }
        }
      } catch (e) {
        console.error("Polling error:", e);
      }
    }, 30000); // Poll every 30 seconds
  }, [onNewAlert]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [connect]);

  return { isConnected };
};

export default useAlertSocket;
