import React, { useState, useMemo } from 'react';
import { X, CheckCircle, XCircle, DollarSign, Download, Save, TrendingUp, TrendingDown } from 'lucide-react';

export default function AwardCaptureModal({ isOpen, onClose, lanes, onSave }) {
  const [laneResults, setLaneResults] = useState(() => {
    const initial = {};
    lanes.forEach(lane => {
      initial[lane.id] = {
        status: 'pending', // pending, won, lost
        competitorRate: '',
        reason: ''
      };
    });
    return initial;
  });
  const [bulkAction, setBulkAction] = useState({ status: '', applyTo: 'all' }); // all, selected
  const [selectedLanes, setSelectedLanes] = useState(new Set());

  if (!isOpen) return null;

  const handleLaneResultChange = (laneId, field, value) => {
    setLaneResults(prev => ({
      ...prev,
      [laneId]: {
        ...prev[laneId],
        [field]: value
      }
    }));
  };

  const handleBulkAction = () => {
    if (!bulkAction.status) return;

    const lanesToUpdate = bulkAction.applyTo === 'selected' 
      ? Array.from(selectedLanes)
      : lanes.map(l => l.id);

    const updated = { ...laneResults };
    lanesToUpdate.forEach(laneId => {
      updated[laneId] = {
        ...updated[laneId],
        status: bulkAction.status
      };
    });
    setLaneResults(updated);
    setBulkAction({ status: '', applyTo: 'all' });
  };

  const toggleLaneSelection = (laneId) => {
    const newSelection = new Set(selectedLanes);
    if (newSelection.has(laneId)) {
      newSelection.delete(laneId);
    } else {
      newSelection.add(laneId);
    }
    setSelectedLanes(newSelection);
  };

  const stats = useMemo(() => {
    const won = Object.values(laneResults).filter(r => r.status === 'won').length;
    const lost = Object.values(laneResults).filter(r => r.status === 'lost').length;
    const pending = Object.values(laneResults).filter(r => r.status === 'pending').length;
    return { won, lost, pending, total: lanes.length };
  }, [laneResults, lanes.length]);

  const handleSave = () => {
    const results = lanes.map(lane => ({
      laneId: lane.id,
      ...laneResults[lane.id]
    }));

    // Generate win/loss report
    const report = {
      summary: {
        total: stats.total,
        won: stats.won,
        lost: stats.lost,
        pending: stats.pending,
        winRate: stats.total > 0 ? ((stats.won / (stats.won + stats.lost)) * 100).toFixed(1) : '0'
      },
      lanes: results.filter(r => r.status !== 'pending'),
      generatedAt: new Date().toISOString()
    };

    if (onSave) {
      onSave(results, report);
    }
    onClose();
  };

  const handleGenerateReport = () => {
    const report = {
      summary: {
        total: stats.total,
        won: stats.won,
        lost: stats.lost,
        pending: stats.pending,
        winRate: stats.total > 0 ? ((stats.won / (stats.won + stats.lost)) * 100).toFixed(1) : '0'
      },
      lanes: lanes.map(lane => ({
        ...lane,
        result: laneResults[lane.id]
      })).filter(l => l.result.status !== 'pending'),
      generatedAt: new Date().toISOString()
    };

    // Create downloadable JSON
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `award_report_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative glass-card rounded-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Award Results</h2>
            <p className="text-sm text-slate-400">
              Mark lanes as Won or Lost and capture competitor information
            </p>
          </div>
          <button
            onClick={onClose}
            className="glass-card p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="glass-card rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-1">Total Lanes</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="glass-card rounded-lg p-4 border border-emerald-500/30 bg-emerald-500/10">
            <p className="text-xs text-slate-400 mb-1">Won</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.won}</p>
          </div>
          <div className="glass-card rounded-lg p-4 border border-red-500/30 bg-red-500/10">
            <p className="text-xs text-slate-400 mb-1">Lost</p>
            <p className="text-2xl font-bold text-red-400">{stats.lost}</p>
          </div>
          <div className="glass-card rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-1">Win Rate</p>
            <p className="text-2xl font-bold text-indigo-400">
              {stats.won + stats.lost > 0 ? `${((stats.won / (stats.won + stats.lost)) * 100).toFixed(1)}%` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="glass-card rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-white mb-3">Bulk Actions</h3>
          <div className="flex items-center gap-3">
            <select
              value={bulkAction.status}
              onChange={(e) => setBulkAction({ ...bulkAction, status: e.target.value })}
              className="glass-card rounded-lg px-3 py-2 text-sm text-white border border-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select action...</option>
              <option value="won">Mark as Won</option>
              <option value="lost">Mark as Lost</option>
              <option value="pending">Reset to Pending</option>
            </select>
            <select
              value={bulkAction.applyTo}
              onChange={(e) => setBulkAction({ ...bulkAction, applyTo: e.target.value })}
              className="glass-card rounded-lg px-3 py-2 text-sm text-white border border-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Lanes</option>
              <option value="selected">Selected Only ({selectedLanes.size})</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction.status}
              className="glass-card px-4 py-2 rounded-lg text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Lane Results Table */}
        <div className="glass-card rounded-lg overflow-hidden mb-6">
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">
                    <input
                      type="checkbox"
                      checked={selectedLanes.size === lanes.length}
                      onChange={() => {
                        if (selectedLanes.size === lanes.length) {
                          setSelectedLanes(new Set());
                        } else {
                          setSelectedLanes(new Set(lanes.map(l => l.id)));
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900"
                    />
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">Lane</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">Origin → Destination</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">Our Rate</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">Competitor Rate</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">Reason</th>
                </tr>
              </thead>
              <tbody>
                {lanes.map(lane => {
                  const result = laneResults[lane.id] || { status: 'pending', competitorRate: '', reason: '' };
                  return (
                    <tr key={lane.id} className="border-b border-slate-800/50">
                      <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedLanes.has(lane.id)}
                          onChange={() => toggleLaneSelection(lane.id)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-900"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <p className="text-white mono text-xs">{lane.id}</p>
                      </td>
                      <td className="px-4 py-2">
                        <p className="text-slate-300 text-xs">{lane.origin} → {lane.destination}</p>
                      </td>
                      <td className="px-4 py-2">
                        <p className="text-white font-medium">${lane.baseRate}/mi</p>
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={result.status}
                          onChange={(e) => handleLaneResultChange(lane.id, 'status', e.target.value)}
                          className={`glass-card rounded px-2 py-1 text-xs font-medium border focus:outline-none ${
                            result.status === 'won'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : result.status === 'lost'
                              ? 'bg-red-500/20 text-red-400 border-red-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="won">Won</option>
                          <option value="lost">Lost</option>
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        {result.status === 'lost' ? (
                          <input
                            type="number"
                            value={result.competitorRate}
                            onChange={(e) => handleLaneResultChange(lane.id, 'competitorRate', e.target.value)}
                            placeholder="$0.00"
                            step="0.01"
                            className="w-24 glass-card rounded px-2 py-1 text-xs text-white border border-slate-700 focus:outline-none focus:border-indigo-500"
                          />
                        ) : (
                          <span className="text-slate-500 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {result.status !== 'pending' ? (
                          <input
                            type="text"
                            value={result.reason}
                            onChange={(e) => handleLaneResultChange(lane.id, 'reason', e.target.value)}
                            placeholder="Enter reason..."
                            className="w-48 glass-card rounded px-2 py-1 text-xs text-white border border-slate-700 focus:outline-none focus:border-indigo-500"
                          />
                        ) : (
                          <span className="text-slate-500 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={handleGenerateReport}
            className="glass-card px-4 py-2.5 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Generate Report
          </button>
          <button
            onClick={onClose}
            className="glass-card px-6 py-2.5 rounded-lg text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-6 py-2.5 rounded-lg text-white font-medium transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/30"
          >
            <Save className="w-4 h-4" />
            Save Results
          </button>
        </div>
      </div>
    </div>
  );
}






