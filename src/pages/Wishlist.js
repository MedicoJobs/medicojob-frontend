import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import { getWishlist } from '../utils/wishlist';

const Wishlist = () => {
  const { user } = useContext(AuthContext);
  const [savedJobs, setSavedJobs] = useState([]);

  useEffect(() => {
    if (!user?.id) {
      setSavedJobs([]);
      return;
    }

    setSavedJobs(getWishlist(user.id));
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Wishlist</h1>
          <p className="text-slate-500 mt-1 font-medium">Saved jobs you want to revisit later.</p>
        </div>
        <div className="px-4 py-2 bg-slate-100 rounded-full text-sm font-bold text-slate-700">
          {savedJobs.length} saved jobs
        </div>
      </div>

      {savedJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {savedJobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      ) : (
        <div className="bg-white p-20 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 text-center">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart size={40} className="text-red-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-800 mb-3">Your wishlist is empty</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">
            Save interesting roles from the job details page and they will appear here.
          </p>
          <Link to="/jobs" className="btn-secondary inline-flex items-center gap-2">
            <Search size={18} />
            Browse Jobs
          </Link>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
