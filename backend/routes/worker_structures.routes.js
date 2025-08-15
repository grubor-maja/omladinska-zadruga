const express = require('express');
const router = express.Router();
const controller = require('../controllers/worker_structures.controller');

router.get('/request/:zahtevId', controller.getStructuresByRequestId);
router.get('/:id', controller.getStructureById);
router.post('/', controller.createStructure);
router.put('/:id', controller.updateStructure);
router.delete('/:id', controller.deleteStructure);
router.delete('/request/:zahtevId', controller.deleteStructuresByRequestId);

module.exports = router;
