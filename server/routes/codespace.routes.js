const express = require('express');
const router = express.Router();
const codespaceService = require('../services/codespace.service');

// Create a new Codespace
router.post('/create', async (req, res) => {
  try {
    const { repo, branch, machine } = req.body;
    const result = await codespaceService.createCodespace(repo, branch, machine);
    res.status(200).json({ message: 'Codespace created successfully', result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create codespace', details: err.message });
  }
});

// Check Codespace status
router.get('/status/:name', async (req, res) => {
  try {
    const name = req.params.name;
    const status = await codespaceService.getCodespaceStatus(name);
    res.status(200).json({ status });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get status', details: err.message });
  }
});

// Stop/Delete a Codespace
router.delete('/stop/:name', async (req, res) => {
  try {
    const name = req.params.name;
    const result = await codespaceService.stopCodespace(name);
    res.status(200).json({ message: 'Codespace stopped', result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to stop codespace', details: err.message });
  }
});

module.exports = router;
