import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, Calendar, Building2, ArrowRight, BadgeCheck } from 'lucide-react';

const JobCard = ({ job }) => {
  const isEmergency = job.type === 'emergency';
  
  return (
    <div className="card group relative overflow-hidden p-8 animate-fade-in hover:border-emerald-200">
      {isEmergency && (
        <div className="absolute top-0 right-0">
          <div className="bg-red-500 text-white text-[10px] font-black px-4 py-1.5 uppercase tracking-widest transform rotate-45 translate-x-4 translate-y-2 shadow-lg">
            Emergency
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-start mb-6">
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-emerald-600 font-extrabold text-xs uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-lg">
              {job.specialization}
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors leading-tight">
            {job.title}
          </h3>
          <div className="flex items-center gap-2 text-slate-500 text-sm mt-3 font-medium">
            <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
              <Building2 size={12} className="text-slate-400" />
            </div>
            <span>Hospital Network</span>
            <BadgeCheck size={14} className="text-blue-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="flex items-center gap-3 text-slate-600 text-sm font-semibold bg-slate-50 p-3 rounded-2xl">
          <div className="text-emerald-500">
            <MapPin size={16} />
          </div>
          <span className="truncate">{job.location}</span>
        </div>
        <div className="flex items-center gap-3 text-slate-600 text-sm font-semibold bg-slate-50 p-3 rounded-2xl">
          <div className="text-emerald-500">
            <DollarSign size={16} />
          </div>
          <span>${job.salary.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-50">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wide">
          <Calendar size={14} />
          <span>Ends {new Date(job.expiryDate).toLocaleDateString()}</span>
        </div>
        <Link 
          to={`/jobs/${job._id}`}
          className="flex items-center gap-2 text-emerald-600 font-black text-sm hover:gap-4 transition-all"
        >
          Details
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
