const { execSync } = require('child_process');
const { GITHUB_REPO, GITHUB_BRANCH, GITHUB_MACHINE } = require('../config');

// Force start dev container and execute startup.sh
function triggerDevContainer(name) {
  try {
    console.log(`[Dev Container] Forcing container start via SSH for "${name}"...`);
    
    // First ensure the Codespace is fully started
    execSync(`gh codespace ssh -c ${name} -- -T "echo 'Testing connection'"`, { 
      stdio: 'pipe',
      encoding: 'utf-8'
    });
    
    // Then explicitly run the startup script
    console.log(`[Dev Container] Running startup script for "${name}"...`);
    execSync(`gh codespace ssh -c ${name} -- "cd /workspaces/AI-Pundit-Preview && bash .devcontainer/scripts/startup.sh"`, {
      stdio: 'pipe',
      encoding: 'utf-8'
    });
    
    return true;
  } catch (err) {
    console.error(`[Dev Container] Failed to force start dev container:`, err.message);
    return false;
  }
}

// Wait for services to become ready (check if processes are running)
function waitForServices(name, maxAttempts = 12, delay = 5000) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      // Check if Vite server is running
      const viteCheck = execSync(`gh codespace ssh -c ${name} -- "pgrep -f 'vite'"`, {
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      
      // Check if backend server is running
      const backendCheck = execSync(`gh codespace ssh -c ${name} -- "pgrep -f 'server.js'"`, {
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      
      // If both processes are running, services are ready
      if (viteCheck.trim().length > 0 && backendCheck.trim().length > 0) {
        console.log(`[Dev Container] "${name}" services are now active.`);
        return true;
      }
    } catch {
      console.log(`[Dev Container] Waiting for "${name}" services to be ready... (${i + 1}/${maxAttempts})`);
    }
    
    // Sleep using Atomics.wait for more reliable waiting in Node.js
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delay);
  }
  
  console.warn(`[Dev Container] "${name}" services did not start after ${maxAttempts} attempts.`);
  return false;
}

// Create Codespace function
function create() {
  try {
    const cmd = `gh codespace create -R ${GITHUB_REPO} -b ${GITHUB_BRANCH} -m ${GITHUB_MACHINE}`;
    console.log(`[Creating Codespace] Executing: ${cmd}`);
    const output = execSync(cmd, { encoding: 'utf-8' }).trim();
    
    // Wait a moment for the Codespace to initialize
    console.log(`[Codespace] Waiting for "${output}" to initialize...`);
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10000);
    
    // Trigger dev container and run startup script
    const triggered = triggerDevContainer(output);
    
    // Wait for services to actually start
    const active = triggered ? waitForServices(output) : false;
    
    return {
      message: active
        ? `✅ Codespace created and services are active: "${output}"`
        : `⚠️ Codespace created but services may not be fully active yet: "${output}"`,
      codespace: output
    };
  } catch (err) {
    console.error('[ERROR] Codespace creation failed:', err.message);
    return { message: `❌ Failed to create codespace: ${err.message}` };
  }
}

// Check if services are running
function checkServices(name) {
  try {
    const viteCheck = execSync(`gh codespace ssh -c ${name} -- "pgrep -f 'vite' || echo ''"`, { 
      encoding: 'utf-8' 
    });
    const syncCheck = execSync(`gh codespace ssh -c ${name} -- "pgrep -f 'file-sync-service.js' || echo ''"`, { 
      encoding: 'utf-8' 
    });
    const backendCheck = execSync(`gh codespace ssh -c ${name} -- "pgrep -f 'server.js' || echo ''"`, { 
      encoding: 'utf-8' 
    });
    
    return {
      vite: viteCheck.trim().length > 0,
      fileSync: syncCheck.trim().length > 0,
      backend: backendCheck.trim().length > 0
    };
  } catch (err) {
    console.warn(`[Service Check] "${name}" service check failed:`, err.message);
    return { vite: false, fileSync: false, backend: false };
  }
}

// Check Codespace Status
function checkStatus(name) {
  try {
    const listJson = execSync(`gh codespace list --json name,state`, { encoding: 'utf-8' });
    const list = JSON.parse(listJson);
    const codespace = list.find(c => c.name === name);
    
    if (!codespace) return { message: `❌ No codespace named "${name}" found.` };
    
    // Check services status
    const services = checkServices(name);
    const servicesStatus = Object.entries(services)
      .map(([name, active]) => `${name}: ${active ? '✅' : '❌'}`)
      .join(', ');
    
    return {
      message: `✅ Codespace "${name}" is in "${codespace.state}" state.\nServices: ${servicesStatus}`
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