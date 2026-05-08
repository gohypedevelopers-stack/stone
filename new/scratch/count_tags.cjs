
const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\kshit\\Desktop\\code\\react\\stone\\new\\src\\components\\admin\\sections\\ProductLabelsSection.jsx', 'utf8');

const openTags = (content.match(/<div/g) || []).length;
const closeTags = (content.match(/<\/div>/g) || []).length;

console.log(`Divs: Open=${openTags}, Close=${closeTags}`);

// More detailed check for JSX balance (very basic)
let balance = 0;
const lines = content.split('\n');
lines.forEach((line, i) => {
  const opens = (line.match(/<div/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  balance += opens - closes;
  // if (balance < 0) console.log(`Unbalanced at line ${i+1}: balance=${balance}`);
});
console.log(`Final Balance=${balance}`);
