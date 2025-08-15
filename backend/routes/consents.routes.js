const express = require('express');
const router = express.Router();
const controller = require('../controllers/consents.controller');

router.get('/', controller.getAllConsents);
router.post('/', controller.createConsent);
router.put('/:id', controller.updateConsent);
router.delete('/:id', controller.deleteConsent);

module.exports = router;
