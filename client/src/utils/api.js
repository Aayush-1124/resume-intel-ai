import { apiClient } from './apiClient.js';

export const api = {
  /** Parse DOCX (or PDF) resume via AI */
  async parseDoc(file) {
    const fd = new FormData();
    fd.append('resume', file);
    const data = await apiClient('/ai/parse-doc', { method: 'POST', body: fd });
    return data.data;
  },

  /** Tailor experience bullets + filter skills to a JD */
  async tailorExperience(experience, skills, jobDescription) {
    const data = await apiClient('/ai/tailor', {
      method: 'POST',
      body: JSON.stringify({ experience, skills, jobDescription }),
    });
    return data;
  },

  /** Calculate ATS score */
  async atsScore(resumeData, jobDescription) {
    const data = await apiClient('/ai/ats-score', {
      method: 'POST',
      body: JSON.stringify({ resumeData, jobDescription }),
    });
    return data;
  },

  /** AI-powered smart skill injection */
  async organizeSkills(currentSkills, missingKeywords, jobDescription) {
    const data = await apiClient('/ai/organize-skills', {
      method: 'POST',
      body: JSON.stringify({ currentSkills, missingKeywords, jobDescription }),
    });
    return data;
  },

  /**
   * Keyword explanation breakdown — no AI needed, pure taxonomy matching.
   * Returns { matched: { Languages: [{keyword, why}], ... }, missing: {...} }
   */
  async keywordExplain(resumeData, jobDescription) {
    const data = await apiClient('/ai/keyword-explain', {
      method: 'POST',
      body: JSON.stringify({ resumeData, jobDescription }),
    });
    return data;
  },

  /**
   * AI Recruiter Review — qualitative, human-like feedback.
   * Returns { overallVerdict, score, sections, redFlags, greenFlags, topPriority }
   */
  async recruiterReview(resumeData, jobDescription = '') {
    const data = await apiClient('/ai/recruiter-review', {
      method: 'POST',
      body: JSON.stringify({ resumeData, jobDescription }),
    });
    return data;
  },

  /**
   * Cover Letter Generator.
   * tone: 'professional' | 'enthusiastic' | 'concise'
   * Returns { subject, body, highlights }
   */
  async coverLetter(resumeData, jobDescription, tone = 'professional') {
    const data = await apiClient('/ai/cover-letter', {
      method: 'POST',
      body: JSON.stringify({ resumeData, jobDescription, tone }),
    });
    return data;
  },

  /**
   * Interview Question Generator.
   * Returns { behavioral, technical, roleSpecific, questionsToAsk }
   */
  async interviewQuestions(resumeData, jobDescription) {
    const data = await apiClient('/ai/interview-questions', {
      method: 'POST',
      body: JSON.stringify({ resumeData, jobDescription }),
    });
    return data;
  },

  /** Save resume to DB (with optional versionLabel for named snapshots) */
  async saveResume(localId, resumeData, versionLabel = '') {
    const data = await apiClient('/resumes/save', {
      method: 'POST',
      body: JSON.stringify({ localId, versionLabel, ...resumeData }),
    });
    return data.data;
  },

  /** Get resume version list (summaries) */
  async getVersions(localId) {
    const data = await apiClient(`/resumes/${localId}/versions`);
    return data.data; // [{ _id, savedAt, label }]
  },

  /** Get a specific version's full snapshot */
  async getVersion(localId, versionId) {
    const data = await apiClient(`/resumes/${localId}/versions/${versionId}`);
    return data.data; // { _id, savedAt, label, snapshot }
  },

  /** Rename a version label */
  async labelVersion(localId, versionId, label) {
    await apiClient(`/resumes/${localId}/versions/${versionId}/label`, {
      method: 'PATCH',
      body: JSON.stringify({ label }),
    });
  },

  /** Search jobs via SerpApi (cached on server) */
  async searchJobs(query, location) {
    const params = new URLSearchParams({ query: query.trim() });
    if (location?.trim()) params.append('location', location.trim());
    const data = await apiClient(`/jobs?${params.toString()}`);
    return data.data;
  },
};

export const defaultResume = {
  personal: {
    fullName: '',
    role: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    summary: '',
  },
  experience: [],
  projects: [],
  education: [],
  skills: {
    technical: [],
    soft: [],
    languages: [],
    certifications: [],
  },
  selectedTemplate: 'executive',
  lastJD: '',
  atsScore: null,
};
