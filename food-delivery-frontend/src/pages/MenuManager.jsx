import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const MenuManager = ({ restaurantId, onClose }) => {
  const [menus, setMenus] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    restaurant_id: restaurantId
  });
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0
  });

  // Fetch menus when component mounts or restaurantId changes
  useEffect(() => {
    fetchMenus();
  }, [restaurantId, pagination.current_page]);

  const fetchMenus = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/menus?restaurant_id=${restaurantId}&page=${pagination.current_page}&per_page=${pagination.per_page}`);
      setMenus(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        per_page: response.data.per_page,
        total: response.data.total
      });
    } catch (err) {
      setError('Failed to fetch menus');
      console.error('Error fetching menus:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (editingId) {
        // Update existing menu
        await apiClient.put(`/menus/${editingId}`, formData);
      } else {
        // Create new menu
        await apiClient.post('/menus', formData);
      }
      resetForm();
      fetchMenus();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving menu');
      console.error('Error saving menu:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (menu) => {
    setFormData({
      name: menu.name,
      price: menu.price,
      description: menu.description,
      restaurant_id: menu.restaurant_id
    });
    setEditingId(menu.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    
    setIsLoading(true);
    try {
      await apiClient.delete(`/menus/${id}`);
      fetchMenus();
    } catch (err) {
      setError('Failed to delete menu');
      console.error('Error deleting menu:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      restaurant_id: restaurantId
    });
    setEditingId(null);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, current_page: newPage }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Menu Management</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Menu Form */}
          <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
              />
            </div>
            <div className="flex justify-end space-x-2">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 transition"
              >
                {isLoading ? 'Processing...' : editingId ? 'Update Menu' : 'Add Menu'}
              </button>
            </div>
          </form>

          {/* Menus List */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Menu Items</h3>
            
            {isLoading && !menus.length ? (
              <div className="text-center py-8">Loading...</div>
            ) : menus.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No menu items found</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {menus.map(menu => (
                        <tr key={menu.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{menu.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">${parseFloat(menu.price).toFixed(2)}</td>
                          <td className="px-6 py-4">{menu.description || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap space-x-2">
                            <button
                              onClick={() => handleEdit(menu)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(menu.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.total > pagination.per_page && (
                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={() => handlePageChange(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                      className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span>Page {pagination.current_page} of {Math.ceil(pagination.total / pagination.per_page)}</span>
                    <button
                      onClick={() => handlePageChange(pagination.current_page + 1)}
                      disabled={pagination.current_page * pagination.per_page >= pagination.total}
                      className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuManager;