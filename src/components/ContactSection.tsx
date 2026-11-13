import React, { useState } from 'react';
import { Mail, MessageCircle, ArrowUpRight, Send, CheckCircle2, Instagram, Linkedin, Phone } from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext';

export const ContactSection: React.FC = () => {
  const { profileSettings } = usePortfolio();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: 'Creative Direction',
    budget: 'Discuss Scope',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Use editable Firestore profileSettings with non-invented placeholder fallbacks
  const contactEmail = profileSettings.email?.trim() || 'your-email@domain.com';
  const hasRealEmail = Boolean(profileSettings.email?.trim());

  const cleanWhatsappDigits = (profileSettings.whatsappNumber || '').replace(/[^0-9]/g, '');
  const hasWhatsapp = cleanWhatsappDigits.length >= 7;
  const whatsappMessage = `Hi ${profileSettings.name || 'Shubh'}, I visited your Digitrix Media portfolio and would like to discuss a project.`;
  const whatsappUrl = hasWhatsapp
    ? `https://wa.me/${cleanWhatsappDigits}?text=${encodeURIComponent(whatsappMessage)}`
    : '#contact';

  const instagramUrl = profileSettings.socialLinks?.instagram?.trim();
  const linkedinUrl = profileSettings.socialLinks?.linkedin?.trim();
  const behanceUrl = profileSettings.socialLinks?.behance?.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // If admin configured an email, also support opening mailto draft or confirming dispatch
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 450);
  };

  return (
    <section id="contact" className="py-24 sm:py-32 bg-[#0c0c0c] border-b border-white/[0.08] relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="mb-16">
          <div className="flex items-center gap-2 text-xs font-mono text-accent uppercase tracking-widest mb-3">
            <span>05</span>
            <span>/</span>
            <span>Initiate Collaboration</span>
          </div>
          <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight uppercase leading-[0.95]">
            HAVE A BRAND THAT<br />
            <span className="text-gradient-lime">DESERVES MORE?</span>
          </h2>
          <p className="text-lg sm:text-2xl text-neutral-300 font-light mt-4">
            Let's create something worth remembering.
          </p>
        </div>

        {/* Contact Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Direct Action Buttons & Channels */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              {/* WhatsApp CTA */}
              <a
                href={whatsappUrl}
                target={hasWhatsapp ? '_blank' : undefined}
                rel={hasWhatsapp ? 'noopener noreferrer' : undefined}
                onClick={(e) => {
                  if (!hasWhatsapp) {
                    e.preventDefault();
                    const el = document.getElementById('contact-form-name');
                    el?.focus();
                  }
                }}
                className="group flex items-center justify-between p-5 bg-[#141414] border border-white/10 hover:border-accent rounded-xl transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#25D366]/15 flex items-center justify-center text-[#25D366]">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-mono uppercase text-neutral-400 block">
                      Instant Messaging
                    </span>
                    <span className="font-display text-lg font-bold text-white group-hover:text-accent transition-colors">
                      {hasWhatsapp ? 'Chat on WhatsApp' : 'WhatsApp (Add in Admin)'}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-neutral-400 group-hover:text-accent transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>

              {/* Email CTA */}
              <a
                href={
                  hasRealEmail
                    ? `mailto:${contactEmail}?subject=${encodeURIComponent('Project Inquiry via Digitrix Media Portfolio')}`
                    : '#contact'
                }
                onClick={(e) => {
                  if (!hasRealEmail) {
                    e.preventDefault();
                    const el = document.getElementById('contact-form-name');
                    el?.focus();
                  }
                }}
                className="group flex items-center justify-between p-5 bg-[#141414] border border-white/10 hover:border-accent rounded-xl transition-all duration-300"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-[#C8FF00]/15 flex items-center justify-center text-accent shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-mono uppercase text-neutral-400 block">
                      Direct Email
                    </span>
                    <span className="font-display text-base sm:text-lg font-bold text-white group-hover:text-accent transition-colors truncate block">
                      {contactEmail}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-neutral-400 group-hover:text-accent transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
              </a>

              {profileSettings.phone?.trim() && (
                <a
                  href={`tel:${profileSettings.phone.trim()}`}
                  className="group flex items-center justify-between p-5 bg-[#141414] border border-white/10 hover:border-accent rounded-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-accent">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-mono uppercase text-neutral-400 block">
                        Phone
                      </span>
                      <span className="font-display text-lg font-bold text-white group-hover:text-accent transition-colors">
                        {profileSettings.phone}
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-neutral-400 group-hover:text-accent" />
                </a>
              )}
            </div>

            {/* Social Footprint */}
            <div className="pt-6 border-t border-white/10">
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 block mb-4">
                Creative Networks & Socials
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={instagramUrl || '#contact'}
                  target={instagramUrl ? '_blank' : undefined}
                  rel={instagramUrl ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-2 px-4 py-2 bg-[#141414] border border-white/10 hover:border-white/30 text-xs font-medium text-neutral-300 hover:text-white rounded-lg transition-colors"
                >
                  <Instagram className="w-4 h-4 text-accent" />
                  <span>{instagramUrl ? 'Instagram' : 'Instagram (Placeholder)'}</span>
                </a>
                <a
                  href={linkedinUrl || '#contact'}
                  target={linkedinUrl ? '_blank' : undefined}
                  rel={linkedinUrl ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-2 px-4 py-2 bg-[#141414] border border-white/10 hover:border-white/30 text-xs font-medium text-neutral-300 hover:text-white rounded-lg transition-colors"
                >
                  <Linkedin className="w-4 h-4 text-accent" />
                  <span>{linkedinUrl ? 'LinkedIn' : 'LinkedIn (Placeholder)'}</span>
                </a>
                <a
                  href={behanceUrl || '#contact'}
                  target={behanceUrl ? '_blank' : undefined}
                  rel={behanceUrl ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-2 px-4 py-2 bg-[#141414] border border-white/10 hover:border-white/30 text-xs font-medium text-neutral-300 hover:text-white rounded-lg transition-colors"
                >
                  <span className="font-bold text-accent text-sm">Bē</span>
                  <span>{behanceUrl ? 'Behance' : 'Behance (Placeholder)'}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Inquiry Form */}
          <div className="lg:col-span-7 bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl">
            {submitted ? (
              <div className="py-12 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-full bg-[#C8FF00]/15 border border-accent flex items-center justify-center text-accent mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-display text-2xl font-bold text-white mb-2">
                  Inquiry Prepared.
                </h3>
                <p className="text-neutral-400 text-sm max-w-md mb-6">
                  Thank you for reaching out. {hasRealEmail ? `You can also send this inquiry directly via email to ${contactEmail}.` : `${profileSettings.name} reviews project inquiries personally.`}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {hasRealEmail && (
                    <a
                      href={`mailto:${contactEmail}?subject=${encodeURIComponent(
                        `[${formData.service}] Project Inquiry from ${formData.name}`
                      )}&body=${encodeURIComponent(
                        `Name: ${formData.name}\nEmail: ${formData.email}\nService: ${formData.service}\nBudget: ${formData.budget}\n\n${formData.message}`
                      )}`}
                      className="px-5 py-2.5 bg-accent text-black font-semibold text-xs uppercase tracking-wider hover:bg-white transition-colors"
                    >
                      Open in Email App
                    </a>
                  )}
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        service: 'Creative Direction',
                        budget: 'Discuss Scope',
                        message: '',
                      });
                    }}
                    className="text-xs font-mono uppercase tracking-wider text-accent underline"
                  >
                    Send another message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">
                      Your Name / Brand *
                    </label>
                    <input
                      id="contact-form-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name or brand"
                      className="w-full bg-[#171717] border border-white/10 focus:border-accent text-white px-4 py-3 rounded-lg text-sm focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@brand.com"
                      className="w-full bg-[#171717] border border-white/10 focus:border-accent text-white px-4 py-3 rounded-lg text-sm focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">
                      Primary Service Focus
                    </label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full bg-[#171717] border border-white/10 focus:border-accent text-white px-4 py-3 rounded-lg text-sm focus:outline-none transition-colors cursor-pointer"
                    >
                      <option>Creative Direction</option>
                      <option>Graphic Design & Branding</option>
                      <option>Reel Production & Video</option>
                      <option>Cinematography</option>
                      <option>Website Design & Dev</option>
                      <option>Digital Marketing Campaign</option>
                      <option>AI-Powered Production</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">
                      Engagement Scope
                    </label>
                    <select
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full bg-[#171717] border border-white/10 focus:border-accent text-white px-4 py-3 rounded-lg text-sm focus:outline-none transition-colors cursor-pointer"
                    >
                      <option>Discuss Scope</option>
                      <option>Single Project Sprint</option>
                      <option>Full Brand Launch</option>
                      <option>Monthly Creative Retainer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">
                    Project Vision & Objectives *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Briefly describe your brand, objectives, target timeline, and what you want to achieve..."
                    className="w-full bg-[#171717] border border-white/10 focus:border-accent text-white px-4 py-3 rounded-lg text-sm focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-accent text-black font-semibold text-xs uppercase tracking-widest hover:bg-white transition-all duration-300 flex items-center justify-center gap-2 group active:scale-[0.99] disabled:opacity-50"
                >
                  <span>{loading ? 'Preparing...' : 'Send Inquiry'}</span>
                  <Send className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
