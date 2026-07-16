import { apiClient } from './apiClient.js';

export const api = {
  /** Parse DOCX (or PDF) resume via AI */
  async parseDoc(file) {
    const fd = new FormData();
    fd.append('resume', file);
    // apiClient will automatically parse error responses and handle toasts
    const data = await apiClient('/ai/parse-doc', {
      method: 'POST',
      body: fd,
    });
    return data.data; // The server returns { success: true, data: { ... } }
  },

  /** Tailor experience bullets + filter skills to a JD */
  async tailorExperience(experience, skills, jobDescription) {
    const data = await apiClient('/ai/tailor', {
      method: 'POST',
      body: JSON.stringify({ experience, skills, jobDescription }),
    });
    return data; // Returns { success, data, skills }
  },

  /** Calculate ATS score */
  async atsScore(resumeData, jobDescription) {
    const data = await apiClient('/ai/ats-score', {
      method: 'POST',
      body: JSON.stringify({ resumeData, jobDescription }),
    });
    return data; // Returns { success, score, matched, total, missingKeywords, improvements }
  },

  /** AI-powered smart skill injection */
  async organizeSkills(currentSkills, missingKeywords, jobDescription) {
    const data = await apiClient('/ai/organize-skills', {
      method: 'POST',
      body: JSON.stringify({ currentSkills, missingKeywords, jobDescription }),
    });
    return data; // Returns { success, technical }
  },

  /** Save resume to DB */
  async saveResume(localId, resumeData) {
    const data = await apiClient('/resumes/save', {
      method: 'POST',
      body: JSON.stringify({ localId, ...resumeData }),
    });
    return data.data;
  },

  /** Search jobs via SerpApi (cached on server) */
  async searchJobs(query, location) {
    const params = new URLSearchParams({ query: query.trim() });
    if (location?.trim()) params.append('location', location.trim());
    
    const data = await apiClient(`/jobs?${params.toString()}`);
    return data.data; // Returns { jobs, total, cached }
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
  selectedTemplate: 'executive', // updated default template
  lastJD: '',
  atsScore: null,
};
