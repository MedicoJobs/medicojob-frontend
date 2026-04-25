import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Building2, ShieldCheck, Zap, Globe, Users, ArrowRight, PlayCircle } from 'lucide-react';

const Landing = () => {
  return (
    <div className="bg-white overflow-hidden animate-fade-in">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-52 bg-slate-900 overflow-hidden">
        <img 
          src="/assets/login-bg.png" 
          alt="Medical Tech" 
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900 to-slate-900"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8">
            <Zap size={16} className="text-emerald-400" />
            <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">Next Generation Medical Recruitment</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight mb-8 tracking-tighter max-w-5xl mx-auto">
            The World's Elite Network for <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent italic">Healthcare Excellence.</span>
          </h1>
          
          <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto mb-12">
            Bridging the gap between premier medical professionals and world-class healthcare institutions with real-time matching and verified secure profiles.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/register" className="btn-primary py-5 px-10 text-lg shadow-emerald-500/20">
              Join the Network
            </Link>
            <button className="flex items-center gap-3 text-white font-black hover:text-emerald-400 transition-colors py-4 px-8 group">
              <PlayCircle size={28} className="text-emerald-500 group-hover:scale-110 transition-transform" />
              Watch Platform Demo
            </button>
          </div>
        </div>
        
        {/* Decorative Grid */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>
      </section>

      {/* Feature Grid */}
      <section className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Engineered for Medical Precision</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Sophisticated tools for modern healthcare teams</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="group p-10 rounded-[2.5rem] bg-slate-50 hover:bg-emerald-600 transition-all duration-500 hover:-translate-y-2">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-8 group-hover:bg-white/20 group-hover:text-white transition-colors">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-2xl font-black mb-4 text-slate-900 group-hover:text-white">Verified Credentials</h3>
              <p className="text-slate-500 font-medium leading-relaxed group-hover:text-emerald-100">
                Our strict verification protocol ensures every license and board certification is authenticated by our medical board.
              </p>
            </div>

            <div className="group p-10 rounded-[2.5rem] bg-slate-50 hover:bg-blue-600 transition-all duration-500 hover:-translate-y-2">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-8 group-hover:bg-white/20 group-hover:text-white transition-colors">
                <Zap size={32} />
              </div>
              <h3 className="text-2xl font-black mb-4 text-slate-900 group-hover:text-white">Smart Match™</h3>
              <p className="text-slate-500 font-medium leading-relaxed group-hover:text-blue-100">
                Advanced scoring algorithms analyze specialization, availability, and geo-location to find the perfect professional-job fit.
              </p>
            </div>

            <div className="group p-10 rounded-[2.5rem] bg-slate-50 hover:bg-slate-900 transition-all duration-500 hover:-translate-y-2">
              <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-600 mb-8 group-hover:bg-white/20 group-hover:text-white transition-colors">
                <Globe size={32} />
              </div>
              <h3 className="text-2xl font-black mb-4 text-slate-900 group-hover:text-white">Geo-Presence</h3>
              <p className="text-slate-500 font-medium leading-relaxed group-hover:text-slate-400">
                Real-time location indexing allows hospitals to find nearby emergency support and doctors to find local opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dual CTA Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white p-12 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-8">
                <Stethoscope size={28} />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4">For Professionals</h3>
              <p className="text-slate-500 font-medium text-lg mb-8">
                Elevate your career with curated opportunities that match your specialization and lifestyle. 
                One-click applications and real-time status tracking.
              </p>
            </div>
            <Link to="/register" className="flex items-center gap-3 text-emerald-600 font-black text-lg hover:gap-5 transition-all group">
              Register as Doctor
              <ArrowRight size={24} />
            </Link>
          </div>

          <div className="bg-slate-900 p-12 rounded-[3rem] shadow-xl shadow-slate-900/20 text-white flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-8">
                <Building2 size={28} />
              </div>
              <h3 className="text-3xl font-black mb-4">For Institutions</h3>
              <p className="text-slate-400 font-medium text-lg mb-8">
                Streamline your medical staffing with access to a verified talent pool. 
                Automated filtering and professional review tools at your fingertips.
              </p>
            </div>
            <Link to="/register" className="flex items-center gap-3 text-emerald-400 font-black text-lg hover:gap-5 transition-all group">
              Register Institution
              <ArrowRight size={24} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
             <div className="bg-emerald-600 p-2 rounded-xl">
               <Stethoscope size={20} className="text-white" />
             </div>
             <span className="text-xl font-black tracking-tighter text-slate-900">MedicoJob</span>
          </div>
          <div className="flex gap-12">
            <Link to="/jobs" className="text-sm font-black text-slate-400 hover:text-emerald-600 uppercase tracking-widest">Job Board</Link>
            <Link to="/login" className="text-sm font-black text-slate-400 hover:text-emerald-600 uppercase tracking-widest">Portal Access</Link>
            <span className="text-sm font-black text-slate-300 uppercase tracking-widest cursor-default">© 2026 MedicoJob</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
