require('dotenv').config();

const { GITHUB_BRANCH, GITHUB_MACHINE, PORT } = process.env;

if (!GITHUB_BRANCH || !GITHUB_MACHINE) {
  throw new Error("GITHUB_BRANCH and GITHUB_MACHINE must be set in the .env file.");
}

module.exports = {
  GITHUB_BRANCH,
  GITHUB_MACHINE,
  PORT: PORT || 3000,
};
