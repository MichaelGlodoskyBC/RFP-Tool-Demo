import React, { useState, useMemo, useEffect } from 'react';
import { Download, Send, Search, X, Edit2, CheckCircle, AlertTriangle, XCircle, DollarSign, MapPin, Package, Filter, Award, Save, Table2, Map, Zap } from 'lucide-react';
import LaneTable from './LaneTable';
import MapView from './MapView';
import CostStackPanel from './CostStackPanel';
import BulkActionsModal from './BulkActionsModal';
import SubmissionWizard from './SubmissionWizard';
import { exportToExcel } from '../utils/exportUtils';
import { getActiveTemplate } from '../utils/templateStorage';
import { useUndoRedo } from '../hooks/useUndoRedo';
import { getLaneStatus } from '../constants/marginThresholds';
import { preSolveRates } from '../utils/rateCalculator';

export default function LaneEditor({ rfp, onBack, onRFPUpdate }) {
  // Use undo/redo hook
  const {
    value: currentRFP,
    setValue: setCurrentRFP,
    reset: resetHistory,
    hasUnsavedChanges,
    setHasUnsavedChanges
  } = useUndoRedo(rfp, onRFPUpdate);

  const [filterText, setFilterText] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedLanes, setSelectedLanes] = useState(new Set());
  const [selectedLane, setSelectedLane] = useState(null);
  const [showCostPanel, setShowCostPanel] = useState(false);
  const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSubmissionWizard, setShowSubmissionWizard] = useState(false);
  const [showAutoSolveModal, setShowAutoSolveModal] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'map'

  // Update current RFP when prop changes
  useEffect(() => {
    resetHistory(rfp);
  }, [rfp, resetHistory]);

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
          status: getLaneStatus(update.newMargin)
        };
      }
      return lane;
    });

    const updatedRFP = {
      ...currentRFP,
      lanes: updatedLanes
    };

    setCurrentRFP(updatedRFP);

    setSelectedLanes(new Set());
  };

  const handleExport = (format) => {
    const template = getActiveTemplate();
    exportToExcel(currentRFP.lanes, format, template);
  };

  // Calculate completeness based on valid lanes
  const calculatedCompleteness = useMemo(() => {
    if (currentRFP.lanes.length === 0) return 0;
    const validLanes = currentRFP.lanes.filter(l => l.status === 'Valid').length;
    return Math.round((validLanes / currentRFP.lanes.length) * 100);
  }, [currentRFP.lanes]);

  // Prepare RFP with calculated completeness for submission
  const rfpForSubmission = useMemo(() => {
    return {
      ...currentRFP,
      completeness: currentRFP.completeness !== undefined ? currentRFP.completeness : calculatedCompleteness
    };
  }, [currentRFP, calculatedCompleteness]);

  const handleSubmissionSubmit = (submissionData) => {
    // Export the RFP in the selected format
    const template = getActiveTemplate();
    exportToExcel(currentRFP.lanes, submissionData.format, template);
    
    // Update RFP status to submitted
    const updatedRFP = {
      ...currentRFP,
      status: 'Submitted',
      submittedAt: submissionData.timestamp
    };
    
    setCurrentRFP(updatedRFP);
    if (onRFPUpdate) {
      onRFPUpdate(updatedRFP);
    }
    
    // Close wizard after a short delay to show success message
    setTimeout(() => {
      setShowSubmissionWizard(false);
    }, 3000);
  };

  const handleAutoSolve = (targetMargin, options = {}) => {
    const solutions = preSolveRates(currentRFP.lanes, targetMargin, options);
    
    // Update all lanes with optimal rates
    const updatedLanes = currentRFP.lanes.map(lane => {
      const solution = solutions.find(s => s.laneId === lane.id);
      if (!solution) return lane;
      
      // Recalculate margin with new rate
      const updatedLane = {
        ...lane,
        baseRate: solution.newRate,
        margin: solution.newMargin,
        status: getLaneStatus(solution.newMargin),
        warnings: solution.rateTooHigh 
          ? [...(lane.warnings || []), solution.rateWarning]
          : lane.warnings || []
      };
      
      return updatedLane;
    });
    
    const updatedRFP = {
      ...currentRFP,
      lanes: updatedLanes
    };
    
    setCurrentRFP(updatedRFP);
    setShowAutoSolveModal(false);
  };

  return (
    <div className="animate-fade-in h-screen flex flex-col">
      {/* Header */}
      <div className="glass-card rounded-xl p-6 mb-6 flex-shrink-0">
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
          
          <div className="flex items-center gap-2 flex-shrink-0 flex-nowrap">
            <button
              onClick={() => setShowExportModal(true)}
              className="glass-card px-4 py-2 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button 
              onClick={() => setShowSubmissionWizard(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-4 lg:px-6 py-2.5 rounded-lg text-white font-medium transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/30 whitespace-nowrap"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Submit RFP</span>
              <span className="sm:hidden">Submit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="glass-card rounded-xl p-6 mb-6 flex-shrink-0">
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
      <div className="glass-card rounded-xl p-4 mb-6 flex-shrink-0">
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
            <div className="glass-card rounded-lg p-1 flex items-center gap-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded transition-colors text-sm flex items-center gap-2 ${
                  viewMode === 'table'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Table View"
              >
                <Table2 className="w-4 h-4" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded transition-colors text-sm flex items-center gap-2 ${
                  viewMode === 'map'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Map View"
              >
                <Map className="w-4 h-4" />
                <span className="hidden sm:inline">Map</span>
              </button>
            </div>
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
            <button
              onClick={() => setShowAutoSolveModal(true)}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-4 py-2 rounded-lg text-white font-medium transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/30"
              title="Auto-solve rates for all lanes"
            >
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Auto-Solve Rates</span>
              <span className="sm:hidden">Auto-Solve</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
          {/* Lane Table or Map View */}
          <div className={`${showCostPanel ? 'lg:col-span-2' : 'lg:col-span-3'} flex flex-col min-h-0`}>
            <div className="glass-card rounded-xl overflow-hidden flex-1 flex flex-col min-h-0">
              {viewMode === 'table' ? (
                <div className="flex-1 overflow-y-auto">
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
              ) : (
                <div className="flex-1 w-full h-full min-h-0">
                  <MapView
                    lanes={filteredLanes}
                    onLaneClick={setSelectedLane}
                    selectedLanes={selectedLanes}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Cost Stack Panel */}
          {showCostPanel && selectedLane && (
            <div className="lg:col-span-1 animate-slide-up flex-shrink-0">
              <CostStackPanel lane={selectedLane} onClose={() => setShowCostPanel(false)} />
            </div>
          )}
        </div>
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

      {/* Submission Wizard */}
      <SubmissionWizard
        isOpen={showSubmissionWizard}
        onClose={() => setShowSubmissionWizard(false)}
        rfp={rfpForSubmission}
        onSubmit={handleSubmissionSubmit}
      />

      {/* Auto-Solve Modal */}
      <AutoSolveModal
        isOpen={showAutoSolveModal}
        onClose={() => setShowAutoSolveModal(false)}
        lanes={currentRFP.lanes}
        onApply={handleAutoSolve}
      />
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

function AutoSolveModal({ isOpen, onClose, lanes, onApply }) {
  const [targetMargin, setTargetMargin] = useState('12');
  const [flagHighRates, setFlagHighRates] = useState(true);
  const [highRateThreshold, setHighRateThreshold] = useState('20');
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (isOpen && lanes.length > 0) {
      const margin = parseFloat(targetMargin) || 12;
      const threshold = parseFloat(highRateThreshold) || 20;
      const solutions = preSolveRates(lanes, margin, {
        flagHighRates,
        highRateThreshold: threshold
      });
      
      const summary = {
        totalLanes: lanes.length,
        lanesWithHighRates: solutions.filter(s => s.rateTooHigh).length,
        avgRateChange: solutions.reduce((sum, s) => sum + (s.optimalRate - s.originalRate), 0) / solutions.length,
        avgMarginChange: solutions.reduce((sum, s) => {
          const lane = lanes.find(l => l.id === s.laneId);
          return sum + (parseFloat(s.newMargin) - parseFloat(lane?.margin || 0));
        }, 0) / solutions.length,
        solutions: solutions.slice(0, 10) // Preview first 10
      };
      
      setPreview(summary);
    }
  }, [isOpen, lanes, targetMargin, flagHighRates, highRateThreshold]);

  if (!isOpen) return null;

  const handleApply = () => {
    const margin = parseFloat(targetMargin) || 12;
    const threshold = parseFloat(highRateThreshold) || 20;
    onApply(margin, {
      flagHighRates,
      highRateThreshold: threshold
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative glass-card rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Auto-Solve Rates</h2>
            <p className="text-sm text-slate-400">
              Calculate optimal rates for all {lanes.length} lanes to achieve target margin
            </p>
          </div>
          <button
            onClick={onClose}
            className="glass-card p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Margin Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Target Margin (%)
          </label>
          <div className="glass-card rounded-lg px-4 py-3 flex items-center gap-3">
            <input
              type="number"
              value={targetMargin}
              onChange={(e) => setTargetMargin(e.target.value)}
              min="0"
              max="50"
              step="0.1"
              className="bg-transparent border border-slate-700 rounded px-3 py-2 text-white w-32 focus:outline-none focus:border-indigo-500"
              placeholder="12"
            />
            <span className="text-sm text-slate-400">%</span>
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => setTargetMargin('10')}
                className="glass-card px-3 py-1 rounded text-xs text-slate-300 hover:text-white"
              >
                10%
              </button>
              <button
                onClick={() => setTargetMargin('12')}
                className="glass-card px-3 py-1 rounded text-xs text-slate-300 hover:text-white"
              >
                12%
              </button>
              <button
                onClick={() => setTargetMargin('15')}
                className="glass-card px-3 py-1 rounded text-xs text-slate-300 hover:text-white"
              >
                15%
              </button>
            </div>
          </div>
        </div>

        {/* Flag High Rates Option */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <input
              type="checkbox"
              id="flagHighRates"
              checked={flagHighRates}
              onChange={(e) => setFlagHighRates(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900"
            />
            <label htmlFor="flagHighRates" className="text-sm font-medium text-slate-300">
              Flag rates that are too high (compared to benchmarks)
            </label>
          </div>
          {flagHighRates && (
            <div className="glass-card rounded-lg px-4 py-3 ml-7">
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-400">Flag if rate exceeds benchmark by:</label>
                <input
                  type="number"
                  value={highRateThreshold}
                  onChange={(e) => setHighRateThreshold(e.target.value)}
                  min="0"
                  max="100"
                  step="5"
                  className="bg-transparent border border-slate-700 rounded px-3 py-1 text-white w-24 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-sm text-slate-400">%</span>
              </div>
            </div>
          )}
        </div>

        {/* Preview Summary */}
        {preview && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-4">Preview Summary</h3>
            
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="glass-card rounded-lg p-4">
                <p className="text-xs text-slate-400 mb-1">Total Lanes</p>
                <p className="text-2xl font-bold text-white">{preview.totalLanes}</p>
              </div>
              <div className="glass-card rounded-lg p-4">
                <p className="text-xs text-slate-400 mb-1">High Rate Flags</p>
                <p className={`text-2xl font-bold ${preview.lanesWithHighRates > 0 ? 'text-amber-400' : 'text-white'}`}>
                  {preview.lanesWithHighRates}
                </p>
              </div>
              <div className="glass-card rounded-lg p-4">
                <p className="text-xs text-slate-400 mb-1">Avg Rate Change</p>
                <p className={`text-2xl font-bold ${preview.avgRateChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {preview.avgRateChange >= 0 ? '+' : ''}${preview.avgRateChange.toFixed(2)}/mi
                </p>
              </div>
              <div className="glass-card rounded-lg p-4">
                <p className="text-xs text-slate-400 mb-1">Avg Margin Change</p>
                <p className={`text-2xl font-bold ${preview.avgMarginChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {preview.avgMarginChange >= 0 ? '+' : ''}{preview.avgMarginChange.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Sample Preview Table */}
            {preview.solutions.length > 0 && (
              <div className="glass-card rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800/50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">Lane</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">Current Rate</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">Optimal Rate</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">New Margin</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.solutions.map((solution, idx) => {
                        const lane = lanes.find(l => l.id === solution.laneId);
                        return (
                          <tr key={idx} className="border-b border-slate-800/50">
                            <td className="px-4 py-2">
                              <p className="text-white mono text-xs">{solution.laneId}</p>
                              {lane && (
                                <p className="text-slate-400 text-xs">{lane.origin} → {lane.destination}</p>
                              )}
                            </td>
                            <td className="px-4 py-2">
                              <p className="text-white">${solution.originalRate.toFixed(2)}/mi</p>
                            </td>
                            <td className="px-4 py-2">
                              <p className="text-white">${solution.optimalRate.toFixed(2)}/mi</p>
                            </td>
                            <td className="px-4 py-2">
                              <p className="text-emerald-400 font-medium">{solution.newMargin}%</p>
                            </td>
                            <td className="px-4 py-2">
                              {solution.rateTooHigh ? (
                                <div className="flex items-center gap-1 text-amber-400">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span className="text-xs">High Rate</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-emerald-400">
                                  <CheckCircle className="w-3 h-3" />
                                  <span className="text-xs">OK</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {preview.solutions.length < preview.totalLanes && (
                  <div className="px-4 py-2 border-t border-slate-800 text-center">
                    <p className="text-xs text-slate-400">
                      Showing 10 of {preview.totalLanes} lanes
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="glass-card px-6 py-2.5 rounded-lg text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-6 py-2.5 rounded-lg text-white font-medium transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/30"
          >
            <Zap className="w-4 h-4" />
            Apply to All Lanes
          </button>
        </div>
      </div>
    </div>
  );
}

