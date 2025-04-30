const { execSync } = require('child_process');

exports.createCodespace = () => {
  try {
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || 'main';
    const machine = process.env.GITHUB_MACHINE || 'standardLinux';

    const cmd = `gh codespace create --repo ${repo} --branch ${branch} --machine ${machine} --json name,webUrl,state`;
    const output = execSync(cmd, { encoding: 'utf8' });
    const data = JSON.parse(output);

    return {
      codespaceId: data.name,
      url: data.webUrl,
      status: data.state
    };
  } catch (err) {
    console.error('GH CLI failed:', err.message);
    throw new Error(`Codespace creation failed: ${err.message}`);
  }
};
