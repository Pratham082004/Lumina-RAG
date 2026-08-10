import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Building, TrendingUp, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import illustration from '../assets/images/auth_illustration.png';

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
      const token = localStorage.getItem('token');
      const res = await axios.put(`${authUrl}/profile/${user.id}`, {
        jobTitle,
        company,
        investmentStyle
      });
      if (res.status === 200 || res.data) {
        localStorage.setItem('user', JSON.stringify({ ...user, ...res.data }));
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Form Section */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem', zIndex: 10 }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-panel"
          style={{ maxWidth: '500px', width: '100%', margin: '0 auto', padding: '3rem' }}
        >
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Complete Your Profile</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Tell us a bit about yourself to personalize your experience.</p>
          </div>

          {error && (
            <div style={{ padding: '0.75rem', marginBottom: '1rem', background: 'rgba(255,0,0,0.1)', color: 'red', borderRadius: '4px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Job Title</label>
              <div style={{ position: 'relative' }}>
                <Briefcase size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
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
                <Building size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
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
                <TrendingUp size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <select 
                  className="input-field" 
                  style={{ paddingLeft: '2.5rem', appearance: 'none', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)' }}
                  value={investmentStyle}
                  onChange={(e) => setInvestmentStyle(e.target.value)}
                  required
                >
                  <option value="Conservative">Conservative</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Aggressive">Aggressive</option>
                </select>
                <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }}>▼</div>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ width: '100%', marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>{isLoading ? 'Saving...' : 'Complete Setup'}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        </motion.div>
      </div>

      {/* Decorative Image Section */}
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

export default Onboarding;
