class SessionManager {
    constructor() {
        this.initForm();
        this.loadHistory();
    }

    initForm() {
        document.getElementById('signupForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                const files = await this.generateSampleFiles();
                const sessionData = {
                    email: document.getElementById('email').value,
                    username: document.getElementById('username').value,
                    files: files
                };

                const session = await this.createSession(sessionData);
                this.showPreview(session);
                this.storeSession(session);
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to create session');
            }
        });
    }

    async generateSampleFiles() {
        return [
            {
                filename: 'index.html',
                content: '<!DOCTYPE html><html><body><h1>Generated Code</h1></body></html>'
            },
            {
                filename: 'style.css',
                content: 'body { font-family: Arial; }'
            }
        ];
    }

    async createSession(data) {
        const response = await fetch('/api/sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || 'dev-token'}`
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Session creation failed');
        return response.json();
    }

    showPreview(session) {
        document.getElementById('preview-section').style.display = 'block';
        document.getElementById('preview-link').href = session.previewUrl;
        document.getElementById('preview-link').textContent = session.previewUrl;
    }

    storeSession(session) {
        localStorage.setItem(session.guid, JSON.stringify({
            email: session.email,
            previewUrl: session.previewUrl,
            timestamp: new Date().toISOString()
        }));
    }

    async loadHistory() {
        const email = localStorage.getItem('userEmail');
        if (!email) return;
        
        try {
            const response = await fetch(`/api/sessions?email=${email}`);
            const sessions = await response.json();
            this.renderHistory(sessions);
        } catch (error) {
            console.error('Failed to load history:', error);
        }
    }

    renderHistory(sessions) {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;
        
        historyList.innerHTML = sessions.map(session => `
            <div class="session-card">
                <h4>${new Date(session.createdAt).toLocaleDateString()}</h4>
                <a href="${session.previewUrl}" target="_blank">Preview</a>
                <button data-guid="${session.guid}" class="restore-btn">
                    Restore
                </button>
            </div>
        `).join('');

        // Add event listeners to all restore buttons
        document.querySelectorAll('.restore-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.restoreSession(e.target.dataset.guid);
            });
        });
    }

    async restoreSession(guid) {
        try {
            const response = await fetch(`/api/sessions/${guid}`);
            const session = await response.json();
            
            if (session.status === 'active') {
                window.open(session.previewUrl, '_blank');
            } else {
                alert('Session is being reactivated...');
                // Additional restart logic here
            }
        } catch (error) {
            console.error('Restore failed:', error);
            alert('Failed to restore session');
        }
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    new SessionManager();
});