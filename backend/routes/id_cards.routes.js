const express = require('express');
const router = express.Router();
const controller = require('../controllers/id_cards.controller');

router.get('/', controller.getAllIDCards);
router.post('/', controller.createIDCard);
router.put('/:id', controller.updateIDCard);
router.delete('/:id', controller.deleteIDCard);

module.exports = router;
