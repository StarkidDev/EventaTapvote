-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'organizer', 'voter');
CREATE TYPE organizer_status AS ENUM ('pending', 'approved', 'blocked');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_provider AS ENUM ('stripe', 'paystack');

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'voter',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create organizers table
CREATE TABLE public.organizers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  phone TEXT,
  status organizer_status DEFAULT 'pending',
  total_earnings DECIMAL(10, 2) DEFAULT 0,
  withdrawable_balance DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID NOT NULL REFERENCES public.organizers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  banner_url TEXT,
  vote_price DECIMAL(10, 2) NOT NULL CHECK (vote_price > 0),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  total_votes INTEGER DEFAULT 0,
  total_revenue DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (end_date > start_date)
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create contestants table
CREATE TABLE public.contestants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create votes table
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voter_email TEXT NOT NULL,
  contestant_id UUID NOT NULL REFERENCES public.contestants(id) ON DELETE CASCADE,
  payment_id UUID NOT NULL REFERENCES public.payments(id),
  vote_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  voter_email TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  vote_count INTEGER NOT NULL,
  provider payment_provider NOT NULL,
  provider_reference TEXT UNIQUE,
  status payment_status DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create withdrawals table
CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID NOT NULL REFERENCES public.organizers(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  payment_details JSONB,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create platform_settings table
CREATE TABLE public.platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  commission_rate DECIMAL(5, 2) DEFAULT 10.0,
  min_withdrawal_amount DECIMAL(10, 2) DEFAULT 10.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default platform settings
INSERT INTO public.platform_settings (commission_rate, min_withdrawal_amount) 
VALUES (10.0, 10.0);

-- Create indexes for better performance
CREATE INDEX idx_events_organizer ON public.events(organizer_id);
CREATE INDEX idx_events_dates ON public.events(start_date, end_date);
CREATE INDEX idx_categories_event ON public.categories(event_id);
CREATE INDEX idx_contestants_category ON public.contestants(category_id);
CREATE INDEX idx_votes_contestant ON public.votes(contestant_id);
CREATE INDEX idx_payments_event ON public.payments(event_id);
CREATE INDEX idx_payments_status ON public.payments(status);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizers_updated_at BEFORE UPDATE ON public.organizers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contestants_updated_at BEFORE UPDATE ON public.contestants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'full_name',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'voter')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update vote counts and revenue
CREATE OR REPLACE FUNCTION update_vote_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update contestant vote count
  UPDATE public.contestants
  SET vote_count = vote_count + NEW.vote_count
  WHERE id = NEW.contestant_id;
  
  -- Update event stats
  UPDATE public.events e
  SET 
    total_votes = total_votes + NEW.vote_count,
    total_revenue = total_revenue + p.amount
  FROM public.payments p
  WHERE p.id = NEW.payment_id
    AND e.id = p.event_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for vote stats update
CREATE TRIGGER update_stats_on_vote
  AFTER INSERT ON public.votes
  FOR EACH ROW EXECUTE FUNCTION update_vote_stats();

-- RLS Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contestants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Organizers policies
CREATE POLICY "Anyone can view approved organizers" ON public.organizers
  FOR SELECT USING (status = 'approved' OR user_id = auth.uid());

CREATE POLICY "Organizers can update their own profile" ON public.organizers
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can create organizer profile" ON public.organizers
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Events policies
CREATE POLICY "Anyone can view active events" ON public.events
  FOR SELECT USING (is_active = true OR organizer_id IN (
    SELECT id FROM public.organizers WHERE user_id = auth.uid()
  ));

CREATE POLICY "Organizers can create events" ON public.events
  FOR INSERT WITH CHECK (organizer_id IN (
    SELECT id FROM public.organizers WHERE user_id = auth.uid() AND status = 'approved'
  ));

CREATE POLICY "Organizers can update their own events" ON public.events
  FOR UPDATE USING (organizer_id IN (
    SELECT id FROM public.organizers WHERE user_id = auth.uid()
  ));

-- Categories policies
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Organizers can manage categories" ON public.categories
  FOR ALL USING (event_id IN (
    SELECT id FROM public.events WHERE organizer_id IN (
      SELECT id FROM public.organizers WHERE user_id = auth.uid()
    )
  ));

-- Contestants policies
CREATE POLICY "Anyone can view contestants" ON public.contestants
  FOR SELECT USING (true);

CREATE POLICY "Organizers can manage contestants" ON public.contestants
  FOR ALL USING (category_id IN (
    SELECT id FROM public.categories WHERE event_id IN (
      SELECT id FROM public.events WHERE organizer_id IN (
        SELECT id FROM public.organizers WHERE user_id = auth.uid()
      )
    )
  ));

-- Votes policies
CREATE POLICY "Anyone can create votes" ON public.votes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Organizers can view votes for their events" ON public.votes
  FOR SELECT USING (contestant_id IN (
    SELECT c.id FROM public.contestants c
    JOIN public.categories cat ON c.category_id = cat.id
    JOIN public.events e ON cat.event_id = e.id
    WHERE e.organizer_id IN (
      SELECT id FROM public.organizers WHERE user_id = auth.uid()
    )
  ));

-- Payments policies
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (voter_email = auth.jwt()->>'email' OR event_id IN (
    SELECT id FROM public.events WHERE organizer_id IN (
      SELECT id FROM public.organizers WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Anyone can create payments" ON public.payments
  FOR INSERT WITH CHECK (true);

-- Withdrawals policies
CREATE POLICY "Organizers can view their withdrawals" ON public.withdrawals
  FOR SELECT USING (organizer_id IN (
    SELECT id FROM public.organizers WHERE user_id = auth.uid()
  ));

CREATE POLICY "Organizers can create withdrawals" ON public.withdrawals
  FOR INSERT WITH CHECK (organizer_id IN (
    SELECT id FROM public.organizers WHERE user_id = auth.uid()
  ));

-- Platform settings policies
CREATE POLICY "Anyone can view platform settings" ON public.platform_settings
  FOR SELECT USING (true);

-- Admin-only policies (requires custom claim in JWT)
CREATE POLICY "Admins can do everything" ON public.users
  FOR ALL USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admins can manage organizers" ON public.organizers
  FOR ALL USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admins can manage platform settings" ON public.platform_settings
  FOR ALL USING (auth.jwt()->>'role' = 'admin');