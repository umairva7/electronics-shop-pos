import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Package, AlertTriangle, TrendingUp, ShoppingCart, Search } from 'lucide-react';

const Dashboard = () => {
  const { products, orders } = useAppContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const lowStockItems = products.filter(p => p.quantity < 5);
  const totalProducts = products.reduce((acc, p) => acc + p.quantity, 0);
  
  // Today's orders
  const today = new Date().toISOString().split('T')[0];
  const todaysOrders = orders.filter(o => o.date.startsWith(today));
  const todaysSales = todaysOrders.reduce((acc, o) => acc + o.total, 0);

  const recentOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/inventory?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your shop today</p>
        </div>
        <button
          onClick={() => navigate('/order')}
          className="bg-brand-blue hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-3 transition-colors h-14 shadow-lg shadow-blue-500/30"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="text-lg">New Order</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-8">
        <form onSubmit={handleSearch} className="relative">
          <Search className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-lg bg-slate-50 border border-slate-200 focus:border-brand-blue focus:ring-2 focus:ring-blue-100 outline-none text-lg transition-all"
          />
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-500 font-medium">Total Products</p>
            <p className="text-3xl font-bold text-slate-900">{totalProducts}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 bg-emerald-100 text-emerald-600 rounded-full">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-500 font-medium">Today's Sales</p>
            <p className="text-3xl font-bold text-slate-900">${todaysSales.toFixed(2)}</p>
            <p className="text-sm text-emerald-600 font-medium">{todaysOrders.length} orders</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 bg-red-100 text-red-600 rounded-full">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-500 font-medium">Low Stock Items</p>
            <p className="text-3xl font-bold text-slate-900">{lowStockItems.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">Recent Orders</h2>
            <button onClick={() => navigate('/reports')} className="text-brand-blue hover:underline font-medium">View All</button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentOrders.length > 0 ? recentOrders.map(order => (
              <div key={order.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center cursor-pointer" onClick={() => navigate(`/invoice/${order.id}`)}>
                <div>
                  <p className="font-bold text-slate-900">{order.id}</p>
                  <p className="text-sm text-slate-500">{new Date(order.date).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-brand-blue">${order.total.toFixed(2)}</p>
                  <p className="text-sm text-slate-500">{order.items.length} items</p>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-500">No recent orders</div>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              Needs Restocking
            </h2>
          </div>
          <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            {lowStockItems.length > 0 ? lowStockItems.map(item => (
              <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-500">SKU: {item.sku}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700">
                    {item.quantity} left
                  </span>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-500">All products are well stocked!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
