import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../services/AuthContext';
import { useCurrency } from '../services/CurrencyContext';
import { 
  MessageSquare, Send, X, Bot, User, Sparkles, Clock, 
  ArrowRight, Search, FileText, CheckCircle, ExternalLink, 
  Lock, RefreshCw, ChevronRight, HelpCircle, Mic, MicOff,
  Volume2, VolumeX
} from 'lucide-react';

const SupportChatbot = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeakEnabled, setIsSpeakEnabled] = useState(() => {
    const saved = localStorage.getItem('chat_speak_enabled');
    return saved === 'true';
  });
  const recognitionRef = useRef(null);
  const spokenMessageIdsRef = useRef(new Set());

  // Bot flow states
  const [flowState, setFlowState] = useState('idle'); // idle, searching, tracking, FAQ, inquiry_product_select, inquiry_email, inquiry_name, inquiry_question
  const [inquiryData, setInquiryData] = useState({
    productId: null,
    productName: '',
    customerName: '',
    customerEmail: '',
    question: ''
  });

  const chatEndRef = useRef(null);

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputVal(prev => prev ? prev + ' ' + transcript : transcript);
      };

      rec.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please try Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Speak text helper using Web Speech Synthesis API
  const speakText = (text) => {
    if (!text) return;
    
    // Stop any ongoing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Process text to clean it (strip markdown, links, specific emojis)
    let cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1') // remove bold markdown
      .replace(/\*(.*?)\*/g, '$1')     // remove italic markdown
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // remove links
      .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '') // remove emojis
      .replace(/📞|💬|🔍|📦|📝|❓|⬅️|⚠️|🎉|🚛|🏠|🛍️|🔑|✨/g, '') // remove common emojis specifically
      .trim();

    if (!cleanText) return;

    try {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'en-US';
      window.speechSynthesis?.speak(utterance);
    } catch (err) {
      console.error("Speech Synthesis error:", err);
    }
  };

  // Persist speaking state and stop speech on disable
  useEffect(() => {
    localStorage.setItem('chat_speak_enabled', isSpeakEnabled);
    if (!isSpeakEnabled && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [isSpeakEnabled]);

  // Automatically speak new bot messages if enabled
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender === 'bot' && isSpeakEnabled) {
        if (!spokenMessageIdsRef.current.has(lastMsg.id)) {
          spokenMessageIdsRef.current.add(lastMsg.id);
          speakText(lastMsg.text);
        }
      }
    }
  }, [messages, isSpeakEnabled]);

  // Cancel speech on close
  useEffect(() => {
    if (!isOpen && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [isOpen]);

  // Load greeting message when chatbot is first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      triggerWelcome();
    }
  }, [isOpen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const triggerWelcome = () => {
    setFlowState('idle');
    const welcomeMsg = {
      id: Date.now(),
      sender: 'bot',
      text: `Hi there! 👋 I'm your E-Market Assistant. How can I help you today?`,
      timestamp: new Date(),
      chips: [
        { label: '🔍 Search Products', value: 'search' },
        { label: '📦 Track My Order', value: 'track' },
        { label: '📝 Ask a Question', value: 'inquiry' },
        { label: '📞 Talk to Human Agent', value: 'talk_to_human' },
        { label: '❓ FAQ & Policies', value: 'faq' }
      ]
    };
    
    // Check if user is currently on a product page
    const productMatch = window.location.pathname.match(/\/product\/(\d+)/);
    if (productMatch) {
      const prodId = parseInt(productMatch[1]);
      welcomeMsg.text += " I noticed you are viewing a product. Would you like to ask a question specifically about it?";
      welcomeMsg.chips.unshift({ label: '💬 Ask about this product', value: `inquiry_product_${prodId}` });
    }

    setMessages([welcomeMsg]);
  };

  const addBotMessage = (text, options = {}) => {
    setMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      sender: 'bot',
      text,
      timestamp: new Date(),
      ...options
    }]);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      sender: 'user',
      text,
      timestamp: new Date()
    }]);
  };

  const handleChipClick = async (chip) => {
    addUserMessage(chip.label);
    
    if (chip.value === 'search') {
      setFlowState('searching');
      setLoading(true);
      setTimeout(() => {
        addBotMessage("🔍 What products are you looking for? Type keywords (e.g. 'watch', 'saree', 'keyboard'):");
        setLoading(false);
      }, 500);
    } 
    else if (chip.value === 'track') {
      handleOrderTrackingFlow();
    } 
    else if (chip.value === 'faq') {
      setFlowState('FAQ');
      setLoading(true);
      setTimeout(() => {
        addBotMessage("❓ Select a topic to learn about our store rules and policies:", {
          chips: [
            { label: 'Shipping Rates & Time', value: 'faq_shipping' },
            { label: 'Returns & Refund Policy', value: 'faq_returns' },
            { label: 'Contact Support directly', value: 'faq_contact' },
            { label: '⬅️ Back to Main Menu', value: 'back_to_main' }
          ]
        });
        setLoading(false);
      }, 500);
    } 
    else if (chip.value === 'inquiry') {
      // General Inquiry or choose product
      setFlowState('inquiry_product_select');
      setLoading(true);
      setTimeout(() => {
        addBotMessage("📝 Is your inquiry about a specific product?", {
          chips: [
            { label: 'Yes, search for a product', value: 'inquiry_prod_yes' },
            { label: 'No, it is a general question', value: 'inquiry_prod_no' },
            { label: '⬅️ Back to Main Menu', value: 'back_to_main' }
          ]
        });
        setLoading(false);
      }, 500);
    }
    else if (chip.value.startsWith('inquiry_product_')) {
      // Direct inquiry about current product
      const prodId = parseInt(chip.value.split('_')[2]);
      try {
        setLoading(true);
        const res = await api.get(`/products/${prodId}`);
        setInquiryData(prev => ({
          ...prev,
          productId: prodId,
          productName: res.data.name
        }));
        startInquiryDetailsFlow(prodId, res.data.name);
      } catch (err) {
        addBotMessage("⚠️ Could not load product details. Let's do a general inquiry instead.", {
          chips: [
            { label: 'Continue with General Inquiry', value: 'inquiry_prod_no' },
            { label: 'Back to Main Menu', value: 'back_to_main' }
          ]
        });
      } finally {
        setLoading(false);
      }
    }
    else if (chip.value === 'inquiry_prod_yes') {
      setFlowState('inquiry_product_search');
      addBotMessage("🔍 Please type the name of the product you have a question about:");
    }
    else if (chip.value === 'inquiry_prod_no') {
      setInquiryData(prev => ({
        ...prev,
        productId: null,
        productName: ''
      }));
      startInquiryDetailsFlow(null, '');
    }
    else if (chip.value === 'back_to_main') {
      setFlowState('idle');
      addBotMessage("What else can I help you with?", {
        chips: [
          { label: '🔍 Search Products', value: 'search' },
          { label: '📦 Track My Order', value: 'track' },
          { label: '📝 Ask a Question', value: 'inquiry' },
          { label: '❓ FAQ & Policies', value: 'faq' }
        ]
      });
    }
    else if (chip.value === 'faq_shipping') {
      addBotMessage("🚚 **Shipping Policy:** We offer free standard shipping on orders over $50.00. For orders under $50.00, we charge a flat rate of $4.99.\n\n- Domestic delivery: 3-5 business days.\n- International delivery: 7-14 business days.", {
        chips: [
          { label: 'Return Policy', value: 'faq_returns' },
          { label: 'Back to FAQs', value: 'faq' },
          { label: 'Main Menu', value: 'back_to_main' }
        ]
      });
    }
    else if (chip.value === 'faq_returns') {
      addBotMessage("↩️ **Returns & Refund Policy:** You can return any unused item in its original packaging within 30 days of purchase for a full refund. Return shipping is free for damaged or incorrect items. Refunds take 5-7 business days to process back to your original payment method.", {
        chips: [
          { label: 'Shipping Policy', value: 'faq_shipping' },
          { label: 'Back to FAQs', value: 'faq' },
          { label: 'Main Menu', value: 'back_to_main' }
        ]
      });
    }
    else if (chip.value === 'faq_contact') {
      addBotMessage("📞 **Contact Support:**\n- Email: support@emarket.com\n- Phone: +1-800-EMARKET (9 AM - 6 PM EST, Mon-Fri)\n- Or submit an inquiry here using the 'Ask a Question' option!", {
        chips: [
          { label: '📝 Submit Inquiry', value: 'inquiry' },
          { label: 'Main Menu', value: 'back_to_main' }
        ]
      });
    }
    else if (chip.value === 'talk_to_human') {
      setFlowState('inquiry_phone');
      setLoading(true);
      setTimeout(() => {
        addBotMessage("📞 I can route your request to a customer support agent. To get started, please enter your contact phone number:");
        setLoading(false);
      }, 500);
    }
  };

  const submitCallbackRequest = async (phone, name, email) => {
    setLoading(true);
    try {
      // Fetch first product to associate inquiry callback request with
      let prodId = 1;
      const prodRes = await api.get('/products');
      if (prodRes.data && prodRes.data.length > 0) {
        prodId = prodRes.data[0].id;
      }

      await api.post('/inquiries', {
        productId: prodId,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        question: `[CALLBACK REQUEST] Customer requested phone forwarding to speak with a human support agent. Preferred Callback Number: ${phone}`
      });

      addBotMessage(
        `📞 **Call Forwarding Request Received!**\n\n` +
        `I have successfully queued your request and forwarded it to our active support agent pool. A representative will call you back on **${phone}** shortly.\n\n` +
        `If you'd like to dial our support line directly right now, please click the button below:`,
        {
          type: 'call_action',
          chips: [
            { label: '⬅️ Back to Main Menu', value: 'back_to_main' }
          ]
        }
      );
      setFlowState('idle');
    } catch (err) {
      addBotMessage("⚠️ Failed to queue callback request. You can dial our support line directly at **+1-800-EMARKET**.", {
        chips: [{ label: 'Main Menu', value: 'back_to_main' }]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOrderTrackingFlow = async () => {
    if (!user) {
      addBotMessage("🔒 Order tracking requires you to be logged in. Would you like to log in now?", {
        chips: [
          { label: '🔑 Go to Login', value: 'go_to_login' },
          { label: '⬅️ Back to Main Menu', value: 'back_to_main' }
        ]
      });
      return;
    }

    setFlowState('tracking');
    setLoading(true);
    try {
      const res = await api.get('/orders');
      const ordersList = res.data;

      if (ordersList.length === 0) {
        addBotMessage("📦 You haven't placed any orders yet. Once you place an order, you can track it here!", {
          chips: [{ label: 'Back to Main Menu', value: 'back_to_main' }]
        });
      } else {
        // Display top 3 recent orders
        const recentOrders = ordersList.slice(0, 3);
        const orderChips = recentOrders.map(ord => ({
          label: `Order #${ord.id} - ${formatPrice(ord.totalAmount)}`,
          value: `track_detail_${ord.id}`
        }));
        orderChips.push({ label: '⬅️ Back to Main Menu', value: 'back_to_main' });

        addBotMessage("📦 Here are your recent orders. Click one to view tracking details:", {
          chips: orderChips
        });
      }
    } catch (err) {
      addBotMessage("⚠️ Failed to load your orders. Please check your network connection.", {
        chips: [{ label: 'Main Menu', value: 'back_to_main' }]
      });
    } finally {
      setLoading(false);
    }
  };

  const startInquiryDetailsFlow = (productId, productName) => {
    if (user) {
      // User is logged in: skip name and email
      setInquiryData(prev => ({
        ...prev,
        customerName: `${user.firstName} ${user.lastName}`,
        customerEmail: user.email
      }));
      setFlowState('inquiry_question');
      addBotMessage(
        productId 
          ? `📝 Great! You're asking about **${productName}**. Please type your question below:` 
          : `📝 Please type your general question below:`
      );
    } else {
      // Guest user: ask for name
      setFlowState('inquiry_name');
      addBotMessage("📝 To submit an inquiry, what is your full name?");
    }
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const query = inputVal.trim();
    addUserMessage(query);
    setInputVal('');

    if (flowState === 'searching') {
      setLoading(true);
      try {
        const res = await api.get(`/products?search=${encodeURIComponent(query)}`);
        const searchResults = res.data.slice(0, 3); // limit to 3

        if (searchResults.length === 0) {
          addBotMessage(`🔍 Sorry, I couldn't find any products matching "${query}". Try searching for something else, or click below to return:`, {
            chips: [
              { label: '🔍 Try another search', value: 'search' },
              { label: 'Main Menu', value: 'back_to_main' }
            ]
          });
        } else {
          // Send custom product cards
          setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'bot',
            type: 'products',
            products: searchResults,
            timestamp: new Date()
          }]);

          addBotMessage("Hope that helps! What would you like to do next?", {
            chips: [
              { label: '🔍 Search again', value: 'search' },
              { label: 'Main Menu', value: 'back_to_main' }
            ]
          });
          setFlowState('idle');
        }
      } catch (err) {
        addBotMessage("⚠️ Search failed. Please try again.");
      } finally {
        setLoading(false);
      }
    } 
    else if (flowState === 'inquiry_product_search') {
      setLoading(true);
      try {
        const res = await api.get(`/products?search=${encodeURIComponent(query)}`);
        const searchResults = res.data.slice(0, 3);

        if (searchResults.length === 0) {
          addBotMessage(`🔍 No products found matching "${query}". Let's ask a general question instead, or search again.`, {
            chips: [
              { label: '🔍 Search again', value: 'inquiry_prod_yes' },
              { label: 'Submit General Question', value: 'inquiry_prod_no' }
            ]
          });
        } else {
          // Display product chips to pick
          const productChips = searchResults.map(p => ({
            label: p.name,
            value: `inquiry_product_${p.id}`
          }));
          productChips.push({ label: 'Submit General Question', value: 'inquiry_prod_no' });

          addBotMessage("Select the matching product from the list:", {
            chips: productChips
          });
          setFlowState('inquiry_product_select');
        }
      } catch (err) {
        addBotMessage("⚠️ Error searching products. Try again.");
      } finally {
        setLoading(false);
      }
    }
    else if (flowState === 'inquiry_name') {
      setInquiryData(prev => ({ ...prev, customerName: query }));
      setFlowState('inquiry_email');
      addBotMessage(`Thanks, ${query}! Now, what is your email address so we can send our response?`);
    } 
    else if (flowState === 'inquiry_email') {
      // Validate email format simply
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(query)) {
        addBotMessage("⚠️ That email address doesn't look valid. Please enter a valid email address:");
        return;
      }
      setInquiryData(prev => ({ ...prev, customerEmail: query }));
      setFlowState('inquiry_question');
      addBotMessage(
        inquiryData.productId
          ? `Perfect. What is your question about **${inquiryData.productName}**?`
          : "Perfect. What is your question?"
      );
    } 
    else if (flowState === 'inquiry_phone') {
      const phoneRegex = /^[\d\s()+-]{7,20}$/;
      if (!phoneRegex.test(query)) {
        addBotMessage("⚠️ That phone number doesn't look valid. Please enter a valid phone number (digits only, e.g. +18003627538 or 123-456-7890):");
        return;
      }

      setInquiryData(prev => ({ 
        ...prev, 
        customerPhone: query,
        customerName: user ? `${user.firstName} ${user.lastName}` : "Guest Support Request",
        customerEmail: user ? user.email : "callback@emarket.com"
      }));

      if (user) {
        submitCallbackRequest(query, `${user.firstName} ${user.lastName}`, user.email);
      } else {
        setFlowState('inquiry_phone_name');
        addBotMessage("Got it! Since you are a guest, what is your full name?");
      }
    }
    else if (flowState === 'inquiry_phone_name') {
      setInquiryData(prev => ({ ...prev, customerName: query }));
      setFlowState('inquiry_phone_email');
      addBotMessage(`Thanks, ${query}! What is your email address so we can document the request?`);
    }
    else if (flowState === 'inquiry_phone_email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(query)) {
        addBotMessage("⚠️ That email address doesn't look valid. Please enter a valid email address:");
        return;
      }
      const name = inquiryData.customerName;
      const phone = inquiryData.customerPhone;
      submitCallbackRequest(phone, name, query);
    }
    else if (flowState === 'inquiry_question') {
      setLoading(true);
      try {
        const payload = {
          productId: inquiryData.productId || 1, // Fallback to 1 if general but database needs ProductId
          customerName: inquiryData.customerName,
          customerEmail: inquiryData.customerEmail,
          question: query
        };

        // Note: In backend Db, ProductId is required if it's foreign key, but if we don't have a specific product,
        // we can seed the first product or map it to a generic product. Or let's fetch the first product to link to.
        if (!inquiryData.productId) {
          // Fetch first product to associate general inquiries with
          const prodRes = await api.get('/products');
          if (prodRes.data && prodRes.data.length > 0) {
            payload.productId = prodRes.data[0].id;
          }
        }

        await api.post('/inquiries', payload);

        addBotMessage(`🎉 Thank you! Your question has been submitted successfully.\n\nOur team will review your inquiry and reply to **${inquiryData.customerEmail}** as soon as possible.`, {
          chips: [
            { label: 'Back to Main Menu', value: 'back_to_main' }
          ]
        });
        setFlowState('idle');
      } catch (err) {
        addBotMessage("⚠️ Failed to submit inquiry. Please check the information and try again.", {
          chips: [
            { label: 'Try again', value: 'inquiry' },
            { label: 'Back to Main Menu', value: 'back_to_main' }
          ]
        });
      } finally {
        setLoading(false);
      }
    } 
    else {
      // Generic chat response (keyword matches)
      setLoading(true);
      setTimeout(() => {
        const lowerQ = query.toLowerCase();
        if (lowerQ.includes('shipping') || lowerQ.includes('delivery')) {
          handleChipClick({ label: 'Shipping Rates & Time', value: 'faq_shipping' });
        } else if (lowerQ.includes('return') || lowerQ.includes('refund')) {
          handleChipClick({ label: 'Returns & Refund Policy', value: 'faq_returns' });
        } else if (lowerQ.includes('contact') || lowerQ.includes('call') || lowerQ.includes('email') || lowerQ.includes('phone')) {
          handleChipClick({ label: 'Contact Support directly', value: 'faq_contact' });
        } else if (lowerQ.includes('order') || lowerQ.includes('track')) {
          handleOrderTrackingFlow();
        } else if (lowerQ.includes('hello') || lowerQ.includes('hi ') || lowerQ.includes('hey')) {
          triggerWelcome();
        } else {
          addBotMessage("Hmm, I didn't quite catch that. I am a support assistant. Would you like to search products, track an order, or submit an inquiry to our support team?", {
            chips: [
              { label: '🔍 Search Products', value: 'search' },
              { label: '📦 Track My Order', value: 'track' },
              { label: '📝 Ask a Question', value: 'inquiry' },
              { label: '📞 Talk to Human Agent', value: 'talk_to_human' },
              { label: '❓ FAQ & Policies', value: 'faq' }
            ]
          });
        }
        setLoading(false);
      }, 600);
    }
  };

  const handleOrderTrackDetail = async (orderId) => {
    setLoading(true);
    try {
      const res = await api.get(`/orders/${orderId}`);
      const ord = res.data;
      
      let itemsList = ord.orderItems.map(item => `- ${item.productName} (x${item.quantity})`).join('\n');
      
      addBotMessage(
        `📦 **Order Details #${ord.id}**\n` +
        `📅 Date: ${new Date(ord.orderDate).toLocaleDateString()}\n` +
        `💰 Total: ${formatPrice(ord.totalAmount)}\n` +
        `🚛 Status: **${ord.status.toUpperCase()}**\n\n` +
        `🏠 Shipping Address:\n${ord.shippingAddress}\n\n` +
        `🛍️ Items:\n${itemsList}`, 
        {
          chips: [
            { label: '📦 Track another order', value: 'track' },
            { label: 'Main Menu', value: 'back_to_main' }
          ]
        }
      );
    } catch (err) {
      addBotMessage("⚠️ Could not load tracking details for that order.", {
        chips: [{ label: 'Back to Orders', value: 'track' }]
      });
    } finally {
      setLoading(false);
    }
  };

  // Intercept chips that trigger custom routing or commands
  const onChipAction = (chip) => {
    if (chip.value === 'go_to_login') {
      setIsOpen(false);
      navigate('/login');
    } else if (chip.value.startsWith('track_detail_')) {
      const id = chip.value.split('_')[2];
      addUserMessage(chip.label);
      handleOrderTrackDetail(id);
    } else {
      handleChipClick(chip);
    }
  };

  return (
    <>
      {/* 1. Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-tr from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-full p-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center animate-bounce group"
          id="chatbot-trigger-btn"
          title="Chat with customer support"
        >
          <MessageSquare className="w-6 h-6 transition-transform group-hover:rotate-12" />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-pink-500"></span>
          </span>
        </button>
      )}

      {/* 2. Chat Widget Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[350px] sm:w-[400px] h-[550px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-900/90 to-blue-900/90 p-4 flex items-center justify-between border-b border-slate-850">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-purple-400 relative">
                <Bot className="w-5 h-5 animate-pulse" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  <span>E-Market Assistant</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h3>
                <span className="text-[10px] text-slate-350 flex items-center gap-1">
                  <span>Customer Support Bot</span>
                  <span>•</span>
                  <span className="text-emerald-450 font-semibold">Online</span>
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsSpeakEnabled(prev => !prev)}
                className={`p-1.5 rounded-lg transition-colors border ${
                  isSpeakEnabled 
                    ? 'text-purple-400 border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/20' 
                    : 'text-slate-400 border-transparent hover:bg-white/5 hover:text-slate-200'
                }`}
                title={isSpeakEnabled ? "Mute voice (Text-to-Speech)" : "Unmute voice (Text-to-Speech)"}
              >
                {isSpeakEnabled ? <Volume2 className="w-4.5 h-4.5 animate-pulse" /> : <VolumeX className="w-4.5 h-4.5" />}
              </button>
              
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-950/20">
            
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}>
                
                <div className="flex items-end gap-2 max-w-[85%]">
                  {msg.sender === 'bot' && (
                    <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800 text-purple-400 shrink-0 self-start mt-1">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                  
                  {msg.type === 'products' ? (
                    /* Search results custom renderer */
                    <div className="space-y-3 w-full">
                      <p className="text-xs text-slate-400 font-semibold text-left mb-1.5 flex items-center gap-1">
                        <Search className="w-3.5 h-3.5 text-purple-400" />
                        <span>Search Results:</span>
                      </p>
                      {msg.products.map(prod => (
                        <div key={prod.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex gap-3 text-left">
                          <img src={prod.imageUrl || 'https://via.placeholder.com/60'} className="w-14 h-14 object-cover rounded-xl border border-slate-800 shrink-0" />
                          <div className="flex flex-col justify-between overflow-hidden">
                            <div>
                              <h4 className="text-xs font-bold text-slate-200 truncate">{prod.name}</h4>
                              <p className="text-[10px] text-slate-500 font-medium">{prod.brand}</p>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs font-extrabold text-purple-400">{formatPrice(prod.price)}</span>
                              <Link 
                                to={`/product/${prod.id}`}
                                onClick={() => setIsOpen(false)}
                                className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
                              >
                                <span>View</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : msg.type === 'call_action' ? (
                    <div className="space-y-3 w-full">
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-left space-y-3">
                        <div className="flex items-center gap-2 text-purple-400">
                          <span className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-450">
                            <Clock className="w-5 h-5 animate-pulse" />
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-slate-200">Call Forwarding Queued</h4>
                            <span className="text-[10px] text-slate-500 block font-semibold">Active Agent Pool</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-350 leading-relaxed">
                          We have routed your request. Click below to dial our service representative directly:
                        </p>
                        <a 
                          href="tel:+18003627538"
                          className="btn-primary w-full py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-650"
                        >
                          <span>📞 Dial +1-800-EMARKET</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    /* Regular text bubble */
                    <div className={`p-3 rounded-2xl text-xs text-left leading-relaxed whitespace-pre-line border ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-tr from-purple-700 to-indigo-700 border-purple-650 text-white rounded-br-none'
                        : 'bg-slate-900 border-slate-800 text-slate-300 rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                  )}
                </div>

                {/* Chips / Quick Reply buttons */}
                {msg.sender === 'bot' && msg.chips && msg.chips.length > 0 && (
                  <div className="flex flex-wrap gap-2 pl-7 pt-1 w-full justify-start">
                    {msg.chips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => onChipAction(chip)}
                        className="bg-slate-900 hover:bg-purple-950 border border-slate-850 hover:border-purple-800 text-slate-350 hover:text-purple-300 text-[10px] font-bold py-1.5 px-3 rounded-full transition-all flex items-center gap-1"
                      >
                        {chip.label.startsWith('🔍') && <Search className="w-2.5 h-2.5" />}
                        {chip.label.startsWith('📦') && <FileText className="w-2.5 h-2.5" />}
                        {chip.label.startsWith('❓') && <HelpCircle className="w-2.5 h-2.5" />}
                        <span>{chip.label}</span>
                      </button>
                    ))}
                  </div>
                )}
                
                <span className="text-[8px] text-slate-600 pl-7">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 max-w-[80%]">
                <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800 text-purple-400 shrink-0 mt-1">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl rounded-bl-none flex items-center gap-1">
                  <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Footer Input Form */}
          <form 
            onSubmit={handleTextSubmit} 
            className="p-3 bg-slate-900 border-t border-slate-850 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={
                flowState === 'searching' ? "Type product name to search..." :
                flowState === 'inquiry_name' ? "Enter your full name..." :
                flowState === 'inquiry_email' ? "Enter your email address..." :
                flowState === 'inquiry_question' ? "Type your question here..." :
                "Type a message or policy keyword..."
              }
              className="flex-grow bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-purple-650 text-slate-200 placeholder-slate-600"
            />
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2 rounded-xl transition-all flex items-center justify-center shrink-0 border ${
                isListening 
                  ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-550 animate-pulse scale-105 shadow-md shadow-rose-500/25' 
                  : 'bg-slate-950 hover:bg-slate-855 border-slate-800 text-slate-400 hover:text-slate-350'
              }`}
              title={isListening ? "Listening... click to stop" : "Use voice search"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-850 text-white rounded-xl p-2 transition-colors flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};

export default SupportChatbot;
