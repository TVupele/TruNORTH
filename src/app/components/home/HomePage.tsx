import React, { useState, useEffect } from 'react';
import { BannerCarousel } from './BannerCarousel';
import { QuickAccess } from './QuickAccess';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Bell, 
  Wallet, 
  Eye, 
  EyeOff, 
  Clock, 
  ArrowRight, 
  ShoppingBag, 
  Heart, 
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'order' | 'donation' | 'emergency' | 'wallet';
  title: string;
  subtitle: string;
  amount?: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
}

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { user } = useAuth();
  
  const [greeting, setGreeting] = useState('');
  const [showBalance, setShowBalance] = useState(true);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    setTimeout(() => {
      setActivities([
        { id: '1', type: 'donation', title: 'Donated to Flood Relief', subtitle: 'Community Campaign', amount: '₦5,000', date: new Date(Date.now() - 1000 * 60 * 60 * 2), status: 'completed' },
        { id: '2', type: 'emergency', title: 'Medical Alert Reported', subtitle: 'Lagos Mainland', date: new Date(Date.now() - 1000 * 60 * 60 * 24), status: 'pending' },
        { id: '3', type: 'wallet', title: 'Wallet Top-up', subtitle: 'Bank Transfer', amount: '+ ₦20,000', date: new Date(Date.now() - 1000 * 60 * 60 * 48), status: 'completed' },
        { id: '4', type: 'order', title: 'Order Delivered', subtitle: 'Samsung Galaxy A54', amount: '₦185,000', date: new Date(Date.now() - 1000 * 60 * 60 * 72), status: 'completed' }
      ]);
    }, 500);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'donation': return <Heart className="w-4 h-4 text-pink-500" />;
      case 'emergency': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'wallet': return <Wallet className="w-4 h-4 text-blue-500" />;
      default: return <ShoppingBag className="w-4 h-4 text-purple-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'donation': return 'bg-pink-100';
      case 'emergency': return 'bg-red-100';
      case 'wallet': return 'bg-blue-100';
      default: return 'bg-purple-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-gray-500 text-sm font-medium">{greeting}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{user ? user.name.split(' ')[0] : 'Guest'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 hover:text-blue-600 relative shadow-sm" onClick={() => onNavigate('profile')}>
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md cursor-pointer" onClick={() => onNavigate('profile')}>
            {user ? user.name.charAt(0).toUpperCase() : 'G'}
          </div>
        </div>
      </div>

      {/* WALLET CARD */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/20 rounded-full blur-xl -ml-5 -mb-5"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Wallet className="w-4 h-4" />
              <span>Total Balance</span>
              <button onClick={() => setShowBalance(!showBalance)} className="ml-2 hover:text-white">{showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</button>
            </div>
            <div className="text-3xl md:text-4xl font-bold">{showBalance ? '₦45,200.00' : '₦ ••••••••'}</div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={() => onNavigate('wallet')} className="flex-1 sm:flex-none py-2.5 px-5 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium shadow-lg">Top Up</button>
            <button onClick={() => onNavigate('wallet')} className="flex-1 sm:flex-none py-2.5 px-5 bg-white/10 hover:bg-white/20 rounded-xl font-medium">Transfer</button>
          </div>
        </div>
      </div>

      {/* QUICK ACCESS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Access</h2>
        <QuickAccess onNavigate={onNavigate} />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* Banner */}
          <div className="rounded-xl overflow-hidden shadow-sm">
            <BannerCarousel />
          </div>
          {/* Featured */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Featured</h2>
            <div className="grid grid-cols-3 gap-4">
              <button onClick={() => onNavigate('shop')} className="bg-gradient-to-br from-orange-400 to-red-500 rounded-xl p-4 text-white text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-2" />
                <p className="font-semibold">Trending</p>
              </button>
              <button onClick={() => onNavigate('social')} className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl p-4 text-white text-center">
                <Users className="w-6 h-6 mx-auto mb-2" />
                <p className="font-semibold">Community</p>
              </button>
              <button onClick={() => onNavigate('tickets')} className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl p-4 text-white text-center">
                <Calendar className="w-6 h-6 mx-auto mb-2" />
                <p className="font-semibold">Events</p>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-gray-900">Recent Activity</h2>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
            <div className="p-2">
              {activities.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {activities.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer group">
                      <div className={`w-10 h-10 rounded-full ${getActivityColor(item.type)} flex items-center justify-center`}>{getActivityIcon(item.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <p className="font-semibold text-gray-900 text-sm truncate">{item.title}</p>
                          {item.amount && <span className={`text-xs font-bold ${item.type === 'wallet' ? 'text-green-600' : 'text-gray-900'}`}>{item.amount}</span>}
                        </div>
                        <div className="flex justify-between">
                          <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                          <span className="text-[10px] text-gray-400">{item.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-3 border-t border-gray-50">
              <button className="w-full py-2 text-xs font-medium text-gray-500 hover:text-blue-600 rounded-lg">View Transaction History</button>
            </div>
          </div>
        </div>
      </div>

      {/* EMERGENCY CTA */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-blue-600" /></div>
          <div className="flex-1">
            <p className="font-semibold text-blue-900">Emergency?</p>
            <p className="text-sm text-blue-700">Tap for immediate assistance</p>
          </div>
          <button onClick={() => onNavigate('emergency')} className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">SOS</button>
        </div>
      </div>
    </div>
  );
}
