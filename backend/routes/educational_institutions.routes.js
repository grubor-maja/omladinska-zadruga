const express = require('express');
const router = express.Router();
const controller = require('../controllers/educational_institutions.controller');

router.get('/', controller.getAllEducationalInstitutions);
router.post('/', controller.createEducationalInstitution);
router.put('/:id', controller.updateEducationalInstitution);
router.delete('/:id', controller.deleteEducationalInstitution);

module.exports = router;
