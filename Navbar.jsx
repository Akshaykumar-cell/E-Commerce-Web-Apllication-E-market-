import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { useCart } from '../services/CartContext';
import CurrencySwitcher, { CurrencySwitcherMobile } from './CurrencySwitcher';
import { ShoppingCart, Search, User, LogOut, Package, Shield, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount, bounce } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="glass sticky top-0 z-50 w-full px-6 py-4 shadow-lg backdrop-blur-md border-b border-slate-900 bg-slate-950/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <motion.span 
            whileHover={{ scale: 1.05, textShadow: "0 0 10px rgba(168, 85, 247, 0.6)" }}
            className="text-2xl font-black tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent cursor-pointer"
          >
            E-Market
          </motion.span>
        </Link>

        {/* Desktop Search Bar (Expandable on focus) */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative">
          <motion.input
            type="text"
            placeholder="Search products, brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            initial={{ width: 220 }}
            whileFocus={{ width: 340 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-slate-900/60 border border-slate-800 rounded-full py-2 pl-4 pr-10 text-xs focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-slate-200"
          />
          <button type="submit" className="absolute right-3.5 text-slate-400 hover:text-purple-400 transition-colors">
            <Search size={16} />
          </button>
        </form>

        {/* Links & Session Actions */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="relative text-slate-300 hover:text-purple-400 font-bold text-xs uppercase tracking-wider transition-colors group">
            <span>Home</span>
            <span className="absolute bottom-[-4px] left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          
          <Link to="/shop" className="relative text-slate-300 hover:text-purple-400 font-bold text-xs uppercase tracking-wider transition-colors group">
            <span>Shop</span>
            <span className="absolute bottom-[-4px] left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 group-hover:w-full"></span>
          </Link>

          {/* Currency Switcher */}
          <CurrencySwitcher />

          {/* Cart Icon */}
          <Link to="/cart" className="relative p-2 text-slate-300 hover:text-purple-400 transition-colors">
            <motion.div
              animate={bounce ? { scale: [1, 1.25, 0.9, 1.1, 1] } : {}}
              transition={{ duration: 0.4 }}
            >
              <ShoppingCart size={20} />
            </motion.div>
            {cartCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-slate-950 shadow-glow"
              >
                {cartCount}
              </motion.span>
            )}
          </Link>

          {/* Auth Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 text-slate-300 hover:text-purple-400 focus:outline-none py-1.5 px-3.5 rounded-xl hover:bg-slate-900/60 border border-slate-900/50 hover:border-slate-800 transition-colors"
              >
                <User size={16} />
                <span className="font-bold text-xs uppercase tracking-wider max-w-[100px] truncate">{user.firstName}</span>
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 mt-3 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2.5 z-50 backdrop-blur-xl"
                  >
                    <div className="px-4 py-2 border-b border-slate-850">
                      <p className="text-[10px] uppercase font-bold text-slate-500">Signed in as</p>
                      <p className="text-xs font-bold truncate text-slate-300">{user.email}</p>
                    </div>
                    
                    <Link
                      to="/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-850 hover:text-white transition-colors"
                    >
                      <Package size={14} className="text-slate-450" />
                      <span>My Orders</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-bold text-purple-400 hover:bg-slate-850 hover:text-purple-300 transition-colors"
                      >
                        <Shield size={14} />
                        <span>Admin Panel</span>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-rose-450 hover:bg-slate-850 hover:text-rose-400 transition-colors text-left"
                    >
                      <LogOut size={14} />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/login" className="btn-secondary text-xs font-bold uppercase tracking-wider py-2 px-4.5 rounded-xl">Login</Link>
              <Link to="/register" className="btn-primary text-xs font-bold uppercase tracking-wider py-2 px-4.5 rounded-xl shadow-glow">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger menu trigger */}
        <div className="md:hidden flex items-center space-x-4">
          <Link to="/cart" className="relative p-2 text-slate-300">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-purple-600 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-slate-950">
                {cartCount}
              </span>
            )}
          </Link>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-300 p-1">
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown with slide-down animation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden mt-4 pt-4 border-t border-slate-900 space-y-4 overflow-hidden"
          >
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-850 rounded-xl py-2 pl-3 pr-10 text-xs focus:outline-none text-slate-200"
              />
              <button type="submit" className="absolute right-3.5 top-2.5 text-slate-400">
                <Search size={16} />
              </button>
            </form>

            <div className="flex flex-col space-y-3.5 px-2 text-left">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white">Home</Link>
              <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white">Shop</Link>
              
              <CurrencySwitcherMobile />
              
              {user ? (
                <>
                  <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white">My Orders</Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-xs font-bold uppercase tracking-wider text-purple-400 hover:text-purple-300">Admin Panel</Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                      navigate('/');
                    }}
                    className="text-xs font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300 text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-secondary w-full text-center py-2 text-xs font-bold uppercase tracking-wider rounded-xl">Login</Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary w-full text-center py-2 text-xs font-bold uppercase tracking-wider rounded-xl shadow-glow">Sign Up</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
