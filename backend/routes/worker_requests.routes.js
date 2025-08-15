const express = require('express');
const router = express.Router();
const controller = require('../controllers/worker_requests.controller');

router.get('/', controller.getAllRequests);
router.get('/:id', controller.getRequestById);
router.get('/:id/details', controller.getRequestDetails);
router.post('/', controller.createRequest);
router.put('/:id', controller.updateRequest);
router.delete('/:id', controller.deleteRequest);

module.exports = router;
