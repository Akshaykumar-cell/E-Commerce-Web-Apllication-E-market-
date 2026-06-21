import React, { createContext, useState, useEffect, useContext } from 'react';
import api from './api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ cartItems: [], totalAmount: 0 });
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [bounce, setBounce] = useState(false);

  // Compute quantity count and trigger bounce
  useEffect(() => {
    if (cart && cart.cartItems) {
      const count = cart.cartItems.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
      
      setBounce(true);
      const timer = setTimeout(() => setBounce(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cart]);

  // Load cart and sync guest localstorage items upon login
  useEffect(() => {
    const fetchCart = async () => {
      if (user) {
        setLoading(true);
        try {
          const response = await api.get('/cart');
          let remoteCart = response.data;

          const guestCartJson = localStorage.getItem('guest_cart');
          if (guestCartJson) {
            const guestCart = JSON.parse(guestCartJson);
            if (guestCart && guestCart.length > 0) {
              for (const item of guestCart) {
                const addResponse = await api.post('/cart', {
                  productId: item.productId,
                  quantity: item.quantity
                });
                remoteCart = addResponse.data;
              }
              localStorage.removeItem('guest_cart');
            }
          }
          setCart(remoteCart);
        } catch (error) {
          console.error("Error fetching cart from server:", error);
        } finally {
          setLoading(false);
        }
      } else {
        const guestCartJson = localStorage.getItem('guest_cart');
        if (guestCartJson) {
          const guestItems = JSON.parse(guestCartJson);
          setCart({
            cartItems: guestItems,
            totalAmount: guestItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
          });
        } else {
          setCart({ cartItems: [], totalAmount: 0 });
        }
      }
    };

    fetchCart();
  }, [user]);

  const addToCart = async (product, quantity) => {
    if (user) {
      try {
        const response = await api.post('/cart', {
          productId: product.id,
          quantity: quantity
        });
        setCart(response.data);
      } catch (error) {
        throw error.response?.data?.message || 'Failed to add item to cart.';
      }
    } else {
      const guestCartJson = localStorage.getItem('guest_cart');
      let guestItems = guestCartJson ? JSON.parse(guestCartJson) : [];

      const existingItem = guestItems.find(item => item.productId === product.id);
      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.totalPrice = existingItem.quantity * product.price;
      } else {
        guestItems.push({
          id: -product.id,
          productId: product.id,
          productName: product.name,
          unitPrice: product.price,
          productImageUrl: product.imageUrl,
          quantity: quantity,
          totalPrice: quantity * product.price
        });
      }

      localStorage.setItem('guest_cart', JSON.stringify(guestItems));
      setCart({
        cartItems: guestItems,
        totalAmount: guestItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
      });
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (user) {
      try {
        const response = await api.put(`/cart/items/${productId}`, { quantity });
        setCart(response.data);
      } catch (error) {
        throw error.response?.data?.message || 'Failed to update quantity.';
      }
    } else {
      const guestCartJson = localStorage.getItem('guest_cart');
      if (guestCartJson) {
        let guestItems = JSON.parse(guestCartJson);
        const item = guestItems.find(i => i.productId === productId);
        if (item) {
          if (quantity <= 0) {
            guestItems = guestItems.filter(i => i.productId !== productId);
          } else {
            item.quantity = quantity;
            item.totalPrice = quantity * item.unitPrice;
          }

          localStorage.setItem('guest_cart', JSON.stringify(guestItems));
          setCart({
            cartItems: guestItems,
            totalAmount: guestItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
          });
        }
      }
    }
  };

  const removeFromCart = async (productId) => {
    if (user) {
      try {
        const response = await api.delete(`/cart/items/${productId}`);
        setCart(response.data);
      } catch (error) {
        throw error.response?.data?.message || 'Failed to remove item.';
      }
    } else {
      const guestCartJson = localStorage.getItem('guest_cart');
      if (guestCartJson) {
        let guestItems = JSON.parse(guestCartJson);
        guestItems = guestItems.filter(i => i.productId !== productId);

        localStorage.setItem('guest_cart', JSON.stringify(guestItems));
        setCart({
          cartItems: guestItems,
          totalAmount: guestItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
        });
      }
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        await api.delete('/cart');
        setCart({ cartItems: [], totalAmount: 0 });
      } catch (error) {
        console.error("Failed to clear cart:", error);
      }
    } else {
      localStorage.removeItem('guest_cart');
      setCart({ cartItems: [], totalAmount: 0 });
    }
  };

  return (
    <CartContext.Provider value={{ cart, cartCount, loading, bounce, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
