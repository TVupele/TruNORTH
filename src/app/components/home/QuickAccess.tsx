import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Wallet,
  Plane,
  GraduationCap,
  AlertTriangle, // Changed to Triangle for higher urgency visual
  Heart,
  ShoppingBag,
  Ticket,
  Moon, // Changed Church to Moon/Sun or generic generic strictly for demo, keeping Church is fine but varying icons helps
  Church,
  MessageCircle,
  Sparkles,
  Zap
} from 'lucide-react';

interface QuickAccessProps {
  onNavigate: (page: string) => void;
}

export function QuickAccess({ onNavigate }: QuickAccessProps) {
  const { t } = useLanguage();

  // Mock data for notification badges
  const notifications: Record<string, number> = {
    ai: 3,
    wallet: 1,
    emergency: 0
  };

  const modules = [
    { 
      id: 'wallet', 
      label: t('wallet'), 
      icon: Wallet, 
      gradient: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-200' 
    },
    { 
      id: 'travel', 
      label: t('travel'), 
      icon: Plane, 
      gradient: 'from-violet-500 to-purple-600',
      shadow: 'shadow-purple-200'
    },
    { 
      id: 'tutoring', 
      label: t('tutoring'), 
      icon: GraduationCap, 
      gradient: 'from-emerald-400 to-green-600',
      shadow: 'shadow-green-200'
    },
    { 
      id: 'emergency', 
      label: t('emergency'), 
      icon: AlertTriangle, 
      gradient: 'from-red-500 to-red-600',
      shadow: 'shadow-red-200',
      isUrgent: true 
    },
    { 
      id: 'donate', 
      label: t('donate'), 
      icon: Heart, 
      gradient: 'from-pink-500 to-rose-500',
      shadow: 'shadow-pink-200'
    },
    { 
      id: 'shop', 
      label: t('shop'), 
      icon: ShoppingBag, 
      gradient: 'from-orange-400 to-orange-600',
      shadow: 'shadow-orange-200'
    },
    { 
      id: 'tickets', 
      label: t('tickets'), 
      icon: Ticket, 
      gradient: 'from-indigo-400 to-indigo-600',
      shadow: 'shadow-indigo-200'
    },
    { 
      id: 'religious', 
      label: t('religious'), 
      icon: Church, 
      gradient: 'from-teal-400 to-teal-600',
      shadow: 'shadow-teal-200'
    },
    { 
      id: 'ai', 
      label: t('aiAssistant'), 
      icon: MessageCircle, 
      gradient: 'from-cyan-400 to-blue-500',
      shadow: 'shadow-cyan-200'
    },
    // Added a "More" button for expandability
    { 
      id: 'more', 
      label: 'More', 
      icon: Zap, 
      gradient: 'from-gray-700 to-gray-900',
      shadow: 'shadow-gray-300' 
    },
  ];

  return (
    <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-y-6 gap-x-2 md:gap-6">
      {modules.map((module, index) => {
        const Icon = module.icon;
        const badgeCount = notifications[module.id];
        
        return (
          <button
            key={module.id}
            onClick={() => onNavigate(module.id)}
            style={{ animationDelay: `${index * 50}ms` }} // Staggered animation
            className="group flex flex-col items-center gap-2 relative animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-backwards"
          >
            {/* Icon Container */}
            <div className={`
              relative w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center 
              bg-gradient-to-br ${module.gradient} ${module.shadow} 
              shadow-lg group-hover:shadow-xl group-hover:-translate-y-1 group-active:scale-95 group-active:translate-y-0
              transition-all duration-300 ease-out
            `}>
              {/* Shine Effect */}
              <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
              
              <Icon className="w-7 h-7 md:w-8 md:h-8 text-white drop-shadow-sm" strokeWidth={2} />
              
              {/* Notification Badge */}
              {badgeCount && badgeCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full border-2 border-white shadow-sm z-10">
                  {badgeCount > 9 ? '9+' : badgeCount}
                </div>
              )}

              {/* Urgent Pulse for Emergency */}
              {module.isUrgent && (
                <span className="absolute -inset-1 rounded-2xl bg-red-500 opacity-20 animate-pulse z-[-1]"></span>
              )}
            </div>

            {/* Label */}
            <span className="text-xs md:text-sm font-medium text-gray-700 text-center group-hover:text-blue-600 transition-colors line-clamp-1 w-full px-1">
              {module.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}