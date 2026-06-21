import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { db } from '../services/firebase';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                E-Market
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Premium curated goods designed to elevate your modern lifestyle. Built with security, performance, and excellence.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-550 hover:text-purple-400 transition-colors" title="Twitter">
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" className="text-slate-550 hover:text-purple-400 transition-colors" title="Instagram">
                <svg className="w-4.5 h-4.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="#" className="text-slate-550 hover:text-purple-400 transition-colors" title="Github">
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">Shop</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/shop?category=1" className="hover:text-purple-400 transition-colors">Electronics</Link></li>
              <li><Link to="/shop?category=2" className="hover:text-purple-400 transition-colors">Fashion</Link></li>
              <li><Link to="/shop?category=3" className="hover:text-purple-400 transition-colors">Home & Living</Link></li>
              <li><Link to="/shop?category=4" className="hover:text-purple-400 transition-colors">Sports & Fitness</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-purple-400 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">Subscribe</h3>
            <p className="text-sm text-slate-400">Get 10% off your first order and stay updated on secret sales.</p>
            <form className="flex space-x-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Email address"
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 text-slate-200 w-full"
              />
              <button className="btn-primary py-2 px-3 text-sm">Join</button>
            </form>
          </div>

        </div>

        {/* Bottom Banner */}
        <div className="border-t border-slate-900 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 animate-fade-in">
          <p>&copy; {new Date().getFullYear()} E-Market Inc. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 mt-4 md:mt-0">
            {db && (
              <div className="flex items-center space-x-2 text-emerald-400 relative">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Firebase DB Ready</span>
              </div>
            )}
            <span>Security Protected by JWT</span>
            <div className="flex items-center space-x-1">
              <CreditCard size={14} />
              <span>Secure Transactions</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
