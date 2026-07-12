import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

// Mock Data
const MOCK_CATEGORIES = [
  {
    id: "solar-panels",
    name: "Solar Panels",
    fields: [
      { name: "Wattage", type: "text", required: true },
      { name: "Voltage", type: "dropdown", options: ["12V", "24V", "48V"], required: true },
      { name: "Type", type: "dropdown", options: ["Monocrystalline", "Polycrystalline"], required: true },
      { name: "Brand", type: "text", required: true }
    ]
  },
  {
    id: "batteries",
    name: "Batteries",
    fields: [
      { name: "Capacity", type: "text", required: true },
      { name: "Voltage", type: "dropdown", options: ["12V", "24V", "48V"], required: true },
      { name: "Chemistry Type", type: "dropdown", options: ["Lead-acid", "Lithium-ion", "Gel"], required: true },
      { name: "Brand", type: "text", required: true }
    ]
  },
  {
    id: "breakers",
    name: "Breakers/Switches",
    fields: [
      { name: "Amperage", type: "text", required: true },
      { name: "Type", type: "dropdown", options: ["MCB", "RCBO", "GFCI"], required: true },
      { name: "Poles", type: "dropdown", options: ["1P", "2P", "3P", "4P"], required: true },
      { name: "Brand", type: "text", required: true }
    ]
  },
  {
    id: "inverters",
    name: "Inverters",
    fields: [
      { name: "Wattage", type: "text", required: true },
      { name: "Input Voltage", type: "dropdown", options: ["12V", "24V", "48V"], required: true },
      { name: "Output Voltage", type: "dropdown", options: ["230V AC"], required: true },
      { name: "Wave Type", type: "dropdown", options: ["Pure Sine", "Modified Sine"], required: true },
      { name: "Brand", type: "text", required: true }
    ]
  }
];

const MOCK_PRODUCTS = [
  { 
    id: 1, name: 'Solar Panel 150W', category: 'Solar Panels', quantity: 25, basePrice: 15000, sku: 'SP-150-001',
    categoryFields: { Wattage: "150W", Voltage: "12V", Type: "Polycrystalline", Brand: "SunPower" },
    customFields: { Warranty: "5 years" },
    priceHistory: [
      { date: "2024-01-15", price: 15000, customerName: "Ali" },
      { date: "2024-01-14", price: 14500, customerName: "Usman" },
      { date: "2024-01-13", price: 14000, customerName: "Zain" }
    ]
  },
  { 
    id: 2, name: 'Deep Cycle Battery 100Ah', category: 'Batteries', quantity: 15, basePrice: 45000, sku: 'BAT-100-001',
    categoryFields: { Capacity: "100Ah", Voltage: "12V", "Chemistry Type": "Lead-acid", Brand: "Exide" },
    customFields: {},
    priceHistory: [
      { date: "2024-01-10", price: 44000, customerName: "Kamran" }
    ]
  },
  { 
    id: 3, name: 'Inverter 1000W', category: 'Inverters', quantity: 4, basePrice: 25000, sku: 'INV-1K-001',
    categoryFields: { Wattage: "1000W", "Input Voltage": "12V", "Output Voltage": "230V AC", "Wave Type": "Modified Sine", Brand: "Homage" },
    customFields: {},
    priceHistory: []
  },
  { 
    id: 4, name: 'DC Breaker 63A', category: 'Breakers/Switches', quantity: 50, basePrice: 1500, sku: 'BRK-DC-063',
    categoryFields: { Amperage: "63A", Type: "MCB", Poles: "2P", Brand: "Tomzn" },
    customFields: {},
    priceHistory: []
  }
];

const MOCK_ORDERS = [
  { 
    id: 'ORD-1001', 
    date: new Date(Date.now() - 86400000 * 2).toISOString(), 
    customerName: 'Ahmad',
    items: [{ 
      product: MOCK_PRODUCTS[0], 
      qty: 2, 
      basePrice: 15000, 
      negotiatedPrice: 14500, 
      discount: -1000, 
      lineTotal: 29000 
    }],
    subtotal: 29000, totalDiscount: -1000, tax: 0, finalTotal: 29000, status: 'completed'
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
    taxRate: 0, // 0% usually in Pak
    discountThreshold: 15, // 15% max without admin
    currency: 'PKR',
    priceHistoryRetention: 5
  });
  const [categories, setCategories] = useState(MOCK_CATEGORIES);

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
      setProducts([...products, { ...product, id: Date.now(), priceHistory: [] }]);
    }
  };

  const addCategory = (categoryData) => {
    setCategories([...categories, { ...categoryData, id: categoryData.name.toLowerCase().replace(/\s+/g, '-') }]);
  };

  const updateCategory = (category) => {
    setCategories(categories.map(c => c.id === category.id ? category : c));
  };

  const deleteCategory = (categoryId) => {
    // Check if products exist
    const hasProducts = products.some(p => p.category === categories.find(c => c.id === categoryId)?.name);
    if (hasProducts) {
      return false; // Can't delete
    }
    setCategories(categories.filter(c => c.id !== categoryId));
    return true;
  };

  return (
    <AppContext.Provider value={{
      user, login, logout,
      products, updateProduct,
      orders, addOrder,
      settings, setSettings,
      categories, addCategory, updateCategory, deleteCategory
    }}>
      {children}
    </AppContext.Provider>
  );
};
