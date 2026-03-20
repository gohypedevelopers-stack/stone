import fs from "fs";
const file = fs.readFileSync("src/AdminDashboard.jsx", "utf8");
file.split("\n").forEach((line, index) => {
  if (line.includes("'/admin/add-product'") || line.includes("'add-product'")) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
