import React, { useState, useMemo } from 'react';
import { X, CheckCircle, AlertTriangle, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { scenarios } from '../data/demoData';

export default function BulkActionsModal({ isOpen, onClose, selectedLanes, lanes, onApply }) {
  const [selectedScenario, setSelectedScenario] = useState('base');
  const [marginOverride, setMarginOverride] = useState('');
  const [useMarginOverride, setUseMarginOverride] = useState(false);

  if (!isOpen) return null;

  const selectedLaneData = useMemo(() => {
    return lanes.filter(lane => selectedLanes.has(lane.id));
  }, [lanes, selectedLanes]);

  const previewChanges = useMemo(() => {
    if (selectedLaneData.length === 0) return null;

    const scenario = scenarios.find(s => s.id === selectedScenario);
    const marginTarget = scenario?.marginTarget || '10-12%';
    const marginMin = parseFloat(marginTarget.split('-')[0]);
    const marginMax = parseFloat(marginTarget.split('-')[1].replace('%', ''));
    const targetMargin = useMarginOverride && marginOverride ? parseFloat(marginOverride) : (marginMin + marginMax) / 2;

    return selectedLaneData.map(lane => {
      const currentMargin = parseFloat(lane.margin);
      const currentRate = parseFloat(lane.baseRate);
      
      // Calculate new rate based on target margin
      const linehaul = currentRate * lane.distance;
      const fuel = parseFloat(lane.fuelSurcharge) * lane.distance;
      const accessorials = parseFloat(lane.accessorials);
      const deadheadCost = lane.deadhead * 1.5;
      const subtotal = linehaul + fuel + accessorials + deadheadCost;
      const newMargin = subtotal * (targetMargin / 100);
      const newTotal = subtotal + newMargin;
      const newRate = newTotal / lane.distance;

      return {
        lane,
        before: {
          rate: currentRate,
          margin: currentMargin,
          total: subtotal + (subtotal * (currentMargin / 100))
        },
        after: {
          rate: newRate,
          margin: targetMargin,
          total: newTotal
        },
        change: {
          rate: newRate - currentRate,
          margin: targetMargin - currentMargin,
          total: newTotal - (subtotal + (subtotal * (currentMargin / 100)))
        }
      };
    });
  }, [selectedLaneData, selectedScenario, marginOverride, useMarginOverride]);

  const handleApply = () => {
    if (previewChanges && previewChanges.length > 0) {
      const updates = previewChanges.map(change => ({
        laneId: change.lane.id,
        newRate: change.after.rate,
        newMargin: change.after.margin,
        scenario: selectedScenario
      }));
      onApply(updates);
      onClose();
    }
  };

  const avgChange = useMemo(() => {
    if (!previewChanges || previewChanges.length === 0) return null;
    const avgRateChange = previewChanges.reduce((sum, c) => sum + c.change.rate, 0) / previewChanges.length;
    const avgMarginChange = previewChanges.reduce((sum, c) => sum + c.change.margin, 0) / previewChanges.length;
    return { rate: avgRateChange, margin: avgMarginChange };
  }, [previewChanges]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative glass-card rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Apply Scenario</h2>
            <p className="text-sm text-slate-400">
              {selectedLanes.size} lane{selectedLanes.size !== 1 ? 's' : ''} selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="glass-card p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scenario Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-3">Pricing Scenario</label>
          <div className="grid grid-cols-3 gap-3">
            {scenarios.map(scenario => (
              <button
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario.id)}
                className={`glass-card px-4 py-3 rounded-lg text-left transition-all ${
                  selectedScenario === scenario.id
                    ? 'border-2 border-indigo-500 bg-indigo-500/20'
                    : 'border border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: scenario.color }}
                  />
                  <span className="text-sm font-medium text-white">{scenario.name}</span>
                </div>
                <p className="text-xs text-slate-400">Target: {scenario.marginTarget}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Margin Override */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <input
              type="checkbox"
              id="marginOverride"
              checked={useMarginOverride}
              onChange={(e) => setUseMarginOverride(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900"
            />
            <label htmlFor="marginOverride" className="text-sm font-medium text-slate-300">
              Override Margin Target
            </label>
          </div>
          {useMarginOverride && (
            <div className="glass-card rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={marginOverride}
                  onChange={(e) => setMarginOverride(e.target.value)}
                  placeholder="Enter margin %"
                  min="0"
                  max="50"
                  step="0.1"
                  className="bg-transparent border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-500 w-32 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-sm text-slate-400">%</span>
              </div>
            </div>
          )}
        </div>

        {/* Preview Section */}
        {previewChanges && previewChanges.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-4">Preview Changes</h3>
            
            {/* Summary Stats */}
            {avgChange && (
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="glass-card rounded-lg p-4">
                  <p className="text-xs text-slate-400 mb-1">Avg Rate Change</p>
                  <div className="flex items-center gap-2">
                    {avgChange.rate >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`text-lg font-bold ${
                      avgChange.rate >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      ${Math.abs(avgChange.rate).toFixed(2)}/mi
                    </span>
                  </div>
                </div>
                <div className="glass-card rounded-lg p-4">
                  <p className="text-xs text-slate-400 mb-1">Avg Margin Change</p>
                  <div className="flex items-center gap-2">
                    {avgChange.margin >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`text-lg font-bold ${
                      avgChange.margin >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {avgChange.margin >= 0 ? '+' : ''}{avgChange.margin.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="glass-card rounded-lg p-4">
                  <p className="text-xs text-slate-400 mb-1">Lanes Affected</p>
                  <span className="text-lg font-bold text-white">{selectedLanes.size}</span>
                </div>
              </div>
            )}

            {/* Before/After Comparison Table */}
            <div className="glass-card rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-800/50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">Lane</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">Before</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">After</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewChanges.slice(0, 10).map((change, idx) => (
                      <tr key={idx} className="border-b border-slate-800/50">
                        <td className="px-4 py-2">
                          <div>
                            <p className="text-white mono text-xs">{change.lane.id}</p>
                            <p className="text-slate-400 text-xs">{change.lane.origin} → {change.lane.destination}</p>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div>
                            <p className="text-white">${change.before.rate.toFixed(2)}/mi</p>
                            <p className="text-slate-400 text-xs">{change.before.margin.toFixed(1)}% margin</p>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div>
                            <p className="text-white">${change.after.rate.toFixed(2)}/mi</p>
                            <p className="text-slate-400 text-xs">{change.after.margin.toFixed(1)}% margin</p>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div>
                            <p className={`font-medium ${
                              change.change.rate >= 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                              {change.change.rate >= 0 ? '+' : ''}${change.change.rate.toFixed(2)}/mi
                            </p>
                            <p className={`text-xs ${
                              change.change.margin >= 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                              {change.change.margin >= 0 ? '+' : ''}{change.change.margin.toFixed(1)}%
                            </p>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {previewChanges.length > 10 && (
                <div className="px-4 py-2 border-t border-slate-800 text-center">
                  <p className="text-xs text-slate-400">
                    Showing 10 of {previewChanges.length} lanes
                  </p>
                </div>
              )}
            </div>
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
            disabled={!previewChanges || previewChanges.length === 0}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-6 py-2.5 rounded-lg text-white font-medium transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4" />
            Apply Scenario
          </button>
        </div>
      </div>
    </div>
  );
}






