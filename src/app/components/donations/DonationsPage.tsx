import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase, API_URL } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  Heart, 
  Target, 
  TrendingUp, 
  Search, 
  Filter, 
  X, 
  CheckCircle, 
  Loader2, 
  Users,
  CreditCard,
  Globe
} from 'lucide-react';

// --- Types ---
interface Campaign {
  id: string;
  title: string;
  description: string;
  image_url: string;
  raised_amount: number;
  goal_amount: number;
  category: 'Medical' | 'Education' | 'Community' | 'Disaster Relief';
  created_at: string;
  donors_count: number;
}

// --- Constants ---
const PRESET_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000];
const CATEGORIES = ['All', 'Medical', 'Education', 'Community', 'Disaster Relief'];

export function DonationsPage() {
  const { t } = useLanguage();
  
  // State
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modal State
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [amount, setAmount] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      // Simulating network delay for skeleton loader demo
      // const res = await fetch(`${API_URL}/donations/campaigns`);
      // const data = await res.json();
      
      // MOCK DATA for demonstration (Replace with actual fetch above)
      const mockData: Campaign[] = [
        {
          id: '1',
          title: 'Flood Relief Fund',
          description: 'Providing food and shelter to families displaced by the recent floods in Lagos.',
          image_url: 'https://images.unsplash.com/photo-1547619292-240402b5ae5d?auto=format&fit=crop&q=80',
          raised_amount: 1500000,
          goal_amount: 5000000,
          category: 'Disaster Relief',
          created_at: new Date().toISOString(),
          donors_count: 124
        },
        {
          id: '2',
          title: 'Community Tech Hub',
          description: 'Building a computer lab for underprivileged students to learn coding.',
          image_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80',
          raised_amount: 850000,
          goal_amount: 2000000,
          category: 'Education',
          created_at: new Date().toISOString(),
          donors_count: 89
        },
        {
          id: '3',
          title: 'Urgent Medical Surgery',
          description: 'Help little Amina get the heart surgery she needs to survive.',
          image_url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80',
          raised_amount: 3200000,
          goal_amount: 3500000,
          category: 'Medical',
          created_at: new Date().toISOString(),
          donors_count: 340
        }
      ];
      
      setTimeout(() => {
        setCampaigns(mockData); // Replace with data.campaigns
        setIsLoading(false);
      }, 1000);

    } catch (error) {
      console.error(error);
      toast.error("Failed to load campaigns");
      setIsLoading(false);
    }
  };

  const handleDonate = async () => {
    if (!selectedCampaign || !amount) return;
    
    setIsProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please log in to donate");
        setIsProcessing(false);
        return;
      }

      const res = await fetch(`${API_URL}/donations`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({ 
          campaign_id: selectedCampaign.id, 
          amount: parseFloat(amount), 
          anonymous 
        }),
      });

      // Simulating success for demo
      await new Promise(r => setTimeout(r, 1500)); 
      
      // if (res.ok) { ... }
      
      toast.success(`Successfully donated ₦${parseInt(amount).toLocaleString()}!`);
      
      // Update local state to reflect donation immediately
      setCampaigns(prev => prev.map(c => 
        c.id === selectedCampaign.id 
          ? { ...c, raised_amount: c.raised_amount + parseFloat(amount), donors_count: c.donors_count + 1 }
          : c
      ));

      closeModal();
      
    } catch (error) {
      toast.error("Transaction failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const closeModal = () => {
    setSelectedCampaign(null);
    setAmount('');
    setAnonymous(false);
  };

  // Filter Logic
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [campaigns, searchQuery, selectedCategory]);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-800 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2 text-emerald-100">
            <Heart className="w-5 h-5 fill-emerald-100" />
            <span className="text-sm font-semibold uppercase tracking-wider">TruNORTH Giving</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Make a Real Difference Today</h1>
          <p className="text-emerald-50 mb-8 text-lg">
            Support causes that matter. 100% of your donation goes directly to the verified campaigns.
          </p>
          
          {/* Search Bar */}
          <div className="flex gap-2 max-w-md bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/20">
            <div className="flex-1 flex items-center px-3">
              <Search className="w-5 h-5 text-emerald-100 mr-2" />
              <input 
                type="text" 
                placeholder="Search campaigns..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-white placeholder-emerald-200 focus:ring-0 w-full"
              />
            </div>
          </div>
        </div>
        
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <Globe className="absolute bottom-4 right-8 w-48 h-48 text-white/5" />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Campaigns Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl h-96 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No campaigns found</h3>
          <p className="text-gray-500">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((camp) => (
            <CampaignCard 
              key={camp.id} 
              campaign={camp} 
              onDonate={() => setSelectedCampaign(camp)} 
            />
          ))}
        </div>
      )}

      {/* Donation Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Support this cause</h3>
                <p className="text-sm text-gray-500 line-clamp-1">{selectedCampaign.title}</p>
              </div>
              <button onClick={closeModal} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              {/* Presets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Amount</label>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {PRESET_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      onClick={() => setAmount(val.toString())}
                      className={`py-2 px-1 rounded-lg text-sm font-medium border transition-all ${
                        amount === val.toString()
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500'
                          : 'border-gray-200 hover:border-emerald-200 text-gray-600'
                      }`}
                    >
                      ₦{val.toLocaleString()}
                    </button>
                  ))}
                </div>
                
                {/* Custom Amount Input */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₦</span>
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    placeholder="Enter custom amount"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" 
                  />
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer" onClick={() => setAnonymous(!anonymous)}>
                <div className={`w-5 h-5 rounded border flex items-center justify-center ${anonymous ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300 bg-white'}`}>
                  {anonymous && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Make donation anonymous</p>
                  <p className="text-xs text-gray-500">Your name won't appear on the public donor list.</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={closeModal} 
                  disabled={isProcessing}
                  className="flex-1 py-3 px-4 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDonate} 
                  disabled={!amount || isProcessing}
                  className="flex-[2] py-3 px-4 rounded-xl font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Confirm Donation
                      <Heart className="w-4 h-4 fill-white" />
                    </>
                  )}
                </button>
              </div>
              
              <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1">
                <CreditCard className="w-3 h-3" /> Secure Payment Processing
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sub-Component: Campaign Card ---
function CampaignCard({ campaign, onDonate }: { campaign: Campaign, onDonate: () => void }) {
  const progress = Math.min((campaign.raised_amount / campaign.goal_amount) * 100, 100);
  
  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={campaign.image_url} 
          alt={campaign.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80';
          }}
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">
          {campaign.category}
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">
            {campaign.title}
          </h3>
          <p className="text-gray-500 text-sm mb-6 line-clamp-2">
            {campaign.description}
          </p>
        </div>

        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-semibold text-emerald-700">{progress.toFixed(0)}% Funded</span>
              <span className="text-gray-400 text-xs flex items-center gap-1">
                <Users className="w-3 h-3" /> {campaign.donors_count} Donors
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Raised</p>
              <div className="flex items-center gap-1 font-bold text-gray-900">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                ₦{campaign.raised_amount.toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-0.5">Goal</p>
              <div className="flex items-center gap-1 font-bold text-gray-900 justify-end">
                <Target className="w-3.5 h-3.5 text-gray-400" />
                ₦{campaign.goal_amount.toLocaleString()}
              </div>
            </div>
          </div>

          <button 
            onClick={onDonate}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
          >
            <Heart className="w-4 h-4 fill-emerald-600" />
            Donate Now
          </button>
        </div>
      </div>
    </div>
  );
}
