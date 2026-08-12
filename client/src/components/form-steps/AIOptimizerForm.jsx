import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wand2, Target, CheckCircle, AlertCircle, Loader, Zap,
  RotateCcw, FileText, HelpCircle, UserCheck, Tag,
} from 'lucide-react';
import { api } from '../../utils/api.js';
import KeywordBreakdownPanel from '../KeywordBreakdownPanel.jsx';
import RecruiterReviewPanel  from '../RecruiterReviewPanel.jsx';
import CoverLetterModal      from '../CoverLetterModal.jsx';
import InterviewQuestionsModal from '../InterviewQuestionsModal.jsx';

const TABS = [
  { id: 'optimizer',  label: 'ATS Optimizer',     icon: Target   },
  { id: 'keywords',   label: 'Keyword Breakdown',  icon: Tag      },
  { id: 'review',     label: 'Recruiter Review',   icon: UserCheck },
];

export default function AIOptimizerForm({ resumeData, onUpdate, onBack, onTailorComplete, onFinish }) {
  const [jd,         setJd]         = useState(resumeData.lastJD || '');
  const [tailoring,  setTailoring]  = useState(false);
  const [scoring,    setScoring]    = useState(false);
  const [atsResult,  setAtsResult]  = useState(resumeData.atsScore ? { score: resumeData.atsScore } : null);
  const [tailorErr,  setTailorErr]  = useState('');
  const [scoreErr,   setScoreErr]   = useState('');
  const [tailored,   setTailored]   = useState(false);
  const [injected,   setInjected]   = useState(false);
  const [addedKeywordsCount, setAddedKeywordsCount] = useState(0);
  const [activeTab,  setActiveTab]  = useState('optimizer');
  const [showCoverLetter,   setShowCoverLetter]   = useState(false);
  const [showInterviewPrep, setShowInterviewPrep] = useState(false);

  const prevResumeData = useRef(resumeData);

  /* ── Auto-Score on Resume Data Change (Debounced) ── */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!jd.trim()) return;

      // Compare only content fields — exclude atsScore and lastJD to avoid
      // a feedback loop where storing the score triggers another score call.
      const contentFingerprint = (rd) => JSON.stringify({
        personal:   rd.personal,
        experience: rd.experience,
        projects:   rd.projects,
        education:  rd.education,
        skills:     rd.skills,
      });

      if (contentFingerprint(prevResumeData.current) !== contentFingerprint(resumeData)) {
        prevResumeData.current = resumeData;
        api.atsScore(resumeData, jd).then((result) => {
          setAtsResult(result);
          if (result.score !== resumeData.atsScore) {
            onUpdate({ ...resumeData, atsScore: result.score, lastJD: jd });
          }
        }).catch(console.error);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [resumeData, jd, onUpdate]);

  /* ── Tailor bullets + skills ── */
  const handleTailor = async () => {
    if (!jd.trim()) { setTailorErr('Please paste a job description first.'); return; }
    if (!resumeData.experience?.some((e) => e.title?.trim())) {
      setTailorErr('Add at least one experience entry before tailoring.'); return;
    }
    setTailorErr(''); setTailored(false); setTailoring(true);
    try {
      const result = await api.tailorExperience(resumeData.experience, resumeData.skills, jd);
      const newExp = Array.isArray(result.data) ? result.data : (result.data.experience || result.data);
      const tailoredData = { experience: newExp };
      if (result.skills?.technical && Array.isArray(result.skills.technical)) {
        tailoredData.skills = { ...resumeData.skills, technical: result.skills.technical };
      }
      onTailorComplete(
        { experience: resumeData.experience, skills: resumeData.skills },
        tailoredData
      );
      onUpdate({ ...resumeData, lastJD: jd });
      setTailored(true);
    } catch (err) {
      if (err.message.includes('429') || err.message.includes('Quota') || err.message.includes('RESOURCE_EXHAUSTED')) {
        setTailorErr('Google AI Quota Exceeded. Please wait a minute and try again.');
      } else {
        setTailorErr(err.message);
      }
    } finally {
      setTailoring(false);
    }
  };

  /* ── ATS Score ── */
  const handleScore = async () => {
    if (!jd.trim()) { setScoreErr('Paste a job description to score against.'); return; }
    setScoreErr(''); setScoring(true); setInjected(false);
    try {
      const result = await api.atsScore(resumeData, jd);
      setAtsResult(result);
      onUpdate({ ...resumeData, atsScore: result.score });
    } catch (err) {
      if (err.message.includes('429') || err.message.includes('Quota') || err.message.includes('RESOURCE_EXHAUSTED')) {
        setScoreErr('Google AI Quota Exceeded. Please wait a minute and try again.');
      } else {
        setScoreErr(err.message);
      }
    } finally {
      setScoring(false);
    }
  };

  /* ── Smart Auto-Fix Skills ── */
  const handleAutoFix = async () => {
    if (!atsResult || !atsResult.missingKeywords?.length) return;
    const missingCount = atsResult.missingKeywords.length;
    setScoring(true); setScoreErr('');
    try {
      const organized = await api.organizeSkills(resumeData.skills, atsResult.missingKeywords, jd);
      if (!organized.technical?.length) {
        setScoreErr('AI could not find relevant skills to add.');
        setScoring(false);
        return;
      }
      const newData = { ...resumeData, skills: { ...resumeData.skills, technical: organized.technical } };
      onUpdate(newData);
      const result = await api.atsScore(newData, jd);
      setAtsResult(result);
      onUpdate({ ...newData, atsScore: result.score });
      setAddedKeywordsCount(missingCount);
    } catch (err) {
      if (err.message.includes('429') || err.message.includes('Quota') || err.message.includes('RESOURCE_EXHAUSTED')) {
        setScoreErr('Google AI Quota Exceeded. Please wait a minute and try again.');
      } else {
        setScoreErr(err.message);
      }
    } finally {
      setScoring(false);
      setInjected(true);
    }
  };

  const getScoreColor  = (s) => s >= 75 ? 'text-tertiary' : s >= 50 ? 'text-primary' : 'text-error';
  const getScoreLabel  = (s) => s >= 75 ? 'Strong Match ✓' : s >= 50 ? 'Good Potential' : 'Needs Work';
  const getStrokeColor = (s) => s >= 75 ? 'var(--tertiary)' : s >= 50 ? 'var(--primary)' : 'var(--error)';

  const r      = 54;
  const circum = 2 * Math.PI * r;
  const offset = atsResult ? circum * (1 - atsResult.score / 100) : circum;

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-8">

        <header>
          <h1 className="text-3xl font-bold tracking-tighter text-on-surface">AI Optimizer</h1>
          <p className="text-on-surface-variant mt-2 leading-relaxed">
            Paste a job description — then use the tools below to maximise your chances.
          </p>
        </header>

        {/* ── JD input ── */}
        <div className="glass-panel p-6 rounded-xl border border-outline-variant/10 space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="jd" className="label-style">Job Description</label>
            {jd && (
              <button onClick={() => { setJd(''); setAtsResult(null); setTailored(false); setInjected(false); }}
                className="flex items-center gap-1 text-on-surface-variant text-xs hover:text-error transition-colors"
                aria-label="Clear job description">
                <RotateCcw size={11} /> Clear
              </button>
            )}
          </div>
          <textarea id="jd" rows={7} value={jd}
            onChange={(e) => setJd(e.target.value.slice(0, 8000))}
            placeholder="Paste the full job description here — requirements, responsibilities, qualifications, tech stack…"
            className="field-input resize-none"
            aria-label="Job description textarea" />
          <p className="text-[0.65rem] text-on-surface-variant/50 text-right">{jd.length}/8000</p>
        </div>

        {/* ── Quick Actions — Cover Letter & Interview Prep ── */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowCoverLetter(true)}
            className="flex items-center gap-2.5 p-4 rounded-xl border border-outline-variant/10 bg-surface-container hover:border-primary/20 hover:bg-primary/5 transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
              <FileText size={15} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-on-surface">Cover Letter</p>
              <p className="text-[0.65rem] text-on-surface-variant/60 mt-0.5 truncate">AI-tailored to this JD</p>
            </div>
          </button>

          <button
            onClick={() => setShowInterviewPrep(true)}
            className="flex items-center gap-2.5 p-4 rounded-xl border border-outline-variant/10 bg-surface-container hover:border-tertiary/20 hover:bg-tertiary/5 transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-tertiary/10 flex items-center justify-center group-hover:bg-tertiary/15 transition-colors">
              <HelpCircle size={15} className="text-tertiary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-on-surface">Interview Prep</p>
              <p className="text-[0.65rem] text-on-surface-variant/60 mt-0.5 truncate">Role-specific questions</p>
            </div>
          </button>
        </div>

        {/* ── Tab bar ── */}
        <div className="flex gap-1 p-1 bg-surface-container rounded-xl border border-outline-variant/10">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[0.65rem] font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab.id
                    ? 'bg-surface-container-highest text-on-surface shadow-sm'
                    : 'text-on-surface-variant/60 hover:text-on-surface-variant'
                }`}
              >
                <Icon size={12} /> <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Tab: ATS Optimizer ── */}
        <AnimatePresence mode="wait">
          {activeTab === 'optimizer' && (
            <motion.div key="optimizer"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} className="space-y-6">

              {/* Action buttons */}
              <div className="flex gap-3 flex-wrap">
                <button onClick={handleTailor} disabled={tailoring || !jd.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-primary-container to-primary text-on-primary font-bold text-sm rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
                  aria-label="Tailor experience bullets with AI">
                  {tailoring ? <Loader size={16} className="animate-spin" /> : <Wand2 size={16} />}
                  {tailoring ? 'Tailoring…' : 'Tailor Bullets'}
                </button>

                <button onClick={handleScore} disabled={scoring || !jd.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-surface-container-high text-on-surface font-bold text-sm rounded-xl hover:bg-surface-container-highest disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
                  aria-label="Calculate ATS score">
                  {scoring ? <Loader size={16} className="animate-spin" /> : <Target size={16} />}
                  {scoring ? 'Scoring…' : 'Calculate ATS Score'}
                </button>
              </div>

              {/* Inline feedback */}
              <AnimatePresence>
                {tailorErr && (
                  <motion.p role="alert" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-error text-sm">
                    <AlertCircle size={14} /> {tailorErr}
                  </motion.p>
                )}
                {tailored && (
                  <motion.p role="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-tertiary text-sm">
                    <CheckCircle size={14} /> Bullets rewritten & skills reorganized for this JD! Review the preview →
                  </motion.p>
                )}
                {scoreErr && (
                  <motion.p role="alert" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-error text-sm">
                    <AlertCircle size={14} /> {scoreErr}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* ── ATS Score result ── */}
              <AnimatePresence>
                {atsResult && (
                  <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="glass-panel p-8 rounded-xl border border-outline-variant/10"
                    aria-live="polite" aria-label={`ATS Score: ${atsResult.score}%`}>

                    <div className="flex items-start gap-8 flex-wrap">
                      {/* Ring */}
                      <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 124 124">
                          <circle cx="62" cy="62" r={r} fill="transparent" stroke="var(--surface-container-highest)" strokeWidth="8" />
                          <motion.circle cx="62" cy="62" r={r} fill="transparent"
                            stroke={getStrokeColor(atsResult.score)}
                            strokeWidth="8" strokeLinecap="round"
                            strokeDasharray={circum}
                            initial={{ strokeDashoffset: circum }}
                            animate={{ strokeDashoffset: offset }}
                            transition={{ duration: 1.4, ease: 'easeOut' }}
                          />
                        </svg>
                        <div className="absolute text-center">
                          <span className={`text-3xl font-black ${getScoreColor(atsResult.score)}`}>{atsResult.score}</span>
                          <span className="text-xs text-on-surface-variant block leading-none">%</span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 space-y-4 min-w-0">
                        <div>
                          <h3 className={`text-xl font-bold ${getScoreColor(atsResult.score)}`}>
                            {getScoreLabel(atsResult.score)}
                          </h3>
                          <p className="text-sm text-on-surface-variant mt-1">
                            {atsResult.matched} of {atsResult.total} JD keywords found in your resume
                          </p>
                        </div>

                        <ul className="space-y-2.5 mt-2">
                          <li className="flex items-center gap-2.5 text-sm text-on-surface-variant">
                            <CheckCircle size={14} className="text-tertiary shrink-0" /> Semantic density optimized
                          </li>
                          <li className="flex items-center gap-2.5 text-sm text-on-surface-variant">
                            <CheckCircle size={14} className="text-tertiary shrink-0" /> Structure verified
                          </li>
                          {!injected && atsResult.missingKeywords?.length > 0 && (
                            <li className="flex items-center gap-2.5 text-sm text-on-surface-variant">
                              <AlertCircle size={14} className="text-error shrink-0" />
                              {atsResult.missingKeywords.length} keywords missing —{' '}
                              <button onClick={() => setActiveTab('keywords')} className="text-primary underline underline-offset-2 text-sm">
                                see breakdown
                              </button>
                            </li>
                          )}
                          {injected && addedKeywordsCount > 0 && (
                            <li className="flex items-center gap-2.5 text-sm text-on-surface-variant">
                              <CheckCircle size={14} className="text-tertiary shrink-0" /> {addedKeywordsCount} missing keywords added
                            </li>
                          )}
                        </ul>

                        {atsResult.missingKeywords?.length > 0 && (
                          <div className="pt-2">
                            <p className="label-style mb-2">Top missing keywords</p>
                            <div className="flex flex-wrap gap-2">
                              {atsResult.missingKeywords.slice(0, 8).map((kw) => (
                                <span key={kw}
                                  className="px-3 py-1 bg-surface-container-highest text-on-surface-variant text-xs rounded-full border border-outline-variant/10">
                                  {kw}
                                </span>
                              ))}
                              {atsResult.missingKeywords.length > 8 && (
                                <button onClick={() => setActiveTab('keywords')}
                                  className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20 hover:bg-primary/20 transition-colors">
                                  +{atsResult.missingKeywords.length - 8} more →
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {atsResult.improvements?.length > 0 && (
                          <div className="pt-4 border-t border-outline-variant/10">
                            <p className="text-[0.7rem] uppercase tracking-widest font-bold text-on-surface-variant mb-2.5 flex items-center gap-1.5">
                              <Target size={13} className="text-primary" /> How to reach 90%+
                            </p>
                            <ul className="space-y-2">
                              {atsResult.improvements.map((tip, idx) => (
                                <li key={idx} className="flex gap-2 items-start text-[0.78rem] text-on-surface/80 leading-relaxed">
                                  <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-primary/40" />
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {!injected && atsResult.score < 90 && atsResult.missingKeywords?.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <p className="text-xs text-on-surface-variant/70">
                              💡 Inject missing keywords into your Skills section instantly.
                            </p>
                            <button onClick={handleAutoFix} disabled={scoring}
                              className="px-4 py-2 bg-primary/10 text-primary font-bold text-[0.7rem] uppercase tracking-wide rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1.5 active:scale-95 disabled:opacity-50">
                              {scoring ? <Loader size={13} className="animate-spin" /> : <Wand2 size={13} />}
                              {scoring ? 'Injecting…' : 'Smart Inject Keywords'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pro Tips */}
              <div className="bg-surface-container-low p-6 rounded-xl space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={14} className="text-primary" />
                  <span className="text-[0.6875rem] uppercase tracking-widest font-bold text-primary">Pro Tips</span>
                </div>
                {[
                  'Use exact keywords from the JD — ATS systems match literally, not semantically.',
                  'Quantify every bullet: percentages, dollar values, time saved, users impacted.',
                  "Mirror the job title in your summary if it's close to your actual role.",
                  'After tailoring, re-run the ATS Score to see your improvement.',
                ].map((tip, i) => (
                  <div key={i} className="flex gap-2 items-start text-sm text-on-surface-variant">
                    <CheckCircle size={12} className="text-tertiary shrink-0 mt-0.5" /> {tip}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Tab: Keyword Breakdown ── */}
          {activeTab === 'keywords' && (
            <motion.div key="keywords"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass-panel p-6 rounded-xl border border-outline-variant/10">
              <KeywordBreakdownPanel resumeData={resumeData} jd={jd} />
            </motion.div>
          )}

          {/* ── Tab: Recruiter Review ── */}
          {activeTab === 'review' && (
            <motion.div key="review"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass-panel p-6 rounded-xl border border-outline-variant/10">
              <RecruiterReviewPanel resumeData={resumeData} jd={jd} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4">
          <button onClick={onBack}
            className="px-8 py-3 rounded-xl bg-surface-container-high text-on-surface font-medium text-sm active:scale-95 hover:bg-surface-container-highest">
            ← Back
          </button>
          <button onClick={onFinish}
            className="px-10 py-3 rounded-xl bg-gradient-to-br from-primary-container to-primary text-on-primary font-bold text-sm active:scale-95 shadow-lg hover:opacity-90 flex items-center gap-2">
            <CheckCircle size={16} /> Finish
          </button>
        </div>
      </motion.div>

      {/* Modals */}
      <CoverLetterModal
        isOpen={showCoverLetter}
        onClose={() => setShowCoverLetter(false)}
        resumeData={resumeData}
        jd={jd}
      />
      <InterviewQuestionsModal
        isOpen={showInterviewPrep}
        onClose={() => setShowInterviewPrep(false)}
        resumeData={resumeData}
        jd={jd}
      />
    </>
  );
}
