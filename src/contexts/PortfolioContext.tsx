import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Project,
  CategoryDoc,
  ProfileSettings,
  WebsiteSettings,
} from '../types/portfolio';
import {
  subscribePublishedProjects,
  subscribeCategories,
  subscribeProfileSettings,
  subscribeWebsiteSettings,
  DEFAULT_PROFILE_SETTINGS,
  DEFAULT_WEBSITE_SETTINGS,
} from '../lib/firestore-service';
import { isFirebaseConfigured } from '../lib/firebase';
import { INITIAL_PROJECTS } from '../data/projects';

interface PortfolioContextValue {
  projects: Project[];
  categories: CategoryDoc[];
  profileSettings: ProfileSettings;
  websiteSettings: WebsiteSettings;
  loading: boolean;
  usingFirestoreData: boolean;
}

const PortfolioContext = createContext<PortfolioContextValue | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firestoreProjects, setFirestoreProjects] = useState<Project[]>([]);
  const [hasLoadedProjects, setHasLoadedProjects] = useState<boolean>(!isFirebaseConfigured);
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>(DEFAULT_PROFILE_SETTINGS);
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings>(DEFAULT_WEBSITE_SETTINGS);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubProjects = subscribePublishedProjects((items) => {
      setFirestoreProjects(items);
      setHasLoadedProjects(true);
    });

    const unsubCategories = subscribeCategories((cats) => {
      setCategories(cats);
    });

    const unsubProfile = subscribeProfileSettings((prof) => {
      if (prof) setProfileSettings(prof);
    });

    const unsubWebsite = subscribeWebsiteSettings((site) => {
      if (site) setWebsiteSettings(site);
    });

    return () => {
      unsubProjects();
      unsubCategories();
      unsubProfile();
      unsubWebsite();
    };
  }, []);

  // Apply dynamic website settings (title, description, accent color)
  useEffect(() => {
    if (websiteSettings.siteTitle) {
      document.title = websiteSettings.siteTitle;
    }
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && websiteSettings.siteDescription) {
      metaDesc.setAttribute('content', websiteSettings.siteDescription);
    }
    if (websiteSettings.accentColor) {
      document.documentElement.style.setProperty('--accent-lime', websiteSettings.accentColor);
    }
  }, [websiteSettings]);

  // If Firestore has published projects, display them; otherwise show curated placeholder samples until admin publishes/seeds
  const usingFirestoreData = firestoreProjects.length > 0;
  const projects = usingFirestoreData ? firestoreProjects : INITIAL_PROJECTS;

  return (
    <PortfolioContext.Provider
      value={{
        projects,
        categories,
        profileSettings,
        websiteSettings,
        loading: !hasLoadedProjects,
        usingFirestoreData,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolio must be used within PortfolioProvider');
  return ctx;
}
