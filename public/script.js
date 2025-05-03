let lastId = '';

document.getElementById('createForm').onsubmit = async (e) => {
  e.preventDefault();
  const res = await fetch('/api/codespace/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  const match = data.message.match(/"([^"]+)"/);
  if (match) lastId = match[1];
  document.getElementById('output').textContent = data.message;
};

async function checkStatus() {
  if (!lastId) return alert('❗ No codespace created yet.');
  const res = await fetch(`/api/codespace/status/${lastId}`);
  const data = await res.json();
  document.getElementById('output').textContent = data.message;
}

async function stopCodespace() {
  if (!lastId) return alert('❗ No codespace created yet.');
  const res = await fetch(`/api/codespace/stop/${lastId}`, { method: 'DELETE' });
  const data = await res.json();
  document.getElementById('output').textContent = data.message;
}
