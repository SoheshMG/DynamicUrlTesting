const { execSync } = require('child_process');
const { GITHUB_REPO, GITHUB_BRANCH, GITHUB_MACHINE } = require('../config');

function runCommand(command) {
  return execSync(command, { encoding: 'utf-8' });
}

exports.createCodespace = () => {
  try {
    const command = `gh codespace create -R ${GITHUB_REPO} -b ${GITHUB_BRANCH} -m ${GITHUB_MACHINE}`;
    console.log('[Creating Codespace] Executing:', command);
    const output = runCommand(command).trim();
    return `✅ Codespace created successfully!\nName: ${output}`;
  } catch (err) {
    console.error('[ERROR] Codespace creation failed:', err.message);
    throw new Error('❌ Failed to create codespace: ' + err.message);
  }
};

exports.checkStatus = (name) => {
  try {
    const command = `gh codespace list --limit 10`;
    const output = runCommand(command);
    const lines = output.split('\n').filter(Boolean);
    const match = lines.find(line => line.includes(name));

    if (!match) {
      return `⚠️ No codespace found with name "${name}".`;
    }

    const [displayName, state, ...rest] = match.trim().split(/\s+/);
    return `ℹ️ Codespace "${displayName}" is currently "${state}".`;
  } catch (err) {
    console.error('[ERROR] Status check failed:', err.message);
    throw new Error('❌ Failed to check status: ' + err.message);
  }
};

exports.deleteCodespace = (name) => {
  try {
    const command = `gh codespace delete -c ${name} --force`;
    console.log('[Deleting Codespace] Executing:', command);
    runCommand(command);
    return `🗑️ Codespace "${name}" has been deleted successfully.`;
  } catch (err) {
    console.error('[ERROR] Codespace deletion failed:', err.message);
    throw new Error('❌ Failed to delete codespace: ' + err.message);
  }
};
