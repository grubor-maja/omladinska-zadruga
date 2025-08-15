const express = require('express');
const router = express.Router();
const controller = require('../controllers/members.controller');

router.get('/', controller.getAllMembers);
router.get('/search', controller.searchMembers);
router.get('/:id', controller.getMemberById);
router.post('/', controller.createMember);
router.post('/from-candidate', controller.createMemberFromCandidate);
router.post('/with-data', controller.createMemberWithData);
router.put('/:id', controller.updateMember);
router.delete('/:id', controller.deleteMember);

module.exports = router;
