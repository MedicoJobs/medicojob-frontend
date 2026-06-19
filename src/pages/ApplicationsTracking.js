import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/api';
import {
  ArrowLeft, User, Star, Phone,
  Mail, Eye, XCircle, ShieldCheck, Send,
  Zap, Brain, AlertTriangle, CalendarDays, CheckCircle, Video
} from 'lucide-react';

const STATUS_STYLES = {
  applied:     'bg-blue-50 text-blue-600 border-blue-100',
  screening: 'bg-cyan-50 text-cyan-600 border-cyan-100',
  shortlisted: 'bg-amber-50 text-amber-600 border-amber-100',
  interview_scheduled: 'bg-purple-50 text-purple-600 border-purple-100',
  interview_completed: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  offer: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  hired: 'bg-green-50 text-green-700 border-green-100',
  joined: 'bg-green-50 text-green-700 border-green-100',
  rejected:    'bg-red-50 text-red-600 border-red-100',
};

// Modal for entering rejection reason or next steps
function FeedbackModal({ type, onConfirm, onCancel }) {
  const [text, setText] = useState('');
  const isReject = type === 'rejected';

  return (
    <dialog
      open
      className="fixed inset-0 m-0 max-h-none max-w-none border-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in"
      aria-modal="true"
    >
      <div className="bg-white rounded-[2rem] max-w-md w-full shadow-2xl p-8">
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
    </dialog>
  );
}

FeedbackModal.propTypes = {
  type: PropTypes.oneOf(['rejected', 'shortlisted']).isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

function ScheduleInterviewModal({ onConfirm, onCancel }) {
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [mode, setMode] = useState('google_meet');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <dialog open className="fixed inset-0 m-0 max-h-none max-w-none border-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-[2rem] max-w-lg w-full shadow-2xl p-8">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
          <CalendarDays size={24} />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2">Schedule Interview</h3>
        <p className="text-slate-500 font-bold text-sm mb-6">Create interview time, calendar link, and meeting link.</p>

        <div className="space-y-4">
          <input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-emerald-500" />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" min="15" step="15" value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-emerald-500" />
            <select value={mode} onChange={(event) => setMode(event.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-emerald-500">
              <option value="google_meet">Video Meeting</option>
              <option value="phone">Phone</option>
              <option value="in_person">In Person</option>
            </select>
          </div>
          {mode !== 'google_meet' && (
            <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder={mode === 'phone' ? 'Phone number or instructions' : 'Interview location'} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-emerald-500" />
          )}
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Interview notes or agenda..." rows="3" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-emerald-500" />
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={() => onConfirm({ scheduledAt, durationMinutes: Number(durationMinutes), mode, location, notes })} disabled={!scheduledAt} className="flex-grow py-3 rounded-xl font-black text-sm text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-40">
            Schedule
          </button>
          <button onClick={onCancel} className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl font-black text-sm hover:bg-slate-200">
            Cancel
          </button>
        </div>
      </div>
    </dialog>
  );
}

ScheduleInterviewModal.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

function ApplicantModal({ applicant, application, reviews, hospitalId, onReviewSubmit, onClose }) {
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
      console.error('Failed to submit review.', err);
      alert('Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <dialog
      open
      className="fixed inset-0 m-0 max-h-none max-w-none border-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-[2.5rem] max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col md:flex-row h-full max-h-[90vh]"
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
            <section className="bg-white p-8 rounded-[2rem] border border-emerald-100 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Brain size={14} className="text-emerald-600" />
                    Resume Intelligence
                  </h4>
                  <p className="text-slate-600 text-sm font-bold">
                    {application?.resumeAnalysis?.candidate_summary || 'No resume analysis is attached to this application.'}
                  </p>
                </div>
                <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl px-5 py-3 text-center shrink-0">
                  <p className="text-[10px] font-black uppercase tracking-widest">Score</p>
                  <p className="text-3xl font-black">{application?.resumeScore ?? application?.resumeAnalysis?.resume_score ?? '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Seniority</p>
                  <p className="font-black text-slate-900">{application?.resumeSeniority || application?.resumeAnalysis?.seniority_level || 'Not scored'}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Experience</p>
                  <p className="font-black text-slate-900">{application?.resumeAnalysis?.experience_years ?? 'Not found'} years</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Specialization</p>
                  <p className="font-black text-slate-900">{application?.resumeAnalysis?.specialization || applicant.specialization || 'Not found'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Recommended Roles</p>
                  <div className="flex flex-wrap gap-2">
                    {(application?.recommendedRoles || application?.resumeAnalysis?.recommended_roles || []).map((role) => (
                      <span key={role} className="bg-blue-50 text-blue-700 border border-blue-100 rounded-xl px-3 py-2 text-[10px] font-black uppercase">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
                {(application?.missingInformation || application?.resumeAnalysis?.missing_information || []).length > 0 && (
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2 flex items-center gap-1">
                      <AlertTriangle size={12} />
                      Missing Information
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(application?.missingInformation || application?.resumeAnalysis?.missing_information || []).map((item) => (
                        <span key={item} className="bg-amber-50 text-amber-700 border border-amber-100 rounded-xl px-3 py-2 text-[10px] font-black uppercase">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

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
                  {applicant.preferredLocations?.map((loc) => (
                    <span key={loc} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase">{loc}</span>
                  )) || <span className="text-slate-300 text-xs italic">No preferences set</span>}
                </div>
              </section>
              <section>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {applicant.skills?.map((skill) => (
                    <span key={skill} className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase">{skill}</span>
                  )) || <span className="text-slate-300 text-xs italic">No skills listed</span>}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}

ApplicantModal.propTypes = {
  applicant: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string,
    specialization: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    licenseNumber: PropTypes.string,
    bio: PropTypes.string,
    preferredLocations: PropTypes.arrayOf(PropTypes.string),
    skills: PropTypes.arrayOf(PropTypes.string),
  }),
  application: PropTypes.shape({
    resumeAnalysis: PropTypes.object,
    resumeScore: PropTypes.number,
    resumeSeniority: PropTypes.string,
    recommendedRoles: PropTypes.arrayOf(PropTypes.string),
    missingInformation: PropTypes.arrayOf(PropTypes.string),
  }),
  reviews: PropTypes.shape({
    averageRating: PropTypes.number,
    count: PropTypes.number,
  }),
  hospitalId: PropTypes.string,
  onReviewSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

ApplicantModal.defaultProps = {
  applicant: null,
  application: null,
  reviews: null,
  hospitalId: null,
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
  const [scheduleDoctorId, setScheduleDoctorId] = useState('');

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
          } catch (err) {
            console.error('Error fetching applicant profile', id, err);
          }

          reputations[id] = { reviews: [], averageRating: 0, count: 0 };
        })
      );
      
      setApplicantProfiles(profiles);
      setApplicantReputations(reputations);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch job application details.', err);
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
      console.error('Failed to update application status.', err);
      alert('Failed to update status.');
    } finally {
      setUpdating(null);
    }
  };

  const handleUpdateStatusFor = async (doctorId, status) => {
    setUpdating(doctorId + status);

    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_BASE_URL}/jobs/${jobId}/application/${doctorId}`,
        {
          status,
          rejectionReason: '',
          nextStep: status === 'screening' ? 'Application moved to screening.' : '',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchJobDetails();
    } catch (err) {
      console.error('Failed to update application status.', err);
      alert('Failed to update status.');
    } finally {
      setUpdating(null);
    }
  };

  const handleScheduleInterview = async (payload) => {
    setUpdating(scheduleDoctorId + 'interview');
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/jobs/${jobId}/application/${scheduleDoctorId}/interview`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setScheduleDoctorId('');
      await fetchJobDetails();
    } catch (err) {
      console.error('Failed to schedule interview.', err);
      alert('Failed to schedule interview.');
    } finally {
      setUpdating(null);
    }
  };

  const advanceApplication = async (doctorId, action, payload = {}) => {
    setUpdating(doctorId + action);
    const token = localStorage.getItem('token');
    const endpointByAction = {
      complete: `/jobs/${jobId}/application/${doctorId}/interview/complete`,
      offer: `/jobs/${jobId}/application/${doctorId}/offer`,
      hire: `/jobs/${jobId}/application/${doctorId}/hire`,
    };

    try {
      await axios.patch(`${API_BASE_URL}${endpointByAction[action]}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchJobDetails();
    } catch (err) {
      console.error(`Failed to ${action} application.`, err);
      alert('Failed to update application stage.');
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
          application={job?.applications?.find((app) => app.doctorId === selectedApplicantId)}
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

      {scheduleDoctorId && (
        <ScheduleInterviewModal
          onConfirm={handleScheduleInterview}
          onCancel={() => setScheduleDoctorId('')}
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
              const isUpdating = updating?.startsWith(app.doctorId);
              const resumeScore = app.resumeScore ?? app.resumeAnalysis?.resume_score;
              const scoreTone = resumeScore >= 75 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : resumeScore >= 50 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-100';

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
                        <div className={`inline-flex items-center gap-1 mt-1 px-2 py-1 rounded-lg border text-[10px] font-black ${resumeScore === undefined || resumeScore === null ? 'bg-slate-50 text-slate-400 border-slate-100' : scoreTone}`}>
                          <Brain size={10} />
                          AI Score: {resumeScore ?? 'Pending'}
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
                      {app.status === 'interview_scheduled' && app.interview?.scheduledAt && (
                        <div className="flex flex-col gap-1">
                          <p className="text-[10px] text-purple-600 font-bold truncate max-w-[180px]">
                            {new Date(app.interview.scheduledAt).toLocaleString()}
                          </p>
                          <div className="flex gap-2">
                            {app.interview.meetLink && !app.interview.expiredAt && (
                              <a href={app.interview.meetLink} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 font-black inline-flex items-center gap-1">
                                <Video size={10} /> Meet
                              </a>
                            )}
                            {app.interview.expiredAt && (
                              <span className="text-[10px] text-red-500 font-black">Meet Expired</span>
                            )}
                            {app.interview.calendarLink && (
                              <a href={app.interview.calendarLink} target="_blank" rel="noreferrer" className="text-[10px] text-purple-600 font-black inline-flex items-center gap-1">
                                <CalendarDays size={10} /> Calendar
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                      {app.status === 'offer' && app.nextStep && (
                        <p className="text-[10px] text-emerald-600 font-bold truncate max-w-[180px]" title={app.nextStep}>Offer: {app.nextStep}</p>
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
                      
                      <div className="flex gap-2 flex-wrap justify-end">
                        {app.status === 'applied' && (
                          <>
                          <button
                            onClick={() => handleUpdateStatusFor(app.doctorId, 'screening')}
                            disabled={isUpdating}
                            className="bg-cyan-100 text-cyan-700 px-4 py-2.5 rounded-xl text-xs font-black uppercase hover:bg-cyan-200 transition-all"
                          >
                            Screening
                          </button>
                          <button
                            onClick={() => openFeedbackModal(app.doctorId, 'rejected')}
                            disabled={isUpdating}
                            className="bg-red-50 text-red-600 px-4 py-2.5 rounded-xl text-xs font-black uppercase hover:bg-red-100 transition-all"
                          >
                            Reject
                          </button>
                          </>
                        )}
                        {app.status === 'screening' && (
                          <>
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
                          </>
                        )}
                        {app.status === 'shortlisted' && (
                          <button onClick={() => setScheduleDoctorId(app.doctorId)} disabled={isUpdating} className="bg-purple-100 text-purple-700 px-4 py-2.5 rounded-xl text-xs font-black uppercase hover:bg-purple-200 transition-all">
                            Schedule Interview
                          </button>
                        )}
                        {app.status === 'interview_scheduled' && (
                          <button onClick={() => advanceApplication(app.doctorId, 'complete')} disabled={isUpdating} className="bg-indigo-100 text-indigo-700 px-4 py-2.5 rounded-xl text-xs font-black uppercase hover:bg-indigo-200 transition-all">
                            Complete Interview
                          </button>
                        )}
                        {app.status === 'interview_completed' && (
                          <button onClick={() => advanceApplication(app.doctorId, 'offer', { note: globalThis.prompt('Offer note') || '' })} disabled={isUpdating} className="bg-emerald-100 text-emerald-700 px-4 py-2.5 rounded-xl text-xs font-black uppercase hover:bg-emerald-200 transition-all">
                            Offer
                          </button>
                        )}
                        {app.status === 'offer' && (
                          <button onClick={() => advanceApplication(app.doctorId, 'hire', { note: 'Candidate hired.' })} disabled={isUpdating} className="bg-green-100 text-green-700 px-4 py-2.5 rounded-xl text-xs font-black uppercase hover:bg-green-200 transition-all flex items-center gap-1">
                            <CheckCircle size={14} /> Joined
                          </button>
                        )}
                        {['shortlisted', 'interview_scheduled', 'interview_completed', 'offer'].includes(app.status) && (
                          <button onClick={() => openFeedbackModal(app.doctorId, 'rejected')} disabled={isUpdating} className="bg-red-50 text-red-600 px-4 py-2.5 rounded-xl text-xs font-black uppercase hover:bg-red-100 transition-all">
                            Reject
                          </button>
                        )}
                        {['hired', 'joined', 'rejected'].includes(app.status) && (
                          <span className="text-slate-300 text-xs font-bold italic">Process Finalized</span>
                        )}
                      </div>
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
