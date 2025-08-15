const express = require('express');
const router = express.Router();
const controller = require('../controllers/addresses.controller');

router.get('/', controller.getAllAddresses);
router.post('/', controller.createAddress);
router.put('/:id', controller.updateAddress);
router.delete('/:id', controller.deleteAddress);

module.exports = router;
