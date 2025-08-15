const express = require('express');
const router = express.Router();
const controller = require('../controllers/companies.controller');

router.get('/', controller.getAllCompanies);
router.get('/:pib', controller.getCompanyByPIB);
router.post('/', controller.createCompany);
router.post('/with-contract', controller.createCompanyWithContract);
router.put('/:pib', controller.updateCompany);
router.delete('/:pib', controller.deleteCompany);

module.exports = router;
