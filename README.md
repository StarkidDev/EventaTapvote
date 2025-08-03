# Eventa - Online Voting Platform

Eventa is a web-based platform that allows event organizers to host paid voting events and enables the public to vote by paying through Stripe (card payments) and Paystack (Mobile Money).

## Features

### 🎛 Organizer Features
- Register and log in
- Create events with title, description, banner image, start/end dates
- Add award/election categories
- Add contestants under each category
- Set vote prices (e.g., ₵1 = 1 vote)
- View real-time vote counts
- View and withdraw earnings (after platform commission)

### 🗳 Voter Features
- Browse available events
- Select category and contestant
- Pay to vote using Stripe or Paystack Mobile Money
- Confirm vote success and see updated tally

### 🛡 Admin Features
- Manage organizers (approve/block)
- Set platform commission rate
- View total platform metrics (users, earnings, votes cast)

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage, Realtime)
- **Payments**: Stripe, Paystack
- **Deployment**: Vercel (recommended)

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- Supabase account
- Stripe account
- Paystack account

### 2. Clone and Install

```bash
git clone <repository-url>
cd eventa
npm install
```

### 3. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Run the database schema:
   - Go to SQL Editor in Supabase Dashboard
   - Copy and run the contents of `supabase/schema.sql`
   - Then run the contents of `supabase/storage.sql`

3. Enable Email Authentication:
   - Go to Authentication > Providers
   - Enable Email provider

4. Get your Supabase credentials:
   - Go to Settings > API
   - Copy the `URL` and `anon public` key

### 4. Payment Gateway Setup

#### Stripe Setup
1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard

#### Paystack Setup
1. Create a Paystack account at [paystack.com](https://paystack.com)
2. Get your API keys from the Paystack Dashboard

### 5. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key

# Platform
NEXT_PUBLIC_PLATFORM_COMMISSION=0.1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
eventa/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── contexts/         # React contexts (Auth)
│   ├── lib/             # Utility libraries
│   └── types/           # TypeScript types
├── supabase/            # Database schemas
└── public/              # Static assets
```

## Database Schema

The platform uses the following main tables:
- `users` - User accounts with roles (admin, organizer, voter)
- `organizers` - Organizer profiles
- `events` - Voting events
- `categories` - Award/election categories
- `contestants` - Contestants in categories
- `votes` - Vote records
- `payments` - Payment transactions
- `withdrawals` - Organizer withdrawal requests

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add all environment variables
4. Deploy

### Configure Webhooks

After deployment, configure webhooks for payment providers:
- Stripe: Add webhook endpoint `https://your-domain.com/api/webhooks/stripe`
- Paystack: Add webhook URL `https://your-domain.com/api/webhooks/paystack`

## Security Features

- Row Level Security (RLS) policies for data access
- Role-based access control
- Secure payment processing
- Protected API routes

## Future Enhancements

The platform is built with a modular architecture to support:
- Free voting events
- Event ticketing
- USSD voting
- SMS notifications
- Advanced analytics
- Multi-language support

## Support

For issues or questions, please create an issue in the repository.

## License

This project is licensed under the MIT License.
