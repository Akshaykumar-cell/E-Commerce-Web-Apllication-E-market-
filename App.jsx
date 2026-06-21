import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './services/AuthContext';
import { CurrencyProvider } from './services/CurrencyContext';
import { CartProvider } from './services/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import SupportChatbot from './components/SupportChatbot';
import AdminRoute from './components/AdminRoute';

// Firebase Services & Utilities
import { db, rtdb } from './services/firebase';
import { collection, addDoc } from 'firebase/firestore';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  useEffect(() => {
    console.log("🔥 [Firebase] Initializing connection and services check...");
    try {
      console.log("📂 [Firebase] Firestore Database loaded successfully:", db);
      console.log("💾 [Firebase] Realtime Database loaded successfully:", rtdb);
      
      // Attempt a safe, non-blocking database write test.
      // If Firestore security rules are locked, this fails gracefully with a warning.
      const runFirebaseConnectionTest = async () => {
        try {
          const testCol = collection(db, '_connection_test');
          await addDoc(testCol, {
            timestamp: new Date().toISOString(),
            status: 'connected_successfully'
          });
          console.log("✅ [Firebase] Firestore connection read/write check succeeded!");
        } catch (dbError) {
          console.warn("⚠️ [Firebase] Firestore write check returned an error. This is normal if security rules are currently set to closed/locked mode in your Firebase Console. Error message:", dbError.message);
        }
      };

      runFirebaseConnectionTest();
    } catch (error) {
      console.error("❌ [Firebase] Failed to initialize check:", error);
    }
  }, []);

  return (
    <AuthProvider>
      <CurrencyProvider>
        <CartProvider>
          <Router>
          <div className="flex flex-col min-h-screen">
            {/* Navigation Header */}
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-grow py-8 bg-slate-950">
              <Routes>
                {/* Visitor Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Logged-in Customer Protected Routes */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <OrderHistory />
                    </ProtectedRoute>
                  }
                />

                {/* Administrator Protected Dashboard Route */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
              </Routes>
            </main>

            {/* Footer */}
            <Footer />

            {/* Support Chatbot Widget */}
            <SupportChatbot />
          </div>
        </Router>
      </CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;
