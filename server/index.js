
// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const mongoose = require('mongoose');
// const authRoutes = require('./routes/auth.js');
// const eventRoutes = require('./routes/events.js');
// const bookingRoutes = require('./routes/booking.js');
// const paymentRoutes = require('./routes/payment.js');
// const paymentController = require('./controllers/paymentController.js'); // ADDED THIS
// const Booking = require('./models/Booking');

// dotenv.config();

// if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
//     console.error("FATAL ERROR: Stripe keys are missing from environment variables.");
//     process.exit(1);
// }
// if (!process.env.MONGO_URI) {
//     console.error("FATAL ERROR: MONGO_URI is missing.");
//     process.exit(1);
// }

// const app = express();
// app.use(cors());

// // CRITICAL FIX: Changed app.use to app.post and attached the controller!
// app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

// app.use(express.json());

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/events', eventRoutes);
// app.use('/api/bookings', bookingRoutes);
// app.use('/api/payments', paymentRoutes);

// mongoose.connect(process.env.MONGO_URI)
// .then(async () => {
//     console.log('MongoDB connected');
//     console.log('Database:', mongoose.connection.name);

//     try {
//         await Booking.syncIndexes();
//         console.log('✅ Booking indexes synced');
//     } catch (err) {
//         console.error('❌ Booking index sync failed:', err.message);
//     }

//     const PORT = process.env.PORT || 5000;
//     app.listen(PORT, () => {
//         console.log(`🚀 Server running on port ${PORT}`);
//     });

// })
// .catch((err) => {
//     console.error('MongoDB connection error:', err);
//     process.exit(1);
// });















const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const bookingRoutes = require("./routes/booking");
const paymentRoutes = require("./routes/payment");
const paymentController = require("./controllers/paymentController");
const Booking = require("./models/Booking");

dotenv.config();

/* ---------------- Environment Validation ---------------- */

const requiredEnv = [
    "MONGO_URI",
    "JWT_SECRET",
    "CLIENT_URL",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET"
];

requiredEnv.forEach((key) => {
    if (!process.env[key]) {
        console.error(`❌ Missing environment variable: ${key}`);
        process.exit(1);
    }
});

const app = express();

/* ---------------- Security ---------------- */

app.use(helmet());

app.use(compression());

app.use(morgan("dev"));

const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173"
];

app.use(cors({
    origin(origin, callback) {

        if (!origin)
            return callback(null, true);

        if (allowedOrigins.includes(origin))
            return callback(null, true);

        return callback(new Error("Not allowed by CORS"));

    },

    credentials: true
}));

/* ---------------- Stripe Webhook ---------------- */

app.post(
    "/api/payments/webhook",
    express.raw({ type: "application/json" }),
    paymentController.handleWebhook
);

/* ---------------- Body Parsers ---------------- */

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

/* ---------------- Health Routes ---------------- */

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "EventHub API Running 🚀"
    });
});

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});

/* ---------------- API Routes ---------------- */

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);

/* ---------------- 404 ---------------- */

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API Route Not Found"
    });
});

/* ---------------- Error Handler ---------------- */

app.use((err, req, res, next) => {

    console.error(err);

    res.status(err.status || 500).json({

        success: false,

        message:
            process.env.NODE_ENV === "production"
                ? "Internal Server Error"
                : err.message

    });

});

/* ---------------- Database ---------------- */

const startServer = async () => {

    try {

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });

        console.log("✅ MongoDB Connected");
        console.log(`Database: ${mongoose.connection.name}`);

        await Booking.syncIndexes();

        console.log("✅ Booking indexes synced");

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

    } catch (err) {

        console.error("❌ MongoDB Connection Error");

        console.error(err);

        process.exit(1);

    }

};

startServer();

/* ---------------- Graceful Shutdown ---------------- */

process.on("SIGTERM", async () => {

    console.log("Closing MongoDB connection...");

    await mongoose.connection.close();

    process.exit(0);

});