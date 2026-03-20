import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const files = [
  path.join(__dirname, 'src', 'AdminDashboard.jsx'),
  path.join(__dirname, 'src', 'components', 'HomepageManager.jsx')
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Deep purples
  content = content.replace(/stone-900/g, 'indigo-950');
  content = content.replace(/stone-800/g, 'indigo-900');
  content = content.replace(/stone-700/g, 'purple-900');
  
  // Zinc
  content = content.replace(/zinc-900/g, 'indigo-950');
  content = content.replace(/zinc-800/g, 'indigo-900');
  content = content.replace(/zinc-700/g, 'purple-900');

  // Hard black references
  content = content.replace(/bg-black/g, 'bg-[#1a0b2e]');
  content = content.replace(/to-black/g, 'to-[#0b0314]');
  content = content.replace(/from-black/g, 'from-[#1a0b2e]');
  content = content.replace(/ring-black/g, 'ring-indigo-900');
  content = content.replace(/shadow-black/g, 'shadow-indigo-950');
  content = content.replace(/text-black/g, 'text-indigo-950');
  content = content.replace(/border-black/g, 'border-indigo-900');

  // Manual hexes from previous steps (if any slipped in)
  content = content.replace(/#151515/g, '#1a0b2e');
  content = content.replace(/#0c0c0c/g, '#0b0314');

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Re-styled ${file}`);
});
