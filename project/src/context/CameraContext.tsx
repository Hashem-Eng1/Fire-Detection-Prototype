import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Camera, CameraSetting, CameraMask } from '@/data/types';
import {
  cameras as initialCameras,
  cameraMasks as initialCameraMasks,
} from '@/data/mock';

export const DEFAULT_CAMERA_SETTING: Omit<CameraSetting, 'camera_id'> = {
  fps_target: 15,
  smoke_conf_thresh: 65,
  fire_conf_thresh: 75,
  k_frames: 5,
  n_frames: 8,
  w1_conf: 0.30,
  w2_temporal: 0.25,
  w3_area: 0.15,
  w4_growth: 0.15,
  w5_vlm: 0.15,
  vlm_enabled: true,
};

interface CameraContextType {
  cameras: Camera[];
  getCamera: (id: string) => Camera | undefined;
  addCamera: (data: Partial<Camera>) => Camera;
  updateCamera: (id: string, data: Partial<Camera>) => void;
  deleteCamera: (id: string) => void;
  // Masks (Entity 4)
  masks: CameraMask[];
  getCameraMasks: (cameraId: string) => CameraMask[];
  addCameraMask: (data: Omit<CameraMask, 'id' | 'created_at'>) => CameraMask;
  updateCameraMask: (id: string, data: Partial<CameraMask>) => void;
  deleteCameraMask: (id: string) => void;
  toggleCameraMask: (id: string) => void;
  // Settings (Entity 3)
  getCameraSettings: (cameraId: string) => CameraSetting;
  updateCameraSettings: (cameraId: string, data: Partial<CameraSetting>) => CameraSetting;
  resetCameraSettings: (cameraId: string) => CameraSetting;
}

const CameraContext = createContext<CameraContextType | undefined>(undefined);

const CAMERAS_STORAGE_KEY = 'wfds-cameras-data';
const MASKS_STORAGE_KEY = 'wfds-camera-masks-data';
const SETTINGS_STORAGE_KEY = 'wfds-camera-settings-data';

export const CameraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Cameras
  const [cameras, setCameras] = useState<Camera[]>(() => {
    try {
      const stored = localStorage.getItem(CAMERAS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return initialCameras;
  });

  // Masks
  const [masks, setMasks] = useState<CameraMask[]>(() => {
    try {
      const stored = localStorage.getItem(MASKS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return initialCameraMasks;
  });

  // Settings
  const [settings, setSettings] = useState<Record<string, CameraSetting>>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    // initialize defaults for all cameras
    const initialMap: Record<string, CameraSetting> = {};
    initialCameras.forEach((cam) => {
      initialMap[cam.id] = {
        camera_id: cam.id,
        fps_target: cam.fps_target ?? DEFAULT_CAMERA_SETTING.fps_target,
        smoke_conf_thresh: cam.smoke_conf_thresh ?? DEFAULT_CAMERA_SETTING.smoke_conf_thresh,
        fire_conf_thresh: cam.fire_conf_thresh ?? DEFAULT_CAMERA_SETTING.fire_conf_thresh,
        k_frames: DEFAULT_CAMERA_SETTING.k_frames,
        n_frames: cam.n_frames ?? DEFAULT_CAMERA_SETTING.n_frames,
        w1_conf: cam.w1_conf ?? DEFAULT_CAMERA_SETTING.w1_conf,
        w2_temporal: cam.w2_temporal ?? DEFAULT_CAMERA_SETTING.w2_temporal,
        w3_area: cam.w3_area ?? DEFAULT_CAMERA_SETTING.w3_area,
        w4_growth: cam.w4_growth ?? DEFAULT_CAMERA_SETTING.w4_growth,
        w5_vlm: cam.w5_vlm ?? DEFAULT_CAMERA_SETTING.w5_vlm,
        vlm_enabled: DEFAULT_CAMERA_SETTING.vlm_enabled,
        updated_at: new Date().toISOString(),
      };
    });
    return initialMap;
  });

  // Persist cameras
  useEffect(() => {
    try {
      localStorage.setItem(CAMERAS_STORAGE_KEY, JSON.stringify(cameras));
    } catch (e) {
      console.error('Failed to save cameras to localStorage', e);
    }
  }, [cameras]);

  // Persist masks
  useEffect(() => {
    try {
      localStorage.setItem(MASKS_STORAGE_KEY, JSON.stringify(masks));
    } catch (e) {
      console.error('Failed to save masks to localStorage', e);
    }
  }, [masks]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save camera settings to localStorage', e);
    }
  }, [settings]);

  // Camera methods
  const getCamera = (id: string): Camera | undefined => {
    return cameras.find((c) => c.id === id);
  };

  const addCamera = (data: Partial<Camera>): Camera => {
    const nextNum = cameras.length + 1;
    const newId = `CAM-${String(nextNum).padStart(2, '0')}`;
    const newCam: Camera = {
      id: newId,
      zone_id: data.zone_id,
      name: data.name ?? `كاميرا جديدة ${newId}`,
      location: data.location ?? '',
      sourceType: data.sourceType ?? 'rtsp',
      streamUrl: data.streamUrl ?? '',
      username: data.username,
      password: data.password,
      status: 'offline',
      lastFrame: '--:--:--',
      lastConnection: '—',
      autoReconnect: true,
      reconnectAttempts: 0,
      roiEnabled: false,
      detectionEnabled: true,
      sensitivity: 70,
      confidenceThreshold: 70,
      smoke_conf_thresh: DEFAULT_CAMERA_SETTING.smoke_conf_thresh,
      fire_conf_thresh: DEFAULT_CAMERA_SETTING.fire_conf_thresh,
      persistenceFrames: 8,
      n_frames: DEFAULT_CAMERA_SETTING.n_frames,
      fps_target: DEFAULT_CAMERA_SETTING.fps_target,
      w1_conf: DEFAULT_CAMERA_SETTING.w1_conf,
      w2_temporal: DEFAULT_CAMERA_SETTING.w2_temporal,
      w3_area: DEFAULT_CAMERA_SETTING.w3_area,
      w4_growth: DEFAULT_CAMERA_SETTING.w4_growth,
      w5_vlm: DEFAULT_CAMERA_SETTING.w5_vlm,
      severityRule: 'high',
      contextualVerification: true,
      detectionType: 'none',
      detectionConfidence: 0,
    };

    setCameras((prev) => [...prev, newCam]);
    // Create initial settings
    setSettings((prev) => ({
      ...prev,
      [newId]: {
        camera_id: newId,
        ...DEFAULT_CAMERA_SETTING,
        updated_at: new Date().toISOString(),
      },
    }));

    return newCam;
  };

  const updateCamera = (id: string, data: Partial<Camera>) => {
    setCameras((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c))
    );
  };

  const deleteCamera = (id: string) => {
    setCameras((prev) => prev.filter((c) => c.id !== id));
    // Also delete masks for this camera
    setMasks((prev) => prev.filter((m) => m.camera_id !== id));
    // Remove settings
    setSettings((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  // Mask methods
  const getCameraMasks = (cameraId: string): CameraMask[] => {
    return masks.filter((m) => m.camera_id === cameraId);
  };

  const addCameraMask = (data: Omit<CameraMask, 'id' | 'created_at'>): CameraMask => {
    const now = new Date().toISOString();
    const nextNum = masks.length + 1;
    const newId = `MSK-${String(nextNum).padStart(2, '0')}`;
    const newMask: CameraMask = {
      id: newId,
      ...data,
      created_at: now,
      updated_at: now,
    };
    setMasks((prev) => [...prev, newMask]);
    return newMask;
  };

  const updateCameraMask = (id: string, data: Partial<CameraMask>) => {
    const now = new Date().toISOString();
    setMasks((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...data, updated_at: now } : m))
    );
  };

  const deleteCameraMask = (id: string) => {
    setMasks((prev) => prev.filter((m) => m.id !== id));
  };

  const toggleCameraMask = (id: string) => {
    const now = new Date().toISOString();
    setMasks((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, is_active: !m.is_active, updated_at: now } : m
      )
    );
  };

  // Settings methods
  const getCameraSettings = (cameraId: string): CameraSetting => {
    if (settings[cameraId]) {
      return settings[cameraId];
    }
    // Return fallback with default values
    return {
      camera_id: cameraId,
      ...DEFAULT_CAMERA_SETTING,
      updated_at: new Date().toISOString(),
    };
  };

  const updateCameraSettings = (
    cameraId: string,
    data: Partial<CameraSetting>
  ): CameraSetting => {
    const now = new Date().toISOString();
    const current = getCameraSettings(cameraId);
    const updated: CameraSetting = {
      ...current,
      ...data,
      camera_id: cameraId,
      updated_at: now,
    };

    setSettings((prev) => ({
      ...prev,
      [cameraId]: updated,
    }));

    // Synchronize matching fields on camera object
    updateCamera(cameraId, {
      smoke_conf_thresh: updated.smoke_conf_thresh,
      fire_conf_thresh: updated.fire_conf_thresh,
      fps_target: updated.fps_target,
      n_frames: updated.n_frames,
      w1_conf: updated.w1_conf,
      w2_temporal: updated.w2_temporal,
      w3_area: updated.w3_area,
      w4_growth: updated.w4_growth,
      w5_vlm: updated.w5_vlm,
    });

    return updated;
  };

  const resetCameraSettings = (cameraId: string): CameraSetting => {
    const now = new Date().toISOString();
    const reset: CameraSetting = {
      camera_id: cameraId,
      ...DEFAULT_CAMERA_SETTING,
      updated_at: now,
    };

    setSettings((prev) => ({
      ...prev,
      [cameraId]: reset,
    }));

    updateCamera(cameraId, {
      smoke_conf_thresh: reset.smoke_conf_thresh,
      fire_conf_thresh: reset.fire_conf_thresh,
      fps_target: reset.fps_target,
      n_frames: reset.n_frames,
      w1_conf: reset.w1_conf,
      w2_temporal: reset.w2_temporal,
      w3_area: reset.w3_area,
      w4_growth: reset.w4_growth,
      w5_vlm: reset.w5_vlm,
    });

    return reset;
  };

  return (
    <CameraContext.Provider
      value={{
        cameras,
        getCamera,
        addCamera,
        updateCamera,
        deleteCamera,
        masks,
        getCameraMasks,
        addCameraMask,
        updateCameraMask,
        deleteCameraMask,
        toggleCameraMask,
        getCameraSettings,
        updateCameraSettings,
        resetCameraSettings,
      }}
    >
      {children}
    </CameraContext.Provider>
  );
};

export const useCameras = () => {
  const context = useContext(CameraContext);
  if (!context) {
    throw new Error('useCameras must be used within a CameraProvider');
  }
  return context;
};
