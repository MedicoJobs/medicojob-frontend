import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { 
  User, Mail, Phone, MapPin, Briefcase, Award, 
  Save, Edit3, X, CheckCircle, ShieldCheck, Clock, Zap
} from 'lucide-react';

const Profile = () => {
  const { user, login } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [availability, setAvailability] = useState({ status: 'active' });
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    specialization: user?.specialization || '',
    experience: user?.experience || 0,
    bio: user?.bio || '',
    skills: user?.skills?.join(', ') || '',
    preferredLocations: user?.preferredLocations?.join(', ') || '',
    licenseNumber: user?.licenseNumber || ''
  });

  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchAvailability();
  }, [user.id]);

  const fetchAvailability = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/availability/${user.id}`);
      setAvailability(res.data);
    } catch (err) {
      console.log('No availability data yet');
    }
  };

  const toggleAvailability = async () => {
    setStatusLoading(true);
    const nextStatus = availability.status === 'active' ? 'away' : 'active';
    try {
      const res = await axios.post(`${API_BASE_URL}/availability`, {
        userId: user.id,
        status: nextStatus
      });
      setAvailability(res.data);
      setMessage({ text: `Status updated to ${nextStatus.toUpperCase()}`, type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: 'Failed to update status', type: 'error' });
    } finally {
      setStatusLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const updatedData = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        preferredLocations: formData.preferredLocations.split(',').map(l => l.trim()).filter(l => l)
      };

      const res = await axios.put(`${API_BASE_URL}/auth/profile`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update context which will also update localStorage
      login(res.data, token);
      
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setIsEditing(false);
    } catch (err) {
      setMessage({ text: 'Error updating profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-10">
        
        {/* Sidebar */}
        <div className="md:w-1/3 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-emerald-600 to-teal-700"></div>
            <div className="relative z-10 pt-4">
              <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-lg mx-auto mb-4">
                <div className="w-full h-full rounded-[1.25rem] bg-slate-100 flex items-center justify-center text-slate-400">
                  <User size={40} />
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900">{user.name}</h2>
              <p className="text-emerald-600 font-bold mb-6 capitalize">{user.role}</p>

              {/* INTEGRATION: Availability Service (Port 5004) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Availability</p>
                  <span className="text-[8px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded uppercase">Port 5004</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${availability.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                    <span className="font-black text-slate-900 text-sm capitalize">{availability.status}</span>
                  </div>
                  <button 
                    onClick={toggleAvailability}
                    disabled={statusLoading}
                    className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-emerald-600"
                  >
                    {statusLoading ? <Clock size={16} className="animate-spin" /> : <Zap size={16} />}
                  </button>
                </div>
              </div>

              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                >
                  <Edit3 size={18} /> Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-200/50">
             <div className="relative z-10">
               <div className="flex items-center gap-2 mb-4">
                 <ShieldCheck size={20} />
                 <h4 className="text-lg font-black">Verified Member</h4>
               </div>
               <p className="text-emerald-100 text-xs font-bold leading-relaxed">
                 Your profile is currently under review by our medical board to ensure clinical standards.
               </p>
             </div>
             <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
            {message.text && (
              <div className={`p-4 rounded-2xl mb-8 font-bold text-sm flex items-center gap-3 animate-fade-in ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
              }`}>
                {message.type === 'success' ? <CheckCircle size={18} /> : <X size={18} />}
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputGroup label="Full Name" name="name" icon={<User size={18} />} value={formData.name} onChange={handleChange} disabled={!isEditing} />
                <InputGroup label="Email Address" name="email" icon={<Mail size={18} />} value={formData.email} onChange={handleChange} disabled={!isEditing} />
                <InputGroup label="Phone Number" name="phone" icon={<Phone size={18} />} value={formData.phone} onChange={handleChange} disabled={!isEditing} />
                <InputGroup label="Specialization" name="specialization" icon={<Briefcase size={18} />} value={formData.specialization} onChange={handleChange} disabled={!isEditing} />
                <InputGroup label="Years of Experience" name="experience" icon={<Clock size={18} />} type="number" value={formData.experience} onChange={handleChange} disabled={!isEditing} />
                <InputGroup label="License Number" name="licenseNumber" icon={<Award size={18} />} value={formData.licenseNumber} onChange={handleChange} disabled={!isEditing} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional Bio</label>
                <textarea 
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows="4"
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-3xl p-6 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-emerald-500/20 transition-all disabled:opacity-70"
                  placeholder="Tell us about your medical background and career goals..."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputGroup label="Skills (Comma separated)" name="skills" icon={<Zap size={18} />} value={formData.skills} onChange={handleChange} disabled={!isEditing} placeholder="Surgery, Emergency, ICU..." />
                <InputGroup label="Preferred Locations" name="preferredLocations" icon={<MapPin size={18} />} value={formData.preferredLocations} onChange={handleChange} disabled={!isEditing} placeholder="Mumbai, Pune, Delhi..." />
              </div>

              {isEditing && (
                <div className="flex gap-4 pt-6">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex-grow py-4 btn-primary flex items-center justify-center gap-2"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Save size={18} /> Save Changes</>}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)}
                    className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputGroup = ({ label, icon, ...props }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-emerald-500 transition-colors">
        {icon}
      </div>
      <input 
        {...props}
        className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl pl-12 pr-6 py-4 text-sm font-black text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-emerald-500/20 transition-all disabled:opacity-70"
      />
    </div>
  </div>
);

export default Profile;
