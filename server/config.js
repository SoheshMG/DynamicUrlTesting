const dotenv = require('dotenv');
dotenv.config();

const requiredVars = ['GITHUB_BRANCH', 'GITHUB_MACHINE'];
requiredVars.forEach((key) => {
  if (!process.env[key]) throw new Error(`${key} must be set in the .env file.`);
});

module.exports = {
  PORT: process.env.PORT || 3000,
  PREVIEW_BASE_URL: process.env.PREVIEW_BASE_URL,
  GITHUB_REPO: process.env.GITHUB_REPO,
  GITHUB_BRANCH: process.env.GITHUB_BRANCH,
  GITHUB_MACHINE: process.env.GITHUB_MACHINE,
};
