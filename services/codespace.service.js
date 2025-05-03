const { execSync } = require('child_process');
const { GITHUB_REPO, GITHUB_BRANCH, GITHUB_MACHINE } = require('../config');

async function createCodespace() {
  try {
    const command = `gh codespace create -R ${GITHUB_REPO} -b ${GITHUB_BRANCH} -m ${GITHUB_MACHINE}`;
    console.log(`[Creating Codespace] Executing: ${command}`);
    const output = execSync(command, { encoding: 'utf-8' }).trim();
    return `✅ Codespace created successfully: "${output}"`;
  } catch (error) {
    return `❌ Failed to create codespace: ${error.message}`;
  }
}

async function checkStatus(codespaceName) {
  try {
    const command = `gh codespace list --json name,state`;
    const output = execSync(command, { encoding: 'utf-8' });
    const codespaces = JSON.parse(output);

    const target = codespaces.find(cs => cs.name === codespaceName);

    if (!target) {
      return `❌ No codespace found with name "${codespaceName}".`;
    }

    return `ℹ️ Codespace "${target.name}" is currently **${target.state}**.`;
  } catch (error) {
    return `❌ Failed to check codespace status: ${error.message}`;
  }
}

async function deleteCodespace(codespaceName) {
  try {
    const command = `gh codespace delete -c ${codespaceName} -f`;
    console.log(`[Deleting Codespace] Executing: ${command}`);
    execSync(command, { stdio: 'ignore' });
    return `🗑️ Codespace "${codespaceName}" deleted successfully.`;
  } catch (error) {
    return `❌ Failed to delete codespace: ${error.message}`;
  }
}

module.exports = {
  createCodespace,
  checkStatus,
  deleteCodespace,
};
