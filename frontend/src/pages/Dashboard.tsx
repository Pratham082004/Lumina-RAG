import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, User, Activity, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: implement logout logic
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div className="glass-panel" style={{ width: '280px', borderRadius: 0, borderTop: 'none', borderBottom: 'none', borderLeft: 'none', display: 'flex', flexDirection: 'column', padding: '2rem 0' }}>
        <div style={{ padding: '0 2rem', marginBottom: '3rem' }}>
          <h2 className="text-gradient" style={{ fontSize: '1.5rem', margin: 0 }}>FinRAG AI</h2>
        </div>
        
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0 1rem' }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', color: 'var(--text-primary)', textDecoration: 'none', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
            <Activity size={20} className="text-gradient" />
            <span style={{ fontWeight: 500 }}>Overview</span>
          </a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
            <User size={20} />
            <span style={{ fontWeight: 500 }}>Profile</span>
          </a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
            <Settings size={20} />
            <span style={{ fontWeight: 500 }}>Settings</span>
          </a>
        </nav>

        <div style={{ padding: '0 1rem' }}>
          <button onClick={handleLogout} className="btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'transparent', color: 'var(--error)', border: '1px solid rgba(255, 71, 87, 0.2)' }}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '3rem 4rem', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome back, <span className="text-gradient">John</span></h1>
            <p style={{ color: 'var(--text-secondary)' }}>Here's what's happening with your account today.</p>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
            JD
          </div>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}
        >
          {/* Mock Stats Cards */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Queries</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'Outfit' }}>1,248</div>
            <div style={{ color: 'var(--success)', fontSize: '0.875rem', marginTop: '0.5rem' }}>+12% from last week</div>
          </div>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Sessions</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'Outfit' }}>12</div>
            <div style={{ color: 'var(--success)', fontSize: '0.875rem', marginTop: '0.5rem' }}>+2 this hour</div>
          </div>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Plan Status</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'Outfit' }} className="text-gradient">Pro</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Renews in 14 days</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
