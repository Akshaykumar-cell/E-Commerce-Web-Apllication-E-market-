import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { useCart } from '../services/CartContext';
import { useCurrency } from '../services/CurrencyContext';
import api from '../services/api';
import { ShieldCheck, CreditCard, Landmark, Truck, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';

const Checkout = () => {
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  // Form State
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  
  // Checkout states
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [successOrder, setSuccessOrder] = useState(null);

  // Auto-fill user shipping profiles if available
  useEffect(() => {
    if (user) {
      setShippingAddress(user.address || '');
      setCity(user.city || '');
      setPostalCode(user.postalCode || '');
      setCountry(user.country || '');
    }
  }, [user]);

  // Calculations
  const subtotal = cart.totalAmount || 0;
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!shippingAddress.trim() || !city.trim() || !postalCode.trim() || !country.trim()) {
      setCheckoutError("All shipping address fields are required.");
      return;
    }

    setSubmitting(true);
    setCheckoutError('');
    try {
      const fullAddress = `${shippingAddress.trim()}, ${city.trim()}, ${postalCode.trim()}, ${country.trim()}`;
      const response = await api.post('/orders', {
        shippingAddress: fullAddress,
        paymentMethod: paymentMethod
      });
      
      setSuccessOrder(response.data);
      // Clear front-end cart state
      await clearCart();
    } catch (err) {
      setCheckoutError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (successOrder) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-6">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/25 rounded-full flex items-center justify-center mx-auto text-emerald-450 animate-bounce">
          <CheckCircle2 size={36} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-100">Order Placed Successfully!</h2>
          <p className="text-sm text-slate-400">
            Thank you for shopping at E-Market. Your order <b>#{successOrder.id}</b> is being processed.
          </p>
        </div>
        <div className="glass-card p-5 rounded-2xl text-left space-y-2 text-xs text-slate-400">
          <div className="flex justify-between"><span>Delivery Address:</span><span className="text-slate-200 text-right max-w-[200px] truncate">{successOrder.shippingAddress}</span></div>
          <div className="flex justify-between"><span>Amount Paid:</span><span className="text-purple-400 font-bold">{formatPrice(successOrder.totalAmount)}</span></div>
          <div className="flex justify-between"><span>Payment Method:</span><span className="text-slate-200">{successOrder.paymentMethod}</span></div>
        </div>
        <div className="flex flex-col space-y-2 pt-4">
          <Link to="/orders" className="btn-primary py-3">Track Order History</Link>
          <Link to="/shop" className="btn-secondary py-3 text-xs">Return to Catalog</Link>
        </div>
      </div>
    );
  }

  if (!cart.cartItems || cart.cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <ShieldCheck size={48} className="text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-200">No Items to Checkout</h2>
        <p className="text-sm text-slate-500">Your cart is empty. Please add items before checking out.</p>
        <Link to="/shop" className="btn-primary inline-block">Browse Shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 text-left space-y-6">
      
      {/* Title */}
      <div className="flex items-center space-x-2">
        <Link to="/cart" className="p-2 text-slate-400 hover:text-slate-200 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Checkout</h1>
          <p className="text-xs text-slate-500 mt-1">Configure shipping parameters and place your order</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Forms */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-2 space-y-6">
          
          {/* Shipping Details */}
          <div className="glass-card p-6 rounded-2xl border border-slate-900 space-y-4">
            <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <Truck size={18} className="text-purple-400" />
              <span>Shipping Destination</span>
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Street Address</label>
                <input
                  type="text"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Street name, apartment, unit..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3.5 text-sm focus:outline-none focus:border-purple-500 text-slate-250"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New York"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3.5 text-sm focus:outline-none focus:border-purple-500 text-slate-250"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Postal Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="10001"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3.5 text-sm focus:outline-none focus:border-purple-500 text-slate-250"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="United States"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3.5 text-sm focus:outline-none focus:border-purple-500 text-slate-250"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="glass-card p-6 rounded-2xl border border-slate-900 space-y-4">
            <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <CreditCard size={18} className="text-purple-400" />
              <span>Payment Option</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <button
                type="button"
                onClick={() => setPaymentMethod('Card')}
                className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                  paymentMethod === 'Card'
                    ? 'bg-purple-600/10 border-purple-500 text-purple-300'
                    : 'bg-slate-900/50 border-slate-800 text-slate-450 hover:bg-slate-900 hover:text-slate-300'
                }`}
              >
                <CreditCard size={20} />
                <div className="text-left">
                  <p className="text-sm font-semibold">Credit/Debit Card</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Pay online via Stripe</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Cash')}
                className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                  paymentMethod === 'Cash'
                    ? 'bg-purple-600/10 border-purple-500 text-purple-300'
                    : 'bg-slate-900/50 border-slate-800 text-slate-450 hover:bg-slate-900 hover:text-slate-300'
                }`}
              >
                <Landmark size={20} />
                <div className="text-left">
                  <p className="text-sm font-semibold">Cash on Delivery</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Pay cash upon home arrival</p>
                </div>
              </button>

            </div>
          </div>

        </form>

        {/* Right Side: Order Summary Recap */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 rounded-2xl border border-slate-900 space-y-6 sticky top-24">
            <h3 className="text-base font-bold text-slate-200 pb-3 border-b border-slate-900">Checkout Recap</h3>

            {/* Recap Items */}
            <div className="max-h-40 overflow-y-auto space-y-3 pr-2">
              {cart.cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span className="text-slate-400 max-w-[150px] truncate">
                    {item.productName} <b className="text-slate-500">x{item.quantity}</b>
                  </span>
                  <span className="text-slate-300 font-semibold">{formatPrice(item.totalPrice)}</span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-3 text-sm border-t border-slate-900 pt-4">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Sales Tax</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="border-t border-slate-900 pt-3 flex justify-between font-bold text-slate-100">
                <span>Total Amount</span>
                <span className="text-purple-400 text-lg">{formatPrice(total)}</span>
              </div>
            </div>

            {checkoutError && (
              <p className="text-xs text-rose-400 font-semibold text-center leading-normal">
                {checkoutError}
              </p>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-1.5"
            >
              {submitting ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Place Secure Order</span>
                </>
              )}
            </button>

          </div>
        </div>

      </div>

    </div>
  );
};

export default Checkout;
