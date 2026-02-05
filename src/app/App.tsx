import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Toaster } from 'sonner';
import { SignInForm } from '@/app/components/auth/SignInForm';
import { SignUpForm } from '@/app/components/auth/SignUpForm';
import { Navigation } from '@/app/components/layout/Navigation';
import { HomePage } from '@/app/components/home/HomePage';
import { WalletPage } from '@/app/components/wallet/WalletPage';
import { SocialPage } from '@/app/components/social/SocialPage';
import { TravelPage } from '@/app/components/travel/TravelPage';
import { TutoringPage } from '@/app/components/tutoring/TutoringPage';
import { EmergencyPage } from '@/app/components/emergency/EmergencyPage';
import { DonationsPage } from '@/app/components/donations/DonationsPage';
import { ShopPage } from '@/app/components/shop/ShopPage';
import { TicketsPage } from '@/app/components/tickets/TicketsPage';
import { ReligiousPage } from '@/app/components/religious/ReligiousPage';
import { AIPage } from '@/app/components/ai/AIPage';
import { ProfilePage } from '@/app/components/profile/ProfilePage';
import { AdminPage } from '@/app/components/admin/AdminPage';

type Page = 'home' | 'wallet' | 'social' | 'travel' | 'tutoring' | 'emergency' | 'donate' | 'shop' | 'tickets' | 'religious' | 'ai' | 'profile' | 'admin';

function AppContent() {
  const { user, loading } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('home');

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading TruNORTH...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              TruNORTH
            </h1>
            <p className="text-lg text-gray-600">Your All-in-One Super App</p>
          </div>
          {showSignUp ? (
            <SignUpForm onToggle={() => setShowSignUp(false)} />
          ) : (
            <SignInForm onToggle={() => setShowSignUp(true)} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 flex direction-ltr">
      {/* Desktop Sidebar */}
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage as (page: string) => void} />
      
      {/* Main Content Area */}
      <main className="flex-1 md:pl-72 min-h-screen w-full">
        <div className="p-4 md:p-6 lg:p-8 w-full">
          {currentPage === 'home' && <HomePage onNavigate={setCurrentPage as (page: string) => void} />}
          {currentPage === 'wallet' && <WalletPage />}
          {currentPage === 'social' && <SocialPage />}
          {currentPage === 'travel' && <TravelPage />}
          {currentPage === 'tutoring' && <TutoringPage />}
          {currentPage === 'emergency' && <EmergencyPage />}
          {currentPage === 'donate' && <DonationsPage />}
          {currentPage === 'shop' && <ShopPage />}
          {currentPage === 'tickets' && <TicketsPage />}
          {currentPage === 'religious' && <ReligiousPage />}
          {currentPage === 'ai' && <AIPage />}
          {currentPage === 'profile' && <ProfilePage />}
          {currentPage === 'admin' && user.role === 'admin' && <AdminPage />}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </LanguageProvider>
  );
}
