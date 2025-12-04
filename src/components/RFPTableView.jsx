import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, MoreVertical, Clock, Shield } from 'lucide-react';

export default function RFPTableView({ rfps, onSelectRFP, selectedRFPs = new Set(), onToggleSelection, onSelectAll }) {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedRFPs = useMemo(() => {
    if (!sortField) return rfps;

    return [...rfps].sort((a, b) => {
      let aVal, bVal;

      switch (sortField) {
        case 'shipper':
          aVal = a.shipper?.toLowerCase() || '';
          bVal = b.shipper?.toLowerCase() || '';
          break;
        case 'id':
          aVal = a.id?.toLowerCase() || '';
          bVal = b.id?.toLowerCase() || '';
          break;
        case 'status':
          aVal = a.status?.toLowerCase() || '';
          bVal = b.status?.toLowerCase() || '';
          break;
        case 'dueDate':
          aVal = new Date(a.dueDate).getTime();
          bVal = new Date(b.dueDate).getTime();
          break;
        case 'laneCount':
          aVal = a.laneCount || 0;
          bVal = b.laneCount || 0;
          break;
        case 'completeness':
          aVal = a.completeness || 0;
          bVal = b.completeness || 0;
          break;
        case 'priority':
          // Calculate priority for sorting (High=3, Medium=2, Low=1)
          const getPriorityValue = (rfp) => {
            const timeUntilDue = new Date(rfp.dueDate) - new Date();
            const hoursUntilDue = Math.floor(timeUntilDue / (1000 * 60 * 60));
            const daysUntilDue = Math.floor(hoursUntilDue / 24);
            if (hoursUntilDue < 48 || (daysUntilDue < 7 && rfp.completeness < 50)) return 3; // High
            if (daysUntilDue < 14 || rfp.completeness < 75) return 2; // Medium
            return 1; // Low
          };
          aVal = getPriorityValue(a);
          bVal = getPriorityValue(b);
          break;
        case 'template':
          aVal = a.template?.toLowerCase() || '';
          bVal = b.template?.toLowerCase() || '';
          break;
        case 'mode':
          aVal = a.mode?.toLowerCase() || '';
          bVal = b.mode?.toLowerCase() || '';
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [rfps, sortField, sortDirection]);

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

    // Format time in CST/CDT (simplified - in production, use proper timezone handling)
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Chicago'
    });
    const tzStr = date.toLocaleDateString('en-US', { timeZone: 'America/Chicago' }).includes('CDT') ? 'CDT' : 'CST';

    if (diffDays === 0) return `Today at ${timeStr} ${tzStr}`;
    if (diffDays === 1) return `Tomorrow at ${timeStr} ${tzStr}`;
    if (diffDays === -1) return `Yesterday at ${timeStr} ${tzStr}`;
    if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Chicago'
    }) + ` ${tzStr}`;
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('awarded')) return 'text-emerald-400 bg-emerald-500/10';
    if (statusLower.includes('submitted') || statusLower.includes('ready to submit')) return 'text-purple-400 bg-purple-500/10';
    if (statusLower.includes('in progress') || statusLower.includes('progress')) return 'text-blue-400 bg-blue-500/10';
    if (statusLower.includes('pending')) return 'text-amber-400 bg-amber-500/10';
    return 'text-slate-400 bg-slate-500/10';
  };

  const allSelected = rfps.length > 0 && rfps.every(rfp => selectedRFPs.has(rfp.id));
  const someSelected = rfps.some(rfp => selectedRFPs.has(rfp.id));

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return (
        <div className="flex flex-col ml-1">
          <ChevronUp className="w-3 h-3 text-slate-500" />
          <ChevronDown className="w-3 h-3 text-slate-500 -mt-1" />
        </div>
      );
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-indigo-400 ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 text-indigo-400 ml-1" />
    );
  };

  return (
    <div className="glass-card rounded-lg overflow-hidden border border-slate-700/50">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-800/70 border-b border-slate-700">
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected && !allSelected;
                  }}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onSelectAll?.(rfps.map(r => r.id));
                    } else {
                      onSelectAll?.([]);
                    }
                  }}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-2"
                />
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('shipper')}
              >
                <div className="flex items-center">
                  RFP Name
                  <SortIcon field="shipper" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center">
                  RFP ID
                  <SortIcon field="id" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status
                  <SortIcon field="status" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('dueDate')}
              >
                <div className="flex items-center">
                  Due Date
                  <SortIcon field="dueDate" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('laneCount')}
              >
                <div className="flex items-center">
                  Lanes
                  <SortIcon field="laneCount" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('completeness')}
              >
                <div className="flex items-center">
                  Progress
                  <SortIcon field="completeness" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('priority')}
              >
                <div className="flex items-center">
                  Priority
                  <SortIcon field="priority" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('template')}
              >
                <div className="flex items-center">
                  Template
                  <SortIcon field="template" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('mode')}
              >
                <div className="flex items-center">
                  Mode
                  <SortIcon field="mode" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <div className="flex items-center">
                  Actions
                  <MoreVertical className="w-4 h-4 text-slate-500 ml-1" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {sortedRFPs.map((rfp) => {
              const timeUntilDue = new Date(rfp.dueDate) - new Date();
              const hoursUntilDue = Math.floor(timeUntilDue / (1000 * 60 * 60));
              const daysUntilDue = Math.floor(hoursUntilDue / 24);
              const isUrgent = hoursUntilDue < 48;
              
              // Calculate priority
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

              return (
                <tr
                  key={rfp.id}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer border-b border-slate-800/30"
                  onClick={() => onSelectRFP(rfp)}
                >
                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedRFPs.has(rfp.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        onToggleSelection?.(rfp.id);
                      }}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-2"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-indigo-400 hover:text-indigo-300">
                        {rfp.shipper}
                      </span>
                      {rfp.hasNDA && (
                        <Shield className="w-3.5 h-3.5 text-amber-400" title="NDA Required" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-slate-400 mono">{rfp.id}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(rfp.status)}`}>
                      {rfp.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Clock className={`w-4 h-4 ${isUrgent ? 'text-red-400' : 'text-slate-500'}`} />
                      <span className={`text-sm ${isUrgent ? 'text-red-400 font-medium' : 'text-slate-300'}`}>
                        {formatDate(rfp.dueDate)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-slate-300">{rfp.laneCount}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            rfp.completeness >= 100 ? 'bg-emerald-500' :
                            rfp.completeness >= 75 ? 'bg-indigo-500' :
                            rfp.completeness >= 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${rfp.completeness}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-300 w-10 text-right">{rfp.completeness}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${priority.bgColor}`} />
                      <span className={`text-sm font-medium ${priority.color}`}>{priority.level}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-slate-300">{rfp.template}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-slate-300">{rfp.mode}</span>
                  </td>
                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    <button className="text-slate-400 hover:text-white transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {sortedRFPs.length === 0 && (
        <div className="px-4 py-12 text-center">
          <p className="text-slate-500">No RFPs found</p>
        </div>
      )}
    </div>
  );
}

