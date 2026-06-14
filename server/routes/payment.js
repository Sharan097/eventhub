const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

router.post("/create-checkout-session", protect, paymentController.createCheckoutSession);
router.get("/verify/:sessionId", protect, paymentController.verifySession);

// Note: The actual '/webhook' route is handled in index.js to manage body parsing, 
// but if you want to keep it here, ensure index.js routes it properly. 
// Since we used `app.use('/api/payments/webhook', ...)` in index.js, 
// the webhook route is already covered.

module.exports = router;