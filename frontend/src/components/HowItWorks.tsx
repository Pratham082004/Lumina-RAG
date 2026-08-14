import React from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Cpu, MessageSquare } from 'lucide-react';

const steps = [
  {
    icon: <UploadCloud size={32} />,
    title: '1. Upload your 10-K',
    desc: 'Simply upload any SEC filing or link a ticker. We support PDFs and direct EDGAR ingestion.',
  },
  {
    icon: <Cpu size={32} />,
    title: '2. AI Vectorization',
    desc: 'Lumina parses the complex tables, MD&A, and Risk Factors into a high-dimensional vector space in milliseconds.',
  },
  {
    icon: <MessageSquare size={32} />,
    title: '3. Chat & Analyze',
    desc: 'Ask complex financial queries and get instant, accurate answers grounded in the source text.',
  }
];

const HowItWorks: React.FC = () => {
  return (
    <section className="py-24 relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading">How It Works</h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">From raw SEC filing to actionable intelligence in three simple steps.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-accent-teal/0 via-accent-teal/20 to-accent-amber/0 z-0" />
          
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 rounded-full bg-bg-secondary border border-border-default flex items-center justify-center text-accent-teal mb-6 shadow-[0_0_30px_rgba(47,230,195,0.1)]">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 font-heading">{step.title}</h3>
              <p className="text-text-secondary leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
