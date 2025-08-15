const express = require('express');
const router = express.Router();
const controller = require('../controllers/educations.controller');

router.get('/', controller.getAllEducations);
router.get('/:id', controller.getEducationById);
router.get('/candidate/:candidateId', controller.getEducationsByCandidate);
router.post('/', controller.createEducation);
router.put('/:id', controller.updateEducation);
router.delete('/:id', controller.deleteEducation);

module.exports = router;
