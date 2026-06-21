import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useCurrency } from '../services/CurrencyContext';
import { Package, FolderOpen, ClipboardList, Plus, Edit2, Trash2, Check, X, Shield, RefreshCw, HelpCircle, MessageSquare, Clock } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  // Inquiries State
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyingInquiry, setReplyingInquiry] = useState(null);
  const [replyAnswer, setReplyAnswer] = useState('');
  const [inquiryFilter, setInquiryFilter] = useState('all'); // all, pending, replied

  // Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodActive, setProdActive] = useState(true);

  // Category Modal State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');

  // Dashboard Loader trigger
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const prodRes = await api.get('/products');
        setProducts(prodRes.data);

        const catRes = await api.get('/categories');
        setCategories(catRes.data);

        const ordRes = await api.get('/orders/all');
        setOrders(ordRes.data);

        const inqRes = await api.get('/inquiries');
        setInquiries(inqRes.data || []);
      } catch (err) {
        console.error("Failed to load admin dashboard statistics:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [refreshTrigger]);

  const openAddProductModal = () => {
    setEditingProduct(null);
    setProdName('');
    setProdDesc('');
    setProdPrice('');
    setProdStock('');
    setProdImage('');
    setProdCategory(categories[0]?.id || '');
    setProdBrand('');
    setProdActive(true);
    setProductModalOpen(true);
  };

  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setProdName(product.name);
    setProdDesc(product.description);
    setProdPrice(product.price.toString());
    setProdStock(product.stockQuantity.toString());
    setProdImage(product.imageUrl);
    setProdCategory(product.categoryId);
    setProdBrand(product.brand);
    setProdActive(product.isActive);
    setProductModalOpen(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: prodName.trim(),
      description: prodDesc.trim(),
      price: parseFloat(prodPrice),
      stockQuantity: parseInt(prodStock),
      imageUrl: prodImage.trim(),
      categoryId: parseInt(prodCategory),
      brand: prodBrand.trim(),
      isActive: prodActive
    };

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setProductModalOpen(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing product.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.delete(`/products/${id}`);
        setRefreshTrigger(prev => prev + 1);
      } catch (err) {
        alert("Failed to delete product.");
      }
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories', {
        name: catName.trim(),
        description: catDesc.trim(),
        imageUrl: catImage.trim()
      });
      setCategoryModalOpen(false);
      setCatName('');
      setCatDesc('');
      setCatImage('');
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create category.');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await api.delete(`/categories/${id}`);
        setRefreshTrigger(prev => prev + 1);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete category.');
      }
    }
  };

  const handleOrderStatusChange = async (orderId, statusVal) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: parseInt(statusVal) });
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const openReplyModal = (inquiry) => {
    setReplyingInquiry(inquiry);
    setReplyAnswer(inquiry.answer || '');
    setReplyModalOpen(true);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyAnswer.trim() || !replyingInquiry) return;

    try {
      await api.post(`/inquiries/${replyingInquiry.id}/reply`, {
        answer: replyAnswer.trim()
      });
      setReplyModalOpen(false);
      setReplyingInquiry(null);
      setReplyAnswer('');
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit response.');
    }
  };

  const handleDeleteInquiry = async (id) => {
    if (window.confirm("Are you sure you want to delete this customer inquiry?")) {
      try {
        await api.delete(`/inquiries/${id}`);
        setRefreshTrigger(prev => prev + 1);
      } catch (err) {
        alert("Failed to delete inquiry.");
      }
    }
  };

  if (loading && refreshTrigger === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-500/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 text-left space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Shield size={22} className="text-purple-400" />
            <span>Admin Control Panel</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage product catalog, classifications, and track dispatch fulfillment</p>
        </div>
        <button
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          className="btn-secondary text-xs flex items-center gap-1.5"
        >
          <RefreshCw size={14} />
          <span>Refresh Console</span>
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-900 gap-6">
        <button
          onClick={() => setActiveTab('products')}
          className={`py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'products'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-450 hover:text-slate-355'
          }`}
        >
          <Package size={16} />
          <span>Products ({products.length})</span>
        </button>
        
        <button
          onClick={() => setActiveTab('categories')}
          className={`py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'categories'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-450 hover:text-slate-355'
          }`}
        >
          <FolderOpen size={16} />
          <span>Categories ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'orders'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-450 hover:text-slate-355'
          }`}
        >
          <ClipboardList size={16} />
          <span>Customer Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'inquiries'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-450 hover:text-slate-355'
          }`}
        >
          <HelpCircle size={16} />
          <span>Product Inquiries ({inquiries.length})</span>
        </button>
      </div>

      {/* TAB CONTENTS */}
      
      {/* 1. Products management */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={openAddProductModal} className="btn-primary text-xs flex items-center gap-1.5 py-2.5">
              <Plus size={16} />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-900 bg-slate-900/10">
            <table className="w-full text-sm border-collapse text-left">
              <thead>
                <tr className="bg-slate-900/40 text-slate-400 text-xs uppercase border-b border-slate-900">
                  <th className="p-4">Item</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/50">
                {products.map(prod => (
                  <tr key={prod.id} className="hover:bg-slate-900/20 text-slate-300">
                    <td className="p-4 flex items-center gap-3">
                      <img src={prod.imageUrl || 'https://via.placeholder.com/40'} className="w-10 h-10 object-cover rounded-lg border border-slate-800" />
                      <div>
                        <span className="font-semibold block text-slate-200">{prod.name}</span>
                        <span className="text-[10px] text-slate-500">{prod.brand}</span>
                      </div>
                    </td>
                    <td className="p-4">{prod.categoryName}</td>
                    <td className="p-4 font-bold text-slate-200">{formatPrice(prod.price)}</td>
                    <td className={`p-4 font-semibold ${prod.stockQuantity <= 5 ? 'text-amber-500' : 'text-slate-400'}`}>{prod.stockQuantity}</td>
                    <td className="p-4">
                      {prod.isActive ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Active</span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">Inactive</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEditProductModal(prod)} className="p-1.5 text-slate-450 hover:text-purple-400 rounded-lg hover:bg-purple-500/5 transition-colors" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDeleteProduct(prod.id)} className="p-1.5 text-slate-450 hover:text-rose-500 rounded-lg hover:bg-rose-500/5 transition-colors" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Categories management */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setCategoryModalOpen(true)} className="btn-primary text-xs flex items-center gap-1.5 py-2.5">
              <Plus size={16} />
              <span>Add New Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(cat => (
              <div key={cat.id} className="glass-card p-5 rounded-2xl flex flex-col justify-between gap-4 border border-slate-900">
                <div className="flex items-center gap-3">
                  <img src={cat.imageUrl} className="w-12 h-12 object-cover rounded-xl border border-slate-800" />
                  <div>
                    <h4 className="font-bold text-slate-200">{cat.name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{cat.description}</p>
                  </div>
                </div>
                <div className="flex justify-end pt-2 border-t border-slate-900/60">
                  <button onClick={() => handleDeleteCategory(cat.id)} className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1">
                    <Trash2 size={14} />
                    <span>Delete Category</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Customer Orders management */}
      {activeTab === 'orders' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-900 bg-slate-900/10">
          <table className="w-full text-sm border-collapse text-left">
            <thead>
              <tr className="bg-slate-900/40 text-slate-400 text-xs uppercase border-b border-slate-900">
                <th className="p-4">Order ID</th>
                <th className="p-4">User ID</th>
                <th className="p-4">Date</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Logistics Status</th>
                <th className="p-4 text-center">Modify Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/50">
              {orders.map(ord => (
                <tr key={ord.id} className="hover:bg-slate-900/20 text-slate-300">
                  <td className="p-4 font-bold text-slate-200">#{ord.id}</td>
                  <td className="p-4 text-xs font-mono text-slate-450">{ord.customerId.slice(0, 8)}...</td>
                  <td className="p-4 text-xs">{new Date(ord.orderDate).toLocaleDateString()}</td>
                  <td className="p-4 font-bold text-slate-200">{formatPrice(ord.totalAmount)}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      ord.status.toLowerCase() === 'pending'
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        : ord.status.toLowerCase() === 'processing'
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                        : ord.status.toLowerCase() === 'shipped'
                        ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                        : ord.status.toLowerCase() === 'delivered'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}>
                      {ord.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <select
                      value={
                        ord.status.toLowerCase() === 'pending' ? '0' :
                        ord.status.toLowerCase() === 'processing' ? '1' :
                        ord.status.toLowerCase() === 'shipped' ? '2' :
                        ord.status.toLowerCase() === 'delivered' ? '3' : '4'
                      }
                      onChange={(e) => handleOrderStatusChange(ord.id, e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg py-1 px-2 text-xs focus:outline-none focus:border-purple-500 text-slate-300"
                    >
                      <option value="0">Pending</option>
                      <option value="1">Processing</option>
                      <option value="2">Shipped</option>
                      <option value="3">Delivered</option>
                      <option value="4">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. Product Inquiries management */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex justify-between items-center bg-slate-900/40 border border-slate-900 rounded-2xl p-4 gap-4 flex-wrap">
            <div className="flex gap-2">
              {['all', 'pending', 'replied'].map(f => (
                <button
                  key={f}
                  onClick={() => setInquiryFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                    inquiryFilter === f
                      ? 'bg-purple-600/10 border-purple-500/35 text-purple-400'
                      : 'bg-slate-900 border-slate-800 text-slate-450 hover:text-slate-350'
                  }`}
                >
                  {f === 'pending' ? 'Pending Reply' : f === 'replied' ? 'Answered' : 'All Inquiries'}
                </button>
              ))}
            </div>
            <div className="text-xs text-slate-500">
              Showing {
                inquiries.filter(i => 
                  inquiryFilter === 'all' ? true : 
                  inquiryFilter === 'pending' ? !i.isReplied : i.isReplied
                ).length
              } inquiries
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-900 bg-slate-900/10">
            <table className="w-full text-sm border-collapse text-left">
              <thead>
                <tr className="bg-slate-900/40 text-slate-400 text-xs uppercase border-b border-slate-900">
                  <th className="p-4">Customer</th>
                  <th className="p-4">Product</th>
                  <th className="p-4">Question</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/50">
                {inquiries
                  .filter(i => 
                    inquiryFilter === 'all' ? true : 
                    inquiryFilter === 'pending' ? !i.isReplied : i.isReplied
                  )
                  .map(inq => (
                    <tr key={inq.id} className="hover:bg-slate-900/20 text-slate-300">
                      <td className="p-4">
                        <div className="space-y-0.5 text-left">
                          <span className="font-semibold block text-slate-200">{inq.customerName}</span>
                          <span className="text-[10px] text-slate-500 block font-mono">{inq.customerEmail}</span>
                          {inq.customerPhone && (
                            <span className="text-[10px] text-emerald-405 block font-semibold">📞 {inq.customerPhone}</span>
                          )}
                          <span className="text-[9px] text-slate-600 flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(inq.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 max-w-[200px]">
                        <div className="flex items-center gap-2">
                          {inq.productImageUrl && (
                            <img src={inq.productImageUrl} className="w-8 h-8 object-cover rounded border border-slate-800 shrink-0" />
                          )}
                          <span className="truncate font-semibold text-slate-300 text-xs" title={inq.productName}>
                            {inq.productName}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 max-w-[300px]">
                        <div className="space-y-1 text-xs">
                          <p className="text-slate-200 font-medium leading-relaxed">{inq.question}</p>
                          {inq.isReplied && (
                            <div className="bg-slate-955 border border-slate-850 p-2 rounded-lg text-slate-400 mt-1.5">
                              <span className="text-[9px] font-bold text-purple-400 block mb-0.5 uppercase">Answer:</span>
                              <p className="text-[11px] leading-relaxed">{inq.answer}</p>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {inq.isReplied ? (
                          <span className="text-[10px] font-bold text-emerald-450 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1 w-max">
                            <Check size={10} />
                            <span>Replied</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full flex items-center gap-1 w-max">
                            <Clock size={10} />
                            <span>Pending Answer</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openReplyModal(inq)}
                            className="btn-secondary text-[10px] py-1 px-2.5 flex items-center gap-1"
                          >
                            <MessageSquare size={12} />
                            <span>{inq.isReplied ? 'Edit Answer' : 'Reply'}</span>
                          </button>
                          <button
                            onClick={() => handleDeleteInquiry(inq.id)}
                            className="p-1.5 text-slate-450 hover:text-rose-500 rounded-lg hover:bg-rose-500/5 transition-colors"
                            title="Delete Inquiry"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRODUCT DIALOG MODAL */}
      {productModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleProductSubmit} className="glass-card max-w-xl w-full rounded-3xl p-6 border border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-200">{editingProduct ? 'Edit Product Specifications' : 'Add New Inventory Product'}</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-450 font-semibold">Product Title</label>
                <input type="text" value={prodName} onChange={e => setProdName(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:outline-none focus:border-purple-500 text-slate-200" required />
              </div>
              <div className="space-y-1">
                <label className="text-slate-450 font-semibold">Brand Maker</label>
                <input type="text" value={prodBrand} onChange={e => setProdBrand(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:outline-none focus:border-purple-500 text-slate-200" required />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="text-slate-450 font-semibold">Description Summary</label>
              <textarea rows="3" value={prodDesc} onChange={e => setProdDesc(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:outline-none focus:border-purple-500 text-slate-200 resize-none" required></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-450 font-semibold">Price ($)</label>
                <input type="number" step="0.01" value={prodPrice} onChange={e => setProdPrice(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:outline-none focus:border-purple-500 text-slate-200" required />
              </div>
              <div className="space-y-1">
                <label className="text-slate-450 font-semibold">Stock Quantity</label>
                <input type="number" value={prodStock} onChange={e => setProdStock(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:outline-none focus:border-purple-500 text-slate-200" required />
              </div>
              <div className="space-y-1">
                <label className="text-slate-450 font-semibold">Classification Category</label>
                <select value={prodCategory} onChange={e => setProdCategory(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:outline-none focus:border-purple-500 text-slate-200">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="text-slate-450 font-semibold">Image URL link</label>
              <input type="text" value={prodImage} onChange={e => setProdImage(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:outline-none focus:border-purple-500 text-slate-200" placeholder="https://unsplash..." required />
            </div>

            <div className="flex items-center gap-2 text-xs pt-2">
              <input type="checkbox" id="prodActive" checked={prodActive} onChange={e => setProdActive(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500" />
              <label htmlFor="prodActive" className="text-slate-350 font-semibold select-none">Expose active in catalog listing</label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-900">
              <button type="button" onClick={() => setProductModalOpen(false)} className="btn-secondary text-xs py-2 px-4">Cancel</button>
              <button type="submit" className="btn-primary text-xs py-2 px-4">Save Product</button>
            </div>
          </form>
        </div>
      )}

      {/* CATEGORY DIALOG MODAL */}
      {categoryModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCategorySubmit} className="glass-card max-w-md w-full rounded-3xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-200">Add New Category Classification</h3>
            
            <div className="space-y-1 text-xs">
              <label className="text-slate-450 font-semibold">Category Title</label>
              <input type="text" value={catName} onChange={e => setCatName(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:outline-none focus:border-purple-500 text-slate-200" required />
            </div>

            <div className="space-y-1 text-xs">
              <label className="text-slate-450 font-semibold">Description Summary</label>
              <textarea rows="3" value={catDesc} onChange={e => setCatDesc(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:outline-none focus:border-purple-500 text-slate-200 resize-none" required></textarea>
            </div>

            <div className="space-y-1 text-xs">
              <label className="text-slate-450 font-semibold">Cover Image URL link</label>
              <input type="text" value={catImage} onChange={e => setCatImage(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:outline-none focus:border-purple-500 text-slate-200" placeholder="https://unsplash..." required />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-900">
              <button type="button" onClick={() => setCategoryModalOpen(false)} className="btn-secondary text-xs py-2 px-4">Cancel</button>
              <button type="submit" className="btn-primary text-xs py-2 px-4">Save Category</button>
            </div>
          </form>
        </div>
      )}

      {/* INQUIRY REPLY MODAL */}
      {replyModalOpen && replyingInquiry && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <form onSubmit={handleReplySubmit} className="glass-card max-w-lg w-full rounded-3xl p-6 border border-slate-800 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-200">
                {replyingInquiry.isReplied ? 'Modify Inquiry Answer' : 'Reply to Product Inquiry'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Submit your response for the customer's question</p>
            </div>

            <div className="bg-slate-955 border border-slate-850 p-4 rounded-2xl text-xs space-y-2 text-left">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Question by {replyingInquiry.customerName} ({replyingInquiry.customerEmail})</span>
                <p className="text-slate-200 font-medium leading-relaxed mt-1">{replyingInquiry.question}</p>
              </div>
              <div className="pt-2 border-t border-slate-900/60 flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Product:</span>
                <span className="text-purple-400 font-bold">{replyingInquiry.productName}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-slate-450 font-semibold block text-left">Your Answer</label>
              <textarea
                rows="5"
                value={replyAnswer}
                onChange={e => setReplyAnswer(e.target.value)}
                placeholder="Type your response here..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:border-purple-500 text-slate-200 resize-none leading-relaxed"
                required
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-900">
              <button 
                type="button" 
                onClick={() => {
                  setReplyModalOpen(false);
                  setReplyingInquiry(null);
                  setReplyAnswer('');
                }} 
                className="btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary text-xs py-2 px-4">
                Submit Response
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
