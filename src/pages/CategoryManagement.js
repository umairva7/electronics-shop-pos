import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Edit2, Trash2, X, Check, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const CategoryModal = ({ isOpen, onClose, category, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    fields: []
  });

  React.useEffect(() => {
    if (category) {
      setFormData(category);
    } else {
      setFormData({ name: '', fields: [] });
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleAddField = () => {
    setFormData({
      ...formData,
      fields: [...formData.fields, { name: '', type: 'text', options: [], required: false }]
    });
  };

  const handleRemoveField = (index) => {
    const newFields = [...formData.fields];
    newFields.splice(index, 1);
    setFormData({ ...formData, fields: newFields });
  };

  const handleFieldChange = (index, key, value) => {
    const newFields = [...formData.fields];
    if (key === 'options') {
      newFields[index][key] = value.split(',').map(s => s.trim()).filter(s => s !== '');
    } else {
      newFields[index][key] = value;
    }
    setFormData({ ...formData, fields: newFields });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Category name is required');
      return;
    }
    // Validate fields
    for (let f of formData.fields) {
      if (!f.name) {
        toast.error('All fields must have a name');
        return;
      }
      if (f.type === 'dropdown' && (!f.options || f.options.length === 0)) {
        toast.error(`Dropdown field '${f.name}' must have at least one option`);
        return;
      }
    }
    
    onSave(formData);
    toast.success(category ? 'Category updated' : 'Category added');
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={handleBackdropClick}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-slate-800">{category ? 'Edit Category' : 'Add New Category'}</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-blue outline-none text-lg font-bold"
              required
            />
          </div>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">Dynamic Fields</h3>
              <button 
                type="button" 
                onClick={handleAddField}
                className="text-sm font-bold text-brand-blue bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded flex items-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Field
              </button>
            </div>
            
            {formData.fields.length === 0 ? (
              <p className="text-sm text-slate-500 italic text-center py-4">No custom fields defined for this category.</p>
            ) : (
              <div className="space-y-4">
                {formData.fields.map((field, index) => (
                  <div key={index} className="bg-white p-3 rounded border border-slate-200 flex flex-col gap-3 relative">
                    <button 
                      type="button" 
                      onClick={() => handleRemoveField(index)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3 pr-6">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Field Name</label>
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                          className="w-full px-2 py-1 text-sm rounded border border-slate-300 focus:border-brand-blue outline-none"
                          placeholder="e.g. Wattage"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
                        <select
                          value={field.type}
                          onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                          className="w-full px-2 py-1 text-sm rounded border border-slate-300 focus:border-brand-blue outline-none bg-white"
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="dropdown">Dropdown</option>
                        </select>
                      </div>
                    </div>
                    
                    {field.type === 'dropdown' && (
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Dropdown Options (Comma-separated)</label>
                        <input
                          type="text"
                          value={field.options?.join(', ') || ''}
                          onChange={(e) => handleFieldChange(index, 'options', e.target.value)}
                          className="w-full px-2 py-1 text-sm rounded border border-slate-300 focus:border-brand-blue outline-none"
                          placeholder="e.g. 12V, 24V, 48V"
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`req-${index}`}
                        checked={field.required}
                        onChange={(e) => handleFieldChange(index, 'required', e.target.checked)}
                        className="rounded border-slate-300 text-brand-blue focus:ring-brand-blue"
                      />
                      <label htmlFor={`req-${index}`} className="text-sm text-slate-600 cursor-pointer">Required field</label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-6 py-3 rounded-lg font-bold text-white bg-brand-blue hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-md">
              <Check className="w-5 h-5" />
              Save Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CategoryManagement = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleDelete = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      const success = deleteCategory(categoryId);
      if (success) {
        toast.success('Category deleted');
      } else {
        toast.error('Cannot delete category. Products are using it.');
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Category Management</h1>
          <p className="text-slate-500 mt-1">Manage product categories and their specific fields</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-brand-blue hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors shadow-md h-12"
        >
          <Plus className="w-5 h-5" />
          <span>Add Category</span>
        </button>
      </div>
      
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-lg flex items-start gap-3">
        <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
        <div>
          <h3 className="font-bold text-amber-800">Admin Section</h3>
          <p className="text-amber-700 text-sm mt-1">
            Modifying categories will affect how products are displayed and filtered.
            You cannot delete a category if there are products assigned to it.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="py-4 px-6 font-medium w-1/3">Category Name</th>
                <th className="py-4 px-6 font-medium">Defined Fields</th>
                <th className="py-4 px-6 font-medium text-center w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900 text-lg">{category.name}</td>
                  <td className="py-4 px-6">
                    {category.fields && category.fields.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {category.fields.map(field => (
                          <span key={field.name} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full border border-slate-200">
                            {field.name} <span className="text-slate-400">({field.type})</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-sm">No custom fields</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-slate-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Category"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="3" className="py-12 text-center text-slate-500">
                    <p className="text-lg">No categories found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
        onSave={(data) => {
          if (editingCategory) {
            updateCategory(data);
          } else {
            addCategory(data);
          }
        }}
      />
    </div>
  );
};

export default CategoryManagement;
