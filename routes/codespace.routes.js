const express = require('express');
const router = express.Router();
const codespaceService = require('../services/codespace.service');

router.post('/create', async (req, res) => {
  try {
    const { repo } = req.body;
    const result = await codespaceService.createCodespace(repo);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/status/:id', async (req, res) => {
  try {
    const result = await codespaceService.checkStatus(req.params.id);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/stop/:id', async (req, res) => {
  try {
    const result = await codespaceService.stopCodespace(req.params.id);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
