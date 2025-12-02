import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Download, Send, Search, X, Edit2, CheckCircle, AlertTriangle, XCircle, DollarSign, MapPin, Package, Filter, Award, Undo, Redo, Save } from 'lucide-react';
import LaneTable from './LaneTable';
import CostStackPanel from './CostStackPanel';
import BulkActionsModal from './BulkActionsModal';
import { exportToExcel } from '../utils/exportUtils';
import { getActiveTemplate } from '../utils/templateStorage';

export default function LaneEditor({ rfp, onBack, onRFPUpdate }) {
  const [currentRFP, setCurrentRFP] = useState(rfp);
  const historyRef = useRef([JSON.parse(JSON.stringify(rfp))]);
  const historyIndexRef = useRef(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedLanes, setSelectedLanes] = useState(new Set());
  const [selectedLane, setSelectedLane] = useState(null);
  const [showCostPanel, setShowCostPanel] = useState(false);
  const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Update current RFP when prop changes
  useEffect(() => {
    setCurrentRFP(rfp);
    historyRef.current = [JSON.parse(JSON.stringify(rfp))];
    historyIndexRef.current = 0;
    setHasUnsavedChanges(false);
  }, [rfp]);

  const addToHistory = (newRFP) => {
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push(JSON.parse(JSON.stringify(newRFP)));
    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
    setHasUnsavedChanges(true);
  };

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  const handleUndo = () => {
    if (canUndo) {
      historyIndexRef.current--;
      const previousRFP = historyRef.current[historyIndexRef.current];
      setCurrentRFP(previousRFP);
      if (onRFPUpdate) {
        onRFPUpdate(previousRFP);
      }
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      historyIndexRef.current++;
      const nextRFP = historyRef.current[historyIndexRef.current];
      setCurrentRFP(nextRFP);
      if (onRFPUpdate) {
        onRFPUpdate(nextRFP);
      }
    }
  };

  const handleLaneUpdate = (updatedLane) => {
    const updatedLanes = currentRFP.lanes.map(lane =>
      lane.id === updatedLane.id ? updatedLane : lane
    );
    
    const updatedRFP = {
      ...currentRFP,
      lanes: updatedLanes,
      laneCount: updatedLanes.length
    };
    
    setCurrentRFP(updatedRFP);
    addToHistory(updatedRFP);
    
    if (onRFPUpdate) {
      onRFPUpdate(updatedRFP);
    }
  };

  const filteredLanes = useMemo(() => {
    let lanes = [...currentRFP.lanes];
    
    // Text search filter
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
  }, [currentRFP.lanes, filterText, sortField, sortDirection]);

  const stats = useMemo(() => {
    const valid = currentRFP.lanes.filter(l => l.status === 'Valid').length;
    const warnings = currentRFP.lanes.filter(l => l.status === 'Warning').length;
    const errors = currentRFP.lanes.filter(l => l.status === 'Error').length;
    const avgMargin = (currentRFP.lanes.reduce((sum, l) => sum + parseFloat(l.margin), 0) / currentRFP.lanes.length).toFixed(1);
    
    return { valid, warnings, errors, avgMargin };
  }, [currentRFP.lanes]);

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

  const handleBulkActionApply = (updates) => {
    const updatedLanes = currentRFP.lanes.map(lane => {
      const update = updates.find(u => u.laneId === lane.id);
      if (update) {
        return {
          ...lane,
          baseRate: update.newRate.toFixed(2),
          margin: update.newMargin.toFixed(1),
          scenario: update.scenario,
          status: parseFloat(update.newMargin) < 8 ? 'Error' : parseFloat(update.newMargin) < 12 ? 'Warning' : 'Valid'
        };
      }
      return lane;
    });

    const updatedRFP = {
      ...currentRFP,
      lanes: updatedLanes
    };

    setCurrentRFP(updatedRFP);
    addToHistory(updatedRFP);
    
    if (onRFPUpdate) {
      onRFPUpdate(updatedRFP);
    }

    setSelectedLanes(new Set());
  };

  const handleExport = (format) => {
    const template = getActiveTemplate();
    exportToExcel(currentRFP.lanes, format, template);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="glass-card rounded-xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <button
              onClick={onBack}
              className="glass-card px-4 py-2 rounded-lg text-slate-300 hover:text-white transition-colors flex-shrink-0"
            >
              ← Back
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl lg:text-2xl font-bold text-white truncate">{currentRFP.shipper}</h2>
                {hasUnsavedChanges && (
                  <span className="text-xs text-amber-400 flex items-center gap-1 flex-shrink-0">
                    <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                    Unsaved changes
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 mono truncate">{currentRFP.id} • {currentRFP.laneCount} lanes</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1">
              <button
                onClick={handleUndo}
                disabled={!canUndo}
                className="glass-card px-2.5 py-2 rounded-lg text-slate-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={!canRedo}
                className="glass-card px-2.5 py-2 rounded-lg text-slate-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Redo"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => setShowExportModal(true)}
              className="glass-card px-4 py-2 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-4 lg:px-6 py-2.5 rounded-lg text-white font-medium transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/30 whitespace-nowrap">
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Submit RFP</span>
              <span className="sm:hidden">Submit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="glass-card rounded-xl p-6 mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <StatCard icon={CheckCircle} label="Valid" value={stats.valid} color="text-emerald-400" />
          <StatCard icon={AlertTriangle} label="Warnings" value={stats.warnings} color="text-amber-400" />
          <StatCard icon={XCircle} label="Errors" value={stats.errors} color="text-red-400" />
          <StatCard icon={DollarSign} label="Avg Margin" value={`${stats.avgMargin}%`} color="text-indigo-400" />
          <StatCard icon={MapPin} label="Avg Distance" value={`${currentRFP.metadata.avgDistance}mi`} color="text-purple-400" />
          <StatCard icon={Package} label="Total Volume" value={currentRFP.metadata.totalVolume} color="text-blue-400" />
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
                  onClick={() => setShowBulkActionsModal(true)}
                  className="glass-card px-4 py-2 rounded-lg text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium"
                >
                  Apply Scenario
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
            onLaneUpdate={handleLaneUpdate}
          />
        </div>

        {/* Cost Stack Panel */}
        {showCostPanel && selectedLane && (
          <div className="lg:col-span-1 animate-slide-up">
            <CostStackPanel lane={selectedLane} onClose={() => setShowCostPanel(false)} />
          </div>
        )}
      </div>

      {/* Modals */}
      <BulkActionsModal
        isOpen={showBulkActionsModal}
        onClose={() => setShowBulkActionsModal(false)}
        selectedLanes={selectedLanes}
        lanes={currentRFP.lanes}
        onApply={handleBulkActionApply}
      />

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
        />
      )}
    </div>
  );
}

function ExportModal({ isOpen, onClose, onExport }) {
  const [format, setFormat] = useState('custom');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative glass-card rounded-2xl p-6 w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Export Lanes</h2>
          <button
            onClick={onClose}
            className="glass-card p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-3">Export Format</label>
          <div className="space-y-2">
            <button
              onClick={() => setFormat('custom')}
              className={`w-full glass-card px-4 py-3 rounded-lg text-left transition-all ${
                format === 'custom' ? 'border-2 border-indigo-500 bg-indigo-500/20' : 'border border-slate-700'
              }`}
            >
              <p className="text-sm font-medium text-white">Standard Format</p>
              <p className="text-xs text-slate-400">All lane details with cost breakdown</p>
            </button>
            <button
              onClick={() => setFormat('tms')}
              className={`w-full glass-card px-4 py-3 rounded-lg text-left transition-all ${
                format === 'tms' ? 'border-2 border-indigo-500 bg-indigo-500/20' : 'border border-slate-700'
              }`}
            >
              <p className="text-sm font-medium text-white">TMS Format</p>
              <p className="text-xs text-slate-400">Simplified format for TMS import</p>
            </button>
            <button
              onClick={() => setFormat('original')}
              className={`w-full glass-card px-4 py-3 rounded-lg text-left transition-all ${
                format === 'original' ? 'border-2 border-indigo-500 bg-indigo-500/20' : 'border border-slate-700'
              }`}
            >
              <p className="text-sm font-medium text-white">Original Template</p>
              <p className="text-xs text-slate-400">Match original upload format (if template available)</p>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="glass-card px-6 py-2.5 rounded-lg text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onExport(format);
              onClose();
            }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-6 py-2.5 rounded-lg text-white font-medium transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/30"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
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

