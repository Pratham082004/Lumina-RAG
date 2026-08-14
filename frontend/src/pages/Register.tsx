import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const getPasswordStrength = (
  password: string,
): { level: number; label: string; class: string } => {
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
      setError(
        'Password is too weak. Use at least 6 characters with mixed case and numbers.',
      );
      return;
    }

    setIsLoading(true);
    try {
      const authUrl = import.meta.env.VITE_AUTH_URL || 'http://localhost:8000';
      const res = await axios.post(`${authUrl}/auth/register`, {
        name,
        email,
        password,
      });
      if (res.status === 201 || res.data) {
        navigate(`/verify?email=${encodeURIComponent(email)}`);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          'Failed to register',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageShell withNavbar={false} withFooter={false} withNavOffset={false}>
      <div className="min-h-screen flex items-center justify-center lg:justify-start px-4 sm:px-8 lg:px-[12vw] relative z-10">
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

          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Create Account</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>
              Join for advanced financial insights
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card style={{ padding: '2rem' }}>
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: 'hidden', marginBottom: '1.25rem' }}
                  >
                    <div
                      style={{
                        padding: '0.75rem',
                        background: 'rgba(245, 113, 106, 0.08)',
                        color: 'var(--color-error)',
                        borderRadius: '10px',
                        textAlign: 'center',
                        border: '1px solid rgba(245, 113, 106, 0.15)',
                        fontSize: '0.875rem',
                      }}
                    >
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User
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
                    <Mail
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
                    <Lock
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
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {password && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <div className="password-strength">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`password-strength-bar ${i <= strength.level ? `active ${strength.class}` : ''}`}
                          />
                        ))}
                      </div>
                      <p
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--color-text-muted)',
                          marginTop: '0.25rem',
                        }}
                      >
                        Password strength:{' '}
                        <span
                          style={{
                            fontWeight: 600,
                            color:
                              strength.level <= 1
                                ? 'var(--color-error)'
                                : strength.level === 2
                                  ? 'var(--color-warning)'
                                  : strength.level === 3
                                    ? '#84cc16'
                                    : 'var(--color-success)',
                          }}
                        >
                          {strength.label}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="input-group">
                  <label className="input-label">Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock
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
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--color-error)',
                        marginTop: '0.25rem',
                      }}
                    >
                      Passwords do not match
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  style={{
                    width: '100%',
                    marginTop: '0.5rem',
                  }}
                >
                  <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
                  {!isLoading && <ArrowRight size={18} />}
                </Button>
              </form>

              <div
                style={{
                  marginTop: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: '1px',
                    background: 'var(--color-border-default)',
                  }}
                />
                <span
                  style={{
                    padding: '0 1rem',
                    color: 'var(--color-text-muted)',
                    fontSize: '0.8125rem',
                  }}
                >
                  or
                </span>
                <div
                  style={{
                    flex: 1,
                    height: '1px',
                    background: 'var(--color-border-default)',
                  }}
                />
              </div>

              <div
                style={{
                  marginTop: '1.5rem',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    try {
                      const authUrl = import.meta.env.VITE_AUTH_URL || 'http://localhost:8000';
                      const res = await axios.post(`${authUrl}/auth/google`, {
                        token: credentialResponse.credential,
                      });
                      if (res.status === 200 || res.data.access_token) {
                        localStorage.setItem(
                          'user',
                          JSON.stringify({
                            id: res.data.user_id,
                            name: res.data.name,
                            email: res.data.email,
                            onboardingCompleted: res.data.onboardingCompleted,
                          }),
                        );
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

              <div
                style={{
                  marginTop: '1.75rem',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                }}
              >
                <p style={{ color: 'var(--color-text-muted)' }}>
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    style={{
                      color: 'var(--color-text-primary)',
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageShell>
  );
};

export default Register;
