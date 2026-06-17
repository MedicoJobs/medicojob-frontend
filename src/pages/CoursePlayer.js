import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, Award, ArrowLeft } from 'lucide-react';

const CoursePlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completedMessage, setCompletedMessage] = useState('');

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourse(res.data);
    } catch (err) {
      console.error('Failed to fetch course', err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/courses/${id}/complete`, 
      {
        userName: user.name,
        userEmail: user.email // Make sure user object has email
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompletedMessage(res.data.message);
    } catch (err) {
      setCompletedMessage(err.response?.data?.message || 'Failed to complete course');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div></div>;
  if (!course) return <div className="text-center py-20">Course not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in">
      <button onClick={() => navigate('/courses')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 mb-8 transition-colors">
        <ArrowLeft size={16} /> Back to Courses
      </button>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden mb-8">
        {/* Video Player */}
        <div className="w-full bg-black aspect-video relative">
        {console.log(course.videoUrl)}
          <video 
            src={course.videoUrl} 
            controls 
            controlsList="nodownload"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="p-8">
          <h1 className="text-3xl font-black text-slate-900 mb-4">{course.title}</h1>
          <p className="text-slate-600 font-medium leading-relaxed mb-8">{course.description}</p>
          
          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <p className="text-sm font-bold text-slate-400 mb-1">Instructor</p>
              <p className="text-lg font-black text-slate-900">{course.instructor}</p>
            </div>
            
            {completedMessage ? (
              <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-xl">
                <CheckCircle size={20} /> {completedMessage}
              </div>
            ) : (
              <button 
                onClick={handleComplete} 
                disabled={completing}
                className="btn-primary flex items-center gap-2 px-8"
              >
                {completing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <><Award size={20} /> Mark as Completed</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;
