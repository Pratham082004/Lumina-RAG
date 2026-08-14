import React from 'react';
import GalaxyBackdrop, { type GalaxyBackdropProps } from './GalaxyBackdrop';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * PageShell — the standard layout wrapper used by every page.
 *
 * Replaces the previous pattern of each page manually mounting <Navbar /> and
 * <Footer />. The galaxy backdrop is mounted once here so every page has the
 * same teal/amber visual identity.
 *
 * Marketing pages (Landing, About, Contact, NotFound) get backdrop="full" +
 * Footer. Auth pages (Login, Register, Verify, Onboarding) get backdrop="full"
 * with no Navbar or Footer. Dashboard gets backdrop="subtle" with no Navbar or
 * Footer (it has its own sidebar).
 */

interface PageShellProps {
  children: React.ReactNode;
  /** Include the global <Navbar />. Default `true`. */
  withNavbar?: boolean;
  /** Include the global <Footer />. Default `true`. */
  withFooter?: boolean;
  /** Galaxy visual treatment. Default `'full'`. Use `false` to omit entirely. */
  backdrop?: GalaxyBackdropProps['intensity'];
  /**
   * Pad the page below the fixed Navbar so content isn't hidden behind it.
   * Set to `false` for pages that don't include the Navbar (auth, dashboard).
   * Default `true`.
   */
  withNavOffset?: boolean;
}

const PageShell: React.FC<PageShellProps> = ({
  children,
  withNavbar = true,
  withFooter = true,
  backdrop = 'full',
  withNavOffset = true,
}) => {
  return (
    <div
      className="relative min-h-screen w-full bg-bg-primary text-text-primary"
      style={{ paddingTop: withNavbar && withNavOffset ? '80px' : 0 }}
    >
      <GalaxyBackdrop intensity={backdrop} />
      {withNavbar && <Navbar />}

      <div className="relative z-[1]">{children}</div>

      {withFooter && <Footer />}
    </div>
  );
};

export default PageShell;
