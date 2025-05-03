const express = require('express');
const router = express.Router();
const codespaceService = require('../services/codespace.service');
const sessionService = require('../services/session.service');

router.post('/', (req, res) => {
  const { email, username } = req.body;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH;
  const machine = process.env.GITHUB_MACHINE;

  try {
    const codespace = codespaceService.createCodespace(repo, branch, machine);
    const session = sessionService.createSession(email, username, codespace);
    res.json(session);
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
