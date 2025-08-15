const express = require('express');
const router = express.Router();
const controller = require('../controllers/cities.controller');

router.get('/', controller.getAllCities);
router.post('/', controller.createCity);
router.put('/:id', controller.updateCity);
router.delete('/:id', controller.deleteCity);

module.exports = router;
