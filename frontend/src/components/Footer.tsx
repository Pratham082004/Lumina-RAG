import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Globe, Share2, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      padding: '4rem 4rem 2rem',
      marginTop: '4rem',
      position: 'relative',
      zIndex: 10,
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '3rem',
        maxWidth: '1200px',
        margin: '0 auto',
        marginBottom: '3rem',
      }}>
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 'bold', fontSize: '1rem'
            }}>
              L
            </div>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '1.25rem' }}>Lumina Finance</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, maxWidth: '280px' }}>
            AI-powered financial analysis platform. Transforming SEC filings into actionable insights.
          </p>
        </div>

        {/* Product */}
        <div>
          <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>Product</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/about" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >About</Link>
            <Link to="/contact" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >Contact</Link>
            <Link to="/dashboard" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >Dashboard</Link>
          </div>
        </div>

        {/* Resources */}
        <div>
          <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>Resources</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <a href="https://www.sec.gov/edgar" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >SEC EDGAR</a>
            <a href="https://github.com/Pratham082004/Lumina-RAG" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >Documentation</a>
            <a href="https://github.com/Pratham082004/Lumina-RAG" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >API Reference</a>
          </div>
        </div>

        {/* Connect */}
        <div>
          <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>Connect</h4>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {[
              { icon: <Code2 size={18} />, href: 'https://github.com/Pratham082004/Lumina-RAG' },
              { icon: <Globe size={18} />, href: '#' },
              { icon: <Share2 size={18} />, href: '#' },
              { icon: <Mail size={18} />, href: 'mailto:contact@lumina.finance' },
            ].map((social, i) => (
              <a key={i} href={social.href} target="_blank" rel="noopener noreferrer"
                style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-color)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                }}
                onMouseOver={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
                onMouseOut={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'; }}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid var(--border-color)',
        paddingTop: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
          © {new Date().getFullYear()} Lumina Finance. All rights reserved.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.8125rem', transition: 'color 0.2s' }}
            onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >Privacy</a>
          <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.8125rem', transition: 'color 0.2s' }}
            onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >Terms</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
