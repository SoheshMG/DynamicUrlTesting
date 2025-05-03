const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const apiRoutes = require('./routes/api.routes');
const previewRoutes = require('./routes/preview.routes');

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/sessions', apiRoutes);
app.use('/api/preview', previewRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
