import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Sun, Moon, LayoutDashboard, LayoutTemplate, FileCheck2, Briefcase, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'ats-check', label: 'ATS Check', icon: FileCheck2 },
  { id: 'jobs', label: 'Find Jobs', icon: Briefcase },
];

export default function Navbar({ activePage, activeStep, onNavigate, onOpenTemplates, isDark, onThemeToggle }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10 flex justify-between items-center w-full px-4 sm:px-8 py-3.5"
        style={{ boxShadow: '0 4px 40px var(--shadow-glow)' }}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="flex items-center gap-10">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 text-[1.2rem] sm:text-[1.35rem] font-extrabold text-on-surface tracking-tighter hover:opacity-80 transition-opacity"
            aria-label="ResumeIntel AI Home"
          >
            <div className="bg-primary-container p-1.5 rounded-xl shadow-sm">
              <Sparkles size={18} className="text-on-primary-container" aria-hidden="true" />
            </div>
            ResumeIntel
          </button>

          {/* Desktop Nav links */}
          <div className="hidden lg:flex gap-1.5 bg-surface-container-low p-1.5 rounded-[1.25rem] border border-outline-variant/20 shadow-inner" role="navigation" aria-label="Site sections">
            {NAV_LINKS.map((link) => {
              const isDashboardActive = activePage === 'dashboard' && link.id === 'dashboard' && activeStep !== 'optimizer';
              const isAtsActive = activePage === 'dashboard' && link.id === 'ats-check' && activeStep === 'optimizer';
              const isJobsActive = activePage === 'jobs' && link.id === 'jobs';
              
              const isActive = isDashboardActive || isAtsActive || isJobsActive;
              const Icon = link.icon;

              return (
                <button
                  key={link.id}
                  onClick={() => {
                    if (link.id === 'dashboard') onNavigate('dashboard', 'personal');
                    if (link.id === 'ats-check') onNavigate('dashboard', 'optimizer');
                    if (link.id === 'templates' && onOpenTemplates) onOpenTemplates();
                    if (link.id === 'jobs') onNavigate('jobs');
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-[1rem] text-sm font-semibold tracking-tight transition-all duration-300 ${
                    isActive
                      ? 'text-on-primary bg-primary shadow-md'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'opacity-100' : 'opacity-70'} />
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active-pill"
                      className="absolute inset-0 bg-primary rounded-[1rem] -z-10 shadow-[0_4px_12px_rgba(var(--primary-rgb),0.3)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Theme Toggle */}
          <motion.button
            onClick={onThemeToggle}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:text-primary transition-colors duration-300 shadow-sm"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <AnimatedThemeIcon isDark={isDark} />
          </motion.button>

          <motion.button
            onClick={() => onNavigate('dashboard', 'personal')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="hidden sm:flex px-6 py-2.5 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-sm tracking-wide rounded-full shadow-lg hover:shadow-xl transition-all"
            aria-label="Build your resume"
          >
            Start Building
          </motion.button>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-on-surface"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[72px] left-0 right-0 z-40 bg-surface-container-low border-b border-outline-variant/10 shadow-xl lg:hidden flex flex-col p-4 gap-2"
          >
            {NAV_LINKS.map((link) => {
              const isDashboardActive = activePage === 'dashboard' && link.id === 'dashboard' && activeStep !== 'optimizer';
              const isAtsActive = activePage === 'dashboard' && link.id === 'ats-check' && activeStep === 'optimizer';
              const isJobsActive = activePage === 'jobs' && link.id === 'jobs';
              const isActive = isDashboardActive || isAtsActive || isJobsActive;
              const Icon = link.icon;

              return (
                <button
                  key={link.id}
                  onClick={() => {
                    if (link.id === 'dashboard') onNavigate('dashboard', 'personal');
                    if (link.id === 'ats-check') onNavigate('dashboard', 'optimizer');
                    if (link.id === 'templates' && onOpenTemplates) onOpenTemplates();
                    if (link.id === 'jobs') onNavigate('jobs');
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  <Icon size={18} />
                  {link.label}
                </button>
              );
            })}
            
            <button
              onClick={() => {
                onNavigate('dashboard', 'personal');
                setIsMenuOpen(false);
              }}
              className="mt-2 w-full py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-sm tracking-wide rounded-xl shadow-md sm:hidden"
            >
              Start Building
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function AnimatedThemeIcon({ isDark }) {
  return (
    <motion.div
      key={isDark ? 'moon' : 'sun'}
      initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
      animate={{ rotate: 0, opacity: 1, scale: 1 }}
      exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.3, type: 'spring' }}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </motion.div>
  );
}
