import fs from "fs";
const file = fs.readFileSync("src/AdminDashboard.jsx", "utf8");
file.split("\n").forEach((line, index) => {
  if (line.includes("newProduct.vendorId") || line.includes("newProduct.stock") || line.includes("newProduct.vendors")) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
