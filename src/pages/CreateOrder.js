import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Search, Trash2, ShoppingCart, Check, X, User, History, Tag, Calculator } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateOrder = () => {
  const { products, addOrder, settings, user } = useAppContext();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [customerName, setCustomerName] = useState('');

  // Keyboard shortcut for checkout
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        handleCheckout();
      }
      if (e.key === 'Escape') {
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [orderItems]);

  const filteredProducts = products.filter(p => 
    p.quantity > 0 && (
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ).slice(0, 8);

  const addToOrder = (product) => {
    const existingItem = orderItems.find(item => item.product.id === product.id);
    if (existingItem) {
      if (existingItem.qty >= product.quantity) {
        toast.error(`Cannot add more. Only ${product.quantity} in stock.`);
        return;
      }
      setOrderItems(orderItems.map(item => {
        if (item.product.id === product.id) {
          const newQty = item.qty + 1;
          // Apply bulk discount if qty >= 5
          let newPrice = item.negotiatedPrice;
          if (newQty === 5 && newPrice === item.basePrice) {
            newPrice = item.basePrice * 0.95; // 5% bulk discount automatically
            toast.success("5% Bulk discount applied!");
          }
          return { ...item, qty: newQty, negotiatedPrice: newPrice, lineTotal: newQty * newPrice };
        }
        return item;
      }));
    } else {
      setOrderItems([...orderItems, { 
        product, 
        qty: 1, 
        basePrice: product.basePrice,
        negotiatedPrice: product.basePrice,
        lineTotal: product.basePrice 
      }]);
    }
    toast.success(`Added ${product.name}`);
    setSearchTerm('');
  };

  const updateItem = (productId, field, value) => {
    setOrderItems(orderItems.map(item => {
      if (item.product.id === productId) {
        let newValue = value;
        if (field === 'qty') {
          if (newValue > item.product.quantity) {
            toast.error(`Only ${item.product.quantity} in stock.`);
            newValue = item.product.quantity;
          }
          if (newValue < 1) newValue = 1;
        }
        if (field === 'negotiatedPrice' && newValue < 0) newValue = 0;
        
        const updatedItem = { ...item, [field]: newValue };
        updatedItem.lineTotal = updatedItem.qty * updatedItem.negotiatedPrice;
        return updatedItem;
      }
      return item;
    }));
  };

  const removeItem = (productId) => {
    setOrderItems(orderItems.filter(item => item.product.id !== productId));
  };

  const handleClear = () => {
    if (orderItems.length > 0 && window.confirm('Are you sure you want to clear the order?')) {
      setOrderItems([]);
      setCustomerName('');
      toast.success('Order cleared');
    }
  };

  // Calculations
  const subtotal = orderItems.reduce((acc, item) => acc + (item.basePrice * item.qty), 0);
  const finalTotal = orderItems.reduce((acc, item) => acc + item.lineTotal, 0);
  const negotiatedDiscount = subtotal - finalTotal;

  const handleRound500 = () => {
    if (finalTotal === 0) return;
    const rounded = Math.round(finalTotal / 500) * 500;
    if (rounded === finalTotal) return;
    
    // Adjust proportionally
    const ratio = rounded / finalTotal;
    setOrderItems(orderItems.map(item => {
      const newPrice = item.negotiatedPrice * ratio;
      return {
        ...item,
        negotiatedPrice: newPrice,
        lineTotal: item.qty * newPrice
      };
    }));
    toast.success(`Rounded to ₨ ${rounded.toLocaleString()}`);
  };

  const applyQuickDiscount = (percentage) => {
    if (orderItems.length === 0) return;
    setOrderItems(orderItems.map(item => {
      const newPrice = item.negotiatedPrice * (1 - percentage / 100);
      return {
        ...item,
        negotiatedPrice: newPrice,
        lineTotal: item.qty * newPrice
      };
    }));
    toast.success(`Applied ${percentage}% discount`);
  };

  const handleCheckout = () => {
    if (orderItems.length === 0) {
      toast.error('Add items to order first');
      return;
    }

    const discountPercentage = (negotiatedDiscount / subtotal) * 100;
    if (discountPercentage > settings.discountThreshold && user.role !== 'admin') {
      toast.error(`Manager approval needed for discounts over ${settings.discountThreshold}%`);
      return;
    }

    const orderData = {
      customerName,
      items: orderItems.map(item => ({
        product: item.product,
        qty: item.qty,
        basePrice: item.basePrice,
        negotiatedPrice: item.negotiatedPrice,
        discount: (item.basePrice - item.negotiatedPrice) * item.qty,
        lineTotal: item.lineTotal
      })),
      subtotal,
      totalDiscount: -negotiatedDiscount,
      tax: 0,
      finalTotal,
      status: 'completed'
    };

    const newOrderId = addOrder(orderData);
    toast.success('Order completed successfully!');
    navigate(`/invoice/${newOrderId}`);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 max-w-screen-2xl mx-auto">
      {/* Left side: Product Search */}
      <div className="lg:w-5/12 flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-4">
          <div className="relative">
            <Search className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              placeholder="Search products by name, SKU or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-lg bg-white border border-slate-300 focus:border-brand-blue focus:ring-2 focus:ring-blue-100 outline-none text-lg transition-all shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Customer Name (Optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg bg-white border border-slate-300 focus:border-brand-blue outline-none"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
          {searchTerm ? (
            <div className="flex flex-col gap-4">
              {filteredProducts.map(product => (
                <div 
                  key={product.id}
                  onClick={() => addToOrder(product)}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-brand-blue hover:shadow-md cursor-pointer transition-all flex flex-col"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{product.name}</h3>
                      <p className="text-sm text-slate-500 font-mono mt-1">{product.sku}</p>
                    </div>
                    <span className="font-black text-brand-blue text-xl">₨ {product.basePrice.toLocaleString()}</span>
                  </div>
                  
                  {/* Category Specs */}
                  {product.categoryFields && Object.keys(product.categoryFields).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Object.entries(product.categoryFields).slice(0, 4).map(([key, val]) => (
                        <span key={key} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                          {val}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Price History */}
                  {product.priceHistory && product.priceHistory.length > 0 && (
                    <div className="mt-3 bg-blue-50 p-2 rounded-lg border border-blue-100 flex items-center gap-2 text-xs text-blue-800">
                      <History className="w-4 h-4 shrink-0" />
                      <div className="flex-1 truncate">
                        Last prices: {product.priceHistory.slice(0, settings.priceHistoryRetention || 5).map(h => `₨${h.price.toLocaleString()}`).join(' | ')}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-end mt-3 pt-3 border-t border-slate-100">
                    <span className="text-sm font-medium text-slate-500">{product.category}</span>
                    <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                      Stock: {product.quantity}
                    </span>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="py-12 text-center text-slate-500">
                  <p className="text-lg">No in-stock products found</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ShoppingCart className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-xl font-medium">Search for a product to start</p>
              <p className="text-sm mt-2">Keyboard shortcuts: Ctrl+Enter to checkout, Esc to clear</p>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Order Builder */}
      <div className="lg:w-7/12 flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-brand-dark text-white flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" /> Current Order
          </h2>
          <span className="bg-slate-800 px-3 py-1 rounded-full text-sm font-medium">
            {orderItems.length} items
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {orderItems.map(item => {
            const discountPercent = item.basePrice > 0 
              ? ((item.basePrice - item.negotiatedPrice) / item.basePrice * 100).toFixed(1) 
              : 0;
            
            return (
              <div key={item.product.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 relative">
                <button 
                  onClick={() => removeItem(item.product.id)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                
                <h3 className="font-bold text-lg text-slate-900 pr-8">{item.product.name}</h3>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      max={item.product.quantity}
                      value={item.qty}
                      onChange={(e) => updateItem(item.product.id, 'qty', parseInt(e.target.value) || 1)}
                      className="w-full p-2 rounded border border-slate-300 focus:border-brand-blue outline-none text-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Base Price / Unit</label>
                    <div className="p-2 text-slate-500 line-through">₨ {item.basePrice.toLocaleString()}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-emerald-600 mb-1">Negotiated Price ✎</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold">₨</span>
                      <input
                        type="number"
                        min="0"
                        value={item.negotiatedPrice}
                        onChange={(e) => updateItem(item.product.id, 'negotiatedPrice', parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-2 py-2 rounded border-2 border-emerald-200 focus:border-emerald-500 outline-none text-lg font-bold text-emerald-700 bg-emerald-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Line Total</label>
                    <div className="p-2 font-black text-brand-blue text-xl">₨ {item.lineTotal.toLocaleString()}</div>
                  </div>
                </div>
                
                {item.basePrice > item.negotiatedPrice && (
                  <div className="mt-2 text-sm font-medium text-red-500 flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    Discount: -{discountPercent}% (₨ {((item.basePrice - item.negotiatedPrice) * item.qty).toLocaleString()} saved)
                  </div>
                )}
              </div>
            );
          })}
          {orderItems.length === 0 && (
            <div className="h-full flex items-center justify-center text-slate-400 italic">
              Order is empty
            </div>
          )}
        </div>

        {/* Totals & Checkout */}
        <div className="p-6 bg-white border-t border-slate-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-10">
          
          <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-slate-100">
            <span className="text-sm font-bold text-slate-500 flex items-center mr-2">Quick Actions:</span>
            <button onClick={() => applyQuickDiscount(5)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded transition-colors">-5%</button>
            <button onClick={() => applyQuickDiscount(10)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded transition-colors">-10%</button>
            <button onClick={() => applyQuickDiscount(15)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded transition-colors">-15%</button>
            <button onClick={handleRound500} className="px-3 py-1 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue text-sm font-bold rounded transition-colors flex items-center gap-1">
              <Calculator className="w-4 h-4" /> Round 500
            </button>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex justify-between items-center text-slate-600 text-lg">
              <span>Subtotal:</span>
              <span className="font-bold">₨ {subtotal.toLocaleString()}</span>
            </div>
            
            {negotiatedDiscount > 0 && (
              <div className="flex justify-between items-center text-red-500 text-lg font-medium">
                <span>Total Discount:</span>
                <span>- ₨ {negotiatedDiscount.toLocaleString()}</span>
              </div>
            )}
            
            <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
              <span className="text-2xl font-bold text-slate-900">Final Total:</span>
              <span className="text-5xl font-black text-brand-blue tracking-tight">₨ {finalTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleClear}
              className="px-6 py-4 rounded-xl font-bold text-slate-600 bg-white border-2 border-slate-200 hover:bg-slate-100 flex items-center justify-center gap-2 transition-colors w-1/3"
            >
              <X className="w-6 h-6" /> Clear
            </button>
            <button
              onClick={handleCheckout}
              disabled={orderItems.length === 0}
              className="flex-1 py-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/30 text-2xl"
            >
              <Check className="w-8 h-8" /> Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;
