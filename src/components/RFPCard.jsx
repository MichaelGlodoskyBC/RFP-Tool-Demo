import React from 'react';
import { Clock, Shield, Truck, AlertCircle } from 'lucide-react';

export default function RFPCard({ rfp, onClick, style, compact = false }) {
  const timeUntilDue = new Date(rfp.dueDate) - new Date();
  const hoursUntilDue = Math.floor(timeUntilDue / (1000 * 60 * 60));
  const daysUntilDue = Math.floor(hoursUntilDue / 24);
  const isUrgent = hoursUntilDue < 48;
  
  // Calculate priority based on urgency and completeness
  const getPriority = () => {
    if (hoursUntilDue < 48 || (daysUntilDue < 7 && rfp.completeness < 50)) {
      return { level: 'High', color: 'text-red-400', bgColor: 'bg-red-400' };
    } else if (daysUntilDue < 14 || rfp.completeness < 75) {
      return { level: 'Medium', color: 'text-amber-400', bgColor: 'bg-amber-400' };
    } else {
      return { level: 'Low', color: 'text-emerald-400', bgColor: 'bg-emerald-400' };
    }
  };
  
  const priority = getPriority();

  const paddingClass = compact ? 'p-4' : 'p-6';
  const titleClass = compact ? 'text-base' : 'text-lg';
  const spacingClass = compact ? 'mb-3' : 'mb-4';
  const gridGapClass = compact ? 'gap-3' : 'gap-4';

  return (
    <div
      onClick={onClick}
      className={`glass-card glass-card-hover rounded-xl ${paddingClass} cursor-pointer animate-slide-up`}
      style={style}
    >
      <div className={`flex items-start justify-between ${spacingClass}`}>
        <div className="flex-1 min-w-0">
          <h3 className={`${titleClass} font-bold text-white mb-1 truncate`}>{rfp.shipper}</h3>
          <p className="text-xs text-slate-400 mono">{rfp.id}</p>
        </div>
        {!compact && <StatusBadge status={rfp.status} />}
      </div>

      <div className={`grid grid-cols-2 ${gridGapClass} ${spacingClass}`}>
        <div>
          <p className="text-xs text-slate-500 mb-1">Template</p>
          <p className="text-sm text-white font-medium truncate">{rfp.template}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Mode</p>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <p className="text-sm text-white font-medium">{rfp.mode}</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Lanes</p>
          <p className="text-sm text-white font-medium">{rfp.laneCount}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Priority</p>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priority.bgColor}`}></div>
            <p className={`text-sm font-medium ${priority.color}`}>{priority.level}</p>
          </div>
        </div>
      </div>

      <div className={spacingClass}>
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>Progress</span>
          <span className="font-medium">{rfp.completeness}%</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${rfp.completeness}%` }}
          ></div>
        </div>
      </div>

      <div className={`flex items-center justify-between ${compact ? 'pt-3' : 'pt-4'} border-t border-slate-800`}>
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 flex-shrink-0 ${isUrgent ? 'text-red-400' : 'text-slate-400'}`} />
          <span className={`text-xs ${isUrgent ? 'text-red-400 font-medium' : 'text-slate-400'}`}>
            Due in {hoursUntilDue}h
          </span>
        </div>
        {rfp.hasNDA && (
          <div className="flex items-center gap-1.5 text-xs text-amber-400">
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">NDA</span>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    'In Progress': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Ready to Submit': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Pending Review': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Submitted': 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || 'bg-slate-700 text-slate-400'}`}>
      {status}
    </span>
  );
}
