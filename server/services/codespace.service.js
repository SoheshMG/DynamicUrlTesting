// server/services/codespace.service.js
const { execSync } = require('child_process');

exports.createCodespace = (repo, branch = 'main', machine = 'standardLinux') => {
  try {
    // Fallbacks in case user sends empty strings
    branch = branch?.trim() || 'main';
    machine = machine?.trim() || 'standardLinux';

    if (!repo) {
      throw new Error('Repository name is required');
    }

    const cmd = `gh codespace create --repo ${repo} --branch ${branch} --machine ${machine} --json name,webUrl,state`;
    console.log('[Create Codespace] Running:', cmd); // Optional: Debug log

    const output = execSync(cmd, { encoding: 'utf8' });
    const data = JSON.parse(output);

    return {
      codespaceId: data.name,
      url: data.webUrl,
      status: data.state
    };
  } catch (err) {
    throw new Error('Codespace creation failed: ' + err.message);
  }
};

exports.getCodespaceStatus = (name) => {
  try {
    if (!name) throw new Error('Codespace name is required');

    const cmd = `gh codespace list --json name,state,webUrl --jq '.[] | select(.name == "${name}")'`;
    console.log('[Status Check] Running:', cmd); // Optional: Debug log

    const output = execSync(cmd, { encoding: 'utf8' });
    const data = JSON.parse(output);

    return {
      name: data.name,
      status: data.state,
      url: data.webUrl
    };
  } catch (err) {
    throw new Error('Failed to fetch codespace status: ' + err.message);
  }
};

exports.stopCodespace = (name) => {
  try {
    if (!name) throw new Error('Codespace name is required');

    const cmd = `gh codespace stop -c ${name}`;
    console.log('[Stop Codespace] Running:', cmd); // Optional: Debug log

    execSync(cmd, { stdio: 'inherit' });
    return { message: `Codespace ${name} stopped successfully.` };
  } catch (err) {
    throw new Error('Failed to stop codespace: ' + err.message);
  }
};
