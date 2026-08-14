import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from './ui/Button';
import GalaxyBackdrop from './GalaxyBackdrop';
import AnimatedCounter from './AnimatedCounter';

/**
 * Hero — the landing page hero block.
 *
 * Visual layer is composed from <GalaxyBackdrop /> (shared with every other
 * page). The content column is this component's only contribution.
 */
const Hero: React.FC = () => {
  return (
    <section className="relative w-full min-h-[560px] flex items-center overflow-hidden px-4 md:px-16 pt-16 pb-12">
      <GalaxyBackdrop intensity="full" />

      <div className="relative z-[5] w-full max-w-[560px]">
        <div
          className="flex items-center gap-2 text-[12px] tracking-[0.12em] mb-[22px] font-medium"
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-accent-teal)',
          }}
        >
          <span
            className="inline-block w-4 h-px"
            style={{ background: 'var(--color-accent-teal)' }}
            aria-hidden="true"
          />
          SEC FILINGS, UNDERSTOOD INSTANTLY
        </div>

        <h1
          className="font-bold leading-[1.08] tracking-[-0.01em] mb-[22px]"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(36px, 4.5vw, 52px)',
            color: 'var(--color-text-primary)',
          }}
        >
          Ask your 10-Ks anything.
          <br />
          Get <span style={{ color: 'var(--color-accent-teal)' }}>cited</span> answers.
        </h1>

        <p
          className="text-[16px] leading-[1.6] mb-[34px] max-w-[460px]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Lumina RAG reads thousands of pages of filings so you don't have to —
          grounded answers, live citations, and charts generated from the source,
          not a guess.
        </p>

        <div className="flex items-center gap-5 flex-wrap">
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <Button variant="primary">Get started — it's free</Button>
          </Link>
          <Link
            to="/about"
            className="flex items-center gap-2 text-[14px] transition-colors"
            style={{ color: '#c9d1de', textDecoration: 'none' }}
          >
            <span
              className="inline-flex items-center justify-center w-7 h-7 rounded-full border"
              style={{ borderColor: '#2a303c' }}
              aria-hidden="true"
            >
              <ArrowRight size={14} />
            </span>
            See how it works
          </Link>
        </div>

        <div
          className="flex flex-wrap gap-x-11 gap-y-6 mt-14 pt-[26px] max-w-[460px]"
          style={{ borderTop: '1px solid #171b23' }}
        >
          <div>
            <b
              className="block text-[22px] font-bold"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}
            >
              <AnimatedCounter value="12,400+" />
            </b>
            <span className="text-[12px]" style={{ color: '#6d7686' }}>filings indexed</span>
          </div>
          <div>
            <b
              className="block text-[22px] font-bold"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}
            >
              <AnimatedCounter value="<2s" />
            </b>
            <span className="text-[12px]" style={{ color: '#6d7686' }}>avg. response time</span>
          </div>
          <div>
            <b
              className="block text-[22px] font-bold"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}
            >
              <AnimatedCounter value="100%" />
            </b>
            <span className="text-[12px]" style={{ color: '#6d7686' }}>answers cited to source</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
