const express = require('express');
const router = express.Router();
const controller = require('../controllers/fees.controller');

router.get('/', controller.getAllFees);
router.get('/:id', controller.getFeeById);
router.get('/member/:memberId', controller.getFeesByMember);
router.post('/', controller.createFee);
router.put('/:id', controller.updateFee);
router.delete('/:id', controller.deleteFee);

module.exports = router;
