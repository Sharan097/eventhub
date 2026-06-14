// const express = require('express');
// const router = express.Router();
// const { bookEvent, confirmBooking, getMyBookings, cancelBooking, sendBookingOTP, verifyOTPOnly } = require('../controllers/bookingController');
// const { protect, admin } = require('../middleware/auth');


// router.post('/send-otp', protect, sendBookingOTP);


// router.post('/', protect, bookEvent);

// router.post('/verify-otp', protect, verifyOTPOnly);


// router.put('/:id/confirm', protect, admin, confirmBooking);


// router.get('/my', protect, getMyBookings);
 

// router.delete('/:id', protect, cancelBooking);


// module.exports = router;





















const express = require('express');
const router = express.Router();
const { 
    bookEvent, 
    confirmBooking, 
    getMyBookings, 
    cancelBooking, 
    sendBookingOTP,
    verifyOTPOnly 
} = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/auth');

// 1. Send OTP
router.post('/send-otp', protect, sendBookingOTP);

// 2. Verify OTP for Stripe (MUST match the frontend path exactly)
router.post('/verify-otp', protect, verifyOTPOnly);

// 3. Create manual booking (Free events)
router.post('/', protect, bookEvent);

// 4. Admin confirm booking
router.put('/:id/confirm', protect, admin, confirmBooking);

// 5. Get bookings
router.get('/my', protect, getMyBookings);
 
// 6. Cancel booking
router.delete('/:id', protect, cancelBooking);

module.exports = router;