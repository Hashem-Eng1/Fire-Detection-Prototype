import type { Camera } from '@/data/types';
import { CameraStatusBadge } from './StatusBadge';
import { Video, Wifi, WifiOff, Flame, Wind } from 'lucide-react';

interface CameraCardProps {
  camera: Camera;
  onClick?: () => void;
  compact?: boolean;
}

export function CameraCard({ camera, onClick, compact }: CameraCardProps) {
  const hasDetection = camera.detectionType !== 'none';
  const isOffline = camera.status === 'offline' || camera.status === 'disabled';

  return (
    <div
      onClick={onClick}
      className={`group rounded-2xl bg-white shadow-card border overflow-hidden transition hover:shadow-soft ${
        hasDetection ? 'border-red-400 ring-1 ring-red-200' : 'border-gray-100/80'
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="relative aspect-video bg-navy-900 overflow-hidden">
        {/* Simulated video feed */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.06) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.04) 0%, transparent 50%)',
        }} />
        {/* Shelves silhouette */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 opacity-20">
          <div className="flex h-full items-end gap-1 px-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex-1 bg-navy-600" style={{ height: `${30 + (i % 3) * 20}%` }} />
            ))}
          </div>
        </div>

        {/* Detection overlay */}
        {hasDetection && (
          <div className="absolute top-1/3 left-1/4 w-1/2 h-1/3 border-2 border-red-500 rounded animate-pulse">
            <div className="absolute -top-7 right-0 bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded">
              {camera.detectionType === 'fire' ? 'حريق' : 'دخان'} — {camera.detectionConfidence}%
            </div>
          </div>
        )}

        {isOffline && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-navy-950/70 text-navy-300">
            <WifiOff className="h-8 w-8 mb-2" />
            <span className="text-sm font-medium">لا توجد إشارة</span>
          </div>
        )}

        {/* Top overlay */}
        <div className="absolute top-2 right-2 left-2 flex items-center justify-between">
          <span className="rounded-md bg-black/50 px-2 py-1 text-[11px] font-medium text-white backdrop-blur">
            {camera.id}
          </span>
          <div className="flex items-center gap-1.5">
            {isOffline ? (
              <span className="flex items-center gap-1 rounded-md bg-black/50 px-2 py-1 text-[11px] text-white backdrop-blur">
                <WifiOff className="h-3 w-3" /> غير متصل
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-md bg-black/50 px-2 py-1 text-[11px] text-white backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" /> REC
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-gray-400 shrink-0" />
              <h4 className="font-bold text-gray-900 truncate">{camera.name}</h4>
            </div>
            <p className="mt-0.5 text-xs text-gray-500 truncate">{camera.location}</p>
          </div>
          <CameraStatusBadge status={camera.status} />
        </div>

        {hasDetection && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2">
            {camera.detectionType === 'fire' ? (
              <Flame className="h-4 w-4 text-red-500" />
            ) : (
              <Wind className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm font-bold text-red-700">
              {camera.detectionType === 'fire' ? 'حريق مكتشف' : 'دخان مكتشف'} — {camera.detectionConfidence}%
            </span>
          </div>
        )}

        {!compact && (
          <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Wifi className="h-3 w-3" /> آخر إطار: {camera.lastFrame}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
