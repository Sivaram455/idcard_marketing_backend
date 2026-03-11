const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

router.use(authenticate);
router.use(authorizeRoles('school', 'SCHOOL_ADMIN', 'admin', 'GMMC_ADMIN', 'printer', 'PRINTER'));

router.get('/request/:request_id', studentController.getByRequest);
router.get('/:id', studentController.getById);
router.post('/bulk', studentController.bulkCreate);
router.post('/', studentController.createSingle);
router.delete('/:id', studentController.remove);

module.exports = router;
