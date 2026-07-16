import dotenv from 'dotenv';
dotenv.config();

import fetch from 'node-fetch';

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

async function runTests() {
  console.log('--- Starting Backend Tests ---');
  let allPassed = true;

  // 1. Health Check
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    if (data.status === 'ok') {
      console.log('✅ Health check passed');
    } else {
      console.error('❌ Health check failed', data);
      allPassed = false;
    }
  } catch (err) {
    console.error('❌ Health check error:', err.message);
    allPassed = false;
  }

  // 2. ATS Score Test
  try {
    const res = await fetch(`${BASE_URL}/ai/ats-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resumeData: { experience: [{ title: 'Software Engineer', bullets: ['Built a web app with React'] }] },
        jobDescription: 'Looking for a Software Engineer with React experience.'
      })
    });
    const data = await res.json();
    if (data.success && typeof data.score === 'number') {
      console.log('✅ ATS Score passed (Score: ' + data.score + ')');
    } else {
      console.error('❌ ATS Score failed', data);
      allPassed = false;
    }
  } catch (err) {
    console.error('❌ ATS Score error:', err.message);
    allPassed = false;
  }

  // 3. Organize Skills Test
  try {
    const res = await fetch(`${BASE_URL}/ai/organize-skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentSkills: { technical: ['Languages: JavaScript'] },
        missingKeywords: ['React', 'Node.js']
      })
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.technical)) {
      console.log('✅ Organize Skills passed');
    } else {
      console.error('❌ Organize Skills failed', data);
      allPassed = false;
    }
  } catch (err) {
    console.error('❌ Organize Skills error:', err.message);
    allPassed = false;
  }

  if (allPassed) {
    console.log('--- All Tests Passed! ---');
  } else {
    console.log('--- Some Tests Failed ---');
  }
}

runTests();
