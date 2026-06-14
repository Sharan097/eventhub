// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const mongoose = require('mongoose');
// const authRoutes = require('./routes/auth.js');
// const eventRoutes = require('./routes/events.js');
// const bookingRoutes = require('./routes/booking.js');


// dotenv.config();



// // Environment Validation (Issue 8)
// if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
//     console.error("FATAL ERROR: Stripe keys are missing from environment variables.");
//     process.exit(1);
// }
// if (!process.env.MONGO_URI) {
//     console.error("FATAL ERROR: MONGO_URI is missing.");
//     process.exit(1);
// }




// // const authRoutes = require('./routes/auth.js');
// // const eventRoutes = require('./routes/events.js');
// // const bookingRoutes = require('./routes/booking.js');
// const paymentRoutes = require('./routes/payment.js');


// const app = express();
// app.use(cors());


// // CRITICAL: Webhook route MUST use express.raw, so it goes before express.json()
// app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));


// app.use(express.json());


// //Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/events', eventRoutes);
// app.use('/api/bookings', bookingRoutes);
// app.use('/api/payments', paymentRoutes);



// // Connect to MongoDB
// // mongoose.connect(process.env.MONGO_URI)
// // .then(() => {
// //     console.log('MongoDB connected');
// // })
// // .catch((err) => {
// //     console.log(err)
// // });

// mongoose.connect(process.env.MONGO_URI)
// .then(() => {
//     console.log('MongoDB connected');
//     console.log('Database:', mongoose.connection.name);
// })
// .catch(console.error);


// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });




















const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth.js');
const eventRoutes = require('./routes/events.js');
const bookingRoutes = require('./routes/booking.js');
const paymentRoutes = require('./routes/payment.js');
const paymentController = require('./controllers/paymentController.js'); // ADDED THIS
const Booking = require('./models/Booking');

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("FATAL ERROR: Stripe keys are missing from environment variables.");
    process.exit(1);
}
if (!process.env.MONGO_URI) {
    console.error("FATAL ERROR: MONGO_URI is missing.");
    process.exit(1);
}

const app = express();
app.use(cors());

// CRITICAL FIX: Changed app.use to app.post and attached the controller!
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
    console.log('MongoDB connected');
    console.log('Database:', mongoose.connection.name);

    try {
        await Booking.syncIndexes();
        console.log('✅ Booking indexes synced');
    } catch (err) {
        console.error('❌ Booking index sync failed:', err.message);
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });

})
.catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});