import React from 'react';
import { motion, Variants } from 'framer-motion';
import { ArrowRight, BarChart2, Shield, Zap, ChevronDown, FileSearch, TrendingUp, Database } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import illustration from '../assets/images/auth_illustration.png';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

const stats = [
  { value: '10K+', label: 'SEC Filings Indexed' },
  { value: '3072', label: 'Dim Embeddings' },
  { value: '<50ms', label: 'Query Latency' },
  { value: '99.2%', label: 'Retrieval Accuracy' },
];

const Landing: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px' }}>
      <Navbar />
      
      {/* Hero Section */}
      <section style={{ display: 'flex', alignItems: 'center', padding: '5rem 4rem 3rem', minHeight: 'calc(100vh - 80px)', position: 'relative' }}>
        <div style={{ flex: 1, paddingRight: '4rem' }}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '100px', color: 'var(--accent-blue)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '2rem' }}>
              <Zap size={14} />
              Next-Gen Financial Intelligence
            </motion.div>
            
            <motion.h1 variants={itemVariants} style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.03em', fontFamily: 'Outfit, sans-serif' }}>
              Unleash the Power of <br /><span className="text-gradient" style={{ fontSize: 'clamp(2.75rem, 5.5vw, 4.5rem)' }}>Lumina Finance</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '540px', lineHeight: 1.7 }}>
              Analyze SEC filings, uncover hidden insights, and make data-driven decisions with our advanced Retrieval-Augmented Generation platform.
            </motion.p>
            
            <motion.div variants={itemVariants} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <button className="btn btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
                  Start Free Trial <ArrowRight size={18} style={{ marginLeft: '0.25rem' }} />
                </button>
              </Link>
              <Link to="/about" style={{ textDecoration: 'none' }}>
                <button className="btn btn-secondary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
                  Learn More
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
        
        <div style={{ flex: 1, position: 'relative' }} className="hide-mobile">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, rotateY: 5 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.4, type: "spring", stiffness: 100 }}
            className="glass-panel"
            style={{ padding: '0.75rem', borderRadius: '24px', position: 'relative', zIndex: 2, transformPerspective: 1000 }}
            whileHover={{ scale: 1.02, rotateY: -2, transition: { duration: 0.4 } }}
          >
            <img src={illustration} alt="Platform Preview" style={{ width: '100%', borderRadius: '18px', display: 'block' }} />
          </motion.div>

          {/* Floating accent glow behind illustration */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '80%', height: '80%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15), transparent 70%)',
            filter: 'blur(60px)', zIndex: 0,
          }} />
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          style={{
            position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
            color: 'var(--text-secondary)', fontSize: '0.75rem', letterSpacing: '0.1em',
          }}
        >
          <span>SCROLL</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <ChevronDown size={18} />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section style={{ padding: '0 4rem', position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-panel"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderRadius: '20px', overflow: 'hidden' }}
        >
          {stats.map((stat, i) => (
            <div key={i} style={{
              padding: '2rem 1.5rem',
              textAlign: 'center',
              borderRight: i < stats.length - 1 ? '1px solid var(--border-color)' : 'none',
            }}>
              <div className="text-gradient" style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif', marginBottom: '0.25rem' }}>{stat.value}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 500, letterSpacing: '0.02em' }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '6rem 4rem', position: 'relative', zIndex: 10 }}>
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <motion.div variants={itemVariants} style={{ display: 'inline-block', padding: '0.4rem 1rem', background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '100px', color: 'var(--accent-purple)', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              Core Capabilities
            </motion.div>
            <motion.h2 variants={itemVariants} style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', marginBottom: '1rem', fontFamily: 'Outfit, sans-serif' }}>Enterprise-Grade Analysis</motion.h2>
            <motion.p variants={itemVariants} style={{ color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto', lineHeight: 1.6 }}>Everything you need to process complex financial documents instantly.</motion.p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: <Zap size={28} />, title: 'Real-time Insights', desc: 'Query thousands of SEC filings in milliseconds using state-of-the-art vector search.', color: 'var(--accent-blue)', bg: 'rgba(59, 130, 246, 0.08)' },
              { icon: <BarChart2 size={28} />, title: 'Data Grounding', desc: 'Every AI answer is directly cited and grounded in official 10-K financial documents.', color: 'var(--accent-purple)', bg: 'rgba(139, 92, 246, 0.08)' },
              { icon: <Shield size={28} />, title: 'Secure & Private', desc: 'Bank-grade encryption for all your custom uploaded documents and chat histories.', color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.08)' },
              { icon: <FileSearch size={28} />, title: 'Smart Extraction', desc: 'Automatically parse and structure 10-K sections: Risk Factors, MD&A, Financials.', color: 'var(--accent-cyan)', bg: 'rgba(6, 182, 212, 0.08)' },
              { icon: <TrendingUp size={28} />, title: 'Live Stock Data', desc: 'Interactive ticker mentions with real-time price charts and performance metrics.', color: 'var(--accent-pink)', bg: 'rgba(236, 72, 153, 0.08)' },
              { icon: <Database size={28} />, title: 'Multi-Year Analysis', desc: 'Auto-ingest and compare filings across multiple years for trend detection.', color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.08)' },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="glass-panel" 
                style={{ padding: '2rem', cursor: 'default' }}
              >
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px',
                  background: feature.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1.25rem', color: feature.color,
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontFamily: 'Outfit, sans-serif' }}>{feature.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.9375rem' }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '4rem', position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-panel"
          style={{
            padding: '4rem 3rem',
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 auto',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background glow */}
          <div style={{
            position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)',
            width: '400px', height: '400px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12), transparent 70%)',
            filter: 'blur(60px)', pointerEvents: 'none',
          }} />
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '1rem', fontFamily: 'Outfit, sans-serif', position: 'relative' }}>
            Ready to transform your financial analysis?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '480px', margin: '0 auto 2rem', lineHeight: 1.6, position: 'relative' }}>
            Join analysts and investors who are already using Lumina to uncover insights from SEC filings.
          </p>
          <Link to="/register" style={{ textDecoration: 'none', position: 'relative' }}>
            <button className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.0625rem' }}>
              Get Started — It's Free <ArrowRight size={18} style={{ marginLeft: '0.25rem' }} />
            </button>
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
