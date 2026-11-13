import React, { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle2, Palette, Layout, Star } from 'lucide-react';
import { WebsiteSettings, Project } from '../../types/portfolio';
import { saveWebsiteSettings, updateProject } from '../../lib/firestore-service';

interface WebsiteSettingsTabProps {
  websiteSettings: WebsiteSettings;
  projects: Project[];
  onGoToProfile: () => void;
}

const ACCENT_PRESETS = ['#C8FF00', '#00F0FF', '#FF4D00', '#FFE600', '#FFFFFF'];

export const WebsiteSettingsTab: React.FC<WebsiteSettingsTabProps> = ({
  websiteSettings,
  projects,
  onGoToProfile,
}) => {
  const [form, setForm] = useState<WebsiteSettings>(websiteSettings);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    setForm(websiteSettings);
  }, [websiteSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    try {
      await saveWebsiteSettings(form);
      setStatusMsg({
        type: 'ok',
        text: 'Website settings saved to Firestore and synchronized across the live portfolio.',
      });
    } catch (err) {
      setStatusMsg({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to save website settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleFeaturedProject = async (project: Project) => {
    setTogglingId(project.id);
    try {
      await updateProject(project.id, { featured: !project.featured });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Website Settings
        </h1>
        <p className="text-sm text-neutral-400 mt-1 font-light">
          Configure global SEO metadata, hero headlines, accent color, and featured showcase projects.
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2.5 ${
            statusMsg.type === 'ok'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          {statusMsg.type === 'ok' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hero & SEO */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-5">
          <h2 className="font-display text-base font-bold text-white uppercase tracking-wider border-b border-white/10 pb-3 flex items-center gap-2">
            <Layout className="w-4 h-4 text-[#C8FF00]" />
            <span>Hero & Metadata</span>
          </h2>

          <div>
            <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
              Hero Heading *
            </label>
            <input
              type="text"
              required
              value={form.heroHeading}
              onChange={(e) => setForm({ ...form, heroHeading: e.target.value })}
              placeholder="I MAKE BRANDS IMPOSSIBLE TO IGNORE."
              className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-4 py-2.5 rounded-lg text-sm text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
              Hero Subheading
            </label>
            <textarea
              rows={2}
              value={form.heroSubheading}
              onChange={(e) => setForm({ ...form, heroSubheading: e.target.value })}
              placeholder="Creative direction, visual storytelling, digital experiences..."
              className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-4 py-2.5 rounded-lg text-sm text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
              Availability Indicator Text
            </label>
            <input
              type="text"
              value={form.availabilityText}
              onChange={(e) => setForm({ ...form, availabilityText: e.target.value })}
              placeholder="Booking Q1/Q2 Selected Commissions"
              className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-4 py-2.5 rounded-lg text-sm text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Website Title (Browser Tab) *
              </label>
              <input
                type="text"
                required
                value={form.siteTitle}
                onChange={(e) => setForm({ ...form, siteTitle: e.target.value })}
                className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-4 py-2.5 rounded-lg text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Website Meta Description
              </label>
              <input
                type="text"
                value={form.siteDescription}
                onChange={(e) => setForm({ ...form, siteDescription: e.target.value })}
                className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-4 py-2.5 rounded-lg text-sm text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Accent Color */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-5">
          <h2 className="font-display text-base font-bold text-white uppercase tracking-wider border-b border-white/10 pb-3 flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#C8FF00]" />
            <span>Brand Accent Color</span>
          </h2>

          <div className="flex flex-wrap items-center gap-4">
            <input
              type="color"
              value={form.accentColor}
              onChange={(e) => setForm({ ...form, accentColor: e.target.value.toUpperCase() })}
              className="w-12 h-10 rounded cursor-pointer bg-transparent border border-white/15"
            />
            <input
              type="text"
              value={form.accentColor}
              onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
              className="w-32 bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-3 py-2 rounded-lg text-xs font-mono text-white focus:outline-none"
            />
            <div className="flex items-center gap-2">
              {ACCENT_PRESETS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setForm({ ...form, accentColor: hex })}
                  className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                    form.accentColor.toUpperCase() === hex ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onGoToProfile}
            className="text-xs font-mono text-neutral-400 hover:text-[#C8FF00] underline"
          >
            Edit Contact Details in Profile Settings →
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-7 py-3.5 bg-[#C8FF00] text-black font-semibold text-xs uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Website Settings</span>
          </button>
        </div>
      </form>

      {/* Featured Projects Quick Toggle */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="font-display text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Star className="w-4 h-4 text-[#C8FF00]" />
            <span>Featured Projects Spotlight</span>
          </h2>
          <span className="text-xs font-mono text-neutral-400">
            {projects.filter((p) => p.featured).length} Featured
          </span>
        </div>

        {projects.length === 0 ? (
          <p className="text-xs text-neutral-500 py-4">
            No projects in Firestore yet.
          </p>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {projects.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-8 rounded bg-[#181818] overflow-hidden shrink-0">
                    {p.thumbnail && (
                      <img
                        src={p.thumbnail}
                        alt={p.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white truncate">{p.title}</div>
                    <div className="text-xs text-neutral-500">{p.category}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleFeaturedProject(p)}
                  disabled={togglingId === p.id}
                  className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                    p.featured
                      ? 'bg-[#C8FF00] text-black font-bold'
                      : 'bg-[#181818] border border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  {p.featured ? 'Featured' : 'Standard'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
