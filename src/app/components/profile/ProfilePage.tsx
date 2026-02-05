import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Globe, 
  Save, 
  Camera, 
  Phone, 
  MapPin, 
  Loader2, 
  Lock, 
  Trash2, 
  ShoppingBag, 
  Calendar,
  CreditCard
} from 'lucide-react';

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  
  // Form State
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState('Enthusiastic explorer of the TruNORTH ecosystem.'); // Mock default
  const [phone, setPhone] = useState('+234 800 000 0000');
  const [location, setLocation] = useState('Lagos, Nigeria');
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setAvatarPreview(objectUrl);
      // In a real app, you would upload 'file' to Supabase Storage here
      toast.info("Image selected (Upload logic would go here)");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      await updateProfile({ name }); // Add bio, phone, etc. when backend supports it
      toast.success(t('success') || 'Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER / COVER SECTION */}
      <div className="relative">
        {/* Cover Photo Gradient */}
        <div className="h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-b-3xl shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern opacity-10"></div> {/* Abstract pattern overlay */}
        </div>

        {/* Profile Card Overlay */}
        <div className="px-6 md:px-10 -mt-16 flex flex-col md:flex-row items-end md:items-center gap-6">
          
          {/* Avatar with Camera Button */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-4xl">
                  {user?.name?.charAt(0) || <User className="w-12 h-12" />}
                </div>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors border-2 border-white"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageChange}
            />
          </div>

          {/* Name & Role */}
          <div className="flex-1 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
            <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" /> {user?.email}
              </span>
              <span className="flex items-center gap-1 capitalize px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                {user?.role || 'Member'}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="mb-4 hidden md:block">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm">
              View Public Profile
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-0">
        
        {/* LEFT COLUMN - FORM */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
              <span className="text-xs text-gray-400">ID: {user?.id?.slice(0, 8)}...</span>
            </div>
            
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                    <User className="w-4 h-4 text-gray-400" /> {t('name')}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                    <Phone className="w-4 h-4 text-gray-400" /> Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                  <Mail className="w-4 h-4 text-gray-400" /> {t('email')}
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                  <MapPin className="w-4 h-4 text-gray-400" /> Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                  Short Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 w-full md:w-auto px-8 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/30"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  <span>{loading ? t('loading') : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* DANGER ZONE */}
          <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
            <div className="p-4 bg-red-50 border-b border-red-100 flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-red-800">Security & Danger Zone</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Change Password</p>
                  <p className="text-sm text-gray-500">Update your account password regularly.</p>
                </div>
                <button className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  Update
                </button>
              </div>
              <hr className="border-gray-100" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-red-600">Delete Account</p>
                  <p className="text-sm text-gray-500">Permanently remove your account and data.</p>
                </div>
                <button className="px-4 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - STATS & SETTINGS */}
        <div className="space-y-6">
          
          {/* Preferences */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Globe className="w-4 h-4" /> {t('language')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                      language === 'en' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage('ha')}
                    className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                      language === 'ha' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    Hausa
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Account Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <StatCard icon={CreditCard} label="Bookings" value="12" color="blue" />
              <StatCard icon={ShoppingBag} label="Orders" value="5" color="purple" />
              <StatCard icon={Save} label="Donations" value="₦50k" color="green" />
              <StatCard icon={Calendar} label="Days Active" value="128" color="orange" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Sub-component for clean stats
function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col items-center justify-center text-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${colors[color as keyof typeof colors]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}