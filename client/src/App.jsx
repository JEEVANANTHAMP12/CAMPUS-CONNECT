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
        <div className="w-16 h-16 rounded-xl flex items-center justify-center font-display font-bold text-2xl text-white"
          style={{ background: 'linear-gradient(135deg, #06A3DA 0%, #073f69 100%)' }}>
          MK
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-mkce-200 border-t-mkce-500 rounded-full animate-spin"></div>
          <p className="text-sm text-surface-400 font-medium font-display">Loading MKCE Connect...</p>
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
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#09203f',
              color: '#f8fafc',
              borderRadius: '10px',
              padding: '12px 16px',
              fontSize: '13px',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: '500',
            },
            success: { iconTheme: { primary: '#06A3DA', secondary: '#f8fafc' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#f8fafc' } },
          }}
        />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
