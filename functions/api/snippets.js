const express = require('express');
const router = express.Router();

// Placeholder endpoints
router.get('/', (req, res) => {
  res.json({ snippets: [], total: 0 });
});

router.post('/', (req, res) => {
  res.status(501).json({ error: { message: 'Not implemented yet' } });
});

module.exports = router;