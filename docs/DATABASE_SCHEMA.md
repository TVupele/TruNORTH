# TruNORTH Database Schema

## Overview
Complete database schema for the TruNORTH super-app built on Supabase (PostgreSQL).

## Tables

### 1. Users Table
Stores user profiles and authentication data.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'ha')),
  timezone TEXT DEFAULT 'Africa/Lagos',
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin', 'tutor', 'provider', 'dispatcher')),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### 2. Wallets Table
Digital wallet for each user.

```sql
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  balance DECIMAL(18, 2) DEFAULT 0,
  currency TEXT DEFAULT 'NGN',
  is_frozen BOOLEAN DEFAULT FALSE,
  pin_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_wallets_user ON wallets(user_id);
```

### 3. Transactions Table
Wallet transaction history.

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'transfer_in', 'transfer_out', 'payment', 'refund')),
  amount DECIMAL(18, 2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  description TEXT,
  metadata JSONB,
  reference_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_wallet ON transactions(wallet_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created ON transactions(created_at);
```

### 4. Campaigns Table
Crowdfunding/Donation campaigns.

```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_amount DECIMAL(18, 2) NOT NULL,
  raised_amount DECIMAL(18, 2) DEFAULT 0,
  currency TEXT DEFAULT 'NGN',
  image_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('medical', 'education', 'emergency', 'community', 'religious')),
  creator_id UUID REFERENCES users(id),
  creator_name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'paused')),
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_category ON campaigns(category);
CREATE INDEX idx_campaigns_creator ON campaigns(creator_id);
```

### 5. Donations Table
Donation records to campaigns.

```sql
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  donor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  donor_name TEXT,
  amount DECIMAL(18, 2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  message TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  payment_method TEXT,
  reference_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_donations_campaign ON donations(campaign_id);
CREATE INDEX idx_donations_donor ON donations(donor_id);
```

### 6. Emergency Reports Table
Emergency incident reports.

```sql
CREATE TABLE emergency_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('medical', 'fire', 'crime', 'accident', 'natural_disaster', 'other')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location JSONB DEFAULT '{}',
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reporter_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'dispatched', 'resolved', 'cancelled')),
  assigned_to UUID REFERENCES users(id),
  responder_ids UUID[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_emergency_status ON emergency_reports(status);
CREATE INDEX idx_emergency_type ON emergency_reports(type);
CREATE INDEX idx_emergency_severity ON emergency_reports(severity);
```

### 7. Emergency Alerts Table
System-wide emergency alerts.

```sql
CREATE TABLE emergency_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('warning', 'watch', 'advisory', 'info')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  affected_areas TEXT[] DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_alerts_active ON emergency_alerts(is_active);
```

### 8. Products Table
Marketplace products.

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(18, 2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  category TEXT NOT NULL,
  subcategory TEXT,
  images TEXT[] DEFAULT '{}',
  stock_quantity INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  condition TEXT CHECK (condition IN ('new', 'used', 'refurbished')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_available ON products(is_available);
```

### 9. Orders Table
Marketplace orders.

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES users(id),
  seller_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  total_amount DECIMAL(18, 2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded')),
  shipping_address JSONB DEFAULT '{}',
  payment_method TEXT,
  reference_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
```

### 10. Events Table
Events/Ticketing.

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  venue TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  image_url TEXT,
  ticket_price DECIMAL(18, 2) DEFAULT 0,
  currency TEXT DEFAULT 'NGN',
  capacity INTEGER NOT NULL,
  tickets_sold INTEGER DEFAULT 0,
  is_online BOOLEAN DEFAULT FALSE,
  online_url TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(start_date);
CREATE INDEX idx_events_category ON events(category);
```

### 11. Tickets Table
Event tickets.

```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  ticket_type TEXT DEFAULT 'general',
  quantity INTEGER NOT NULL,
  total_price DECIMAL(18, 2) NOT NULL,
  qr_code TEXT UNIQUE,
  status TEXT DEFAULT 'valid' CHECK (status IN ('valid', 'used', 'cancelled', 'refunded')),
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tickets_event ON tickets(event_id);
CREATE INDEX idx_tickets_user ON tickets(user_id);
CREATE INDEX idx_tickets_qr ON tickets(qr_code);
```

### 12. Religious Services Table
Masjid/Church services and events.

```sql
CREATE TABLE religious_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID REFERENCES places(id),
  name TEXT NOT NULL,
  description TEXT,
  day_of_week INTEGER, -- 0=Sunday, 1=Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME,
  language TEXT DEFAULT 'ha',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_services_place ON religious_services(place_id);
```

### 13. Social Posts Table
Community social feed.

```sql
CREATE TABLE social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_posts_user ON social_posts(user_id);
CREATE INDEX idx_posts_public ON social_posts(is_public);
```

### 14. Social Likes Table

```sql
CREATE TABLE social_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_likes_post ON social_likes(post_id);
```

### 15. Social Comments Table

```sql
CREATE TABLE social_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  parent_id UUID REFERENCES social_comments(id),
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_comments_post ON social_comments(post_id);
CREATE INDEX idx_comments_parent ON social_comments(parent_id);
```

### 16. Tutoring Sessions Table

```sql
CREATE TABLE tutoring_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES users(id),
  student_id UUID REFERENCES users(id),
  subject TEXT NOT NULL,
  description TEXT,
  hourly_rate DECIMAL(18, 2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'booked', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tutoring_tutor ON tutoring_sessions(tutor_id);
CREATE INDEX idx_tutoring_student ON tutoring_sessions(student_id);
```

### 17. Bookings Table

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES tutoring_sessions(id),
  tutor_id UUID REFERENCES users(id),
  student_id UUID REFERENCES users(id),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  meeting_link TEXT,
  total_amount DECIMAL(18, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bookings_tutor ON bookings(tutor_id);
CREATE INDEX idx_bookings_student ON bookings(student_id);
CREATE INDEX idx_bookings_scheduled ON bookings(scheduled_at);
```

### 18. AI Chat History Table

```sql
CREATE TABLE ai_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  tokens_used INTEGER,
  model TEXT DEFAULT 'gpt-3.5-turbo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_history_user ON ai_chat_history(user_id);
CREATE INDEX idx_ai_history_session ON ai_chat_history(session_id);
```

### 19. Places Table
Masjids, churches, hospitals, schools.

```sql
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mosque', 'church', 'hospital', 'school', 'police', 'fire_station')),
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone TEXT,
  website TEXT,
  description TEXT,
  opening_hours JSONB,
  is_verified BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_places_type ON places(type);
CREATE INDEX idx_places_location ON places(latitude, longitude);
```

### 20. Travel Routes Table

```sql
CREATE TABLE travel_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  origin_latitude DECIMAL(10, 8),
  origin_longitude DECIMAL(11, 8),
  destination_latitude DECIMAL(10, 8),
  destination_longitude DECIMAL(11, 8),
  distance_km DECIMAL(10, 2),
  estimated_duration_minutes INTEGER,
  transport_modes TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_travel_origin ON travel_routes(origin);
CREATE INDEX idx_travel_destination ON travel_routes(destination);
```

### 21. Notifications Table

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);
```

## Row Level Security (RLS) Policies

### Enable RLS on all tables
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
-- Enable on all tables...
```

### Example RLS Policies
```sql
-- Users can only read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Public read for active campaigns
CREATE POLICY "Public can read active campaigns" ON campaigns
  FOR SELECT USING (status = 'active');

-- Users can see their own transactions
CREATE POLICY "Users can see own transactions" ON transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wallets WHERE id = wallet_id AND user_id = auth.uid()
    )
  );
```

## Functions

### Updated At Trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Repeat for other tables...
```

### Wallet Balance Update
```sql
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE wallets
  SET balance = balance + NEW.amount,
      updated_at = NOW()
  WHERE id = NEW.wallet_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Enums (if using Supabase)

Create enum types:
```sql
CREATE TYPE user_role AS ENUM ('member', 'admin', 'tutor', 'provider', 'dispatcher');
CREATE TYPE campaign_category AS ENUM ('medical', 'education', 'emergency', 'community', 'religious');
CREATE TYPE emergency_type AS ENUM ('medical', 'fire', 'crime', 'accident', 'natural_disaster', 'other');
CREATE TYPE emergency_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE emergency_status AS ENUM ('pending', 'dispatched', 'resolved', 'cancelled');
-- Continue for other enums...
```

## Supabase Configuration

### Edge Functions
- `/functions/v1/payment/initialize` - Initialize payment
- `/functions/v1/payment/webhook` - Payment webhook handler
- `/functions/v1/ai/chat` - AI chat endpoint
- `/functions/v1/notifications/send` - Push notifications

### Storage Buckets
- `avatars` - User profile pictures
- `campaign-images` - Campaign images
- `product-images` - Marketplace product images
- `event-images` - Event images
- `posts` - Social post images
- `documents` - General documents

### Realtime Subscriptions
- `emergency_reports` - New reports, status updates
- `notifications` - User notifications
- `social_posts` - New posts, comments, likes
- `wallet_transactions` - Balance updates
