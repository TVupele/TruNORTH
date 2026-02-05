import React, { useState } from 'react';
import { toast } from 'sonner';
import { MapPin, Calendar, Users, DollarSign, Plane, Bus, Star, Search, Filter } from 'lucide-react';

interface TravelPackage {
  id: string;
  title: string;
  description: string;
  destination: string;
  duration_days: number;
  price: number;
  image_url?: string;
  type: 'flight' | 'bus' | 'tour';
  rating: number;
}

const demoPackages: TravelPackage[] = [
  { id: '1', title: 'Kano to Abuja Express', description: 'Comfortable bus ride from Kano to Abuja with air conditioning and refreshments.', destination: 'Abuja', duration_days: 1, price: 15000, type: 'bus', rating: 4.5 },
  { id: '2', title: 'Northern Heritage Tour', description: '7-day tour visiting Kano, Katsina, and Sokoto historical sites.', destination: 'Northern Region', duration_days: 7, price: 125000, type: 'tour', rating: 4.8 },
  { id: '3', title: 'Flight to Lagos', description: 'Quick flight from Kano to Lagos. Includes meal and baggage allowance.', destination: 'Lagos', duration_days: 1, price: 85000, type: 'flight', rating: 4.7 },
  { id: '4', title: 'Sahara Desert Adventure', description: '3-day desert safari with camel riding and camping experience.', destination: 'Sahara Border', duration_days: 3, price: 75000, type: 'tour', rating: 4.9 },
  { id: '5', title: 'Kano to Kaduna Day Trip', description: 'Round trip to Kaduna for shopping and sightseeing.', destination: 'Kaduna', duration_days: 1, price: 8000, type: 'bus', rating: 4.3 },
];

export function TravelPage() {
  const [selectedPackage, setSelectedPackage] = useState<TravelPackage | null>(null);
  const [travelers, setTravelers] = useState(1);
  const [travelDate, setTravelDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredPackages = demoPackages.filter(pkg => {
    const matchesSearch = pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         pkg.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || pkg.type === filterType;
    return matchesSearch && matchesType;
  });

  const bookPackage = () => {
    if (!selectedPackage || !travelDate) {
      toast.error('Please select a travel date');
      return;
    }
    toast.success(`Booking confirmed for ${selectedPackage.title}!`);
    setSelectedPackage(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Travel</h1>
        <p className="text-gray-500">Book flights, buses, and tours</p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'flight', 'bus', 'tour'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg font-medium capitalize ${filterType === type ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                {type === 'all' ? 'All' : type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Plane className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Ramadan Travel Sale!</h2>
            <p className="opacity-90">Up to 30% off on flights and tours</p>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.map((pkg) => (
          <div key={pkg.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-40 bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
              {pkg.type === 'flight' ? <Plane className="w-12 h-12 text-white" /> :
               pkg.type === 'bus' ? <Bus className="w-12 h-12 text-white" /> :
               <Star className="w-12 h-12 text-white" />}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-gray-900">{pkg.title}</h3>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm">{pkg.rating}</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-3">{pkg.description}</p>
              <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{pkg.destination}</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{pkg.duration_days} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-blue-600">₦{pkg.price.toLocaleString()}</span>
                <button
                  onClick={() => setSelectedPackage(pkg)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPackages.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No packages found</p>
        </div>
      )}

      {/* Booking Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPackage(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Book: {selectedPackage.title}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Travel Date</label>
                <input type="date" value={travelDate} onChange={e => setTravelDate(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Number of Travelers</label>
                <div className="flex items-center gap-4">
                  <button onClick={() => setTravelers(Math.max(1, travelers - 1))} className="w-10 h-10 bg-gray-100 rounded-full">-</button>
                  <span className="font-bold">{travelers}</span>
                  <button onClick={() => setTravelers(travelers + 1)} className="w-10 h-10 bg-gray-100 rounded-full">+</button>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex justify-between mb-2">
                  <span>₦{selectedPackage.price.toLocaleString()} × {travelers}</span>
                  <span>₦{(selectedPackage.price * travelers).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-blue-600">₦{(selectedPackage.price * travelers).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={bookPackage} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700">Confirm Booking</button>
                <button onClick={() => setSelectedPackage(null)} className="flex-1 bg-gray-100 py-3 rounded-xl font-medium hover:bg-gray-200">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
