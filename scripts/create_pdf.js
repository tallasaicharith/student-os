const fs = require('fs');
const path = require('path');

// Simple valid PDF text generator
const sampleText = `TALLA SAI CHARITH
Software Engineer Intern | Full-Stack & AI Systems
saicharith@gmail.com | github.com/tallasaicharith | +91 98765 43210

EDUCATION
B.Tech in Computer Science & Engineering | GPA: 8.9 / 10.0 | 2022 - 2026

TECHNICAL SKILLS
Languages: C++, Python, TypeScript, JavaScript, SQL
Frameworks: React, Next.js, Node.js, Express, TailwindCSS, REST APIs
Databases & Cloud: PostgreSQL, Supabase, Prisma ORM, Docker, Git, AWS

PROJECTS
StudentOS - AI Academic & Productivity Operating System
- Built Next.js 16 full-stack app with LangChain AI Copilot and 100% Supabase DB persistence.
- Developed real-time ATS Resume Scorer parsing PDF/DOCX resumes, improving score accuracy by 40%.

C++ High-Performance Key-Value Cache Engine
- Engineered C++17 multi-threaded cache handling 50k requests/sec with 42% latency reduction.

EXPERIENCE
Software Engineering Intern | Tech Innovators Lab (2025)
- Optimized PostgreSQL database queries by 40% and built 12 Next.js serverless REST API endpoints.

ACHIEVEMENTS
- Solved 350+ LeetCode DSA problems. AWS Certified Cloud Practitioner.`;

// Minimal valid PDF structure
function createSimplePDF(text) {
  const lines = text.split('\n');
  let streamContent = 'BT /F1 10 Tf 50 750 Td 14 TL\n';
  lines.forEach(l => {
    const escaped = l.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    streamContent += `(${escaped}) Tj T*\n`;
  });
  streamContent += 'ET';

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamContent.length} >>
stream
${streamContent}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000300 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
380
%%EOF`;

  return pdf;
}

const pdfContent = createSimplePDF(sampleText);
const targetPath = path.join(__dirname, '../public/sample_resume.pdf');
fs.writeFileSync(targetPath, pdfContent);
console.log('>>> Created public/sample_resume.pdf successfully!');
