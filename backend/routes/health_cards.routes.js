const express = require('express');
const router = express.Router();
const controller = require('../controllers/health_cards.controller');

router.get('/', controller.getAllHealthCards);
router.post('/', controller.createHealthCard);
router.put('/:id', controller.updateHealthCard);
router.delete('/:id', controller.deleteHealthCard);

module.exports = router;
