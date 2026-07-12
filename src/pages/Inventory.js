import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Plus, Search, Edit2, X, Check, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductModal = ({ isOpen, onClose, product, onSave }) => {
  const { categories } = useAppContext();
  const [formData, setFormData] = useState({
    name: '', category: categories[0]?.name || 'Solar Panels', quantity: 0, basePrice: 0, sku: '',
    categoryFields: {}, customFields: {}
  });

  const [newCustomFieldName, setNewCustomFieldName] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        categoryFields: product.categoryFields || {},
        customFields: product.customFields || {}
      });
    } else {
      setFormData({ 
        name: '', category: categories[0]?.name || 'Solar Panels', quantity: 0, basePrice: 0, sku: '',
        categoryFields: {}, customFields: {} 
      });
    }
  }, [product, isOpen, categories]);

  const selectedCategoryObj = categories.find(c => c.name === formData.category);

  // When category changes, reset category fields
  const handleCategoryChange = (e) => {
    setFormData({ ...formData, category: e.target.value, categoryFields: {} });
  };

  const handleCategoryFieldChange = (fieldName, value) => {
    setFormData({
      ...formData,
      categoryFields: { ...formData.categoryFields, [fieldName]: value }
    });
  };

  const handleCustomFieldChange = (fieldName, value) => {
    setFormData({
      ...formData,
      customFields: { ...formData.customFields, [fieldName]: value }
    });
  };

  const addCustomField = () => {
    if (newCustomFieldName.trim() && !formData.customFields[newCustomFieldName.trim()]) {
      setFormData({
        ...formData,
        customFields: { ...formData.customFields, [newCustomFieldName.trim()]: '' }
      });
      setNewCustomFieldName('');
    } else {
      toast.error('Invalid or duplicate custom field name');
    }
  };

  const removeCustomField = (fieldName) => {
    const updatedCustomFields = { ...formData.customFields };
    delete updatedCustomFields[fieldName];
    setFormData({ ...formData, customFields: updatedCustomFields });
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) {
      toast.error('Name and SKU are required');
      return;
    }
    if (formData.quantity < 0 || formData.basePrice < 0) {
      toast.error('Quantity and Price cannot be negative');
      return;
    }
    onSave(formData);
    toast.success(product ? 'Product updated' : 'Product added');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-blue outline-none"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={handleCategoryChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-blue outline-none"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={e => setFormData({...formData, sku: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-blue outline-none uppercase"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock Quantity</label>
              <input
                type="number"
                min="0"
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-blue outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Base Price (₨)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.basePrice}
                onChange={e => setFormData({...formData, basePrice: parseFloat(e.target.value) || 0})}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-blue outline-none"
                required
              />
            </div>
          </div>

          {selectedCategoryObj && selectedCategoryObj.fields.length > 0 && (
            <>
              <h3 className="font-bold text-slate-800 border-b pb-2 mt-4">Category Fields</h3>
              <div className="grid grid-cols-2 gap-4">
                {selectedCategoryObj.fields.map(field => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {field.name} {field.required && '*'}
                    </label>
                    {field.type === 'dropdown' ? (
                      <select
                        value={formData.categoryFields[field.name] || ''}
                        onChange={(e) => handleCategoryFieldChange(field.name, e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-blue outline-none"
                        required={field.required}
                      >
                        <option value="">Select...</option>
                        {field.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        value={formData.categoryFields[field.name] || ''}
                        onChange={(e) => handleCategoryFieldChange(field.name, e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-blue outline-none"
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          <h3 className="font-bold text-slate-800 border-b pb-2 mt-4">Custom Fields</h3>
          {Object.keys(formData.customFields).length > 0 && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              {Object.keys(formData.customFields).map(fieldName => (
                <div key={fieldName}>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between">
                    {fieldName}
                    <button type="button" onClick={() => removeCustomField(fieldName)} className="text-red-500 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </button>
                  </label>
                  <input
                    type="text"
                    value={formData.customFields[fieldName]}
                    onChange={(e) => handleCustomFieldChange(fieldName, e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>
              ))}
            </div>
          )}
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="New field name..."
              value={newCustomFieldName}
              onChange={(e) => setNewCustomFieldName(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-blue outline-none"
            />
            <button type="button" onClick={addCustomField} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg font-medium text-slate-700 transition-colors">
              Add Field
            </button>
          </div>

          <div className="mt-8 flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-6 py-3 rounded-lg font-bold text-white bg-brand-blue hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-md">
              <Check className="w-5 h-5" />
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Inventory = () => {
  const { products, updateProduct, user, categories } = useAppContext();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showLowStock, setShowLowStock] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const categoryNames = ['All', ...categories.map(c => c.name)];
  
  const activeCategoryObj = categories.find(c => c.name === filterCategory);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || product.category === filterCategory;
    const matchesStock = showLowStock ? product.quantity < 5 : true;
    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Inventory</h1>
          <p className="text-slate-500 mt-1">Manage products and stock levels</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'staff') && (
          <button
            onClick={handleAdd}
            className="bg-brand-blue hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors shadow-md h-12"
          >
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-brand-blue focus:ring-2 outline-none"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="flex-1 md:w-48 px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-brand-blue outline-none cursor-pointer"
          >
            {categoryNames.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            onClick={() => setShowLowStock(!showLowStock)}
            className={`px-4 py-3 rounded-lg font-medium border transition-colors whitespace-nowrap ${showLowStock ? 'bg-red-100 text-red-700 border-red-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
          >
            Low Stock
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="py-4 px-6 font-medium">SKU</th>
                <th className="py-4 px-6 font-medium">Product Name</th>
                {filterCategory === 'All' && <th className="py-4 px-6 font-medium">Category</th>}
                {filterCategory !== 'All' && activeCategoryObj?.fields.map(f => (
                  <th key={f.name} className="py-4 px-6 font-medium">{f.name}</th>
                ))}
                <th className="py-4 px-6 font-medium text-right">Base Price</th>
                <th className="py-4 px-6 font-medium text-center">Stock</th>
                <th className="py-4 px-6 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length > 0 ? filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-6 text-sm font-mono text-slate-500">{product.sku}</td>
                  <td className="py-3 px-6 font-medium text-slate-900">{product.name}</td>
                  {filterCategory === 'All' && (
                    <td className="py-3 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {product.category}
                      </span>
                    </td>
                  )}
                  {filterCategory !== 'All' && activeCategoryObj?.fields.map(f => (
                    <td key={f.name} className="py-3 px-6 text-slate-600">
                      {product.categoryFields?.[f.name] || '-'}
                    </td>
                  ))}
                  <td className="py-3 px-6 text-right font-medium">₨ {product.basePrice.toLocaleString()}</td>
                  <td className="py-3 px-6 text-center">
                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold ${
                      product.quantity < 5 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {product.quantity}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 text-slate-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    <Package className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-lg">No products found matching your criteria</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
        onSave={updateProduct}
      />
    </div>
  );
};

export default Inventory;
