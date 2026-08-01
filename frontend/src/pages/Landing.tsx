import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart2, Shield, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import illustration from '../assets/images/auth_illustration.png';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

const Landing: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px' }}>
      <Navbar />
      
      {/* Hero Section */}
      <section style={{ display: 'flex', alignItems: 'center', padding: '6rem 4rem', minHeight: 'calc(100vh - 80px)' }}>
        <div style={{ flex: 1, paddingRight: '4rem' }}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(0, 210, 255, 0.1)', border: '1px solid var(--accent-blue)', borderRadius: '20px', color: 'var(--accent-blue)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '2rem' }}>
              Next-Gen Financial Intelligence
            </motion.div>
            
            <motion.h1 variants={itemVariants} style={{ fontSize: '4.5rem', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-1px' }}>
              Unleash the Power of <br /><span className="text-gradient">Lumina Finance</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '600px', lineHeight: 1.6 }}>
              Analyze SEC filings, uncover hidden insights, and make data-driven decisions with our advanced Retrieval-Augmented Generation platform.
            </motion.p>
            
            <motion.div variants={itemVariants} style={{ display: 'flex', gap: '1.5rem' }}>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <button className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
                  Start Free Trial <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
                </button>
              </Link>
              <Link to="/about" style={{ textDecoration: 'none' }}>
                <button className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
                  Learn More
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
        
        <div style={{ flex: 1, position: 'relative' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, rotateY: 5 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.4, type: "spring", stiffness: 100 }}
            className="glass-panel"
            style={{ padding: '1rem', borderRadius: '24px', position: 'relative', zIndex: 2, transformPerspective: 1000 }}
            whileHover={{ scale: 1.02, rotateY: -2, transition: { duration: 0.4 } }}
          >
            <img src={illustration} alt="Platform Preview" style={{ width: '100%', borderRadius: '16px', display: 'block' }} />
          </motion.div>
        </div>
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
            <motion.h2 variants={itemVariants} style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Enterprise-Grade Analysis</motion.h2>
            <motion.p variants={itemVariants} style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>Everything you need to process complex financial documents instantly.</motion.p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            <motion.div variants={itemVariants} whileHover={{ y: -12, scale: 1.02 }} transition={{ type: "spring", stiffness: 400 }} className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(0, 210, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--accent-blue)' }}>
                <Zap size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Real-time Insights</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Query thousands of SEC filings in milliseconds using state-of-the-art vector search.</p>
            </motion.div>
            
            <motion.div variants={itemVariants} whileHover={{ y: -12, scale: 1.02 }} transition={{ type: "spring", stiffness: 400 }} className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(122, 40, 203, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--accent-purple)' }}>
                <BarChart2 size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Data Grounding</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Every AI answer is directly cited and grounded in official 10-K financial documents.</p>
            </motion.div>
            
            <motion.div variants={itemVariants} whileHover={{ y: -12, scale: 1.02 }} transition={{ type: "spring", stiffness: 400 }} className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(46, 213, 115, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--success)' }}>
                <Shield size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Secure & Private</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Bank-grade encryption for all your custom uploaded documents and chat histories.</p>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Landing;
