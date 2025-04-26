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
        
        const { previewUrl, conversationId } = await response.json();
        
        // Show preview section
        document.getElementById('preview-section').style.display = 'block';
        document.getElementById('preview-link').href = previewUrl;
        document.getElementById('preview-link').textContent = previewUrl;

        // Store in localStorage
        localStorage.setItem(conversationId, JSON.stringify({
            email: userData.email,
            previewUrl,
            timestamp: new Date().toISOString()
        }));

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to create session. Please try again.');
    }
});