const express = require('express');
const router = express.Router();
const controller = require('../controllers/authorized_persons.controller');

router.get('/', controller.getAllAuthorizedPersons);
router.post('/', controller.createAuthorizedPerson);
router.put('/:id', controller.updateAuthorizedPerson);
router.delete('/:id', controller.deleteAuthorizedPerson);

module.exports = router;
