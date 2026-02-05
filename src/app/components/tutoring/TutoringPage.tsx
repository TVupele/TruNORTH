import React, { useState } from 'react';
import { toast } from 'sonner';
import { BookOpen, Clock, Star, Video, MessageCircle, User, Search, Filter } from 'lucide-react';

interface Tutor {
  id: string;
  name: string;
  subject: string;
  bio: string;
  hourly_rate: number;
  rating: number;
  students: number;
  lessons: number;
  available: boolean;
  avatar?: string;
}

const demoTutors: Tutor[] = [
  { id: '1', name: 'Dr. Ahmed Ibrahim', subject: 'Mathematics', bio: 'PhD in Mathematics with 10 years teaching experience.', hourly_rate: 5000, rating: 4.9, students: 156, lessons: 890, available: true },
  { id: '2', name: 'Fatima Abdullahi', subject: 'English Language', bio: 'Certified TESOL teacher specializing in English as second language.', hourly_rate: 3500, rating: 4.8, students: 89, lessons: 456, available: true },
  { id: '3', name: 'Musa Hassan', subject: 'Physics', bio: 'Physics teacher with focus on practical applications.', hourly_rate: 4500, rating: 4.7, students: 67, lessons: 234, available: false },
  { id: '4', name: 'Aisha Mohammed', subject: 'Chemistry', bio: 'Experienced chemistry tutor for WAEC and JAMB preparation.', hourly_rate: 4000, rating: 4.8, students: 123, lessons: 567, available: true },
  { id: '5', name: 'Umar Garba', subject: 'Computer Science', bio: 'Software engineer teaching programming and computer basics.', hourly_rate: 6000, rating: 4.9, students: 45, lessons: 178, available: true },
  { id: '6', name: 'Hauwa Bello', subject: 'Biology', bio: 'Medical graduate passionate about teaching biology.', hourly_rate: 3800, rating: 4.6, students: 78, lessons: 312, available: true },
];

const subjects = ['All', 'Mathematics', 'English Language', 'Physics', 'Chemistry', 'Computer Science', 'Biology'];

export function TutoringPage() {
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');

  const filteredTutors = demoTutors.filter(tutor => {
    const matchesSubject = selectedSubject === 'All' || tutor.subject === selectedSubject;
    const matchesSearch = tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutor.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const bookSession = () => {
    if (!selectedTutor || !bookingDate || !bookingTime) {
      toast.error('Please select date and time');
      return;
    }
    toast.success(`Session booked with ${selectedTutor.name}!`);
    setSelectedTutor(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tutoring</h1>
        <p className="text-gray-500">Find tutors and book learning sessions</p>
      </div>

      {/* Stats Banner */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-600">500+</p>
          <p className="text-sm text-gray-600">Tutors</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <User className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-600">10K+</p>
          <p className="text-sm text-gray-600">Students</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <Star className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-purple-600">4.8</p>
          <p className="text-sm text-gray-600">Avg Rating</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tutors..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {subjects.map(subject => (
            <button
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${selectedSubject === subject ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              {subject}
            </button>
          ))}
        </div>
      </div>

      {/* Tutors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTutors.map(tutor => (
          <div key={tutor.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {tutor.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{tutor.name}</h3>
                <p className="text-blue-600 text-sm">{tutor.subject}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{tutor.rating}</span>
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">{tutor.bio}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1"><User className="w-4 h-4" />{tutor.students}</span>
              <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" />{tutor.lessons}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${tutor.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {tutor.available ? 'Available' : 'Busy'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-blue-600">₦{tutor.hourly_rate.toLocaleString()}<span className="text-sm text-gray-500 font-normal">/hr</span></span>
              <button
                onClick={() => setSelectedTutor(tutor)}
                disabled={!tutor.available}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTutors.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No tutors found</p>
        </div>
      )}

      {/* Booking Modal */}
      {selectedTutor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTutor(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {selectedTutor.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="text-xl font-bold">{selectedTutor.name}</h3>
                <p className="text-blue-600">{selectedTutor.subject}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Date</label>
                <input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Select Time</label>
                <input type="time" value={bookingTime} onChange={e => setBookingTime(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
              </div>
              <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-xl">
                <Video className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-700">Session will be held via video call</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex justify-between mb-2">
                  <span>Hourly Rate</span>
                  <span>₦{selectedTutor.hourly_rate.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-blue-600">₦{selectedTutor.hourly_rate.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={bookSession} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700">Confirm Booking</button>
                <button onClick={() => setSelectedTutor(null)} className="flex-1 bg-gray-100 py-3 rounded-xl font-medium hover:bg-gray-200">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
