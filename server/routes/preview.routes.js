const express = require('express');
const router = express.Router();
const sessionService = require('../services/session.service');

router.get('/:guid', (req, res) => {
  const session = sessionService.getSessionByGuid(req.params.guid);
  if (!session) return res.status(404).send('Session not found');

  res.send(`
    <h1>Code Preview</h1>
    <p>Email: ${session.email}</p>
    <p>Codespace ID: ${session.codespaceId}</p>
    <p>Codespace URL: <a href="${session.codespaceUrl}" target="_blank">${session.codespaceUrl}</a></p>
    <p>Created At: ${session.createdAt}</p>
  `);
});

module.exports = router;
