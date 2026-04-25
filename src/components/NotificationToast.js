import React, { useEffect } from 'react';
import { X, Bell } from 'lucide-react';

const NotificationToast = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-4 min-w-[300px] flex gap-4 items-start relative overflow-hidden">
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${notification.type === 'success' ? 'bg-healthTeal' : 'bg-blue-500'}`} />
        
        <div className={`p-2 rounded-lg ${notification.type === 'success' ? 'bg-teal-50 text-healthTeal' : 'bg-blue-50 text-blue-500'}`}>
          <Bell size={20} />
        </div>
        
        <div className="flex-grow pr-6">
          <h4 className="font-bold text-slate-800 text-sm">{notification.title}</h4>
          <p className="text-slate-600 text-sm mt-1">{notification.message}</p>
        </div>

        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors absolute right-4 top-4"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
