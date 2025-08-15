const express = require('express');
const router = express.Router();
const controller = require('../controllers/biographies.controller');

router.get('/', controller.getAllBiographies);
router.get('/:id', controller.getBiographyById);
router.get('/candidate/:candidateId', controller.getBiographyByCandidate);
router.post('/', controller.createBiography);
router.put('/:id', controller.updateBiography);
router.delete('/:id', controller.deleteBiography);

module.exports = router;
