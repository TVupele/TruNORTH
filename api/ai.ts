/**
 * TruNORTH AI API - Vercel Serverless Function
 */

import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, url } = req;
  const path = url?.replace('/api/ai', '') || '/';

  // Demo responses for AI chat
  const demoResponses: Record<string, string> = {
    greeting: "Hello! I'm TruNORTH AI. How can I help you today?",
    help: "I can help you with:\n- Finding events\n- Managing your wallet\n- Making donations\n- Emergency assistance\n- General inquiries",
    events: "Here are our upcoming events:\n1. Community Gathering - March 15th\n2. Youth Workshop - March 20th\n3. Fundraising Gala - April 1st",
    wallet: "You can check your wallet balance, make deposits, withdrawals, and view transaction history.",
    donate: "To make a donation, go to the Donations page and select a cause you'd like to support.",
    emergency: "For emergencies, use the Emergency page to report incidents or contact emergency services directly.",
    default: "I'm not sure about that. Can you try asking in a different way?"
  };

  try {
    // POST /chat - AI chat
    if (method === 'POST' && path === '/chat') {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const lowerMessage = message.toLowerCase();
      let response = demoResponses.default;

      if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        response = demoResponses.greeting;
      } else if (lowerMessage.includes('help')) {
        response = demoResponses.help;
      } else if (lowerMessage.includes('event')) {
        response = demoResponses.events;
      } else if (lowerMessage.includes('wallet') || lowerMessage.includes('balance')) {
        response = demoResponses.wallet;
      } else if (lowerMessage.includes('donat')) {
        response = demoResponses.donate;
      } else if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) {
        response = demoResponses.emergency;
      }

      return res.json({
        message: response,
        timestamp: new Date().toISOString()
      });
    }

    // GET / - AI info
    if (method === 'GET' && (path === '/' || path === '')) {
      return res.json({
        name: 'TruNORTH AI',
        version: '1.0.0',
        capabilities: ['chat', 'assistance', 'information']
      });
    }

    // 404 for unknown routes
    return res.status(404).json({ error: 'Not Found' });

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
