const { execSync } = require('child_process');
const { GITHUB_BRANCH, GITHUB_MACHINE } = require('../config');

exports.createCodespace = (repo, branch, machine) => {
  const command = `gh codespace create --repo ${repo} --branch ${branch} --machine ${machine}`;
  const output = execSync(command).toString().trim();
  return { codespaceId: output, codespaceUrl: `https://codespaces.githubusercontent.com/${output}` };
};

exports.getCodespaceStatus = (name) => {
  const command = `gh codespace list --json name,state`;
  const json = JSON.parse(execSync(command).toString());
  const cs = json.find(cs => cs.name === name);
  if (!cs) throw new Error(`Codespace ${name} not found`);
  return cs.state;
};

exports.stopCodespace = (name) => {
  const command = `gh codespace stop -c ${name}`;
  return execSync(command).toString().trim();
};
