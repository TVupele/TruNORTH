# TruNORTH Super-App Architecture

## Executive Summary

TruNORTH is a production-ready, scalable multi-service super-app designed to serve the Nigerian market with services including social networking, digital wallet, travel booking, tutoring, emergency reporting, donations, marketplace, event ticketing, religious services, and AI-powered assistance.

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4 with custom theme
- **State Management**: React Context + Zustand
- **Routing**: React Router 6
- **UI Components**: Radix UI + Custom components
- **Animations**: Framer Motion + CSS animations
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js with TypeScript
- **API Documentation**: Swagger/OpenAPI 3.0
- **Authentication**: JWT + Supabase Auth
- **Database**: PostgreSQL (Supabase)
- **Caching**: Redis (optional)
- **File Storage**: Supabase Storage (S3-compatible)

### Infrastructure
- **Cloud Provider**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Deployment**: Vercel/Netlify (Frontend) + Supabase (Backend)
- **CI/CD**: GitHub Actions
- **Monitoring**: Supabase Analytics

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        TRUNORTH SYSTEM                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐       │
│  │   Web App   │    │  Mobile PWA │    │   Admin     │       │
│  │  (React)    │    │  (React)    │    │   Panel     │       │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘       │
│         │                   │                   │               │
│         └───────────────────┼───────────────────┘               │
│                             │                                   │
│                    ┌────────▼────────┐                         │
│                    │   CDN / Load     │                         │
│                    │   Balancer       │                         │
│                    └────────┬────────┘                         │
│                             │                                   │
│         ┌───────────────────┼───────────────────┐               │
│         │                   │                   │               │
│  ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐      │
│  │  Supabase   │    │  Express API │    │    AI API   │      │
│  │  (Auth + DB)│    │  (Node.js)   │    │  (OpenAI)   │      │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘      │
│         │                   │                   │               │
│         └───────────────────┼───────────────────┘               │
│                             │                                   │
│                    ┌────────▼────────┐                         │
│                    │   PostgreSQL     │                         │
│                    │   Database       │                         │
│                    └──────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema

### Core Tables

```sql
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    bio TEXT,
    phone VARCHAR(20),
    language VARCHAR(10) DEFAULT 'en',
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'tutor', 'provider')),
    is_active BOOLEAN DEFAULT true,
    email_confirmed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallets Table
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'NGN',
    is_frozen BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Transactions Table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID REFERENCES wallets(id),
    type VARCHAR(30) NOT NULL CHECK (type IN ('topup', 'transfer', 'payment', 'refund', 'withdrawal', 'donation', 'booking')),
    amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    description TEXT,
    reference_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts Table (Social)
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url VARCHAR(500),
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_edited BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments Table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Travel Packages Table
CREATE TABLE travel_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    destination VARCHAR(200) NOT NULL,
    origin VARCHAR(200) NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    duration_days INTEGER NOT NULL,
    max_travelers INTEGER DEFAULT 10,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    departure_date DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings Table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    package_id UUID REFERENCES travel_packages(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    travelers_count INTEGER DEFAULT 1,
    total_amount DECIMAL(15,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending',
    booking_reference VARCHAR(50) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tutors Table
CREATE TABLE tutors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subjects TEXT[] NOT NULL,
    hourly_rate DECIMAL(10,2) NOT NULL,
    bio TEXT,
    qualifications TEXT[],
    rating DECIMAL(3,2) DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tutoring Sessions Table
CREATE TABLE tutoring_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID REFERENCES tutors(id),
    student_id UUID REFERENCES users(id),
    subject VARCHAR(100) NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    amount_paid DECIMAL(15,2),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency Reports Table
CREATE TABLE emergency_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    type VARCHAR(50) NOT NULL CHECK (type IN ('medical', 'fire', 'crime', 'accident', 'natural_disaster', 'other')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    address TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'dispatched', 'resolved', 'dismissed')),
    assigned_to UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Donation Campaigns Table
CREATE TABLE donation_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    goal_amount DECIMAL(15,2) NOT NULL,
    raised_amount DECIMAL(15,2) DEFAULT 0,
    category VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    end_date TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Donations Table
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES donation_campaigns(id) ON DELETE CASCADE,
    donor_id UUID REFERENCES users(id),
    amount DECIMAL(15,2) NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products Table (Marketplace)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(15,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    images TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    total_amount DECIMAL(15,2) NOT NULL,
    shipping_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    price_at_purchase DECIMAL(15,2) NOT NULL
);

-- Events Table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    venue VARCHAR(200) NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    capacity INTEGER NOT NULL,
    ticket_price DECIMAL(15,2) NOT NULL,
    image_url VARCHAR(500),
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tickets Table
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    qr_code VARCHAR(500),
    status VARCHAR(20) DEFAULT 'valid' CHECK (status IN ('valid', 'used', 'cancelled', 'refunded')),
    purchased_at TIMESTAMPTZ DEFAULT NOW()
);

-- Religious Services Table
CREATE TABLE religious_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    location VARCHAR(200) NOT NULL,
    service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('church', 'mosque', 'temple', 'other')),
    schedule TEXT NOT NULL,
    capacity INTEGER,
    contact_phone VARCHAR(20),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Registrations Table
CREATE TABLE service_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES religious_services(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(service_id, user_id)
);

-- Banners Table
CREATE TABLE banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    link_url VARCHAR(500),
    cta_text VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API Structure

### Authentication Endpoints
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/me
PUT    /api/auth/profile
```

### Wallet Endpoints
```
GET    /api/wallet/balance
POST   /api/wallet/topup
POST   /api/wallet/transfer
GET    /api/wallet/transactions
GET    /api/wallet/history/:userId
```

### Social Endpoints
```
POST   /api/posts
GET    /api/posts
GET    /api/posts/:id
PUT    /api/posts/:id
DELETE /api/posts/:id
POST   /api/posts/:id/like
POST   /api/posts/:id/comments
GET    /api/posts/:id/comments
DELETE /api/comments/:id
```

### Travel Endpoints
```
GET    /api/travel/packages
GET    /api/travel/packages/:id
POST   /api/travel/packages
PUT    /api/travel/packages/:id
DELETE /api/travel/packages/:id
POST   /api/travel/bookings
GET    /api/travel/bookings/:userId
PUT    /api/travel/bookings/:id/cancel
```

### Tutoring Endpoints
```
GET    /api/tutors
GET    /api/tutors/:id
POST   /api/tutors/register
PUT    /api/tutors/:id
POST   /api/tutoring/sessions
GET    /api/tutoring/sessions/:userId
PUT    /api/tutoring/sessions/:id/rate
```

### Emergency Endpoints
```
POST   /api/emergency/report
GET    /api/emergency/reports
GET    /api/emergency/reports/:id
PUT    /api/emergency/reports/:id/status
GET    /api/emergency/nearby?lat=&lng=
```

### Donations Endpoints
```
GET    /api/donations/campaigns
GET    /api/donations/campaigns/:id
POST   /api/donations/campaigns
POST   /api/donations/donate
GET    /api/donations/my-donations
```

### Marketplace Endpoints
```
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
POST   /api/cart/add
GET    /api/cart
DELETE /api/cart/:productId
POST   /api/orders
GET    /api/orders/:userId
PUT    /api/orders/:id/status
```

### Events Endpoints
```
GET    /api/events
GET    /api/events/:id
POST   /api/events
POST   /api/events/:id/tickets
GET    /api/events/:id/tickets/:userId
GET    /api/tickets/:userId
```

### Religious Services Endpoints
```
GET    /api/religious/services
GET    /api/religious/services/:id
POST   /api/religious/services
POST   /api/religious/services/:id/register
GET    /api/religious/my-registrations
```

### Admin Endpoints
```
GET    /api/admin/users
PUT    /api/admin/users/:id/status
GET    /api/admin/emergency/all
PUT    /api/admin/emergency/:id/assign
GET    /api/admin/transactions
GET    /api/admin/statistics
POST   /api/admin/banners
PUT    /api/admin/banners/:id
DELETE /api/admin/banners/:id
```

## Security Measures

### Authentication
- JWT tokens with 7-day expiration
- Refresh token rotation
- Password hashing with bcrypt (cost factor 12)
- Rate limiting on auth endpoints (5 attempts/minute)
- Email confirmation required
- Session management with device tracking

### API Security
- Helmet.js for HTTP headers
- CORS with whitelist
- Input validation with Joi/Zod
- SQL injection prevention
- XSS protection
- Rate limiting (100 requests/minute)
- API versioning

### Data Security
- Row-level security (RLS) in PostgreSQL
- Encryption at rest
- Regular backups
- Audit logging for sensitive operations
- GDPR compliance

## AI Integration

### AI Assistant Features
- Natural language processing
- Multi-language support (EN/HA)
- Context-aware responses
- Service recommendations
- Emergency guidance
- Transaction assistance

### AI Service Integration
```typescript
// AI Service Interface
interface AIService {
  chat(userId: string, message: string, language: string): Promise<string>;
  suggestServices(userPreferences: UserPreferences): Promise<Service[]>;
  analyzeEmergency(description: string): Promise<EmergencyAnalysis>;
  translate(text: string, sourceLang: string, targetLang: string): Promise<string>;
}
```

## Payment Integration

### Wallet System
- Real-time balance updates
- Transaction logging
- Fraud detection
- Currency conversion (NGN default)
- Payment gateway integration (Paystack/Stripe)

### Supported Payment Methods
- Bank transfer
- Card payments (Visa, Mastercard)
- USSD
- Mobile money

## Localization

### Supported Languages
- English (en) - Default
- Hausa (ha) - Full support

### Translation Structure
```typescript
// translations.ts
export const translations = {
  en: {
    welcome: 'Welcome to TruNORTH',
    home: 'Home',
    wallet: 'Wallet',
    // ... more keys
  },
  ha: {
    welcome: 'Barka da zuwa TruNORTH',
    home: 'Gida',
    wallet: 'Jakar Kuɗi',
    // ... more keys
  }
};
```

## Performance Optimization

### Frontend Optimizations
- Code splitting with React.lazy
- Image optimization
- Caching strategies
- Lazy loading components
- Bundle size optimization

### Backend Optimizations
- Database indexing
- Query optimization
- Connection pooling
- Caching layer (Redis)
- CDN for static assets

## Monitoring & Analytics

### Application Monitoring
- Error tracking (Sentry)
- Performance monitoring
- User analytics
- Business metrics

### Logging
- Structured JSON logs
- Log aggregation
- Error alerts
- Audit trails

## Deployment Architecture

### Production Environment
```
Frontend: Vercel / Netlify
- Auto-deploy from Git
- Edge caching
- SSL/TLS

Backend: Supabase / Railway
- Auto-scaling
- Database backups
- CDN

Database: Supabase PostgreSQL
- Point-in-time recovery
- Read replicas
- SSL encryption
```

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://...

# Authentication
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Payment
PAYSTACK_SECRET_KEY=your-paystack-key
PAYSTACK_PUBLIC_KEY=your-paystack-public

# AI
OPENAI_API_KEY=your-openai-key

# Redis (Optional)
REDIS_URL=redis://localhost:6379

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-bucket
```

## Testing Strategy

### Unit Tests
- Jest for backend
- Vitest for frontend
- Coverage target: 80%

### Integration Tests
- API endpoint testing
- Database operations
- Authentication flows

### E2E Tests
- Cypress for critical paths
- Mobile responsive testing
- Cross-browser testing

## CI/CD Pipeline

```yaml
# GitHub Actions Workflow
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test
      
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build
        run: npm run build
        
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: npm run deploy
```

## Development Roadmap

### Phase 1: Core Foundation
- [x] Project setup
- [x] Authentication system
- [x] Database schema
- [x] Basic UI components

### Phase 2: Feature Modules
- [ ] Digital wallet
- [ ] Social networking
- [ ] Travel booking
- [ ] Tutoring services

### Phase 3: Advanced Features
- [ ] Emergency reporting
- [ ] Donations
- [ ] Marketplace
- [ ] Event ticketing

### Phase 4: Admin & AI
- [ ] Admin panel
- [ ] AI assistant
- [ ] Analytics dashboard
- [ ] Performance optimization

## Conclusion

This architecture provides a scalable, secure, and maintainable foundation for the TruNORTH super-app. The modular design allows for independent development and deployment of features while maintaining system coherence.
