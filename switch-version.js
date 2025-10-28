#!/usr/bin/env node

/**
 * Script to switch between original and modern versions of the prayer times calculator
 * Usage: node switch-version.js [original|modern]
 */

const fs = require("fs");
const path = require("path");

const VERSIONS = {
  original: "index-original.js",
  modern: "index-modern.js",
};

function switchVersion(version) {
  if (!VERSIONS[version]) {
    console.error(`❌ Invalid version: ${version}`);
    console.log("Available versions: original, modern");
    process.exit(1);
  }

  const currentFile = path.join(__dirname, "pages", "index.js");
  const targetFile = path.join(__dirname, "pages", VERSIONS[version]);

  if (!fs.existsSync(targetFile)) {
    console.error(`❌ Target file not found: ${targetFile}`);
    process.exit(1);
  }

  try {
    // Read the target version
    const content = fs.readFileSync(targetFile, "utf8");

    // Write to main index.js
    fs.writeFileSync(currentFile, content);

    console.log(`✅ Successfully switched to ${version} version`);
    console.log(`📁 Using: pages/${VERSIONS[version]}`);

    if (version === "modern") {
      console.log("\n🎨 Modern features:");
      console.log("  • Glassmorphism design");
      console.log("  • Dark/Light theme toggle");
      console.log("  • Modern UI components");
      console.log("  • Responsive design");
      console.log("  • Smooth animations");
    } else {
      console.log("\n📜 Original features:");
      console.log("  • Classic design");
      console.log("  • Basic functionality");
      console.log("  • Simple interface");
    }
  } catch (error) {
    console.error(`❌ Error switching version: ${error.message}`);
    process.exit(1);
  }
}

// Get version from command line arguments
const version = process.argv[2];

if (!version) {
  console.log("🔄 Prayer Times Calculator - Version Switcher");
  console.log("");
  console.log("Usage: node switch-version.js [original|modern]");
  console.log("");
  console.log("Versions:");
  console.log("  original  - Classic design with basic functionality");
  console.log("  modern    - Modern design with advanced features");
  console.log("");
  console.log("Examples:");
  console.log("  node switch-version.js modern");
  console.log("  node switch-version.js original");
  process.exit(0);
}

switchVersion(version);
