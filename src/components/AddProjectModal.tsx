import React, { useState } from 'react';
import { X, Plus, Sparkles, Image, Video, Globe, Images } from 'lucide-react';
import { Category, MediaType, Project } from '../types/portfolio';
import { extractCategories } from '../data/projects';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (project: Project) => void;
  existingProjects?: Project[];
}

export const AddProjectModal: React.FC<AddProjectModalProps> = ({
  isOpen,
  onClose,
  onAddProject,
  existingProjects = [],
}) => {
  const defaultCategories = ['Graphic Design', 'Social Media Creatives', 'Reels & Video', 'Cinematography', 'Website Design', 'Branding', 'Digital Campaigns', 'Creative AI'];

  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [category, setCategory] = useState<Category>('Graphic Design');
  const [customCategory, setCustomCategory] = useState('');
  const [projectType, setProjectType] = useState<MediaType>('image');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('/src/assets/images/hero_abstract_monolith_1794334284408.jpg');
  const [mediaUrl, setMediaUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [videoAspect, setVideoAspect] = useState<'16:9' | '9:16'>('16:9');
  const [year, setYear] = useState('2026');
  const [tagsInput, setTagsInput] = useState('Art Direction, Design');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !client) return;

    const finalCategory = customCategory.trim() ? customCategory.trim() : category;

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      title,
      client,
      category: finalCategory,
      projectType,
      description,
      thumbnail: thumbnail || '/src/assets/images/hero_abstract_monolith_1794334284408.jpg',
      mediaUrl: mediaUrl || thumbnail,
      websiteUrl: projectType === 'website' ? (websiteUrl || 'https://example.com') : undefined,
      videoAspect: projectType === 'video' ? videoAspect : undefined,
      isVerticalReel: projectType === 'video' && videoAspect === '9:16',
      year,
      featured: false,
      gridSpan: videoAspect === '9:16' ? 'tall' : 'normal',
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      deliverables: ['Custom Asset Package', 'High-Res Deliverables'],
    };

    onAddProject(newProject);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#C8FF00]" />
            <h3 className="font-display text-lg sm:text-xl font-bold text-white">
              Add Project to Portfolio Data
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Lumina Sound Visuals"
                className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-3.5 py-2.5 rounded-lg text-sm text-white focus:outline-none font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Client / Brand Name *
              </label>
              <input
                type="text"
                required
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="e.g. Lumina Labs"
                className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-3.5 py-2.5 rounded-lg text-sm text-white focus:outline-none font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-3.5 py-2.5 rounded-lg text-sm text-white focus:outline-none cursor-pointer"
              >
                {defaultCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Or Custom Category Name
              </label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. 3D Spatial Art"
                className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-3.5 py-2.5 rounded-lg text-sm text-white focus:outline-none font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Media Viewer Engine
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as MediaType)}
                className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-3.5 py-2.5 rounded-lg text-sm text-white focus:outline-none cursor-pointer"
              >
                <option value="image">Single Image (Zoom Engine)</option>
                <option value="video">Video / Reel (HTML5 Engine)</option>
                <option value="website">Website (Iframe Engine)</option>
                <option value="gallery">Gallery (Multi-Slide Engine)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Completion Year
              </label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-3.5 py-2.5 rounded-lg text-sm text-white focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Conditional Inputs */}
          {projectType === 'video' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#141414] rounded-xl border border-white/5">
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                  MP4 Video URL
                </label>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://...video.mp4"
                  className="w-full bg-[#1a1a1a] border border-white/10 focus:border-[#C8FF00] px-3.5 py-2 rounded-lg text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                  Aspect Ratio
                </label>
                <select
                  value={videoAspect}
                  onChange={(e) => setVideoAspect(e.target.value as '16:9' | '9:16')}
                  className="w-full bg-[#1a1a1a] border border-white/10 focus:border-[#C8FF00] px-3.5 py-2 rounded-lg text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="16:9">16:9 Widescreen Cinema</option>
                  <option value="9:16">9:16 Vertical Instagram / TikTok Reel</option>
                </select>
              </div>
            </div>
          )}

          {projectType === 'website' && (
            <div className="p-4 bg-[#141414] rounded-xl border border-white/5">
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Production Website URL
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-[#1a1a1a] border border-white/10 focus:border-[#C8FF00] px-3.5 py-2 rounded-lg text-xs text-white focus:outline-none font-mono"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
              Short Teaser Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Highlight the creative direction, concept, or results..."
              className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-3.5 py-2.5 rounded-lg text-sm text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
              Tags (Comma Separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Branding, Motion Design, 3D"
              className="w-full bg-[#171717] border border-white/10 focus:border-[#C8FF00] px-3.5 py-2.5 rounded-lg text-sm text-white focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs uppercase tracking-wider text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#C8FF00] text-black font-semibold text-xs uppercase tracking-wider hover:bg-white transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Portfolio</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
