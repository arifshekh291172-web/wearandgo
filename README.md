# 🛍️ WEAR & GO — Luxury Fashion E-Commerce Platform

> **Wear & Go** is a full-stack, production-ready luxury fashion e-commerce web application featuring high-end design aesthetics, complete catalog browsing, real-time cart and checkout, coupon engines, order tracking timelines, and an end-to-end administration dashboard.

![Wear & Go Logo](frontend/public/logo.png)

---

## 🌟 Key Features

### 👗 Storefront & Customer Experience
- **Luxury Haute Atelier Design**: Obsidian dark mode with metallic gold accents, glassmorphic headers, and responsive layouts.
- **Dynamic Hero Slider**: High-fashion campaign slides with seasonal CTAs.
- **Complete Product Catalog**: 16 fashion items across 6 categories (Suits, Dresses, Silk Shirts, Footwear, Leather, Knitwear).
- **Interactive Shop Page**: Comprehensive filtering by Category, Gender, Price Range, Rating, Availability, and Discounts.
- **Rich Product Detail**: Multi-angle image switcher, size/color selectors, PIN code delivery checker, and customer reviews.
- **Cart & Bag Engine**: Quantity adjuster, size tags, free delivery progress bar, and promotional coupons (`WELCOME10`, `STYLE20`, `FLAT500`).
- **Checkout & Payments**: Cash on Delivery (COD) and Online UPI/Card payments with Razorpay integration.
- **Order Tracking**: 6-stage interactive timeline (*Placed ➔ Confirmed ➔ Packed ➔ Shipped ➔ Out for Delivery ➔ Delivered*).
- **Tax Invoices**: Printable GST-compliant tax invoices with store branding.
- **Customer Accounts**: Saved addresses, wishlist, order history, and profile manager.

### 👑 Comprehensive Admin Panel (`/admin`)
- **Dashboard Overview**: Real-time sales revenue, order volumes, customer registrations, and active inventory stats.
- **Product Management**: Full CRUD (Create, Read, Update, Delete) with image uploading, variants, and stock management.
- **Order Management**: Status workflow manager (*Pending, Confirmed, Shipped, Delivered, Cancelled*) with courier tracking.
- **Category & Banner Manager**: Organize fashion collections and customize hero slider banners.
- **Coupons & Discounts**: Create percentage or flat discounts with minimum order thresholds.
- **User & Review Moderation**: Manage customer accounts and approve/reject user reviews.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, React Router DOM
- **Backend**: Node.js, Express.js, Mongoose ODM
- **Database**: MongoDB Atlas Cluster (`wearandgo`)
- **Security & Authentication**: JWT (JSON Web Tokens), bcryptjs, Helmet, CORS, Rate Limiting
- **Payments**: Razorpay Gateway (Test & Live ready)
- **Deployment**: Render Web Service & Blueprint (`render.yaml`)

---

## 🚀 Live Render Deployment Guide

### Option 1: Automatic Blueprint (Recommended)
1. Push this repository to your GitHub account as `wearandgo`.
2. Go to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** ➔ **Blueprint**.
4. Connect your `wearandgo` repository.
5. Render will automatically detect [`render.yaml`](./render.yaml), configure environment variables, build the React frontend, and deploy the Express server on a single URL (e.g. `https://wearandgo.onrender.com`).

### Option 2: Manual Web Service
1. In Render, select **New +** ➔ **Web Service**.
2. Connect your GitHub repository.
3. Configure the following settings:
   - **Name**: `wearandgo`
   - **Environment**: `Node`
   - **Region**: `Oregon (US West)` or nearest
   - **Branch**: `main`
   - **Build Command**: `npm run render-build`
   - **Start Command**: `npm start`
4. Add the following **Environment Variables**:
   | Variable | Value |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `MONGO_URI` | `mongodb+srv://arifshekh291172_db_user:YIqAIbzBsg66mEzo@cluster0.p6djmsf.mongodb.net/wearandgo?retryWrites=true&w=majority` |
   | `JWT_SECRET` | *(Any secure random 32-character string)* |
   | `JWT_EXPIRE` | `7d` |
   | `CLIENT_URL` | `https://wearandgo.onrender.com` |
5. Click **Create Web Service**. Your store will be live in 2–3 minutes!

---

## 💻 Local Development Setup

### 1. Prerequisites
- Node.js v18 or higher
- Git

### 2. Clone & Install
```bash
# Clone the repository
git clone https://github.com/<your-username>/wearandgo.git
cd wearandgo

# Install all dependencies
npm run render-build
```

### 3. Start Local Development
```bash
# In Terminal 1 - Backend Server (Port 5000)
cd backend
node server.js

# In Terminal 2 - Frontend Dev Server (Port 5173)
cd frontend
npm run dev
```

Visit **http://localhost:5173** in your browser.

---

## 🔑 Demo Credentials

### 👑 Store Administrator
- **URL**: `http://localhost:5173/admin/dashboard`
- **Email**: `admin@wearandgo.com`
- **Password**: `Admin@123456`

### 👤 Sample Customer
- **Email**: `rahul@example.com`
- **Password**: `User@123456`

### 🎟️ Active Coupons
- `WELCOME10` — 10% Flat Discount
- `STYLE20` — 20% Off on orders above ₹1,999
- `FLAT500` — ₹500 Off on orders above ₹2,999

---

## 📄 License
This project is licensed under the MIT License.
