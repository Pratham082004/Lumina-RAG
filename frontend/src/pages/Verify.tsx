import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Mail, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import illustration from '../assets/images/auth_illustration.png';

const Verify: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const queryEmail = searchParams.get('email');
    if (queryEmail) {
      setEmail(queryEmail);
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const authUrl = import.meta.env.VITE_AUTH_URL || 'http://localhost:8000';
      const res = await axios.post(`${authUrl}/auth/verify`, {
        email,
        otp
      });
      if (res.status === 200 || res.data) {
        setMessage('Email verified successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setMessage('');
    setIsResending(true);

    try {
      const authUrl = import.meta.env.VITE_AUTH_URL || 'http://localhost:8000';
      await axios.post(`${authUrl}/auth/resend-otp`, {
        email
      });
      setMessage('A new OTP has been sent to your email.');
    } catch (err: any) {
      console.error('Resend error:', err);
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Left Form Section */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem', zIndex: 10 }}>
        <div style={{ maxWidth: '440px', width: '100%', margin: '0 auto' }}>
          <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>Verify Email</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>Enter the 6-digit code sent to {email}</p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-panel"
            style={{ padding: '2.5rem' }}
          >
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden', marginBottom: '1.5rem' }}
                >
                  <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    {error}
                  </div>
                </motion.div>
              )}
              {message && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden', marginBottom: '1.5rem' }}
                >
                  <div style={{ padding: '0.75rem', background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                    {message}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Security Code</label>
                <div style={{ position: 'relative' }}>
                  <CheckCircle size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="text" 
                    className="input-field" 
                    style={{ paddingLeft: '2.5rem', letterSpacing: '4px', textAlign: 'center', fontSize: '1.25rem' }}
                    placeholder="000000" 
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={isLoading || otp.length < 6} 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: (isLoading || otp.length < 6) ? 0.7 : 1 }}
              >
                <span>{isLoading ? 'Verifying...' : 'Verify Now'}</span>
                {isLoading ? <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> : <ArrowRight size={18} />}
              </motion.button>
            </form>

            <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem' }}>
              <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                Didn't receive the code? 
                <button 
                  onClick={handleResend} 
                  disabled={isResending}
                  style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    color: 'var(--text-primary)', 
                    fontWeight: 500, 
                    cursor: isResending ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  {isResending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  {isResending ? 'Sending...' : 'Resend OTP'}
                </button>
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
        </motion.div>
      </div>
    </div>
  );
};

export default Verify;
