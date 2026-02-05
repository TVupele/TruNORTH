/**
 * AI Routes
 * Handles AI chat, assistants, and smart features
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { asyncHandler, OperationalError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { verifyToken, optionalAuth } from '../middleware/auth';

const router = Router();

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  userId?: string;
  title: string;
  messages: ChatMessage[];
  language: 'en' | 'ha';
  createdAt: Date;
  updatedAt: Date;
}

const sessions: Map<string, ChatSession> = new Map();

const now = new Date();
sessions.set('demo-session-1', {
  id: 'demo-session-1',
  userId: 'demo-user-123',
  title: 'General Help',
  messages: [
    { id: '1', role: 'assistant', content: 'Sannu! Ni TruNORTH AI ne. Ina taimaka muku da kowanne abu. Menene kuke buƙata?', timestamp: now },
    { id: '2', role: 'user', content: 'Ina son sanin game da addinin musulunci', timestamp: new Date(now.getTime() + 60000) },
    { id: '3', role: 'assistant', content: 'Allah ya yi haɗari! Ina so in taimaka. Kun san cewa addinin musulunci ya dogara da: Iman, Salla, Azumi, Hajji, da Zaka. Menene abin da kuke son sani sosai?', timestamp: new Date(now.getTime() + 120000) }
  ],
  language: 'ha',
  createdAt: now,
  updatedAt: now
});

const knowledgeBase = {
  ha: {
    greeting: 'Sannu! Ni TruNORTH AI ne. Ina taimaka muku da kowanne abu.',
    help: 'Zan iya taimaka muku da: \n• Bayani game da addini\n• Magani da lafiya\n• Makarantu da ilimi\n• Alƙawari da ayyuka\n• Kasuwanci da aiki\n• Komai da kake buƙata!',
    emergency: 'Idan kana da gaggawa, kana iya buɗewayar shafin Emergency don tuntuɓar taimako.',
    prayer: 'Lokacin salla ya bambanta bisa ga watan. Zaka iya duba shafin Religious don lokutan salla.',
    donation: 'Idan kana son ba da azumi ko sadaka, kana iya amfani da shafin Donations.'
  },
  en: {
    greeting: 'Hello! I am TruNORTH AI. I am here to help you with anything.',
    help: 'I can help you with:\n• Religious guidance\n• Health and medical info\n• Education and learning\n• Community events\n• Business and jobs\n• Anything else you need!',
    emergency: 'If you have an emergency, you can open the Emergency page to contact help.',
    prayer: 'Prayer times vary by month. You can check the Religious page for prayer times.',
    donation: 'If you want to give Zakat or charity, you can use the Donations page.'
  }
};

router.post('/chat', optionalAuth, asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { message, sessionId } = req.body;
  
  if (!message) {
    throw new OperationalError('Message is required', 400);
  }
  
  const language = user?.language === 'ha' ? 'ha' : 'en';
  let session: ChatSession;
  
  if (sessionId) {
    const existing = sessions.get(sessionId);
    if (!existing) {
      throw new OperationalError('Session not found', 404);
    }
    session = existing;
  } else {
    session = {
      id: uuidv4(),
      userId: user?.id,
      title: message.substring(0, 30) + '...',
      messages: [],
      language,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    sessions.set(session.id, session);
  }
  
  const userMessage: ChatMessage = {
    id: uuidv4(),
    role: 'user',
    content: message,
    timestamp: new Date()
  };
  session.messages.push(userMessage);
  
  const response = generateAIResponse(message, language);
  
  const assistantMessage: ChatMessage = {
    id: uuidv4(),
    role: 'assistant',
    content: response,
    timestamp: new Date()
  };
  session.messages.push(assistantMessage);
  session.updatedAt = new Date();
  
  res.json({ message: assistantMessage, sessionId: session.id });
}));

router.get('/sessions', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const userSessions = Array.from(sessions.values())
    .filter(s => s.userId === user.id || s.userId === undefined)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  
  res.json({
    sessions: userSessions.map(s => ({
      id: s.id,
      title: s.title,
      language: s.language,
      messageCount: s.messages.length,
      lastMessage: s.messages[s.messages.length - 1]?.content.substring(0, 50),
      createdAt: s.createdAt,
      updatedAt: s.updatedAt
    }))
  });
}));

router.get('/sessions/:id', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const session = sessions.get(req.params.id);
  if (!session) throw new OperationalError('Session not found', 404);
  res.json({ session });
}));

router.delete('/sessions/:id', verifyToken, asyncHandler(async (_req: Request, res: Response) => {
  if (!sessions.has(_req.params.id)) throw new OperationalError('Session not found', 404);
  sessions.delete(_req.params.id);
  res.json({ message: 'Session deleted' });
}));

router.get('/quick-answers', optionalAuth, asyncHandler(async (req: Request, res: Response) => {
  const language = (req as any).user?.language === 'ha' ? 'ha' : 'en';
  const quickAnswers = [
    { id: 'prayer-times', question: language === 'ha' ? 'Lokacin salla?' : 'Prayer times?', answer: knowledgeBase[language].prayer, icon: 'pray' },
    { id: 'donate', question: language === 'ha' ? 'Yaya zan iya ba da sadaka?' : 'How can I donate?', answer: knowledgeBase[language].donation, icon: 'heart' },
    { id: 'emergency', question: language === 'ha' ? 'Menene yakamata in yi a gaggawa?' : 'What should I do in an emergency?', answer: knowledgeBase[language].emergency, icon: 'alert' },
    { id: 'help', question: language === 'ha' ? 'Kana iya taimakawa da?' : 'What can you help with?', answer: knowledgeBase[language].help, icon: 'help' }
  ];
  res.json({ quickAnswers });
}));

router.post('/summarize', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text || text.length < 100) throw new OperationalError('Text too short', 400);
  const words = text.split(' ');
  res.json({ originalLength: words.length, summary: words.slice(0, 50).join(' ') + (words.length > 50 ? '...' : ''), readTime: Math.ceil(words.length / 200) });
}));

router.post('/translate', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const { text, targetLanguage } = req.body;
  if (!text || !targetLanguage) throw new OperationalError('Text and target language required', 400);
  res.json({ original: text, translated: `[Translated to ${targetLanguage}]: ${text}`, targetLanguage });
}));

function generateAIResponse(message: string, language: 'en' | 'ha'): string {
  const lowerMessage = message.toLowerCase();
  
  if (['sannu', 'hello', 'hi', 'hey'].some(w => lowerMessage.includes(w))) {
    return knowledgeBase[language].greeting + '\n\n' + knowledgeBase[language].help;
  }
  
  if (lowerMessage.includes('emergency') || lowerMessage.includes('gaggawa')) {
    return knowledgeBase[language].emergency + '\n\n' + (language === 'ha' ? 'Kira: 112' : 'Call: 112');
  }
  
  if (lowerMessage.includes('prayer') || lowerMessage.includes('salla')) {
    return knowledgeBase[language].prayer;
  }
  
  if (lowerMessage.includes('donation') || lowerMessage.includes('sadaka')) {
    return knowledgeBase[language].donation;
  }
  
  if (lowerMessage.includes('doctor') || lowerMessage.includes('likita')) {
    return language === 'ha'
      ? 'Idan gaggawa ce, kira 112. Ko kuma duba shafin Emergency.'
      : 'If it\'s an emergency, call 112. Or check the Emergency page.';
  }
  
  return language === 'ha'
    ? `Na gode. Zan iya taimaka da: ${knowledgeBase.ha.help}`
    : `Thanks! I can help with: ${knowledgeBase.en.help}`;
}

export default router;
