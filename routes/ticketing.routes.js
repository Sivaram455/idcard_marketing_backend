const express = require('express');
const router = express.Router();
const ticketingController = require('../controllers/ticketing.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

router.post('/', authenticate, ticketingController.createTicket);
router.get('/', authenticate, ticketingController.getTickets);
router.get('/developers', authenticate, ticketingController.getDevelopers);
router.get('/:id', authenticate, ticketingController.getTicketById);
router.put('/:id', authenticate, authorizeRoles('admin', 'GMMC_ADMIN', 'SUPPORT', 'DEVELOPER'), ticketingController.updateTicket);

module.exports = router;
