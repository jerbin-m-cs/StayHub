import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate
} from 'react-router-dom';
import Rooms from './Rooms';
import Bookings from './Bookings';
import Login from './Login';

const readStoredUser = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const username = localStorage.getItem('username');
  return token && ['staff', 'user'].includes(role) ? { role, username } : null;
};

function ProtectedRoute({ user, children }) {
  return user ? children : <Navigate to="/login" replace />;
}

function AppContent() {
  const [user, setUser] = useState(readStoredUser);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    setUser(null);
    navigate('/login');
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">StayHub</Link>
          {user && (
            <div className="navbar-nav me-auto">
              <Link className="nav-link" to="/">Rooms</Link>
              <Link className="nav-link" to="/bookings">Bookings</Link>
            </div>
          )}
          <div className="navbar-nav ms-auto align-items-lg-center">
            {user ? (
              <>
                <span className="nav-link text-light">{user.username} ({user.role})</span>
                <button className="btn btn-outline-light btn-sm ms-lg-2" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <Link className="nav-link" to="/login">Log in</Link>
            )}
          </div>
        </div>
      </nav>

      <main className="container py-4">
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <Login setUser={setUser} />}
          />
          <Route
            path="/"
            element={
              <ProtectedRoute user={user}>
                <Rooms user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute user={user}>
                <Bookings user={user} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent />
    </Router>
  );
}

export default App;
