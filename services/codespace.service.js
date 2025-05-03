const { execSync } = require('child_process');
const { GITHUB_REPO, GITHUB_BRANCH, GITHUB_MACHINE } = require('../config');

// Create Codespace
function create() {
  try {
    const cmd = `gh codespace create -R ${GITHUB_REPO} -b ${GITHUB_BRANCH} -m ${GITHUB_MACHINE}`;
    console.log(`[Creating Codespace] Executing: ${cmd}`);
    const output = execSync(cmd, { encoding: 'utf-8' }).trim();
    return { message: `✅ Codespace created: "${output}"` };
  } catch (err) {
    console.error('[ERROR] Codespace creation failed:', err.message);
    return { message: `❌ Failed to create codespace: ${err.message}` };
  }
}

// Check if dev container is active
function isDevContainerActive(name) {
  try {
    const result = execSync(`gh codespace ssh -c ${name} --command "ls"`, { encoding: 'utf-8' });
    return result.trim().length > 0;
  } catch (err) {
    console.warn(`[Dev Container Check] "${name}" inactive or unreachable:`, err.message);
    return false;
  }
}

// Check Codespace Status
function checkStatus(name) {
  try {
    const listJson = execSync(`gh codespace list --json name,state`, { encoding: 'utf-8' });
    const list = JSON.parse(listJson);
    const codespace = list.find(c => c.name === name);
    if (!codespace) return { message: `❌ No codespace named "${name}" found.` };

    const active = isDevContainerActive(name);
    return {
      message: `✅ Codespace "${name}" is in "${codespace.state}" state.\nDev Container Active: ${active ? '✅ Yes' : '❌ No'}`
    };
  } catch (err) {
    return { message: `❌ Failed to check status: ${err.message}` };
  }
}

// Stop/Delete Codespace
function stop(name) {
  try {
    const cmd = `gh codespace delete -c ${name} -f`;
    console.log(`[Deleting Codespace] Executing: ${cmd}`);
    execSync(cmd, { stdio: 'ignore' });
    return { message: `🗑️ Codespace "${name}" deleted successfully.` };
  } catch (err) {
    console.error('[ERROR] Failed to delete codespace:', err.message);
    return { message: `❌ Failed to delete codespace: ${err.message}` };
  }
}

module.exports = { create, checkStatus, stop };
