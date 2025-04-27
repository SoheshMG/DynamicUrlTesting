import express from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Octokit } from '@octokit/core';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { saveFiles, loadFiles } from './storage.js';

dotenv.config();
console.log('OWNER:', process.env.GITHUB_OWNER);
console.log('REPO: ', process.env.GITHUB_REPO);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const SESSIONS_FILE = path.join(__dirname, 'sessions.json');

// Initialize sessions file
if (!fs.existsSync(SESSIONS_FILE)) {
    fs.writeFileSync(SESSIONS_FILE, '[]');
}

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// Auth middleware - skip favicon
app.use((req, res, next) => {
    if (req.url === '/favicon.ico') return next();
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    next();
});

async function createCodespace(guid) {
    try {
        const response = await octokit.request(
            'POST /repos/{owner}/{repo}/codespaces',
            {
                owner: process.env.GITHUB_OWNER,
                repo: process.env.GITHUB_REPO,
                ref: 'main',
                machine: 'basicLinux32gb',
                devcontainer_path: '.devcontainer/devcontainer.json',
                display_name: `session-${guid}`,
                retention_period_minutes: 10080,
                headers: { 'X-GitHub-Api-Version': '2022-11-28' }
            }
        );

        return {
            id: response.data.id,
            name: response.data.name,
            url: response.data.web_url,
            status: response.data.state
        };
    } catch (err) {
        console.error('Codespace error:', err);
        throw new Error('Failed to create codespace');
    }
}

app.post('/api/sessions', async (req, res) => {
    try {
        const { email, username, files } = req.body;
        const guid = uuidv4();
        const conversationId = `conv-${uuidv4()}`;
        
        const codespace = await createCodespace(guid);
        
        if (files && files.length > 0) {
            await saveFiles(guid, files);
        }

        const sessionData = {
            guid,
            conversationId,
            email,
            username,
            codespaceId: codespace.id,
            codespaceName: codespace.name,
            previewUrl: `https://${codespace.name}-3000.app.github.dev/preview/${guid}`,
            websocketUrl: `https://${codespace.name}-8080.app.github.dev/websocket/${guid}`,
            createdAt: new Date().toISOString(),
            status: 'active'
        };

        const sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE));
        sessions.push(sessionData);
        fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));

        res.json(sessionData);
    } catch (error) {
        console.error('Session error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/sessions/:guid', async (req, res) => {
    const sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE));
    const session = sessions.find(s => s.guid === req.params.guid);
    
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    try {
        const codespace = await octokit.request(
            `GET /repos/{owner}/{repo}/codespaces/${session.codespaceName}`,
            {
                owner: process.env.GITHUB_OWNER,
                repo: process.env.GITHUB_REPO
            }
        );
        
        session.status = codespace.data.state;
        res.json({
            ...session,
            files: await loadFiles(session.guid)
        });
    } catch (error) {
        res.status(503).json({ ...session, status: 'unavailable' });
    }
});

app.get('/preview/:guid', async (req, res) => {
    const sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE));
    const session = sessions.find(s => s.guid === req.params.guid);
    
    if (!session) return res.status(404).send('Session not found');
    
    try {
        const files = await loadFiles(session.guid);
        res.send(`
            <h1>Code Preview: ${session.guid}</h1>
            <div>${files.map(f => `<pre>${f.content}</pre>`).join('')}</div>
            <p>Codespace Status: ${session.status}</p>
        `);
    } catch (error) {
        res.status(500).send('Error loading preview');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));











// import express from 'express';
// import fs from 'fs';
// import path from 'path';
// import { v4 as uuidv4 } from 'uuid';
// import { Octokit } from '@octokit/core';
// import dotenv from 'dotenv';
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// import { saveFiles, loadFiles } from './storage.js';

// dotenv.config();
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const app = express();
// app.use(express.json());
// app.use(express.static(path.join(__dirname, '../public')));

// const SESSIONS_FILE = path.join(__dirname, 'sessions.json');

// // Initialize sessions file
// if (!fs.existsSync(SESSIONS_FILE)) {
//     fs.writeFileSync(SESSIONS_FILE, '[]');
// }

// const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// // Auth middleware (simplified)
// app.use((req, res, next) => {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
//     next();
// });

// // Improved Codespace creation
// async function createCodespace(guid) {
//     try {
//         const response = await octokit.request(
//             'POST /repos/{owner}/{repo}/codespaces',
//             {
//                 owner: process.env.GITHUB_OWNER,
//                 repo: process.env.GITHUB_REPO,
//                 ref: 'main',
//                 machine: 'basicLinux32gb',
//                 devcontainer_path: '.devcontainer/devcontainer.json',
//                 display_name: `session-${guid}`,
//                 retention_period_minutes: 10080, // 1 week
//                 headers: { 'X-GitHub-Api-Version': '2022-11-28' }
//             }
//         );

//         return {
//             id: response.data.id,
//             name: response.data.name,
//             url: response.data.web_url,
//             status: response.data.state
//         };
//     } catch (err) {
//         console.error('Codespace error:', err);
//         throw new Error('Failed to create codespace');
//     }
// }

// // Session creation endpoint
// app.post('/api/sessions', async (req, res) => {
//     try {
//         const { email, username, files } = req.body;
//         const guid = uuidv4();
//         const conversationId = `conv-${uuidv4()}`;
        
//         // Create codespace
//         const codespace = await createCodespace(guid);
        
//         // Store files
//         if (files && files.length > 0) {
//             await saveFiles(guid, files);
//         }

//         // Session data
//         const sessionData = {
//             guid,
//             conversationId,
//             email,
//             username,
//             codespaceId: codespace.id,
//             codespaceName: codespace.name,
//             previewUrl: `https://${codespace.name}-3000.app.github.dev/preview/${guid}`,
//             websocketUrl: `https://${codespace.name}-8080.app.github.dev/websocket/${guid}`,
//             createdAt: new Date().toISOString(),
//             status: 'active'
//         };

//         // Save session
//         const sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE));
//         sessions.push(sessionData);
//         fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));

//         res.json(sessionData);

//     } catch (error) {
//         console.error('Session error:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // Session retrieval
// app.get('/api/sessions/:guid', async (req, res) => {
//     const sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE));
//     const session = sessions.find(s => s.guid === req.params.guid);
    
//     if (!session) return res.status(404).json({ error: 'Session not found' });
    
//     try {
//         // Verify codespace status
//         const codespace = await octokit.request(
//             `GET /repos/{owner}/{repo}/codespaces/${session.codespaceName}`,
//             {
//                 owner: process.env.GITHUB_OWNER,
//                 repo: process.env.GITHUB_REPO
//             }
//         );
        
//         // Refresh session status
//         session.status = codespace.data.state;
//         res.json({
//             ...session,
//             files: await loadFiles(session.guid)
//         });
        
//     } catch (error) {
//         res.status(503).json({ ...session, status: 'unavailable' });
//     }
// });

// // Preview endpoint
// app.get('/preview/:guid', async (req, res) => {
//     const sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE));
//     const session = sessions.find(s => s.guid === req.params.guid);
    
//     if (!session) return res.status(404).send('Session not found');
    
//     try {
//         const files = await loadFiles(session.guid);
//         res.send(`
//             <h1>Code Preview: ${session.guid}</h1>
//             <div>${files.map(f => `<pre>${f.content}</pre>`).join('')}</div>
//             <p>Codespace Status: ${session.status}</p>
//         `);
//     } catch (error) {
//         res.status(500).send('Error loading preview');
//     }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));