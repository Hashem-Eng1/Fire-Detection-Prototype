import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Zone, Camera } from '@/data/types';
import { zones as initialZones, cameras as initialCameras } from '@/data/mock';

interface ZoneContextType {
  zones: Zone[];
  addZone: (data: { name: string; description?: string }) => Zone;
  updateZone: (id: string, data: { name?: string; description?: string }) => void;
  deleteZone: (id: string, currentCameras?: Camera[]) => { success: boolean; error?: string };
  getZoneById: (id: string) => Zone | undefined;
}

const ZoneContext = createContext<ZoneContextType | undefined>(undefined);

const ZONES_STORAGE_KEY = 'wfds-zones-data';

export const ZoneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [zones, setZones] = useState<Zone[]>(() => {
    try {
      const stored = localStorage.getItem(ZONES_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback to mock
    }
    return initialZones;
  });

  useEffect(() => {
    try {
      localStorage.setItem(ZONES_STORAGE_KEY, JSON.stringify(zones));
    } catch (e) {
      console.error('Failed to save zones to localStorage', e);
    }
  }, [zones]);

  const addZone = (data: { name: string; description?: string }): Zone => {
    const now = new Date().toISOString();
    const nextNum = zones.length + 1;
    const newId = `ZN-${String(nextNum).padStart(2, '0')}`;
    
    const newZone: Zone = {
      id: newId,
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      created_at: now,
      updated_at: now,
    };

    setZones((prev) => [...prev, newZone]);
    return newZone;
  };

  const updateZone = (id: string, data: { name?: string; description?: string }) => {
    const now = new Date().toISOString();
    setZones((prev) =>
      prev.map((z) =>
        z.id === id
          ? {
              ...z,
              ...(data.name ? { name: data.name.trim() } : {}),
              description: data.description !== undefined ? data.description.trim() : z.description,
              updated_at: now,
            }
          : z
      )
    );
  };

  const deleteZone = (id: string, currentCameras: Camera[] = initialCameras): { success: boolean; error?: string } => {
    // Relational Integrity: Check if any camera is linked to this zone
    const linkedCameras = currentCameras.filter((c) => c.zone_id === id);
    if (linkedCameras.length > 0) {
      return {
        success: false,
        error: `لا يمكن حذف المنطقة لوجود ${linkedCameras.length} كاميرا مرتبطة بها. يرجى إعادة تعيين موقع الكاميرات أولاً.`,
      };
    }

    setZones((prev) => prev.filter((z) => z.id !== id));
    return { success: true };
  };

  const getZoneById = (id: string) => {
    return zones.find((z) => z.id === id);
  };

  return (
    <ZoneContext.Provider value={{ zones, addZone, updateZone, deleteZone, getZoneById }}>
      {children}
    </ZoneContext.Provider>
  );
};

export function useZones(): ZoneContextType {
  const context = useContext(ZoneContext);
  if (!context) {
    throw new Error('useZones must be used within a ZoneProvider');
  }
  return context;
}
