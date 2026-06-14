// const Booking = require('../models/Booking');
// const Event = require('../models/Event');
// const OTP = require('../models/OTP');
// const { sendBookingEmail, sendOTPEmail } = require('../utils/email');


// const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();


// exports.sendBookingOTP = async (req, res) => {
//     try {
//         const otp = generateOTP();
//         await OTP.findOneAndDelete({ email: req.user.email, action: 'event_booking' });
//         await OTP.create({ email: req.user.email, otp, action: 'event_booking' });
//         await sendOTPEmail(req.user.email, otp, 'event_booking');
//         res.json({ message: 'OTP sent successfully' });

//     } 
//     catch (error) {
//         res.status(500).json({ message: 'Error sending OTP', error: error.message });
//     }
// };







// exports.bookEvent = async (req, res) => {
//     try {
//         const { eventId, otp } = req.body;

//         // Verify OTP explicitly before proceeding
//         const validOTP = await OTP.findOne({ email: req.user.email, otp, action: 'event_booking' });

//         if (!validOTP) {
//             return res.status(400).json({ message: 'Invalid or expired OTP for booking' });
//         }


//         const event = await Event.findById(eventId);
        
//         if (!event) {
//             return res.status(404).json({ message: 'Event not found' });
//         };
//         if (event.availableSeats <= 0) {
//             return res.status(400).json({ message: 'No seats available' });
//         };


//         const existingBooking = await Booking.findOne({ userId: req.user.id, eventId });

//         if (existingBooking && existingBooking.status !== 'cancelled') {
//             return res.status(400).json({ message: 'Already booked or pending' });
//         }

//         const booking = await Booking.create({
//             userId: req.user.id,
//             eventId,
//             status: 'pending',
//             paymentStatus: 'not_paid',
//             amount: event.ticketPrice
//         });

//         await OTP.deleteOne({ _id: validOTP._id });                              // cleanup

//         res.status(201).json({ message: 'Booking request submitted', booking });
//     } 
//     catch (error) {
//         res.status(500).json({ message: 'Server Error', error: error.message });
//     }
// };





// exports.confirmBooking = async (req, res) => {

//     try {
//         const { paymentStatus } = req.body;                                                            // 'paid' or 'not_paid'
//         const booking = await Booking.findById(req.params.id).populate('userId').populate('eventId');

//         if (!booking) {
//             return res.status(404).json({ message: 'Booking not found' });
//         }

//         if (booking.status === 'confirmed') {
//             return res.status(400).json({ message: 'Booking is already confirmed' });
//         }

//         const event = await Event.findById(booking.eventId._id);
//         if (event.availableSeats <= 0) {
//             return res.status(400).json({ message: 'No seats available to confirm this booking' });
//         }

//         booking.status = 'confirmed';
//         if (paymentStatus) {
//             booking.paymentStatus = paymentStatus;
//         }
//         await booking.save();

//         event.availableSeats -= 1;
//         await event.save();

//         // Send email on admin confirmation
//         await sendBookingEmail(booking.userId.email, booking.userId.name, booking.eventId.title);

//         res.json({ message: 'Booking confirmed successfully', booking });
//     } 
//     catch (error) {
//         res.status(500).json({ message: 'Server Error', error: error.message });
//     }
// };





// exports.getMyBookings = async (req, res) => {
//     try {
//         const bookings = req.user.role === 'admin'
//             ? await Booking.find()
//                 .populate('eventId')
//                 .populate('userId', 'name email')
//                 .sort({ createdAt: -1 })
//             : await Booking.find({ userId: req.user.id })
//                 .populate('eventId')
//                 .sort({ createdAt: -1 });

//         res.json(bookings);
//     } 
//     catch (error) {
//         res.status(500).json({ message: 'Server Error', error: error.message });
//     }
// };





// exports.cancelBooking = async (req, res) => {

//     try {
//         const booking = await Booking.findById(req.params.id);
//         if (!booking) {
//             return res.status(404).json({ message: 'Booking not found' });
//         }

//         if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
//             return res.status(403).json({ message: 'Not authorized' });
//         }

//         if (booking.status === 'cancelled') {
//             return res.status(400).json({ message: 'Already cancelled' });
//         }

//         const wasConfirmed = booking.status === 'confirmed';

//         booking.status = 'cancelled';
//         await booking.save();


//         // Only restore the seat if it was actually confirmed and deducted
//         if (wasConfirmed) {
//             const event = await Event.findById(booking.eventId);
//             if (event) {
//                 event.availableSeats += 1;
//                 await event.save();
//             }
//         }

//         res.json({ message: 'Booking cancelled successfully' });
//     } 
//     catch (error) {
//         res.status(500).json({ message: 'Server Error', error: error.message });
//     }
// };



























const Booking = require('../models/Booking');
const Event = require('../models/Event');
const OTP = require('../models/OTP');
const { sendBookingEmail, sendOTPEmail } = require('../utils/email');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// 1. Send OTP (Updated to log to terminal for easy development)
exports.sendBookingOTP = async (req, res) => {
    try {
        const otp = generateOTP();
        
        // Clear any existing OTPs for this user
        await OTP.findOneAndDelete({ email: req.user.email, action: 'event_booking' });
        
        // Create new OTP
        await OTP.create({ email: req.user.email, otp, action: 'event_booking' });
        
        // Log to terminal so you don't have to check MongoDB or Email
        console.log(`\n=============================================`);
        console.log(`🔐 DEVELOPMENT OTP FOR ${req.user.email}: [ ${otp} ]`);
        console.log(`=============================================\n`);

        // Attempt to send email (if it fails, the app won't crash because we catch it, 
        // and you still have the OTP in the terminal)
        try {
            await sendOTPEmail(req.user.email, otp, 'event_booking');
        } catch (emailError) {
            console.log("Email sending bypassed/failed, but OTP was generated.");
        }

        res.json({ message: 'OTP sent successfully. Check terminal or email.' });

    } catch (error) {
        res.status(500).json({ message: 'Error sending OTP', error: error.message });
    }
};


exports.verifyOTPOnly = async (req, res) => {
    try {
        const { otp } = req.body;

        const validOTP = await OTP.findOne({ 
            email: req.user.email, 
            otp: otp, 
            action: 'event_booking' 
        });

        if (!validOTP) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Clean up OTP so it can't be reused
        await OTP.deleteOne({ _id: validOTP._id });

        res.status(200).json({ success: true, message: 'OTP verified' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error during OTP verification', error: error.message });
    }
};



exports.bookEvent = async (req, res) => {
    try {
        const { eventId, otp } = req.body;

        // Verify OTP explicitly before proceeding (Used for FREE events)
        const validOTP = await OTP.findOne({ email: req.user.email, otp, action: 'event_booking' });

        if (!validOTP) {
            return res.status(400).json({ message: 'Invalid or expired OTP for booking' });
        }

        const event = await Event.findById(eventId);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        };
        if (event.availableSeats <= 0) {
            return res.status(400).json({ message: 'No seats available' });
        };

        const existingBooking = await Booking.findOne({ userId: req.user.id, eventId });

        if (existingBooking && existingBooking.status !== 'cancelled') {
            return res.status(400).json({ message: 'Already booked or pending' });
        }

        const booking = await Booking.create({
            userId: req.user.id,
            eventId,
            status: 'pending',
            paymentStatus: 'not_paid',
            amount: event.ticketPrice
        });

        await OTP.deleteOne({ _id: validOTP._id });                              // cleanup

        res.status(201).json({ success: true, message: 'Booking request submitted', booking });
    } 
    catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.confirmBooking = async (req, res) => {
    try {
        const { paymentStatus } = req.body;                                      // 'paid' or 'not_paid'
        const booking = await Booking.findById(req.params.id).populate('userId').populate('eventId');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status === 'confirmed') {
            return res.status(400).json({ message: 'Booking is already confirmed' });
        }

        const event = await Event.findById(booking.eventId._id);
        if (event.availableSeats <= 0) {
            return res.status(400).json({ message: 'No seats available to confirm this booking' });
        }

        booking.status = 'confirmed';
        if (paymentStatus) {
            booking.paymentStatus = paymentStatus;
        }
        await booking.save();

        event.availableSeats -= 1;
        await event.save();

        // Send email on admin confirmation
        await sendBookingEmail(booking.userId.email, booking.userId.name, booking.eventId.title);

        res.json({ message: 'Booking confirmed successfully', booking });
    } 
    catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// exports.getMyBookings = async (req, res) => {
//     try {
//         const bookings = req.user.role === 'admin'
//             ? await Booking.find()
//                 .populate('eventId')
//                 .populate('userId', 'name email')
//                 .sort({ createdAt: -1 })
//             : await Booking.find({ userId: req.user.id })
//                 .populate('eventId')
//                 .sort({ createdAt: -1 });

//         res.json(bookings);
//     } 
//     catch (error) {
//         res.status(500).json({ message: 'Server Error', error: error.message });
//     }
// };




exports.getMyBookings = async (req, res) => {
    try {
        let bookings;
        if (req.user.role === 'admin') {
            // Admin gets EVERYTHING, sorted newest first
            bookings = await Booking.find()
                .populate('eventId')
                .populate('userId', 'name email')
                .sort({ createdAt: -1 });
        } else {
            // User gets ONLY THEIR OWN, sorted newest first
            bookings = await Booking.find({ userId: req.user.id })
                .populate('eventId')
                .sort({ createdAt: -1 });
        }
        res.json(bookings);
    } 
    catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};




exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: 'Already cancelled' });
        }

        const wasConfirmed = booking.status === 'confirmed';

        booking.status = 'cancelled';
        await booking.save();

        // Only restore the seat if it was actually confirmed and deducted
        if (wasConfirmed) {
            const event = await Event.findById(booking.eventId);
            if (event) {
                event.availableSeats += 1;
                await event.save();
            }
        }

        res.json({ message: 'Booking cancelled successfully' });
    } 
    catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};