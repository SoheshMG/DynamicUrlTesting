import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SESSION_DIR = path.join(__dirname, '../session_files');

export function saveFiles(guid, files) {
    const sessionPath = path.join(SESSION_DIR, guid);
    
    if (!fs.existsSync(sessionPath)) {
        fs.mkdirSync(sessionPath, { recursive: true });
    }

    files.forEach(file => {
        fs.writeFileSync(
            path.join(sessionPath, file.filename),
            file.content
        );
    });
}

export function loadFiles(guid) {
    const sessionPath = path.join(SESSION_DIR, guid);
    
    if (!fs.existsSync(sessionPath)) return null;
    
    return fs.readdirSync(sessionPath).map(filename => ({
        filename,
        content: fs.readFileSync(path.join(sessionPath, filename), 'utf8')
    }));
}