import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import illustration from '../assets/images/auth_illustration.png';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await axios.post('http://localhost:4000/api/auth/login', {
        email,
        password
      });
      if (res.data.success) {
        localStorage.setItem('user', JSON.stringify(res.data.data.user));
        localStorage.setItem('token', res.data.data.accessToken);
        if (res.data.data.user.onboardingCompleted) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Form Section */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem', zIndex: 10 }}>
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-panel"
          style={{ maxWidth: '440px', width: '100%', margin: '0 auto', padding: '3rem' }}
        >
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome Back</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Sign in to access your financial insights</p>
          </div>

          {error && (
            <div style={{ padding: '0.75rem', marginBottom: '1rem', background: 'rgba(255,0,0,0.1)', color: 'red', borderRadius: '4px', textAlign: 'center' }}>
              {error}
            </div>
          )}

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
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="password" 
                  className="input-field" 
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
            <span style={{ padding: '0 1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                console.log("Google Login Success");
                try {
                  const res = await axios.post('http://localhost:4000/api/auth/google', {
                    token: credentialResponse.credential
                  });
                  if (res.data.success) {
                    localStorage.setItem('user', JSON.stringify(res.data.data.user));
                    localStorage.setItem('token', res.data.data.accessToken);
                    if (res.data.data.user.onboardingCompleted) {
                      navigate('/dashboard');
                    } else {
                      navigate('/onboarding');
                    }
                  }
                } catch (error) {
                  console.error('Google Auth Error:', error);
                  alert('Failed to authenticate with Google');
                }
              }}
              onError={() => {
                console.log('Login Failed');
              }}
              theme="filled_black"
              shape="pill"
            />
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              Don't have an account? <a href="/register" className="text-gradient" style={{ textDecoration: 'none', fontWeight: 600 }}>Create one now</a>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Image Section */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        >
          <img src={illustration} alt="Abstract Financial AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to right, var(--bg-primary) 0%, transparent 50%)' }} />
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
