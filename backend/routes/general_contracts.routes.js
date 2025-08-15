const express = require('express');
const router = express.Router();
const controller = require('../controllers/general_contracts.controller');

router.get('/', controller.getAllContracts);
router.post('/', controller.createContract);
router.put('/:id', controller.updateContract);
router.delete('/:id', controller.deleteContract);

module.exports = router;
