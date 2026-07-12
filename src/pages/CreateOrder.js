import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Search, Trash2, ShoppingCart, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateOrder = () => {
  const { products, addOrder, settings, user } = useAppContext();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [discount, setDiscount] = useState(0);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderItems, discount]);

  const filteredProducts = products.filter(p => 
    p.quantity > 0 && (
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ).slice(0, 8); // Show only top 8 matches for speed

  const addToOrder = (product) => {
    const existingItem = orderItems.find(item => item.product.id === product.id);
    if (existingItem) {
      if (existingItem.qty >= product.quantity) {
        toast.error(`Cannot add more. Only ${product.quantity} in stock.`);
        return;
      }
      setOrderItems(orderItems.map(item => 
        item.product.id === product.id 
          ? { ...item, qty: item.qty + 1, total: (item.qty + 1) * item.unitPrice }
          : item
      ));
    } else {
      setOrderItems([...orderItems, { 
        product, 
        qty: 1, 
        unitPrice: product.basePrice,
        total: product.basePrice 
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
        if (field === 'unitPrice' && newValue < 0) newValue = 0;
        
        const updatedItem = { ...item, [field]: newValue };
        updatedItem.total = updatedItem.qty * updatedItem.unitPrice;
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
      setDiscount(0);
      toast.success('Order cleared');
    }
  };

  // Calculations
  const subtotal = orderItems.reduce((acc, item) => acc + item.total, 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * settings.taxRate) / 100;
  const grandTotal = taxableAmount + taxAmount;

  const handleCheckout = () => {
    if (orderItems.length === 0) {
      toast.error('Add items to order first');
      return;
    }

    if (discount > settings.discountThreshold && user.role !== 'admin') {
      toast.error(`Manager approval needed for discounts over ${settings.discountThreshold}%`);
      return;
    }

    const orderData = {
      items: orderItems,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total: grandTotal,
      status: 'completed'
    };

    const newOrderId = addOrder(orderData);
    toast.success('Order completed successfully!');
    navigate(`/invoice/${newOrderId}`);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 max-w-screen-2xl mx-auto">
      {/* Left side: Product Search */}
      <div className="lg:w-1/2 flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative">
            <Search className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              placeholder="Search products to add..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-lg bg-white border border-slate-300 focus:border-brand-blue focus:ring-2 focus:ring-blue-100 outline-none text-lg transition-all shadow-sm"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
          {searchTerm ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProducts.map(product => (
                <div 
                  key={product.id}
                  onClick={() => addToOrder(product)}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-brand-blue hover:shadow-md cursor-pointer transition-all flex flex-col justify-between h-32"
                >
                  <div>
                    <h3 className="font-bold text-slate-900 line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-slate-500 font-mono mt-1">{product.sku}</p>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <span className="font-bold text-brand-blue text-lg">${product.basePrice.toFixed(2)}</span>
                    <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                      {product.quantity} in stock
                    </span>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500">
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
      <div className="lg:w-1/2 flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-brand-dark text-white flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" /> Current Order
          </h2>
          <span className="bg-slate-800 px-3 py-1 rounded-full text-sm font-medium">
            {orderItems.length} items
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-0">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4 text-slate-600 font-medium">Product</th>
                <th className="py-3 px-2 text-slate-600 font-medium text-center w-24">Qty</th>
                <th className="py-3 px-2 text-slate-600 font-medium text-right w-32">Unit Price</th>
                <th className="py-3 px-4 text-slate-600 font-medium text-right w-24">Total</th>
                <th className="py-3 px-2 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orderItems.map(item => (
                <tr key={item.product.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{item.product.name}</p>
                    <p className="text-xs text-slate-500 font-mono">{item.product.sku}</p>
                  </td>
                  <td className="py-3 px-2">
                    <input
                      type="number"
                      min="1"
                      max={item.product.quantity}
                      value={item.qty}
                      onChange={(e) => updateItem(item.product.id, 'qty', parseInt(e.target.value) || 1)}
                      className="w-full text-center p-2 rounded border border-slate-300 focus:border-brand-blue outline-none text-lg font-bold"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.product.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full text-right pl-6 pr-2 py-2 rounded border border-slate-300 focus:border-brand-blue outline-none text-lg font-bold"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 text-lg">
                    ${item.total.toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <button 
                      onClick={() => removeItem(item.product.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {orderItems.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400 italic">
                    Order is empty
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals & Checkout */}
        <div className="p-6 bg-slate-50 border-t border-slate-200">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center text-slate-600 text-lg">
              <span>Subtotal:</span>
              <span className="font-bold">${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center text-slate-600">
              <div className="flex items-center gap-2">
                <span>Discount (%):</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-20 p-1 text-center rounded border border-slate-300 focus:border-brand-blue outline-none font-bold"
                />
              </div>
              <span className="font-bold text-red-500">-${discountAmount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center text-slate-600 text-lg">
              <span>Tax ({settings.taxRate}%):</span>
              <span className="font-bold">${taxAmount.toFixed(2)}</span>
            </div>
            
            <div className="pt-4 border-t border-slate-300 flex justify-between items-center">
              <span className="text-2xl font-bold text-slate-900">Grand Total:</span>
              <span className="text-4xl font-black text-brand-blue">${grandTotal.toFixed(2)}</span>
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
              className="flex-1 py-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/30 text-xl"
            >
              <Check className="w-8 h-8" /> Save & Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;
