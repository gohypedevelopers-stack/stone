import fs from 'fs';
const content = fs.readFileSync('src/AdminDashboard.jsx', 'utf8').split('\n');
content.forEach((line, idx) => {
  if (idx > 500 && idx < 600 && line.includes('<img')) {
    console.log(`${idx + 1}: ${line}`);
  }
});
