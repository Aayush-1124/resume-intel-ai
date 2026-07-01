const BASE = '/api';

export const api = {
  /** Parse DOCX (or PDF) resume via AI */
  async parseDoc(file) {
    const fd = new FormData();
    fd.append('resume', file);
    const res = await fetch(`${BASE}/ai/parse-doc`, { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Document parse failed');
    return data;
  },

  /** Tailor experience bullets + filter skills to a JD */
  async tailorExperience(experience, skills, jobDescription) {
    const res = await fetch(`${BASE}/ai/tailor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ experience, skills, jobDescription }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Tailor failed');
    return data;
  },

  /** Calculate ATS score */
  async atsScore(resumeData, jobDescription) {
    const res = await fetch(`${BASE}/ai/ats-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeData, jobDescription }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'ATS score failed');
    return data;
  },

  /** AI-powered smart skill injection */
  async organizeSkills(currentSkills, missingKeywords, jobDescription) {
    const res = await fetch(`${BASE}/ai/organize-skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentSkills, missingKeywords, jobDescription }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Skill organization failed');
    return data;
  },

  /** Save resume to DB */
  async saveResume(localId, resumeData) {
    const res = await fetch(`${BASE}/resumes/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ localId, ...resumeData }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Save failed');
    return data;
  },

  /** Search jobs via SerpApi (cached on server) */
  async searchJobs(query, location) {
    const params = new URLSearchParams({ query });
    if (location?.trim()) params.append('location', location.trim());
    const res = await fetch(`${BASE}/jobs?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Job search failed');
    return data;
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
  education: [],
  skills: {
    technical: [],
    soft: [],
    languages: [],
    certifications: [],
  },
  selectedTemplate: 'modern',
  lastJD: '',
  atsScore: null,
};
