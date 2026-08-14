import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Building, TrendingUp, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const Onboarding: React.FC = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [investmentStyle, setInvestmentStyle] = useState('Moderate');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.onboardingCompleted) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const authUrl = import.meta.env.VITE_AUTH_URL || 'http://localhost:8000';

      const res = await axios.put(`${authUrl}/profile/${user.id}`, {
        jobTitle,
        company,
        investmentStyle,
      });
      if (res.status === 200 || res.data) {
        localStorage.setItem('user', JSON.stringify({ ...user, ...res.data }));
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          'Failed to update profile',
      );
    } finally {
      setIsLoading(false);
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: '500px', width: '100%' }}
        >
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

          <Card style={{ padding: '3rem' }}>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                Complete Your Profile
              </h1>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Tell us a bit about yourself to personalize your experience.
              </p>
            </div>

            {error && (
              <div
                style={{
                  padding: '0.75rem',
                  marginBottom: '1rem',
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
            )}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Job Title</label>
                <div style={{ position: 'relative' }}>
                  <Briefcase
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
                    placeholder="e.g. Financial Analyst"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Company</label>
                <div style={{ position: 'relative' }}>
                  <Building
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
                    placeholder="e.g. Acme Corp"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Investment Style</label>
                <div style={{ position: 'relative' }}>
                  <TrendingUp
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-muted)',
                    }}
                  />
                  <select
                    className="input-field"
                    style={{ paddingLeft: '2.5rem' }}
                    value={investmentStyle}
                    onChange={(e) => setInvestmentStyle(e.target.value)}
                    required
                  >
                    <option value="Conservative">Conservative</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Aggressive">Aggressive</option>
                  </select>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                style={{
                  width: '100%',
                  marginTop: '2rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>{isLoading ? 'Saving...' : 'Complete Setup'}</span>
                {!isLoading && <ArrowRight size={18} />}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </PageShell>
  );
};

export default Onboarding;
