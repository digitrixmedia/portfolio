import React, { useState, useEffect, useRef } from 'react';
import { Save, Upload, Loader2, CheckCircle2, User, Mail, Phone, Globe } from 'lucide-react';
import { ProfileSettings } from '../../types/portfolio';
import { saveProfileSettings } from '../../lib/firestore-service';
import { uploadPortfolioMedia } from '../../lib/storage-service';

interface ProfileSettingsTabProps {
  profileSettings: ProfileSettings;
}

export const ProfileSettingsTab: React.FC<ProfileSettingsTabProps> = ({
  profileSettings,
}) => {
  const [form, setForm] = useState<ProfileSettings>(profileSettings);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm(profileSettings);
  }, [profileSettings]);

  const handleImageUpload = async (file?: File) => {
    if (!file) return;
    setUploadingImage(true);
    setStatusMsg(null);
    try {
      const res = await uploadPortfolioMedia(file, 'profile');
      setForm((prev) => ({ ...prev, profileImage: res.url }));
    } catch (err) {
      setStatusMsg({
        type: 'err',
        text: err instanceof Error ? err.message : 'Profile image upload failed.',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    try {
      await saveProfileSettings(form);
      setStatusMsg({
        type: 'ok',
        text: 'Profile and contact details saved to Firestore. The live portfolio updates automatically.',
      });
    } catch (err) {
      setStatusMsg({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to save profile settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Profile & Contact Settings
        </h1>
        <p className="text-sm text-neutral-400 mt-1 font-light">
          Update your personal bio, portrait, and public contact links across the About and Contact sections.
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
        {/* Identity & Bio */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-5">
          <h2 className="font-display text-base font-bold text-white uppercase tracking-wider border-b border-white/10 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-[#C8FF00]" />
            <span>Personal Identity</span>
          </h2>

          {/* Profile Image */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-2">
            <div className="w-24 h-24 rounded-xl overflow-hidden border border-white/15 bg-[#181818] shrink-0">
              {form.profileImage ? (
                <img
                  src={form.profileImage}
                  alt={form.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files?.[0])}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingImage}
                  className="px-4 py-2 bg-[#1a1a1a] border border-white/15 hover:border-[#C8FF00] text-xs font-semibold text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  {uploadingImage ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5 text-[#C8FF00]" />
                  )}
                  <span>{uploadingImage ? 'Uploading...' : 'Upload Portrait'}</span>
                </button>
              </div>
              <input
                type="text"
                value={form.profileImage}
                onChange={(e) => setForm({ ...form, profileImage: e.target.value })}
                placeholder="Profile image URL"
                className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-3.5 py-2 rounded-lg text-xs text-white font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Display Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Shubh"
                className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-4 py-2.5 rounded-lg text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Professional Title
              </label>
              <input
                type="text"
                value={form.professionalTitle}
                onChange={(e) => setForm({ ...form, professionalTitle: e.target.value })}
                placeholder="Creative Director · Digital Designer · Filmmaker"
                className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-4 py-2.5 rounded-lg text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
              Biography *
            </label>
            <textarea
              required
              rows={4}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Write your personal biography..."
              className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-4 py-2.5 rounded-lg text-sm text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Contact Details */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-5">
          <h2 className="font-display text-base font-bold text-white uppercase tracking-wider border-b border-white/10 pb-3 flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#C8FF00]" />
            <span>Direct Contact Channels</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Contact Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="your-email@domain.com"
                className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-4 py-2.5 rounded-lg text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+00 000 000 0000"
                className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-4 py-2.5 rounded-lg text-sm text-white font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                WhatsApp Number (Digits + Country Code)
              </label>
              <input
                type="text"
                value={form.whatsappNumber}
                onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                placeholder="e.g. 919876543210"
                className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-4 py-2.5 rounded-lg text-sm text-white font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-5">
          <h2 className="font-display text-base font-bold text-white uppercase tracking-wider border-b border-white/10 pb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#C8FF00]" />
            <span>Social & Portfolio URLs</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Instagram URL
              </label>
              <input
                type="url"
                value={form.socialLinks.instagram}
                onChange={(e) =>
                  setForm({
                    ...form,
                    socialLinks: { ...form.socialLinks, instagram: e.target.value },
                  })
                }
                placeholder="https://instagram.com/yourhandle"
                className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-4 py-2.5 rounded-lg text-sm text-white font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={form.socialLinks.linkedin}
                onChange={(e) =>
                  setForm({
                    ...form,
                    socialLinks: { ...form.socialLinks, linkedin: e.target.value },
                  })
                }
                placeholder="https://linkedin.com/in/yourprofile"
                className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-4 py-2.5 rounded-lg text-sm text-white font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Behance URL
              </label>
              <input
                type="url"
                value={form.socialLinks.behance}
                onChange={(e) =>
                  setForm({
                    ...form,
                    socialLinks: { ...form.socialLinks, behance: e.target.value },
                  })
                }
                placeholder="https://behance.net/yourprofile"
                className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-4 py-2.5 rounded-lg text-sm text-white font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Personal / Studio Website URL
              </label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://digitrixmedia.com"
                className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-4 py-2.5 rounded-lg text-sm text-white font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-7 py-3.5 bg-[#C8FF00] text-black font-semibold text-xs uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Profile Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
