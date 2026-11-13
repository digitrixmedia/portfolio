import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType, isFirebaseConfigured } from './firebase';
import {
  Project,
  CategoryDoc,
  MediaAsset,
  ProfileSettings,
  WebsiteSettings,
} from '../types/portfolio';
import { INITIAL_PROJECTS } from '../data/projects';

export const BOOTSTRAPPED_ADMIN_EMAIL = 'digitrixmedia.agency@gmail.com';

export const DEFAULT_PROFILE_SETTINGS: ProfileSettings = {
  name: 'Shubh',
  professionalTitle: 'Creative Director · Digital Designer · Filmmaker',
  bio: "I'm Shubh, a creative professional working at the intersection of design, storytelling, technology, and digital marketing. From creating high-impact visual campaigns and cinematic reels to designing websites and building digital experiences, I help brands communicate better, look stronger, and connect with their audiences.",
  profileImage: '/src/assets/images/shubh_director_portrait_1794330940557.jpg',
  email: '',
  phone: '',
  whatsappNumber: '',
  socialLinks: {
    instagram: '',
    linkedin: '',
    behance: '',
    website: '',
  },
  website: '',
};

export const DEFAULT_WEBSITE_SETTINGS: WebsiteSettings = {
  siteTitle: 'Digitrix Media | Shubh - Creative Director & Designer',
  siteDescription:
    'Creative direction, visual storytelling, digital experiences, and marketing that make brands stand out.',
  heroHeading: 'I MAKE BRANDS IMPOSSIBLE TO IGNORE.',
  heroSubheading:
    'Creative direction, visual storytelling, digital experiences, and marketing engineered to elevate extraordinary brands.',
  availabilityText: 'Booking Q1/Q2 Selected Commissions',
  accentColor: '#C8FF00',
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || `item-${Date.now()}`;
}

function normalizeTimestamp(val: unknown): string | null {
  if (!val) return null;
  if (val instanceof Timestamp) {
    return val.toDate().toISOString();
  }
  if (typeof val === 'string') return val;
  if (val instanceof Date) return val.toISOString();
  return null;
}

function mapDocToProject(id: string, data: Record<string, any>): Project {
  return {
    id,
    projectId: data.projectId || id,
    title: data.title || 'Untitled Project',
    slug: data.slug || slugify(data.title || id),
    client: data.clientName || data.client || 'Independent',
    clientName: data.clientName || data.client || 'Independent',
    categoryId: data.categoryId || slugify(data.categoryName || 'general'),
    category: data.categoryName || data.category || 'Uncategorized',
    categoryName: data.categoryName || data.category || 'Uncategorized',
    secondaryCategories: Array.isArray(data.secondaryCategories) ? data.secondaryCategories : [],
    projectType: data.projectType || 'image',
    description: data.description || '',
    fullDescription: data.fullDescription || data.description || '',
    thumbnail: data.thumbnailUrl || data.thumbnail || '',
    thumbnailUrl: data.thumbnailUrl || data.thumbnail || '',
    mediaUrl: data.mediaUrl || data.videoUrl || data.thumbnailUrl || '',
    videoUrl: data.videoUrl || (data.projectType === 'video' ? data.mediaUrl : ''),
    videoUrls: Array.isArray(data.videoUrls)
      ? data.videoUrls
      : data.videoUrl
      ? [data.videoUrl]
      : data.projectType === 'video' && data.mediaUrl
      ? [data.mediaUrl]
      : [],
    websiteUrl: data.websiteUrl || '',
    instagramUrl: data.instagramUrl || '',
    galleryImages: Array.isArray(data.images) ? data.images : Array.isArray(data.galleryImages) ? data.galleryImages : [],
    images: Array.isArray(data.images) ? data.images : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
    deliverables: Array.isArray(data.deliverables) ? data.deliverables : [],
    metrics: Array.isArray(data.metrics) ? data.metrics : [],
    year: data.year || '2026',
    videoAspect: data.videoAspect || '16:9',
    isVerticalReel: Boolean(data.isVerticalReel || data.videoAspect === '9:16'),
    gridSpan: data.gridSpan || (data.isVerticalReel ? 'tall' : 'normal'),
    featured: Boolean(data.featured),
    status: data.status === 'draft' ? 'draft' : 'published',
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
    createdAt: normalizeTimestamp(data.createdAt),
    updatedAt: normalizeTimestamp(data.updatedAt),
  };
}

/**
 * Checks whether the current Firebase User is an authorized administrator.
 */
export async function checkUserIsAdmin(user: User | null): Promise<boolean> {
  if (!user || !user.emailVerified) return false;
  const normalizedEmail = user.email?.toLowerCase() || '';
  if (normalizedEmail === 'skylarkgroupindia@gmail.com') {
    return false;
  }
  if (normalizedEmail === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()) {
    // Also ensure /admins/{uid} doc exists for Storage & Firestore rules parity
    await ensureBootstrappedAdminDoc(user);
    return true;
  }
  if (!db) return false;

  const adminPath = `admins/${user.uid}`;
  try {
    const snap = await getDoc(doc(db, 'admins', user.uid));
    return snap.exists() && snap.data()?.role === 'admin';
  } catch (error) {
    console.warn('Admin check notice for', adminPath, error);
    return false;
  }
}

async function ensureBootstrappedAdminDoc(user: User): Promise<void> {
  if (!db) return;
  try {
    const adminRef = doc(db, 'admins', user.uid);
    const snap = await getDoc(adminRef);
    if (!snap.exists()) {
      await setDoc(adminRef, {
        userId: user.uid,
        email: (user.email || BOOTSTRAPPED_ADMIN_EMAIL).slice(0, 256),
        role: 'admin',
        createdAt: serverTimestamp(),
      });
    }

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        userId: user.uid,
        email: (user.email || BOOTSTRAPPED_ADMIN_EMAIL).slice(0, 256),
        role: 'admin',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.warn('Bootstrapped admin doc sync skipped:', err);
  }
}

/**
 * Subscribe to PUBLISHED projects for the public portfolio.
 * Uses explicit where('status', '==', 'published') to satisfy Firestore list rules.
 */
export function subscribePublishedProjects(
  onData: (projects: Project[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!isFirebaseConfigured || !db) {
    onData([]);
    return () => {};
  }

  const q = query(collection(db, 'projects'), where('status', '==', 'published'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => mapDocToProject(d.id, d.data()));
      items.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.LIST, 'projects');
      } catch {
        // Logged via handleFirestoreError
      }
    }
  );
}

/**
 * Subscribe to ALL projects (published + drafts) for the Admin Dashboard.
 */
export function subscribeAllProjects(
  onData: (projects: Project[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!isFirebaseConfigured || !db) {
    onData([]);
    return () => {};
  }

  return onSnapshot(
    collection(db, 'projects'),
    (snapshot) => {
      const items = snapshot.docs.map((d) => mapDocToProject(d.id, d.data()));
      items.sort((a, b) => {
        const orderDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
        if (orderDiff !== 0) return orderDiff;
        const tA = a.createdAt ? new Date(String(a.createdAt)).getTime() : 0;
        const tB = b.createdAt ? new Date(String(b.createdAt)).getTime() : 0;
        return tB - tA;
      });
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.LIST, 'projects');
      } catch {
        // Logged
      }
    }
  );
}

function sanitizeProjectPayload(projectId: string, input: Partial<Project>, isCreate: boolean) {
  const title = (input.title || 'Untitled Project').trim().slice(0, 160);
  const clientName = (input.clientName || input.client || 'Independent').trim().slice(0, 120);
  const categoryName = (input.categoryName || input.category || 'Branding').trim().slice(0, 80);
  const categoryId = (input.categoryId || slugify(categoryName)).slice(0, 128);
  const projectType = input.projectType || 'image';
  const isVerticalReel = Boolean(input.isVerticalReel || input.videoAspect === '9:16');

  const payload: Record<string, any> = {
    projectId,
    title,
    slug: (input.slug || slugify(title)).slice(0, 160),
    clientName,
    categoryId,
    categoryName,
    projectType,
    description: (input.description || '').trim().slice(0, 1000),
    thumbnailUrl: (input.thumbnailUrl || input.thumbnail || '').trim().slice(0, 1000),
    featured: Boolean(input.featured),
    status: input.status === 'draft' ? 'draft' : 'published',
    sortOrder: typeof input.sortOrder === 'number' ? Math.max(0, input.sortOrder) : 0,
    updatedAt: serverTimestamp(),
  };

  if (isCreate) {
    payload.createdAt = serverTimestamp();
  }

  if (input.fullDescription !== undefined) {
    payload.fullDescription = String(input.fullDescription).slice(0, 4000);
  }
  if (input.mediaUrl !== undefined) {
    payload.mediaUrl = String(input.mediaUrl).slice(0, 1000);
  }
  if (input.videoUrl !== undefined) {
    payload.videoUrl = String(input.videoUrl).slice(0, 1000);
  }
  if (input.websiteUrl !== undefined) {
    payload.websiteUrl = String(input.websiteUrl).slice(0, 1000);
  }
  if (input.instagramUrl !== undefined) {
    payload.instagramUrl = String(input.instagramUrl).slice(0, 1000);
  }
  if (input.year !== undefined) {
    payload.year = String(input.year).slice(0, 16);
  }
  if (input.videoAspect === '16:9' || input.videoAspect === '9:16') {
    payload.videoAspect = input.videoAspect;
  }
  payload.isVerticalReel = isVerticalReel;
  if (input.gridSpan && ['normal', 'wide', 'tall'].includes(input.gridSpan)) {
    payload.gridSpan = input.gridSpan;
  } else {
    payload.gridSpan = isVerticalReel ? 'tall' : 'normal';
  }

  const imagesArr = (input.images || input.galleryImages || [])
    .filter((u): u is string => typeof u === 'string' && u.length > 0)
    .slice(0, 30);
  payload.images = imagesArr;

  const rawVideos = input.videoUrls && input.videoUrls.length > 0
    ? input.videoUrls
    : input.videoUrl
    ? [input.videoUrl]
    : projectType === 'video' && input.mediaUrl
    ? [input.mediaUrl]
    : [];
  const videosArr = rawVideos
    .filter((u): u is string => typeof u === 'string' && u.trim().length > 0)
    .map((u) => u.trim().slice(0, 1000))
    .slice(0, 20);
  payload.videoUrls = videosArr;

  const tagsArr = (input.tags || [])
    .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
    .map((t) => t.trim().slice(0, 60))
    .slice(0, 20);
  payload.tags = tagsArr;

  const deliverablesArr = (input.deliverables || [])
    .filter((d): d is string => typeof d === 'string' && d.trim().length > 0)
    .map((d) => d.trim().slice(0, 120))
    .slice(0, 20);
  payload.deliverables = deliverablesArr;

  if (Array.isArray(input.secondaryCategories)) {
    payload.secondaryCategories = input.secondaryCategories
      .filter((c): c is string => typeof c === 'string' && c.length > 0)
      .slice(0, 10);
  }

  if (Array.isArray(input.metrics)) {
    payload.metrics = input.metrics.slice(0, 10);
  }

  return payload;
}

export async function createProject(input: Partial<Project>): Promise<string> {
  if (!db) throw new Error('Firestore is not configured.');
  const projectId = (input.projectId || `proj-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
  const path = `projects/${projectId}`;
  try {
    const payload = sanitizeProjectPayload(projectId, input, true);
    await setDoc(doc(db, 'projects', projectId), payload);
    return projectId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateProject(projectId: string, input: Partial<Project>): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  const path = `projects/${projectId}`;
  try {
    const docRef = doc(db, 'projects', projectId);
    const snap = await getDoc(docRef);
    const existingData = snap.exists() ? snap.data() : {};
    const merged: Partial<Project> = {
      ...mapDocToProject(projectId, existingData),
      ...input,
    };
    const payload = sanitizeProjectPayload(projectId, merged, false);
    if (existingData.createdAt) {
      payload.createdAt = existingData.createdAt;
    } else {
      payload.createdAt = serverTimestamp();
    }
    await updateDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteProjectDoc(projectId: string): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  const path = `projects/${projectId}`;
  try {
    await deleteDoc(doc(db, 'projects', projectId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ============================================================================
// CATEGORIES MANAGEMENT
// ============================================================================

export function subscribeCategories(
  onData: (categories: CategoryDoc[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!isFirebaseConfigured || !db) {
    onData([]);
    return () => {};
  }

  return onSnapshot(
    collection(db, 'categories'),
    (snapshot) => {
      const items: CategoryDoc[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          categoryId: data.categoryId || d.id,
          name: data.name || 'Unnamed',
          slug: data.slug || slugify(data.name || d.id),
          sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
          createdAt: normalizeTimestamp(data.createdAt),
          updatedAt: normalizeTimestamp(data.updatedAt),
        };
      });
      items.sort((a, b) => a.sortOrder - b.sortOrder);
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.LIST, 'categories');
      } catch {
        // Logged
      }
    }
  );
}

export async function createCategory(input: { name: string; slug?: string; sortOrder?: number }): Promise<string> {
  if (!db) throw new Error('Firestore is not configured.');
  const name = input.name.trim().slice(0, 80);
  const slug = slugify(input.slug || name);
  const categoryId = `cat-${slug}-${Date.now().toString().slice(-4)}`.slice(0, 128);
  const path = `categories/${categoryId}`;
  try {
    await setDoc(doc(db, 'categories', categoryId), {
      categoryId,
      name,
      slug,
      sortOrder: typeof input.sortOrder === 'number' ? Math.max(0, input.sortOrder) : 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return categoryId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateCategory(
  categoryId: string,
  input: { name: string; slug?: string; sortOrder?: number }
): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  const path = `categories/${categoryId}`;
  try {
    const docRef = doc(db, 'categories', categoryId);
    const snap = await getDoc(docRef);
    const existingData = snap.exists() ? snap.data() : {};
    await updateDoc(docRef, {
      categoryId,
      name: input.name.trim().slice(0, 80),
      slug: slugify(input.slug || input.name),
      sortOrder: typeof input.sortOrder === 'number' ? Math.max(0, input.sortOrder) : 0,
      createdAt: existingData.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteCategory(categoryId: string): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  const path = `categories/${categoryId}`;
  try {
    await deleteDoc(doc(db, 'categories', categoryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ============================================================================
// MEDIA LIBRARY
// ============================================================================

export function subscribeMediaAssets(
  onData: (assets: MediaAsset[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!isFirebaseConfigured || !db) {
    onData([]);
    return () => {};
  }

  return onSnapshot(
    collection(db, 'media'),
    (snapshot) => {
      const items: MediaAsset[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          mediaId: data.mediaId || d.id,
          name: data.name || 'Untitled Asset',
          storagePath: data.storagePath || '',
          url: data.url || '',
          mediaType: data.mediaType === 'video' ? 'video' : 'image',
          contentType: data.contentType || '',
          size: typeof data.size === 'number' ? data.size : 0,
          uploadedBy: data.uploadedBy || '',
          createdAt: normalizeTimestamp(data.createdAt),
        };
      });
      items.sort((a, b) => {
        const tA = a.createdAt ? new Date(String(a.createdAt)).getTime() : 0;
        const tB = b.createdAt ? new Date(String(b.createdAt)).getTime() : 0;
        return tB - tA;
      });
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.LIST, 'media');
      } catch {
        // Logged
      }
    }
  );
}

export async function createMediaAssetRecord(input: Omit<MediaAsset, 'mediaId' | 'createdAt'>): Promise<MediaAsset> {
  if (!db) throw new Error('Firestore is not configured.');
  const mediaId = `media-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const path = `media/${mediaId}`;
  const payload = {
    mediaId,
    name: input.name.slice(0, 256),
    storagePath: input.storagePath.slice(0, 512),
    url: input.url.slice(0, 1000),
    mediaType: input.mediaType,
    contentType: input.contentType.slice(0, 128),
    size: input.size,
    uploadedBy: input.uploadedBy,
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'media', mediaId), payload);
    return {
      ...payload,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteMediaAssetRecord(mediaId: string): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  const path = `media/${mediaId}`;
  try {
    await deleteDoc(doc(db, 'media', mediaId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ============================================================================
// PROFILE & WEBSITE SETTINGS
// ============================================================================

export function subscribeProfileSettings(
  onData: (profile: ProfileSettings | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!isFirebaseConfigured || !db) {
    onData(null);
    return () => {};
  }

  return onSnapshot(
    doc(db, 'settings', 'profile'),
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null);
        return;
      }
      const data = snapshot.data();
      onData({
        name: data.name || DEFAULT_PROFILE_SETTINGS.name,
        professionalTitle: data.professionalTitle || DEFAULT_PROFILE_SETTINGS.professionalTitle,
        bio: data.bio || DEFAULT_PROFILE_SETTINGS.bio,
        profileImage: data.profileImage || DEFAULT_PROFILE_SETTINGS.profileImage,
        email: data.email || '',
        phone: data.phone || '',
        whatsappNumber: data.whatsappNumber || '',
        socialLinks: {
          instagram: data.socialLinks?.instagram || '',
          linkedin: data.socialLinks?.linkedin || '',
          behance: data.socialLinks?.behance || '',
          website: data.socialLinks?.website || data.website || '',
        },
        website: data.website || data.socialLinks?.website || '',
        updatedAt: normalizeTimestamp(data.updatedAt),
      });
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}

export async function saveProfileSettings(profile: ProfileSettings): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  const path = 'settings/profile';
  try {
    await setDoc(doc(db, 'settings', 'profile'), {
      name: (profile.name || 'Shubh').trim().slice(0, 120),
      professionalTitle: (profile.professionalTitle || '').trim().slice(0, 160),
      bio: (profile.bio || '').trim().slice(0, 2000),
      profileImage: (profile.profileImage || '').trim().slice(0, 1000),
      email: (profile.email || '').trim().slice(0, 256),
      phone: (profile.phone || '').trim().slice(0, 40),
      whatsappNumber: (profile.whatsappNumber || '').trim().slice(0, 40),
      website: (profile.website || '').trim().slice(0, 500),
      socialLinks: {
        instagram: (profile.socialLinks?.instagram || '').trim().slice(0, 300),
        linkedin: (profile.socialLinks?.linkedin || '').trim().slice(0, 300),
        behance: (profile.socialLinks?.behance || '').trim().slice(0, 300),
        website: (profile.website || profile.socialLinks?.website || '').trim().slice(0, 300),
      },
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeWebsiteSettings(
  onData: (settings: WebsiteSettings | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!isFirebaseConfigured || !db) {
    onData(null);
    return () => {};
  }

  return onSnapshot(
    doc(db, 'settings', 'website'),
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null);
        return;
      }
      const data = snapshot.data();
      onData({
        siteTitle: data.siteTitle || DEFAULT_WEBSITE_SETTINGS.siteTitle,
        siteDescription: data.siteDescription || DEFAULT_WEBSITE_SETTINGS.siteDescription,
        heroHeading: data.heroHeading || DEFAULT_WEBSITE_SETTINGS.heroHeading,
        heroSubheading: data.heroSubheading || DEFAULT_WEBSITE_SETTINGS.heroSubheading,
        availabilityText: data.availabilityText || DEFAULT_WEBSITE_SETTINGS.availabilityText,
        accentColor: data.accentColor || DEFAULT_WEBSITE_SETTINGS.accentColor,
        updatedAt: normalizeTimestamp(data.updatedAt),
      });
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}

export async function saveWebsiteSettings(settings: WebsiteSettings): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  const path = 'settings/website';
  try {
    await setDoc(doc(db, 'settings', 'website'), {
      siteTitle: (settings.siteTitle || DEFAULT_WEBSITE_SETTINGS.siteTitle).trim().slice(0, 160),
      siteDescription: (settings.siteDescription || '').trim().slice(0, 500),
      heroHeading: (settings.heroHeading || DEFAULT_WEBSITE_SETTINGS.heroHeading).trim().slice(0, 200),
      heroSubheading: (settings.heroSubheading || '').trim().slice(0, 500),
      availabilityText: (settings.availabilityText || '').trim().slice(0, 160),
      accentColor: (settings.accentColor || '#C8FF00').trim().slice(0, 20),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Seeds Firestore with initial categories, projects, and default settings.
 * Useful on first admin setup so the CMS starts populated.
 */
export async function seedInitialPortfolioData(): Promise<{ categoriesCount: number; projectsCount: number }> {
  return syncClientRosterToFirestore({ replaceOldSamples: false });
}

export const OLD_SAMPLE_PROJECT_IDS = new Set([
  'proj-aurelien-brand',
  'proj-metropolis-cinema',
  'proj-hyperdrive-reel',
  'proj-forma-web',
  'proj-apex-campaign',
  'proj-kromata-content',
  'proj-monolith-print',
  'proj-vesper-film',
]);

/**
 * Syncs all categories and client roster entries from INITIAL_PROJECTS into Firestore.
 * Optionally removes earlier starter placeholder records if they exist.
 */
export async function syncClientRosterToFirestore(options?: {
  replaceOldSamples?: boolean;
}): Promise<{ categoriesCount: number; projectsCount: number; removedSamples: number }> {
  if (!db) throw new Error('Firestore is not configured.');

  const defaultCategoryNames = [
    'Website Design',
    'Social Media Creatives',
    'Reels & Video',
    'Cinematography',
    'Branding',
    'Graphic Design',
    'Digital Campaigns',
  ];

  let existingCatsSnap;
  try {
    existingCatsSnap = await getDocs(collection(db, 'categories'));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'categories');
  }

  const catMap = new Map<string, string>();
  existingCatsSnap.docs.forEach((d) => {
    const data = d.data();
    if (data.name) catMap.set(data.name, d.id);
  });

  let createdCats = 0;
  for (let i = 0; i < defaultCategoryNames.length; i++) {
    const name = defaultCategoryNames[i];
    if (!catMap.has(name)) {
      const catId = `cat-${slugify(name)}`;
      try {
        await setDoc(doc(db, 'categories', catId), {
          categoryId: catId,
          name,
          slug: slugify(name),
          sortOrder: i + 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `categories/${catId}`);
      }
      catMap.set(name, catId);
      createdCats++;
    }
  }

  let existingProjectsSnap;
  try {
    existingProjectsSnap = await getDocs(collection(db, 'projects'));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'projects');
  }

  const existingIds = new Set(existingProjectsSnap.docs.map((d) => d.id));

  let removedSamples = 0;
  if (options?.replaceOldSamples) {
    for (const d of existingProjectsSnap.docs) {
      if (OLD_SAMPLE_PROJECT_IDS.has(d.id)) {
        try {
          await deleteDoc(doc(db, 'projects', d.id));
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `projects/${d.id}`);
        }
        existingIds.delete(d.id);
        removedSamples++;
      }
    }
  }

  let createdProjects = 0;
  for (let i = 0; i < INITIAL_PROJECTS.length; i++) {
    const sample = INITIAL_PROJECTS[i];
    const catId = catMap.get(sample.category) || `cat-${slugify(sample.category)}`;
    const projectId = sample.id.replace(/[^a-zA-Z0-9_-]/g, '-');
    if (existingIds.has(projectId)) continue;

    const payload = sanitizeProjectPayload(
      projectId,
      {
        ...sample,
        projectId,
        categoryId: catId,
        categoryName: sample.category,
        clientName: sample.client,
        thumbnailUrl: sample.thumbnail,
        images: sample.galleryImages || [],
        status: 'published',
        sortOrder: i + 1,
      },
      true
    );
    try {
      await setDoc(doc(db, 'projects', projectId), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `projects/${projectId}`);
    }
    createdProjects++;
  }

  try {
    const profileSnap = await getDoc(doc(db, 'settings', 'profile'));
    if (!profileSnap.exists()) {
      await saveProfileSettings(DEFAULT_PROFILE_SETTINGS);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'settings/profile');
  }

  try {
    const webSnap = await getDoc(doc(db, 'settings', 'website'));
    if (!webSnap.exists()) {
      await saveWebsiteSettings(DEFAULT_WEBSITE_SETTINGS);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'settings/website');
  }

  return {
    categoriesCount: createdCats,
    projectsCount: createdProjects,
    removedSamples,
  };
}
