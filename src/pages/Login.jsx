import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_ENDPOINTS, getAuthHeaders } from '../config/api';

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [useEmail, setUseEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const loginData = useEmail 
        ? { email: credentials.username, password: credentials.password }
        : { username: credentials.username, password: credentials.password };

      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (data.success) {
        // Store tokens in localStorage
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        toast.success('Login successful!');
        onLoginSuccess && onLoginSuccess();
        navigate('/');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      toast.error('Failed to connect to server');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex flex-col items-center">
            <img 
              src="/chaletmoments_logo.png" 
              alt="ChaletMoments" 
              className="h-20 w-auto mb-4"
            />
            <h2 className="text-center text-3xl font-extrabold text-gray-900">
              Hospitality Admin
            </h2>
          </div>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage the hospitality system of your properties
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setUseEmail(!useEmail)}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              {useEmail ? 'Login with username' : 'Login with email'}
            </button>
          </div>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                {useEmail ? 'Email' : 'Username'}
              </label>
              <input
                id="username"
                name="username"
                type={useEmail ? 'email' : 'text'}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={useEmail ? 'Email' : 'Username'}
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>Please login with your credentials</p>
            <p className="mt-2 text-xs text-gray-500">
              (The old admin/admin123 credentials no longer work)
            </p>
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-xs font-semibold text-yellow-800">Temporary Credentials:</p>
              <p className="text-xs font-mono mt-1">Username: admin</p>
              <p className="text-xs font-mono">Password: ricAKi0v7a4mKFVx</p>
              <p className="text-xs text-yellow-700 mt-2">⚠️ Change immediately after login!</p>
            </div>
            <p className="mt-2">
              <a href="#" className="text-blue-600 hover:text-blue-800" onClick={(e) => {
                e.preventDefault();
                navigator.clipboard.writeText('ricAKi0v7a4mKFVx');
                toast.success('Password copied to clipboard!');
              }}>
                Copy password to clipboard
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;