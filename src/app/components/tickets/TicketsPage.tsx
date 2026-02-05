import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Users, Ticket, Search, Filter, Star, Share2, Heart } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  price: number;
  category: string;
  image?: string;
  attendees: number;
  featured: boolean;
}

const demoEvents: Event[] = [
  { id: '1', title: 'Northern Music Festival', description: 'Annual music festival featuring northern artists.', date: '2025-03-15', time: '4:00 PM', venue: 'Kano Stadium', price: 3000, category: 'Music', attendees: 2500, featured: true },
  { id: '2', title: 'Tech Summit 2025', description: 'Technology conference with industry leaders.', date: '2025-03-22', time: '9:00 AM', venue: 'Transcorp Hilton', price: 5000, category: 'Technology', attendees: 500, featured: true },
  { id: '3', title: 'Business Networking Night', description: 'Connect with local entrepreneurs and investors.', date: '2025-03-10', time: '6:00 PM', venue: 'Sharazad Hotel', price: 2000, category: 'Business', attendees: 150, featured: false },
  { id: '4', title: 'Art Exhibition Opening', description: 'Contemporary art from northern artists.', date: '2025-03-25', time: '5:00 PM', venue: 'Kano Arts Center', price: 1000, category: 'Art', attendees: 200, featured: false },
  { id: '5', title: 'Food & Culture Festival', description: 'Experience northern Nigerian cuisine and culture.', date: '2025-04-05', time: '11:00 AM', venue: 'Trade Fair Complex', price: 1500, category: 'Culture', attendees: 3000, featured: true },
];

const categories = ['All', 'Music', 'Technology', 'Business', 'Art', 'Culture', 'Sports'];

export function TicketsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const filteredEvents = demoEvents.filter(event => {
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.venue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Events & Tickets</h1>
        <p className="text-gray-500">Discover and book event tickets</p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Events */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Star className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Featured Events</h2>
            <p className="opacity-90">Don't miss these amazing experiences</p>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map(event => (
          <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-40 bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center relative">
              <Calendar className="w-16 h-16 text-white/50" />
              {event.featured && (
                <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> Featured
                </div>
              )}
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold">
                ₦{event.price.toLocaleString()}
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{event.category}</span>
                <div className="flex gap-2">
                  <button className="p-1 hover:bg-gray-100 rounded"><Heart className="w-5 h-5 text-gray-400" /></button>
                  <button className="p-1 hover:bg-gray-100 rounded"><Share2 className="w-5 h-5 text-gray-400" /></button>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{event.title}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
              <div className="space-y-1 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <Clock className="w-4 h-4 ml-2" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{event.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{event.attendees.toLocaleString()} attending</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(event)}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Ticket className="w-5 h-5" />
                Get Tickets
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No events found</p>
        </div>
      )}

      {/* Event Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="h-48 bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
              <Calendar className="w-20 h-20 text-white/50" />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{selectedEvent.category}</span>
                {selectedEvent.featured && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Featured</span>}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedEvent.title}</h3>
              <p className="text-gray-600 mb-4">{selectedEvent.description}</p>
              <div className="space-y-2 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-2"><Calendar className="w-5 h-5" /><span>{new Date(selectedEvent.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span></div>
                <div className="flex items-center gap-2"><Clock className="w-5 h-5" /><span>{selectedEvent.time}</span></div>
                <div className="flex items-center gap-2"><MapPin className="w-5 h-5" /><span>{selectedEvent.venue}</span></div>
                <div className="flex items-center gap-2"><Users className="w-5 h-5" /><span>{selectedEvent.attendees.toLocaleString()} attending</span></div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div><span className="text-sm text-gray-500">Ticket Price</span><p className="text-2xl font-bold text-blue-600">₦{selectedEvent.price.toLocaleString()}</p></div>
                <button onClick={() => { alert('Ticket purchased!'); setSelectedEvent(null); }} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">Buy Now</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
