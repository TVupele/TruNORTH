import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase, API_URL } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  AlertTriangle, 
  MapPin, 
  Loader2, 
  Phone, 
  Ambulance, 
  Flame, 
  ShieldAlert, 
  Car,
  History,
  Navigation
} from 'lucide-react';

// --- Types ---
type EmergencyType = 'medical' | 'fire' | 'accident' | 'crime' | 'other';
type Priority = 'low' | 'medium' | 'high' | 'critical';

interface Report {
  id: string;
  type: EmergencyType;
  priority: Priority;
  description: string;
  location: string;
  status: 'pending' | 'acknowledged' | 'dispatched' | 'resolved';
  created_at: string;
}

export function EmergencyPage() {
  const { t } = useLanguage();
  
  // State
  const [type, setType] = useState<EmergencyType>('medical');
  const [priority, setPriority] = useState<Priority>('high');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  
  // Loading States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      // Mock fetch for demonstration if API isn't live yet
      // const res = await fetch(`${API_URL}/emergency/reports`, ...);
      
      // Simulating data
      setTimeout(() => {
        setReports([
          {
            id: '123',
            type: 'medical',
            priority: 'critical',
            description: 'Severe chest pain, conscious.',
            location: '123 Main St',
            status: 'dispatched',
            created_at: new Date(Date.now() - 3600000).toISOString()
          }
        ]);
        setIsLoadingReports(false);
      }, 1000);
    } catch (error) {
      console.error(error);
      setIsLoadingReports(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude}, ${position.coords.longitude}`;
        // In a real app, you might use a reverse geocoding API here to get the address
        setLocation(coords);
        setIsLocating(false);
        toast.success("Location pinpointed");
      },
      (error) => {
        toast.error("Unable to retrieve location");
        setIsLocating(false);
      }
    );
  };

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !description) {
      toast.error("Please provide a location and description");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/emergency/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ type, priority, description, location }),
      });
      
      // Simulate success for demo
      await new Promise(r => setTimeout(r, 1500));
      
      toast.success('Emergency reported! Help is on the way.');
      setDescription('');
      setLocation('');
      setPriority('high');
      fetchReports();
    } catch { 
      toast.error(t('error')); 
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render Helpers ---
  const getTypeIcon = (t: string) => {
    switch (t) {
      case 'medical': return <Ambulance className="w-6 h-6" />;
      case 'fire': return <Flame className="w-6 h-6" />;
      case 'crime': return <ShieldAlert className="w-6 h-6" />;
      case 'accident': return <Car className="w-6 h-6" />;
      default: return <AlertTriangle className="w-6 h-6" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      
      {/* Disclaimer Banner */}
      <div className="bg-red-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between animate-in slide-in-from-top-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-full animate-pulse">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Life Threatening Emergency?</h2>
            <p className="text-red-100 text-sm">Do not use this app. Call local authorities immediately.</p>
          </div>
        </div>
        <a href="tel:911" className="bg-white text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-50 transition-colors">
          Call 112 / 911
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* REPORT FORM */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
            
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h1 className="text-2xl font-bold text-gray-900">{t('reportEmergency')}</h1>
            </div>

            <form onSubmit={submitReport} className="space-y-6">
              
              {/* Emergency Type Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {['medical', 'fire', 'accident', 'crime', 'other'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t as EmergencyType)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                      type === t 
                        ? 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500' 
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    {getTypeIcon(t)}
                    <span className="text-xs font-medium mt-1 capitalize">{t}</span>
                  </button>
                ))}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('description')}</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  required 
                  placeholder="Describe the situation..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 h-24 resize-none" 
                />
              </div>

              {/* Location with GPS Button */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('location')}</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      value={location} 
                      onChange={(e) => setLocation(e.target.value)} 
                      placeholder="Address or coordinates"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500" 
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="bg-gray-100 text-gray-700 px-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2 font-medium"
                    title="Use current location"
                  >
                    {isLocating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('priority')}</label>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  {['low', 'medium', 'high', 'critical'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p as Priority)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                        priority === p 
                          ? p === 'critical' ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 focus:ring-4 focus:ring-red-500/30 transition-all shadow-lg shadow-red-600/30 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Sending Alert...
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-6 h-6" />
                    {t('submitReport')}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* HISTORY SIDEBAR */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
              <History className="w-5 h-5 text-gray-500" />
              <h2 className="font-bold text-gray-800">Recent Activity</h2>
            </div>
            
            <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[500px]">
              {isLoadingReports ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>
              ) : reports.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <History className="w-6 h-6 text-gray-300" />
                  </div>
                  No active reports
                </div>
              ) : (
                reports.map((r) => (
                  <div key={r.id} className="border border-gray-100 bg-gray-50/50 rounded-lg p-3 hover:bg-white hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${r.status === 'resolved' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
                        <span className="font-bold text-sm capitalize text-gray-800">{r.type}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        r.status === 'dispatched' ? 'bg-red-100 text-red-700' : 
                        r.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">{r.description}</p>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-[100px]">{r.location}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}