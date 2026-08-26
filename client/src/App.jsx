import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Clubs from './pages/Clubs';
import ClubDetail from './pages/ClubDetail';
import Events from './pages/Events';
import DiscussionBoard from './pages/DiscussionBoard';
import Jobs from './pages/Jobs';
import Achievements from './pages/Achievements';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-display font-black text-2xl text-white bg-black shadow-md border border-zinc-800">
          MK
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-zinc-200 border-t-black rounded-full animate-spin"></div>
          <p className="text-xs text-zinc-500 font-bold tracking-wider font-display uppercase">Loading MKCE Connect...</p>
        </div>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="clubs" element={<Clubs />} />
        <Route path="clubs/:id" element={<ClubDetail />} />
        <Route path="events" element={<Events />} />
        <Route path="discussions" element={<DiscussionBoard />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="achievements" element={<Achievements />} />
        <Route path="messages" element={<Messages />} />
        <Route path="messages/:userId" element={<Messages />} />
        <Route path="profile" element={<Profile />} />
        <Route path="profile/:id" element={<Profile />} />
        {(user?.role === 'admin' || user?.role === 'hod') && (
          <Route path="admin" element={<AdminDashboard />} />
        )}
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#000000',
              color: '#ffffff',
              borderRadius: '12px',
              padding: '12px 18px',
              fontSize: '13px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '600',
              border: '1px solid #27272a',
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.25)',
            },
            success: { iconTheme: { primary: '#ffffff', secondary: '#000000' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#ffffff' } },
          }}
        />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
