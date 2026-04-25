import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { MapPin, DollarSign, Calendar, Building2, Briefcase, ArrowLeft, ShieldCheck, Clock, Share2, Heart, CheckCircle } from 'lucide-react';
import { isWishlisted, toggleWishlist } from '../utils/wishlist';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/jobs/${id}`);
        setJob(res.data);
        setSaved(isWishlisted(user?.id, res.data._id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, user?.id]);

  const handleWishlistToggle = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const nextWishlist = toggleWishlist(user.id, job);
    const nextSaved = nextWishlist.some((item) => item._id === job._id);
    setSaved(nextSaved);
    setMessage({
      text: nextSaved ? 'Job saved to your wishlist.' : 'Job removed from your wishlist.',
      type: 'success',
    });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'hospital') {
      setMessage({ text: 'Hospital accounts can post jobs but cannot apply to them.', type: 'error' });
      return;
    }

    setApplying(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/jobs/${id}/apply`, {
        name: user.name,
        email: user.email,
        specialization: user.specialization,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ text: 'Success! Your application has been sent.', type: 'success' });
      // Refresh job data to reflect new application
      const res = await axios.get(`${API_BASE_URL}/jobs/${id}`);
      setJob(res.data);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Application failed. Please try again.', type: 'error' });
    } finally {
      setApplying(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-100 border-t-emerald-600"></div>
          <p className="text-slate-500 font-bold animate-pulse">Loading Opportunity...</p>
        </div>
      </div>
    );
  }

  if (!job) return <div className="text-center py-20 text-xl font-black text-slate-400">Opportunity not found</div>;

  const myApplication = user && job.applications?.find((app) => app.doctorId === user.id);
  const hasApplied = Boolean(myApplication);
  const applicationStatusLabel = myApplication?.status
    ? `${myApplication.status.charAt(0).toUpperCase()}${myApplication.status.slice(1)}`
    : '';

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-fade-in">
      <div className="flex items-center justify-between mb-10">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold transition-all hover:-translate-x-1"
        >
          <ArrowLeft size={20} />
          Back to Listings
        </button>
        <div className="flex gap-4">
          <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-emerald-500 hover:border-emerald-100 transition-all shadow-sm">
            <Share2 size={20} />
          </button>
          <button
            onClick={handleWishlistToggle}
            className={`p-3 bg-white border rounded-2xl transition-all shadow-sm ${
              saved
                ? 'border-red-100 text-red-500 bg-red-50'
                : 'border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100'
            }`}
            title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
            {job.type === 'emergency' && (
              <div className="absolute top-0 right-0 bg-red-500 text-white px-6 py-2 font-black text-xs uppercase tracking-widest rounded-bl-3xl shadow-lg">
                Urgent Requirement
              </div>
            )}
            
            <header className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-emerald-50 text-emerald-600 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
                  {job.specialization}
                </span>
                <span className="bg-blue-50 text-blue-600 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
                  {job.type}
                </span>
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3 text-slate-600 font-bold">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <Building2 size={20} />
                  </div>
                  <span>Healthcare Provider Network</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 font-bold">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-emerald-500">
                    <MapPin size={20} />
                  </div>
                  <span>{job.location}</span>
                </div>
              </div>
            </header>

            <div className="prose prose-slate max-w-none">
              <h3 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
                <ShieldCheck className="text-emerald-500" />
                Job Description
              </h3>
              <div className="text-slate-600 leading-relaxed text-lg font-medium mb-10 whitespace-pre-wrap">
                {job.description || `We are looking for a dedicated ${job.specialization} specialist to join our team at ${job.location}. The ideal candidate should have a strong background in healthcare and a commitment to excellence in patient care.`}
              </div>
              
              {job.requirements && (
                <>
                  <h3 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
                    <CheckCircle className="text-emerald-500" />
                    Requirements
                  </h3>
                  <div className="text-slate-600 leading-relaxed text-lg font-medium mb-10 whitespace-pre-wrap">
                    {job.requirements}
                  </div>
                </>
              )}

              {/* Static professional perks section to add premium feel */}
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 mt-10">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Why Join Us?</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <PerkItem title="State-of-the-Art Facilities" description="Work with the latest medical technology." />
                  <PerkItem title="Competitive Benefits" description="Premium healthcare and retirement plans." />
                  <PerkItem title="Career Growth" description="Dedicated budget for CME and professional training." />
                  <PerkItem title="Work-Life Balance" description="Flexible scheduling and collaborative team environment." />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-28">
            <div className="mb-8">
              <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-2">Annual Compensation</p>
              <div className="flex items-center gap-2">
                <span className="text-4xl font-black text-slate-900">₹{job.salary.toLocaleString()}</span>
                <span className="text-slate-400 font-bold">/ year</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                  <Clock size={18} />
                  <span>Job Type</span>
                </div>
                <span className="font-black text-slate-900 capitalize">{job.type}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                  <Calendar size={18} />
                  <span>Deadline</span>
                </div>
                <span className="font-black text-slate-900">{new Date(job.expiryDate).toLocaleDateString()}</span>
              </div>
            </div>

            {message.text && (
              <div className={`p-4 rounded-2xl mb-6 font-bold text-sm animate-fade-in ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
              }`}>
                {message.text}
              </div>
            )}

            {hasApplied && (
              <div className="p-4 rounded-2xl mb-6 bg-blue-50 text-blue-700 font-bold text-sm">
                Application Status: {applicationStatusLabel}
              </div>
            )}

            <button 
              onClick={handleApply}
              disabled={applying || hasApplied || user?.role === 'hospital'}
              className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95 ${
                hasApplied 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'btn-primary shadow-emerald-200 hover:shadow-emerald-300'
              }`}
            >
              {applying ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending...
                </div>
              ) : hasApplied ? `Applied: ${applicationStatusLabel}` : 'Submit Application'}
            </button>
            
            {user?.role === 'hospital' && (
              <p className="text-center text-[10px] text-amber-500 mt-4 uppercase font-black tracking-widest">
                Hospital accounts cannot apply
              </p>
            )}
            
            <p className="text-center text-[10px] text-slate-400 mt-4 uppercase font-black tracking-widest">
              Secured with End-to-End Encryption
            </p>
          </div>

          <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-200/50">
             <div className="relative z-10">
               <h4 className="text-xl font-black mb-3">Verification Badge</h4>
               <p className="text-emerald-100 text-sm font-bold leading-relaxed mb-6">
                 All facilities on MedicoJob undergo a multi-step verification process to ensure clinical standards.
               </p>
               <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                 <ShieldCheck size={24} />
               </div>
             </div>
             <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PerkItem = ({ title, description }) => (
  <div className="flex gap-4">
    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0"></div>
    <div>
      <p className="font-black text-slate-900 text-sm mb-1">{title}</p>
      <p className="text-slate-500 text-xs font-bold leading-relaxed">{description}</p>
    </div>
  </div>
);

export default JobDetails;
