import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { useCurrency } from '../services/CurrencyContext';
import { ShieldCheck, Truck, RotateCcw, ShoppingBag, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const catRes = await api.get('/categories');
        setCategories(catRes.data);

        const prodRes = await api.get('/products');
        setFeaturedProducts(prodRes.data.slice(0, 4));
      } catch (error) {
        console.error("Error loading homepage data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();

    const history = JSON.parse(localStorage.getItem('emarket_product_history') || '[]');
    setRecentlyViewed(history);
  }, []);

  // Framer Motion container variants for staggered children entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 space-y-16 overflow-hidden">
      
      {/* Hero Header Banner */}
      <Hero />

      {/* Highlights Section */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Highlight 1 */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5, borderColor: 'rgba(139, 92, 246, 0.35)' }}
          className="glass-card p-6 rounded-2xl flex items-start space-x-4 border border-slate-900 transition-all duration-300"
        >
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
            <Truck size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-100 text-sm">Free Express Shipping</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">No delivery fees on orders above {formatPrice(50)}. Arrives in 2-3 business days.</p>
          </div>
        </motion.div>

        {/* Highlight 2 */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5, borderColor: 'rgba(139, 92, 246, 0.35)' }}
          className="glass-card p-6 rounded-2xl flex items-start space-x-4 border border-slate-900 transition-all duration-300"
        >
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-100 text-sm">Token-Secured Payments</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Fully encrypted JWT security ensures your purchase transactions are 100% safe.</p>
          </div>
        </motion.div>

        {/* Highlight 3 */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5, borderColor: 'rgba(139, 92, 246, 0.35)' }}
          className="glass-card p-6 rounded-2xl flex items-start space-x-4 border border-slate-900 transition-all duration-300"
        >
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
            <RotateCcw size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-100 text-sm">Easy Returns</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Not satisfied? Return any unopened product within 30 days for a full refund.</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Shop Categories */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="space-y-6 text-left"
      >
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
            <Sparkles size={20} className="text-purple-400" />
            <span>Shop by Category</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">Browse our carefully curated segments</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-2xl bg-slate-900/60 animate-pulse border border-slate-850"></div>
            ))}
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {categories.map((category) => (
              <motion.div
                key={category.id}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative rounded-2xl overflow-hidden aspect-[4/3] border border-slate-800/80 shadow-lg group bg-slate-900/40"
              >
                <Link to={`/shop?category=${category.id}`} className="block w-full h-full">
                  <img
                    src={category.imageUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=400'}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/20 to-transparent flex flex-col justify-end p-4 transition-all duration-300">
                    <h3 className="font-bold text-slate-100 group-hover:text-purple-400 transition-colors text-base">{category.name}</h3>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1 group-hover:text-slate-200 transition-colors">{category.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.section>

      {/* Featured Products */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="space-y-6 text-left"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-100">Trending Releases</h2>
            <p className="text-xs text-slate-500 mt-1">Most popular items in demand</p>
          </div>
          <Link to="/shop" className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center space-x-1 border border-purple-500/20 bg-purple-500/5 px-3.5 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95">
            <span>View All Products</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-slate-900/60 animate-pulse border border-slate-850"></div>
            ))}
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {featuredProducts.map((product, idx) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard product={product} index={idx} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.section>

      {/* Recently Viewed Products */}
      {recentlyViewed.length > 0 && (
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="space-y-6 pt-10 border-t border-slate-900 text-left"
        >
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
              <ShoppingBag size={22} className="text-purple-400" />
              <span>Product History</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Pick up where you left off in your browsing session</p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {recentlyViewed.slice(0, 4).map((viewedProd, idx) => (
              <motion.div key={viewedProd.id} variants={itemVariants}>
                <ProductCard product={viewedProd} index={idx} />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      )}

    </div>
  );
};

export default Home;
