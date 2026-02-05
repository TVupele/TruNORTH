# TruNORTH Super App - All-in-One Platform for Northern Nigeria

A comprehensive React + TypeScript super app with 12+ services including wallet, travel, tutoring, emergency response, donations, and more.

## Features

- 🏠 **Home Dashboard** - Quick access to all services
- 💰 **Digital Wallet** - Balance, transactions, deposits, withdrawals
- 🤖 **AI Assistant** - Smart chat for health, education, business advice
- ✈️ **Travel Booking** - Search and book travel packages
- 📚 **Tutoring** - Find tutors and book sessions
- 🏥 **Emergency** - Report emergencies with location
- 💝 **Donations** - Crowdfunding campaigns
- 🛒 **Marketplace** - Buy and sell products
- 🎫 **Events** - Event ticketing
- 🕌 **Religious** - Prayer times, mosques, churches
- 👥 **Social** - Community feed
- 👤 **Profile** - User profile management

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Node.js + Express (optional)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + Supabase Auth
- **Deployment**: Vercel (frontend) + Railway/Render (backend)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for database)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Backend (Railway/Render)

1. Deploy `server/` folder
2. Set environment variables
3. Connect to Supabase

## License

MIT

## Author

TruNORTH Team
