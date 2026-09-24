import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { ZoneProvider } from '@/context/ZoneContext';
import { CameraProvider } from '@/context/CameraContext';
import { IncidentProvider } from '@/context/IncidentContext';
import { NotificationLogProvider } from '@/context/NotificationLogContext';
import { AuditProvider } from '@/context/AuditContext';
import { LoginPage } from '@/pages/LoginPage';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { ZoneManagement } from '@/pages/admin/ZoneManagement';
import { CameraManagement } from '@/pages/admin/CameraManagement';
import { CameraDetails } from '@/pages/admin/CameraDetails';
import { UserManagement } from '@/pages/admin/UserManagement';
import { NotificationConfig } from '@/pages/admin/NotificationConfig';
import { NotificationLogs } from '@/pages/admin/NotificationLogs';
import { AuditLog } from '@/pages/admin/AuditLog';
import { CameraStatusPage } from '@/pages/shared/CameraStatusPage';
import { SupervisorDashboard } from '@/pages/supervisor/SupervisorDashboard';
import { LiveMonitoring } from '@/pages/supervisor/LiveMonitoring';
import { ActiveIncidents } from '@/pages/supervisor/ActiveIncidents';
import { IncidentReview } from '@/pages/supervisor/IncidentReview';
import { IncidentHistory } from '@/pages/supervisor/IncidentHistory';

function parseHash(): string {
  const h = window.location.hash.replace(/^#/, '');
  return h || '/';
}

function AppRoutes() {
  const { user } = useAuth();
  const [path, setPath] = useState(parseHash());

  useEffect(() => {
    const onHash = () => setPath(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = useCallback((to: string) => {
    window.location.hash = to;
    setPath(to);
  }, []);

  if (!user) {
    return <LoginPage onLoggedIn={() => {
      const role = localStorage.getItem('wfds-auth');
      try {
        const r = role ? JSON.parse(role).role : 'admin';
        navigate(r === 'admin' ? '/admin' : '/supervisor');
      } catch {
        navigate('/admin');
      }
    }} />;
  }

  // Role guard
  const isAdmin = user.role === 'admin';
  const isSupervisor = user.role === 'supervisor';

  // Supervisors are restricted to their own section.
  if (isSupervisor && path.startsWith('/admin')) {
    navigate('/supervisor');
    return null;
  }

  // Administrators are restricted to their own section.
  if (isAdmin && path.startsWith('/supervisor')) {
    navigate('/admin');
    return null;
  }

  // Admin routes are only available to administrators.
  if (isAdmin && path.startsWith('/admin')) {
    if (path === '/admin') return <AdminDashboard currentPath={path} onNavigate={navigate} />;
    if (path === '/admin/zones') return <ZoneManagement currentPath={path} onNavigate={navigate} />;
    if (path === '/admin/cameras') return <CameraManagement currentPath={path} onNavigate={navigate} />;
    if (path.startsWith('/admin/cameras/')) {
      const camId = path.split('/admin/cameras/')[1];
      return <CameraDetails cameraId={camId} currentPath={path} onNavigate={navigate} />;
    }
    if (path === '/admin/camera-status') return <CameraStatusPage currentPath={path} onNavigate={navigate} />;
    if (path === '/admin/users') return <UserManagement currentPath={path} onNavigate={navigate} />;
    if (path === '/admin/notifications') return <NotificationConfig currentPath={path} onNavigate={navigate} />;
    if (path === '/admin/notification-logs') return <NotificationLogs currentPath={path} onNavigate={navigate} />;
    if (path === '/admin/audit') return <AuditLog currentPath={path} onNavigate={navigate} />;
  }

  // Supervisor routes are only available to supervisors.
  if (isSupervisor && path.startsWith('/supervisor')) {
    if (path === '/supervisor') return <SupervisorDashboard currentPath={path} onNavigate={navigate} />;
    if (path === '/supervisor/live') return <LiveMonitoring currentPath={path} onNavigate={navigate} />;
    if (path === '/supervisor/camera-status') return <CameraStatusPage currentPath={path} onNavigate={navigate} />;
    if (path === '/supervisor/incidents') return <ActiveIncidents currentPath={path} onNavigate={navigate} />;
    if (path.startsWith('/supervisor/incidents/')) {
      const incId = path.split('/supervisor/incidents/')[1];
      return <IncidentReview incidentId={incId} currentPath={path} onNavigate={navigate} />;
    }
    if (path === '/supervisor/history') return <IncidentHistory currentPath={path} onNavigate={navigate} />;
    if (path.startsWith('/supervisor/history/')) {
      const incId = path.split('/supervisor/history/')[1];
      return <IncidentReview incidentId={incId} currentPath={path} onNavigate={navigate} readOnly />;
    }
  }

  navigate(isAdmin ? '/admin' : '/supervisor');
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <ZoneProvider>
        <CameraProvider>
          <IncidentProvider>
            <NotificationLogProvider>
              <AuditProvider>
                <ToastProvider>
                  <AppRoutes />
                </ToastProvider>
              </AuditProvider>
            </NotificationLogProvider>
          </IncidentProvider>
        </CameraProvider>
      </ZoneProvider>
    </AuthProvider>
  );
}
