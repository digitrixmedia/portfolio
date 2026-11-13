import React from 'react';
import { ArrowUp, Lock } from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext';

interface FooterProps {
  onAdminClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onAdminClick }) => {
  const { profileSettings } = usePortfolio();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();
  const instagram = profileSettings.socialLinks?.instagram?.trim();
  const linkedin = profileSettings.socialLinks?.linkedin?.trim();
  const behance = profileSettings.socialLinks?.behance?.trim();

  return (
    <footer className="bg-[#080808] border-t border-white/[0.08] py-12 select-none">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand & Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-accent rotate-45" />
            <span className="font-display font-bold text-white text-base tracking-tight">
              DIGITRIX<span className="text-accent font-light ml-1">MEDIA</span>
            </span>
          </div>
          <span className="hidden sm:inline text-neutral-600">·</span>
          <span className="text-xs text-neutral-400 font-mono">
            © {currentYear} {profileSettings.name}. All Rights Reserved.
          </span>
        </div>

        {/* Social Links, Admin Link & Back-to-Top */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3.5 text-xs font-mono text-neutral-400">
            {instagram && (
              <>
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors"
                >
                  Instagram
                </a>
                <span className="text-neutral-700">/</span>
              </>
            )}
            {linkedin && (
              <>
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors"
                >
                  LinkedIn
                </a>
                <span className="text-neutral-700">/</span>
              </>
            )}
            {behance && (
              <>
                <a
                  href={behance}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors"
                >
                  Behance
                </a>
                <span className="text-neutral-700">/</span>
              </>
            )}
            {onAdminClick && (
              <button
                onClick={onAdminClick}
                className="inline-flex items-center gap-1.5 text-neutral-500 hover:text-accent transition-colors"
                title="Admin CMS Login"
              >
                <Lock className="w-3 h-3" />
                <span>Admin</span>
              </button>
            )}
          </div>

          <button
            onClick={scrollToTop}
            className="w-10 h-10 rounded-full bg-[#141414] border border-white/10 hover:border-accent hover:text-accent text-neutral-300 flex items-center justify-center transition-all duration-300 active:scale-95"
            title="Back to Top"
            aria-label="Back to Top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
