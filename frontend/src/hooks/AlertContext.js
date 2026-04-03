import React, { createContext, useContext, useState, useCallback } from "react";
import useAlertSocket from "./useAlertSocket";

/**
 * AlertContext — global WebSocket alert state.
 * Wrap app in <AlertProvider> so PredictiveAlertBanner and Alerts page
 * share a single WebSocket connection.
 *
 * Exposes: newAlerts, clearNewAlert(id), isConnected
 */
const AlertContext = createContext(null);

export const AlertProvider = ({ children }) => {
  const [newAlerts, setNewAlerts] = useState([]);

  const handleNewAlert = useCallback((alert) => {
    setNewAlerts((prev) => {
      // Avoid duplicates
      if (prev.some((a) => a.id === alert.id)) return prev;
      return [alert, ...prev];
    });
  }, []);

  const clearNewAlert = useCallback((id) => {
    setNewAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const { isConnected } = useAlertSocket(handleNewAlert);

  return (
    <AlertContext.Provider value={{ newAlerts, clearNewAlert, isConnected }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlertContext = () => {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlertContext must be used inside AlertProvider");
  return ctx;
};

export default AlertContext;
