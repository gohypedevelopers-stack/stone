import fs from "fs";
const file = fs.readFileSync("src/AdminDashboard.jsx", "utf8");
file.split("\n").forEach((line, index) => {
  if (line.includes("Button type=\"submit\"") || line.includes("Add Vendor") || line.includes("Submit") || line.includes("{loading ? 'Saving...' : 'Add Product'}")) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
