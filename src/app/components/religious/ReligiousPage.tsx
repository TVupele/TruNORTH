import React, { useState } from 'react';
import { Landmark, Church, Sun, Moon, Clock, MapPin, Phone, Calendar, Info, BookOpen, Cross } from 'lucide-react';

interface PrayerTime {
  name: string;
  time: string;
  arabic: string;
}

const muslimPrayerTimes: PrayerTime[] = [
  { name: 'Fajr', time: '5:23 AM', arabic: 'الفجر' },
  { name: 'Dhuhr', time: '12:30 PM', arabic: 'الظهر' },
  { name: 'Asr', time: '3:45 PM', arabic: 'العصر' },
  { name: 'Maghrib', time: '6:18 PM', arabic: 'المغرب' },
  { name: 'Isha', time: '7:48 PM', arabic: 'العشاء' },
];

interface Mosque {
  id: string;
  name: string;
  address: string;
  phone: string;
  capacity: number;
  facilities: string[];
}

const mosques: Mosque[] = [
  { id: '1', name: 'Kano Central Mosque', address: 'Kano City, Kano State', phone: '+234-803-123-4567', capacity: 5000, facilities: ['Arabic Classes', 'Youth Programs', 'Women Section'] },
  { id: '2', name: 'Gidan Makama Mosque', address: 'Tudun Wada, Kano', phone: '+234-803-234-5678', capacity: 2000, facilities: ['Islamic Library', 'Ramadan Iftar'] },
  { id: '3', name: 'Abdullahi Bayero Mosque', address: 'Fagge, Kano', phone: '+234-803-345-6789', capacity: 3000, facilities: ['Quran Memorization', 'Marriage Services'] },
];

interface Church {
  id: string;
  name: string;
  denomination: string;
  address: string;
  phone: string;
  serviceTimes: string[];
}

const churches: Church[] = [
  { id: '1', name: 'St. Patrick\'s Cathedral', denomination: 'Catholic', address: 'Kano City, Kano State', phone: '+234-803-456-7890', serviceTimes: ['Sunday: 7:00 AM, 9:00 AM, 11:00 AM', 'Weekday: 6:00 AM, 5:30 PM'] },
  { id: '2', name: 'ECWA Church Kano', denomination: 'Protestant', address: 'Sabon Gari, Kano', phone: '+234-803-567-8901', serviceTimes: ['Sunday: 8:00 AM, 11:00 AM', 'Wednesday: 5:00 PM'] },
  { id: '3', name: 'Living Faith Church', denomination: 'Pentecostal', address: 'Hotoro, Kano', phone: '+234-803-678-9012', serviceTimes: ['Sunday: 9:00 AM', 'Friday: 5:00 PM'] },
];

interface Devotional {
  id: string;
  title: string;
  content: string;
  author?: string;
}

const christianDevotionals: Devotional[] = [
  { id: '1', title: 'Daily Bread', content: 'Trust in the LORD with all your heart and lean not on your own understanding. - Proverbs 3:5', author: 'Bible Verse' },
  { id: '2', title: 'Walking in Faith', content: 'Faith is taking the first step even when you don\'t see the whole staircase.', author: 'Martin Luther King Jr.' },
  { id: '3', title: 'Love One Another', content: 'A new command I give you: Love one another. As I have loved you, so you must love one another. - John 13:34', author: 'Bible Verse' },
];

const quranVerses = [
  { id: '1', arabic: 'إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ', translation: 'Indeed, we belong to Allah, and indeed, to Him we will return.', reference: 'Quran 2:156' },
  { id: '2', arabic: 'فَإِنْ تَصْبِرُوا وَتَتَّقُوا فَإِنَّ ذَٰلِكَ مِنْ عَزْمِ الْأُمُورِ', translation: 'Then be patient. Indeed, that is from the matters of determination.', reference: 'Quran 3:186' },
];

export function ReligiousPage() {
  const [activeTab, setActiveTab] = useState<'muslim' | 'christian'>('muslim');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Religious Services</h1>
          <p className="text-gray-500">Prayer times, places of worship, and spiritual resources</p>
        </div>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('muslim')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'muslim' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            🕌 Muslim
          </button>
          <button
            onClick={() => setActiveTab('christian')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'christian' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            ✝️ Christian
          </button>
        </div>
      </div>

      {/* Muslim Section */}
      {activeTab === 'muslim' && (
        <div className="space-y-6">
          {/* Prayer Times Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-emerald-600 p-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sun className="w-5 h-5" />
                Today's Prayer Times
              </h2>
              <p className="text-emerald-100 text-sm">Kano, Nigeria</p>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {muslimPrayerTimes.map((prayer) => (
                  <div key={prayer.name} className="bg-emerald-50 rounded-xl p-4 text-center hover:bg-emerald-100 transition-colors">
                    <p className="text-2xl font-bold text-emerald-700 mb-1">{prayer.arabic}</p>
                    <p className="font-semibold text-gray-900">{prayer.name}</p>
                    <p className="text-emerald-600 text-sm">{prayer.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quran Verses */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-6 text-white">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Daily Reminder
            </h3>
            <div className="space-y-3">
              {quranVerses.map((verse) => (
                <div key={verse.id} className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <p className="text-xl font-arabic mb-2 text-right">{verse.arabic}</p>
                  <p className="text-sm opacity-90 mb-1">{verse.translation}</p>
                  <p className="text-xs opacity-70">{verse.reference}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mosques */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-emerald-600" />
                Mosques Near You
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {mosques.map((mosque) => (
                <div key={mosque.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{mosque.name}</h3>
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">
                      {mosque.capacity.toLocaleString()} capacity
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{mosque.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{mosque.phone}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mosque.facilities.map((facility) => (
                      <span key={facility} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Christian Section */}
      {activeTab === 'christian' && (
        <div className="space-y-6">
          {/* Daily Devotional */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-blue-600 p-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Daily Devotional
              </h2>
              <p className="text-blue-100 text-sm">Words of encouragement for your day</p>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {christianDevotionals.map((devotional) => (
                <div key={devotional.id} className="bg-blue-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 mb-2">{devotional.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{devotional.content}</p>
                  <p className="text-xs text-gray-400">- {devotional.author}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bible Verse of the Day */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-6 text-white">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Cross className="w-5 h-5" />
              Bible Verse of the Day
            </h3>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <p className="text-lg italic mb-2">"For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life."</p>
              <p className="text-sm opacity-80">- John 3:16 (KJV)</p>
            </div>
          </div>

          {/* Churches */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Church className="w-5 h-5 text-blue-600" />
                Churches Near You
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {churches.map((church) => (
                <div key={church.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{church.name}</h3>
                      <p className="text-sm text-gray-500">{church.denomination}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                      {church.denomination}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{church.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{church.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{church.serviceTimes.join(' | ')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Upcoming Christian Events
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="bg-blue-600 text-white rounded-lg p-2 text-center min-w-[60px]">
                  <p className="text-xs font-bold">MAR</p>
                  <p className="text-lg font-bold">15</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Weekend Retreat</p>
                  <p className="text-sm text-gray-500">ECWA Church Kano - All day event</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="bg-purple-600 text-white rounded-lg p-2 text-center min-w-[60px]">
                  <p className="text-xs font-bold">MAR</p>
                  <p className="text-lg font-bold">22</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Bible Study Night</p>
                  <p className="text-sm text-gray-500">Living Faith Church - 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
