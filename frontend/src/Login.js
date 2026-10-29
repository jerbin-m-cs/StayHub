import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

function Login({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      if (isLogin) {
        const { data } = await api.post('/auth/login', { username, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('username', data.username);
        setUser({ role: data.role, username: data.username });
        navigate('/');
      } else {
        await api.post('/auth/register', { username, password, role });
        setMessage('Account created. You can now log in.');
        setIsLogin(true);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to connect. Check the API server and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="row justify-content-center py-4">
      <div className="col-12 col-sm-10 col-md-7 col-lg-5">
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4 p-md-5">
            <h1 className="h3 text-center mb-2">{isLogin ? 'Welcome back' : 'Create your account'}</h1>
            <p className="text-secondary text-center mb-4">
              {isLogin ? 'Log in to manage your StayHub stay.' : 'Join StayHub to get started.'}
            </p>
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            {message && <div className="alert alert-success" role="status">{message}</div>}
            <form onSubmit={handleSubmit}>
              <label className="form-label" htmlFor="username">Username</label>
              <input
                id="username"
                className="form-control mb-3"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />

              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-control mb-3"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                minLength={isLogin ? undefined : 8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />

              {!isLogin && (
                <>
                  <label className="form-label" htmlFor="role">Account type</label>
                  <select
                    id="role"
                    className="form-select mb-3"
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="staff">Staff</option>
                  </select>
                </>
              )}

              <button className="btn btn-primary w-100" type="submit" disabled={submitting}>
                {submitting ? 'Please wait...' : isLogin ? 'Log in' : 'Register'}
              </button>
            </form>
            <div className="text-center mt-3">
              <button
                className="btn btn-link text-decoration-none"
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setMessage('');
                }}
              >
                {isLogin ? 'Need an account? Register' : 'Already registered? Log in'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
