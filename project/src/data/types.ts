export type Role = 'admin' | 'supervisor';

export type CameraStatus = 'online' | 'offline' | 'unstable' | 'disabled';
export type IncidentStatus = 'new' | 'confirmed' | 'following' | 'resolved' | 'false_alarm' | 'closed';
export type Severity = 'low' | 'medium' | 'high';
export type DetectionType = 'smoke' | 'fire' | 'none';

export interface Zone {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export type MaskType = 'exclusion' | 'inclusion';

export interface Point {
  x: number;
  y: number;
}

export interface CameraMask {
  id: string;
  camera_id: string;
  name: string;
  mask_type: MaskType;
  polygon_points: Point[];
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CameraSetting {
  camera_id: string;
  fps_target: number;
  smoke_conf_thresh: number;
  fire_conf_thresh: number;
  k_frames: number;
  n_frames: number;
  w1_conf: number;
  w2_temporal: number;
  w3_area: number;
  w4_growth: number;
  w5_vlm: number;
  vlm_enabled: boolean;
  updated_at?: string;
}

export interface Camera {
  id: string;
  zone_id?: string;
  name: string;
  location: string;
  location_desc?: string;
  sourceType: 'rtsp' | 'network' | 'file';
  streamUrl: string;
  username?: string;
  password?: string;
  status: CameraStatus;
  lastFrame: string;
  lastConnection: string;
  autoReconnect: boolean;
  reconnectAttempts: number;
  fps_target?: number;
  roiEnabled: boolean;
  detectionEnabled: boolean;
  sensitivity: number;
  confidenceThreshold: number;
  smoke_conf_thresh?: number;
  fire_conf_thresh?: number;
  persistenceFrames: number;
  n_frames?: number;
  w1_conf?: number;
  w2_temporal?: number;
  w3_area?: number;
  w4_growth?: number;
  w5_vlm?: number;
  severityRule: Severity;
  contextualVerification: boolean;
  detectionType: DetectionType;
  detectionConfidence: number;
  masks?: CameraMask[];
  settings?: CameraSetting;
}

export interface BoundingBox {
  x: number;      // نسبة مئوية أفقية 0 - 100%
  y: number;      // نسبة مئوية رأسية 0 - 100%
  width: number;  // عرض المربع كنسبة مئوية 0 - 100%
  height: number; // ارتفاع المربع كنسبة مئوية 0 - 100%
}

export interface Detection {
  id: string;
  camera_id: string;
  incident_id?: string;
  class_detected: DetectionType;
  confidence: number;
  bbox: BoundingBox;
  area_ratio: number;
  timestamp: string;
}

export type IncidentImageType = 'snapshot' | 'evidence' | 'vlm_crop';

export interface IncidentImage {
  id: string;
  incident_id: string;
  detection_id?: string;
  image_path: string;
  image_type: IncidentImageType;
  captured_at: string;
  caption?: string;
}

export interface Incident {
  id: string;
  camera_id: string;
  cameraId: string; // compatibility alias
  cameraName: string;
  location: string;
  time: string;
  date: string;
  primary_type: DetectionType;
  detection: DetectionType; // compatibility alias
  confidence: number;
  max_confidence: number;
  severity_level: Severity;
  severity: Severity; // compatibility alias
  max_severity_score: number;
  status: IncidentStatus;
  started_at: string;
  startTime: string; // compatibility alias
  last_seen_at: string;
  ended_at?: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
  supervisor?: string; // compatibility alias
  vlm_verdict?: boolean;
  vlm_reason?: string;
  contextualNote?: string; // compatibility alias
  falseAlarmReason?: string;
  rejection_reason?: string; // compatibility alias
  resolution_note?: string;
  persistence: string;
  movement: boolean;
  timeline: { status: IncidentStatus; time: string; actor: string; note?: string }[];
  detections?: Detection[];
  images?: IncidentImage[];
}

export interface User {
  id: string;
  name: string;
  username: string;
  phone_number?: string;
  telegram_chat_id?: string;
  role: Role;
  active: boolean;
  lastLogin: string;
}

export interface Permission {
  id: string;
  role_name: string;
  can_manage_cameras: boolean;
  can_acknowledge_incidents: boolean;
  can_manage_masks: boolean;
  can_view_reports: boolean;
  can_manage_users: boolean;
  can_change_settings: boolean;
  can_receive_notifications: boolean;
}

export interface SystemSetting {
  id: string;
  updated_by?: string;
  sms_daily_limit: number;
  sms_current_count: number;
  last_sms_reset_date: string;
  telegram_bot_token: string;
  telegram_channel_id: string;
  cleanup_days_detections: number;
  cleanup_days_images: number;
  updated_at?: string;
}

export interface AuditEntry {
  id: string;
  time: string;
  user: string;
  role: Role;
  action: string;
  details: string;
}

export interface NotificationItem {
  id: string;
  type: 'high' | 'camera_off' | 'camera_restore' | 'info';
  title: string;
  subtitle: string;
  time: string;
}

export type NotificationChannel = 'telegram' | 'sms' | 'webhook';
export type NotificationStatus = 'sent' | 'failed' | 'retrying';

export interface NotificationLog {
  id: string;
  incident_id?: string;
  user_id?: string;
  recipient_name?: string;
  channel: NotificationChannel;
  recipient: string;
  status: NotificationStatus;
  message_payload: string;
  error_message?: string;
  retry_count: number;
  sent_at: string;
}

