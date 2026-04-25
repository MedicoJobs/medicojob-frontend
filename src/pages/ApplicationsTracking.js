import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/api';
import {
  ArrowLeft, Check, X, Clock, User, Stethoscope, Star, Phone,
  Mail, MapPin, Award, FileText, Eye, XCircle, ShieldCheck, ThumbsUp, Send,
  MessageSquare, ChevronRight, AlertCircle, Zap
} from 'lucide-react';

const STATUS_STYLES = {
  applied:     'bg-blue-50 text-blue-600 border-blue-100',
  shortlisted: 'bg-amber-50 text-amber-600 border-amber-100',
  rejected:    'bg-red-50 text-red-600 border-red-100',
};

// Modal for entering rejection reason or next steps
const FeedbackModal = ({ type, onConfirm, onCancel }) => {
  const [text, setText] = useState('');
  const isReject = type === 'rejected';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onCancel}>
      <div className="bg-white rounded-[2rem] max-w-md w-full shadow-2xl p-8" onClick={e => e.stopPropagation()}>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${isReject ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
           {isReject ? <XCircle size={24} /> : <Zap size={24} />}
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2">
          {isReject ? 'Reject Application' : 'Shortlist Candidate'}
        </h3>
        <p className="text-slate-500 font-bold text-sm mb-6">
          {isReject 
            ? 'Please provide a reason for rejection. This will be shared with the applicant.' 
            : 'Provide the next steps for the applicant (e.g., Interview date/time).'}
        </p>

        <textarea
          autoFocus
          className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500/20 transition-all mb-6"
          rows="4"
          placeholder={isReject ? "Reason for rejection..." : "Next steps for candidate..."}
          value={text}
          onChange={e => setText(e.target.value)}
        ></textarea>

        <div className="flex gap-3">
          <button
            onClick={() => onConfirm(text)}
            disabled={!text.trim()}
            className={`flex-grow py-3 rounded-xl font-black text-sm text-white transition-all disabled:opacity-40 ${isReject ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'}`}
          >
            Confirm {isReject ? 'Rejection' : 'Shortlist'}
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl font-black text-sm hover:bg-slate-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const ApplicantModal = ({ applicant, reviews, hospitalId, onReviewSubmit, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!applicant) return null;

  const handleSubmitReview = async () => {
    if (rating === 0) {
      alert('Please select a rating before submitting.');
      return;
    }
    const reviewerId = hospitalId || applicant?._id; // Fallback if needed, but hospitalId should be passed

    if (!reviewerId) {
      alert('Error: Reviewer ID not found. Please re-login.');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/reviews`, {
        targetUserId: applicant._id,
        reviewerId: reviewerId,
        rating,
        comment,
        role: 'doctor'
      });
      onReviewSubmit();
      setRating(0);
      setComment('');
      alert('Review submitted successfully!');
    } catch (err) {
      alert('Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div
        className="bg-white rounded-[2.5rem] max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col md:flex-row h-full max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-slate-900 p-8 text-white md:w-1/3 flex flex-col items-center text-center shrink-0">
          <div className="w-24 h-24 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500/30 flex items-center justify-center mb-6">
            <User size={48} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black mb-1">{applicant.name}</h2>
          <p className="text-emerald-400 font-bold mb-6">{applicant.specialization || 'Medical Professional'}</p>
          
          <div className="w-full space-y-4 text-left border-t border-white/10 pt-6">
             <div className="flex items-center gap-3 text-slate-400">
               <Mail size={16} /> <span className="text-xs font-bold truncate">{applicant.email}</span>
             </div>
             <div className="flex items-center gap-3 text-slate-400">
               <Phone size={16} /> <span className="text-xs font-bold">{applicant.phone || '—'}</span>
             </div>
             <div className="flex items-center gap-3 text-slate-400">
               <ShieldCheck size={16} /> <span className="text-xs font-bold">{applicant.licenseNumber || 'License Not Verified'}</span>
             </div>
          </div>

          <div className="mt-auto pt-10 w-full">
            <button onClick={onClose} className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-sm transition-all">
              Close Profile
            </button>
          </div>
        </div>

        <div className="flex-grow p-8 overflow-y-auto bg-slate-50 relative">
          <div className="space-y-8">
            <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                 <span className="text-[8px] font-black bg-emerald-100 text-emerald-600 px-2 py-1 rounded uppercase">Trust Engine 5006</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Overall Feedback</h4>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-black text-slate-900">{reviews?.averageRating?.toFixed(1) || '0.0'}</div>
                      <div className="flex gap-0.5 text-amber-400 mt-1">
                        {[1,2,3,4,5].map(star => <Star key={star} size={14} fill={star <= (reviews?.averageRating || 0) ? "currentColor" : "none"} />)}
                      </div>
                    </div>
                    <div className="h-10 w-[1px] bg-slate-100"></div>
                    <div>
                      <p className="text-slate-900 font-black text-lg">{reviews?.count || 0} Reviews</p>
                      <p className="text-slate-400 text-[10px] font-bold italic">Based on verifications</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3">Rate Candidate</h4>
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        className="transition-transform active:scale-90"
                      >
                        <Star size={24} className={`${(hover || rating) >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    placeholder="Brief feedback..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:border-emerald-500 mb-3"
                    rows="2"
                  ></textarea>
                  <button
                    onClick={handleSubmitReview}
                    disabled={submitting || rating === 0}
                    className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {submitting ? 'Submitting...' : <><Send size={14} /> Submit Review</>}
                  </button>
                </div>
              </div>
            </section>

            <section>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Bio & Summary</h4>
              <p className="text-slate-600 text-sm font-medium leading-relaxed bg-white p-8 rounded-[2rem] border border-slate-100 italic">
                "{applicant.bio || 'This professional has not added a bio yet.'}"
              </p>
            </section>

            <div className="grid grid-cols-2 gap-8">
              <section>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Locations</h4>
                <div className="flex flex-wrap gap-2">
                  {applicant.preferredLocations?.map((loc, i) => (
                    <span key={i} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase">{loc}</span>
                  )) || <span className="text-slate-300 text-xs italic">No preferences set</span>}
                </div>
              </section>
              <section>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {applicant.skills?.map((s, i) => (
                    <span key={i} className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase">{s}</span>
                  )) || <span className="text-slate-300 text-xs italic">No skills listed</span>}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ApplicationsTracking = () => {
  const { jobId } = useParams();
  const { user: hospital } = React.useContext(AuthContext);
  const [job, setJob] = useState(null);
  const [applicantProfiles, setApplicantProfiles] = useState({});
  const [applicantReputations, setApplicantReputations] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [selectedApplicantId, setSelectedApplicantId] = useState(null);
  const [feedbackState, setFeedbackState] = useState({ show: false, type: '', doctorId: '' });
  console.log('[DEBUG] Current Hospital User from Storage:', hospital);

  useEffect(() => { fetchJobDetails(); }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/jobs/${jobId}`);
      setJob(res.data);

      const ids = [...new Set(res.data.applications?.map(a => a.doctorId) || [])];
      const profiles = {};
      const reputations = {};

      await Promise.all(
        ids.map(async (id) => {
          try {
            const r = await axios.get(`${API_BASE_URL}/auth/user/${id}`);
            profiles[id] = r.data;
            const repRes = await axios.get(`${API_BASE_URL}/reviews/${id}`);
            reputations[id] = repRes.data;
          } catch (err) {
            console.error('Error fetching details', id, err);
          }
        })
      );
      
      setApplicantProfiles(profiles);
      setApplicantReputations(reputations);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const openFeedbackModal = (doctorId, type) => {
    setFeedbackState({ show: true, type, doctorId });
  };

  const handleUpdateStatus = async (feedbackText) => {
    const { doctorId, type } = feedbackState;
    setUpdating(doctorId + type);
    setFeedbackState({ show: false, type: '', doctorId: '' });

    try {
      const token = localStorage.getItem('token');
      const payload = { 
        status: type,
        rejectionReason: type === 'rejected' ? feedbackText : '',
        nextStep: type === 'shortlisted' ? feedbackText : ''
      };

      await axios.patch(
        `${API_BASE_URL}/jobs/${jobId}/application/${doctorId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchJobDetails();
    } catch (err) {
      alert('Failed to update status.');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-100 border-t-emerald-600"></div>
      <p className="text-slate-400 font-bold text-sm">Reviewing applications...</p>
    </div>
  );

  if (!job) return <div className="p-20 text-center text-slate-400 font-black text-xl">Job not found</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-fade-in relative">
      {/* Modals */}
      {selectedApplicantId && (
        <ApplicantModal 
          applicant={applicantProfiles[selectedApplicantId]} 
          reviews={applicantReputations[selectedApplicantId]}
          hospitalId={hospital?.id || hospital?._id}
          onReviewSubmit={() => {
            console.log('[DEBUG] Review submitted, refreshing details...');
            fetchJobDetails();
          }}
          onClose={() => setSelectedApplicantId(null)} 
        />
      )}

      {feedbackState.show && (
        <FeedbackModal 
          type={feedbackState.type}
          onConfirm={handleUpdateStatus}
          onCancel={() => setFeedbackState({ show: false, type: '', doctorId: '' })}
        />
      )}

      <Link to="/hospital/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold mb-10 transition-all hover:-translate-x-1">
        <ArrowLeft size={20} /> Back to Dashboard
      </Link>

      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Applicant Review</h1>
        <p className="text-slate-500 font-bold">{job.title} &mdash; {job.specialization}</p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <th className="px-8 py-5">Applicant & Trust</th>
              <th className="px-8 py-5">Applied On</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {job.applications?.map(app => {
              const profile = applicantProfiles[app.doctorId] || {};
              const reputation = applicantReputations[app.doctorId] || { averageRating: 0, count: 0 };
              const isUpdating = updating && updating.startsWith(app.doctorId);

              return (
                <tr key={app.doctorId} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-8 py-6">
                    <button onClick={() => setSelectedApplicantId(app.doctorId)} className="flex items-center gap-3 group text-left">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 group-hover:bg-emerald-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">{profile.name || 'Unknown'}</p>
                        <div className="flex items-center gap-1 text-[10px] text-amber-500 font-black">
                           <Star size={10} fill="currentColor" /> {reputation.averageRating?.toFixed(1)} ({reputation.count})
                        </div>
                      </div>
                    </button>
                  </td>
                  <td className="px-8 py-6 text-slate-500 font-bold text-sm">
                    {new Date(app.appliedAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border w-fit ${STATUS_STYLES[app.status] || 'bg-slate-50 text-slate-500'}`}>
                        {app.status}
                      </span>
                      {app.status === 'rejected' && app.rejectionReason && (
                        <p className="text-[10px] text-red-500 font-bold truncate max-w-[150px]" title={app.rejectionReason}>Reason: {app.rejectionReason}</p>
                      )}
                      {app.status === 'shortlisted' && app.nextStep && (
                        <p className="text-[10px] text-amber-600 font-bold truncate max-w-[150px]" title={app.nextStep}>Next: {app.nextStep}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setSelectedApplicantId(app.doctorId)}
                        className="text-xs font-black bg-slate-100 text-slate-600 px-4 py-2.5 rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2"
                      >
                        <Eye size={14} /> Profile
                      </button>
                      
                      {app.status === 'applied' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => openFeedbackModal(app.doctorId, 'shortlisted')}
                            disabled={isUpdating}
                            className="bg-amber-100 text-amber-700 px-4 py-2.5 rounded-xl text-xs font-black uppercase hover:bg-amber-200 transition-all"
                          >
                            Shortlist
                          </button>
                          <button
                            onClick={() => openFeedbackModal(app.doctorId, 'rejected')}
                            disabled={isUpdating}
                            className="bg-red-50 text-red-600 px-4 py-2.5 rounded-xl text-xs font-black uppercase hover:bg-red-100 transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {app.status !== 'applied' && (
                        <span className="text-slate-300 text-xs font-bold italic">Process Finalized</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicationsTracking;
