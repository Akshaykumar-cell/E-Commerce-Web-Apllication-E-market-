import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../services/CartContext';
import { useCurrency } from '../services/CurrencyContext';
import { Star, ShoppingCart, Check, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductCard = ({ product, index = 0 }) => {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [wishlisted, setWishlisted] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (product.stockQuantity <= 0) return;

    setAdding(true);
    setErrorMsg('');
    try {
      await addToCart(product, 1);
      setTimeout(() => setAdding(false), 1200);
    } catch (err) {
      setErrorMsg(err);
      setTimeout(() => {
        setAdding(false);
        setErrorMsg('');
      }, 2000);
    }
  };

  const toggleWishlist = (e) => {
    e.preventDefault();
    setWishlisted(!wishlisted);
  };

  const { formatPrice } = useCurrency();

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <motion.div 
            key={i} 
            whileHover={{ scale: 1.2, rotate: 10 }}
            className="text-amber-400"
          >
            <Star size={14} className="fill-amber-400 text-amber-400" />
          </motion.div>
        );
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(
          <motion.div 
            key={i} 
            whileHover={{ scale: 1.2, rotate: 10 }}
            className="text-amber-400"
          >
            <Star size={14} className="fill-amber-400/50 text-amber-400" />
          </motion.div>
        );
      } else {
        stars.push(
          <motion.div 
            key={i} 
            whileHover={{ scale: 1.2, rotate: 10 }}
            className="text-slate-600"
          >
            <Star size={14} />
          </motion.div>
        );
      }
    }
    return stars;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.3), ease: "easeOut" }}
      whileHover={{ 
        y: -8, 
        borderColor: 'rgba(139, 92, 246, 0.45)',
        boxShadow: '0 15px 30px -10px rgba(139, 92, 246, 0.25), 0 0 20px -5px rgba(139, 92, 246, 0.15)'
      }}
      className="glass-card rounded-2xl overflow-hidden flex flex-col h-full relative group bg-slate-900/40 border border-slate-800/80 transition-all duration-300"
    >
      {/* Product Image Link Container */}
      <Link to={`/product/${product.id}`} className="block overflow-hidden relative aspect-square">
        <motion.img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'}
          alt={product.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.4 }}
        />
        
        {/* Out of Stock Overlay */}
        {product.stockQuantity <= 0 && (
          <span className="absolute top-3 left-3 bg-red-600/90 backdrop-blur-sm text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-lg z-10">
            Out of Stock
          </span>
        )}

        {/* Low Stock Warning */}
        {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
          <span className="absolute top-3 left-3 bg-amber-600/95 backdrop-blur-sm text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-lg z-10">
            Only {product.stockQuantity} Left
          </span>
        )}

        {/* Brand overlay on top right */}
        {product.brand && (
          <span className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur-sm text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-slate-800 z-10">
            {product.brand}
          </span>
        )}

        {/* Wishlist Floating Button */}
        <button
          onClick={toggleWishlist}
          className="absolute bottom-3 right-3 p-2 bg-slate-950/80 backdrop-blur-sm border border-slate-800/60 text-slate-400 hover:text-rose-500 rounded-full transition-colors z-10 shadow-lg"
          title="Add to Wishlist"
        >
          <motion.div
            animate={{ scale: wishlisted ? [1, 1.4, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart size={14} className={wishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-400'} />
          </motion.div>
        </button>
      </Link>

      {/* Product Content Details */}
      <div className="p-5 flex flex-col flex-grow">
        
        {/* Category */}
        <span className="text-[11px] font-bold text-purple-400 uppercase tracking-widest mb-1.5 block">
          {product.categoryName || 'Catalog'}
        </span>

        {/* Title */}
        <Link to={`/product/${product.id}`} className="hover:text-purple-400 transition-colors block flex-grow mb-2">
          <h3 className="font-semibold text-slate-100 text-sm leading-snug line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Ratings */}
        <div className="flex items-center space-x-1.5 mb-4">
          <div className="flex space-x-0.5">{renderStars(product.averageRating)}</div>
          <span className="text-[10px] font-semibold text-slate-500">({product.reviewCount})</span>
        </div>

        {/* Price & Cart CTA */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-800/40">
          <div>
            <span className="text-[10px] text-slate-500 block font-semibold uppercase tracking-wider">Price</span>
            <span className="text-base font-extrabold text-slate-100">{formatPrice(product.price)}</span>
          </div>

          <motion.button
            onClick={handleAddToCart}
            disabled={product.stockQuantity <= 0 || adding}
            whileHover={{ scale: product.stockQuantity <= 0 ? 1 : 1.05 }}
            whileTap={{ scale: product.stockQuantity <= 0 ? 1 : 0.95 }}
            className={`p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center ${
              product.stockQuantity <= 0
                ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                : adding
                ? errorMsg
                  ? 'bg-red-600 text-white'
                  : 'bg-emerald-600 text-white'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/10'
            }`}
            title="Add to Cart"
          >
            {adding ? (
              errorMsg ? (
                <span className="text-xs font-semibold px-1">Err</span>
              ) : (
                <Check size={16} />
              )
            ) : (
              <ShoppingCart size={16} />
            )}
          </motion.button>
        </div>

        {/* Localized Error Toast */}
        {errorMsg && (
          <p className="text-[10px] text-red-400 mt-2 text-center truncate font-medium">
            {errorMsg}
          </p>
        )}

      </div>
    </motion.div>
  );
};

export default ProductCard;
