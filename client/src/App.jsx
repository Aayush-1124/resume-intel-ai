import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar.jsx';
import TemplateModal from './components/TemplateModal.jsx';
import ToastContainer from './components/ToastContainer.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

const LandingPage = lazy(() => import('./pages/LandingPage.jsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const JobsPage = lazy(() => import('./pages/JobsPage.jsx'));
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
    projects: (data.projects || []).map((p) => ({
      ...p,
      id: p.id || crypto.randomUUID(),
      bullets: p.bullets?.length ? p.bullets : [''],
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
      <ToastContainer />
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
        selected={resumeData.selectedTemplate || 'executive'}
        onSelect={(t) => handleUpdate({ ...resumeData, selectedTemplate: t })}
      />

      <AnimatePresence mode="wait">
        {page === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <ErrorBoundary>
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
                <LandingPage onNavigate={navigate} onResumeLoaded={handleResumeLoaded} />
              </Suspense>
            </ErrorBoundary>
          </motion.div>
        )}

        {page === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="pt-[72px]"
          >
            <ErrorBoundary>
              <Suspense fallback={<div className="min-h-screen pt-[72px] flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
                <DashboardPage
                  resumeData={resumeData}
                  onUpdate={handleUpdate}
                  currentStep={currentStep}
                  onStepChange={setCurrentStep}
                  onNavigate={navigate}
                />
              </Suspense>
            </ErrorBoundary>
          </motion.div>
        )}

        {page === 'jobs' && (
          <motion.div
            key="jobs"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="pt-[72px]"
          >
            <ErrorBoundary>
              <Suspense fallback={<div className="min-h-screen pt-[72px] flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
                <JobsPage resumeData={resumeData} onNavigate={navigate} />
              </Suspense>
            </ErrorBoundary>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
