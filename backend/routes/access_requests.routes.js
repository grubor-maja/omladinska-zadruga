const express = require('express');
const router = express.Router();
const controller = require('../controllers/access_requests.controller');

router.get('/', controller.getAllRequests);
router.post('/', controller.createRequest);
router.put('/:id', controller.updateRequest);
router.delete('/:id', controller.deleteRequest);

module.exports = router;
