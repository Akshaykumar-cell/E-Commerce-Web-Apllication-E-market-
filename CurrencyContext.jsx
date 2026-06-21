import React, { createContext, useContext, useState } from 'react';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('emarket_currency') || 'INR';
  });

  const rate = 83.0; // 1 USD = 83 INR
  const symbol = currency === 'INR' ? '₹' : '$';

  const setCurrency = (curr) => {
    setCurrencyState(curr);
    localStorage.setItem('emarket_currency', curr);
  };

  const formatPrice = (usdPrice) => {
    if (usdPrice === undefined || usdPrice === null) return '';
    const numPrice = typeof usdPrice === 'string' ? parseFloat(usdPrice) : usdPrice;
    if (isNaN(numPrice)) return '';
    
    if (currency === 'INR') {
      const inrPrice = numPrice * rate;
      return `₹${inrPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${numPrice.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, symbol, rate, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
