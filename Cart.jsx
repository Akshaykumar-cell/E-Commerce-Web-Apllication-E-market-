import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../services/CartContext';
import { useCurrency } from '../services/CurrencyContext';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, loading } = useCart();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  // Computations
  const subtotal = cart.totalAmount || 0;
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% sales tax
  const total = subtotal + shipping + tax;

  const handleQtyChange = async (productId, currentQty, increment) => {
    const targetQty = increment ? currentQty + 1 : currentQty - 1;
    await updateQuantity(productId, targetQty);
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

  if (!cart.cartItems || cart.cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-5">
        <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
          <ShoppingCart size={28} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-200">Your Shopping Cart is Empty</h2>
          <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
            Looks like you haven't added anything to your cart yet. Explore our curated collections to find premium items!
          </p>
        </div>
        <Link to="/shop" className="btn-primary inline-flex items-center space-x-2 text-sm">
          <ArrowLeft size={16} />
          <span>Continue Shopping</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 text-left space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <ShoppingCart size={22} className="text-purple-400" />
          <span>Shopping Cart</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Verify your products and configure quantities before checkout</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.cartItems.map((item) => (
            <div
              key={item.id}
              className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-900"
            >
              
              {/* Product Info Block */}
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                <img
                  src={item.productImageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=100'}
                  alt={item.productName}
                  className="w-16 h-16 object-cover rounded-xl border border-slate-800 shrink-0"
                />
                <div>
                  <Link to={`/product/${item.productId}`} className="hover:text-purple-400 font-semibold text-slate-200 text-sm line-clamp-1">
                    {item.productName}
                  </Link>
                  <p className="text-xs text-slate-500 mt-1">Unit price: {formatPrice(item.unitPrice)}</p>
                </div>
              </div>

              {/* Quantity Changer & Pricing */}
              <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-8">
                
                {/* Quantity select counter */}
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                  <button
                    onClick={() => handleQtyChange(item.productId, item.quantity, false)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-3 text-xs font-bold text-slate-200">{item.quantity}</span>
                  <button
                    onClick={() => handleQtyChange(item.productId, item.quantity, true)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Sub-total price */}
                <div className="text-right shrink-0 min-w-[70px]">
                  <span className="text-sm font-bold text-slate-200">{formatPrice(item.totalPrice)}</span>
                </div>

                {/* Trash delete button */}
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="text-slate-500 hover:text-rose-500 p-2 rounded-lg hover:bg-rose-500/5 transition-colors shrink-0"
                  title="Remove Item"
                >
                  <Trash2 size={16} />
                </button>

              </div>

            </div>
          ))}
        </div>

        {/* Right Side: Order Summary */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 rounded-2xl border border-slate-900 space-y-6 sticky top-24">
            <h3 className="text-base font-bold text-slate-200 pb-3 border-b border-slate-900">Order Summary</h3>

            {/* Calculations list */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Est. Sales Tax (8%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="border-t border-slate-900 pt-3 flex justify-between font-bold text-slate-100">
                <span>Total Amount</span>
                <span className="text-purple-400 text-lg">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Free shipping threshold indicator */}
            {shipping > 0 && (
              <p className="text-[10px] text-purple-400 bg-purple-500/5 border border-purple-500/10 rounded-lg p-2.5 leading-normal text-center">
                Add another <b>{formatPrice(50 - subtotal)}</b> for Free Express Shipping!
              </p>
            )}

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/checkout')}
                className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-1.5"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>
              <Link
                to="/shop"
                className="btn-secondary w-full py-3 text-xs flex items-center justify-center gap-1.5 text-center"
              >
                <span>Continue Shopping</span>
              </Link>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default Cart;
