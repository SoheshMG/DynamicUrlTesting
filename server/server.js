const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();
const path = require('path');

// Routers
const apiRoutes = require('./routes/api.routes');
const previewRoutes = require('./routes/preview.routes');

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Mount routes
app.use('/api/sessions', apiRoutes);
app.use('/api/preview', previewRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
