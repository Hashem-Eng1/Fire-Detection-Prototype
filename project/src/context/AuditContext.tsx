import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuditEntry, Role } from '@/data/types';
import { auditLog as initialAuditLog } from '@/data/mock';

const STORAGE_KEY = 'prototype_v2_audit_logs';

interface AuditContextType {
  logs: AuditEntry[];
  createLog: (action: string, details: string, user?: string, role?: Role) => void;
  clearLogs: () => void;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export function AuditProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<AuditEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return initialAuditLog;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch {
      // ignore
    }
  }, [logs]);

  const createLog = (action: string, details: string, user = 'admin', role: Role = 'admin') => {
    const now = new Date();
    // Format: YYYY-MM-DD HH:mm:ss
    const time = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    const newEntry: AuditEntry = {
      id: `A-${Date.now().toString().slice(-4)}`,
      time,
      user,
      role,
      action,
      details,
    };

    setLogs((prev) => [newEntry, ...prev]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <AuditContext.Provider value={{ logs, createLog, clearLogs }}>
      {children}
    </AuditContext.Provider>
  );
}

export function useAudit() {
  const ctx = useContext(AuditContext);
  if (!ctx) {
    throw new Error('useAudit must be used within an AuditProvider');
  }
  return ctx;
}
