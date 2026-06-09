import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';
import { Link } from 'react-router-dom';
import { PlayCircle, Clock, User } from 'lucide-react';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(res.data);
    } catch (err) {
      console.error('Failed to fetch courses', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-fade-in">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Continuing Medical Education</h1>
        <p className="text-slate-500 font-bold max-w-2xl mx-auto">Enhance your skills with our expert-led video courses and earn certificates of completion.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div></div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
          <p className="text-slate-500 font-bold">No courses available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map(course => (
            <div key={course._id} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-lg shadow-slate-200/50 group flex flex-col">
              <div className="h-48 bg-slate-900 relative flex items-center justify-center">
                {/* Fallback thumbnail if video can't easily generate one */}
                <PlayCircle size={64} className="text-emerald-500 opacity-80 group-hover:scale-110 transition-transform" />
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur px-3 py-1 rounded-xl text-white text-xs font-bold flex items-center gap-1">
                  <Clock size={12} /> {course.durationMinutes} mins
                </div>
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-black text-slate-900 mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-sm text-slate-500 font-bold mb-4 line-clamp-2 flex-grow">{course.description}</p>
                
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-6 pb-6 border-b border-slate-100">
                  <User size={14} />
                  <span>Instructor: {course.instructor}</span>
                </div>
                
                <Link to={`/courses/${course._id}`} className="w-full btn-primary text-center py-3">
                  Start Course
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
