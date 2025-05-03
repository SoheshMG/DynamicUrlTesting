const { exec } = require('child_process');
const { GITHUB_REPO, GITHUB_BRANCH, GITHUB_MACHINE } = require('../config');

function createCodespace() {
  return new Promise((resolve, reject) => {
    const cmd = `gh codespace create -R ${GITHUB_REPO} -b ${GITHUB_BRANCH} -m ${GITHUB_MACHINE}`;
    console.log('[Creating Codespace] Executing:', cmd);

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error('[ERROR] Codespace creation failed:', stderr || error.message);
        return reject({ error: stderr || error.message });
      }

      console.log('[OUTPUT]', stdout);
      const lines = stdout.trim().split('\n');
      const name = lines[lines.length - 1].trim();

      if (name) {
        console.log('[Parsed Codespace Name]', name);
        resolve({ name, raw: stdout });
      } else {
        console.warn('[WARNING] Could not parse codespace name.');
        resolve({ message: 'Could not parse codespace name', raw: stdout });
      }
    });
  });
}

function getCodespaceStatus(name) {
  return new Promise((resolve, reject) => {
    const cmd = `gh codespace list --limit 100`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        return reject({ error: stderr || error.message });
      }

      const lines = stdout.trim().split('\n');
      const headers = lines[0].split(/\s{2,}/); // split on 2+ spaces
      const codespaceLine = lines.find(line => line.includes(name));

      if (!codespaceLine) {
        return resolve({ message: 'Codespace not found' });
      }

      const values = codespaceLine.split(/\s{2,}/);
      const result = {};
      headers.forEach((key, i) => {
        result[key.toLowerCase()] = values[i];
      });

      resolve(result);
    });
  });
}

function stopCodespace(name) {
  return new Promise((resolve, reject) => {
    const cmd = `gh codespace stop -c ${name}`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        return reject({ error: stderr || error.message });
      }
      resolve({ message: `Stopped codespace: ${name}`, raw: stdout });
    });
  });
}

module.exports = {
  createCodespace,
  getCodespaceStatus,
  stopCodespace,
};
