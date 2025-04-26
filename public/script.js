document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const userData = {
        email: document.getElementById('email').value,
        username: document.getElementById('username').value
    };

    try {
        const response = await fetch('http://localhost:3000/api/create-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) throw new Error('Session creation failed');

        const { previewUrl, websocketUrl, conversationId } = await response.json();

        // Show preview section
        document.getElementById('preview-section').style.display = 'block';
        document.getElementById('preview-link').href = previewUrl;
        document.getElementById('preview-link').textContent = previewUrl;

        // Display websocket URL if needed

        document.getElementById('websocket-section').style.display = 'block';
        if (document.getElementById('websocket-link')) {
            document.getElementById('websocket-link').href = websocketUrl;
            document.getElementById('websocket-link').textContent = websocketUrl;
        }

        // Store in localStorage
        localStorage.setItem(conversationId, JSON.stringify({
            email: userData.email,
            previewUrl,
            websocketUrl,
            timestamp: new Date().toISOString()
        }));

        // Optionally connect to the websocket
        // initializeWebsocket(websocketUrl);

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to create session. Please try again.');
    }
});

// Optional: Add a function to connect to the websocket
function initializeWebsocket(url) {
    const socket = new WebSocket(url);

    socket.onopen = function (e) {
        console.log("WebSocket connection established");
    };

    socket.onmessage = function (event) {
        console.log("Message from server:", event.data);
    };

    socket.onclose = function (event) {
        console.log("WebSocket connection closed");
    };

    socket.onerror = function (error) {
        console.error("WebSocket error:", error);
    };

    return socket;
}