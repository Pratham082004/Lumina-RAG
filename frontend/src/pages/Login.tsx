import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import illustration from '../assets/images/auth_illustration.png';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const authUrl = import.meta.env.VITE_AUTH_URL || 'http://localhost:8000';
      const res = await axios.post(`${authUrl}/auth/login`, {
        email,
        password
      });
      if (res.status === 200 || res.data.access_token) {
        localStorage.setItem('user', JSON.stringify({ id: res.data.user_id, name: res.data.name, email: res.data.email, onboardingCompleted: res.data.onboardingCompleted }));
        localStorage.setItem('token', res.data.access_token);
        if (res.data.onboardingCompleted) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorDetail = err.response?.data?.detail;
      if (errorDetail === 'Email not verified') {
        navigate(`/verify?email=${encodeURIComponent(email)}`);
        return;
      }
      setError(errorDetail || err.response?.data?.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Left Form Section */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem', zIndex: 10 }}>
        <div style={{ maxWidth: '420px', width: '100%', margin: '0 auto' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none', marginBottom: '2.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.875rem' }}>L</div>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '1.125rem', color: 'var(--text-primary)' }}>Lumina Finance</span>
          </Link>

          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>Welcome back</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Sign in to your account to continue</p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-panel"
            style={{ padding: '2rem' }}
          >
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden', marginBottom: '1.25rem' }}
              >
                <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--error)', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.15)', fontSize: '0.875rem' }}>
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="email" 
                  className="input-field" 
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="you@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="input-label" style={{ marginBottom: 0 }}>Password</label>
                <a href="#" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 500 }}
                  onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseOut={e => e.currentTarget.style.textDecoration = 'none'}
                >Forgot password?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  className="input-field" 
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px', display: 'flex' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit" 
              disabled={isLoading} 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: isLoading ? 0.7 : 1 }}
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
            </motion.button>
          </form>

          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
            <span style={{ padding: '0 1rem', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  const authUrl = import.meta.env.VITE_AUTH_URL || 'http://localhost:8000';
                  const res = await axios.post(`${authUrl}/auth/google`, {
                    token: credentialResponse.credential
                  });
                  if (res.status === 200 || res.data.access_token) {
                    localStorage.setItem('user', JSON.stringify({ id: res.data.user_id, name: res.data.name, email: res.data.email, onboardingCompleted: res.data.onboardingCompleted }));
                    localStorage.setItem('token', res.data.access_token);
                    if (res.data.onboardingCompleted) {
                      navigate('/dashboard');
                    } else {
                      navigate('/onboarding');
                    }
                  }
                } catch (error) {
                  console.error('Google Auth Error:', error);
                  setError('Failed to authenticate with Google');
                }
              }}
              onError={() => setError('Google login failed')}
              theme="filled_black"
              shape="pill"
            />
          </div>

          <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.875rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              Don't have an account? <Link to="/register" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500 }}>Create one now</Link>
            </p>
          </div>
          </motion.div>
        </div>
      </div>

      {/* Right Image Section */}
      <div className="hide-mobile" style={{ flex: 1, display: 'flex', padding: '1.5rem', background: 'var(--bg-primary)' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border-color)' }}
        >
          <img src={illustration} alt="Platform Illustration" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {/* Overlay text */}
          <div style={{ position: 'absolute', bottom: '3rem', left: '3rem', right: '3rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem 2rem', borderRadius: '16px' }}>
              <p style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>"Lumina transformed how we analyze SEC filings"</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>— Financial Analyst, Fortune 500</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
