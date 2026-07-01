import { useRef, useCallback, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { exportToDoc } from '../utils/docxExport.js';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutTemplate } from 'lucide-react';
import FormSidebar from '../components/FormSidebar.jsx';
import PersonalForm from '../components/form-steps/PersonalForm.jsx';
import ExperienceForm from '../components/form-steps/ExperienceForm.jsx';
import EducationForm from '../components/form-steps/EducationForm.jsx';
import SkillsForm from '../components/form-steps/SkillsForm.jsx';
import AIOptimizerForm from '../components/form-steps/AIOptimizerForm.jsx';
import ResumePreview from '../components/ResumePreview.jsx';
import ATSScoreWidget from '../components/ATSScoreWidget.jsx';
import TemplateShuffler from '../components/TemplateShuffler.jsx';
import DiffPreview from '../components/DiffPreview.jsx';
import JobSuccessModal from '../components/JobSuccessModal.jsx';

const STEPS = ['personal', 'experience', 'education', 'skills', 'optimizer'];

export default function DashboardPage({ resumeData, onUpdate, currentStep, onStepChange, onNavigate }) {
  const printRef  = useRef(null);
  const previewContainerRef = useRef(null);
  const [previewKey, setPreviewKey] = useState(0);
  const [scale, setScale] = useState(0.5);
  const [paperSize, setPaperSize] = useState('a4');
  const [showJobModal, setShowJobModal] = useState(false);

  useEffect(() => {
    const el = previewContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const availableWidth = entry.contentRect.width;
        const targetWidth = availableWidth - 10; // 10px breathing room
        setScale(Math.min(targetWidth / 794, 1)); // Cap at scale 1
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* ── Print handler (react-to-print v2 API) ── */
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `${resumeData.personal?.fullName || 'Resume'} — ResumeIntel`,
    pageStyle: `
      @page { size: ${paperSize === 'letter' ? 'letter' : 'A4'}; margin: 0; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        #resume-print-area { border-radius: 0 !important; box-shadow: none !important; }
      }
    `,
  });

  const handleDownloadPdf = async () => {
    // We will dynamically import html2canvas and jsPDF to save initial bundle size
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      
      const element = printRef.current;
      if (!element) return;
      
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: paperSize
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${resumeData.personal?.fullName || 'Resume'} — ResumeIntel.pdf`);
      setShowJobModal(true);
    } catch (err) {
      console.error('Download failed:', err);
      // Fallback to print dialog
      handlePrint();
    }
  };

  const handleDownloadDoc = () => {
    if (printRef.current) {
      exportToDoc(printRef.current, `${resumeData.personal?.fullName || 'Resume'} — ResumeIntel.doc`);
      setShowJobModal(true);
    }
  };

  /* ── Step navigation ── */
  const stepIndex = STEPS.indexOf(currentStep);
  const goNext = useCallback(() => { const n = STEPS[stepIndex + 1]; if (n) onStepChange(n); }, [stepIndex, onStepChange]);
  const goBack = useCallback(() => { const p = STEPS[stepIndex - 1]; if (p) onStepChange(p); }, [stepIndex, onStepChange]);

  /* ── Template switch (with micro-animation) ── */
  const handleTemplateSelect = (t) => {
    onUpdate({ ...resumeData, selectedTemplate: t });
    setPreviewKey((k) => k + 1);
  };

  /* ── Diff Workflow ── */
  const [diffOriginal, setDiffOriginal] = useState(null);
  const [diffTailored, setDiffTailored] = useState(null);

  const handleTailorComplete = (original, tailored) => {
    setDiffOriginal(original);
    setDiffTailored(tailored);
  };

  const handleAcceptTailored = (finalTailored) => {
    // The finalTailored argument might be an event object if called directly from a button without args,
    // so we check if it has the experience/skills properties we expect.
    const dataToSave = (finalTailored && finalTailored.experience) ? finalTailored : diffTailored;
    onUpdate({
      ...resumeData,
      experience: dataToSave.experience || resumeData.experience,
      skills: dataToSave.skills || resumeData.skills,
    });
    setDiffOriginal(null);
    setDiffTailored(null);
  };

  const handleRevertTailored = () => {
    setDiffOriginal(null);
    setDiffTailored(null);
  };

  return (
    <main className="flex h-[calc(100vh-72px)] overflow-hidden relative" role="main">

      {/* ── Left: Step Nav ── */}
      <FormSidebar 
        currentStep={currentStep} 
        onStepChange={onStepChange} 
        onDownloadPdf={handleDownloadPdf} 
        onDownloadDoc={handleDownloadDoc}
      />

      {/* ── Centre: Form ── */}
      <section
        className="flex-1 bg-surface-container-low overflow-y-auto custom-scrollbar p-10 lg:p-12"
        aria-label="Resume builder form"
      >
        <AnimatePresence mode="wait">
          {currentStep === 'personal' && (
            <PersonalForm key="personal"
              data={resumeData.personal}
              onChange={(personal) => onUpdate({ ...resumeData, personal })}
              onNext={goNext} />
          )}
          {currentStep === 'experience' && (
            <ExperienceForm key="experience"
              data={resumeData.experience}
              onChange={(experience) => onUpdate({ ...resumeData, experience })}
              onNext={goNext} onBack={goBack} />
          )}
          {currentStep === 'education' && (
            <EducationForm key="education"
              data={resumeData.education}
              onChange={(education) => onUpdate({ ...resumeData, education })}
              onNext={goNext} onBack={goBack} />
          )}
          {currentStep === 'skills' && (
            <SkillsForm key="skills"
              data={resumeData.skills}
              onChange={(skills) => onUpdate({ ...resumeData, skills })}
              onNext={goNext} onBack={goBack} />
          )}
          {currentStep === 'optimizer' && (
            <AIOptimizerForm key="optimizer"
              resumeData={resumeData}
              onUpdate={onUpdate}
              onBack={goBack}
              onTailorComplete={handleTailorComplete}
              onFinish={() => onStepChange('personal')} />
          )}
        </AnimatePresence>
      </section>

      {/* ── Right: Live Preview ── */}
      <aside
        className="w-[34%] h-full bg-surface-dim relative flex flex-col items-center pt-16 pb-6 px-6"
        aria-label="Live resume preview"
        style={{ borderLeft: '1px solid rgba(70,69,85,0.12)' }}
      >
        {/* ATS Score badge */}
        <ATSScoreWidget score={resumeData.atsScore} />

        {/* Template label */}
        <div className="flex items-center gap-1.5 mb-4 self-start ml-1">
          <LayoutTemplate size={13} className="text-on-surface-variant opacity-50" />
          <span className="text-[0.6rem] uppercase tracking-widest font-medium text-on-surface-variant opacity-50 capitalize">
            {resumeData.selectedTemplate || 'modern'} template
          </span>
        </div>

        {/* A4 preview — scaled to fit panel */}
        <div ref={previewContainerRef} className="w-full flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pb-10 flex justify-center">
          <div style={{ width: `${794 * scale}px`, height: `${1123 * scale}px` }}>
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
              <AnimatePresence mode="wait">
                <motion.div key={previewKey}
                  initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}>
                  <ResumePreview
                    ref={printRef}
                    resumeData={resumeData}
                    selectedTemplate={resumeData.selectedTemplate || 'modern'}
                    paperSize={paperSize}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Template Shuffler floating bar */}
        <TemplateShuffler
          selected={resumeData.selectedTemplate || 'modern'}
          onSelect={handleTemplateSelect}
        />
      </aside>
      
      <AnimatePresence>
        {diffOriginal && diffTailored && (
          <DiffPreview 
            original={diffOriginal} 
            tailored={diffTailored} 
            onAccept={handleAcceptTailored} 
            onRevert={handleRevertTailored} 
          />
        )}
      </AnimatePresence>

      {/* Job Success Modal */}
      <JobSuccessModal
        isOpen={showJobModal}
        onClose={() => setShowJobModal(false)}
        onFindJobs={() => {
          setShowJobModal(false);
          if (onNavigate) onNavigate('jobs');
        }}
      />
    </main>
  );
}
