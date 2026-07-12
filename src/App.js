import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { Toaster } from 'react-hot-toast';

import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import CreateOrder from './pages/CreateOrder';
import Invoice from './pages/Invoice';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import CategoryManagement from './pages/CategoryManagement';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user } = useAppContext();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="order" element={<CreateOrder />} />
        <Route path="invoice/:id" element={<Invoice />} />
        <Route path="reports" element={<Reports />} />
        <Route path="categories" element={<ProtectedRoute requireAdmin><CategoryManagement /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute requireAdmin><Settings /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
