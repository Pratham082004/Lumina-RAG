import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-[#05070c]/70 backdrop-blur-md border-b border-border-default py-4' : 'bg-transparent py-6'}`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 no-underline">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-teal to-accent-amber flex items-center justify-center text-[#04241d] font-bold">
                <span className="text-xl">L</span>
              </div>
              <span className="text-gradient font-heading text-xl font-semibold tracking-tight">
                Lumina RAG
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex gap-8 items-center ml-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative py-2 font-medium transition-colors no-underline ${isActive(link.path) ? 'text-text-primary' : 'text-text-muted hover:text-text-primary'}`}
                >
                  {link.name}
                  {isActive(link.path) && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent-teal rounded-sm"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex gap-4">
            <Link to="/login">
              <button className="btn btn-secondary">Sign In</button>
            </Link>
            <Link to="/register">
              <button className="btn btn-primary">Get Started</button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-text-primary hover:bg-bg-secondary rounded-lg transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[90] bg-[#05070c] pt-24 px-6 flex flex-col md:hidden"
          >
            <div className="flex flex-col gap-6 mt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-2xl font-heading font-semibold no-underline ${isActive(link.path) ? 'text-accent-teal' : 'text-text-primary'}`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="w-full h-[1px] bg-border-default my-4"></div>
              <Link to="/login" className="w-full no-underline">
                <button className="btn btn-secondary w-full justify-center">Sign In</button>
              </Link>
              <Link to="/register" className="w-full no-underline">
                <button className="btn btn-primary w-full justify-center">Get Started</button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
