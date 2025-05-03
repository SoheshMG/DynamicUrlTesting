const express = require('express');
const router = express.Router();
const codespaceService = require('../services/codespace.service');

router.post('/create', async (req, res) => {
  try {
    const result = await codespaceService.createCodespace();
    res.send(result);
  } catch (err) {
    res.status(500).send(`Error: ${err.message}`);
  }
});

router.get('/status/:name', async (req, res) => {
  try {
    const result = await codespaceService.checkStatus(req.params.name);
    res.send(result);
  } catch (err) {
    res.status(500).send(`Error: ${err.message}`);
  }
});

router.delete('/stop/:name', async (req, res) => {
  try {
    const result = await codespaceService.deleteCodespace(req.params.name);
    res.send(result);
  } catch (err) {
    res.status(500).send(`Error: ${err.message}`);
  }
});

module.exports = router;
