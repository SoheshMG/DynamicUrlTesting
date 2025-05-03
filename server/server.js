const express = require('express');
const cors = require('cors');
const path = require('path');
const { PORT } = require('./config');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from ../public (relative to server/)
app.use(express.static(path.join(__dirname, '../public')));

// Serve index.html on root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API routes
app.use('/api/codespace', require('./routes/codespace.routes'));
app.use('/api/preview', require('./routes/preview.routes'));
app.use('/api/session', require('./routes/api.routes'));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
