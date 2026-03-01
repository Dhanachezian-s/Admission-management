import { useState, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MastersSetup from './pages/MastersSetup';
import ApplicantForm from './pages/ApplicantForm';
import ApplicantsList from './pages/ApplicantsList';
import Allocation from './pages/Allocation';
import UsersPage from './pages/UsersPage';
import Layout from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { getToken, getRole } from './lib/api';
import './index.css';

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Admission overview and analytics' },
  '/masters': { title: 'Master Setup', subtitle: 'Configure institutions, programs, and quotas' },
  '/applicants': { title: 'Applicants', subtitle: 'View and manage all applicants' },
  '/applicant/new': { title: 'New Applicant', subtitle: 'Create a new applicant record' },
  '/allocation': { title: 'Seat Allocation', subtitle: 'Allocate seats and confirm admissions' },
  '/users': { title: 'Users Management', subtitle: 'Create and manage system users' },
};

function Inner({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();
  const meta = pageMeta[location.pathname] || { title: 'Admission Management', subtitle: '' };

  return (
    <Layout pageTitle={meta.title} pageSubtitle={meta.subtitle} onLogout={onLogout}>
      <Routes>
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/masters" element={<ProtectedRoute allowedRoles={['ADMIN']}><MastersSetup /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><UsersPage /></ProtectedRoute>} />
        <Route path="/applicants" element={<ProtectedRoute allowedRoles={['ADMIN', 'OFFICER']}><ApplicantsList /></ProtectedRoute>} />
        <Route path="/applicant/new" element={<ProtectedRoute allowedRoles={['ADMIN', 'OFFICER']}><ApplicantForm /></ProtectedRoute>} />
        <Route path="/allocation" element={<ProtectedRoute allowedRoles={['ADMIN', 'OFFICER']}><Allocation /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(!!getToken());
  }, []);

  function handleLogin() { setAuthed(true); }
  function handleLogout() { setAuthed(false); }

  if (!authed) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Inner onLogout={handleLogout} />
    </BrowserRouter>
  );
}
