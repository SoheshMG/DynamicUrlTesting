import express from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Octokit } from '@octokit/core';
import dotenv from 'dotenv';
dotenv.config();
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const SESSIONS_FILE = path.join(__dirname, 'sessions.json');

if (!fs.existsSync(SESSIONS_FILE)) {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify([]));
}

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function createCodespace() {
    try {
        const response = await octokit.request(
            'POST /repos/{owner}/{repo}/codespaces',
            {
                owner: 'SoheshMG',
                repo: 'DynamicUrlTesting',
                ref: 'main',
                machine: 'basicLinux32gb',
                location: 'southeastasia',
                devcontainer_path: '.devcontainer/devcontainer.json',
                idle_timeout_minutes: 30,
                retention_period_minutes: 480,
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            }
        );

        const cs = response.data;
        return {
            id: cs.id,
            name: cs.name,
            url: cs.web_url,
            status: cs.state
        };
    } catch (err) {
        console.error('Error creating codespace:', err);
        throw new Error('Failed to create codespace');
    }
}
;

app.post('/api/create-session', async (req, res) => {
    try {
        const { email, username } = req.body;
        const guid = uuidv4();
        const conversationId = `conv-${uuidv4()}`;

        const codespace = await createCodespace();

        const previewUrl = `https://${codespace.name}-3000.app.github.dev/preview/${guid}`;
        const websocketUrl = `https://${codespace.name}-8080.app.github.dev/websocket/${guid}`;

        const sessionData = {
            guid,
            conversationId,
            email,
            username,
            codespaceId: codespace.codespaceId,
            codespaceName: codespace.name,
            previewUrl,
            websocketUrl,
            createdAt: new Date().toISOString(),
            status: 'active'
        };

        const sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE));
        sessions.push(sessionData);
        fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));

        res.json({
            success: true,
            previewUrl: sessionData.previewUrl,
            websocketUrl: sessionData.websocketUrl,
            conversationId: sessionData.conversationId
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

app.get('/preview/:guid', (req, res) => {
    const sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE));
    const session = sessions.find(s => s.guid === req.params.guid);

    if (!session) return res.status(404).send('Session not found');

    res.send(`
        <h1>Code Preview</h1>
        <p>Session for: ${session.email}</p>
        <p>Codespace ID: ${session.codespaceId}</p>
        <p>Codespace Name: ${session.codespaceName}</p>
        <p>WebSocket URL: ${session.websocketUrl}</p>
        <p>Created at: ${session.createdAt}</p>
    `);
});

app.get('/api/sessions/:email', (req, res) => {
    const sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE));
    const userSessions = sessions.filter(s => s.email === req.params.email);
    res.json(userSessions);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
