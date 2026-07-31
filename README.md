# 🎉 EventHub - Full Stack Event Management & Booking Platform

A modern, full-stack event management and ticket booking platform built with **React (Vite), Node.js, Express.js, and MongoDB**. EventHub enables users to discover events, book tickets securely, manage bookings, and receive instant email confirmations through a seamless and responsive user experience.

---

## 🌐 Live Demo

- **Frontend:** https://eventhub-smoky.vercel.app
- **Backend API:** https://eventhub-vvts.onrender.com

---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based user authentication
- Secure Login & Signup
- Real-time Email OTP verification
- Protected routes and authenticated API access

### 🎟 Event & Booking Management
- Browse available events
- Create, Read, Update, and Delete (CRUD) event data
- Dynamic ticket reservation system
- Booking history and management

### 💳 Secure Payments
- Stripe Payment Gateway integration
- Real-time payment processing
- Production-ready Stripe Webhooks for automatic booking confirmation

### 📧 Email Notifications
- Email OTP verification using Nodemailer
- Booking confirmation emails
- Reliable transactional email delivery

### 📱 Responsive Design
- Mobile-first responsive UI
- Optimized for Desktop, Tablet, and Mobile
- Modern interface built with Tailwind CSS

---

## 🛠 Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- Context API

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose

### Authentication
- JWT Authentication
- Email OTP Verification

### Payment Integration
- Stripe API
- Stripe Webhooks

### Deployment
- Vercel (Frontend)
- Render (Backend)

### Development Tools
- VS Code
- Git & GitHub
- Postman
- Stripe CLI

---

## 🚀 Key Highlights

- ✅ JWT Authentication with Email OTP verification
- ✅ Full CRUD Event Management
- ✅ Dynamic Ticket Booking System
- ✅ Stripe Payment Integration with Webhooks
- ✅ Email Notifications using Nodemailer
- ✅ RESTful API Architecture
- ✅ Fully Responsive UI
- ✅ Deployed on Vercel & Render

---

## 📂 Project Architecture

```
Frontend (React + Vite)
        │
        ▼
REST API (Express.js)
        │
        ▼
MongoDB Atlas Database
        │
        ▼
JWT Authentication
Email OTP Verification
Stripe Payment Gateway
Nodemailer Email Service
```

---

## ⚙️ Installation

### Clone the Repository

```bash
git clone https://github.com/your-username/eventhub.git
cd eventhub
```

### Install Dependencies

#### Frontend

```bash
cd client
npm install
npm run dev
```

#### Backend

```bash
cd server
npm install
npm run dev
```

---

## 🔑 Environment Variables

Create a `.env` file in the backend directory and configure the following variables:

```env
PORT=

MONGODB_URI=

JWT_SECRET=

EMAIL_USER=
EMAIL_PASS=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

FRONTEND_URL=
```

---

## 📸 Screenshots

> Add screenshots or GIFs of the application here.

- Home Page
- Event Details
- Booking Page
- Payment Page
- User Dashboard

---

## 📄 License

This project is developed for learning and portfolio purposes.
