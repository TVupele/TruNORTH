import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Send, Bot, User, Sparkles, Lightbulb, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickPrompts = [
  { icon: '🩺', label: 'Health tips', prompt: 'Give me some health tips' },
  { icon: '📚', label: 'Learning', prompt: 'Help me learn something new' },
  { icon: '💼', label: 'Business', prompt: 'Business advice for beginners' },
  { icon: '🕌', label: 'Religion', prompt: 'Tell me about Islamic teachings' },
];

const initialMessage: Message = {
  id: 'welcome',
  role: 'assistant',
  content: 'Sannu! (Hello!) I\'m TruNORTH AI. I\'m here to help you with anything - health, education, business, religion, or just chatting. What would you like to know?',
  timestamp: new Date()
};

export function AIPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string = input) => {
    if (!text.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Simulate AI response
    setTimeout(() => {
      const responses: Record<string, string> = {
        health: 'Here are some health tips:\n1. Drink plenty of water daily\n2. Exercise for at least 30 minutes\n3. Get 7-8 hours of sleep\n4. Eat fruits and vegetables\n5. Wash your hands regularly',
        education: 'Learning is a journey! Here are some tips:\n1. Set clear goals\n2. Practice regularly\n3. Use online resources\n4. Join study groups\n5. Teach others what you learn',
        business: 'Business tips for beginners:\n1. Start with a clear plan\n2. Know your market\n3. Build relationships\n4. Manage finances wisely\n5. Stay adaptable',
        religion: 'In Islam, we believe in:\n• Tawhid (Oneness of God)\n• Salah (prayer) 5 times daily\n• Zakat (charity)\n• Sawm (fasting) during Ramadan\n• Hajj (pilgrimage) if able',
        default: `Thanks for your message! I\'m here to help. I can assist with:\n\n🩺 Health & Wellness\n📚 Education & Learning\n💼 Business & Jobs\n🕌 Religious Guidance\n🌍 Community & Social\n\nWhat would you like to know more about?`
      };
      
      const lowerText = text.toLowerCase();
      let response = responses.default;
      
      if (lowerText.includes('health') || lowerText.includes('lafiya') || lowerText.includes('magani')) response = responses.health;
      else if (lowerText.includes('learn') || lowerText.includes('koyo') || lowerText.includes('education')) response = responses.education;
      else if (lowerText.includes('business') || lowerText.includes('kasuwanci') || lowerText.includes('aiki')) response = responses.business;
      else if (lowerText.includes('religion') || lowerText.includes('addini') || lowerText.includes('islam') || lowerText.includes('allah')) response = responses.religion;
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            TruNORTH AI
          </h1>
          <p className="text-gray-500">Your intelligent assistant</p>
        </div>
      </div>

      {/* Quick Prompts */}
      {messages.length === 1 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {quickPrompts.map((item, i) => (
            <button
              key={i}
              onClick={() => sendMessage(item.prompt)}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all text-left"
            >
              <span className="text-2xl mb-2 block">{item.icon}</span>
              <p className="font-medium text-gray-700">{item.label}</p>
            </button>
          ))}
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'assistant' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                {msg.role === 'assistant' ? <Bot className="w-5 h-5 text-blue-600" /> : <User className="w-5 h-5 text-gray-600" />}
              </div>
              <div className={`max-w-[70%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block px-4 py-3 rounded-2xl ${
                  msg.role === 'assistant' 
                    ? 'bg-gray-50 text-gray-800 rounded-tl-none' 
                    : 'bg-blue-600 text-white rounded-tr-none'
                }`}>
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
              <div className="bg-gray-50 px-4 py-3 rounded-2xl rounded-tl-none">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
