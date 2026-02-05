import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  Wallet,
  Plane,
  GraduationCap,
  AlertTriangle,
  Heart,
  ShoppingBag,
  Ticket,
  Church,
  MessageCircle,
  Users,
  User,
  Settings,
  LogOut,
  Languages,
  Menu,
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const { t, language, setLanguage } = useLanguage();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Define badges for demo purposes
  const badges: Record<string, number> = {
    emergency: 0,
    ai: 3,
    wallet: 0
  };

  const menuItems = [
    { id: 'home', label: t('home'), icon: Home, group: 'main' },
    { id: 'wallet', label: t('wallet'), icon: Wallet, group: 'main' },
    { id: 'social', label: t('social'), icon: Users, group: 'main' },
    { id: 'travel', label: t('travel'), icon: Plane, group: 'services' },
    { id: 'tutoring', label: t('tutoring'), icon: GraduationCap, group: 'services' },
    { id: 'emergency', label: t('emergency'), icon: AlertTriangle, group: 'services', alert: true },
    { id: 'donate', label: t('donate'), icon: Heart, group: 'services' },
    { id: 'shop', label: t('shop'), icon: ShoppingBag, group: 'services' },
    { id: 'tickets', label: t('tickets'), icon: Ticket, group: 'services' },
    { id: 'religious', label: t('religious'), icon: Church, group: 'services' },
    { id: 'ai', label: t('aiAssistant'), icon: MessageCircle, group: 'services' },
  ];

  const handleSignOut = async () => {
    if(window.confirm(t('confirmSignOut') || "Are you sure you want to sign out?")) {
      try {
        await signOut();
      } catch (error) {
        console.error('Sign out error:', error);
      }
    }
  };

  const handleMobileNavigate = (id: string) => {
    onNavigate(id);
    setIsMobileMenuOpen(false);
  };

  // --- Sub-components ---

  const NavItem = ({ item, mobile = false }: { item: typeof menuItems[0], mobile?: boolean }) => {
    const Icon = item.icon;
    const isActive = currentPage === item.id;
    const badgeCount = badges[item.id];

    return (
      <button
        onClick={() => mobile ? handleMobileNavigate(item.id) : onNavigate(item.id)}
        className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
          isActive
            ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        } ${mobile ? 'w-full' : ''}`}
      >
        <Icon className={`w-5 h-5 ${isActive ? 'fill-blue-600/20' : ''}`} />
        <span className="flex-1 text-left">{item.label}</span>
        
        {/* Badges */}
        {badgeCount > 0 && (
          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px]">
            {badgeCount}
          </span>
        )}
        
        {/* Mobile Chevron */}
        {mobile && <ChevronRight className="w-4 h-4 text-gray-300" />}
        
        {/* Active Indicator Bar (Desktop) */}
        {!mobile && isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
        )}
      </button>
    );
  };

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex md:flex-col w-72 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-40">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">TruNORTH</h1>
            <p className="text-xs text-gray-500 font-medium">Super App Platform</p>
          </div>
        </div>

        {/* Scrollable Nav Area */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
          
          {/* Main Group */}
          <div>
            <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Main</p>
            <div className="space-y-1">
              {menuItems.filter(i => i.group === 'main').map(item => (
                <NavItem key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* Services Group */}
          <div>
            <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Services</p>
            <div className="space-y-1">
              {menuItems.filter(i => i.group === 'services').map(item => (
                <NavItem key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* Admin Link */}
          {user?.role === 'admin' && (
            <div>
              <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">System</p>
              <button
                onClick={() => onNavigate('admin')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  currentPage === 'admin' ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>{t('admin')}</span>
              </button>
            </div>
          )}
        </nav>

        {/* Footer (Profile & Logout) */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'Guest User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
             <button
              onClick={() => setLanguage(language === 'en' ? 'ha' : 'en')}
              className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <Languages className="w-3.5 h-3.5" />
              {language === 'en' ? 'EN' : 'HA'}
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-600 bg-white border border-red-100 rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-3.5 h-3.5" />
              {t('signOut')}
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-50 pb-safe">
        <div className="grid grid-cols-5 h-16 px-2">
          {/* First 4 priority items */}
          {menuItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleMobileNavigate(item.id)}
                className={`relative flex flex-col items-center justify-center gap-1 ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
                <span className="text-[10px] font-medium truncate w-full text-center">{item.label}</span>
                {badges[item.id] > 0 && (
                  <span className="absolute top-2 right-3 w-2 h-2 bg-red-500 rounded-full border border-white" />
                )}
              </button>
            );
          })}

          {/* "More" Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center gap-1 text-gray-500"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <Menu className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-medium">{t('more') || 'Menu'}</span>
          </button>
        </div>
      </nav>

      {/* ================= MOBILE FULL SCREEN DRAWER ================= */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] flex flex-col bg-gray-50 animate-in slide-in-from-bottom-10 duration-200">
          
          {/* Drawer Header */}
          <div className="bg-white px-4 py-4 flex justify-between items-center border-b border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold">Menu</h2>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            
            {/* User Card */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                {user?.name?.charAt(0) || 'G'}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{user?.name || 'Guest'}</p>
                <button onClick={() => handleMobileNavigate('profile')} className="text-xs text-blue-600 font-medium">
                  View Profile
                </button>
              </div>
            </div>

            {/* All Menu Items Grid */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase">All Services</p>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {menuItems.map((item, idx) => (
                  <div key={item.id} className={idx !== menuItems.length - 1 ? 'border-b border-gray-100' : ''}>
                    <NavItem item={item} mobile />
                  </div>
                ))}
              </div>
            </div>

            {/* Settings & Logout */}
            <div className="space-y-3 pb-8">
              <p className="text-xs font-bold text-gray-500 uppercase">Settings</p>
              
              <button 
                onClick={() => setLanguage(language === 'en' ? 'ha' : 'en')}
                className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Languages className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium">Switch Language</span>
                </div>
                <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded">
                  {language === 'en' ? 'English' : 'Hausa'}
                </span>
              </button>

              <button 
                onClick={handleSignOut}
                className="w-full bg-red-50 p-4 rounded-xl shadow-sm border border-red-100 flex items-center justify-between text-red-600"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-medium">Sign Out</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}