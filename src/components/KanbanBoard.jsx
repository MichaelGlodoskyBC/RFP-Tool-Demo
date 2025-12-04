import React, { useMemo } from 'react';
import RFPCard from './RFPCard';

// Map RFP status to kanban stage
function getStageFromStatus(status) {
  const statusLower = status?.toLowerCase() || '';
  
  if (statusLower.includes('awarded')) return 'awarded';
  if (statusLower.includes('submitted') || statusLower.includes('ready to submit')) return 'submitted';
  if (statusLower.includes('in progress') || statusLower.includes('progress')) return 'active';
  // Default to inbox for new/pending RFPs (Pending Review, etc.)
  return 'inbox';
}

const stages = [
  { 
    id: 'inbox', 
    label: 'Inbox', 
    badgeClass: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
  },
  { 
    id: 'active', 
    label: 'In Progress', 
    badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  },
  { 
    id: 'submitted', 
    label: 'Submitted', 
    badgeClass: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  },
  { 
    id: 'awarded', 
    label: 'Awarded', 
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  }
];

export default function KanbanBoard({ rfps, onSelectRFP }) {
  // Group RFPs by stage
  const rfpsByStage = useMemo(() => {
    const grouped = {
      inbox: [],
      active: [],
      submitted: [],
      awarded: []
    };
    
    rfps.forEach(rfp => {
      const stage = getStageFromStatus(rfp.status);
      grouped[stage].push(rfp);
    });
    
    return grouped;
  }, [rfps]);

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max px-2">
        {stages.map((stage) => {
          const stageRFPs = rfpsByStage[stage.id] || [];
          const count = stageRFPs.length;
          
          return (
            <div
              key={stage.id}
              className="flex-shrink-0 w-80 flex flex-col"
            >
              {/* Column Header */}
              <div className="glass-card rounded-lg p-4 mb-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-white text-sm">{stage.label}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full border ${stage.badgeClass}`}>
                    {count}
                  </span>
                </div>
              </div>

              {/* Column Content */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-300px)] pr-2">
                {stageRFPs.length === 0 ? (
                  <div className="glass-card rounded-lg p-8 text-center">
                    <p className="text-slate-500 text-sm">No RFPs in this stage</p>
                  </div>
                ) : (
                  stageRFPs.map((rfp, index) => (
                    <div
                      key={rfp.id}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <RFPCard
                        rfp={rfp}
                        onClick={() => onSelectRFP(rfp)}
                        compact={true}
                      />
                    </div>
                  ))
                )}
              </div>

              {/* Column Footer - Total Amount (if needed) */}
              {stageRFPs.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <p className="text-xs text-slate-500 text-center">
                    {count} {count === 1 ? 'RFP' : 'RFPs'}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

