import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

// Mock Data
const MOCK_PRODUCTS = [
  { id: 1, name: 'Solar Panel 150W', category: 'Solar Panels', quantity: 25, basePrice: 120, sku: 'SP-150-001' },
  { id: 2, name: 'Solar Panel 300W', category: 'Solar Panels', quantity: 10, basePrice: 220, sku: 'SP-300-002' },
  { id: 3, name: 'Inverter 1000W', category: 'Inverters', quantity: 4, basePrice: 350, sku: 'INV-1K-001' },
  { id: 4, name: 'Inverter 3000W Hybrid', category: 'Inverters', quantity: 2, basePrice: 850, sku: 'INV-3K-002' },
  { id: 5, name: 'Deep Cycle Battery 100Ah', category: 'Batteries', quantity: 15, basePrice: 180, sku: 'BAT-100-001' },
  { id: 6, name: 'Lithium Ion Battery 200Ah', category: 'Batteries', quantity: 3, basePrice: 650, sku: 'BAT-200-002' },
  { id: 7, name: 'DC Breaker 63A', category: 'Breakers', quantity: 50, basePrice: 15, sku: 'BRK-DC-063' },
  { id: 8, name: 'AC Breaker 32A', category: 'Breakers', quantity: 100, basePrice: 10, sku: 'BRK-AC-032' },
];

const MOCK_ORDERS = [
  { 
    id: 'ORD-1001', 
    date: new Date(Date.now() - 86400000 * 2).toISOString(), 
    items: [{ product: MOCK_PRODUCTS[0], qty: 2, unitPrice: 120, total: 240 }],
    subtotal: 240, discount: 0, tax: 24, total: 264, status: 'completed'
  },
  { 
    id: 'ORD-1002', 
    date: new Date(Date.now() - 86400000).toISOString(), 
    items: [{ product: MOCK_PRODUCTS[2], qty: 1, unitPrice: 350, total: 350 }],
    subtotal: 350, discount: 10, tax: 34, total: 374, status: 'completed'
  }
];

const MOCK_USERS = [
  { id: 1, username: 'admin', role: 'admin', password: 'password' },
  { id: 2, username: 'staff1', role: 'staff', password: 'password' }
];

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [settings, setSettings] = useState({
    shopName: 'Electro POS System',
    taxRate: 10, // 10%
    discountThreshold: 15, // 15% max without admin
  });

  // Load user from localStorage if 'remember me' was checked
  useEffect(() => {
    const savedUser = localStorage.getItem('pos_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (username, password, remember) => {
    const foundUser = MOCK_USERS.find(u => u.username === username && u.password === password);
    if (foundUser) {
      const userData = { id: foundUser.id, username: foundUser.username, role: foundUser.role };
      setUser(userData);
      if (remember) {
        localStorage.setItem('pos_user', JSON.stringify(userData));
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pos_user');
  };

  const addOrder = (orderData) => {
    const newOrder = {
      id: `ORD-${1000 + orders.length + 1}`,
      date: new Date().toISOString(),
      ...orderData
    };
    
    // Update inventory stock
    const updatedProducts = [...products];
    orderData.items.forEach(item => {
      const prodIndex = updatedProducts.findIndex(p => p.id === item.product.id);
      if (prodIndex > -1) {
        updatedProducts[prodIndex].quantity -= item.qty;
      }
    });
    
    setProducts(updatedProducts);
    setOrders([newOrder, ...orders]);
    return newOrder.id;
  };

  const updateProduct = (product) => {
    if (product.id) {
      setProducts(products.map(p => p.id === product.id ? product : p));
    } else {
      setProducts([...products, { ...product, id: Date.now() }]);
    }
  };

  return (
    <AppContext.Provider value={{
      user, login, logout,
      products, updateProduct,
      orders, addOrder,
      settings, setSettings
    }}>
      {children}
    </AppContext.Provider>
  );
};
