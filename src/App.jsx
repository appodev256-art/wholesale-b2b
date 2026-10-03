import { Navigate, Route, Routes } from 'react-router-dom';
import { useRole } from './lib/useRole.js';
import Login from './pages/Login.jsx';
import WholesalerDashboard from './pages/WholesalerDashboard.jsx';
import Register from './pages/Register.jsx';

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center text-muted">
      Loading…
    </div>
  );
}

function RequireRole({ allow, children }) {
  const { user, role, loading } = useRole();

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (role !== allow) return <Navigate to="/login" replace />;

  return children;
}

function PlatformHome() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="rounded-2xl border border-line bg-white p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Platform Admin</h1>
        <p className="text-muted">Dashboard coming next.</p>
      </div>
    </div>
  );
}

function RetailerHome() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="rounded-2xl border border-line bg-white p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Retailer</h1>
        <p className="text-muted">Shop coming next.</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/platform"
        element={
          <RequireRole allow="platform">
            <PlatformHome />
          </RequireRole>
        }
      />
    <Route
  path="/wholesaler"
  element={
    <RequireRole allow="wholesaler">
      <WholesalerDashboard />
    </RequireRole>
  }
/>
      <Route
        path="/retailer"
        element={
          <RequireRole allow="retailer">
            <RetailerHome />
          </RequireRole>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}