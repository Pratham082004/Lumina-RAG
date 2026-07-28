import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center' }}
        >
          <div style={{ fontSize: '8rem', fontWeight: 700, lineHeight: 1, marginBottom: '1rem', fontFamily: 'Outfit' }} className="text-gradient">
            404
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Page Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '400px', margin: '0 auto 2.5rem' }}>
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          
          <Link to="/" style={{ textDecoration: 'none' }}>
            <button className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Home size={18} />
              <span>Back to Home</span>
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
