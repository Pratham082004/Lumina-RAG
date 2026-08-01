import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { Target, Users, BookOpen } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px' }}>
      <Navbar />
      
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '6rem 2rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '5rem' }}
        >
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>About <span className="text-gradient">Lumina</span></h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
            We are revolutionizing how analysts, investors, and researchers interact with financial data by bridging the gap between raw SEC filings and actionable intelligence.
          </p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-panel"
            style={{ padding: '3rem', display: 'flex', gap: '3rem', alignItems: 'center' }}
          >
            <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Target size={40} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Our Mission</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1.1rem' }}>
                To democratize access to deep financial analysis. By leveraging Retrieval-Augmented Generation, we aim to transform thousands of pages of dense 10-K filings into instantaneous, conversational insights.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-panel"
            style={{ padding: '3rem', display: 'flex', gap: '3rem', alignItems: 'center', flexDirection: 'row-reverse' }}
          >
            <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <BookOpen size={40} className="text-gradient" />
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>The Technology</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1.1rem' }}>
                Powered by FastAPI, ChromaDB, and Google Gemini. We chunk and vectorize complex financial data, allowing our AI to search, retrieve, and cite exact passages when answering your market queries.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginTop: '3rem' }}
          >
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Ready to explore?</h2>
            <a href="/register" style={{ textDecoration: 'none' }}>
              <button className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>Join Now</button>
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;
