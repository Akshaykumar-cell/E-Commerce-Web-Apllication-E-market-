import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { useCurrency } from '../services/CurrencyContext';
import { Filter, SlidersHorizontal, Search, RefreshCw, X } from 'lucide-react';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { symbol, currency, rate } = useCurrency();

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Trigger search from input onSubmit
  const [triggerQuery, setTriggerQuery] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, minPrice, maxPrice, sortBy, search]);

  // Load categories on start
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    loadCategories();
  }, []);

  // Update filter fields if URL Search Params change (like navbar search redirects)
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || '';
    
    let changed = false;
    if (urlSearch !== search) {
      setSearch(urlSearch);
      changed = true;
    }
    if (urlCategory !== selectedCategory) {
      setSelectedCategory(urlCategory);
      changed = true;
    }
    
    if (changed) {
      setTriggerQuery(prev => prev + 1);
    }
  }, [searchParams, search, selectedCategory]);

  // Query products with active filters
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (selectedCategory) params.categoryId = selectedCategory;
        if (minPrice) {
          params.minPrice = currency === 'INR' ? (parseFloat(minPrice) / rate).toFixed(2) : minPrice;
        }
        if (maxPrice) {
          params.maxPrice = currency === 'INR' ? (parseFloat(maxPrice) / rate).toFixed(2) : maxPrice;
        }
        if (sortBy) params.sortBy = sortBy;

        const response = await api.get('/products', { params });
        setProducts(response.data);
      } catch (err) {
        console.error("Failed to query products:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [selectedCategory, minPrice, maxPrice, sortBy, triggerQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams(prev => {
      if (search) prev.set('search', search);
      else prev.delete('search');
      return prev;
    });
    setTriggerQuery(prev => prev + 1);
  };

  const handleCategorySelect = (categoryId) => {
    const nextVal = selectedCategory == categoryId ? '' : categoryId;
    setSelectedCategory(nextVal);
    setSearchParams(prev => {
      if (nextVal) prev.set('category', nextVal);
      else prev.delete('category');
      return prev;
    });
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setSearchParams({});
    setTriggerQuery(prev => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 text-left">
      <div className="flex flex-col md:flex-row gap-8 py-6">
        
        {/* Left Side: Filter Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-900">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-100">
              <SlidersHorizontal size={18} />
              <span>Filters</span>
            </h2>
            <button
              onClick={resetFilters}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium"
            >
              Reset All
            </button>
          </div>

          {/* Search filter in sidebar */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Search Keywords</h3>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Product name, brand..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:border-purple-500 text-slate-200"
              />
              <button type="submit" className="absolute right-2.5 top-2.5 text-slate-500 hover:text-purple-400">
                <Search size={16} />
              </button>
            </form>
          </div>

          {/* Categories select list */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Categories</h3>
            <div className="space-y-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`w-full text-left py-1.5 px-2.5 rounded-lg text-sm transition-colors flex items-center justify-between ${
                    selectedCategory == cat.id
                      ? 'bg-purple-600/10 border border-purple-500/30 text-purple-300 font-medium'
                      : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Price Interval ({symbol})</h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-purple-500 text-slate-200"
              />
              <span className="text-slate-600">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-purple-500 text-slate-200"
              />
            </div>
            <button
              onClick={() => setTriggerQuery(prev => prev + 1)}
              className="btn-secondary w-full text-xs py-2 mt-2 flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={12} />
              <span>Apply Pricing</span>
            </button>
          </div>
        </aside>

        {/* Right Side: Header and Product Grid */}
        <main className="flex-grow space-y-6">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-900">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Shop Catalog</h1>
              <p className="text-xs text-slate-500 mt-1">Showing {products.length} matching products</p>
            </div>

            {/* Sorting */}
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-slate-500">Sort By</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 focus:outline-none focus:border-purple-500 text-slate-200 text-xs font-semibold"
              >
                <option value="newest">Newest Releases</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
              </select>
            </div>
          </div>

          {/* Active Filters Indicators */}
          {(search || selectedCategory || minPrice || maxPrice) && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-slate-500 mr-1">Active filters:</span>
              {search && (
                <span className="bg-slate-900 border border-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <span>Keyword: {search}</span>
                  <button onClick={() => { setSearch(''); setSearchParams(prev => { prev.delete('search'); return prev; }); setTriggerQuery(prev => prev + 1); }} className="hover:text-purple-400"><X size={12} /></button>
                </span>
              )}
              {selectedCategory && (
                <span className="bg-slate-900 border border-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <span>Category: {categories.find(c => c.id == selectedCategory)?.name || selectedCategory}</span>
                  <button onClick={() => { setSelectedCategory(''); setSearchParams(prev => { prev.delete('category'); return prev; }); setTriggerQuery(prev => prev + 1); }} className="hover:text-purple-400"><X size={12} /></button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="bg-slate-900 border border-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <span>Price: {minPrice ? symbol + minPrice : '0'} - {maxPrice ? symbol + maxPrice : '∞'}</span>
                  <button onClick={() => { setMinPrice(''); setMaxPrice(''); setTriggerQuery(prev => prev + 1); }} className="hover:text-purple-400"><X size={12} /></button>
                </span>
              )}
            </div>
          )}

          {/* Product Grid Panel */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-slate-900 animate-pulse border border-slate-850"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="glass-card py-20 px-4 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
              <SlidersHorizontal size={48} className="text-slate-700" />
              <div>
                <h3 className="text-lg font-bold text-slate-300">No Products Found</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm">No items in our catalog matched your search filters. Try adjusting price limits or keywords.</p>
              </div>
              <button onClick={resetFilters} className="btn-secondary text-xs">Reset All Filters</button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.slice((currentPage - 1) * 12, currentPage * 12).map((prod, idx) => (
                  <ProductCard key={prod.id} product={prod} index={idx} />
                ))}
              </div>

              {/* Pagination Controls */}
              {Math.ceil(products.length / 12) > 1 && (
                <div className="flex items-center justify-center space-x-2 pt-6 border-t border-slate-900/60">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage(prev => Math.max(prev - 1, 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors text-slate-350"
                  >
                    Previous
                  </button>
                  
                  {[...Array(Math.ceil(products.length / 12))].map((_, idx) => {
                    const pageNumber = idx + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => {
                          setCurrentPage(pageNumber);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-8 h-8 text-xs font-bold rounded-lg border transition-colors ${
                          currentPage === pageNumber
                            ? 'bg-purple-600 border-purple-500 text-white shadow-sm shadow-purple-600/20'
                            : 'bg-slate-900 border-slate-800 text-slate-450 hover:bg-slate-850 hover:text-slate-200'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    disabled={currentPage === Math.ceil(products.length / 12)}
                    onClick={() => {
                      setCurrentPage(prev => Math.min(prev + 1, Math.ceil(products.length / 12)));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors text-slate-350"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

        </main>

      </div>
    </div>
  );
};

export default Shop;
