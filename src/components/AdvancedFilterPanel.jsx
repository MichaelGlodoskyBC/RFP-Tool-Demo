import React, { useState, useEffect } from 'react';
import { X, Filter, Save, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export default function AdvancedFilterPanel({ isOpen, onClose, filters, onFiltersChange, lanes }) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [savedFilters, setSavedFilters] = useState(() => {
    const saved = localStorage.getItem('rfp_saved_filters');
    return saved ? JSON.parse(saved) : [];
  });
  const [filterName, setFilterName] = useState('');

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const equipmentTypes = ['Dry Van', 'Reefer', 'Flatbed'];
  const regions = ['Northeast', 'Mid-Atlantic', 'Southeast', 'Southwest', 'Midwest', 'West Coast'];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSaveFilter = () => {
    if (!filterName.trim()) return;
    
    const newSavedFilter = {
      id: Date.now(),
      name: filterName,
      filters: { ...localFilters }
    };
    
    const updated = [...savedFilters, newSavedFilter];
    setSavedFilters(updated);
    localStorage.setItem('rfp_saved_filters', JSON.stringify(updated));
    setFilterName('');
  };

  const handleLoadFilter = (savedFilter) => {
    setLocalFilters(savedFilter.filters);
    onFiltersChange(savedFilter.filters);
  };

  const handleDeleteFilter = (id) => {
    const updated = savedFilters.filter(f => f.id !== id);
    setSavedFilters(updated);
    localStorage.setItem('rfp_saved_filters', JSON.stringify(updated));
  };

  const clearFilters = () => {
    const cleared = {
      equipment: [],
      originRegions: [],
      destinationRegions: [],
      distanceMin: '',
      distanceMax: '',
      marginMin: '',
      marginMax: '',
      status: []
    };
    setLocalFilters(cleared);
    onFiltersChange(cleared);
  };

  const getFilteredCount = () => {
    return lanes.filter(lane => {
      if (localFilters.equipment.length > 0 && !localFilters.equipment.includes(lane.equipment)) return false;
      if (localFilters.status.length > 0 && !localFilters.status.includes(lane.status)) return false;
      if (localFilters.distanceMin && lane.distance < parseFloat(localFilters.distanceMin)) return false;
      if (localFilters.distanceMax && lane.distance > parseFloat(localFilters.distanceMax)) return false;
      if (localFilters.marginMin && parseFloat(lane.margin) < parseFloat(localFilters.marginMin)) return false;
      if (localFilters.marginMax && parseFloat(lane.margin) > parseFloat(localFilters.marginMax)) return false;
      return true;
    }).length;
  };

  if (!isOpen) return null;

  return (
    <div className="glass-card rounded-xl p-6 mb-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white">Advanced Filters</h3>
          <span className="text-sm text-slate-400">
            ({getFilteredCount()} of {lanes.length} lanes)
          </span>
        </div>
        <button
          onClick={onClose}
          className="glass-card p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Equipment Type */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">Equipment Type</label>
          <div className="space-y-2">
            {equipmentTypes.map(type => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.equipment?.includes(type) || false}
                  onChange={(e) => {
                    const current = localFilters.equipment || [];
                    const updated = e.target.checked
                      ? [...current, type]
                      : current.filter(t => t !== type);
                    handleFilterChange('equipment', updated);
                  }}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900"
                />
                <span className="text-sm text-slate-300">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Origin Regions */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">Origin Region</label>
          <select
            multiple
            value={localFilters.originRegions || []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              handleFilterChange('originRegions', selected);
            }}
            className="w-full glass-card rounded-lg px-3 py-2 text-sm text-white border border-slate-700 focus:outline-none focus:border-indigo-500 min-h-[100px]"
            size="4"
          >
            {regions.map(region => (
              <option key={region} value={region} className="bg-slate-900">{region}</option>
            ))}
          </select>
          <p className="text-xs text-slate-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
        </div>

        {/* Destination Regions */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">Destination Region</label>
          <select
            multiple
            value={localFilters.destinationRegions || []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              handleFilterChange('destinationRegions', selected);
            }}
            className="w-full glass-card rounded-lg px-3 py-2 text-sm text-white border border-slate-700 focus:outline-none focus:border-indigo-500 min-h-[100px]"
            size="4"
          >
            {regions.map(region => (
              <option key={region} value={region} className="bg-slate-900">{region}</option>
            ))}
          </select>
          <p className="text-xs text-slate-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
        </div>

        {/* Distance Range */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">Distance Range (miles)</label>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Min</label>
              <input
                type="number"
                value={localFilters.distanceMin || ''}
                onChange={(e) => handleFilterChange('distanceMin', e.target.value)}
                placeholder="0"
                className="w-full glass-card rounded-lg px-3 py-2 text-sm text-white border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Max</label>
              <input
                type="number"
                value={localFilters.distanceMax || ''}
                onChange={(e) => handleFilterChange('distanceMax', e.target.value)}
                placeholder="2000"
                className="w-full glass-card rounded-lg px-3 py-2 text-sm text-white border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Margin Range */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">Margin Range (%)</label>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Min</label>
              <input
                type="number"
                value={localFilters.marginMin || ''}
                onChange={(e) => handleFilterChange('marginMin', e.target.value)}
                placeholder="0"
                step="0.1"
                className="w-full glass-card rounded-lg px-3 py-2 text-sm text-white border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Max</label>
              <input
                type="number"
                value={localFilters.marginMax || ''}
                onChange={(e) => handleFilterChange('marginMax', e.target.value)}
                placeholder="50"
                step="0.1"
                className="w-full glass-card rounded-lg px-3 py-2 text-sm text-white border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">Status</label>
          <div className="space-y-2">
            {[
              { value: 'Valid', icon: CheckCircle, color: 'text-emerald-400' },
              { value: 'Warning', icon: AlertTriangle, color: 'text-amber-400' },
              { value: 'Error', icon: XCircle, color: 'text-red-400' }
            ].map(({ value, icon: Icon, color }) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.status?.includes(value) || false}
                  onChange={(e) => {
                    const current = localFilters.status || [];
                    const updated = e.target.checked
                      ? [...current, value]
                      : current.filter(s => s !== value);
                    handleFilterChange('status', updated);
                  }}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900"
                />
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-sm text-slate-300">{value}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Save Filter Section */}
      <div className="mt-6 pt-6 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <input
            type="text"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            placeholder="Filter name..."
            className="flex-1 glass-card rounded-lg px-3 py-2 text-sm text-white border border-slate-700 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleSaveFilter}
            disabled={!filterName.trim()}
            className="glass-card px-4 py-2 rounded-lg text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            Save Filter
          </button>
        </div>

        {/* Saved Filters */}
        {savedFilters.length > 0 && (
          <div>
            <p className="text-sm font-medium text-slate-300 mb-2">Saved Filters</p>
            <div className="flex flex-wrap gap-2">
              {savedFilters.map(filter => (
                <div
                  key={filter.id}
                  className="glass-card px-3 py-2 rounded-lg flex items-center gap-2"
                >
                  <button
                    onClick={() => handleLoadFilter(filter)}
                    className="text-sm text-white hover:text-indigo-400 transition-colors"
                  >
                    {filter.name}
                  </button>
                  <button
                    onClick={() => handleDeleteFilter(filter.id)}
                    className="text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
        <button
          onClick={clearFilters}
          className="glass-card px-4 py-2 rounded-lg text-slate-300 hover:text-white transition-colors text-sm"
        >
          Clear All
        </button>
        <button
          onClick={onClose}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-6 py-2.5 rounded-lg text-white font-medium transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
}



