const express = require('express');
const router = express.Router();
const controller = require('../controllers/language_skills.controller');

router.get('/', controller.getAllSkills);
router.get('/:id', controller.getSkillById);
router.get('/candidate/:candidateId', controller.getSkillsByCandidate);
router.post('/', controller.createSkill);
router.put('/:id', controller.updateSkill);
router.delete('/:id', controller.deleteSkill);

module.exports = router;
