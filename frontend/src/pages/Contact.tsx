import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { Mail, MessageSquare, Send } from 'lucide-react';

const Contact: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: implement contact form submission
    alert("Message sent! (Mock)");
    setEmail('');
    setMessage('');
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px' }}>
      <Navbar />
      
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '6rem 2rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>Get in <span className="text-gradient">Touch</span></h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>
            Have questions about our API, enterprise solutions, or just want to say hi? We'd love to hear from you.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-panel"
          style={{ padding: '3rem' }}
        >
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="email" 
                  className="input-field" 
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="you@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Message</label>
              <div style={{ position: 'relative' }}>
                <MessageSquare size={18} style={{ position: 'absolute', left: '12px', top: '20px', color: 'var(--text-secondary)' }} />
                <textarea 
                  className="input-field" 
                  style={{ paddingLeft: '2.5rem', minHeight: '150px', resize: 'vertical' }}
                  placeholder="How can we help you?" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              <span>Send Message</span>
              <Send size={18} />
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
