import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';
import { Briefcase, MapPin, DollarSign, Calendar, AlignLeft, Tag, CheckCircle } from 'lucide-react';

const SPECIALIZATIONS = [
  'General Medicine', 'Cardiology', 'Neurology', 'Orthopedics',
  'General Surgery', 'Pediatrics', 'Emergency Medicine', 'Radiology',
  'Oncology', 'Dermatology', 'Psychiatry', 'Gynecology', 'Ophthalmology',
  'ENT', 'Urology', 'Nephrology', 'Gastroenterology', 'Pulmonology',
  'Anesthesiology', 'Pathology', 'Lab Technician', 'Nursing'
];

const PostJob = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    specialization: '',
    salary: '',
    location: '',
    type: 'full-time',
    expiryDate: '',
    description: '',
    requirements: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/jobs`, {
        ...formData,
        title: formData.title.trim(),
        location: formData.location.trim(),
        description: formData.description.trim(),
        requirements: formData.requirements.trim(),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/hospital/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Create Job Posting</h1>
        <p className="text-slate-500 font-bold">Fill in the details below to attract qualified medical professionals.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-8 text-sm font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Job Basics */}
        <FormSection title="Position Details">
          <div className="col-span-2">
            <FormLabel icon={<Briefcase size={16} />}>Job Title *</FormLabel>
            <input
              type="text" name="title" required value={formData.title} onChange={handleChange}
              className="input-field" placeholder="e.g. Senior Cardiologist, Emergency Room Nurse"
            />
          </div>
          <div>
            <FormLabel icon={<Tag size={16} />}>Specialization *</FormLabel>
            <select name="specialization" required value={formData.specialization} onChange={handleChange} className="input-field bg-white">
              <option value="" disabled>Select Specialization</option>
              {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <FormLabel>Employment Type *</FormLabel>
            <select name="type" required value={formData.type} onChange={handleChange} className="input-field bg-white">
              <option value="full-time">Full-Time</option>
              <option value="part-time">Part-Time</option>
              <option value="emergency">Emergency / Locum</option>
            </select>
          </div>
          <div>
            <FormLabel icon={<MapPin size={16} />}>Location *</FormLabel>
            <input
              type="text" name="location" required value={formData.location} onChange={handleChange}
              className="input-field" placeholder="City, State or 'Remote'"
            />
          </div>
          <div>
            <FormLabel icon={<DollarSign size={16} />}>Annual Salary (₹ or $) *</FormLabel>
            <input
              type="number" name="salary" required value={formData.salary} onChange={handleChange}
              className="input-field" placeholder="e.g. 1800000"
            />
          </div>
          <div className="col-span-2">
            <FormLabel icon={<Calendar size={16} />}>Application Deadline *</FormLabel>
            <input
              type="date" name="expiryDate" required value={formData.expiryDate} onChange={handleChange}
              className="input-field"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </FormSection>

        {/* Job Description */}
        <FormSection title="Job Description">
          <div className="col-span-2">
            <FormLabel icon={<AlignLeft size={16} />}>Position Overview *</FormLabel>
            <textarea
              name="description" required value={formData.description} onChange={handleChange}
              className="input-field resize-none" rows={5}
              placeholder="Describe the role, responsibilities, and what makes this opportunity unique..."
            />
          </div>
          <div className="col-span-2">
            <FormLabel>Requirements & Qualifications</FormLabel>
            <textarea
              name="requirements" value={formData.requirements} onChange={handleChange}
              className="input-field resize-none" rows={4}
              placeholder="List key requirements: qualifications, certifications, years of experience..."
            />
          </div>
        </FormSection>

        {/* Preview Card */}
        {formData.title && (
          <div className="bg-slate-50 rounded-[2rem] p-8 border border-dashed border-slate-200">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Preview</p>
            <h3 className="text-2xl font-black text-slate-900 mb-2">{formData.title}</h3>
            <div className="flex flex-wrap gap-3 text-sm text-slate-500 font-bold">
              {formData.specialization && <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-xl">{formData.specialization}</span>}
              {formData.type && <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-xl capitalize">{formData.type}</span>}
              {formData.location && <span>📍 {formData.location}</span>}
              {formData.salary && <span>💵 ${Number(formData.salary).toLocaleString()}</span>}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-5 text-lg flex items-center justify-center gap-3 shadow-emerald-200"
        >
          {loading ? (
            <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <><CheckCircle size={22} /> Publish Job Listing</>
          )}
        </button>
      </form>
    </div>
  );
};

const FormSection = ({ title, children }) => (
  <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-lg shadow-slate-200/50">
    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
  </div>
);

const FormLabel = ({ icon, children }) => (
  <label className="flex items-center gap-2 text-sm font-black text-slate-700 mb-2">
    {icon && <span className="text-slate-400">{icon}</span>}
    {children}
  </label>
);

export default PostJob;
