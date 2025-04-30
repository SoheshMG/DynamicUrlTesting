const express = require('express');
const router = express.Router();
const sessionService = require('../services/session.service');
const codespaceService = require('../services/codespace.service');

router.post('/', (req, res) => {
  try {
    const { email, username } = req.body;
    const codespace = codespaceService.createCodespace();
    const session = sessionService.createSession(email, username, codespace);
    res.json({
      success: true,
      previewUrl: session.previewUrl,
      conversationId: session.conversationId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:email', (req, res) => {
  try {
    const sessions = sessionService.getSessionsByEmail(req.params.email);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
