/**
 * Digitrix Media - Portfolio & Admin CMS Type Definitions
 */

export type Category = string;

export type MediaType = 'image' | 'video' | 'website' | 'gallery';

export type ProjectStatus = 'published' | 'draft';

export interface ProjectMetric {
  label: string;
  value: string;
}

export interface Project {
  /** Primary ID (matches Firestore projectId) */
  id: string;
  projectId?: string;
  title: string;
  slug?: string;
  client: string;
  clientName?: string;
  categoryId?: string;
  category: Category;
  categoryName?: string;
  secondaryCategories?: Category[];
  projectType: MediaType;
  description: string;
  fullDescription?: string;
  thumbnail: string;
  thumbnailUrl?: string;
  mediaUrl?: string;
  videoUrl?: string;
  videoUrls?: string[];
  videoAspect?: '16:9' | '9:16';
  isVerticalReel?: boolean;
  galleryImages?: string[];
  images?: string[];
  websiteUrl?: string;
  instagramUrl?: string;
  year?: string;
  featured?: boolean;
  status?: ProjectStatus;
  sortOrder?: number;
  gridSpan?: 'normal' | 'wide' | 'tall';
  tags?: string[];
  deliverables?: string[];
  metrics?: ProjectMetric[];
  createdAt?: string | number | Date | null;
  updatedAt?: string | number | Date | null;
}

export interface CategoryDoc {
  categoryId: string;
  name: string;
  slug: string;
  sortOrder: number;
  createdAt?: string | number | Date | null;
  updatedAt?: string | number | Date | null;
}

export interface MediaAsset {
  mediaId: string;
  name: string;
  storagePath: string;
  url: string;
  mediaType: 'image' | 'video';
  contentType: string;
  size: number;
  uploadedBy: string;
  createdAt?: string | number | Date | null;
}

export interface SocialLinks {
  instagram: string;
  linkedin: string;
  behance: string;
  website?: string;
}

export interface ProfileSettings {
  name: string;
  professionalTitle: string;
  bio: string;
  profileImage: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  socialLinks: SocialLinks;
  website: string;
  updatedAt?: string | number | Date | null;
}

export interface WebsiteSettings {
  siteTitle: string;
  siteDescription: string;
  heroHeading: string;
  heroSubheading: string;
  availabilityText: string;
  accentColor: string;
  updatedAt?: string | number | Date | null;
}

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  description: string;
  deliverables: string[];
}

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
  details: string[];
}
