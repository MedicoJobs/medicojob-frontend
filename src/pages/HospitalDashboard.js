import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { 
  PlusCircle, Activity, Users, Settings, ArrowUpRight, 
  CheckCircle, Clock, FileText, Trash2, AlertCircle 
} from 'lucide-react';

const HospitalDashboard = () => {
  const { user } = useContext(AuthContext);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchMyJobs();
  }, [user.id]);

  const fetchMyJobs = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/jobs?status=all`);
      const filtered = res.data.filter(job => job.hospitalId === user.id);
      setMyJobs(filtered);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching jobs', err);
      setLoading(false);
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) return;
    
    setDeletingId(id);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyJobs(myJobs.filter(job => job._id !== id));
      alert('Job deleted successfully');
    } catch (err) {
      console.error('Error deleting job', err);
      alert('Failed to delete job');
    } finally {
      setDeletingId(null);
    }
  };

  const totalApplicants = myJobs.reduce((acc, job) => acc + (job.applications?.length || 0), 0);
  const openJobs = myJobs.filter((job) => job.status === 'open').length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Hospital Command Center</h1>
          <p className="text-slate-500 font-bold flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Welcome back, {user.name}
          </p>
        </div>
        <Link 
          to="/hospital/post-job" 
          className="btn-primary flex items-center gap-3 py-4 px-8 shadow-emerald-100"
        >
          <PlusCircle size={22} />
          Create New Job Posting
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="card p-8 bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Activity size={28} />
            </div>
            <ArrowUpRight size={20} className="text-slate-300" />
          </div>
          <p className="text-sm text-slate-500 font-black uppercase tracking-widest mb-1">Active Positions</p>
          <h3 className="text-4xl font-black text-slate-900">{openJobs}</h3>
        </div>
        
        <div className="card p-8 bg-gradient-to-br from-white to-blue-50/30">
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
              <Users size={28} />
            </div>
            <ArrowUpRight size={20} className="text-slate-300" />
          </div>
          <p className="text-sm text-slate-500 font-black uppercase tracking-widest mb-1">Total Applications</p>
          <h3 className="text-4xl font-black text-slate-900">{totalApplicants}</h3>
        </div>

        <div className="card p-8 bg-slate-900 text-white border-none shadow-xl shadow-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400">
              <CheckCircle size={28} />
            </div>
            <div className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
              Verified
            </div>
          </div>
          <p className="text-white/60 text-sm font-black uppercase tracking-widest mb-1">License Status</p>
          <h3 className="text-2xl font-black tracking-tight italic">Compliant & Active</h3>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
              <FileText size={20} className="text-slate-600" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Manage Job Inventory</h2>
          </div>
          <div className="flex gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400"></span>
            <span className="w-3 h-3 rounded-full bg-amber-400"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
          </div>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-100 border-t-emerald-600"></div>
            <p className="text-slate-400 font-bold text-sm">Syncing Database...</p>
          </div>
        ) : myJobs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-8 py-5">Position Details</th>
                  <th className="px-8 py-5">Classification</th>
                  <th className="px-8 py-5">Market Status</th>
                  <th className="px-8 py-5">Interest</th>
                  <th className="px-8 py-5 text-right">Engagement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myJobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div>
                        <p className="font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{job.title}</p>
                        <p className="text-xs text-slate-400 font-bold mt-0.5">{job.specialization}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-xs font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-lg uppercase">
                         {job.type}
                       </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${job.status === 'open' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></div>
                        <span className={`text-xs font-black uppercase ${job.status === 'open' ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {job.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-slate-900 font-black text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-[10px]">
                          {job.applications?.length || 0}
                        </div>
                        <span className="text-slate-400 text-xs font-bold uppercase">Applicants</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Link 
                          to={`/hospital/jobs/${job._id}/applications`}
                          className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 text-slate-600 font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm"
                        >
                          Review Queue
                          <ArrowUpRight size={14} />
                        </Link>
                        <button
                          onClick={() => handleDeleteJob(job._id)}
                          disabled={deletingId === job._id}
                          className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-100"
                          title="Delete Job Posting"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <PlusCircle size={32} className="text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">No Active Postings</h3>
            <p className="text-slate-500 font-bold mb-8">Ready to grow your medical team?</p>
            <Link to="/hospital/post-job" className="btn-primary">Get Started</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalDashboard;
