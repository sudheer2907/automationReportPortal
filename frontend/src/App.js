import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TestRunDetails from './pages/TestRunDetails';


function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [role, setRole] = useState(() => localStorage.getItem('role'));
  const [username, setUsername] = useState(() => localStorage.getItem('username'));

  React.useEffect(() => {
    setToken(localStorage.getItem('token'));
    setRole(localStorage.getItem('role'));
    setUsername(localStorage.getItem('username'));
  }, []);

  const handleLogin = (token, role, username) => {
    setToken(token);
    setRole(role);
    setUsername(username);
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('username', username);
  };

  const handleLogout = () => {
    setToken(null);
    setRole(null);
    setUsername(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
  };

    return (
    <>
      <Router>
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {token && username && (
                <span style={{ fontWeight: 'bold', color: '#1976d2', marginBottom: 8 }}>Welcome, {username}!</span>
              )}
              
            </div>
            {!token && <Link to="/login" style={{ marginLeft: 16 }}>Login</Link>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>

            {token && (
              <button
                onClick={handleLogout}
                style={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold', fontSize: '1.1rem', padding: '10px 28px', border: 'none', borderRadius: 6, cursor: 'pointer', marginBottom: 8 }}
              >
                Logout
              </button>
            )}
            {role === 'admin' && <Link to="/register" style={{ fontWeight: 'bold', color: '#1976d2', textDecoration: 'none', fontSize: '1.1rem' }}>Register User</Link>}
          </div>
        </nav>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={role === 'admin' ? <Register /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={token ? <Dashboard role={role} /> : <Navigate to="/login" />} />
<Route path="/testrun/:runId/:project" element={<TestRunDetails />} />
          <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;

