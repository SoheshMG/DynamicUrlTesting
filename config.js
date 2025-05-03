require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  GITHUB_REPO: process.env.GITHUB_REPO,
  GITHUB_BRANCH: process.env.GITHUB_BRANCH,
  GITHUB_MACHINE: process.env.GITHUB_MACHINE,
};
