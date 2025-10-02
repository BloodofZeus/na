import React, { useState } from 'react';
import { useAuth } from '../services/AuthContext';
import { useToast } from './ToastContainer';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username.trim() || !password.trim()) {
      const errorMsg = 'Please enter both username and password';
      setError(errorMsg);
      showError(errorMsg);
      setIsLoading(false);
      return;
    }

    try {
      const result = await login(username.trim(), password);
      if (!result.success) {
        const errorMsg = result.error || 'Login failed. Please try again.';
        setError(errorMsg);
        showError(errorMsg);
      } else {
        showSuccess(`Welcome back, ${username}!`);
        setError('');
      }
    } catch (error) {
      // AuthContext should handle all errors properly, but fallback just in case
      const errorMsg = error.message || 'Unexpected error occurred. Please try again.';
      setError(errorMsg);
      showError(errorMsg);
      console.error('Unexpected login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="card w-full max-w-md slide-up">
        <div className="card-body p-6">
          <div className="text-center mb-6">
            <img 
              src="/icons/logo.png" 
              alt="Shawarma Boss Logo" 
              className="w-12 h-12 mx-auto mb-4 rounded"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <h2 className="text-xl font-bold text-danger">Shawarma Boss POS</h2>
            <p className="text-muted text-sm mt-1">Delicious Shawarma, Seamless Service</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-control"
                placeholder="Enter username"
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                placeholder="Enter password"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="text-danger text-sm mb-4 p-2 bg-red-50 border border-red-200 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-danger w-full flex items-center justify-center"
            >
              {isLoading ? (
                <div className="spinner w-4 h-4"></div>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted">
            <div className="mb-2">
              <strong>Welcome to Shawarma Boss</strong>
            </div>
            <div className="space-y-1">
              <div>Your trusted partner in delicious shawarma</div>
              <div className="text-xs opacity-75">Secure • Fast • Reliable</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;