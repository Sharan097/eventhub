// const Stripe = require("stripe");
// const mongoose = require("mongoose");
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// const Event = require("../models/Event");
// const Booking = require("../models/Booking");

// exports.createCheckoutSession = async (req, res) => {
//   try {
//     const { eventId } = req.body;
//     const userId = req.user._id;

//     const event = await Event.findById(eventId);
//     if (!event) return res.status(404).json({ message: "Event not found" });

//     // Duplicate Ticket Purchase Protection
//     const existingBooking = await Booking.findOne({
//       userId: userId,
//       eventId: eventId,
//       paymentStatus: "paid"
//     });

//     if (existingBooking) {
//       return res.status(400).json({ message: "You have already purchased a ticket for this event." });
//     }

//     if (event.availableSeats <= 0) {
//       return res.status(400).json({ message: "This event is sold out." });
//     }

//     // CRITICAL FIX: Ensure CLIENT_URL exists, fallback to localhost if missing from .env
//     const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       mode: "payment",
//       line_items: [
//         {
//           price_data: {
//             currency: "inr", // Ensure your Stripe account supports INR, or change to "usd" for testing
//             product_data: { name: event.title },
//             // CRITICAL FIX: Math.round ensures no decimal places crash the Stripe API
//             unit_amount: Math.round(event.ticketPrice * 100), 
//           },
//           quantity: 1,
//         },
//       ],
//       success_url: `${clientUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${clientUrl}/payment-failed`,
//       metadata: {
//         userId: userId.toString(),
//         eventId: event._id.toString(),
//       },
//     });

//     res.json({ url: session.url });
//   } catch (error) {
//     // CRITICAL FIX: Log the exact Stripe error to the backend terminal
//     console.error("❌ STRIPE SESSION ERROR:", error.message);
//     res.status(500).json({ message: "Session creation failed", error: error.message });
//   }
// };

// exports.handleWebhook = async (req, res) => {
//   const sig = req.headers["stripe-signature"];
//   let stripeEvent;

//   try {
//     stripeEvent = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
//   } catch (err) {
//     console.error("❌ Webhook Signature Error:", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   if (stripeEvent.type === "checkout.session.completed") {
//     const session = stripeEvent.data.object;
    
//     const existing = await Booking.findOne({ stripeSessionId: session.id });
//     if (existing) return res.sendStatus(200);

//     const dbSession = await mongoose.startSession();
//     dbSession.startTransaction();

//     try {
//       const updatedEvent = await Event.findOneAndUpdate(
//         { _id: session.metadata.eventId, availableSeats: { $gt: 0 } },
//         { $inc: { availableSeats: -1 } },
//         { new: true, session: dbSession }
//       );

//       if (!updatedEvent) {
//         console.log(`Oversell prevented for event ${session.metadata.eventId}.`);
//         await dbSession.abortTransaction();
//         return res.sendStatus(200); 
//       }

//       await Booking.create([{
//         userId: session.metadata.userId,
//         eventId: session.metadata.eventId,
//         paymentStatus: "paid",
//         status: "confirmed",
//         amount: session.amount_total / 100,
//         stripeSessionId: session.id,
//         paymentMethod: "stripe"
//       }], { session: dbSession });

//       await dbSession.commitTransaction();
//       console.log(`✅ Booking confirmed via Stripe for session ${session.id}`);

//     } catch (error) {
//       await dbSession.abortTransaction();
//       console.error("❌ Transaction failed:", error);
//     } finally {
//       dbSession.endSession();
//     }
//   }

//   res.sendStatus(200);
// };

// exports.verifySession = async (req, res) => {
//   try {
//     const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
//     res.json({ paid: session.payment_status === "paid" });
//   } catch (error) {
//     res.status(400).json({ paid: false, message: "Invalid session" });
//   }
// };























const Stripe = require("stripe");
const mongoose = require("mongoose");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Event = require("../models/Event");
const Booking = require("../models/Booking");

exports.createCheckoutSession = async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const existingBooking = await Booking.findOne({
      userId: userId,
      eventId: eventId,
      paymentStatus: "paid"
    });

    if (existingBooking) {
      return res.status(400).json({ message: "You have already purchased a ticket for this event." });
    }

    if (event.availableSeats <= 0) {
      return res.status(400).json({ message: "This event is sold out." });
    }

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: event.title },
            unit_amount: Math.round(event.ticketPrice * 100), 
          },
          quantity: 1,
        },
      ],
      success_url: `${clientUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/payment-failed`,
      metadata: {
        userId: userId.toString(),
        eventId: event._id.toString(),
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("❌ STRIPE SESSION ERROR:", error.message);
    res.status(500).json({ message: "Session creation failed", error: error.message });
  }
};

// Helper function to handle booking securely
const processSuccessfulPayment = async (session) => {
    const existing = await Booking.findOne({ stripeSessionId: session.id });
    if (existing) return; // Prevent duplicates

    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    try {
      const updatedEvent = await Event.findOneAndUpdate(
        { _id: session.metadata.eventId, availableSeats: { $gt: 0 } },
        { $inc: { availableSeats: -1 } },
        { returnDocument: "after", session: dbSession }
      );

      if (!updatedEvent) {
        console.log(`Oversell prevented for event ${session.metadata.eventId}.`);
        await dbSession.abortTransaction();
        return; 
      }

      await Booking.create([{
        userId: session.metadata.userId,
        eventId: session.metadata.eventId,
        paymentStatus: "paid",
        status: "pending",     // Admin approval workflow
        amount: session.amount_total / 100,
        stripeSessionId: session.id,
        paymentMethod: "stripe"
      }], { session: dbSession });

      await dbSession.commitTransaction();
      console.log(`✅ Booking processed securely for session ${session.id}`);

    } catch (error) {
      await dbSession.abortTransaction();
      if (error.code === 11000) {
        console.log(`⚡ Concurrency shield blocked duplicate for ${session.id}`);
        return; 
      }
      console.error("❌ Transaction failed:", error);
    } finally {
      dbSession.endSession();
    }
};

exports.handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (stripeEvent.type === "checkout.session.completed") {
    await processSuccessfulPayment(stripeEvent.data.object);
  }

  res.sendStatus(200);
};

exports.verifySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.json({ paid: false });
    }

    // Polling System: Wait for webhook to finish writing to Database
    let bookingExists = false;
    let attempts = 0;

    while (!bookingExists && attempts < 5) {
      const booking = await Booking.findOne({ stripeSessionId: sessionId });
      if (booking) {
        bookingExists = true;
      } else {
        attempts++;
        console.log(`⏳ Verification waiting for Webhook DB Write... (Attempt ${attempts}/5)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Safety Fallback: If webhook fails (e.g., CLI tunnel down), create booking here safely
    if (!bookingExists) {
        console.log(`⚠️ Webhook not detected. Running safety fallback write...`);
        await processSuccessfulPayment(session);
    }

    return res.json({ paid: true });

  } catch (error) {
    console.error("❌ Verification error:", error.message);
    return res.status(400).json({ paid: false, message: "Invalid session" });
  }
};