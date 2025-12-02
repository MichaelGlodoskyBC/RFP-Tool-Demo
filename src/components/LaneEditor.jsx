import React, { useState, useMemo } from 'react';
import { Download, Send, Search, X, Edit2, CheckCircle, AlertTriangle, XCircle, DollarSign, MapPin, Package } from 'lucide-react';
import LaneTable from './LaneTable';
import CostStackPanel from './CostStackPanel';

export default function LaneEditor({ rfp, onBack }) {
  const [filterText, setFilterText] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedLanes, setSelectedLanes] = useState(new Set());
  const [selectedLane, setSelectedLane] = useState(null);
  const [showCostPanel, setShowCostPanel] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const filteredLanes = useMemo(() => {
    let lanes = [...rfp.lanes];
    
    if (filterText) {
      lanes = lanes.filter(lane =>
        lane.origin.toLowerCase().includes(filterText.toLowerCase()) ||
        lane.destination.toLowerCase().includes(filterText.toLowerCase()) ||
        lane.id.toLowerCase().includes(filterText.toLowerCase())
      );
    }

    lanes.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      return aVal > bVal ? multiplier : -multiplier;
    });

    return lanes;
  }, [rfp.lanes, filterText, sortField, sortDirection]);

  const stats = useMemo(() => {
    const valid = rfp.lanes.filter(l => l.status === 'Valid').length;
    const warnings = rfp.lanes.filter(l => l.status === 'Warning').length;
    const errors = rfp.lanes.filter(l => l.status === 'Error').length;
    const avgMargin = (rfp.lanes.reduce((sum, l) => sum + parseFloat(l.margin), 0) / rfp.lanes.length).toFixed(1);
    
    return { valid, warnings, errors, avgMargin };
  }, [rfp.lanes]);

  const toggleLaneSelection = (laneId) => {
    const newSelection = new Set(selectedLanes);
    if (newSelection.has(laneId)) {
      newSelection.delete(laneId);
    } else {
      newSelection.add(laneId);
    }
    setSelectedLanes(newSelection);
  };

  const selectAll = () => {
    setSelectedLanes(new Set(filteredLanes.map(l => l.id)));
  };

  const clearSelection = () => {
    setSelectedLanes(new Set());
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="glass-card rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="glass-card px-4 py-2 rounded-lg text-slate-300 hover:text-white transition-colors"
            >
              ← Back
            </button>
            <div>
              <h2 className="text-2xl font-bold text-white">{rfp.shipper}</h2>
              <p className="text-sm text-slate-400 mono">{rfp.id} • {rfp.laneCount} lanes</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="glass-card px-4 py-2 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-6 py-2.5 rounded-lg text-white font-medium transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/30">
              <Send className="w-4 h-4" />
              Submit RFP
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <StatCard icon={CheckCircle} label="Valid" value={stats.valid} color="text-emerald-400" />
          <StatCard icon={AlertTriangle} label="Warnings" value={stats.warnings} color="text-amber-400" />
          <StatCard icon={XCircle} label="Errors" value={stats.errors} color="text-red-400" />
          <StatCard icon={DollarSign} label="Avg Margin" value={`${stats.avgMargin}%`} color="text-indigo-400" />
          <StatCard icon={MapPin} label="Avg Distance" value={`${rfp.metadata.avgDistance}mi`} color="text-purple-400" />
          <StatCard icon={Package} label="Total Volume" value={rfp.metadata.totalVolume} color="text-blue-400" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass-card rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="glass-card rounded-lg px-4 py-2 flex items-center gap-3">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filter lanes..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="bg-transparent border-none text-white placeholder-slate-500 w-64 focus:outline-none"
              />
            </div>
            
            {selectedLanes.size > 0 && (
              <div className="flex items-center gap-2 animate-fade-in">
                <span className="text-sm text-slate-400">
                  {selectedLanes.size} selected
                </span>
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="glass-card px-4 py-2 rounded-lg text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium"
                >
                  Bulk Actions
                </button>
                <button
                  onClick={clearSelection}
                  className="glass-card px-3 py-2 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={selectAll}
              className="glass-card px-4 py-2 rounded-lg text-slate-300 hover:text-white transition-colors text-sm"
            >
              Select All
            </button>
            <button
              onClick={() => setShowCostPanel(!showCostPanel)}
              className={`glass-card px-4 py-2 rounded-lg transition-colors ${
                showCostPanel ? 'text-indigo-400 border-indigo-500/30' : 'text-slate-300 hover:text-white'
              }`}
            >
              Cost Stack
            </button>
          </div>
        </div>

        {/* Bulk Actions Panel */}
        {showBulkActions && (
          <div className="mt-4 pt-4 border-t border-slate-800 animate-slide-up">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <BulkActionCard title="Apply Scenario" description="Set pricing strategy" />
              <BulkActionCard title="Adjust Fuel" description="+/- surcharge" />
              <BulkActionCard title="Tag Lanes" description="Add identifiers" />
              <BulkActionCard title="Exclude" description="Remove from bid" />
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lane Table */}
        <div className={showCostPanel ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <LaneTable
            lanes={filteredLanes}
            selectedLanes={selectedLanes}
            onToggleSelection={toggleLaneSelection}
            onSelectAll={selectAll}
            onClearSelection={clearSelection}
            onSelectLane={setSelectedLane}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={(field, direction) => {
              setSortField(field);
              setSortDirection(direction);
            }}
          />
        </div>

        {/* Cost Stack Panel */}
        {showCostPanel && selectedLane && (
          <div className="lg:col-span-1 animate-slide-up">
            <CostStackPanel lane={selectedLane} onClose={() => setShowCostPanel(false)} />
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="glass-card rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function BulkActionCard({ title, description }) {
  return (
    <button className="glass-card px-4 py-3 rounded-lg text-left hover:bg-slate-800/50 transition-colors">
      <p className="text-sm font-medium text-white mb-1">{title}</p>
      <p className="text-xs text-slate-400">{description}</p>
    </button>
  );
}
