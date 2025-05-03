const express = require('express');
const router = express.Router();
const codespaceService = require('../services/codespace.service');

router.post('/create', async (req, res) => {
  const message = await codespaceService.createCodespace();
  res.send({ message });
});

router.get('/status/:name', async (req, res) => {
  const message = await codespaceService.checkStatus(req.params.name);
  res.send({ message });
});

router.delete('/stop/:name', async (req, res) => {
  const message = await codespaceService.deleteCodespace(req.params.name);
  res.send({ message });
});

module.exports = router;
