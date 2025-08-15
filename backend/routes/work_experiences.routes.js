const express = require('express');
const router = express.Router();
const controller = require('../controllers/work_experiences.controller');

router.get('/', controller.getAllExperiences);
router.get('/candidate/:candidateId', controller.getExperiencesByCandidate);
router.post('/', controller.createExperience);
router.put('/:id', controller.updateExperience);
router.delete('/:id', controller.deleteExperience);

module.exports = router;
