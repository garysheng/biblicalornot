const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const outputPath = path.join(__dirname, 'env.js');

// Default content if .env is missing or invalid
let outputContent = `const PROCESS_ENV = { PERPLEXITY_API_KEY: "" };`;

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    // Simple parsing for PERPLEXITY_API_KEY
    const match = envContent.match(/PERPLEXITY_API_KEY=(.*)/);
    if (match && match[1]) {
        const key = match[1].trim();
        outputContent = `const PROCESS_ENV = { PERPLEXITY_API_KEY: "${key}" };`;
        console.log('Successfully generated env.js from .env');
    } else {
        console.warn('PERPLEXITY_API_KEY not found in .env');
    }
} else {
    console.warn('.env file not found, generating empty env.js');
}

fs.writeFileSync(outputPath, outputContent);
