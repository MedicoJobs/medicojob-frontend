import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import {
  Briefcase, Clock, CheckCircle, Sparkles, Star, TrendingUp,
  Compass, ArrowRight, ClipboardList, Circle, Zap, AlertCircle, 
  ChevronRight, XCircle, MapPin, DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS_CONFIG = {
  applied:     { label: 'Under Review', color: 'text-blue-600 bg-blue-50 border-blue-100' },
  shortlisted: { label: 'Shortlisted', color: 'text-amber-600 bg-amber-50 border-amber-100' },
  rejected:    { label: 'Not Selected', color: 'text-red-600 bg-red-50 border-red-100' },
};

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appLoading, setAppLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recommended');

  useEffect(() => {
    if (user?.id) {
      fetchRecommendations();
      fetchMyApplications();
    }
  }, [user?.id]);

  const fetchRecommendations = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/match/jobs/${user.id}`);
      setRecommendedJobs(res.data.slice(0, 6));
    } catch (err) {
      console.error('Matching service error', err);
      const fallback = await axios.get(`${API_BASE_URL}/jobs?status=open`);
      setRecommendedJobs(fallback.data.slice(0, 6));
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/jobs/my-applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAppLoading(false);
    }
  };

  const stats = {
    total: myApplications.length,
    underReview: myApplications.filter(a => a.applicationStatus === 'applied').length,
    shortlisted: myApplications.filter(a => a.applicationStatus === 'shortlisted').length,
    rejected: myApplications.filter(a => a.applicationStatus === 'rejected').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in">
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Sparkles size={24} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Professional Portal</h1>
        </div>
        <p className="text-slate-500 font-bold text-lg">
          Welcome, <span className="text-emerald-600 font-black">{user?.name}</span>. Your career dashboard.
        </p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        <StatCard icon={<Briefcase size={20} />} label="Applications" value={stats.total} color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={<Clock size={20} />} label="Under Review" value={stats.underReview} color="text-slate-600" bg="bg-slate-50" />
        <StatCard icon={<Star size={20} />} label="Shortlisted" value={stats.shortlisted} color="text-amber-600" bg="bg-amber-50" />
        <StatCard icon={<XCircle size={20} />} label="Not Selected" value={stats.rejected} color="text-red-600" bg="bg-red-50" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-10 bg-slate-100 p-1.5 rounded-2xl w-fit">
        <TabButton active={activeTab === 'recommended'} onClick={() => setActiveTab('recommended')}>
          <Zap size={16} className={activeTab === 'recommended' ? 'text-amber-500' : ''} /> Smart Matches
        </TabButton>
        <TabButton active={activeTab === 'applications'} onClick={() => setActiveTab('applications')}>
          <ClipboardList size={16} /> My Applications
          {stats.total > 0 && (
            <span className="ml-1 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">{stats.total}</span>
          )}
        </TabButton>
      </div>

      {activeTab === 'recommended' && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <p className="text-slate-400 text-sm font-bold uppercase tracking-wide">
                Matches for: <span className="text-emerald-600">{user?.specialization || 'All Specializations'}</span>
              </p>
              <div className="h-4 w-[1px] bg-slate-200"></div>
              <p className="text-xs text-slate-400 font-bold italic">Match Engine Live</p>
            </div>
            <Link to="/jobs" className="flex items-center gap-2 text-emerald-600 font-black text-sm hover:gap-3 transition-all">
              See All <ArrowRight size={18} />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1,2,3].map(n => <div key={n} className="bg-white h-72 rounded-[2.5rem] animate-pulse border border-slate-100 shadow-sm"></div>)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recommendedJobs.map(job => (
                <div key={job._id} className="relative">
                  {job.matchScore >= 90 && (
                    <div className="absolute -top-3 -right-3 z-10 bg-amber-400 text-slate-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                      Top Match
                    </div>
                  )}
                  <JobCard job={job} />
                </div>
              ))}
              {recommendedJobs.length === 0 && (
                <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                  <p className="text-slate-400 font-black text-xl italic">No matches found. Update your profile for better results.</p>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {activeTab === 'applications' && (
        <section>
          {appLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-100 border-t-emerald-600"></div>
            </div>
          ) : myApplications.length > 0 ? (
            <div className="space-y-6">
              {myApplications.map(app => {
                const sc = STATUS_CONFIG[app.applicationStatus] || STATUS_CONFIG.applied;
                return (
                  <div key={app.jobId} className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/40 hover:border-emerald-100 transition-all">
                    <div className="p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-lg">{app.specialization}</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">{app.title}</h3>
                        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 font-bold">
                          <span className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-300" /> {app.location}</span>
                          <span className="flex items-center gap-1.5"><DollarSign size={14} className="text-slate-300" /> ₹{app.salary?.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3 shrink-0">
                        <span className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${sc.color}`}>
                          {sc.label}
                        </span>
                        <Link to={`/jobs/${app.jobId}`} className="text-xs font-black text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-1">
                          View Details <ChevronRight size={14} />
                        </Link>
                      </div>
                    </div>

                    {(app.applicationStatus === 'rejected' || app.applicationStatus === 'shortlisted') && (
                      <div className={`px-8 py-6 border-t ${app.applicationStatus === 'rejected' ? 'bg-red-50/30 border-red-100/50' : 'bg-amber-50/30 border-amber-100/50'}`}>
                         <div className="flex items-start gap-4">
                           <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${app.applicationStatus === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                              {app.applicationStatus === 'rejected' ? <AlertCircle size={16} /> : <Zap size={16} />}
                           </div>
                           <div>
                             <h4 className={`text-[10px] font-black uppercase tracking-widest mb-1 ${app.applicationStatus === 'rejected' ? 'text-red-500' : 'text-amber-600'}`}>
                               {app.applicationStatus === 'rejected' ? 'Rejection Reason' : 'Next Steps to Follow'}
                             </h4>
                             <p className="text-sm font-bold text-slate-700 italic">
                               "{app.applicationStatus === 'rejected' ? (app.rejectionReason || 'No reason provided.') : (app.nextStep || 'Next steps will be updated soon.')}"
                             </p>
                           </div>
                         </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
              <ClipboardList size={40} className="text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-black text-slate-700 mb-2">No Applications Yet</h3>
              <p className="text-slate-400 font-medium mb-6">Start exploring opportunities and apply to your first job.</p>
              <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, color, bg }) => (
  <div className="card p-6 bg-white flex flex-col justify-between">
    <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center mb-4`}>{icon}</div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-black text-slate-900">{String(value).padStart(2, '0')}</h3>
    </div>
  </div>
);

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
      active ? 'bg-white text-slate-900 shadow-md border border-slate-100' : 'text-slate-400 hover:text-slate-600'
    }`}
  >
    {children}
  </button>
);

export default DoctorDashboard;
