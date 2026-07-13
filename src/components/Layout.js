import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, FileText, Settings as SettingsIcon, LogOut, Store, Tags, Menu, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Layout = () => {
  const { user, logout, settings } = useAppContext();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', icon: <LayoutDashboard className="w-6 h-6" />, label: 'Dashboard' },
    { path: '/order', icon: <ShoppingCart className="w-6 h-6" />, label: 'Create Order' },
    { path: '/inventory', icon: <Package className="w-6 h-6" />, label: 'Inventory' },
    { path: '/reports', icon: <FileText className="w-6 h-6" />, label: 'Reports' },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ path: '/categories', icon: <Tags className="w-6 h-6" />, label: 'Categories' });
    menuItems.push({ path: '/settings', icon: <SettingsIcon className="w-6 h-6" />, label: 'Settings' });
  }

  return (
    <div className="flex h-screen bg-slate-50 no-print overflow-hidden">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-brand-dark text-white flex flex-col fixed md:relative z-50 h-full transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Store className="w-8 h-8 text-brand-light" />
            <h1 className="text-xl font-bold truncate">{settings.shopName}</h1>
          </div>
          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-6 h-6 text-slate-300" />
          </button>
        </div>
        
        <nav className="flex-1 py-6">
          <ul className="space-y-2 px-4">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                      isActive ? 'bg-brand-blue text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-4 px-2 text-slate-300">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold uppercase">
              {user?.username?.[0] || 'U'}
            </div>
            <div>
              <div className="font-medium text-white">{user?.username}</div>
              <div className="text-xs uppercase text-slate-400">{user?.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-colors font-medium"
          >
            <LogOut className="w-6 h-6" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden h-screen w-full relative">
        {/* Mobile Header */}
        <div className="md:hidden bg-white p-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Store className="w-6 h-6 text-brand-blue" />
            <h1 className="text-lg font-bold truncate">{settings.shopName}</h1>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-7 h-7 text-slate-600" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
