import fs from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

async function testParse() {
  console.log('Testing /api/ai/parse-doc');
  
  // Create a dummy PDF to upload
  fs.writeFileSync('dummy.pdf', '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 45 >>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(This is a test resume with some text) Tj\nET\nendstream\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');

  try {
    const fd = new FormData();
    fd.append('resume', fs.createReadStream('dummy.pdf'));
    
    const res = await fetch(`${BASE_URL}/ai/parse-doc`, {
      method: 'POST',
      body: fd
    });
    
    const data = await res.json();
    console.log('Parse Doc Response Status:', res.status);
    if (data.success && data.data && typeof data.data === 'object') {
      console.log('✅ Parse Doc returned success with data:', Object.keys(data.data));
    } else {
      console.log('❌ Parse Doc failed:', data);
    }
  } catch (err) {
    console.log('❌ Parse Doc error:', err.message);
  } finally {
    fs.unlinkSync('dummy.pdf');
  }
}

testParse();
