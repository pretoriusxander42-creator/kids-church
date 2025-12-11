# Fine Dining Restaurant Web Application

A modern, full-stack restaurant web application built with Next.js 14, TypeScript, Tailwind CSS, MongoDB, and Framer Motion.

## Features

### ✨ Core Functionality
- **Homepage** with hero section, featured dishes, and upcoming events
- **Menu Page** with flip-card animations for each dish
- **Reservations** with multi-step form and validation
- **Events Page** with expandable event cards
- **Gallery** with horizontal scroll and lightbox view
- **About Page** with restaurant story and chef profile
- **Contact Page** with form and location details
- **Style Guide** for design system reference

### 🎨 Design
- Dark theme with gold accents
- Floating navigation bar with blur effect
- Smooth page transitions with Framer Motion
- Responsive design for mobile, tablet, and desktop
- Custom typography (Inter + Playfair Display)

### 🗄️ Database & API
- MongoDB with Mongoose ODM
- RESTful API endpoints for Menu, Reservations, Events
- Data models: Reservation, Event, MenuCategory, MenuItem
- Global connection caching for serverless optimization

### 🛠️ Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Database:** MongoDB + Mongoose
- **Email:** Nodemailer (configured, not fully wired)
- **Testing:** Jest + React Testing Library
- **Code Quality:** ESLint + Prettier

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB database (local or Atlas)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Copy `.env.example` to `.env.local` and edit with your values:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm start` - Start production server
- `npm test` - Run Jest tests
- `npm run lint` - Run ESLint

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Set environment variables
4. Deploy!

**Build command:** `npm run build`  
**Start command:** `npm start`  
**Node version:** 18+

## License

MIT
