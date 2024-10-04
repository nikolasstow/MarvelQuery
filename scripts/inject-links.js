const fs = require('fs');
const path = require('path');

// Define the base URL to inject
const baseUrl = "https://github.com/nikolasstow/MarvelQuery/blob/rewrite/docs/";

// Get the path to the 'lib' folder relative to the script
const libDirectory = path.join(__dirname, '..', 'lib');

// Function to recursively find all files in a directory
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(file => {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

// Function to inject URLs into files
function injectUrlsInFiles(files) {
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Replace relative URLs in the pattern [****](****) with the full URL
    content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, relativeUrl) => {
      // Only inject if it's not already a full URL with the baseUrl
      if (!relativeUrl.startsWith(baseUrl)) {
        // Check if the relativeUrl is not an absolute URL (doesn't start with http or https)
        if (!relativeUrl.startsWith('http')) {
          return `[${text}](${baseUrl}${relativeUrl})`;
        }
      }
      return match; // Leave unchanged if it's already a full URL or starts with baseUrl
    });
    
    fs.writeFileSync(file, content);
    console.log(`Injected URLs into ${file}`);
  });
}

// Get all files in the lib directory
const files = getAllFiles(libDirectory);

// Inject URLs into each file
injectUrlsInFiles(files);