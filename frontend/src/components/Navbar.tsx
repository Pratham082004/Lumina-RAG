import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar: React.FC = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ 
        position: 'fixed', 
        top: 0, left: 0, right: 0, 
        padding: scrolled ? '1rem 4rem' : '1.5rem 4rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        zIndex: 100,
        background: scrolled ? 'rgba(10, 10, 15, 0.7)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-color)' : '1px solid transparent',
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
            <span style={{ fontSize: '1.25rem' }}>L</span>
          </div>
          <span className="text-gradient" style={{ fontSize: '1.25rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, letterSpacing: '-0.01em' }}>Lumina Finance</span>
        </Link>

        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginLeft: '2rem' }}>
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              style={{ 
                textDecoration: 'none', 
                color: isActive(link.path) ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: 500,
                position: 'relative',
                padding: '0.5rem 0',
                transition: 'color 0.3s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseOut={(e) => e.currentTarget.style.color = isActive(link.path) ? 'var(--text-primary)' : 'var(--text-secondary)'}
            >
              {link.name}
              {isActive(link.path) && (
                <motion.div
                  layoutId="navbar-active"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'var(--text-primary)',
                    borderRadius: '2px'
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>
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
