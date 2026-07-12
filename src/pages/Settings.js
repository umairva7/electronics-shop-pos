import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Save, ShieldAlert, Store, Users, Percent } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { settings, setSettings } = useAppContext();
  const [formData, setFormData] = useState({ ...settings });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setSettings(formData);
      setIsSaving(false);
      toast.success('Settings saved successfully');
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">System Settings</h1>
        <p className="text-slate-500 mt-1">Configure shop details and permissions</p>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-r-lg flex items-start gap-3">
        <ShieldAlert className="w-6 h-6 text-yellow-600 shrink-0" />
        <div>
          <h3 className="font-bold text-yellow-800">Admin Access Only</h3>
          <p className="text-yellow-700 text-sm mt-1">Changes made here affect the entire point of sale system. Please ensure tax rates comply with local regulations.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Shop Settings */}
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <Store className="w-6 h-6 text-brand-blue" />
            General Shop Info
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Shop Name (Printed on Receipt)</label>
              <input
                type="text"
                value={formData.shopName}
                onChange={(e) => setFormData({...formData, shopName: e.target.value})}
                className="w-full md:w-2/3 px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-blue outline-none text-lg"
                required
              />
            </div>
          </div>
        </div>

        {/* Financial Settings */}
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <Percent className="w-6 h-6 text-brand-blue" />
            Financial & Rules
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Default Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.taxRate}
                onChange={(e) => setFormData({...formData, taxRate: parseFloat(e.target.value) || 0})}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-blue outline-none text-lg font-mono"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Max Discount Without Admin (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discountThreshold}
                onChange={(e) => setFormData({...formData, discountThreshold: parseFloat(e.target.value) || 0})}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-blue outline-none text-lg font-mono"
                required
              />
              <p className="text-xs text-slate-500 mt-2">Cashiers cannot exceed this discount percentage.</p>
            </div>
          </div>
        </div>

        {/* User Management (Mock) */}
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 opacity-60 pointer-events-none">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-6 h-6 text-brand-blue" />
              Staff Management (Coming Soon)
            </h2>
            <span className="bg-slate-200 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">PRO FEATURE</span>
          </div>
          <p className="text-slate-500">Upgrade to Pro to manage multiple staff accounts, track individual drawer balances, and set detailed permissions.</p>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-brand-blue hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-xl flex items-center gap-3 transition-colors shadow-lg disabled:opacity-70 text-lg"
          >
            {isSaving ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-6 h-6" />
            )}
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
