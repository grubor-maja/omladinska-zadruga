const express = require('express');
const router = express.Router();
const controller = require('../controllers/candidates.controller');

router.get('/', controller.getAllCandidates);
router.get('/search', controller.searchCandidates);
router.get('/:id', controller.getCandidateById);
router.post('/', controller.createCandidate);
router.put('/:id', controller.updateCandidate);
router.delete('/:id', controller.deleteCandidate);

module.exports = router;
