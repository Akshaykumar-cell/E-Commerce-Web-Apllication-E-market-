import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { Lock, Mail, RefreshCw, KeyRound, UserPlus } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err) {
      setErrorMsg(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="glass-card p-8 rounded-3xl w-full max-w-md border border-slate-900 shadow-2xl space-y-6 text-left">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mx-auto text-purple-400">
            <KeyRound size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Welcome Back</h2>
          <p className="text-xs text-slate-500">Sign in to track orders and checkout faster</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-purple-500 text-slate-200 placeholder-slate-650"
                required
              />
              <Lock size={16} className="absolute left-3.5 top-3 text-slate-550" />
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
            className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-1.5"
          >
            {submitting ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-slate-550 border-t border-slate-900/60 pt-4 flex justify-between items-center">
          <span>New to E-Market?</span>
          <Link to="/register" className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1">
            <UserPlus size={14} />
            <span>Create Account</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
