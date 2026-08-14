import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Sparkles } from 'lucide-react';

const scenarios = [
  {
    query: "Summarize the primary supply chain risks for Apple based on their latest 10-K.",
    response: (
      <>
        Based on the latest 10-K filing, Apple identifies several key supply chain risks:
        <br/><br/>
        1. <strong>Component Shortages:</strong> Reliance on outsourced manufacturing partners and limited single-source suppliers for custom components. <span className="inline-block px-2 py-0.5 ml-1 text-xs text-accent-amber bg-accent-amber/10 border border-accent-amber/20 rounded-md cursor-pointer hover:bg-accent-amber/20 transition-colors">Page 14</span>
        <br/><br/>
        2. <strong>Geopolitical Tensions:</strong> Trade policies and international disputes affecting manufacturing concentrated largely in Asia. <span className="inline-block px-2 py-0.5 ml-1 text-xs text-accent-amber bg-accent-amber/10 border border-accent-amber/20 rounded-md cursor-pointer hover:bg-accent-amber/20 transition-colors">Page 16</span>
      </>
    )
  },
  {
    query: "What is Tesla's reported revenue growth in the automotive sector for 2023?",
    response: (
      <>
        According to the 2023 10-K, Tesla's automotive revenue grew by <strong>15% year-over-year</strong>.
        <br/><br/>
        The growth was primarily driven by increased Model Y deliveries, offset partially by reduced average selling prices (ASPs) across the vehicle lineup. <span className="inline-block px-2 py-0.5 ml-1 text-xs text-accent-amber bg-accent-amber/10 border border-accent-amber/20 rounded-md cursor-pointer hover:bg-accent-amber/20 transition-colors">Page 32</span>
      </>
    )
  },
  {
    query: "Extract Microsoft's cloud segment operating margins.",
    response: (
      <>
        Microsoft's Intelligent Cloud segment reported an operating margin of <strong>44.2%</strong> for fiscal year 2023. <span className="inline-block px-2 py-0.5 ml-1 text-xs text-accent-amber bg-accent-amber/10 border border-accent-amber/20 rounded-md cursor-pointer hover:bg-accent-amber/20 transition-colors">MD&A, Pg 28</span>
        <br/><br/>
        This represents a slight expansion from the previous year, driven by strong Azure consumption growth and structural cost efficiencies in data center operations.
      </>
    )
  }
];

const InteractiveChatPreview: React.FC = () => {
  const [step, setStep] = useState(0);
  const [scenarioIndex, setScenarioIndex] = useState(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    
    if (step === 0) {
      // Step 0: Blank state, wait 1s before showing user query
      timeout = setTimeout(() => setStep(1), 1000);
    } else if (step === 1) {
      // Step 1: User message shown, AI loading for 2s
      timeout = setTimeout(() => setStep(2), 2000);
    } else if (step === 2) {
      // Step 2: AI response shown, let user read for 6s before resetting
      timeout = setTimeout(() => {
        setStep(0);
        setScenarioIndex((prev) => (prev + 1) % scenarios.length);
      }, 6000);
    }

    return () => clearTimeout(timeout);
  }, [step]);

  const activeScenario = scenarios[scenarioIndex];

  return (
    <section className="py-24 relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading">Experience the Power</h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">Stop reading hundreds of pages. Just ask.</p>
        </div>

        <div className="glass-panel rounded-2xl border border-border-default overflow-hidden shadow-2xl relative">
          {/* macOS window header */}
          <div className="h-12 border-b border-border-default bg-[#0d1117]/80 flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-error/80"></div>
            <div className="w-3 h-3 rounded-full bg-warning/80"></div>
            <div className="w-3 h-3 rounded-full bg-success/80"></div>
            <div className="mx-auto text-xs text-text-muted font-mono flex items-center gap-2">
              <Sparkles size={14} className="text-accent-teal" /> Lumina RAG Session
            </div>
          </div>

          <div className="p-6 md:p-8 min-h-[400px] flex flex-col gap-6 bg-[#040608]/50">
            {/* User Message */}
            <AnimatePresence mode="wait">
              {step >= 1 && (
                <motion.div
                  key={`user-${scenarioIndex}`}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  className="flex gap-4 max-w-[85%] self-end flex-row-reverse"
                >
                  <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center flex-shrink-0 text-accent-blue">
                    <User size={16} />
                  </div>
                  <div className="bg-[#1e293b]/50 border border-[#334155]/50 text-text-primary px-5 py-3 rounded-2xl rounded-tr-sm">
                    {activeScenario.query}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading Indicator */}
            <AnimatePresence>
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                  className="flex gap-4 max-w-[85%]"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-teal to-accent-amber flex items-center justify-center flex-shrink-0 text-[#04241d]">
                    <Sparkles size={16} />
                  </div>
                  <div className="flex items-center gap-1 bg-[#0d1117]/50 border border-border-default px-5 py-3 rounded-2xl rounded-tl-sm h-12 overflow-hidden">
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-2 h-2 rounded-full bg-accent-teal"></motion.div>
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="w-2 h-2 rounded-full bg-accent-teal"></motion.div>
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="w-2 h-2 rounded-full bg-accent-teal"></motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Response */}
            <AnimatePresence>
              {step >= 2 && (
                <motion.div
                  key={`ai-${scenarioIndex}`}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  className="flex gap-4 max-w-[90%]"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-teal to-accent-amber flex items-center justify-center flex-shrink-0 text-[#04241d]">
                    <Sparkles size={16} />
                  </div>
                  <div className="bg-[#0d1117]/50 border border-border-default text-text-primary px-5 py-4 rounded-2xl rounded-tl-sm leading-relaxed text-sm md:text-base">
                    {activeScenario.response}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveChatPreview;
