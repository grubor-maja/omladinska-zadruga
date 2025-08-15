const express = require('express');
const router = express.Router();
const controller = require('../controllers/parents.controller');

router.get('/', controller.getAllParents);
router.get('/candidate/:candidateId', controller.getParentsByCandidate);
router.post('/', controller.createParent);
router.put('/:id', controller.updateParent);
router.delete('/:id', controller.deleteParent);

module.exports = router;
