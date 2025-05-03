const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Route imports
const apiRoutes = require('./routes/api.routes');
const previewRoutes = require('./routes/preview.routes');
const codespaceRoutes = require('./routes/codespace.routes'); // ✅ Add this

// Route usage
app.use('/api/sessions', apiRoutes);
app.use('/api/preview', previewRoutes);
app.use('/api/codespace', codespaceRoutes); // ✅ Mount your codespace API

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
