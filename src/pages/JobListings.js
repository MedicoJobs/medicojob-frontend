import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import JobCard from '../components/JobCard';
import {
  Search, MapPin, Briefcase, DollarSign, Filter, X,
  ChevronDown, SlidersHorizontal, Trash2, Map, Navigation, Clock
} from 'lucide-react';
import { debounce } from 'lodash';

const SPECIALIZATIONS = [
  'Cardiology', 'Pediatrics', 'Nursing', 'Orthopedics',
  'Emergency', 'General Practice', 'Radiology', 'Surgery'
];

const JOB_TYPES = ['full-time', 'part-time', 'emergency', 'locum'];

const JobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    specialization: '',
    location: '',
    minSalary: '',
    type: ''
  });
  const [nearbyMode, setNearbyMode] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Fetch jobs with filters
  const fetchJobs = useCallback(async (currentFilters, isNearby = false, coords = null) => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/jobs`;

      // If nearby mode is active, we use the location service (Port 5005)
      if (isNearby && coords) {
        url = `${API_BASE_URL}/nearby/jobs?lat=${coords.lat}&lng=${coords.lng}&distance=50000`; // 50km radius
        const res = await axios.get(url);
        // Location service returns location objects, we need to fetch the actual jobs
        const jobIds = res.data.map(l => l.entityId);
        if (jobIds.length > 0) {
          const jobsRes = await axios.get(`${API_BASE_URL}/jobs`);
          setJobs(jobsRes.data.filter(j => jobIds.includes(j._id)));
        } else {
          setJobs([]);
        }
      } else {
        const params = new URLSearchParams();
        if (currentFilters.specialization) params.append('specialization', currentFilters.specialization);
        if (currentFilters.type) params.append('type', currentFilters.type);
        if (currentFilters.location) params.append('location', currentFilters.location);

        const res = await axios.get(`${url}?${params.toString()}`);

        // Client-side filtering for search and salary
        let filtered = res.data;
        if (currentFilters.search) {
          filtered = filtered.filter(j => j.title.toLowerCase().includes(currentFilters.search.toLowerCase()));
        }
        if (currentFilters.minSalary) {
          filtered = filtered.filter(j => j.salary >= Number(currentFilters.minSalary));
        }
        setJobs(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetch = useCallback(
    debounce((f) => fetchJobs(f, false), 450),
    [fetchJobs]
  );

  useEffect(() => {
    if (!nearbyMode) {
      if (filters.search || filters.minSalary) {
        debouncedFetch(filters);
      } else {
        fetchJobs(filters);
      }
    }
    return () => debouncedFetch.cancel();
  }, [filters, debouncedFetch, fetchJobs, nearbyMode]);

  const handleNearbySearch = () => {
    if (nearbyMode) {
      setNearbyMode(false);
      fetchJobs(filters);
      return;
    }

    setLocationLoading(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setNearbyMode(true);
        fetchJobs(filters, true, coords);
        setLocationLoading(false);
      },
      () => {
        alert("Unable to retrieve your location. Showing all jobs.");
        setLocationLoading(false);
        setNearbyMode(false);
      }
    );
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setNearbyMode(false);
  };

  const clearFilters = () => {
    setFilters({ search: '', specialization: '', location: '', minSalary: '', type: '' });
    setNearbyMode(false);
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length + (nearbyMode ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">Discover Your <span className="text-emerald-600">Next Chapter</span></h1>
          <p className="text-slate-500 font-bold text-lg max-w-2xl">Browse thousands of high-impact medical opportunities across the network.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-2xl">
          <button
            onClick={handleNearbySearch}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-sm transition-all shadow-sm ${nearbyMode ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 hover:text-emerald-600'}`}
          >
            {locationLoading ? <Clock size={18} className="animate-spin" /> : nearbyMode ? <Map size={18} /> : <Navigation size={18} />}
            {nearbyMode ? 'Nearby Mode Active' : 'Find Nearby Jobs'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Filters */}
        <aside className="lg:w-80 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-28">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                Filters
                {activeFiltersCount > 0 && <span className="bg-emerald-100 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full">{activeFiltersCount}</span>}
              </h3>
              <button onClick={clearFilters} className="text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Keywords</label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="Title, keywords..."
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold focus:bg-white focus:border-emerald-100 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Specialization */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Specialization</label>
                <div className="relative">
                  <select
                    value={filters.specialization}
                    onChange={(e) => updateFilter('specialization', e.target.value)}
                    className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold focus:bg-white focus:border-emerald-100 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    {SPECIALIZATIONS.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="City or state..."
                    value={filters.location}
                    onChange={(e) => updateFilter('location', e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold focus:bg-white focus:border-emerald-100 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Salary */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Min Salary (Annual)</label>
                <div className="relative group">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <input
                    type="number"
                    placeholder="e.g. 500000"
                    value={filters.minSalary}
                    onChange={(e) => updateFilter('minSalary', e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold focus:bg-white focus:border-emerald-100 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Status Indicator */}
              <div className="pt-4 border-t border-slate-50">
                <div className="flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                  <span>Engine Status</span>
                  <span className="text-emerald-500">Live & Syncing</span>
                </div>
                <p className="text-[8px] text-slate-300 mt-1 italic">Location Service Integrated (Port 5005)</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Job Grid */}
        <main className="flex-grow space-y-8">
          {/* Quick Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            {JOB_TYPES.map(type => (
              <button
                key={type}
                onClick={() => updateFilter('type', filters.type === type ? '' : type)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${filters.type === type ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white text-slate-500 border border-slate-100 hover:border-emerald-200'}`}
              >
                {type}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map(n => <div key={n} className="bg-white h-72 rounded-[2.5rem] animate-pulse border border-slate-100 shadow-sm"></div>)}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-slate-400 font-bold text-sm">Showing <span className="text-slate-900">{jobs.length}</span> opportunities</p>
                {nearbyMode && <span className="text-xs bg-amber-50 text-amber-600 px-3 py-1 rounded-full font-black uppercase italic">Proximity Search Enabled</span>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {jobs.map(job => <JobCard key={job._id} job={job} />)}
              </div>
              {jobs.length === 0 && (
                <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Search size={32} className="text-slate-200" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-2">No matching jobs found</h3>
                  <p className="text-slate-500 font-medium">Try adjusting your filters or clearing them to see more results.</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default JobListings;
