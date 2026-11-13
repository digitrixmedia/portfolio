import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { PortfolioProvider, usePortfolio } from './contexts/PortfolioContext';
import { useAppRouter } from './hooks/useAppRouter';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { PortfolioSection } from './components/PortfolioSection';
import { ServicesSection } from './components/ServicesSection';
import { ProcessSection } from './components/ProcessSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { ProjectModal } from './components/project-viewer/ProjectModal';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Project } from './types/portfolio';

const PublicPortfolioView: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { projects } = usePortfolio();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectProject = (project: Project, initialVideoIndex?: number) => {
    setSelectedProject(project);
    setSelectedVideoIndex(initialVideoIndex);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenShowreel = () => {
    const showreelProject =
      projects.find((p) => p.projectType === 'video') ||
      projects.find((p) => p.featured) ||
      projects[0];
    if (showreelProject) {
      setSelectedProject(showreelProject);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col font-sans selection:bg-[#C8FF00] selection:text-black">
      {/* Primary Top Bar Contract Navbar */}
      <Navbar onContactClick={() => scrollToSection('contact')} />

      {/* Main Page Flow */}
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <HeroSection
          onExploreWork={() => scrollToSection('work')}
          onContactClick={() => scrollToSection('contact')}
          onOpenShowreel={handleOpenShowreel}
        />

        {/* About Me Section */}
        <AboutSection />

        {/* Selected Work Portfolio Gallery */}
        <PortfolioSection
          projects={projects}
          onSelectProject={handleSelectProject}
        />

        {/* 10 Creative Services */}
        <ServicesSection
          onSelectServiceCTA={() => scrollToSection('contact')}
        />

        {/* 4-Step Creative Process */}
        <ProcessSection />

        {/* Contact & Inquiries */}
        <ContactSection />
      </main>

      {/* Minimal Footer with Admin CMS entry */}
      <Footer onAdminClick={() => onNavigate('/admin')} />

      {/* Interactive Project Viewer Modal */}
      <ProjectModal
        project={selectedProject}
        allProjects={projects}
        isOpen={isModalOpen}
        initialVideoIndex={selectedVideoIndex}
        onClose={handleCloseModal}
        onSelectProject={(proj) => {
          setSelectedProject(proj);
          setSelectedVideoIndex(undefined);
        }}
      />
    </div>
  );
};

function AppRouter() {
  const { pathname, navigate } = useAppRouter();

  // Route matching: /admin, /admin/dashboard, and public portfolio /
  if (pathname === '/admin' || pathname === '/admin/login') {
    return <AdminLogin onNavigate={navigate} />;
  }

  if (pathname.startsWith('/admin/')) {
    return <AdminDashboard onNavigate={navigate} />;
  }

  return <PublicPortfolioView onNavigate={navigate} />;
}

export default function App() {
  return (
    <AuthProvider>
      <PortfolioProvider>
        <AppRouter />
      </PortfolioProvider>
    </AuthProvider>
  );
}
