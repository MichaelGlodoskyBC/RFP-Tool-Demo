import React from 'react';
import { Clock, Shield, Truck } from 'lucide-react';

export default function RFPCard({ rfp, onClick, style }) {
  const timeUntilDue = new Date(rfp.dueDate) - new Date();
  const hoursUntilDue = Math.floor(timeUntilDue / (1000 * 60 * 60));
  const isUrgent = hoursUntilDue < 48;

  return (
    <div
      onClick={onClick}
      className="glass-card glass-card-hover rounded-xl p-6 cursor-pointer animate-slide-up"
      style={style}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">{rfp.shipper}</h3>
          <p className="text-sm text-slate-400 mono">{rfp.id}</p>
        </div>
        <StatusBadge status={rfp.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-slate-500 mb-1">Template</p>
          <p className="text-sm text-white font-medium">{rfp.template}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Mode</p>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-indigo-400" />
            <p className="text-sm text-white font-medium">{rfp.mode}</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Lanes</p>
          <p className="text-sm text-white font-medium">{rfp.laneCount}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Triage Score</p>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              rfp.triageScore >= 8 ? 'bg-emerald-400' :
              rfp.triageScore >= 6 ? 'bg-yellow-400' : 'bg-red-400'
            }`}></div>
            <p className="text-sm text-white font-medium">{rfp.triageScore}/10</p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>Completeness</span>
          <span className="font-medium">{rfp.completeness}%</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${rfp.completeness}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${isUrgent ? 'text-red-400' : 'text-slate-400'}`} />
          <span className={`text-sm ${isUrgent ? 'text-red-400 font-medium' : 'text-slate-400'}`}>
            Due in {hoursUntilDue}h
          </span>
        </div>
        {rfp.hasNDA && (
          <div className="flex items-center gap-1.5 text-xs text-amber-400">
            <Shield className="w-3.5 h-3.5" />
            NDA
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
