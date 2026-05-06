const express = require('express');
const router = express.Router();
const {protect, admin} = require('../middleware/auth');
const {getEvents, getEventById, createEvent, updateEvent, deleteEvent} = require('../controllers/eventController.js');


// GET ALL EVENTS
router.get('/', getEvents);


// GET SINGLE EVENT
router.get('/:id', getEventById);


// CREATE NEW EVENT (ADMIN ONLY)
router.post('/', protect, admin, createEvent);


// UPDATE EVENT (ADMIN ONLY)
router.put('/:id', protect, admin, updateEvent);


// DELETE EVENT (ADMIN ONLY)
router.delete('/:id', protect, admin, deleteEvent);


module.exports = router;