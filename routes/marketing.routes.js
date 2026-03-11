const express = require('express');
const router = express.Router();
const marketingController = require('../controllers/marketing.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

// All marketing routes require authentication
router.use(authenticate);

// --- School Routes ---
router.get('/schools', authorizeRoles('Agent', 'marketer', 'admin', 'GMMC_ADMIN'), marketingController.getAllSchools);
router.post('/schools', authorizeRoles('Agent', 'marketer', 'admin', 'GMMC_ADMIN'), marketingController.createSchool);
router.get('/schools/:id', authorizeRoles('Agent', 'marketer', 'admin', 'GMMC_ADMIN'), marketingController.getSchoolDetail);
router.put('/schools/:id', authorizeRoles('Agent', 'marketer', 'admin', 'GMMC_ADMIN'), marketingController.updateSchool);

// --- Assignment Routes (Admin only) ---
router.post('/assign', authorizeRoles('admin', 'GMMC_ADMIN'), marketingController.assignSchool);

// --- Activity Routes ---
router.post('/activities', authorizeRoles('Agent', 'marketer', 'admin', 'GMMC_ADMIN'), marketingController.createActivity);
router.get('/activities/my', authorizeRoles('Agent', 'marketer', 'admin', 'GMMC_ADMIN'), marketingController.getMyActivities);
router.get('/activities/followups', authorizeRoles('Agent', 'marketer', 'admin', 'GMMC_ADMIN'), marketingController.getPendingFollowUps);
router.put('/activities/:id/status', authorizeRoles('Agent', 'marketer', 'admin', 'GMMC_ADMIN'), marketingController.updateActivityStatus);

module.exports = router;
