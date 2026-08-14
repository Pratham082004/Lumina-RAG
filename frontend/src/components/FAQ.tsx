import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "Which SEC filings does Lumina RAG support?",
    answer: "We support a wide array of filings including 10-K, 10-Q, 8-K, and Proxy Statements. You can query across multiple years to detect trends and track corporate changes over time."
  },
  {
    question: "How accurate are the AI's answers?",
    answer: "Unlike generic ChatGPT, Lumina RAG uses strict Retrieval-Augmented Generation. Every claim made by the AI is directly grounded in the source text of the SEC filing, and we provide exact citations (like page numbers and section references) so you can verify the data instantly."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We employ bank-grade encryption at rest and in transit. Any custom documents you upload are isolated to your account and are never used to train global public models."
  },
  {
    question: "Do you provide real-time stock data?",
    answer: "Yes! Alongside document analysis, our platform integrates real-time ticker data. When a company is mentioned, we provide interactive price charts and live performance metrics seamlessly within the chat."
  }
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 relative z-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading">Frequently Asked Questions</h2>
          <p className="text-text-secondary text-lg">Everything you need to know about Lumina RAG.</p>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div 
                key={i} 
                className={`border rounded-xl overflow-hidden transition-colors duration-300 ${isOpen ? 'border-accent-teal/30 bg-accent-teal/5' : 'border-border-default bg-bg-secondary'}`}
              >
                <button
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                >
                  <span className="font-semibold text-lg text-text-primary">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={20} className={isOpen ? 'text-accent-teal' : 'text-text-muted'} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-5 text-text-secondary leading-relaxed border-t border-border-default/50 pt-4 mt-2">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
