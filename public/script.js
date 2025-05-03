let lastId = '';

document.getElementById('createForm').onsubmit = async (e) => {
  e.preventDefault();
  const repo = e.target.repo.value;
  setOutput("Creating codespace...");
  try {
    const res = await fetch('/api/codespace/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repo })
    });
    const data = await res.json();
    if (data.result?.name) {
      lastId = data.result.name;
    }
    setOutput(data);
  } catch (err) {
    setOutput({ error: err.message });
  }
};

async function checkStatus() {
  if (!lastId) return setOutput("No codespace created yet.");
  setOutput("Checking status...");
  try {
    const res = await fetch(`/api/codespace/status/${lastId}`);
    const data = await res.json();
    setOutput(data);
  } catch (err) {
    setOutput({ error: err.message });
  }
}

async function stopCodespace() {
  if (!lastId) return setOutput("No codespace created yet.");
  setOutput("Stopping codespace...");
  try {
    const res = await fetch(`/api/codespace/stop/${lastId}`, { method: 'DELETE' });
    const data = await res.json();
    setOutput(data);
  } catch (err) {
    setOutput({ error: err.message });
  }
}

function setOutput(data) {
  document.getElementById('output').textContent =
    typeof data === 'string' ? data : JSON.stringify(data, null, 2);
}
