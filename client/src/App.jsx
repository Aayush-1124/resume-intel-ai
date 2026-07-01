import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar.jsx';
import LandingPage from './pages/LandingPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import JobsPage from './pages/JobsPage.jsx';
import TemplateModal from './components/TemplateModal.jsx';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { useTheme } from './hooks/useTheme.js';
import { defaultResume } from './utils/api.js';

const emptyTemplate = {
  personal: { fullName: '', role: '', email: '', phone: '', location: '', website: '', linkedin: '', summary: '' },
  experience: [],
  education: [],
  skills: { technical: [], soft: [], languages: [], certifications: [] },
};

function normalizeResume(data) {
  if (!data) return defaultResume;
  return {
    ...defaultResume,
    ...data,
    personal: { ...emptyTemplate.personal, ...(data.personal || {}) },
    experience: (data.experience || []).map((e) => ({
      ...e,
      id: e.id || crypto.randomUUID(),
      bullets: e.bullets?.length ? e.bullets : [''],
    })),
    education: (data.education || []).map((e) => ({
      ...e,
      id: e.id || crypto.randomUUID(),
    })),
    skills: { ...emptyTemplate.skills, ...(data.skills || {}) },
  };
}

export default function App() {
  const { theme, toggle, isDark } = useTheme();
  const [page, setPage] = useState('landing');
  const [currentStep, setCurrentStep] = useState('personal');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [storedResume, setStoredResume] = useLocalStorage('resumeintel_resume', defaultResume);
  const [resumeData, setResumeData] = useState(() => normalizeResume(storedResume));

  useEffect(() => {
    const timer = setTimeout(() => {
      setStoredResume(resumeData);
    }, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [resumeData, setStoredResume]);

  const handleResumeLoaded = (parsed) => {
    setResumeData(normalizeResume(parsed));
    setPage('dashboard');
    setCurrentStep('personal');
  };

  const handleUpdate = useCallback((data) => {
    setResumeData(normalizeResume(data));
  }, []);

  const navigate = (p, step) => {
    setPage(p);
    if (p === 'dashboard') {
      setCurrentStep(step || 'personal');
    }
  };

  return (
    <div className={`min-h-screen bg-background text-on-background theme-transition ${theme}`}>
      <Navbar
        activePage={page}
        activeStep={currentStep}
        onNavigate={navigate}
        onOpenTemplates={() => setIsTemplateModalOpen(true)}
        isDark={isDark}
        onThemeToggle={toggle}
      />

      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        selected={resumeData.selectedTemplate || 'modern'}
        onSelect={(t) => handleUpdate({ ...resumeData, selectedTemplate: t })}
      />

      <AnimatePresence mode="wait">
        {page === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <LandingPage onNavigate={navigate} onResumeLoaded={handleResumeLoaded} />
          </motion.div>
        )}

        {page === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="pt-[72px]"
          >
            <DashboardPage
              resumeData={resumeData}
              onUpdate={handleUpdate}
              currentStep={currentStep}
              onStepChange={setCurrentStep}
              onNavigate={navigate}
            />
          </motion.div>
        )}

        {page === 'jobs' && (
          <motion.div
            key="jobs"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="pt-[72px]"
          >
            <JobsPage resumeData={resumeData} onNavigate={navigate} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
