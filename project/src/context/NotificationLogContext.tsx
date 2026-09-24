import React, { createContext, useContext, useState, useEffect } from 'react';
import type { NotificationLog, NotificationChannel, NotificationStatus } from '@/data/types';
import { notificationLogs as initialLogs } from '@/data/mock';

interface NotificationLogContextType {
  logs: NotificationLog[];
  sendNotification: (data: Omit<NotificationLog, 'id' | 'sent_at' | 'retry_count'> & { retry_count?: number }) => NotificationLog;
  retrySending: (id: string) => Promise<boolean>;
  deleteLog: (id: string) => void;
  clearLogs: () => void;
  getLogsByIncident: (incidentId: string) => NotificationLog[];
  metrics: {
    total: number;
    sent: number;
    failed: number;
    retrying: number;
    successRate: number;
  };
}

const NotificationLogContext = createContext<NotificationLogContextType | undefined>(undefined);

const STORAGE_KEY = 'wfds-notification-logs-data';

export const NotificationLogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<NotificationLog[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return initialLogs;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save notification logs to localStorage', e);
    }
  }, [logs]);

  // Class Diagram operation: + sendNotification(notifData)
  const sendNotification = (
    data: Omit<NotificationLog, 'id' | 'sent_at' | 'retry_count'> & { retry_count?: number }
  ): NotificationLog => {
    const newId = `NOTIF-${Date.now().toString().slice(-4)}`;
    const newLog: NotificationLog = {
      ...data,
      id: newId,
      retry_count: data.retry_count ?? 0,
      sent_at: new Date().toISOString(),
    };
    setLogs((prev) => [newLog, ...prev]);
    return newLog;
  };

  // Class Diagram operation: + retrySending(logId)
  const retrySending = async (id: string): Promise<boolean> => {
    // Set to retrying
    setLogs((prev) =>
      prev.map((log) =>
        log.id === id
          ? { ...log, status: 'retrying' as NotificationStatus, retry_count: log.retry_count + 1 }
          : log
      )
    );

    // Simulate network transmission delay
    return new Promise((resolve) => {
      setTimeout(() => {
        setLogs((prev) =>
          prev.map((log) => {
            if (log.id !== id) return log;
            return {
              ...log,
              status: 'sent' as NotificationStatus,
              error_message: undefined,
              sent_at: new Date().toISOString(),
            };
          })
        );
        resolve(true);
      }, 1200);
    });
  };

  const deleteLog = (id: string) => {
    setLogs((prev) => prev.filter((log) => log.id !== id));
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getLogsByIncident = (incidentId: string): NotificationLog[] => {
    return logs.filter((log) => log.incident_id === incidentId);
  };

  const total = logs.length;
  const sent = logs.filter((l) => l.status === 'sent').length;
  const failed = logs.filter((l) => l.status === 'failed').length;
  const retrying = logs.filter((l) => l.status === 'retrying').length;
  const successRate = total > 0 ? Math.round((sent / total) * 100) : 100;

  return (
    <NotificationLogContext.Provider
      value={{
        logs,
        sendNotification,
        retrySending,
        deleteLog,
        clearLogs,
        getLogsByIncident,
        metrics: {
          total,
          sent,
          failed,
          retrying,
          successRate,
        },
      }}
    >
      {children}
    </NotificationLogContext.Provider>
  );
};

export const useNotificationLogs = () => {
  const context = useContext(NotificationLogContext);
  if (!context) {
    throw new Error('useNotificationLogs must be used within a NotificationLogProvider');
  }
  return context;
};
