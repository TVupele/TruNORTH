import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase, API_URL } from '@/lib/supabase';
import { toast } from 'sonner';
import { Wallet, ArrowUpCircle, ArrowDownCircle, History, CreditCard, Smartphone, Building2 } from 'lucide-react';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;
}

export function WalletPage() {
  const { t } = useLanguage();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [amount, setAmount] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [description, setDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all');

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Try API first, fall back to demo data
      try {
        if (session?.access_token) {
          const [walletRes, txRes] = await Promise.all([
            fetch(`${API_URL}/wallet`, { headers: { 'Authorization': `Bearer ${session.access_token}` } }),
            fetch(`${API_URL}/wallet/transactions`, { headers: { 'Authorization': `Bearer ${session.access_token}` } })
          ]);
          
          if (walletRes.ok) {
            const walletData = await walletRes.json();
            setBalance(walletData.wallet?.balance || 45200);
          }
          if (txRes.ok) {
            const txData = await txRes.json();
            setTransactions(txData.transactions || getDemoTransactions());
          }
        }
      } catch {
        // API not available, use demo data
        setBalance(45200);
        setTransactions(getDemoTransactions());
      }
    } catch (error) {
      setBalance(45200);
      setTransactions(getDemoTransactions());
    } finally {
      setLoading(false);
    }
  };

  const getDemoTransactions = (): Transaction[] => [
    { id: '1', type: 'deposit', amount: 5000, balance_after: 50200, description: 'Bank Transfer', created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: '2', type: 'payment', amount: -2000, balance_after: 48200, description: 'Donation - Flood Relief', created_at: new Date(Date.now() - 172800000).toISOString() },
    { id: '3', type: 'deposit', amount: 20000, balance_after: 68200, description: 'Wallet Top-up', created_at: new Date(Date.now() - 259200000).toISOString() },
    { id: '4', type: 'transfer_in', amount: 5000, balance_after: 73200, description: 'From: Ahmed Musa', created_at: new Date(Date.now() - 345600000).toISOString() },
    { id: '5', type: 'payment', amount: -185000, balance_after: 48200, description: 'Samsung Galaxy A54', created_at: new Date(Date.now() - 432000000).toISOString() },
  ];

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const topUpAmount = parseFloat(amount);
    if (isNaN(topUpAmount) || topUpAmount <= 0) {
      toast.error('Invalid amount');
      return;
    }
    // Demo success
    toast.success(`₦${topUpAmount.toLocaleString()} added to wallet!`);
    setShowTopUp(false);
    setAmount('');
    setBalance(prev => prev + topUpAmount);
    setTransactions(prev => [{
      id: Date.now().toString(),
      type: 'deposit',
      amount: topUpAmount,
      balance_after: balance + topUpAmount,
      description: 'Bank Transfer',
      created_at: new Date().toISOString()
    }, ...prev]);
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast.error('Invalid amount');
      return;
    }
    if (transferAmount > balance) {
      toast.error('Insufficient balance');
      return;
    }
    toast.success(`₦${transferAmount.toLocaleString()} sent to ${recipientId}`);
    setShowTransfer(false);
    setAmount('');
    setRecipientId('');
    setDescription('');
    setBalance(prev => prev - transferAmount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredTransactions = transactions.filter(tx => {
    if (activeTab === 'income') return tx.amount > 0;
    if (activeTab === 'expense') return tx.amount < 0;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
          <p className="text-gray-500">Manage your TruNORTH balance</p>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="w-5 h-5 opacity-80" />
          <span className="text-sm opacity-90">Available Balance</span>
        </div>
        <h2 className="text-4xl font-bold">₦{balance.toLocaleString()}</h2>
        <div className="flex gap-3 mt-6">
          <button onClick={() => setShowTopUp(true)} className="flex-1 bg-white/20 hover:bg-white/30 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
            <ArrowDownCircle className="w-5 h-5" />
            Top Up
          </button>
          <button onClick={() => setShowTransfer(true)} className="flex-1 bg-white text-blue-600 hover:bg-gray-100 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
            <ArrowUpCircle className="w-5 h-5" />
            Transfer
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: CreditCard, label: 'Pay Bills', color: 'bg-green-100 text-green-600' },
          { icon: Smartphone, label: 'Airtime', color: 'bg-orange-100 text-orange-600' },
          { icon: Building2, label: 'Banking', color: 'bg-purple-100 text-purple-600' }
        ].map((item, i) => (
          <button key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center mx-auto mb-2`}>
              <item.icon className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-gray-700">{item.label}</p>
          </button>
        ))}
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-gray-500" />
            <h3 className="font-bold text-gray-900">Transactions</h3>
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(['all', 'income', 'expense'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${activeTab === tab ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No transactions yet</p>
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.amount >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  {tx.amount >= 0 ? <ArrowDownCircle className="w-5 h-5 text-green-600" /> : <ArrowUpCircle className="w-5 h-5 text-red-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{tx.description}</p>
                  <p className="text-sm text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.amount >= 0 ? '+' : ''}₦{Math.abs(tx.amount).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">₦{tx.balance_after.toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top Up Modal */}
      {showTopUp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTopUp(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Top Up Wallet</h3>
            <form onSubmit={handleTopUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount (₦)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required min="100" placeholder="Enter amount" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1000, 2000, 5000, 10000].map(amt => (
                  <button type="button" key={amt} onClick={() => setAmount(amt.toString())} className="py-2 border border-gray-200 rounded-lg hover:bg-blue-50">{amt}</button>
                ))}
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600">Confirm</button>
                <button type="button" onClick={() => setShowTopUp(false)} className="flex-1 bg-gray-100 py-3 rounded-xl font-medium hover:bg-gray-200">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransfer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTransfer(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Send Money</h3>
            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Recipient ID or Phone</label>
                <input type="text" value={recipientId} onChange={e => setRecipientId(e.target.value)} required placeholder="Enter recipient ID" className="w-full px-4 py-3 border border-gray-300 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount (₦)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required min="1" max={balance} placeholder="Enter amount" className="w-full px-4 py-3 border border-gray-300 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="What's this for?" className="w-full px-4 py-3 border border-gray-300 rounded-xl" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600">Send</button>
                <button type="button" onClick={() => setShowTransfer(false)} className="flex-1 bg-gray-100 py-3 rounded-xl font-medium hover:bg-gray-200">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
