const express = require('express');
const router = express.Router();
const controller = require('../controllers/declarations.controller');

router.get('/', controller.getAllDeclarations);
router.post('/', controller.createDeclaration);
router.put('/:id', controller.updateDeclaration);
router.delete('/:id', controller.deleteDeclaration);

module.exports = router;
