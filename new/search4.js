import fs from 'fs';
const content = fs.readFileSync('src/AdminDashboard.jsx', 'utf8').split('\n');
content.forEach((line, idx) => {
  if (line.includes('Upload Image')) {
    console.log(`${idx + 1}: ${line}`);
  }
});
