import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { 
  PlusCircle, Activity, Users, ArrowUpRight,
  CheckCircle, FileText, Trash2, Video, Sparkles, Search, BadgeCheck, BarChart3, CalendarDays, ArrowRight
} from 'lucide-react';

const HospitalDashboard = () => {
  const { user } = useContext(AuthContext);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [copilotQuery, setCopilotQuery] = useState('Show me top cardiologists with 10+ years experience');
  const [copilotResult, setCopilotResult] = useState(null);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotError, setCopilotError] = useState('');

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
    if (!globalThis.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) return;
    
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

  const runRecruiterCopilot = async (event) => {
    event.preventDefault();
    if (!copilotQuery.trim()) return;

    setCopilotLoading(true);
    setCopilotError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE_URL}/api/resume/copilot/search`,
        { query: copilotQuery.trim(), limit: 5 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCopilotResult(res.data);
    } catch (err) {
      console.error('Recruiter copilot failed', err);
      setCopilotError('Copilot could not search candidates right now.');
    } finally {
      setCopilotLoading(false);
    }
  };

  const totalApplicants = myJobs.reduce((acc, job) => acc + (job.applications?.length || 0), 0);
  const openJobs = myJobs.filter((job) => job.status === 'open').length;
  const allApplications = myJobs.flatMap((job) => job.applications || []);
  const atsStages = [
    { key: 'applied', label: 'Applied' },
    { key: 'screening', label: 'Screening' },
    { key: 'shortlisted', label: 'Shortlisted' },
    { key: 'interview', label: 'Interview' },
    { key: 'offer', label: 'Offer' },
    { key: 'joined', label: 'Joined' },
    { key: 'rejected', label: 'Rejected' },
  ];
  const atsCounts = {
    applied: allApplications.filter((app) => app.status === 'applied').length,
    screening: allApplications.filter((app) => app.status === 'screening').length,
    shortlisted: allApplications.filter((app) => app.status === 'shortlisted').length,
    interview: allApplications.filter((app) => ['interview_scheduled', 'interview_completed'].includes(app.status)).length,
    offer: allApplications.filter((app) => app.status === 'offer').length,
    joined: allApplications.filter((app) => ['joined', 'hired'].includes(app.status)).length,
    rejected: allApplications.filter((app) => app.status === 'rejected').length,
  };
  const scheduledInterviews = myJobs
    .flatMap((job) => (job.applications || []).map((application) => ({ job, application })))
    .filter(({ application }) => application.status === 'interview_scheduled' && application.interview?.scheduledAt && !application.interview?.expiredAt)
    .sort((a, b) => new Date(a.application.interview.scheduledAt) - new Date(b.application.interview.scheduledAt));

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
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            to="/hospital/course-upload" 
            className="flex items-center gap-3 py-4 px-8 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 transition-colors shadow-sm"
          >
            <Video size={22} />
            Upload Course
          </Link>
          <Link 
            to="/hospital/post-job" 
            className="btn-primary flex items-center gap-3 py-4 px-8 shadow-emerald-100"
          >
            <PlusCircle size={22} />
            Create New Job Posting
          </Link>
        </div>
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

      <section className="mb-12 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/60">
          <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Applicant Tracking System</p>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Hiring pipeline</h2>
        </div>
        <div className="p-8 overflow-x-auto">
          <div className="flex items-stretch min-w-max">
            {atsStages.map((stage, index) => (
              <React.Fragment key={stage.key}>
                <div className="w-40 border border-slate-100 rounded-2xl p-5 bg-slate-50">
                  <p className="text-4xl font-black text-slate-900">{atsCounts[stage.key]}</p>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">{stage.label}</p>
                </div>
                {index < atsStages.length - 1 && (
                  <div className="flex items-center px-3 text-slate-300"><ArrowRight size={20} /></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-12 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/60">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Sparkles size={24} />
              </div>
              <div>
                <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Recruiter Copilot Agent</p>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">AI candidate search</h2>
              </div>
            </div>
            <form onSubmit={runRecruiterCopilot} className="flex flex-col sm:flex-row gap-3 w-full lg:max-w-2xl">
              <input
                value={copilotQuery}
                onChange={(event) => setCopilotQuery(event.target.value)}
                className="flex-1 px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                placeholder="Show me top cardiologists with 10+ years experience"
              />
              <button
                type="submit"
                disabled={copilotLoading}
                className="btn-primary flex items-center justify-center gap-2 px-6 py-3 disabled:opacity-60"
              >
                <Search size={18} />
                {copilotLoading ? 'Searching' : 'Search'}
              </button>
            </form>
          </div>
          {copilotError && <p className="mt-4 text-sm font-bold text-red-600">{copilotError}</p>}
        </div>

        {copilotResult && (
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="border border-slate-100 rounded-2xl p-5">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Found</p>
                <p className="text-3xl font-black text-slate-900">{copilotResult.total_candidates}</p>
              </div>
              <div className="border border-slate-100 rounded-2xl p-5">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Best Match</p>
                <p className="text-3xl font-black text-emerald-600">{copilotResult.best_match_score}%</p>
              </div>
              <div className="border border-slate-100 rounded-2xl p-5">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Intent</p>
                <p className="text-sm font-black text-slate-800">
                  {[copilotResult.intent.specialization, copilotResult.intent.min_experience_years ? `${copilotResult.intent.min_experience_years}+ yrs` : null].filter(Boolean).join(' · ') || 'Broad search'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <BadgeCheck size={20} className="text-emerald-600" />
                  <h3 className="text-lg font-black text-slate-900">Top candidates</h3>
                </div>
                <div className="space-y-3">
                  {copilotResult.top_candidates.map((candidate, index) => (
                    <div key={candidate.id} className="border border-slate-100 rounded-2xl p-5 hover:border-emerald-200 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">#{index + 1}</p>
                          <h4 className="text-xl font-black text-slate-900">{candidate.name}</h4>
                          <p className="text-sm text-slate-500 font-bold">
                            {candidate.specialization || 'Healthcare'} · {candidate.experience_years ?? 'N/A'} yrs · {candidate.location || 'Location N/A'}
                          </p>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-2xl font-black text-emerald-600">{candidate.match_score}%</p>
                          <p className="text-xs font-black text-slate-400 uppercase">{candidate.shortlist_recommendation}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {candidate.match_reasons.map((reason) => (
                          <span key={reason} className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">{reason}</span>
                        ))}
                      </div>
                      <Link
                        to={`/hospital/candidates/${candidate.id}`}
                        className="inline-flex items-center gap-2 mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all"
                      >
                        Open Profile
                        <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  ))}
                  {copilotResult.top_candidates.length === 0 && (
                    <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-500 font-bold">
                      No candidates matched this search.
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 size={20} className="text-blue-600" />
                  <h3 className="text-lg font-black text-slate-900">Hiring insights</h3>
                </div>
                <div className="space-y-4">
                  {copilotResult.shortlist_suggestions.map((suggestion) => (
                    <div key={suggestion} className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-sm font-bold text-emerald-900">
                      {suggestion}
                    </div>
                  ))}
                  {copilotResult.hiring_insights.map((insight) => (
                    <div key={insight} className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm font-bold text-blue-900">
                      {insight}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="mb-12 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <CalendarDays size={24} />
            </div>
            <div>
              <p className="text-xs font-black text-purple-600 uppercase tracking-widest">Interview Calendar</p>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Scheduled interviews</h2>
            </div>
          </div>
          <span className="text-xs font-black text-slate-500 bg-white border border-slate-200 rounded-xl px-4 py-2">
            {scheduledInterviews.length} upcoming
          </span>
        </div>

        <div className="p-8">
          {scheduledInterviews.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {scheduledInterviews.map(({ job, application }) => (
                <div key={`${job._id}-${application.doctorId}`} className="border border-slate-100 rounded-2xl p-5 bg-white hover:border-purple-200 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{job.title}</p>
                      <h3 className="text-lg font-black text-slate-900">{application.applicantName || 'Applicant'}</h3>
                      <p className="text-sm font-bold text-slate-500">{job.specialization}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm font-black text-purple-700">{new Date(application.interview.scheduledAt).toLocaleString()}</p>
                      <p className="text-xs font-bold text-slate-400">{application.interview.durationMinutes || 30} minutes</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {application.interview.meetLink && !application.interview.expiredAt && (
                      <a href={application.interview.meetLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-black text-blue-700 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2">
                        <Video size={14} />
                        Meet Link
                      </a>
                    )}
                    {application.interview.calendarLink && (
                      <a href={application.interview.calendarLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-black text-purple-700 bg-purple-50 border border-purple-100 rounded-xl px-4 py-2">
                        <CalendarDays size={14} />
                        Add Calendar
                      </a>
                    )}
                    <Link to={`/hospital/jobs/${job._id}/applications`} className="inline-flex items-center gap-2 text-xs font-black text-slate-600 bg-slate-100 rounded-xl px-4 py-2">
                      Review Queue
                      <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center">
              <p className="text-slate-500 font-bold">Shortlist a candidate, then schedule interview date and time from the review queue.</p>
            </div>
          )}
        </div>
      </section>

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
        
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-100 border-t-emerald-600"></div>
            <p className="text-slate-400 font-bold text-sm">Syncing Database...</p>
          </div>
        )}
        {!loading && myJobs.length > 0 && (
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
                        <p className="text-xs text-slate-400 font-bold mt-0.5">{job.hospitalName || 'Hospital name not set'}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-xs font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-lg uppercase">
                         {job.type}
                       </span>
                       {job.experienceRequired && (
                         <p className="text-xs font-bold text-slate-400 mt-2">{job.experienceRequired}</p>
                       )}
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
        )}
        {!loading && myJobs.length === 0 && (
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

