import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Globe, Share2, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer style={{
      borderTop: '1px solid var(--color-border-default)',
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
              background: 'linear-gradient(135deg, var(--color-accent-teal), var(--color-accent-amber))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#04241d', fontWeight: 'bold', fontSize: '1rem'
            }}>
              L
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.25rem' }}>Lumina RAG</span>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: 1.6, maxWidth: '280px' }}>
            AI-powered financial analysis platform. Transforming SEC filings into actionable insights.
          </p>
        </div>

        {/* Product */}
        <div>
          <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>Product</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/about" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
            >About</Link>
            <Link to="/contact" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
            >Contact</Link>
          </div>
        </div>

        {/* Resources */}
        <div>
          <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>Resources</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <a href="https://www.sec.gov/edgar" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
            >SEC EDGAR</a>
            <a href="https://github.com/Pratham082004/Lumina-RAG" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
            >Documentation</a>
            <a href="https://github.com/Pratham082004/Lumina-RAG" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
            >API Reference</a>
          </div>
        </div>

        {/* Connect */}
        <div>
          <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>Connect</h4>
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
                  border: '1px solid var(--color-border-default)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-text-muted)',
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                }}
                onMouseOver={e => { e.currentTarget.style.color = 'var(--color-text-primary)'; e.currentTarget.style.borderColor = 'var(--color-border-hover)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
                onMouseOut={e => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.borderColor = 'var(--color-border-default)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'; }}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid var(--color-border-default)',
        paddingTop: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
          © {new Date().getFullYear()} Lumina RAG. All rights reserved.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link to="/privacy" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.8125rem', transition: 'color 0.2s' }}
            onMouseOver={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
          >Privacy</Link>
          <Link to="/terms" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.8125rem', transition: 'color 0.2s' }}
            onMouseOver={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
          >Terms</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
