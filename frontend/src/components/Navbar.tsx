import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ 
        position: 'fixed', 
        top: 0, left: 0, right: 0, 
        padding: '1.5rem 4rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        zIndex: 100,
        background: 'rgba(10, 10, 15, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)'
      }}
    >
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h2 className="text-gradient" style={{ fontSize: '1.5rem', margin: 0, letterSpacing: '0.5px' }}>FinRAG AI</h2>
      </Link>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        {navLinks.map((link) => (
          <Link 
            key={link.name} 
            to={link.path} 
            style={{ 
              textDecoration: 'none', 
              color: isActive(link.path) ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: 500,
              transition: 'color 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-blue)'}
            onMouseOut={(e) => e.currentTarget.style.color = isActive(link.path) ? 'var(--text-primary)' : 'var(--text-secondary)'}
          >
            {link.name}
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <button className="btn btn-secondary">Sign In</button>
        </Link>
        <Link to="/register" style={{ textDecoration: 'none' }}>
          <button className="btn btn-primary">Get Started</button>
        </Link>
      </div>
    </motion.nav>
  );
};

export default Navbar;
