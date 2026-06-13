const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth.js');
const eventRoutes = require('./routes/events.js');
const bookingRoutes = require('./routes/booking.js');


dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());


//Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);



// Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI)
// .then(() => {
//     console.log('MongoDB connected');
// })
// .catch((err) => {
//     console.log(err)
// });

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('MongoDB connected');
    console.log('Database:', mongoose.connection.name);
})
.catch(console.error);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});