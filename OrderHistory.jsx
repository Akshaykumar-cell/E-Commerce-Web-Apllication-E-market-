import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useCurrency } from '../services/CurrencyContext';
import { Package, Calendar, MapPin, CreditCard, ChevronDown, ChevronUp, RefreshCw, ShoppingBag, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders');
        setOrders(response.data);
      } catch (err) {
        console.error("Failed to load customer orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const [cancellingId, setCancellingId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const triggerCancelConfirmation = (orderId) => {
    setSelectedOrderId(orderId);
    setShowCancelModal(true);
  };

  const handleCancelOrder = async () => {
    if (!selectedOrderId) return;
    setCancellingId(selectedOrderId);
    try {
      const response = await api.post(`/orders/${selectedOrderId}/cancel`);
      setOrders(prev => prev.map(o => o.id === selectedOrderId ? response.data : o));
      setShowCancelModal(false);
      setSelectedOrderId(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel order.");
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'processing':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'shipped':
        return 'bg-purple-500/10 border-purple-500/30 text-purple-400';
      case 'delivered':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-450';
      case 'cancelled':
        return 'bg-slate-800 border-slate-700 text-slate-500';
      default:
        return 'bg-slate-900 border-slate-800 text-slate-350';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-500/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-5">
        <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
          <Package size={28} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-200">No Orders Found</h2>
          <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
            You haven't placed any orders yet. Visit our shop and complete checkout to see order records here!
          </p>
        </div>
        <Link to="/shop" className="btn-primary inline-flex items-center space-x-2 text-sm">
          <ShoppingBag size={16} />
          <span>Explore Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 text-left space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Package size={22} className="text-purple-400" />
          <span>Order History</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Trace logistics, shipping statuses, and review invoices</p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedOrder === order.id;
          return (
            <div
              key={order.id}
              className="glass-card rounded-2xl overflow-hidden border border-slate-900/50"
            >
              
              {/* Summary Header */}
              <div
                onClick={() => toggleExpand(order.id)}
                className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-slate-900/10 transition-colors"
              >
                
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-200 text-sm">Order #{order.id}</h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <Calendar size={12} />
                    <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Total Price</span>
                    <span className="font-bold text-slate-200 text-sm">{formatPrice(order.totalAmount)}</span>
                  </div>

                  <span className={`text-[10px] font-bold tracking-wider uppercase border px-2.5 py-1 rounded-full ${getStatusStyle(order.status)}`}>
                    {order.status}
                  </span>

                  {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>

              </div>

              {/* Expansion details */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-900 bg-slate-900/15 space-y-5">
                  
                  {/* Delivery parameters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400">
                    <div className="flex items-start space-x-2">
                      <MapPin size={14} className="text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-350 block">Shipping Location</span>
                        <span className="mt-0.5 block">{order.shippingAddress}</span>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <CreditCard size={14} className="text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-350 block">Billing Details</span>
                        <span className="mt-0.5 block">{order.paymentMethod} (Payment Status: <b>{order.paymentStatus}</b>)</span>
                      </div>
                    </div>
                  </div>

                  {/* Line Items List */}
                  <div className="space-y-3 pt-3 border-t border-slate-900/60">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-450">Purchased Items</h4>
                    
                    <div className="space-y-2">
                      {order.orderItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between bg-slate-900/35 border border-slate-900 p-3 rounded-xl gap-3"
                        >
                          <div className="flex items-center space-x-3 truncate">
                            <img
                              src={item.productImageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=60'}
                              alt={item.productName}
                              className="w-10 h-10 object-cover rounded-lg border border-slate-800 shrink-0"
                            />
                            <div className="truncate">
                              <Link to={`/product/${item.productId}`} className="hover:text-purple-400 text-xs font-medium text-slate-200 block truncate">
                                {item.productName}
                              </Link>
                              <span className="text-[10px] text-slate-500">Qty: {item.quantity} @ {formatPrice(item.unitPrice)}</span>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <span className="text-xs font-bold text-slate-250">{formatPrice(item.totalPrice)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cancellation Action */}
                  {(order.status.toLowerCase() === 'pending' || order.status.toLowerCase() === 'processing') && (
                    <div className="pt-4 border-t border-slate-900/40 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerCancelConfirmation(order.id);
                        }}
                        disabled={cancellingId !== null}
                        className="px-4 py-2 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/30 hover:border-rose-500/50 text-rose-400 font-semibold text-xs rounded-xl transition-all duration-300 transform active:scale-95 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X size={12} />
                        <span>Cancel Order</span>
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Custom Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card max-w-md w-full rounded-3xl p-6 border border-slate-800 space-y-6 text-left">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                <span>Confirm Cancellation</span>
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Are you sure you want to cancel order <b>#{selectedOrderId}</b>? This action will restore product inventory and cancel logistics dispatch. This cannot be undone.
              </p>
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedOrderId(null);
                }}
                className="btn-secondary text-xs py-2 px-4"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={cancellingId !== null}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg transition-all duration-300 transform active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
              >
                {cancellingId !== null ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <span>Cancel Order</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderHistory;
