import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MessageSquare, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import PageShell from '../components/PageShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const Contact: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const authUrl = import.meta.env.VITE_AUTH_URL || 'http://localhost:8000';
      const res = await axios.post(`${authUrl}/contact/`, { email, message });
      if (res.data?.status === 'success') {
        setSuccessMsg(res.data.message || 'Thank you for reaching out! Your message has been received.');
        setEmail('');
        setMessage('');
      } else {
        setErrorMsg('Failed to send message. Please try again.');
      }
    } catch (err: any) {
      console.error('Contact submission error:', err);
      setErrorMsg(
        err.response?.data?.detail || 'An error occurred while sending your message. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem 6rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>
            Get in <span className="text-gradient">Touch</span>
          </h1>
          <p
            style={{
              fontSize: '1.25rem',
              color: 'var(--color-text-muted)',
            }}
          >
            Have questions about our API, enterprise solutions, or just want to
            say hi? We'd love to hear from you.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card style={{ padding: '3rem' }}>
            <AnimatePresence mode="wait">
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    padding: '1.25rem',
                    marginBottom: '1.5rem',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(47, 230, 195, 0.1)',
                    border: '1px solid rgba(47, 230, 195, 0.3)',
                    color: 'var(--color-text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <CheckCircle2 size={20} style={{ color: '#2fe6c3', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>{successMsg}</span>
                </motion.div>
              )}

              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    padding: '1.25rem',
                    marginBottom: '1.5rem',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: 'var(--color-text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <AlertCircle size={20} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>{errorMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-muted)',
                    }}
                  />
                  <input
                    type="email"
                    className="input-field"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Message</label>
                <div style={{ position: 'relative' }}>
                  <MessageSquare
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '20px',
                      color: 'var(--color-text-muted)',
                    }}
                  />
                  <textarea
                    className="input-field"
                    style={{
                      paddingLeft: '2.5rem',
                      minHeight: '150px',
                      resize: 'vertical',
                    }}
                    placeholder="How can we help you?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  marginTop: '1rem',
                  display: 'flex',
                  gap: '0.5rem',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                    <Send size={18} />
                  </>
                )}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </PageShell>
  );
};

export default Contact;
