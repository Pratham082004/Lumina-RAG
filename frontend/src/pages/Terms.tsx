import React from 'react';
import { motion } from 'framer-motion';
import PageShell from '../components/PageShell';
import { Card } from '../components/ui/Card';

const Terms: React.FC = () => {
  return (
    <PageShell>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem 6rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontFamily: 'Outfit, sans-serif' }}>Terms and Conditions</h1>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '3rem' }}>Last updated: August 2026</p>

          <Card style={{ padding: '3rem' }} className="prose prose-invert max-w-none font-sans">
            <h2 className="text-xl font-bold mb-4 text-text-primary">1. Acceptance of Terms</h2>
            <p className="text-text-secondary mb-6 leading-relaxed">
              By accessing and using Lumina RAG ("the Service"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the Service.
            </p>

            <h2 className="text-xl font-bold mb-4 text-text-primary">2. Description of Service</h2>
            <p className="text-text-secondary mb-6 leading-relaxed">
              Lumina RAG provides AI-powered financial analysis and retrieval-augmented generation tools for parsing SEC filings. The Service is for informational purposes only and does not constitute financial advice.
            </p>

            <h2 className="text-xl font-bold mb-4 text-text-primary">3. User Accounts</h2>
            <p className="text-text-secondary mb-6 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.
            </p>

            <h2 className="text-xl font-bold mb-4 text-text-primary">4. Data and Privacy</h2>
            <p className="text-text-secondary mb-6 leading-relaxed">
              Your use of the Service is also governed by our Privacy Policy. We employ industry-standard encryption for uploaded documents and chat histories.
            </p>

            <h2 className="text-xl font-bold mb-4 text-text-primary">5. Limitations of Liability</h2>
            <p className="text-text-secondary mb-6 leading-relaxed">
              Lumina RAG shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of the Service. Financial decisions made based on data retrieved from Lumina RAG are at your own risk.
            </p>
          </Card>
        </motion.div>
      </div>
    </PageShell>
  );
};

export default Terms;
