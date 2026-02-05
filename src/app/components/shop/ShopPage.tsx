import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase, API_URL } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  ShoppingCart, 
  Package, 
  Search, 
  Filter, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard,
  Loader2,
  ShoppingBag
} from 'lucide-react';

// --- Types ---
interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
}

interface CartItem {
  id: string; // Cart Item ID
  product: Product;
  quantity: number;
}

// --- Mock Data (Fallback) ---
const MOCK_PRODUCTS: Product[] = [
  { id: '1', title: 'Premium Wireless Headphones', description: 'Noise cancelling, 40h battery life.', price: 45000, category: 'Electronics', stock: 10, image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80' },
  { id: '2', title: 'Ergonomic Office Chair', description: 'Lumbar support, breathable mesh.', price: 85000, category: 'Furniture', stock: 5, image_url: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80' },
  { id: '3', title: 'Smart Fitness Watch', description: 'Track heart rate, sleep, and steps.', price: 25000, category: 'Electronics', stock: 20, image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80' },
  { id: '4', title: 'Organic Cotton T-Shirt', description: 'Breathable fabric, eco-friendly.', price: 8000, category: 'Clothing', stock: 50, image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80' },
];

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Furniture', 'Books'];

export function ShopPage() {
  const { t } = useLanguage();
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [address, setAddress] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, []);

  const fetchProducts = async () => {
    try {
      // const res = await fetch(`${API_URL}/marketplace/products`);
      // const data = await res.json();
      // setProducts(data.products || []);
      
      // Simulate API
      setTimeout(() => {
        setProducts(MOCK_PRODUCTS);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const fetchCart = async () => {
    // In real app, fetch from Supabase/API
    // const { data: { session } } = await supabase.auth.getSession();
    // ... fetch logic
  };

  // --- Cart Logic (Optimistic UI) ---

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        toast.success("Quantity updated");
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      toast.success("Added to cart");
      return [...prev, { id: Date.now().toString(), product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
    toast.info("Item removed");
  };

  const handleCheckout = async () => {
    if (!address) { toast.error('Please enter a shipping address'); return; }
    
    setIsCheckingOut(true);
    try {
      // API Call would go here
      await new Promise(r => setTimeout(r, 2000)); // Simulate processing
      
      toast.success('Order placed successfully!');
      setCart([]);
      setIsCartOpen(false);
      setAddress('');
    } catch {
      toast.error(t('error'));
    } finally {
      setIsCheckingOut(false);
    }
  };

  // --- Derived State ---

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shippingCost = cartTotal > 50000 ? 0 : 1500; // Free shipping over 50k
  const grandTotal = cartTotal + shippingCost;

  return (
    <div className="relative h-[calc(100vh-100px)]">
      
      {/* --- Main Content Area --- */}
      <div className="space-y-6 h-full flex flex-col">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
              {t('products') || 'Marketplace'}
            </h1>
            <p className="text-sm text-gray-500">Find the best deals on TruNORTH</p>
          </div>

          <div className="flex w-full md:w-auto gap-3">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            
            <button 
              onClick={() => setIsCartOpen(true)} 
              className="relative p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-white">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat 
                  ? 'bg-gray-900 text-white shadow-md' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl h-72 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <Package className="w-16 h-16 mb-4 opacity-20" />
            <p>No products found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-20">
            {filteredProducts.map((p) => (
              <div key={p.id} className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden flex flex-col">
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img 
                    src={p.image_url} 
                    alt={p.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-xs font-bold text-gray-700">
                    {p.category}
                  </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{p.title}</h3>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2 flex-1">{p.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-lg font-bold text-blue-600">₦{p.price.toLocaleString()}</span>
                    <button 
                      onClick={() => addToCart(p)}
                      className="p-2 bg-gray-900 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-gray-200"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Cart Drawer Overlay --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in"
            onClick={() => setIsCartOpen(false)}
          />
          
          {/* Drawer Panel */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right flex flex-col">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-gray-700" />
                <h2 className="font-bold text-lg">My Cart ({cart.length})</h2>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Drawer Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-10 h-10 text-gray-300" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Your cart is empty</p>
                    <p className="text-sm text-gray-500">Looks like you haven't added anything yet.</p>
                  </div>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4 animate-in slide-in-from-bottom-2">
                    <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                      <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{item.product.title}</h4>
                        <p className="text-xs text-gray-500">{item.product.category}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-600 text-sm">
                          ₦{(item.product.price * item.quantity).toLocaleString()}
                        </span>
                        
                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-1 border border-gray-200">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 hover:text-red-500 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 hover:text-green-500 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer (Checkout) */}
            {cart.length > 0 && (
              <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>₦{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? 'Free' : `₦${shippingCost.toLocaleString()}`}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-dashed border-gray-200">
                    <span>Total</span>
                    <span>₦{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <input 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    placeholder="Enter delivery address..." 
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button 
                  onClick={handleCheckout} 
                  disabled={isCheckingOut || !address}
                  className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isCheckingOut ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Checkout</span>
                      <CreditCard className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}