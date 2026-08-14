import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Briefcase, Settings as SettingsIcon, Moon, Sun, Save, ArrowLeft, Key } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import PageShell from '../components/PageShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const Settings: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('account');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    jobTitle: user?.jobTitle || '',
    company: user?.company || '',
    investmentStyle: user?.investmentStyle || 'Fundamental',
  });

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const authUrl = import.meta.env.VITE_AUTH_URL || 'http://localhost:8000';

      const res = await axios.put(`${authUrl}/profile/${user.id}`, {
        name: formData.name,
        jobTitle: formData.jobTitle,
        company: formData.company,
        investmentStyle: formData.investmentStyle,
      });

      if (res.status === 200 || res.data) {
        localStorage.setItem('user', JSON.stringify({ ...user, ...res.data }));
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text:
          err.response?.data?.detail ||
          err.response?.data?.message ||
          'Failed to save settings.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account Details', icon: <User size={18} /> },
    { id: 'professional', label: 'Professional Info', icon: <Briefcase size={18} /> },
    { id: 'preferences', label: 'Preferences', icon: <SettingsIcon size={18} /> },
    { id: 'integrations', label: 'Integrations', icon: <Key size={18} /> },
  ];

  return (
    <PageShell withNavbar={false} withFooter={false} withNavOffset={false}>
      <div
        style={{
          minHeight: '100vh',
          padding: '2rem',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div style={{ width: '100%', maxWidth: '1000px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
            <Link
              to="/dashboard"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginRight: '1.5rem',
                fontSize: '0.9rem',
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 600 }}>
              Profile Settings
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <Card style={{ width: '250px', padding: '1.5rem 1rem', height: 'fit-content' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: activeTab === tab.id ? 'var(--color-accent-teal)' : 'transparent',
                      color: activeTab === tab.id ? '#04241d' : 'var(--color-text-muted)',
                      border: 'none',
                      textAlign: 'left',
                      fontWeight: activeTab === tab.id ? 600 : 500,
                    }}
                    onMouseOver={(e) => {
                      if (activeTab !== tab.id)
                        e.currentTarget.style.background =
                          'color-mix(in srgb, var(--color-text-primary) 5%, transparent)';
                    }}
                    onMouseOut={(e) => {
                      if (activeTab !== tab.id) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </Card>

            <Card style={{ flex: 1, minWidth: '300px', padding: '2rem' }}>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'account' && (
                  <div>
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                      Account Details
                    </h2>
                    <div className="input-group">
                      <label className="input-label">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        className="input-field"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        className="input-field"
                        value={formData.email}
                        disabled
                        style={{ opacity: 0.6, cursor: 'not-allowed' }}
                      />
                      <small
                        style={{
                          color: 'var(--color-text-muted)',
                          marginTop: '0.5rem',
                          display: 'block',
                        }}
                      >
                        Email cannot be changed currently.
                      </small>
                    </div>
                  </div>
                )}

                {activeTab === 'professional' && (
                  <div>
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                      Professional Information
                    </h2>
                    <div className="input-group">
                      <label className="input-label">Job Title</label>
                      <input
                        type="text"
                        name="jobTitle"
                        className="input-field"
                        value={formData.jobTitle}
                        onChange={handleChange}
                        placeholder="e.g. Financial Analyst"
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Company / Firm</label>
                      <input
                        type="text"
                        name="company"
                        className="input-field"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="e.g. Goldman Sachs"
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Investment Style</label>
                      <select
                        name="investmentStyle"
                        className="input-field"
                        value={formData.investmentStyle}
                        onChange={handleChange}
                      >
                        <option value="Fundamental">Fundamental Analysis</option>
                        <option value="Technical">Technical Analysis</option>
                        <option value="Quantitative">Quantitative / Algo</option>
                        <option value="Value">Value Investing</option>
                        <option value="Growth">Growth Investing</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === 'preferences' && (
                  <div>
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                      Application Preferences
                    </h2>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        background: 'color-mix(in srgb, var(--color-text-primary) 2%, transparent)',
                        border: '1px solid var(--color-border-default)',
                        borderRadius: '12px',
                        marginBottom: '1rem',
                      }}
                    >
                      <div>
                        <h4 style={{ margin: '0 0 0.25rem 0' }}>Theme</h4>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.875rem',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          Toggle between dark and light modes.
                        </p>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          background: 'var(--color-bg-primary)',
                          padding: '0.25rem',
                          borderRadius: '100px',
                        }}
                      >
                        <button
                          onClick={() => setTheme('dark')}
                          style={{
                            padding: '0.5rem',
                            borderRadius: '50%',
                            border: 'none',
                            background: theme === 'dark' ? 'var(--color-bg-panel)' : 'transparent',
                            color: theme === 'dark' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                            cursor: 'pointer',
                            boxShadow: theme === 'dark' ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
                          }}
                        >
                          <Moon size={18} />
                        </button>
                        <button
                          onClick={() => setTheme('light')}
                          style={{
                            padding: '0.5rem',
                            borderRadius: '50%',
                            border: 'none',
                            background: theme === 'light' ? 'var(--color-bg-panel)' : 'transparent',
                            color: theme === 'light' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                            cursor: 'pointer',
                            boxShadow: theme === 'light' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                          }}
                        >
                          <Sun size={18} />
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        background: 'color-mix(in srgb, var(--color-text-primary) 2%, transparent)',
                        border: '1px solid var(--color-border-default)',
                        borderRadius: '12px',
                      }}
                    >
                      <div>
                        <h4 style={{ margin: '0 0 0.25rem 0' }}>Push Notifications</h4>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.875rem',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          Receive alerts for saved filings.
                        </p>
                      </div>
                      <button
                        onClick={() => setNotifications(!notifications)}
                        style={{
                          width: '44px',
                          height: '24px',
                          borderRadius: '12px',
                          background: notifications
                            ? 'var(--color-accent-teal)'
                            : 'var(--color-bg-primary)',
                          border: '1px solid var(--color-border-default)',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: 'white',
                            position: 'absolute',
                            top: '2px',
                            left: notifications ? '22px' : '2px',
                            transition: 'all 0.2s',
                          }}
                        />
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'integrations' && (
                  <div>
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                      Integrations
                    </h2>
                    <div
                      style={{
                        padding: '1.5rem',
                        background: 'color-mix(in srgb, var(--color-text-primary) 2%, transparent)',
                        border: '1px solid var(--color-border-default)',
                        borderRadius: '12px',
                        textAlign: 'center',
                      }}
                    >
                      <Key
                        size={32}
                        style={{
                          color: 'var(--color-text-muted)',
                          marginBottom: '1rem',
                        }}
                      />
                      <h4 style={{ margin: '0 0 0.5rem 0' }}>API Keys</h4>
                      <p
                        style={{
                          margin: '0 0 1.5rem 0',
                          fontSize: '0.875rem',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        Manage your personal access tokens for API usage.
                      </p>
                      <Button variant="secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                        Generate New Token
                      </Button>
                    </div>
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '2.5rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid var(--color-border-default)',
                  }}
                >
                  <div>
                    {message.text && (
                      <span
                        style={{
                          color:
                            message.type === 'success'
                              ? 'var(--color-success)'
                              : 'var(--color-error)',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                        }}
                      >
                        {message.text}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    isLoading={isLoading}
                    style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                  >
                    <Save size={18} />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </motion.div>
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default Settings;
