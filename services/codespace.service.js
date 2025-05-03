const { exec } = require('child_process');
const { GITHUB_REPO, GITHUB_BRANCH, GITHUB_MACHINE } = process.env;

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        return reject({ error: error.message, stderr });
      }
      resolve(stdout.trim());
    });
  });
}

async function createCodespace({ repo = GITHUB_REPO, branch = GITHUB_BRANCH, machine = GITHUB_MACHINE }) {
  const command = `gh codespace create --repo ${repo} --branch ${branch} --machine ${machine}`;
  const output = await runCommand(command);

  const match = output.match(/name:\s+(\S+)/i);
  const codespaceId = match ? match[1] : null;

  return { output, codespaceId };
}

async function getStatus(codespaceId) {
  const command = `gh codespace list`;
  const output = await runCommand(command);
  const lines = output.split('\n').filter(line => line.includes(codespaceId));
  return { output: lines.join('\n') || 'No match found' };
}

async function stopCodespace(codespaceId) {
  const command = `gh codespace stop -c ${codespaceId}`;
  const output = await runCommand(command);
  return { output };
}

module.exports = {
  createCodespace,
  getStatus,
  stopCodespace,
};
