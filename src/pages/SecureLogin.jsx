import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import secureAuth from '../services/secureAuth';

const SecureLoginPage = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [handshakeStatus, setHandshakeStatus] = useState('idle'); // idle|ok|fail|pending
  const [lastResult, setLastResult] = useState(null);

  // Check if already authenticated
  useEffect(() => {
    const init = async () => {
      const authenticated = await secureAuth.isAuthenticated();
      setIsAuthenticated(authenticated);
      // Pre-fetch handshake early to avoid first-click latency
      setHandshakeStatus('pending');
      const hs = await secureAuth.ensureHandshake?.();
      if (hs) {
        setHandshakeStatus('ok');
      } else {
        setHandshakeStatus('fail');
      }
    };
    init();
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds before trying again.`);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // If handshake previously failed, try one more time just before login
      if (handshakeStatus === 'fail') {
        setHandshakeStatus('pending');
        const hs = await secureAuth.ensureHandshake?.();
        setHandshakeStatus(hs ? 'ok' : 'fail');
        if (!hs) {
          setIsLoading(false);
          setError('Handshake unavailable. Server key missing or server down.');
          return;
        }
      }

      const result = await secureAuth.login(credentials.username, credentials.password);
      setLastResult(result);
      
      if (result.success) {
        setIsAuthenticated(true);
        // Reset form
        setCredentials({ username: '', password: '' });
        setAttempts(0);
      } else {
        setError(result.message || 'Login failed');
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        // Implement progressive cooldown
        if (newAttempts >= 3) {
          setCooldown(30 + (newAttempts - 3) * 15); // 30s, 45s, 60s, etc.
        }
        
        // Clear sensitive data
        setCredentials({ username: '', password: '' });
      }
    } catch (error) {
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Redirect to admin panel if authenticated
  if (isAuthenticated) {
    return <Navigate to={secureAuth.getAdminRoute()} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        <div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto h-16 w-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-6"
          >
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </motion.div>
          
          <h2 className="mt-6 text-center text-3xl font-bold text-white">
            Secure Access
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Management Portal Authentication
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                disabled={isLoading || cooldown > 0}
                className="relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Username"
                value={credentials.username}
                onChange={handleInputChange}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={isLoading || cooldown > 0}
                className="relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Password"
                value={credentials.password}
                onChange={handleInputChange}
              />
            </motion.div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-md bg-red-900/50 border border-red-500/50 p-3"
            >
              <div className="flex">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              </div>
            </motion.div>
          )}

          {handshakeStatus === 'fail' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-md bg-yellow-900/40 border border-yellow-600/40 p-3 text-yellow-200 text-sm">
              Handshake failed. Ensure auth server running and INTERNAL_API_KEY set. Retry will occur on next attempt.
            </motion.div>
          )}

          {cooldown > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-yellow-300 text-sm"
            >
              Please wait {cooldown} seconds before retrying...
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <button
              type="submit"
              disabled={isLoading || cooldown > 0 || !credentials.username || !credentials.password}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-pink-600 disabled:hover:to-purple-600 transition-all duration-200"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <svg className="h-5 w-5 text-pink-300 group-hover:text-pink-200" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </motion.div>

          {attempts > 0 && (
            <div className="text-center text-xs text-gray-400">
              Failed attempts: {attempts}/5
            </div>
          )}
          {lastResult && (
            <div className="text-center text-[10px] text-gray-500 mt-2">
              Debug: status={lastResult.status} msg="{lastResult.message}" handshake={handshakeStatus}
            </div>
          )}
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-gray-500 mt-6"
        >
          Secure access portal • Unauthorized access is prohibited
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SecureLoginPage;