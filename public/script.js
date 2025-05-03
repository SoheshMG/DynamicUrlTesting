let lastId = '';

document.getElementById('createForm').onsubmit = async (e) => {
  e.preventDefault();
  const res = await fetch('/api/codespace/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const text = await res.text();
  const nameMatch = text.match(/Name:\s(.+)/);
  if (nameMatch) lastId = nameMatch[1].trim();
  document.getElementById('output').textContent = text;
};

async function checkStatus() {
  if (!lastId) return alert('No codespace to check.');
  const res = await fetch(`/api/codespace/status/${lastId}`);
  const text = await res.text();
  document.getElementById('output').textContent = text;
}

async function stopCodespace() {
  if (!lastId) return alert('No codespace to stop.');
  const res = await fetch(`/api/codespace/stop/${lastId}`, { method: 'DELETE' });
  const text = await res.text();
  document.getElementById('output').textContent = text;
  lastId = '';
}
