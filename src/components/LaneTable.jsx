import React from 'react';
import { Edit2, ChevronUp, ChevronDown, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { scenarios } from '../data/demoData';

export default function LaneTable({ 
  lanes, 
  selectedLanes, 
  onToggleSelection, 
  onSelectAll, 
  onClearSelection,
  onSelectLane,
  sortField,
  sortDirection,
  onSort
}) {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedLanes.size === lanes.length}
                  onChange={() => selectedLanes.size === lanes.length ? onClearSelection() : onSelectAll()}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900"
                />
              </th>
              <SortableHeader 
                field="id" 
                label="Lane" 
                sortField={sortField} 
                sortDirection={sortDirection} 
                onSort={onSort} 
              />
              <SortableHeader 
                field="origin" 
                label="Origin" 
                sortField={sortField} 
                sortDirection={sortDirection} 
                onSort={onSort} 
              />
              <SortableHeader 
                field="destination" 
                label="Destination" 
                sortField={sortField} 
                sortDirection={sortDirection} 
                onSort={onSort} 
              />
              <SortableHeader 
                field="distance" 
                label="Distance" 
                sortField={sortField} 
                sortDirection={sortDirection} 
                onSort={onSort} 
              />
              <SortableHeader 
                field="baseRate" 
                label="Rate" 
                sortField={sortField} 
                sortDirection={sortDirection} 
                onSort={onSort} 
              />
              <SortableHeader 
                field="margin" 
                label="Margin" 
                sortField={sortField} 
                sortDirection={sortDirection} 
                onSort={onSort} 
              />
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Scenario</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lanes.slice(0, 50).map((lane) => (
              <tr
                key={lane.id}
                className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer ${
                  selectedLanes.has(lane.id) ? 'bg-indigo-900/20' : ''
                }`}
                onClick={() => onSelectLane(lane)}
              >
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedLanes.has(lane.id)}
                    onChange={() => onToggleSelection(lane.id)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-white mono">{lane.id}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{lane.origin}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{lane.destination}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{lane.distance}mi</td>
                <td className="px-4 py-3 text-sm text-white font-medium">${lane.baseRate}/mi</td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-medium ${
                    parseFloat(lane.margin) < 8 ? 'text-red-400' :
                    parseFloat(lane.margin) < 12 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {lane.margin}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ScenarioBadge scenario={lane.scenario} />
                </td>
                <td className="px-4 py-3">
                  <LaneStatusIndicator status={lane.status} />
                </td>
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <button className="text-slate-400 hover:text-white transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {lanes.length > 50 && (
        <div className="px-6 py-4 border-t border-slate-800 text-center">
          <p className="text-sm text-slate-400">
            Showing 50 of {lanes.length} lanes
          </p>
        </div>
      )}
    </div>
  );
}

function SortableHeader({ field, label, sortField, sortDirection, onSort }) {
  const isActive = sortField === field;
  
  return (
    <th
      onClick={() => onSort(field, isActive && sortDirection === 'asc' ? 'desc' : 'asc')}
      className="px-4 py-3 text-left text-xs font-medium text-slate-400 cursor-pointer hover:text-white transition-colors"
    >
      <div className="flex items-center gap-2">
        {label}
        {isActive && (
          sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
        )}
      </div>
    </th>
  );
}

function ScenarioBadge({ scenario }) {
  const config = scenarios.find(s => s.name === scenario);
  if (!config) return <span className="text-xs text-slate-400">{scenario}</span>;
  
  return (
    <span
      className="px-2 py-1 rounded text-xs font-medium"
      style={{
        backgroundColor: `${config.color}20`,
        color: config.color,
        border: `1px solid ${config.color}30`
      }}
    >
      {scenario}
    </span>
  );
}

function LaneStatusIndicator({ status }) {
  const config = {
    Valid: { color: 'text-emerald-400', icon: CheckCircle },
    Warning: { color: 'text-amber-400', icon: AlertTriangle },
    Error: { color: 'text-red-400', icon: XCircle }
  };
  
  const { color, icon: Icon } = config[status] || config.Valid;
  
  return (
    <div className="flex items-center gap-2">
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
  );
}
