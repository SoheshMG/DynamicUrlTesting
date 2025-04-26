const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const SESSIONS_FILE = path.join(__dirname, 'sessions.json');

//----------------------------------------------------------------
//-------------------------Its working!!--------------------------
//----------------------------------------------------------------


// Initialize sessions file
if (!fs.existsSync(SESSIONS_FILE)) {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify([]));
}

// Mock Codespace API
const createCodespace = () => ({
    codespaceId: `cs-${uuidv4()}`,
    status: 'active',
    url: `https://codespace.example.com/${uuidv4()}`
});

// Create new session
app.post('/api/create-session', (req, res) => {
    try {
        const { email, username } = req.body;
        const guid = uuidv4();
        const conversationId = `conv-${uuidv4()}`;

        // Create codespace
        const codespace = createCodespace();

        // Create session data
        const sessionData = {
            guid,
            conversationId,
            email,
            username,
            codespaceId: codespace.codespaceId,
            previewUrl: `http://localhost:3000/preview/${guid}`,
            createdAt: new Date().toISOString(),
            status: 'active'
        };

        // Save to JSON
        const sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE));
        sessions.push(sessionData);
        fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));

        res.json({
            success: true,
            previewUrl: sessionData.previewUrl,
            conversationId: sessionData.conversationId
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Preview endpoint
app.get('/preview/:guid', (req, res) => {
    const sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE));
    const session = sessions.find(s => s.guid === req.params.guid);

    if (!session) return res.status(404).send('Session not found');

    // Render preview page (mock)
    res.send(`
        <h1>Code Preview</h1>
        <p>Session for: ${session.email}</p>
        <p>Codespace ID: ${session.codespaceId}</p>
        <p>Created at: ${session.createdAt}</p>
    `);
});

// Get user sessions
app.get('/api/sessions/:email', (req, res) => {
    const sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE));
    const userSessions = sessions.filter(s => s.email === req.params.email);
    res.json(userSessions);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));