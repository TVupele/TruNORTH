import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { API_URL } from '@/lib/supabase';
import { publicAnonKey } from '@/lib/supabase-config';
// Assuming ImageWithFallback is in the figma folder
import { ImageWithFallback } from '../figma/ImageWithFallback'; 

interface Banner {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link_url?: string;
  cta_text?: string; // Added for better UI
}

// --- Mock Data (Fills the gap if API fails) ---
const MOCK_BANNERS: Banner[] = [
  {
    id: '1',
    title: 'Welcome to TruNORTH',
    description: 'Your all-in-one platform for lifestyle, travel, and giving.',
    image_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80',
    link_url: '/about',
    cta_text: 'Learn More'
  },
  {
    id: '2',
    title: 'Emergency Response',
    description: 'Fast, reliable help when you need it most. Tap to explore safety features.',
    image_url: 'https://images.unsplash.com/photo-1588611910663-8a39281d8208?auto=format&fit=crop&q=80',
    link_url: '/emergency',
    cta_text: 'Get Help'
  },
  {
    id: '3',
    title: 'Donate to Causes',
    description: 'Make a difference today by supporting verified campaigns.',
    image_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80',
    link_url: '/donate',
    cta_text: 'Donate Now'
  }
];

export function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  
  // Touch Handling State
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    fetchBanners();
  }, []);

  // Auto-play Logic
  useEffect(() => {
    if (banners.length > 1 && !isPaused) {
      const interval = setInterval(() => {
        goToNext();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentIndex, banners.length, isPaused]);

  const fetchBanners = async () => {
    try {
      // Attempt fetch
      const response = await fetch(`${API_URL}/banners`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.banners && data.banners.length > 0) {
          setBanners(data.banners);
          setLoading(false);
          return;
        }
      }
      throw new Error("No data or fetch failed");
    } catch (error) {
      // Fallback to Mock Data on error
      console.warn('Using mock banners due to fetch error:', error);
      setBanners(MOCK_BANNERS);
    } finally {
      setLoading(false);
    }
  };

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? banners.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = useCallback(() => {
    const isLastSlide = currentIndex === banners.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, banners.length]);

  // Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true); // Pause while touching
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) goToNext();
    if (isRightSwipe) goToPrevious();
    
    // Reset
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  if (loading) {
    return (
      <div className="w-full h-64 md:h-80 bg-gray-200 rounded-2xl animate-pulse flex items-center justify-center">
        <span className="text-gray-400 font-medium">Loading highlights...</span>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden group shadow-lg bg-gray-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* SLIDER TRACK 
        We translate the entire row of images based on current index 
      */}
      <div 
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="min-w-full h-full relative">
            <ImageWithFallback
              src={banner.image_url}
              alt={banner.title}
              className="w-full h-full object-cover"
              // Add a slight darkening filter to ensure text pop
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            {/* Content Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 max-w-3xl">
              <div className="transform translate-y-0 transition-all duration-500 delay-100">
                <h3 className="text-white text-2xl md:text-4xl font-bold mb-3 drop-shadow-md">
                  {banner.title}
                </h3>
                <p className="text-gray-200 text-sm md:text-lg mb-6 line-clamp-2 max-w-xl drop-shadow-sm">
                  {banner.description}
                </p>
                
                {banner.link_url && (
                  <a 
                    href={banner.link_url}
                    className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full font-bold text-sm hover:bg-blue-50 transition-colors shadow-lg"
                  >
                    {banner.cta_text || 'Explore Now'}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Controls (Hidden on Mobile, Visible on Desktop Hover) */}
      {banners.length > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); goToPrevious(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center border border-white/10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => { e.preventDefault(); goToNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center border border-white/10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/20 rounded-full backdrop-blur-sm">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-white w-6' 
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}