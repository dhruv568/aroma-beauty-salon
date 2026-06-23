# Aroma Beauty Salon 🌸✨

A premium, modern, and fully responsive web application for **Aroma Beauty Salon** designed with elegant dark/light theme options, smooth scroll animations, a real-time booking calendar, Razorpay payment gateway integration, and a comprehensive Admin Control Panel.

---

## 🌟 Key Features

### 💻 Client Experience
- **Elegant & Premium UI**: Styled with a tailored color palette (cream-light, forest-green, and gold accents) using responsive typography.
- **Dynamic Theme Toggle**: Instantly switch between premium Light Mode and dark-glamour Dark Mode.
- **Treatments Catalog**: Categorized services (Hair, Skin, Nails, Bridal) with interactive search and instant price updates.
- **Real-Time Booking Scheduler**:
  - Live calendar displaying date and time slots.
  - Automatically filters out salon holidays and slots already booked.
  - Optional custom staff/expert selection ("Any Expert" or specific professional).
- **Secure Payment Gateway**: Fully integrated checkout with Razorpay for online transactions (along with Pay-at-Salon option).
- **Smooth Animations**: Interactive parallax backgrounds and smooth navigation scroll animations.

### 🔑 Admin Control Panel (`/admin`)
A secure, feature-rich dashboard for salon management:
- **Dashboard Overview**: Quick stats on today's appointments, active staff, revenue, and pending reviews.
- **Interactive Calendar**: View, track, and manage all bookings day-by-day.
- **Services Management**: Add, update prices, or toggle active status of salon treatments.
- **Staff Management**: Configure working experts, roles, and profiles.
- **Coupon & Offers Manager**: Create and customize active discounts (Flat rate or Percentage).
- **Reviews & Moderation**: View customer ratings and approve/reply to reviews to display on the homepage.
- **Holiday Planner**: Schedule salon off-days to automatically block booking slots.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, API Routes)
- **Frontend**: React, TypeScript, Vanilla CSS Modules
- **Database / ORM**: Prisma ORM (supports local JSON file-based database fallback automatically)
- **Payments**: Razorpay Checkout API
- **Animations**: Custom CSS Transitions, keyframe key animations

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.x or higher)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/dhruv568/aroma-beauty-salon.git
   cd aroma-beauty-salon
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the salon landing page.

---

## 🔐 Default Admin Credentials

To manage salon bookings, services, and offers, navigate to `/admin` and log in with:
* **Username / Email**: `anju@aroma`
* **Password**: `admin123`

---

## 📁 Project Structure

```
├── prisma/               # Database schemas & JSON backup storage
├── public/               # Static assets, branding logo, and media files
└── src/
    ├── app/              # Next.js pages, Admin views, and API endpoints
    ├── components/       # Reusable React components (InteractiveBackground, etc.)
    └── lib/              # Mock data services, helper utilities, and database clients
```
