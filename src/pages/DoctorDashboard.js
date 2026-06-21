import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import {
  Briefcase, Clock, Sparkles, Star,
  ArrowRight, ClipboardList, Zap, AlertCircle,
  ChevronRight, XCircle, MapPin, DollarSign, BookOpenCheck, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS_CONFIG = {
  applied:     { label: 'Under Review', color: 'text-blue-600 bg-blue-50 border-blue-100' },
  screening: { label: 'Screening', color: 'text-cyan-600 bg-cyan-50 border-cyan-100' },
  shortlisted: { label: 'Shortlisted', color: 'text-amber-600 bg-amber-50 border-amber-100' },
  interview_scheduled: { label: 'Interview Scheduled', color: 'text-purple-600 bg-purple-50 border-purple-100' },
  interview_completed: { label: 'Interview Completed', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
  offer: { label: 'Offer', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  hired: { label: 'Hired', color: 'text-green-700 bg-green-50 border-green-100' },
  joined: { label: 'Joined', color: 'text-green-700 bg-green-50 border-green-100' },
  rejected:    { label: 'Not Selected', color: 'text-red-600 bg-red-50 border-red-100' },
};

const getAnswerOptionClass = ({ isCorrect, isWrong, selected }) => {
  if (isCorrect) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (isWrong) return 'bg-red-50 text-red-700 border-red-200';
  if (selected) return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-slate-50 text-slate-600 border-slate-100 hover:border-blue-200';
};

const getApplicationNoteLabel = (status) => {
  if (status === 'rejected') return 'Rejection Reason';
  if (status === 'offer') return 'Offer Details';
  if (['hired', 'joined'].includes(status)) return 'Joining Update';
  return 'Next Steps to Follow';
};

const getApplicationNoteTone = (status) => (
  status === 'rejected' ? 'text-red-500' : 'text-amber-600'
);

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appLoading, setAppLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recommended');
  const [recommendationError, setRecommendationError] = useState('');
  const [applicationError, setApplicationError] = useState('');
  const [examPosition, setExamPosition] = useState(user?.specialization || 'Resident Doctor');
  const [examDifficulty, setExamDifficulty] = useState('medium');
  const [practiceExam, setPracticeExam] = useState(null);
  const [examAnswers, setExamAnswers] = useState({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examLoading, setExamLoading] = useState(false);
  const [examError, setExamError] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchRecommendations();
      fetchMyApplications();
    }
  }, [user?.id]);

  const fetchRecommendations = async () => {
    setRecommendationError('');
    try {
      const res = await axios.get(`${API_BASE_URL}/match/jobs/${user.id}`);
      setRecommendedJobs(Array.isArray(res.data) ? res.data.slice(0, 6) : []);
    } catch (err) {
      console.error('Matching service error', err);
      try {
        const fallback = await axios.get(`${API_BASE_URL}/jobs?status=open`);
        setRecommendedJobs(Array.isArray(fallback.data) ? fallback.data.slice(0, 6) : []);
      } catch (fallbackErr) {
        console.error('Fallback jobs fetch error', fallbackErr);
        setRecommendedJobs([]);
        setRecommendationError('Job recommendations are temporarily unavailable.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    setApplicationError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/jobs/my-applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyApplications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setMyApplications([]);
      setApplicationError('Applications could not be loaded right now.');
    } finally {
      setAppLoading(false);
    }
  };

  const generatePracticeExam = async (event) => {
    event.preventDefault();
    if (!examPosition.trim()) return;

    setExamLoading(true);
    setExamError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE_URL}/api/resume/interview/practice-exam`,
        {
          position: examPosition.trim(),
          specialization: user?.specialization || undefined,
          difficulty: examDifficulty,
          question_count: 10,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPracticeExam(res.data);
      setExamAnswers({});
      setExamSubmitted(false);
    } catch (err) {
      console.error('Practice exam generation failed', err);
      setExamError('Practice exam could not be generated right now.');
    } finally {
      setExamLoading(false);
    }
  };

  const submitPracticeExam = () => {
    if (!practiceExam) return;
    setExamSubmitted(true);
  };

  const handleExamAnswerChange = (questionId, option) => {
    setExamAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const examScore = practiceExam?.questions.reduce((score, item) => {
    if (!item.correct_answer) return score;
    return examAnswers[item.id] === item.correct_answer ? score + 1 : score;
  }, 0) || 0;
  const scoredQuestions = practiceExam?.questions.length || 0;
  const answeredQuestions = practiceExam?.questions.filter((item) => examAnswers[item.id]).length || 0;

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

      <section className="mb-12 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/70">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <BookOpenCheck size={24} />
              </div>
              <div>
                <p className="text-xs font-black text-blue-600 uppercase tracking-widest">AI Practice Exam Agent</p>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Interview question practice</h2>
              </div>
            </div>
            <form onSubmit={generatePracticeExam} className="flex flex-col md:flex-row gap-3 w-full lg:max-w-3xl">
              <input
                value={examPosition}
                onChange={(event) => setExamPosition(event.target.value)}
                className="flex-1 px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                placeholder="Resident Doctor"
              />
              <select
                value={examDifficulty}
                onChange={(event) => setExamDifficulty(event.target.value)}
                className="px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <button
                type="submit"
                disabled={examLoading}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black transition-colors shadow-lg shadow-blue-100 disabled:opacity-60"
              >
                <RefreshCw size={18} className={examLoading ? 'animate-spin' : ''} />
                {examLoading ? 'Generating' : 'New Exam'}
              </button>
            </form>
          </div>
          {examError && <p className="mt-4 text-sm font-bold text-red-600">{examError}</p>}
        </div>

        {practiceExam && (
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Attempt {practiceExam.attempt_id}</p>
                <h3 className="text-2xl font-black text-slate-900">{practiceExam.position}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-black text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-lg">{practiceExam.role_family}</span>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-lg">{practiceExam.difficulty}</span>
                {examSubmitted && scoredQuestions > 0 && (
                  <span className="text-xs font-black text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1 rounded-lg">
                    Score {examScore}/{scoredQuestions}
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {practiceExam.questions.map((item) => (
                <div key={`${practiceExam.attempt_id}-${item.id}`} className="border border-slate-100 rounded-2xl p-5 bg-white">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Question {item.id}</span>
                    <span className="text-xs font-black text-slate-600 bg-slate-100 px-3 py-1 rounded-lg uppercase">{item.type}</span>
                  </div>
                  <p className="font-black text-slate-900 mb-4">{item.question}</p>
                  <div className="space-y-2 mb-4">
                    {item.options.map((option) => {
                      const selected = examAnswers[item.id] === option;
                      const isCorrect = examSubmitted && item.correct_answer === option;
                      const isWrong = examSubmitted && selected && item.correct_answer !== option;
                      const optionClass = getAnswerOptionClass({ isCorrect, isWrong, selected });
                      return (
                        <label
                          key={option}
                          className={`block text-sm font-bold rounded-xl px-4 py-2 border cursor-pointer transition-all ${optionClass}`}
                        >
                          <input
                            type="radio"
                            name={`question-${item.id}`}
                            value={option}
                            checked={selected}
                            onChange={() => handleExamAnswerChange(item.id, option)}
                            disabled={examSubmitted}
                            className="mr-2"
                          />
                          {option}
                        </label>
                      );
                    })}
                  </div>
                  {examSubmitted && item.correct_answer && <p className="text-sm font-black text-emerald-700 mb-2">Answer: {item.correct_answer}</p>}
                  {examSubmitted && <p className="text-sm font-bold text-slate-600 mb-3">{item.explanation}</p>}
                  <div className="flex flex-wrap gap-2">
                    {item.scoring_points.map((point) => (
                      <span key={point} className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-lg">{point}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-5">
              <p className="text-sm font-bold text-slate-600">
                {examSubmitted ? 'Review explanations and scoring points, then generate a new exam for more practice.' : `Answered ${answeredQuestions}/${scoredQuestions}. Submit when all MCQs are complete.`}
              </p>
              <button
                onClick={submitPracticeExam}
                disabled={examSubmitted || answeredQuestions < scoredQuestions}
                className="btn-primary px-6 py-3 disabled:opacity-50"
              >
                {examSubmitted ? 'Submitted' : 'Submit Test'}
              </button>
            </div>
          </div>
        )}
      </section>

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
          <RecommendedJobsContent
            loading={loading}
            recommendationError={recommendationError}
            recommendedJobs={recommendedJobs}
          />
        </section>
      )}

      {activeTab === 'applications' && (
        <section>
          {appLoading && (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-100 border-t-emerald-600"></div>
            </div>
          )}
          {!appLoading && applicationError && (
            <div className="py-20 text-center bg-white rounded-[2.5rem] border border-amber-100">
              <AlertCircle size={40} className="text-amber-400 mx-auto mb-4" />
              <p className="text-slate-600 font-black text-xl">{applicationError}</p>
            </div>
          )}
          {!appLoading && !applicationError && myApplications.length > 0 && (
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

                    {app.interview?.scheduledAt && (
                      <div className="px-8 py-6 border-t bg-purple-50/30 border-purple-100/50">
                         <div className="flex flex-wrap items-center gap-4">
                           <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-purple-100 text-purple-600">
                              <Clock size={16} />
                           </div>
                           <div className="flex-grow">
                             <h4 className="text-[10px] font-black uppercase tracking-widest mb-1 text-purple-600">Interview Schedule</h4>
                             <p className="text-sm font-bold text-slate-700">{new Date(app.interview.scheduledAt).toLocaleString()}</p>
                           </div>
                           {app.interview.meetLink && !app.interview.expiredAt && (
                             <a href={app.interview.meetLink} target="_blank" rel="noreferrer" className="text-xs font-black text-blue-600 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2">
                               Join Meet
                             </a>
                           )}
                           {app.interview.expiredAt && (
                             <span className="text-xs font-black text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2">
                               Link Expired
                             </span>
                           )}
                         </div>
                      </div>
                    )}

                    {(app.applicationStatus === 'rejected' || app.applicationStatus === 'shortlisted' || app.applicationStatus === 'offer' || app.applicationStatus === 'hired' || app.applicationStatus === 'joined') && (
                      <div className={`px-8 py-6 border-t ${app.applicationStatus === 'rejected' ? 'bg-red-50/30 border-red-100/50' : 'bg-amber-50/30 border-amber-100/50'}`}>
                         <div className="flex items-start gap-4">
                           <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${app.applicationStatus === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                              {app.applicationStatus === 'rejected' ? <AlertCircle size={16} /> : <Zap size={16} />}
                           </div>
                           <div>
                             <h4 className={`text-[10px] font-black uppercase tracking-widest mb-1 ${getApplicationNoteTone(app.applicationStatus)}`}>
                               {getApplicationNoteLabel(app.applicationStatus)}
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
          )}
          {!appLoading && !applicationError && myApplications.length === 0 && (
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

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div className="card p-6 bg-white flex flex-col justify-between">
      <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center mb-4`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-3xl font-black text-slate-900">{String(value).padStart(2, '0')}</h3>
      </div>
    </div>
  );
}

function RecommendedJobsContent({ loading, recommendationError, recommendedJobs }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1,2,3].map(n => <div key={n} className="bg-white h-72 rounded-[2.5rem] animate-pulse border border-slate-100 shadow-sm"></div>)}
      </div>
    );
  }

  if (recommendationError) {
    return (
      <div className="py-20 text-center bg-white rounded-[2.5rem] border border-amber-100">
        <AlertCircle size={40} className="text-amber-400 mx-auto mb-4" />
        <p className="text-slate-600 font-black text-xl">{recommendationError}</p>
        <Link to="/jobs" className="inline-flex items-center gap-2 mt-6 text-emerald-600 font-black text-sm hover:gap-3 transition-all">
          Browse all jobs <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
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
  );
}

RecommendedJobsContent.propTypes = {
  loading: PropTypes.bool.isRequired,
  recommendationError: PropTypes.string.isRequired,
  recommendedJobs: PropTypes.arrayOf(PropTypes.object).isRequired,
};

StatCard.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  bg: PropTypes.string.isRequired,
};

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

TabButton.propTypes = {
  active: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default DoctorDashboard;
