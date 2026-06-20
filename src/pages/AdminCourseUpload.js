import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';
import { UploadCloud, FileVideo, CheckCircle } from 'lucide-react';

const AdminCourseUpload = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    durationMinutes: '',
  });
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setVideoFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) return setMessage('Please select a video file.');

    setUploading(true);
    setMessage('');

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('instructor', formData.instructor);
    data.append('durationMinutes', formData.durationMinutes);
    data.append('video', videoFile);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/courses`, data, {
        headers: { 
          Authorization: `Bearer ${token}`
        }
      });
      setMessage('Course uploaded successfully!');
      setFormData({ title: '', description: '', instructor: '', durationMinutes: '' });
      setVideoFile(null);
      e.target.reset(); // Reset file input
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Failed to upload course.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <UploadCloud size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Upload New Course</h1>
            <p className="text-slate-500 font-bold text-sm">Add educational content for applicants</p>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl mb-6 font-bold flex items-center gap-2 ${message.includes('successfully') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {message.includes('successfully') && <CheckCircle size={18} />}
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="course-title" className="block text-sm font-black text-slate-700 mb-2">Course Title</label>
            <input id="course-title" type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium transition-all" />
          </div>
          
          <div>
            <label htmlFor="course-description" className="block text-sm font-black text-slate-700 mb-2">Description</label>
            <textarea id="course-description" name="description" value={formData.description} onChange={handleChange} required rows={4} className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="course-instructor" className="block text-sm font-black text-slate-700 mb-2">Instructor Name</label>
              <input id="course-instructor" type="text" name="instructor" value={formData.instructor} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium transition-all" />
            </div>
            <div>
              <label htmlFor="course-duration" className="block text-sm font-black text-slate-700 mb-2">Duration (Minutes)</label>
              <input id="course-duration" type="number" name="durationMinutes" value={formData.durationMinutes} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium transition-all" />
            </div>
          </div>

          <div>
            <label htmlFor="course-video" className="block text-sm font-black text-slate-700 mb-2">Video File</label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors relative cursor-pointer group">
              <input id="course-video" type="file" accept="video/*" onChange={handleFileChange} required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <FileVideo size={32} className="mx-auto text-slate-400 mb-2 group-hover:text-emerald-500 transition-colors" />
              <p className="text-sm font-bold text-slate-600">
                {videoFile ? videoFile.name : 'Click or drag video file to upload'}
              </p>
            </div>
          </div>

          <button type="submit" disabled={uploading} className="w-full btn-primary py-4 text-lg">
            {uploading ? 'Uploading...' : 'Publish Course'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminCourseUpload;
