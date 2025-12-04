import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { generateLanes } from '../data/demoData';
import { getLaneStatus, getMarginWarnings } from '../constants/marginThresholds';

export default function AddRFPModal({ isOpen, onClose, onRFPAdded }) {
  const [formData, setFormData] = useState({
    shipper: '',
    dueDate: '',
    mode: 'FTL',
    template: '',
    hasNDA: false
  });
  const [manualLanes, setManualLanes] = useState([
    { origin: '', destination: '', distance: '', rate: '', volume: '1', equipment: 'Dry Van' }
  ]);

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLaneChange = (index, field, value) => {
    setManualLanes(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addLane = () => {
    setManualLanes(prev => [...prev, { origin: '', destination: '', distance: '', rate: '', volume: '1', equipment: 'Dry Van' }]);
  };

  const removeLane = (index) => {
    setManualLanes(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // Validate
    if (!formData.shipper.trim()) {
      alert('Please enter a shipper name');
      return;
    }

    if (!formData.dueDate) {
      alert('Please select a due date');
      return;
    }

    const validLanes = manualLanes.filter(l => l.origin && l.destination && l.distance && l.rate);
    if (validLanes.length === 0) {
      alert('Please add at least one valid lane');
      return;
    }

    // Generate lanes in the format expected by the app
    const lanes = validLanes.map((lane, index) => {
      const distance = parseFloat(lane.distance) || 0;
      const baseRate = parseFloat(lane.rate) || 0;
      const volume = parseInt(lane.volume) || 1;

      // Calculate derived fields
      const linehaul = baseRate * distance;
      const fuelSurcharge = (baseRate * 0.15).toFixed(2);
      const accessorials = (linehaul * 0.05).toFixed(2);
      const deadhead = Math.floor(distance * 0.1);
      const totalCost = linehaul + parseFloat(fuelSurcharge) * distance + parseFloat(accessorials) + deadhead * 1.5;
      const margin = totalCost > 0 ? ((baseRate * distance - totalCost) / totalCost * 100).toFixed(1) : '10.0';

      return {
        id: `LANE-${String(index + 1).padStart(4, '0')}`,
        origin: lane.origin.trim(),
        destination: lane.destination.trim(),
        equipment: lane.equipment || 'Dry Van',
        distance: Math.floor(distance),
        volume,
        baseRate: baseRate.toFixed(2),
        fuelSurcharge,
        accessorials,
        deadhead,
        margin,
        scenario: 'Base',
        status: getLaneStatus(margin),
        warnings: getMarginWarnings(margin),
        benchmark: (baseRate * 0.9).toFixed(2),
        historicalRate: null
      };
    });

    const newRFP = {
      id: `RFP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      shipper: formData.shipper,
      dueDate: new Date(formData.dueDate).toISOString(),
      mode: formData.mode,
      status: 'In Progress',
      laneCount: lanes.length,
      completeness: 0,
      triageScore: 7.0,
      template: formData.template || 'Manual Entry',
      hasNDA: formData.hasNDA,
      lanes,
      metadata: {
        totalVolume: lanes.reduce((sum, l) => sum + (l.volume || 1), 0),
        avgDistance: Math.round(lanes.reduce((sum, l) => sum + l.distance, 0) / lanes.length),
        regions: [],
        equipment: [...new Set(lanes.map(l => l.equipment).filter(Boolean))]
      }
    };

    if (onRFPAdded) {
      onRFPAdded(newRFP);
    }

    // Reset form
    setFormData({
      shipper: '',
      dueDate: '',
      mode: 'FTL',
      template: '',
      hasNDA: false
    });
    setManualLanes([{ origin: '', destination: '', distance: '', rate: '', volume: '1', equipment: 'Dry Van' }]);
    onClose();
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
            <h2 className="text-2xl font-bold text-white mb-1">Add New RFP</h2>
            <p className="text-sm text-slate-400">Manually enter RFP details and lanes</p>
          </div>
          <button
            onClick={onClose}
            className="glass-card p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* RFP Details */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-300 mb-4">RFP Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-2">Shipper Name *</label>
              <input
                type="text"
                value={formData.shipper}
                onChange={(e) => handleInputChange('shipper', e.target.value)}
                placeholder="Enter shipper name"
                className="w-full glass-card rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 border border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-2">Due Date *</label>
              <input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className="w-full glass-card rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 border border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-2">Mode</label>
              <select
                value={formData.mode}
                onChange={(e) => handleInputChange('mode', e.target.value)}
                className="w-full glass-card rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 border border-slate-700"
              >
                <option value="FTL">FTL</option>
                <option value="LTL">LTL</option>
                <option value="Intermodal">Intermodal</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-2">Template</label>
              <input
                type="text"
                value={formData.template}
                onChange={(e) => handleInputChange('template', e.target.value)}
                placeholder="Template name (optional)"
                className="w-full glass-card rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 border border-slate-700"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="hasNDA"
              checked={formData.hasNDA}
              onChange={(e) => handleInputChange('hasNDA', e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900"
            />
            <label htmlFor="hasNDA" className="text-sm text-slate-300">
              Requires NDA
            </label>
          </div>
        </div>

        {/* Lanes */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-300">Lanes ({manualLanes.length})</h3>
            <button
              onClick={addLane}
              className="glass-card px-4 py-2 rounded-lg text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Lane
            </button>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {manualLanes.map((lane, index) => (
              <div key={index} className="glass-card rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-400">Lane {index + 1}</span>
                  {manualLanes.length > 1 && (
                    <button
                      onClick={() => removeLane(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                  <input
                    type="text"
                    placeholder="Origin *"
                    value={lane.origin}
                    onChange={(e) => handleLaneChange(index, 'origin', e.target.value)}
                    className="glass-card rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 border border-slate-700"
                  />
                  <input
                    type="text"
                    placeholder="Destination *"
                    value={lane.destination}
                    onChange={(e) => handleLaneChange(index, 'destination', e.target.value)}
                    className="glass-card rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 border border-slate-700"
                  />
                  <input
                    type="number"
                    placeholder="Distance (mi) *"
                    value={lane.distance}
                    onChange={(e) => handleLaneChange(index, 'distance', e.target.value)}
                    className="glass-card rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 border border-slate-700"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Rate ($/mi) *"
                    value={lane.rate}
                    onChange={(e) => handleLaneChange(index, 'rate', e.target.value)}
                    className="glass-card rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 border border-slate-700"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Volume"
                      value={lane.volume}
                      onChange={(e) => handleLaneChange(index, 'volume', e.target.value)}
                      className="glass-card rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 border border-slate-700 flex-1"
                    />
                    <select
                      value={lane.equipment}
                      onChange={(e) => handleLaneChange(index, 'equipment', e.target.value)}
                      className="glass-card rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 border border-slate-700"
                    >
                      <option value="Dry Van">Dry Van</option>
                      <option value="Reefer">Reefer</option>
                      <option value="Flatbed">Flatbed</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="glass-card px-6 py-2.5 rounded-lg text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-6 py-2.5 rounded-lg text-white font-medium transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/30"
          >
            <Plus className="w-4 h-4" />
            Create RFP
          </button>
        </div>
      </div>
    </div>
  );
}



