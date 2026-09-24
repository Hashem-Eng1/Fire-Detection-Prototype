import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Incident, IncidentStatus, Detection, IncidentImage } from '@/data/types';
import {
  incidents as initialIncidents,
  detections as initialDetections,
  incidentImages as initialIncidentImages,
} from '@/data/mock';

interface IncidentContextType {
  incidents: Incident[];
  detections: Detection[];
  incidentImages: IncidentImage[];
  getIncident: (id: string) => Incident | undefined;
  getIncidentDetections: (incidentId: string) => Detection[];
  getIncidentImages: (incidentId: string) => IncidentImage[];
  getCameraDetections: (cameraId: string) => Detection[];
  getLatestCameraDetection: (cameraId: string) => Detection | undefined;
  getActiveIncidentForCamera: (cameraId: string) => Incident | undefined;
  // Class Diagram Operations
  acknowledgeIncident: (incidentId: string, supervisor: string, note?: string) => void;
  setIncidentFollowing: (incidentId: string, supervisor: string, note?: string) => void;
  resolveIncident: (incidentId: string, supervisor: string, resolutionNote: string) => void;
  rejectIncident: (incidentId: string, supervisor: string, reason: string) => void;
  closeIncident: (incidentId: string, supervisor: string, note?: string) => void;
  recordDetection: (data: Omit<Detection, 'id'>) => Detection;
  saveIncidentImage: (data: Omit<IncidentImage, 'id'>) => IncidentImage;
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

const INCIDENTS_STORAGE_KEY = 'wfds-incidents-data';
const DETECTIONS_STORAGE_KEY = 'wfds-detections-data';
const IMAGES_STORAGE_KEY = 'wfds-incident-images-data';

export const IncidentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>(() => {
    try {
      const stored = localStorage.getItem(INCIDENTS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return initialIncidents;
  });

  const [detections, setDetections] = useState<Detection[]>(() => {
    try {
      const stored = localStorage.getItem(DETECTIONS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return initialDetections;
  });

  const [incidentImages, setIncidentImages] = useState<IncidentImage[]>(() => {
    try {
      const stored = localStorage.getItem(IMAGES_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return initialIncidentImages;
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(INCIDENTS_STORAGE_KEY, JSON.stringify(incidents));
    } catch (e) {
      console.error('Failed to save incidents to localStorage', e);
    }
  }, [incidents]);

  useEffect(() => {
    try {
      localStorage.setItem(DETECTIONS_STORAGE_KEY, JSON.stringify(detections));
    } catch (e) {
      console.error('Failed to save detections to localStorage', e);
    }
  }, [detections]);

  useEffect(() => {
    try {
      localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(incidentImages));
    } catch (e) {
      console.error('Failed to save incident images to localStorage', e);
    }
  }, [incidentImages]);

  const getIncident = (id: string): Incident | undefined => {
    return incidents.find((i) => i.id === id);
  };

  const getIncidentDetections = (incidentId: string): Detection[] => {
    return detections.filter((d) => d.incident_id === incidentId);
  };

  const getIncidentImages = (incidentId: string): IncidentImage[] => {
    return incidentImages.filter((img) => img.incident_id === incidentId);
  };

  const getCameraDetections = (cameraId: string): Detection[] => {
    return detections.filter((d) => d.camera_id === cameraId);
  };

  const getLatestCameraDetection = (cameraId: string): Detection | undefined => {
    const list = detections.filter((d) => d.camera_id === cameraId);
    return list.length > 0 ? list[list.length - 1] : undefined;
  };

  const getActiveIncidentForCamera = (cameraId: string): Incident | undefined => {
    return incidents.find(
      (inc) =>
        (inc.camera_id === cameraId || inc.cameraId === cameraId) &&
        ['new', 'confirmed', 'following'].includes(inc.status)
    );
  };

  // Class diagram: acknowledgeIncident
  const acknowledgeIncident = (incidentId: string, supervisor: string, note?: string) => {
    const nowIso = new Date().toISOString();
    const timeFormatted = new Date().toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' });

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        const newTimeline = [
          ...inc.timeline,
          {
            status: 'confirmed' as IncidentStatus,
            time: timeFormatted,
            actor: supervisor,
            note: note || 'تم إقرار الحادثة وتأكيد صحتها بواسطة المشرف',
          },
        ];
        return {
          ...inc,
          status: 'confirmed',
          acknowledged_at: nowIso,
          acknowledged_by: supervisor,
          supervisor: supervisor,
          timeline: newTimeline,
        };
      })
    );
  };

  // setIncidentFollowing
  const setIncidentFollowing = (incidentId: string, supervisor: string, note?: string) => {
    const timeFormatted = new Date().toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' });

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        const newTimeline = [
          ...inc.timeline,
          {
            status: 'following' as IncidentStatus,
            time: timeFormatted,
            actor: supervisor,
            note: note || 'وضع الحادثة قيد المتابعة البصرية والتحقق',
          },
        ];
        return {
          ...inc,
          status: 'following',
          supervisor: supervisor,
          timeline: newTimeline,
        };
      })
    );
  };

  // Class diagram: closeIncident / resolveIncident
  const resolveIncident = (incidentId: string, supervisor: string, resolutionNote: string) => {
    const nowIso = new Date().toISOString();
    const timeFormatted = new Date().toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' });

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        const newTimeline = [
          ...inc.timeline,
          {
            status: 'resolved' as IncidentStatus,
            time: timeFormatted,
            actor: supervisor,
            note: resolutionNote,
          },
        ];
        return {
          ...inc,
          status: 'resolved',
          ended_at: nowIso,
          resolution_note: resolutionNote,
          supervisor: supervisor,
          timeline: newTimeline,
        };
      })
    );
  };

  // Class diagram: rejectIncident
  const rejectIncident = (incidentId: string, supervisor: string, reason: string) => {
    const nowIso = new Date().toISOString();
    const timeFormatted = new Date().toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' });

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        const newTimeline = [
          ...inc.timeline,
          {
            status: 'false_alarm' as IncidentStatus,
            time: timeFormatted,
            actor: supervisor,
            note: reason,
          },
        ];
        return {
          ...inc,
          status: 'false_alarm',
          ended_at: nowIso,
          rejection_reason: reason,
          falseAlarmReason: reason,
          supervisor: supervisor,
          timeline: newTimeline,
        };
      })
    );
  };

  // closeIncident
  const closeIncident = (incidentId: string, supervisor: string, note?: string) => {
    const nowIso = new Date().toISOString();
    const timeFormatted = new Date().toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' });

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        const newTimeline = [
          ...inc.timeline,
          {
            status: 'closed' as IncidentStatus,
            time: timeFormatted,
            actor: supervisor,
            note: note || 'تم إغلاق البلاغ نهائياً وأرشفة السجل',
          },
        ];
        return {
          ...inc,
          status: 'closed',
          ended_at: nowIso,
          timeline: newTimeline,
        };
      })
    );
  };

  // Class diagram: recordDetection
  const recordDetection = (data: Omit<Detection, 'id'>): Detection => {
    const nextNum = detections.length + 1;
    const newId = `DET-${String(nextNum).padStart(4, '0')}`;
    const newDet: Detection = {
      id: newId,
      ...data,
    };
    setDetections((prev) => [...prev, newDet]);
    return newDet;
  };

  // Class diagram: saveImage
  const saveIncidentImage = (data: Omit<IncidentImage, 'id'>): IncidentImage => {
    const nextNum = incidentImages.length + 1;
    const newId = `IMG-${String(nextNum).padStart(4, '0')}`;
    const newImg: IncidentImage = {
      id: newId,
      ...data,
    };
    setIncidentImages((prev) => [...prev, newImg]);
    return newImg;
  };

  return (
    <IncidentContext.Provider
      value={{
        incidents,
        detections,
        incidentImages,
        getIncident,
        getIncidentDetections,
        getIncidentImages,
        getCameraDetections,
        getLatestCameraDetection,
        getActiveIncidentForCamera,
        acknowledgeIncident,
        setIncidentFollowing,
        resolveIncident,
        rejectIncident,
        closeIncident,
        recordDetection,
        saveIncidentImage,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncidents = () => {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error('useIncidents must be used within an IncidentProvider');
  }
  return context;
};
