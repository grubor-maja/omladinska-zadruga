const express = require('express');
const router = express.Router();
const controller = require('../controllers/municipalities.controller');

router.get('/', controller.getAllMunicipalities);
router.get('/city/:gradId', controller.getMunicipalitiesByCity);
router.post('/', controller.createMunicipality);
router.put('/:id', controller.updateMunicipality);
router.delete('/:id', controller.deleteMunicipality);

module.exports = router;
