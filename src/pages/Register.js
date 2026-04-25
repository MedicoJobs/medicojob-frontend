import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';
import { Activity, User, Mail, Lock, Stethoscope, Building, Eye, EyeOff, CheckCircle, ShieldCheck } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'applicant', specialization: '', licenseNumber: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, formData);
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isHospital = formData.role === 'hospital';

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-900">
      {/* Left side - Branding / Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden p-16 flex-col justify-between">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2653&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-transparent"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="bg-emerald-500 p-2.5 rounded-2xl shadow-lg shadow-emerald-500/20">
              <Stethoscope size={28} className="text-white" />
            </div>
            <span className="text-3xl font-black text-white tracking-tighter">MedicoJob</span>
          </div>
          
          <h1 className="text-5xl font-black text-white leading-tight tracking-tight mb-6">
            Join the global <br /> 
            <span className="text-emerald-400">Healthcare Network.</span>
          </h1>
          <p className="text-xl text-slate-300 font-medium max-w-md leading-relaxed">
            Connect with top-tier medical facilities or find the talent that drives clinical excellence.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <h4 className="text-emerald-400 font-black text-3xl">15k+</h4>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Verified Professionals</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-emerald-400 font-black text-3xl">800+</h4>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Hospital Partners</p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 py-12 overflow-y-auto">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-10">
            <h2 className="text-4xl font-black tracking-tight mb-3">Get Started</h2>
            <p className="text-slate-500 font-bold">Choose your path and create your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Switcher */}
            <div className="flex p-1.5 bg-slate-100 rounded-[1.5rem] mb-8">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'applicant' })}
                className={`flex-1 flex items-center justify-center gap-3 py-3.5 rounded-[1.25rem] font-black text-sm transition-all ${
                  formData.role === 'applicant' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <User size={18} /> Medical Professional
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'hospital' })}
                className={`flex-1 flex items-center justify-center gap-3 py-3.5 rounded-[1.25rem] font-black text-sm transition-all ${
                  formData.role === 'hospital' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Building size={18} /> Health Facility
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 border border-red-100 animate-shake">
                <Activity size={18} /> {error}
              </div>
            )}

            <div className="space-y-4">
              <InputGroup 
                label={isHospital ? "Hospital Name" : "Full Name"} 
                icon={<User size={18} />}
                type="text" name="name" value={formData.name} onChange={handleChange} required
                placeholder={isHospital ? "Global Health City" : "Dr. Arjun Sharma"}
              />

              <InputGroup 
                label="Email Address" 
                icon={<Mail size={18} />}
                type="email" name="email" value={formData.email} onChange={handleChange} required
                placeholder="name@example.com"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputGroup 
                  label="Password" 
                  icon={<Lock size={18} />}
                  type={showPassword ? "text" : "password"} 
                  name="password" value={formData.password} onChange={handleChange} required
                  placeholder="••••••••"
                  toggleIcon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  onToggle={() => setShowPassword(!showPassword)}
                />
                <InputGroup 
                  label="Confirm" 
                  icon={<Lock size={18} />}
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                  placeholder="••••••••"
                  toggleIcon={showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              </div>

              {!isHospital && (
                <InputGroup 
                  label="Primary Specialization" 
                  icon={<Stethoscope size={18} />}
                  type="text" name="specialization" value={formData.specialization} onChange={handleChange} required
                  placeholder="e.g. Critical Care, Staff Nurse"
                />
              )}

              <InputGroup 
                label={isHospital ? "Medical License Number" : "License Number (Optional)"} 
                icon={<ShieldCheck size={18} />}
                type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} 
                required={isHospital}
                placeholder="REG-9988-ABC"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-5 text-lg font-black tracking-tight flex items-center justify-center gap-3 shadow-emerald-200 mt-4"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Create Professional Profile <CheckCircle size={20} /></>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-slate-500 font-bold">
            Already have an account? <Link to="/login" className="text-emerald-600 font-black hover:underline">Log In Here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const InputGroup = ({ label, icon, toggleIcon, onToggle, ...props }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
        {icon}
      </div>
      <input
        {...props}
        className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl pl-12 pr-12 py-3.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500/20 transition-all"
      />
      {toggleIcon && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-emerald-500 transition-colors"
        >
          {toggleIcon}
        </button>
      )}
    </div>
  </div>
);

export default Register;
