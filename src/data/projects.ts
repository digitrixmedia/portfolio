/**
 * DIGITRIX MEDIA - PORTFOLIO DATA FILE
 *
 * ============================================================================
 * HOW TO ADD OR MANAGE PROJECTS:
 * ============================================================================
 * 1. Via Private Admin CMS (/admin/dashboard): Add, edit, reorder, upload images
 *    & MP4 Reels directly into Firebase Firestore & Storage.
 * 2. Via This File (Initial / Fallback Roster): Used when Firestore has no
 *    projects yet, and as the source for "Sync Client Roster" in Admin Overview.
 * ============================================================================
 */

import { Project } from '../types/portfolio';

export const INITIAL_PROJECTS: Project[] = [
  // ==========================================================================
  // WEB DESIGN & MANAGED WEBSITES (9)
  // ==========================================================================
  {
    id: 'web-the-maasai-mara',
    title: 'The Maasai Mara',
    client: 'The Maasai Mara',
    category: 'Website Design',
    secondaryCategories: ['Digital Campaigns', 'Branding'],
    projectType: 'website',
    description:
      'Hospitality and wildlife retreat digital flagship designed and actively managed with immersive visual storytelling and reservation-ready architecture.',
    fullDescription:
      'End-to-end website design, responsive UI architecture, visual curation, and ongoing digital management for The Maasai Mara. Crafted to translate the warmth and luxury of the retreat into an editorial web presence paired with social media storytelling.',
    thumbnail: '/src/assets/images/thumb_luxury_resort_1794587591493.jpg',
    websiteUrl: 'https://www.themaasaimara.in/',
    instagramUrl: 'https://www.instagram.com/the_maasaimara/',
    year: '2025',
    featured: true,
    gridSpan: 'wide',
    tags: ['Website Design', 'Hospitality', 'UI/UX', 'Web Management'],
    deliverables: ['Responsive Website', 'UI/UX Direction', 'Ongoing Site Management', 'Social Alignment'],
  },
  {
    id: 'web-drizzling-land',
    title: 'Drizzling Land',
    client: 'Drizzling Land Water & Amusement Park',
    category: 'Website Design',
    secondaryCategories: ['Digital Campaigns'],
    projectType: 'website',
    description:
      'High-conversion entertainment destination website crafted for seamless visitor discovery, attraction showcases, and ticketing flows.',
    fullDescription:
      'Designed and managed the official web presence for Drizzling Land, structuring high-traffic attraction pages, mobile-first navigation, and promotional campaign landing modules.',
    thumbnail: '/src/assets/images/thumb_luxury_resort_1794587591493.jpg',
    websiteUrl: 'https://drizzlingland.com/',
    year: '2025',
    featured: true,
    gridSpan: 'normal',
    tags: ['Website Design', 'Entertainment', 'Conversion UI', 'Web Management'],
    deliverables: ['Website Architecture', 'Mobile Optimization', 'Campaign Landing Pages', 'Ongoing Maintenance'],
  },
  {
    id: 'web-royal-cliff-resorts',
    title: 'Royal Cliff Resorts',
    client: 'Royal Cliff Resorts',
    category: 'Website Design',
    secondaryCategories: ['Branding'],
    projectType: 'website',
    description:
      'Luxury resort web experience showcasing panoramic suites, destination dining, and curated stay packages.',
    fullDescription:
      'Creative direction, web design, and ongoing digital management for Royal Cliff Resorts. Built with refined editorial hierarchy and direct inquiry pathways across desktop and mobile devices.',
    thumbnail: '/src/assets/images/thumb_luxury_resort_1794587591493.jpg',
    websiteUrl: 'https://www.royalcliffresorts.com/',
    year: '2025',
    featured: true,
    gridSpan: 'wide',
    tags: ['Luxury Hospitality', 'Website Design', 'Responsive UI', 'Web Management'],
    deliverables: ['Flagship Website', 'Room & Venue Showcases', 'Mobile Experience', 'Site Management'],
  },
  {
    id: 'web-mesoderma-clinic',
    title: 'Mesoderma Clinic',
    client: 'Mesoderma Clinic',
    category: 'Website Design',
    secondaryCategories: ['Digital Campaigns'],
    projectType: 'website',
    description:
      'Clinical aesthetics and dermatology web platform emphasizing trust, treatment clarity, and appointment conversion.',
    fullDescription:
      'Designed and managed the digital presence for Mesoderma Clinic, organizing aesthetic dermatology treatments into an approachable, high-trust web experience tailored for modern patients.',
    thumbnail: '/src/assets/images/thumb_skin_medical_clinic_1794587591958.jpg',
    websiteUrl: 'https://www.mesodermaclinic.com/',
    year: '2025',
    featured: false,
    gridSpan: 'normal',
    tags: ['Healthcare Web', 'Dermatology', 'UI/UX Design', 'Web Management'],
    deliverables: ['Clinical Web Design', 'Treatment Directory UX', 'Lead Capture Flow', 'Ongoing Updates'],
  },
  {
    id: 'web-hungry-point',
    title: 'Hungry Point',
    client: 'Hungry Point',
    category: 'Website Design',
    secondaryCategories: ['Branding', 'Digital Campaigns'],
    projectType: 'website',
    description:
      'Bold QSR and culinary franchise website engineered for menu discovery, brand energy, and franchise inquiries.',
    fullDescription:
      'Designed and managed the digital experience for Hungry Point, pairing appetizing menu presentation with fast-loading mobile responsiveness and franchise growth touchpoints.',
    thumbnail: '/src/assets/images/thumb_culinary_qsr_1794587592457.jpg',
    websiteUrl: 'https://hungrypoint.in/',
    year: '2025',
    featured: true,
    gridSpan: 'normal',
    tags: ['Food & QSR', 'Website Design', 'Franchise Growth', 'Web Management'],
    deliverables: ['Brand Website', 'Menu Experience', 'Franchise Lead Funnel', 'Web Management'],
  },
  {
    id: 'web-meshram-diagnostics',
    title: 'Meshram Diagnostics',
    client: 'Meshram Diagnostics',
    category: 'Website Design',
    secondaryCategories: ['Graphic Design'],
    projectType: 'website',
    description:
      'Clean, accessible healthcare diagnostics web portal built for effortless test search and patient confidence.',
    fullDescription:
      'Designed and managed the website for Meshram Diagnostics, structuring diagnostic packages, clinic credentials, and patient inquiry routes with clinical clarity and speed.',
    thumbnail: '/src/assets/images/thumb_skin_medical_clinic_1794587591958.jpg',
    websiteUrl: 'https://meshramdiagnostics.in/',
    year: '2025',
    featured: false,
    gridSpan: 'normal',
    tags: ['Medical Web', 'Diagnostics', 'UI Design', 'Web Management'],
    deliverables: ['Responsive Web Portal', 'Service Structuring', 'Performance Optimization'],
  },
  {
    id: 'web-skylark-buildcon',
    title: 'Skylark Buildcon',
    client: 'Skylark Buildcon',
    category: 'Website Design',
    secondaryCategories: ['Branding', 'Digital Campaigns'],
    projectType: 'website',
    description:
      'Architectural real estate corporate website showcasing residential developments, masterplans, and investor confidence.',
    fullDescription:
      'Full-stack website design and ongoing digital management for Skylark Buildcon. Highlights flagship real estate developments with clean architectural typography, interactive project breakdowns, and qualified buyer inquiry channels.',
    thumbnail: '/src/assets/images/thumb_real_estate_arch_1794587592869.jpg',
    websiteUrl: 'https://skylarkbuildcon.com/',
    instagramUrl: 'https://www.instagram.com/skylark.buildcon/',
    year: '2026',
    featured: true,
    gridSpan: 'wide',
    tags: ['Real Estate', 'Website Design', 'Architecture', 'Web Management'],
    deliverables: ['Corporate Website', 'Property Showcase Pages', 'Lead Generation UX', 'Continuous Management'],
  },
  {
    id: 'web-balaji-parnam',
    title: 'Balaji Parnam',
    client: 'Balaji Parnam',
    category: 'Website Design',
    secondaryCategories: ['Digital Campaigns'],
    projectType: 'website',
    description:
      'Modern property showcase website engineered for clear project storytelling, amenities highlights, and site-visit bookings.',
    fullDescription:
      'Designed and managed the digital experience for Balaji Parnam, blending clean architectural visuals with streamlined site-visit inquiry flows across desktop and mobile.',
    thumbnail: '/src/assets/images/thumb_real_estate_arch_1794587592869.jpg',
    websiteUrl: 'https://balaji-parnam.ai.studio/',
    year: '2026',
    featured: false,
    gridSpan: 'normal',
    tags: ['Real Estate Web', 'Landing Experience', 'UI/UX', 'Web Management'],
    deliverables: ['Project Landing Experience', 'Responsive UI', 'Inquiry Optimization'],
  },
  {
    id: 'web-uttam-city',
    title: 'Uttam City',
    client: 'Uttam City',
    category: 'Website Design',
    secondaryCategories: ['Branding'],
    projectType: 'website',
    description:
      'Integrated township and urban living web destination presenting plot layouts, community infrastructure, and buyer guidance.',
    fullDescription:
      'Designed and managed the digital platform for Uttam City, bringing clarity to township offerings, location highlights, and direct buyer connectivity.',
    thumbnail: '/src/assets/images/thumb_real_estate_arch_1794587592869.jpg',
    websiteUrl: 'https://www.uttamcity.com/',
    year: '2025',
    featured: false,
    gridSpan: 'normal',
    tags: ['Township', 'Website Design', 'Real Estate', 'Web Management'],
    deliverables: ['Township Website', 'Visual Hierarchy', 'Ongoing Site Management'],
  },

  // ==========================================================================
  // INSTAGRAM ACCOUNTS MANAGED (8)
  // Ready for uploading custom creatives, carousels & MP4 reels via Admin CMS
  // ==========================================================================
  {
    id: 'ig-skylark-buildcon',
    title: 'Skylark Buildcon — Instagram',
    client: 'Skylark Buildcon',
    category: 'Social Media Creatives',
    secondaryCategories: ['Reels & Video', 'Digital Campaigns'],
    projectType: 'gallery',
    description:
      'End-to-end Instagram creative direction, architectural reels, construction progress stories, and brand grid management.',
    fullDescription:
      'Ongoing Instagram management for Skylark Buildcon (@skylark.buildcon). Includes architectural campaign visuals, site showcase reels, investor carousels, and consistent grid aesthetics. Upload brand reels and campaign posts anytime in the Admin Dashboard.',
    thumbnail: '/src/assets/images/thumb_real_estate_arch_1794587592869.jpg',
    galleryImages: ['/src/assets/images/thumb_real_estate_arch_1794587592869.jpg'],
    instagramUrl: 'https://www.instagram.com/skylark.buildcon/',
    websiteUrl: 'https://skylarkbuildcon.com/',
    year: '2026',
    featured: false,
    gridSpan: 'normal',
    tags: ['Instagram Growth', 'Real Estate Reels', 'Social Design', 'Content Direction'],
    deliverables: ['Instagram Grid System', 'Reels Production', 'Campaign Carousels', 'Account Management'],
  },
  {
    id: 'ig-fortune-walkway-mall',
    title: 'Fortune Walkway Mall Haldwani',
    client: 'Fortune Walkway Mall Haldwani',
    category: 'Social Media Creatives',
    secondaryCategories: ['Reels & Video', 'Digital Campaigns'],
    projectType: 'gallery',
    description:
      'Dynamic retail destination Instagram presence featuring store spotlights, seasonal events, lifestyle reels, and footfall campaigns.',
    fullDescription:
      'Managed social media presence for Fortune Walkway Mall Haldwani (@fortunewalkwaymallhaldwani), producing event coverage reels, retail brand collaborations, festive visual campaigns, and high-engagement community stories.',
    thumbnail: '/src/assets/images/thumb_retail_lifestyle_1794587592857.jpg',
    galleryImages: ['/src/assets/images/thumb_retail_lifestyle_1794587592857.jpg'],
    instagramUrl: 'https://www.instagram.com/fortunewalkwaymallhaldwani/',
    year: '2026',
    featured: true,
    gridSpan: 'normal',
    tags: ['Retail Marketing', 'Event Reels', 'Instagram Strategy', 'Lifestyle Content'],
    deliverables: ['Reels & Event Coverage', 'Retail Brand Features', 'Festive Campaign Creatives', 'Community Management'],
  },
  {
    id: 'ig-buzz-rudrapur',
    title: 'Buzz Rudrapur',
    client: 'Buzz Rudrapur',
    category: 'Social Media Creatives',
    secondaryCategories: ['Reels & Video', 'Graphic Design'],
    projectType: 'gallery',
    description:
      'Hyper-local city culture, dining, and lifestyle Instagram channel driven by fast-paced reels and bold editorial graphics.',
    fullDescription:
      'Creative direction and Instagram management for Buzz Rudrapur (@buzz.rudrapur). Built around trend-aware vertical reels, local spotlight features, and distinctive typography graphics engineered for local shareability.',
    thumbnail: '/src/assets/images/thumb_retail_lifestyle_1794587592857.jpg',
    galleryImages: ['/src/assets/images/thumb_retail_lifestyle_1794587592857.jpg'],
    instagramUrl: 'https://www.instagram.com/buzz.rudrapur/',
    year: '2026',
    featured: false,
    gridSpan: 'normal',
    tags: ['City Media', 'Vertical Reels', 'Editorial Graphics', 'Audience Engagement'],
    deliverables: ['Trend-Driven Reels', 'Visual Storytelling', 'Carousel Templates', 'Publishing Calendar'],
  },
  {
    id: 'ig-ramkrishna-care-hospital',
    title: 'Ramkrishna Care Hospital',
    client: 'Ramkrishna Care Hospital',
    category: 'Social Media Creatives',
    secondaryCategories: ['Digital Campaigns', 'Graphic Design'],
    projectType: 'gallery',
    description:
      'Authoritative healthcare social communication combining specialist doctor reels, awareness creatives, and patient-first visuals.',
    fullDescription:
      'Instagram management and creative design for Ramkrishna Care Hospital (@ramkrishnacarehospital). Translating complex medical specialties into clear, credible educational reels and health-awareness visual systems.',
    thumbnail: '/src/assets/images/thumb_skin_medical_clinic_1794587591958.jpg',
    galleryImages: ['/src/assets/images/thumb_skin_medical_clinic_1794587591958.jpg'],
    instagramUrl: 'https://www.instagram.com/ramkrishnacarehospital/',
    year: '2026',
    featured: false,
    gridSpan: 'normal',
    tags: ['Healthcare Social', 'Doctor Reels', 'Awareness Campaigns', 'Graphic Design'],
    deliverables: ['Medical Awareness Graphics', 'Doctor Interview Reels', 'Monthly Content Calendar'],
  },
  {
    id: 'ig-bikaner-thaat-baat',
    title: 'Bikaner Thaat Baat',
    client: 'Bikaner Thaat Baat',
    category: 'Social Media Creatives',
    secondaryCategories: ['Reels & Video', 'Branding'],
    projectType: 'gallery',
    description:
      'Rich culinary storytelling, festive sweet showcases, and mouth-watering food reels crafted for authentic regional hospitality.',
    fullDescription:
      'Instagram account management and visual production for Bikaner Thaat Baat (@bikaner_thaat_baat). Focused on vibrant food cinematography, festive gifting campaigns, and high-retention short-form dining reels.',
    thumbnail: '/src/assets/images/thumb_culinary_qsr_1794587592457.jpg',
    galleryImages: ['/src/assets/images/thumb_culinary_qsr_1794587592457.jpg'],
    instagramUrl: 'https://www.instagram.com/bikaner_thaat_baat/',
    year: '2026',
    featured: true,
    gridSpan: 'normal',
    tags: ['Food & Dining', 'Culinary Reels', 'Festive Campaigns', 'Instagram Management'],
    deliverables: ['Food Reels', 'Festive Creative Packs', 'Menu Highlights', 'Grid Curation'],
  },
  {
    id: 'ig-the-maasai-mara-social',
    title: 'The Maasai Mara — Social & Reels',
    client: 'The Maasai Mara',
    category: 'Social Media Creatives',
    secondaryCategories: ['Reels & Video', 'Cinematography'],
    projectType: 'gallery',
    description:
      'Atmospheric hospitality Instagram feed pairing destination cinema reels with luxury guest-experience storytelling.',
    fullDescription:
      'Complete Instagram visual curation and reel production for The Maasai Mara (@the_maasaimara), aligning atmospheric hospitality cinematography with seasonal stay campaigns and direct booking traffic.',
    thumbnail: '/src/assets/images/thumb_luxury_resort_1794587591493.jpg',
    galleryImages: ['/src/assets/images/thumb_luxury_resort_1794587591493.jpg'],
    instagramUrl: 'https://www.instagram.com/the_maasaimara/',
    websiteUrl: 'https://www.themaasaimara.in/',
    year: '2026',
    featured: false,
    gridSpan: 'normal',
    tags: ['Hospitality Reels', 'Destination Visuals', 'Instagram Management', 'Storytelling'],
    deliverables: ['Cinematic Stay Reels', 'Aesthetic Grid Curation', 'Seasonal Campaigns'],
  },
  {
    id: 'ig-sbr-skin-clinics',
    title: 'SBR Skin Clinics',
    client: 'SBR Skin Clinics',
    category: 'Social Media Creatives',
    secondaryCategories: ['Reels & Video', 'Graphic Design'],
    projectType: 'gallery',
    description:
      'Refined aesthetic dermatology social identity blending clinical credibility, skincare education reels, and before-after storytelling.',
    fullDescription:
      'Instagram creative management for SBR Skin Clinics (@sbr.skin.clinics). Delivering minimalist skincare carousels, dermatologist-led reels, and procedure explainers designed to educate and convert aesthetic clients.',
    thumbnail: '/src/assets/images/thumb_skin_medical_clinic_1794587591958.jpg',
    galleryImages: ['/src/assets/images/thumb_skin_medical_clinic_1794587591958.jpg'],
    instagramUrl: 'https://www.instagram.com/sbr.skin.clinics/',
    year: '2026',
    featured: false,
    gridSpan: 'normal',
    tags: ['Skincare & Aesthetics', 'Clinic Reels', 'Editorial Carousels', 'Social Branding'],
    deliverables: ['Skincare Education Reels', 'Minimalist Carousel System', 'Account Management'],
  },
  {
    id: 'ig-mdb-group',
    title: 'MDB Group',
    client: 'MDB Group',
    category: 'Social Media Creatives',
    secondaryCategories: ['Digital Campaigns', 'Branding'],
    projectType: 'gallery',
    description:
      'Corporate real estate and development Instagram identity communicating scale, architectural quality, and trust.',
    fullDescription:
      'Instagram creative direction and account management for MDB Group (@mdbgroup.in), highlighting flagship developments, architectural milestones, and investor-focused digital campaigns.',
    thumbnail: '/src/assets/images/thumb_real_estate_arch_1794587592869.jpg',
    galleryImages: ['/src/assets/images/thumb_real_estate_arch_1794587592869.jpg'],
    instagramUrl: 'https://www.instagram.com/mdbgroup.in/',
    year: '2026',
    featured: false,
    gridSpan: 'normal',
    tags: ['Corporate Real Estate', 'Brand Positioning', 'Instagram Campaigns', 'Visual Design'],
    deliverables: ['Project Launch Creatives', 'Corporate Carousels', 'Reels & Updates', 'Grid Management'],
  },
];

/**
 * Dynamic Content Helper Functions
 */

/**
 * Dynamically extracts all unique categories present across all projects.
 * Guarantees 'All Work' is always the first tab.
 */
export function extractCategories(projectsList: Project[]): string[] {
  const categoriesSet = new Set<string>();
  categoriesSet.add('All Work');

  projectsList.forEach((p) => {
    if (p.category) categoriesSet.add(p.category);
    if (p.secondaryCategories) {
      p.secondaryCategories.forEach((sec) => categoriesSet.add(sec));
    }
  });

  return Array.from(categoriesSet);
}

/**
 * Filters project list by selected category.
 */
export function filterProjectsByCategory(projectsList: Project[], category: string): Project[] {
  if (category === 'All Work') return projectsList;
  return projectsList.filter(
    (p) => p.category === category || p.secondaryCategories?.includes(category)
  );
}

/**
 * Returns only featured projects for highlights or hero spotlight.
 */
export function getFeaturedProjects(projectsList: Project[]): Project[] {
  return projectsList.filter((p) => p.featured);
}
