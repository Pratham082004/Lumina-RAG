import React from 'react';
import { motion } from 'framer-motion';
import { Target, BookOpen } from 'lucide-react';
import PageShell from '../components/PageShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const About: React.FC = () => {
  return (
    <PageShell>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem 6rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '5rem' }}
        >
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>
            About <span className="text-gradient">Lumina</span>
          </h1>
          <p
            style={{
              fontSize: '1.25rem',
              color: 'var(--color-text-muted)',
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            We are revolutionizing how analysts, investors, and researchers interact
            with financial data by bridging the gap between raw SEC filings and
            actionable intelligence.
          </p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card
              style={{
                padding: '3rem',
                display: 'flex',
                gap: '3rem',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, var(--color-accent-blue), var(--color-accent-purple))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Target size={40} color="white" />
              </div>
              <div>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Our Mission</h2>
                <p
                  style={{
                    color: 'var(--color-text-muted)',
                    lineHeight: 1.7,
                    fontSize: '1.1rem',
                  }}
                >
                  To democratize access to deep financial analysis. By leveraging
                  Retrieval-Augmented Generation, we aim to transform thousands of
                  pages of dense 10-K filings into instantaneous, conversational
                  insights.
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card
              style={{
                padding: '3rem',
                display: 'flex',
                gap: '3rem',
                alignItems: 'center',
                flexDirection: 'row-reverse',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <BookOpen size={40} className="text-gradient" />
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>The Technology</h2>
                <p
                  style={{
                    color: 'var(--color-text-muted)',
                    lineHeight: 1.7,
                    fontSize: '1.1rem',
                  }}
                >
                  Powered by FastAPI, ChromaDB, and Google Gemini. We chunk and
                  vectorize complex financial data, allowing our AI to search,
                  retrieve, and cite exact passages when answering your market
                  queries.
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card style={{ padding: '3rem', textAlign: 'center' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Our Core Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
                <div>
                  <h3 className="text-lg font-bold text-text-primary mb-2">Accuracy First</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">Financial data requires precision. We prioritize strict citation and grounding in every answer.</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary mb-2">Uncompromising Security</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">Your proprietary research and chat histories are protected with bank-grade encryption.</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary mb-2">Blazing Speed</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">Time is money. We've optimized our vector search to deliver complex insights in milliseconds.</p>
                </div>
              </div>
            </Card>
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
              <Button variant="primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                Join Now
              </Button>
            </a>
          </motion.div>
        </div>
      </div>
    </PageShell>
  );
};

export default About;
