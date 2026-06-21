import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../services/CartContext';
import { useAuth } from '../services/AuthContext';
import { useCurrency } from '../services/CurrencyContext';
import ProductCard from '../components/ProductCard';
import { Star, ShoppingCart, Check, Plus, Minus, MessageSquare, ShieldAlert, ShoppingBag, RefreshCw, HelpCircle, Mic, MicOff } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Inquiries State
  const [inquiries, setInquiries] = useState([]);
  const [inquiryName, setInquiryName] = useState(user ? `${user.firstName} ${user.lastName}` : '');
  const [inquiryEmail, setInquiryEmail] = useState(user ? user.email : '');
  const [inquiryQuestion, setInquiryQuestion] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryError, setInquiryError] = useState('');
  const [isListeningInquiry, setIsListeningInquiry] = useState(false);
  const inquiryRecognitionRef = useRef(null);

  const { formatPrice } = useCurrency();
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
        setReviews(response.data.reviews || []);

        const inquiriesResponse = await api.get(`/inquiries/product/${id}`);
        setInquiries(inquiriesResponse.data || []);
      } catch (error) {
        console.error("Failed to load product details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  useEffect(() => {
    if (user) {
      setInquiryName(`${user.firstName} ${user.lastName}`);
      setInquiryEmail(user.email);
    } else {
      setInquiryName('');
      setInquiryEmail('');
    }
  }, [user]);

  // Initialize SpeechRecognition for Q&A Form
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListeningInquiry(true);
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInquiryQuestion(prev => prev ? prev + ' ' + transcript : transcript);
      };

      rec.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListeningInquiry(false);
      };

      rec.onend = () => {
        setIsListeningInquiry(false);
      };

      inquiryRecognitionRef.current = rec;
    }
  }, []);

  const toggleInquiryListening = () => {
    if (!inquiryRecognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please try Chrome or Edge.");
      return;
    }

    if (isListeningInquiry) {
      inquiryRecognitionRef.current.stop();
    } else {
      try {
        inquiryRecognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    if (product) {
      // 1. Get current history
      const history = JSON.parse(localStorage.getItem('emarket_product_history') || '[]');
      
      // 2. Add current product to the front and filter out duplicates
      const uniqueHistory = [];
      const seenIds = new Set();
      
      // Current product goes first
      seenIds.add(product.id);
      uniqueHistory.push(product);
      
      for (const item of history) {
        if (item && item.id && !seenIds.has(item.id)) {
          seenIds.add(item.id);
          uniqueHistory.push(item);
        }
      }
      
      const updatedHistory = uniqueHistory.slice(0, 5); // Keep up to 5 items
      localStorage.setItem('emarket_product_history', JSON.stringify(updatedHistory));

      // 3. Set other viewed products in local state (excluding current)
      setRecentlyViewed(updatedHistory.filter(item => item.id !== product.id));
    }
  }, [product]);

  const incrementQty = () => {
    if (product && quantity < product.stockQuantity) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQty = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!product || product.stockQuantity <= 0) return;

    setAdding(true);
    setAddSuccess(false);
    try {
      await addToCart(product, quantity);
      setAddSuccess(true);
      setTimeout(() => {
        setAdding(false);
        setAddSuccess(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setAdding(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) {
      setReviewError("Please write a comment.");
      return;
    }

    setSubmittingReview(true);
    setReviewError('');
    try {
      const response = await api.post(`/products/${id}/reviews`, {
        rating: ratingInput,
        comment: commentInput.trim()
      });
      
      // Add review to local list
      setReviews(prev => [response.data, ...prev]);
      
      // Clear review fields
      setCommentInput('');
      setRatingInput(5);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!inquiryQuestion.trim()) {
      setInquiryError("Please write a question.");
      return;
    }
    if (!user && (!inquiryName.trim() || !inquiryEmail.trim())) {
      setInquiryError("Please enter your name and email.");
      return;
    }

    setSubmittingInquiry(true);
    setInquiryError('');
    setInquirySuccess(false);

    try {
      await api.post('/inquiries', {
        productId: parseInt(id),
        customerName: user ? `${user.firstName} ${user.lastName}` : inquiryName.trim(),
        customerEmail: user ? user.email : inquiryEmail.trim(),
        question: inquiryQuestion.trim()
      });

      setInquirySuccess(true);
      setInquiryQuestion('');
    } catch (err) {
      setInquiryError(err.response?.data?.message || err.response?.data?.errors?.[0] || 'Failed to submit inquiry.');
    } finally {
      setSubmittingInquiry(false);
    }
  };

  const renderStars = (rating, onClick = null, interactive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={interactive ? 20 : 14}
          onClick={onClick ? () => onClick(i) : null}
          className={`${
            i <= rating
              ? 'fill-amber-400 text-amber-400'
              : 'text-slate-600'
          } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
        />
      );
    }
    return stars;
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

  if (!product) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <ShieldAlert size={48} className="text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-350">Product Not Found</h2>
        <p className="text-sm text-slate-500">The product you are trying to view does not exist or has been deleted.</p>
        <Link to="/shop" className="btn-primary inline-block">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 text-left space-y-16">
      
      {/* Product Information Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Left Side: Product Image */}
        <div className="rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/40 relative aspect-square flex items-center justify-center">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.stockQuantity <= 0 && (
            <span className="absolute top-4 left-4 bg-red-600/90 text-white text-[11px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full shadow-lg">
              Out of Stock
            </span>
          )}
          {product.brand && (
            <span className="absolute top-4 right-4 bg-slate-950/80 border border-slate-850 text-slate-300 text-xs font-semibold px-3 py-1 rounded-lg">
              {product.brand}
            </span>
          )}
        </div>

        {/* Right Side: Product Details */}
        <div className="flex flex-col justify-center space-y-6">
          <div className="space-y-2">
            <span className="bg-purple-600/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              {product.categoryName}
            </span>
            <h1 className="text-3xl font-extrabold text-slate-100 mt-2">{product.name}</h1>
          </div>

          {/* Average Rating summary */}
          <div className="flex items-center space-x-2">
            <div className="flex">{renderStars(product.averageRating)}</div>
            <span className="text-sm text-slate-400 font-semibold">{product.averageRating.toFixed(1)} / 5.0</span>
            <span className="text-slate-650">|</span>
            <span className="text-sm text-slate-400">({reviews.length} reviews)</span>
          </div>

          {/* Pricing */}
          <div className="py-4 border-y border-slate-900 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Retail Price</p>
              <h2 className="text-3xl font-extrabold text-slate-100 mt-0.5">{formatPrice(product.price)}</h2>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Availability</p>
              <p className={`text-sm font-semibold mt-1 ${product.stockQuantity > 5 ? 'text-emerald-450' : product.stockQuantity > 0 ? 'text-amber-500' : 'text-rose-500'}`}>
                {product.stockQuantity > 5 ? 'In Stock' : product.stockQuantity > 0 ? `Only ${product.stockQuantity} items left` : 'Out of Stock'}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-400 leading-relaxed">{product.description}</p>

          {/* Quantity Selector & Add to Cart button */}
          {product.stockQuantity > 0 && (
            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 shrink-0">
                <button
                  onClick={decrementQty}
                  className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 font-bold text-slate-200 text-sm">{quantity}</span>
                <button
                  onClick={incrementQty}
                  className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="btn-primary flex-grow py-3 flex items-center justify-center gap-2 text-sm"
              >
                {addSuccess ? (
                  <>
                    <Check size={18} />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    <span>Add {quantity} to Cart</span>
                  </>
                )}
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Reviews & Feedback Section */}
      <section className="space-y-8">
        <div className="border-b border-slate-900 pb-4 flex items-center gap-2.5">
          <MessageSquare size={22} className="text-purple-400" />
          <h2 className="text-xl font-bold text-slate-100">Customer Feedback</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Add Review Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Price Trend History Component */}
            <div className="glass-card p-5 rounded-2xl space-y-4 text-left border border-slate-800">
              <h3 className="text-sm font-bold text-slate-150 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                <span>Price Trend History</span>
              </h3>
              <p className="text-[11px] text-slate-500">Track structural price changes and seasonal campaigns for this product</p>
              
              <div className="relative border-l-2 border-slate-800/80 ml-2.5 pl-5 space-y-5 pt-1">
                {[
                  { label: 'Original Launch', price: product.price * 1.15, date: '2 months ago', note: 'Initial Release Price' },
                  { label: 'Festive Season Sale', price: product.price * 0.85, date: '1 month ago', note: 'Limited Promotion Discount' },
                  { label: 'Current Price', price: product.price, date: 'Today', note: 'Best price guaranteed', active: true }
                ].map((pt, idx) => (
                  <div key={idx} className="relative">
                    <span className={`absolute -left-[27px] top-1 w-3 h-3 rounded-full border border-slate-950 ${
                      pt.active ? 'bg-purple-500 shadow-sm shadow-purple-500' : 'bg-slate-800'
                    }`}></span>
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between flex-wrap">
                        <span className={`text-[11px] font-bold ${pt.active ? 'text-purple-400' : 'text-slate-350'}`}>{pt.label}</span>
                        <span className="text-[11px] font-extrabold text-slate-200">{formatPrice(pt.price)}</span>
                      </div>
                      <p className="text-[9px] text-slate-500">{pt.date} • {pt.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <h3 className="text-base font-bold text-slate-200">Share Your Experience</h3>
            {user ? (
              <form onSubmit={handleReviewSubmit} className="glass-card p-6 rounded-2xl space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-semibold block">Your Rating</label>
                  <div className="flex space-x-1.5 pt-1">
                    {renderStars(ratingInput, (rating) => setRatingInput(rating), true)}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-semibold block">Your Comment</label>
                  <textarea
                    rows="4"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Describe product performance, build quality, shipping speed..."
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-500 text-slate-250 placeholder-slate-600 resize-none"
                  ></textarea>
                </div>

                {reviewError && (
                  <p className="text-xs text-rose-400 font-medium">{reviewError}</p>
                )}

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-1.5"
                >
                  {submittingReview ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <span>Submit Review</span>
                  )}
                </button>
              </form>
            ) : (
              <div className="glass-card p-6 rounded-2xl text-center space-y-3">
                <ShieldAlert size={24} className="text-slate-650 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">Authentication Required</h4>
                <p className="text-xs text-slate-500">You must log in to submit a review.</p>
                <Link to="/login" className="btn-secondary text-xs inline-block w-full">Go to Login</Link>
              </div>
            )}
          </div>

          {/* Reviews List Panel */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-base font-bold text-slate-200">Reviews ({reviews.length})</h3>
            {reviews.length === 0 ? (
              <p className="text-sm text-slate-500 py-10 text-center bg-slate-900/10 rounded-2xl border border-slate-900 border-dashed">
                Be the first to leave a review for this product!
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="glass-card p-5 rounded-2xl space-y-2 text-left">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">{rev.customerName}</h4>
                        <div className="flex mt-1">{renderStars(rev.rating)}</div>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed pt-1">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Product Inquiries (Q&A) Section */}
      <section className="space-y-8 pt-8 border-t border-slate-900">
        <div className="border-b border-slate-900 pb-4 flex items-center gap-2.5">
          <HelpCircle size={22} className="text-purple-400" />
          <h2 className="text-xl font-bold text-slate-100">Product Q&A</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Ask a Question Form */}
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-base font-bold text-slate-200">Have a Question?</h3>
            <form onSubmit={handleInquirySubmit} className="glass-card p-6 rounded-2xl space-y-4">
              
              {!user && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-semibold block">Your Name</label>
                    <input
                      type="text"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      placeholder="e.g. Alice Smith"
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-500 text-slate-250 placeholder-slate-650"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-semibold block">Your Email</label>
                    <input
                      type="email"
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      placeholder="e.g. alice@example.com"
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-500 text-slate-250 placeholder-slate-650"
                      required
                    />
                  </div>
                </>
              )}

              {user && (
                <div className="bg-slate-900/30 border border-slate-850 rounded-xl p-3 text-xs space-y-1">
                  <p className="text-slate-400">Posting as: <strong className="text-slate-300">{user.firstName} {user.lastName}</strong></p>
                  <p className="text-slate-400">Email: <span className="text-slate-400">{user.email}</span></p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-slate-400 font-semibold">Your Question</label>
                  <button
                    type="button"
                    onClick={toggleInquiryListening}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 transition-all ${
                      isListeningInquiry 
                        ? 'bg-rose-600 text-white border-rose-550 animate-pulse' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-350'
                    }`}
                  >
                    {isListeningInquiry ? <MicOff size={10} /> : <Mic size={10} />}
                    <span>{isListeningInquiry ? 'Listening...' : 'Speak Question'}</span>
                  </button>
                </div>
                <textarea
                  rows="4"
                  value={inquiryQuestion}
                  onChange={(e) => setInquiryQuestion(e.target.value)}
                  placeholder="Ask about dimensions, compatibilities, warranty, etc..."
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-500 text-slate-250 placeholder-slate-600 resize-none"
                  required
                ></textarea>
              </div>

              {inquiryError && (
                <p className="text-xs text-rose-450 font-medium">{inquiryError}</p>
              )}

              {inquirySuccess && (
                <p className="text-xs text-emerald-450 font-semibold bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
                  ✓ Your question has been submitted! An administrator will reply shortly.
                </p>
              )}

              <button
                type="submit"
                disabled={submittingInquiry}
                className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-1.5"
              >
                {submittingInquiry ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <span>Submit Question</span>
                )}
              </button>
            </form>
          </div>

          {/* Answered Questions List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-base font-bold text-slate-200">Answered Questions ({inquiries.length})</h3>
            {inquiries.length === 0 ? (
              <p className="text-sm text-slate-500 py-10 text-center bg-slate-900/10 rounded-2xl border border-slate-900 border-dashed">
                No questions have been asked about this product yet. Be the first to ask!
              </p>
            ) : (
              <div className="space-y-5">
                {inquiries.map((inq) => (
                  <div key={inq.id} className="glass-card p-5 rounded-2xl border border-slate-850 space-y-3.5 text-left">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                          <span>Question from {inq.customerName}</span>
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(inq.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-200 pl-3 border-l-2 border-purple-500">{inq.question}</p>
                    </div>

                    <div className="space-y-1 bg-slate-900/40 p-3.5 rounded-xl border border-slate-850/50">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="bg-purple-500/10 border border-purple-500/25 text-purple-400 text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded">
                          Answer
                        </span>
                        <span className="text-[9px] text-slate-500">by E-Market Team</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{inq.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Recently Viewed Products (Product History) */}
      {recentlyViewed.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-slate-900">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <ShoppingBag size={20} className="text-purple-400" />
              <span>Product History (Recently Viewed)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Pick up where you left off in your browsing session</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentlyViewed.map((viewedProd) => (
              <ProductCard key={viewedProd.id} product={viewedProd} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default ProductDetails;
