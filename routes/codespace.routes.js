const express = require('express');
const router = express.Router();
const codespaceService = require('../services/codespace.service');

// Create a codespace
router.post('/create', async (req, res) => {
  const { message } = codespaceService.create();
  res.send({ message });
});

// Check status of a codespace
router.get('/status/:name', async (req, res) => {
  const { message } = codespaceService.checkStatus(req.params.name);
  res.send({ message });
});

// Stop/delete a codespace
router.delete('/stop/:name', async (req, res) => {
  const { message } = codespaceService.stop(req.params.name);
  res.send({ message });
});

module.exports = router;
