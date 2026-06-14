// import React from 'react';
// import { Link } from 'react-router-dom';
// import { FaCheckCircle } from 'react-icons/fa';

// const PaymentSuccess = () => {
//     return (
//         <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
//             <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border-t-8 border-green-500 transform transition-all hover:-translate-y-1">
//                 <FaCheckCircle className="text-green-500 text-7xl mx-auto mb-6 drop-shadow-sm" />
//                 <h1 className="text-4xl font-black text-gray-900 mb-4">Booking Confirmed!</h1>
//                 <p className="text-gray-500 mb-8 text-lg">Your ticket has been booked successfully. A confirmation email has been sent to your registered email address.</p>
//                 <div className="space-y-4">
//                     <Link to="/dashboard" className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition shadow-lg hover:shadow-xl">
//                         View My Tickets
//                     </Link>
//                     <Link to="/" className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-xl transition">
//                         Discover More Events
//                     </Link>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default PaymentSuccess;


















import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import api from '../utils/axios'; 

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const [status, setStatus] = useState("verifying");

    useEffect(() => {
        const verifyPayment = async () => {
            // If someone just types /payment-success in the URL without a session ID
            if (!sessionId) {
                setStatus("invalid");
                return;
            }

            try {
                const { data } = await api.get(`/payments/verify/${sessionId}`);
                if (data.paid) {
                    setStatus("success");
                } else {
                    setStatus("invalid");
                }
            } catch (error) {
                console.error("Payment verification failed:", error);
                setStatus("invalid");
            }
        };

        verifyPayment();
    }, [sessionId]);

    if (status === "verifying") {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
                <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border-t-8 border-indigo-500">
                    <FaSpinner className="text-indigo-500 text-6xl mx-auto mb-6 animate-spin drop-shadow-sm" />
                    <h1 className="text-3xl font-black text-gray-900 mb-4">Verifying Payment</h1>
                    <p className="text-gray-500 text-lg">Please wait a moment while we securely confirm your booking with Stripe.</p>
                </div>
            </div>
        );
    }

    if (status === "invalid") {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
                <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border-t-8 border-red-500 transform transition-all hover:-translate-y-1">
                    <FaTimesCircle className="text-red-500 text-7xl mx-auto mb-6 drop-shadow-sm" />
                    <h1 className="text-4xl font-black text-gray-900 mb-4">Verification Failed</h1>
                    <p className="text-gray-500 mb-8 text-lg">We couldn't verify this transaction. If you were charged, please contact support.</p>
                    <Link to="/" className="block w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-xl transition shadow-lg hover:shadow-xl">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    // Original UI completely preserved for the successful state
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
            <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border-t-8 border-green-500 transform transition-all hover:-translate-y-1">
                <FaCheckCircle className="text-green-500 text-7xl mx-auto mb-6 drop-shadow-sm" />
                <h1 className="text-4xl font-black text-gray-900 mb-4">Booking Confirmed!</h1>
                <p className="text-gray-500 mb-8 text-lg">Your ticket has been booked successfully. A confirmation email has been sent to your registered email address.</p>
                <div className="space-y-4">
                    <Link to="/dashboard" className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition shadow-lg hover:shadow-xl">
                        View My Tickets
                    </Link>
                    <Link to="/" className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-xl transition">
                        Discover More Events
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;