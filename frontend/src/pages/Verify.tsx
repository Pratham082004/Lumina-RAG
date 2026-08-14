import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

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
        otp,
      });
      if (res.status === 200 || res.data) {
        setMessage('Email verified successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          'Failed to verify OTP',
      );
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
        email,
      });
      setMessage('A new OTP has been sent to your email.');
    } catch (err: any) {
      console.error('Resend error:', err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          'Failed to resend OTP',
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <PageShell withNavbar={false} withFooter={false} withNavOffset={false}>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div style={{ maxWidth: '440px', width: '100%' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.625rem',
              textDecoration: 'none',
              marginBottom: '2.5rem',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--color-accent-teal), var(--color-accent-amber))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#04241d',
                fontWeight: 'bold',
                fontSize: '0.875rem',
              }}
            >
              L
            </div>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: '1.125rem',
                color: 'var(--color-text-primary)',
              }}
            >
              Lumina RAG
            </span>
          </Link>

          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>Verify Email</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.125rem' }}>
              Enter the 6-digit code sent to {email}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card style={{ padding: '2.5rem' }}>
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: 'hidden', marginBottom: '1.5rem' }}
                  >
                    <div
                      style={{
                        padding: '0.75rem',
                        background: 'rgba(245, 113, 106, 0.1)',
                        color: 'var(--color-error)',
                        borderRadius: '8px',
                        textAlign: 'center',
                        border: '1px solid rgba(245, 113, 106, 0.2)',
                      }}
                    >
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
                    <div
                      style={{
                        padding: '0.75rem',
                        background: 'rgba(47, 230, 195, 0.1)',
                        color: 'var(--color-success)',
                        borderRadius: '8px',
                        textAlign: 'center',
                        border: '1px solid rgba(47, 230, 195, 0.2)',
                      }}
                    >
                      {message}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label className="input-label">Security Code</label>
                  <div style={{ position: 'relative' }}>
                    <CheckCircle
                      size={18}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--color-text-muted)',
                      }}
                    />
                    <input
                      type="text"
                      className="input-field"
                      style={{
                        paddingLeft: '2.5rem',
                        letterSpacing: '4px',
                        textAlign: 'center',
                        fontSize: '1.25rem',
                      }}
                      placeholder="000000"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  disabled={otp.length < 6}
                  style={{
                    width: '100%',
                    marginTop: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>{isLoading ? 'Verifying...' : 'Verify Now'}</span>
                  {!isLoading && <ArrowRight size={18} />}
                </Button>
              </form>

              <div
                style={{
                  marginTop: '2rem',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                }}
              >
                <p
                  style={{
                    color: 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  Didn't receive the code?
                  <button
                    onClick={handleResend}
                    disabled={isResending}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-text-primary)',
                      fontWeight: 500,
                      cursor: isResending ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    {isResending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                    {isResending ? 'Sending...' : 'Resend OTP'}
                  </button>
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageShell>
  );
};

export default Verify;
