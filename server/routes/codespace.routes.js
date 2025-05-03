const express = require('express');
const router = express.Router();
const codespaceService = require('../services/codespace.service');

let lastCreatedCodespace = null;

router.post('/create', (req, res) => {
  const { repo, branch, machine } = req.body;
  if (!repo) return res.status(400).json({ error: 'Repository is required' });

  try {
    const codespace = codespaceService.createCodespace(repo, branch, machine);
    lastCreatedCodespace = codespace.codespaceId;
    res.json({ success: true, result: codespace });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/status/:name?', (req, res) => {
  const name = req.params.name || lastCreatedCodespace;
  if (!name) return res.status(400).json({ error: 'No codespace name provided' });

  try {
    const status = codespaceService.getCodespaceStatus(name);
    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/stop/:name?', (req, res) => {
  const name = req.params.name || lastCreatedCodespace;
  if (!name) return res.status(400).json({ error: 'No codespace name provided' });

  try {
    const result = codespaceService.stopCodespace(name);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
