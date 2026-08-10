import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import illustration from '../assets/images/auth_illustration.png';

const getPasswordStrength = (password: string): { level: number; label: string; class: string } => {
  if (!password) return { level: 0, label: '', class: '' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 1, label: 'Weak', class: 'weak' };
  if (score <= 2) return { level: 2, label: 'Fair', class: 'fair' };
  if (score <= 3) return { level: 3, label: 'Good', class: 'good' };
  return { level: 4, label: 'Strong', class: 'strong' };
};

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (strength.level < 2) {
      setError('Password is too weak. Use at least 6 characters with mixed case and numbers.');
      return;
    }

    setIsLoading(true);
    try {
      const authUrl = import.meta.env.VITE_AUTH_URL || 'http://localhost:8000';
      const res = await axios.post(`${authUrl}/auth/register`, {
        name,
        email,
        password
      });
      if (res.status === 201 || res.data) {
        navigate(`/verify?email=${encodeURIComponent(email)}`);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'row-reverse', background: 'var(--bg-primary)' }}>
      {/* Right Form Section */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem', zIndex: 10 }}>
        <div style={{ maxWidth: '420px', width: '100%', margin: '0 auto' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none', marginBottom: '2.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.875rem' }}>L</div>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '1.125rem', color: 'var(--text-primary)' }}>Lumina Finance</span>
          </Link>

          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>Create Account</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Join for advanced financial insights</p>
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
              <label className="input-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  className="input-field" 
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="John Doe" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

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
              {/* Password strength meter */}
              {password && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div className="password-strength">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`password-strength-bar ${i <= strength.level ? `active ${strength.class}` : ''}`} />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Password strength: <span style={{ fontWeight: 600, color: strength.level <= 1 ? 'var(--error)' : strength.level === 2 ? 'var(--warning)' : strength.level === 3 ? '#84cc16' : 'var(--success)' }}>{strength.label}</span>
                  </p>
                </div>
              )}
            </div>
            
            <div className="input-group">
              <label className="input-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="password" 
                  className="input-field" 
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="••••••••" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p style={{ fontSize: '0.75rem', color: 'var(--error)', marginTop: '0.25rem' }}>Passwords do not match</p>
              )}
            </div>

            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit" 
              disabled={isLoading} 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: isLoading ? 0.7 : 1 }}
            >
              <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
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
              onError={() => setError('Google signup failed')}
              theme="filled_black"
              shape="pill"
              text="signup_with"
            />
          </div>

          <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.875rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              Already have an account? <Link to="/login" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
            </p>
          </div>
          </motion.div>
        </div>
      </div>

      {/* Left Image Section */}
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
              <p style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>Analyze 10-K filings in seconds</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>RAG-powered insights grounded in official SEC documents.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
