// const User = require('../models/User');
// const OTP = require('../models/OTP');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const {sendOTPEmail} = require('../utils/email');
// // const dotenv = require('dotenv');
// const jwt = require('jsonwebtoken');



// const generateToken = (id, role) => {
//     return jwt.sign({id, role}, process.env.JWT_SECRET, {expiresIn: '7d'});
// }



// // Register User
// exports.register = async (req, res) => {
//     const {name, email, password} = req.body;

//     let userExists = await User .findOne({email});
//     if(userExists) {
//         return res.status(400).json({error: 'User already exists'});
//     }

//     const salt = await bcrypt.genSalt(10);                                           // genSalt(10) → creates a random salt + sets hashing complexity
//     const hashedPassword = await bcrypt.hash(password, salt);

//     try {
//         const user = new User.create({name, email, password: hashedPassword, role: 'user', isVerified: false});                  // create new user with default role 'user'.

//         const otp = Math.floor(100000 + Math.random() * 900000).toString();                 // Generate 6-digit OTP
//         console.log(`OTP for ${email}: ${otp}`);   
//         await OTP.create({email, otp, action: 'account_verification'});                                                    // Save OTP to DB with action type 'account_verification'
//         await sendOTPEmail(email, otp, 'account_verification');                                                      // Send OTP email, here type is = 'account_verification'                                           

//         res.status(201).json({
//             message: 'User registered successfully. Please verify your email with the OTP sent.',
//             email: user.email
//         });

//     } catch (err) {
//         res.status(500).json({error: 'Server error'});
//     }
// }; 






// // Login User
// exports.login = async (req, res) => {
//     const {email, password} = req.body;

//     let user = await User.findOne({email});
//     if(!user) {
//         return res.status(400).json({error: 'Invalid credentials please register first'});
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if(!isMatch) {
//         return res.status(400).json({error: 'Invalid credentials'});
//     }

//     if(!user.isVerified && user.role === 'user') {

//         // This is only for the users and not for the Admin.
//         // when user tries to login without verifying email, we will generate new OTP and send it to their email for verification(similar to the register user). 
//         // This is to ensure that user can verify their account,
//         //  even if they missed the OTP email during registration or if the OTP expired(expiry time is 3 minutes).

//         const otp = Math.floor(100000 + Math.random() * 900000).toString();                     // Generate 6-digit OTP
//         await OTP.deleteMany({email, otp, action: 'account_verification'});                                                    // Delete all old OTP from the DB of that same user_id.
//         await OTP.create({email, otp, action: 'account_verification'});                                                    // Save OTP to DB with action type 'account_verification'
//         await sendOTPEmail(email, otp, 'account_verification'); 

//         return res.status(400).json({
//             error: 'Account not verified. Please check your email for the new OTP.'
//         });
//     }

//     res.json ({
//         message: 'Login successful',

//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         token: generateToken(user._id, user.role)
//     });
// };






// // verify OTP
// exports.verifyOTP = async (req, res) => {
//     const {email, otp} = req.body;

//     const otpRecord = await OTP.findOne({email, otp, action: 'account_verification'});

//     if (!otpRecord) {
//         return res.status(400).json({error: 'Invalid or expired OTP'});
//     }

//     // Delete the used OTP
//     await OTP.deleteMany({email, otp, action: 'account_verification'});                         

//     // Update user as verified
//     const user = await User.findOneAndUpdate(
//         {email},
//         {isVerified: true},
//         // {new: true}
//     );

//     res.json({
//         message: 'OTP verified successfully, you are logged in now',
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         token: generateToken(user._id, user.role)
//     });
// };

























const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../utils/email');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'user', // Hardcoded to prevent frontend passing role
            isVerified: false
        });

        const otp = generateOTP();
        await OTP.create({ email, otp, action: 'account_verification' });
        await sendOTPEmail(email, otp, 'account_verification');

        res.status(201).json({
            message: 'OTP sent to email. Please verify.',
            email: user.email
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        if (!user.isVerified && user.role !== 'admin') {
            const otp = generateOTP();
            await OTP.findOneAndDelete({ email: user.email, action: 'account_verification' });
            await OTP.create({ email: user.email, otp, action: 'account_verification' });
            await sendOTPEmail(user.email, otp, 'account_verification');
            return res.status(403).json({ message: 'Account not verified', needsVerification: true, email: user.email });
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const validOTP = await OTP.findOne({ email, otp, action: 'account_verification' });

        if (!validOTP) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { returnDocument: 'after'  });
        await OTP.deleteOne({ _id: validOTP._id }); // Delete OTP after usage

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};