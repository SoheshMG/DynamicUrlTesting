const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const SESSION_FILE = path.join(__dirname, '../sessions.json');
const BASE_URL = process.env.PREVIEW_BASE_URL;

function read() {
  if (!fs.existsSync(SESSION_FILE)) fs.writeFileSync(SESSION_FILE, '[]');
  return JSON.parse(fs.readFileSync(SESSION_FILE));
}

function write(data) {
  fs.writeFileSync(SESSION_FILE, JSON.stringify(data, null, 2));
}

exports.createSession = (email, username, codespace) => {
  const guid = uuidv4();
  const session = {
    guid,
    conversationId: `conv-${uuidv4()}`,
    email,
    username,
    codespaceId: codespace.codespaceId,
    previewUrl: `${BASE_URL}/${guid}`,
    createdAt: new Date().toISOString(),
    status: 'active',
  };
  const sessions = read();
  sessions.push(session);
  write(sessions);
  return session;
};

exports.getSessionsByEmail = (email) => read().filter(s => s.email === email);
exports.getSessionByGuid = (guid) => read().find(s => s.guid === guid);
