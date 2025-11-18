-- Initial Schema for Academic Services Platform
-- This migration sets up all necessary tables, indexes, and RLS policies

-- Profiles table for user information
-- Extends Supabase Auth users with additional profile data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table for academic services offered by tutors
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  delivery_days INTEGER NOT NULL CHECK (delivery_days > 0),
  category TEXT NOT NULL CHECK (category IN (
    'essay_writing',
    'research_papers',
    'tutoring',
    'homework_help',
    'proofreading',
    'editing',
    'presentation',
    'other'
  )),
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_reviews INTEGER DEFAULT 0 CHECK (total_reviews >= 0),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  tutor_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table for service orders placed by clients
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES services(id) NOT NULL,
  client_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  requirements TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table for service reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES services(id) NOT NULL,
  client_id UUID REFERENCES profiles(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(service_id, client_id) -- One review per service per client
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_services_tutor_id ON services(tutor_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_rating ON services(rating);
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_service_id ON orders(service_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_reviews_service_id ON reviews(service_id);
CREATE INDEX IF NOT EXISTS idx_reviews_client_id ON reviews(client_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
-- Users can view own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can insert own profile (automatic on signup)
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Services RLS Policies
-- Anyone can view active services
CREATE POLICY "Anyone can view active services" ON services
    FOR SELECT USING (is_active = true);

-- Tutors can manage own services
CREATE POLICY "Tutors can manage own services" ON services
    FOR ALL USING (auth.uid() = tutor_id);

-- Orders RLS Policies
-- Users can view own orders (as client or tutor)
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (
        auth.uid() = client_id OR
        auth.uid() IN (SELECT tutor_id FROM services WHERE services.id = orders.service_id)
    );

-- Clients can create orders
CREATE POLICY "Clients can create orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Service providers can update order status
CREATE POLICY "Service providers can update order status" ON orders
    FOR UPDATE USING (
        auth.uid() IN (SELECT tutor_id FROM services WHERE services.id = orders.service_id)
    );

-- Reviews RLS Policies
-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews" ON reviews
    FOR SELECT USING (true);

-- Clients can create reviews for services they've ordered
CREATE POLICY "Clients can create reviews" ON reviews
    FOR INSERT WITH CHECK (
        auth.uid() = client_id AND
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.service_id = reviews.service_id
            AND orders.client_id = auth.uid()
            AND orders.status = 'completed'
        )
    );

-- Clients can update own reviews
CREATE POLICY "Clients can update own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = client_id);

-- Function to update service rating when reviews are added/updated
CREATE OR REPLACE FUNCTION update_service_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE services
    SET
        rating = COALESCE(
            (SELECT AVG(rating) FROM reviews WHERE reviews.service_id = NEW.service_id),
            0
        ),
        total_reviews = (
            SELECT COUNT(*) FROM reviews WHERE reviews.service_id = NEW.service_id
        )
    WHERE id = NEW.service_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update service ratings
CREATE TRIGGER update_service_rating_on_insert
    AFTER INSERT ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_service_rating();

CREATE TRIGGER update_service_rating_on_update
    AFTER UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_service_rating();

CREATE TRIGGER update_service_rating_on_delete
    AFTER DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_service_rating();

-- Function to create profile automatically on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (new.id, new.raw_user_meta_data->>'full_name');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();