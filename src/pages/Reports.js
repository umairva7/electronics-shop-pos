import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Eye, DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';

const Reports = () => {
  const { orders } = useAppContext();
  const navigate = useNavigate();
  const [dateFilter, setDateFilter] = useState('7'); // days

  // Calculate stats based on filter
  const filterDate = new Date();
  filterDate.setDate(filterDate.getDate() - parseInt(dateFilter));
  
  const filteredOrders = orders.filter(o => new Date(o.date) >= filterDate);
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = filteredOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Chart Data preparation (daily sales)
  const salesByDate = {};
  filteredOrders.forEach(o => {
    const d = new Date(o.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    salesByDate[d] = (salesByDate[d] || 0) + o.total;
  });
  
  const chartData = Object.keys(salesByDate).map(date => ({
    name: date,
    Sales: salesByDate[date]
  })).reverse(); // Assuming orders are newest first

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Sales Reports</h1>
          <p className="text-slate-500 mt-1">Analytics and transaction history</p>
        </div>
        <div className="flex gap-4">
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-blue outline-none font-medium bg-white"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="365">Last Year</option>
            <option value="9999">All Time</option>
          </select>
          <button className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
            <Download className="w-5 h-5" /> CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 font-medium">Total Revenue</p>
              <h3 className="text-4xl font-black text-slate-900 mt-1">${totalRevenue.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 font-medium">Total Orders</p>
              <h3 className="text-4xl font-black text-slate-900 mt-1">{totalOrders}</h3>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 font-medium">Average Order</p>
              <h3 className="text-4xl font-black text-slate-900 mt-1">${avgOrderValue.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 h-96">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Revenue Trend</h2>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dx={-10} tickFormatter={(value) => `$${value}`} />
            <Tooltip 
              cursor={{fill: '#f1f5f9'}}
              contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
            />
            <Bar dataKey="Sales" fill="#1d4ed8" radius={[4, 4, 0, 0]} maxBarSize={60} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Transaction History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 text-slate-600 font-medium">Order ID</th>
                <th className="py-4 px-6 text-slate-600 font-medium">Date & Time</th>
                <th className="py-4 px-6 text-slate-600 font-medium">Items</th>
                <th className="py-4 px-6 text-slate-600 font-medium text-right">Total</th>
                <th className="py-4 px-6 text-slate-600 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="py-4 px-6 font-bold text-slate-900">{order.id}</td>
                  <td className="py-4 px-6 text-slate-600">
                    {new Date(order.date).toLocaleDateString()} {new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </td>
                  <td className="py-4 px-6 text-slate-600">{order.items.length} items</td>
                  <td className="py-4 px-6 text-right font-bold text-slate-900">${order.total.toFixed(2)}</td>
                  <td className="py-4 px-6 text-center">
                    <button 
                      onClick={() => navigate(`/invoice/${order.id}`)}
                      className="px-4 py-2 text-brand-blue hover:bg-blue-50 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                      <Eye className="w-4 h-4" /> View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500">No orders found for this period</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
