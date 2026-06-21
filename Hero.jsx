import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Hero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeBanner, setActiveBanner] = useState(0);
  const heroRef = useRef(null);

  const banners = [
    {
      subtitle: "Welcome to E-Market v2.0",
      title: "Discover Curated",
      highlight: "Digital Excellence",
      description: "Experience our next-generation premium store. Secure token-based checkout, lightning fast database syncs, and custom-tailored aesthetics for modern consumers.",
      ctaText: "Explore Collection",
      link: "/shop",
      categoryLink: "/shop?category=1",
      categoryText: "View Electronics"
    },
    {
      subtitle: "Exclusive Launch Promotion",
      title: "Elevate Your Style With",
      highlight: "Premium Curated Goods",
      description: "Discover handcrafted luxury fashion, high-end electronics, and essential school or fitness gear engineered to complement your daily lifestyle.",
      ctaText: "Go to Shop",
      link: "/shop",
      categoryLink: "/shop?category=2",
      categoryText: "View Fashion"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % banners.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const currentBanner = banners[activeBanner];

  return (
    <motion.div
      ref={heroRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl bg-slate-900/60 border border-slate-800/80 my-6 shadow-2xl backdrop-blur-md group"
      style={{
        background: `radial-gradient(circle 350px at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.12), transparent 80%)`
      }}
    >
      {/* Animated Glowing Particles in Background */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-glow"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-glow [animation-delay:3s]"></div>
      
      {/* Radial Background Light Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      {/* Hero Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-8 py-16 md:p-16 items-center relative z-10">
        
        {/* Left Side: Dynamic Banners */}
        <div className="space-y-6 max-w-xl text-left min-h-[360px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeBanner}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="space-y-6"
            >
              <div className="inline-flex items-center space-x-2 bg-purple-500/15 border border-purple-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-purple-300">
                <Sparkles size={12} className="text-amber-450 animate-spin" style={{ animationDuration: '4s' }} />
                <span>{currentBanner.subtitle}</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.15] text-slate-100">
                {currentBanner.title} <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-sm font-black">
                  {currentBanner.highlight}
                </span>
              </h1>

              <p className="text-sm md:text-base text-slate-400 leading-relaxed font-normal">
                {currentBanner.description}
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link to={currentBanner.link} className="btn-primary flex items-center space-x-2 hover:scale-105 active:scale-95 transition-all shadow-glow">
                  <ShoppingBag size={18} />
                  <span>{currentBanner.ctaText}</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to={currentBanner.categoryLink} className="btn-secondary flex items-center space-x-2 hover:scale-105 active:scale-95 transition-all">
                  <span>{currentBanner.categoryText}</span>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Side: Interactive Visual Graphic Layout */}
        <div className="hidden lg:grid grid-cols-2 gap-4 relative">
          
          {/* Main Visual Box */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            whileHover={{ y: -6 }}
            className="relative rounded-2xl overflow-hidden aspect-[4/5] border border-slate-800/80 shadow-2xl group cursor-pointer animate-float"
          >
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400"
              alt="SonicWave Headphones"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex items-end p-5 text-left">
              <div>
                <span className="text-[10px] text-purple-400 font-extrabold uppercase tracking-widest bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full mb-1 inline-block">Hi-Fi Audio</span>
                <h4 className="text-sm font-bold text-slate-100 group-hover:text-purple-300 transition-colors">SonicWave Pro Edition</h4>
              </div>
            </div>
          </motion.div>

          {/* Stacked Visual Boxes */}
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              whileHover={{ y: -4 }}
              className="relative rounded-2xl overflow-hidden aspect-[4/3] border border-slate-800/80 shadow-xl group cursor-pointer animate-float [animation-delay:1.5s]"
            >
              <img
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400"
                alt="Krono Watch"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent flex items-end p-4 text-left">
                <div>
                  <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider block">Smart Wearable</span>
                  <h4 className="text-xs font-bold text-slate-200">Krono Watch Series 5</h4>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              whileHover={{ y: -4 }}
              className="relative rounded-2xl overflow-hidden aspect-[4/3] border border-slate-800/80 shadow-xl group cursor-pointer animate-float [animation-delay:0.75s]"
            >
              <img
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400"
                alt="Running Shoes"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent flex items-end p-4 text-left">
                <div>
                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider block">Athletic Wear</span>
                  <h4 className="text-xs font-bold text-slate-200">Terra Recycled Runners</h4>
                </div>
              </div>
            </motion.div>
          </div>

        </div>

      </div>
    </motion.div>
  );
};

export default Hero;
