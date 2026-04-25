import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { Stethoscope, Mail, Lock, ArrowRight, ShieldCheck, Zap, Eye, EyeOff, XCircle } from 'lucide-react';

const demoAccounts = [
  { label: 'Applicant Demo', email: 'applicant@medicojob.com', password: 'Demo123!' },
  { label: 'Hospital Demo', email: 'hospital@medicojob.com', password: 'Demo123!' },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const useDemoAccount = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      login(res.data.user, res.data.token);
      if (res.data.user.role === 'hospital') navigate('/hospital/dashboard');
      else navigate('/doctor/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Left side - Visual Content */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-slate-900">
        <img 
          src="/assets/login-bg.png" 
          alt="Medical Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        
        <div className="relative z-10 p-20 flex flex-col justify-end h-full max-w-2xl">
          <div className="bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 p-4 rounded-2xl w-fit mb-8">
            <Zap className="text-emerald-400" size={32} />
          </div>
          <h1 className="text-6xl font-black text-white leading-[1.1] mb-8 tracking-tighter">
            Elevating Healthcare <br />
            <span className="text-emerald-400 italic">Opportunities.</span>
          </h1>
          <p className="text-xl text-slate-300 font-medium leading-relaxed mb-12">
            The world's most sophisticated marketplace for medical professionals and healthcare institutions.
          </p>
          
          <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-12">
            <div>
              <p className="text-white font-black text-3xl mb-1">10k+</p>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Active Doctors</p>
            </div>
            <div>
              <p className="text-white font-black text-3xl mb-1">450+</p>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Partner Hospitals</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center p-8 sm:p-20 bg-white">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-16">
            <div className="bg-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-200">
              <Stethoscope size={28} className="text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900">MedicoJob</span>
          </div>

          <div className="mb-12">
            <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">System Login</h2>
            <p className="text-slate-400 font-bold">Please authenticate to access your portal</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-8 flex items-center gap-3 animate-fade-in">
              <XCircle size={20} className="shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Demo Access</p>
              <p className="text-sm font-medium text-slate-600">Use one of the seeded accounts below.</p>
            </div>
            <div className="space-y-3">
              {demoAccounts.map((account) => (
                <div key={account.email} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm">
                    <p className="font-black text-slate-900">{account.label}</p>
                    <p className="text-slate-500">{account.email}</p>
                    <p className="text-slate-500">{account.password}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => useDemoAccount(account)}
                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700 transition-colors hover:bg-emerald-100"
                  >
                    Use Demo
                  </button>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-emerald-500 transition-colors">
                  <Mail size={20} className="text-slate-300" />
                </div>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-12 py-4"
                  placeholder="name@medicalcenter.com"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Secret Access Key</label>
                <Link to="#" className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700">Forgot?</Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-emerald-500 transition-colors">
                  <Lock size={20} className="text-slate-300" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-emerald-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-12 pr-12 py-4"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary py-5 text-lg flex items-center justify-center gap-3 shadow-emerald-200"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Establish Connection
                  <ArrowRight size={22} />
                </>
              )}
            </button>
          </form>

          <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 font-bold text-sm">
              New to the platform? <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-black">Request Access</Link>
            </p>
            <div className="flex items-center gap-2 text-slate-300">
               <ShieldCheck size={16} />
               <span className="text-[10px] font-black uppercase tracking-widest">SSL Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Removed redundant XCircle component

export default Login;
