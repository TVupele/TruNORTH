/**
 * TruNORTH Shop API - Vercel Serverless Function
 */

import { VercelRequest, VercelResponse } from '@vercel/node';

// Demo products
const products: Array<{
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
}> = [
  {
    id: 'p1',
    name: 'TruNORTH Hoodie',
    description: 'Premium quality hoodie with university logo',
    price: 49.99,
    category: 'Apparel',
    image: '/images/hoodie.jpg',
    stock: 50
  },
  {
    id: 'p2',
    name: 'TruNORTH T-Shirt',
    description: 'Classic fit t-shirt',
    price: 24.99,
    category: 'Apparel',
    image: '/images/tshirt.jpg',
    stock: 100
  },
  {
    id: 'p3',
    name: 'TruNORTH Mug',
    description: 'Ceramic mug with university branding',
    price: 14.99,
    category: 'Accessories',
    image: '/images/mug.jpg',
    stock: 75
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, url } = req;
  const path = url?.replace('/api/shop', '') || '/';

  try {
    // GET / - List products
    if (method === 'GET' && (path === '/' || path === '')) {
      return res.json({ products });
    }

    // GET /:id - Get product
    if (method === 'GET' && path.startsWith('/') && path.split('/')[1] && !path.includes('?')) {
      const id = path.split('/')[1];
      const product = products.find(p => p.id === id);
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      return res.json({ product });
    }

    // POST /order - Create order
    if (method === 'POST' && path === '/order') {
      const { productId, quantity, shippingAddress } = req.body;
      
      const product = products.find(p => p.id === productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      const order = {
        id: `ord-${Date.now()}`,
        productId,
        productName: product.name,
        quantity: Number(quantity) || 1,
        total: product.price * (Number(quantity) || 1),
        shippingAddress,
        status: 'pending',
        createdAt: new Date()
      };
      
      return res.status(201).json({ message: 'Order created', order });
    }

    // 404 for unknown routes
    return res.status(404).json({ error: 'Not Found' });

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
