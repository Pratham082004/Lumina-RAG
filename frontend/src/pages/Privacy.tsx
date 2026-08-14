import React from 'react';
import { motion } from 'framer-motion';
import PageShell from '../components/PageShell';
import { Card } from '../components/ui/Card';

const Privacy: React.FC = () => {
  return (
    <PageShell>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem 6rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontFamily: 'Outfit, sans-serif' }}>Privacy Policy</h1>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '3rem' }}>Last updated: August 2026</p>

          <Card style={{ padding: '3rem' }} className="prose prose-invert max-w-none font-sans">
            <h2 className="text-xl font-bold mb-4 text-text-primary">1. Information We Collect</h2>
            <p className="text-text-secondary mb-6 leading-relaxed">
              We collect information you provide directly to us, such as your name, email address, and uploaded documents when you create an account or use our Service.
            </p>

            <h2 className="text-xl font-bold mb-4 text-text-primary">2. How We Use Your Information</h2>
            <p className="text-text-secondary mb-6 leading-relaxed">
              We use the information we collect to provide, maintain, and improve Lumina RAG. Your uploaded documents and chat histories are processed securely and are used solely to generate answers to your queries.
            </p>

            <h2 className="text-xl font-bold mb-4 text-text-primary">3. Data Security</h2>
            <p className="text-text-secondary mb-6 leading-relaxed">
              We implement robust security measures to protect your personal information and uploaded financial data against unauthorized access, alteration, or destruction. All data is encrypted at rest and in transit.
            </p>

            <h2 className="text-xl font-bold mb-4 text-text-primary">4. Sharing of Information</h2>
            <p className="text-text-secondary mb-6 leading-relaxed">
              We do not sell your personal information. We may share information with third-party service providers (like our LLM providers) strictly for the purpose of operating the Service, under strict confidentiality agreements.
            </p>

            <h2 className="text-xl font-bold mb-4 text-text-primary">5. Contact Us</h2>
            <p className="text-text-secondary mb-6 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at privacy@lumina.finance.
            </p>
          </Card>
        </motion.div>
      </div>
    </PageShell>
  );
};

export default Privacy;
