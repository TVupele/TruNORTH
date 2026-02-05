import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase, API_URL } from '@/lib/supabase';
import { 
  Users, 
  AlertTriangle, 
  Package, 
  Heart, 
  Settings, 
  Search, 
  Loader2, 
  CheckCircle, 
  XCircle,
  RefreshCcw
} from 'lucide-react';

// --- Types ---
interface User {
  id: string;
  name: string; // Adjusted from fullname based on your code
  email: string;
  role: 'admin' | 'user' | 'moderator';
  created_at: string;
  last_sign_in?: string;
}

interface EmergencyReport {
  id: string;
  type: string;
  description: string;
  status: 'pending' | 'acknowledged' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  user: {
    name: string;
    email: string;
  };
}

// --- Component ---
export function AdminPage() {
  const { t } = useLanguage();
  
  // State
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [users, setUsers] = useState<User[]>([]);
  const [emergencyReports, setEmergencyReports] = useState<EmergencyReport[]>([]);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'emergency'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null); // For specific item updates

  useEffect(() => {
    checkAdminAndFetchData();
  }, []);

  // 1. Security: Verify Admin Role before fetching sensitive data
  const checkAdminAndFetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError("Please log in to access this page.");
        setIsLoading(false);
        return;
      }

      // Check user role from public.users table or custom claim
      // Assuming you have a 'role' column in your users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (userError || userData?.role !== 'admin') {
        setError("Access Denied: You do not have administrator privileges.");
        setIsLoading(false);
        return;
      }

      setIsAdmin(true);
      await fetchAdminData(session.access_token);
      
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminData = async (token: string) => {
    try {
      const [usersRes, emergencyRes] = await Promise.all([
        fetch(`${API_URL}/admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${API_URL}/admin/emergency-reports`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      if (!usersRes.ok || !emergencyRes.ok) throw new Error('Failed to fetch data from server');

      const usersData = await usersRes.json();
      const reportsData = await emergencyRes.json();

      setUsers(usersData.users || []);
      setEmergencyReports(reportsData.reports || []);
    } catch (err) {
      throw err; // Propagate to parent catch
    }
  };

  const updateEmergencyStatus = async (reportId: string, newStatus: string) => {
    setActionLoading(reportId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch(`${API_URL}/admin/emergency-reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update");

      // Optimistic update (update UI without re-fetching everything)
      setEmergencyReports(prev => prev.map(r => 
        r.id === reportId ? { ...r, status: newStatus as any } : r
      ));

    } catch (error) {
      console.error('Error updating status:', error);
      alert("Failed to update status. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // --- Render Helpers ---

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-600" />
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="bg-red-50 p-6 rounded-lg text-center max-w-md">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-700 mb-2">Access Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-xl shadow-lg flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <Settings className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-blue-100">TruNORTH Platform Management</p>
          </div>
        </div>
        <button 
          onClick={checkAdminAndFetchData}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
          title="Refresh Data"
        >
          <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Users} color="blue" 
          label="Total Users" value={users.length} 
        />
        <StatCard 
          icon={AlertTriangle} color="red" 
          label="Emergency Reports" value={emergencyReports.length} 
        />
        <StatCard 
          icon={Package} color="green" 
          label="Active Orders" value={0} 
        />
        <StatCard 
          icon={Heart} color="purple" 
          label="Donations" value={0} 
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex gap-6 px-6">
            {['overview', 'users', 'emergency'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-2 border-b-2 font-medium capitalize transition-colors ${
                  activeTab === tab 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* USER TAB */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">User Management</h3>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredUsers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No users found.</p>
                ) : (
                  filteredUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-4 border border-gray-100 bg-gray-50/50 rounded-lg hover:bg-white hover:shadow-sm transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{u.name}</p>
                          <p className="text-sm text-gray-500">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-400">
                          Joined: {new Date(u.created_at).toLocaleDateString()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {u.role}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* EMERGENCY TAB */}
          {activeTab === 'emergency' && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg mb-4">Emergency Reports</h3>
              <div className="space-y-3">
                {emergencyReports.map((r) => (
                  <div key={r.id} className="p-5 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                           <span className={`w-2 h-2 rounded-full ${
                             r.priority === 'high' || r.priority === 'critical' ? 'bg-red-500' : 'bg-blue-500'
                           }`} />
                          <p className="font-bold capitalize text-lg">{r.type}</p>
                        </div>
                        <p className="text-sm text-gray-600">
                          From: <span className="font-medium">{r.user.name}</span> ({r.user.email})
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {actionLoading === r.id && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                        <select
                          value={r.status}
                          disabled={actionLoading === r.id}
                          onChange={(e) => updateEmergencyStatus(r.id, e.target.value)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border cursor-pointer focus:ring-2 focus:ring-offset-1 outline-none ${
                            r.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 focus:ring-yellow-400' :
                            r.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-400' :
                            r.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-200 focus:ring-green-400' :
                            'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="acknowledged">Acknowledged</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-md mb-3">
                      <p className="text-sm text-gray-700">{r.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 border-t pt-3 mt-2">
                      <span className={`uppercase font-bold ${
                        r.priority === 'critical' ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        Priority: {r.priority}
                      </span>
                      <span>ID: {r.id.slice(0, 8)}...</span>
                      <span>{new Date(r.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="font-bold text-lg">Platform Health</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">New Users (7 days)</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {users.filter(u => {
                      const date = new Date(u.created_at);
                      const now = new Date();
                      const diffTime = Math.abs(now.getTime() - date.getTime());
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                      return diffDays <= 7;
                    }).length}
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Total Revenue (All time)</p>
                  <p className="text-3xl font-bold text-green-600">₦0.00</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Sub-components to keep code clean ---
function StatCard({ icon: Icon, color, label, value }: { icon: any, color: string, label: string, value: number }) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    red: "bg-red-100 text-red-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
        </div>
      </div>
    </div>
  );
}