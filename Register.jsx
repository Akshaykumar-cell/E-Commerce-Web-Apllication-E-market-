import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { Lock, Mail, User, MapPin, RefreshCw, KeyRound } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      await register({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        address: address.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        country: country.trim()
      });
      navigate('/');
    } catch (err) {
      setErrorMsg(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="glass-card p-8 rounded-3xl w-full max-w-lg border border-slate-900 shadow-2xl space-y-6 text-left">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mx-auto text-purple-400">
            <KeyRound size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Create Account</h2>
          <p className="text-xs text-slate-500">Register as a customer to browse and purchase items</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Identity Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold block">First Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-purple-500 text-slate-200 placeholder-slate-650"
                  required
                />
                <User size={16} className="absolute left-3.5 top-3 text-slate-550" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold block">Last Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-purple-500 text-slate-200 placeholder-slate-650"
                  required
                />
                <User size={16} className="absolute left-3.5 top-3 text-slate-550" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold block">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-purple-500 text-slate-200 placeholder-slate-650"
                  required
                />
                <Mail size={16} className="absolute left-3.5 top-3 text-slate-550" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold block">Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-purple-500 text-slate-200 placeholder-slate-650"
                  required
                />
                <Lock size={16} className="absolute left-3.5 top-3 text-slate-550" />
              </div>
            </div>
          </div>

          {/* Shipping Profile Section */}
          <div className="border-t border-slate-900/60 pt-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <MapPin size={12} />
              <span>Default Shipping Address</span>
            </h3>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold block">Street Address</label>
              <input
                type="text"
                placeholder="123 Main St, Apt 4"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-purple-500 text-slate-200 placeholder-slate-650"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold block">City</label>
                <input
                  type="text"
                  placeholder="New York"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-purple-500 text-slate-200 placeholder-slate-650"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold block">Postal Code</label>
                <input
                  type="text"
                  placeholder="10001"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-purple-500 text-slate-200 placeholder-slate-650"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold block">Country</label>
                <input
                  type="text"
                  placeholder="United States"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-purple-500 text-slate-200 placeholder-slate-650"
                  required
                />
              </div>
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 font-semibold text-center leading-normal">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-1.5"
          >
            {submitting ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-slate-550 border-t border-slate-900/60 pt-4 flex justify-between items-center">
          <span>Already registered?</span>
          <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold">
            Sign In Instead
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
