import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Stethoscope, User, LogOut, Briefcase, LayoutDashboard, Heart, PlusCircle } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between mx-4 mt-4 rounded-2xl shadow-lg border border-white/20 backdrop-blur-md">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="bg-emerald-600 p-2 rounded-xl group-hover:rotate-12 transition-all duration-300 shadow-lg shadow-emerald-200">
          <Stethoscope size={24} className="text-white" />
        </div>
        <span className="font-black text-2xl tracking-tighter bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
          MedicoJob
        </span>
      </Link>

      <div className="flex items-center gap-1">
        <NavLink to="/jobs" icon={<Briefcase size={18} />} active={isActive('/jobs')}>
          Find Jobs
        </NavLink>
        
        {user ? (
          <>
            <NavLink 
              to={user.role === 'hospital' ? "/hospital/dashboard" : "/doctor/dashboard"} 
              icon={<LayoutDashboard size={18} />}
              active={isActive('/hospital/dashboard') || isActive('/doctor/dashboard')}
            >
              Dashboard
            </NavLink>

            {user.role === 'hospital' && (
              <Link
                to="/hospital/post-job"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-100 hover:shadow-lg`}
              >
                <PlusCircle size={18} />
                <span className="hidden md:inline">Post Job</span>
              </Link>
            )}

            {user.role !== 'hospital' && (
              <NavLink to="/wishlist" icon={<Heart size={18} />} active={isActive('/wishlist')}>
                Wishlist
              </NavLink>
            )}
            
            <div className="flex items-center gap-3 border-l border-slate-200 ml-4 pl-6">
              <Link to="/profile" className={`flex items-center gap-3 p-1.5 rounded-2xl transition-all hover:bg-slate-50 ${isActive('/profile') ? 'bg-slate-50' : ''}`}>
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-md">
                  <User size={20} className="text-emerald-400" />
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs font-black text-slate-900 leading-none">{user.name}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{user.role}</p>
                </div>
              </Link>
              <button 
                onClick={handleLogout}
                className="w-10 h-10 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all flex items-center justify-center active:scale-90"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 ml-4">
            <Link to="/login" className="text-slate-600 font-black text-sm hover:text-emerald-600 transition-colors px-5 py-2.5">Log In</Link>
            <Link to="/register" className="btn-primary px-6 py-2.5 shadow-emerald-200">
              Join Now
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

const NavLink = ({ to, icon, active, children }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
      active 
        ? 'text-emerald-600 bg-emerald-50/50' 
        : 'text-slate-500 hover:text-emerald-600 hover:bg-slate-50'
    }`}
  >
    {icon}
    <span className="hidden sm:inline">{children}</span>
  </Link>
);

export default Navbar;
