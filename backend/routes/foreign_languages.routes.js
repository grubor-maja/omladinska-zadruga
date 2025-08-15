const express = require('express');
const router = express.Router();
const controller = require('../controllers/foreign_languages.controller');

router.get('/', controller.getAllForeignLanguages);
router.post('/', controller.createForeignLanguage);
router.put('/:id', controller.updateForeignLanguage);
router.delete('/:id', controller.deleteForeignLanguage);

module.exports = router;
