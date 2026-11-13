import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';

interface NavbarProps {
  onContactClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onContactClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      const sections = ['home', 'about', 'work', 'services', 'process', 'contact'];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { label: 'Home', id: 'home' },
    { label: 'About', id: 'about' },
    { label: 'Work', id: 'work' },
    { label: 'Services', id: 'services' },
    { label: 'Process', id: 'process' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#080808]/90 backdrop-blur-md border-b border-white/[0.08] py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => scrollTo('home')}
          className="group flex items-center gap-2.5 text-left focus:outline-none"
        >
          <span className="w-2.5 h-2.5 bg-[#C8FF00] rounded-none rotate-45 transition-transform duration-300 group-hover:rotate-90"></span>
          <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-white whitespace-nowrap">
            DIGITRIX<span className="text-[#C8FF00] font-light ml-1">MEDIA</span>
          </span>
        </button>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className={`relative whitespace-nowrap transition-colors duration-200 py-1 ${
                activeSection === link.id
                  ? 'text-[#C8FF00]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {link.label}
              {activeSection === link.id && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C8FF00]" />
              )}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary Action CTA */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <button
            onClick={onContactClick}
            className="group relative inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-[#C8FF00] hover:bg-white transition-all duration-300 whitespace-nowrap active:scale-[0.98]"
          >
            <span>Let's Work Together</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-300 hover:text-white focus:outline-none"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[73px] bg-[#0C0C0C]/98 backdrop-blur-xl border-b border-neutral-800 px-6 py-8 transition-all animate-in fade-in duration-200">
          <div className="flex flex-col gap-5">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className={`text-left text-2xl font-display font-medium tracking-tight transition-colors ${
                  activeSection === link.id ? 'text-[#C8FF00]' : 'text-neutral-300 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className="pt-4 border-t border-neutral-800 mt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onContactClick();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#C8FF00] text-black font-semibold text-sm tracking-wider uppercase hover:bg-white transition-colors"
              >
                <span>Let's Work Together</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
