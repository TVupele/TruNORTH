/**
 * Shop/Marketplace Routes
 * Handles products, orders, and marketplace operations
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { asyncHandler, OperationalError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { verifyToken, optionalAuth } from '../middleware/auth';

const router = Router();

// Types
interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  subcategory?: string;
  images: string[];
  stockQuantity: number;
  isAvailable: boolean;
  isFeatured: boolean;
  condition: 'new' | 'used' | 'refurbished';
  createdAt: Date;
}

interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  productId: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    phone: string;
  };
  createdAt: Date;
}

// In-memory storage
const products: Map<string, Product> = new Map();
const orders: Map<string, Order> = new Map();

// Initialize demo products
const demoProducts: Product[] = [
  {
    id: 'product-1',
    sellerId: 'seller-1',
    sellerName: 'TechStore Nigeria',
    name: 'Samsung Galaxy A54',
    description: 'Latest Samsung phone with excellent camera and battery life. 8GB RAM, 128GB storage.',
    price: 185000,
    currency: 'NGN',
    category: 'electronics',
    subcategory: 'phones',
    images: [],
    stockQuantity: 10,
    isAvailable: true,
    isFeatured: true,
    condition: 'new',
    createdAt: new Date()
  },
  {
    id: 'product-2',
    sellerId: 'seller-2',
    sellerName: 'Fashion Hub',
    name: 'Traditional Agbada Set',
    description: 'Premium quality cotton agbada for men. Available in various sizes and colors.',
    price: 15000,
    currency: 'NGN',
    category: 'fashion',
    subcategory: 'men',
    images: [],
    stockQuantity: 25,
    isAvailable: true,
    isFeatured: false,
    condition: 'new',
    createdAt: new Date()
  },
  {
    id: 'product-3',
    sellerId: 'seller-3',
    sellerName: 'Home Essentials',
    name: 'Rice Cooker - 5L',
    description: 'Electric rice cooker with keep warm function. Perfect for large families.',
    price: 8500,
    currency: 'NGN',
    category: 'home',
    subcategory: 'kitchen',
    images: [],
    stockQuantity: 50,
    isAvailable: true,
    isFeatured: true,
    condition: 'new',
    createdAt: new Date()
  },
  {
    id: 'product-4',
    sellerId: 'seller-1',
    sellerName: 'TechStore Nigeria',
    name: 'HP Laptop 15"',
    description: 'Core i5 processor, 8GB RAM, 512GB SSD. Suitable for work and study.',
    price: 320000,
    currency: 'NGN',
    category: 'electronics',
    subcategory: 'computers',
    images: [],
    stockQuantity: 5,
    isAvailable: true,
    isFeatured: false,
    condition: 'new',
    createdAt: new Date()
  }
];

demoProducts.forEach(p => products.set(p.id, p));

// Validation schemas
const createProductSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  price: z.number().positive(),
  category: z.string(),
  subcategory: z.string().optional(),
  condition: z.enum(['new', 'used', 'refurbished']),
  stockQuantity: z.number().int().nonnegative()
});

const createOrderSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  shippingAddress: z.object({
    address: z.string(),
    city: z.string(),
    state: z.string(),
    phone: z.string()
  })
});

const categories = [
  'electronics',
  'fashion',
  'home',
  'beauty',
  'sports',
  'vehicles',
  'services',
  'agriculture',
  'other'
];

/**
 * GET /api/shop/categories
 * Get product categories
 */
router.get('/categories', (req: Request, res: Response) => {
  res.json({ categories });
});

/**
 * GET /api/shop/products
 * Get all products with filtering
 */
router.get('/products', optionalAuth, asyncHandler(async (req: Request, res: Response) => {
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const minPrice = typeof req.query.minPrice === 'string' ? req.query.minPrice : undefined;
  const maxPrice = typeof req.query.maxPrice === 'string' ? req.query.maxPrice : undefined;
  const condition = typeof req.query.condition === 'string' ? req.query.condition : undefined;
  const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : undefined;
  
  let allProducts = Array.from(products.values())
    .filter(p => p.isAvailable);
  
  if (category) {
    allProducts = allProducts.filter(p => p.category === category);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    allProducts = allProducts.filter(p =>
      p.name.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower)
    );
  }
  
  if (minPrice) {
    allProducts = allProducts.filter(p => p.price >= Number(minPrice));
  }
  
  if (maxPrice) {
    allProducts = allProducts.filter(p => p.price <= Number(maxPrice));
  }
  
  if (condition) {
    allProducts = allProducts.filter(p => p.condition === condition);
  }
  
  // Sort
  if (sortBy === 'price_asc') {
    allProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price_desc') {
    allProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'newest') {
    allProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else {
    // Featured first
    allProducts.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  }
  
  res.json({ products: allProducts });
}));

/**
 * GET /api/shop/products/:id
 * Get single product details
 */
router.get('/products/:id', optionalAuth, asyncHandler(async (req: Request, res: Response) => {
  const product = products.get(req.params.id);
  
  if (!product) {
    throw new OperationalError('Product not found', 404);
  }
  
  res.json({ product });
}));

/**
 * POST /api/shop/products
 * Create a new product listing
 */
router.post('/products', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = createProductSchema.parse(req.body);
  
  const productId = uuidv4();
  const product: Product = {
    id: productId,
    sellerId: user.id,
    sellerName: user.name || 'Unknown',
    name: data.name,
    description: data.description,
    price: data.price,
    currency: 'NGN',
    category: data.category,
    subcategory: data.subcategory,
    images: [],
    stockQuantity: data.stockQuantity,
    isAvailable: true,
    isFeatured: false,
    condition: data.condition,
    createdAt: new Date()
  };
  
  products.set(productId, product);
  
  logger.info(`New product listed: ${productId} by user ${user.id}`);
  
  res.status(201).json({
    message: 'Product listed successfully',
    product
  });
}));

/**
 * PUT /api/shop/products/:id
 * Update product
 */
router.put('/products/:id', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const product = products.get(req.params.id);
  
  if (!product) {
    throw new OperationalError('Product not found', 404);
  }
  
  if (product.sellerId !== user.id && user.role !== 'admin') {
    throw new OperationalError('Not authorized to update this product', 403);
  }
  
  // Update allowed fields
  if (req.body.name) product.name = req.body.name;
  if (req.body.description) product.description = req.body.description;
  if (req.body.price) product.price = req.body.price;
  if (typeof req.body.stockQuantity === 'number') product.stockQuantity = req.body.stockQuantity;
  if (typeof req.body.isAvailable === 'boolean') product.isAvailable = req.body.isAvailable;
  
  res.json({
    message: 'Product updated',
    product
  });
}));

/**
 * DELETE /api/shop/products/:id
 * Delete product listing
 */
router.delete('/products/:id', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const product = products.get(req.params.id);
  
  if (!product) {
    throw new OperationalError('Product not found', 404);
  }
  
  if (product.sellerId !== user.id && user.role !== 'admin') {
    throw new OperationalError('Not authorized to delete this product', 403);
  }
  
  products.delete(req.params.id);
  
  res.json({ message: 'Product deleted' });
}));

/**
 * POST /api/shop/orders
 * Create a new order
 */
router.post('/orders', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = createOrderSchema.parse(req.body);
  
  const product = products.get(data.productId);
  
  if (!product) {
    throw new OperationalError('Product not found', 404);
  }
  
  if (!product.isAvailable || product.stockQuantity < data.quantity) {
    throw new OperationalError('Product not available in requested quantity', 400);
  }
  
  const orderId = uuidv4();
  const totalAmount = product.price * data.quantity;
  
  const order: Order = {
    id: orderId,
    buyerId: user.id,
    buyerName: user.name,
    sellerId: product.sellerId,
    productId: product.id,
    productName: product.name,
    quantity: data.quantity,
    totalAmount,
    currency: 'NGN',
    status: 'pending',
    shippingAddress: data.shippingAddress,
    createdAt: new Date()
  };
  
  orders.set(orderId, order);
  
  // Update stock
  product.stockQuantity -= data.quantity;
  
  logger.info(`New order created: ${orderId} for product ${product.id}`);
  
  res.status(201).json({
    message: 'Order placed successfully',
    order,
    paymentInstructions: 'Proceed to wallet to complete payment'
  });
}));

/**
 * GET /api/shop/orders
 * Get user orders (buyer) or sales (seller)
 */
router.get('/orders', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const type = req.query.type as string || 'buyer'; // 'buyer' or 'seller'
  
  let userOrders = Array.from(orders.values());
  
  if (type === 'seller') {
    userOrders = userOrders.filter(o => o.sellerId === user.id);
  } else {
    userOrders = userOrders.filter(o => o.buyerId === user.id);
  }
  
  // Sort by newest first
  userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  res.json({ orders: userOrders });
}));

/**
 * GET /api/shop/orders/:id
 * Get single order details
 */
router.get('/orders/:id', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const order = orders.get(req.params.id);
  
  if (!order) {
    throw new OperationalError('Order not found', 404);
  }
  
  if (order.buyerId !== user.id && order.sellerId !== user.id && user.role !== 'admin') {
    throw new OperationalError('Not authorized to view this order', 403);
  }
  
  res.json({ order });
}));

/**
 * PUT /api/shop/orders/:id/status
 * Update order status
 */
router.put('/orders/:id/status', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { status } = req.body;
  
  const order = orders.get(req.params.id);
  
  if (!order) {
    throw new OperationalError('Order not found', 404);
  }
  
  // Seller can update to confirmed/shipped
  // Buyer can update to cancelled/refunded
  const validTransitions: Record<string, string[]> = {
    seller: ['confirmed', 'shipped', 'cancelled'],
    buyer: ['cancelled', 'refunded'],
    admin: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded']
  };
  
  const userType = order.sellerId === user.id ? 'seller' : 'buyer';
  const allowedStatuses = user.role === 'admin' ? validTransitions.admin : validTransitions[userType];
  
  if (!allowedStatuses.includes(status)) {
    throw new OperationalError(`Cannot change status to ${status}`, 400);
  }
  
  order.status = status;
  
  logger.info(`Order ${order.id} status updated to ${status}`);
  
  res.json({
    message: 'Order status updated',
    order
  });
}));

/**
 * GET /api/shop/my-products
 * Get products listed by current user
 */
router.get('/my-products', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  
  const myProducts = Array.from(products.values())
    .filter(p => p.sellerId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  res.json({ products: myProducts });
}));

export default router;
