import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Brain, CheckCircle, XCircle, FileText } from 'lucide-react';
import { API_BASE_URL } from '../utils/api';

const CandidateProfile = () => {
  const { candidateId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [decisionType, setDecisionType] = useState('shortlisted');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [candidateId]);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/resume/copilot/candidates/${candidateId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
      setDecisionType(res.data.decision?.status || 'shortlisted');
      setNote(res.data.decision?.note || '');
    } catch (err) {
      console.error('Candidate profile failed', err);
      setError('Candidate profile could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  const saveDecision = async () => {
    if (!note.trim()) {
      setError('Please add a note before saving the decision.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/api/resume/copilot/candidates/${candidateId}/decision`,
        { status: decisionType, note: note.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchProfile();
    } catch (err) {
      console.error('Candidate decision failed', err);
      setError('Decision could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-100 border-t-emerald-600"></div>
      </div>
    );
  }

  if (!profile) {
    return <div className="p-20 text-center text-slate-500 font-black">{error || 'Candidate not found.'}</div>;
  }

  const analysis = profile.analysis || {};
  const chips = [
    ...(analysis.qualification || []),
    ...(analysis.clinical_skills || []),
    ...(analysis.technical_skills || []),
    ...(analysis.recommended_roles || []),
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-fade-in">
      <Link to="/hospital/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold mb-10 transition-all">
        <ArrowLeft size={20} /> Back to Recruiter Copilot
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 bg-white border border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/70">
            <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Candidate Profile</p>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{analysis.name || `Candidate #${profile.id}`}</h1>
            <p className="text-slate-500 font-bold mt-2">
              {analysis.specialization || 'Healthcare'} · {analysis.experience_years ?? 'N/A'} years · {analysis.location || 'Location N/A'}
            </p>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Metric label="AI Score" value={analysis.resume_score ?? 0} />
              <Metric label="Seniority" value={analysis.seniority_level || 'Not scored'} />
              <Metric label="Current Employer" value={analysis.current_employer || 'Not found'} />
            </div>

            <section>
              <h2 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                <Brain size={20} className="text-emerald-600" />
                Resume Intelligence
              </h2>
              <p className="text-slate-600 font-bold leading-relaxed bg-slate-50 rounded-2xl p-5">
                {analysis.candidate_summary || 'No candidate summary available.'}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black text-slate-900 mb-3">Skills, Roles & Qualifications</h2>
              <div className="flex flex-wrap gap-2">
                {chips.map((item) => (
                  <span key={item} className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">{item}</span>
                ))}
                {chips.length === 0 && <span className="text-slate-400 font-bold">No structured skills found.</span>}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                <FileText size={20} className="text-blue-600" />
                Resume Text Preview
              </h2>
              <p className="text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 rounded-2xl p-5 whitespace-pre-wrap">
                {profile.extracted_text_preview || 'No resume text preview available.'}
              </p>
            </section>
          </div>
        </section>

        <aside className="bg-white border border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/50 h-fit overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-black text-slate-900">Hiring Decision</h2>
            {profile.decision && (
              <p className="mt-2 text-xs font-black text-slate-500 uppercase">
                Current: {profile.decision.status}
              </p>
            )}
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDecisionType('shortlisted')}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 font-black text-xs uppercase border ${decisionType === 'shortlisted' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-500 border-slate-200'}`}
              >
                <CheckCircle size={16} /> Shortlist
              </button>
              <button
                onClick={() => setDecisionType('rejected')}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 font-black text-xs uppercase border ${decisionType === 'rejected' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-500 border-slate-200'}`}
              >
                <XCircle size={16} /> Reject
              </button>
            </div>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500"
              rows="5"
              placeholder={decisionType === 'shortlisted' ? 'Next step or reason for shortlisting...' : 'Reason for rejection...'}
            />
            {error && <p className="text-sm font-bold text-red-600">{error}</p>}
            <button
              onClick={saveDecision}
              disabled={saving}
              className="w-full btn-primary py-3 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Decision'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

const Metric = ({ label, value }) => (
  <div className="bg-slate-50 rounded-2xl p-5">
    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{label}</p>
    <p className="text-xl font-black text-slate-900">{value}</p>
  </div>
);

Metric.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default CandidateProfile;
