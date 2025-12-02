import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { saveTemplate, getTemplates } from '../utils/templateStorage';

const FIELD_LABELS = {
  origin: 'Origin',
  destination: 'Destination',
  distance: 'Distance',
  rate: 'Rate',
  volume: 'Volume',
  equipment: 'Equipment'
};

export default function TemplateConfigModal({ isOpen, onClose, headers, initialMapping, onSave }) {
  const [templateName, setTemplateName] = useState('');
  const [mapping, setMapping] = useState(initialMapping || {});
  const [selectedField, setSelectedField] = useState(null);

  useEffect(() => {
    if (initialMapping) {
      setMapping(initialMapping);
    } else {
      // Initialize with default mappings
      setMapping({
        origin: ['origin', 'orig', 'origin city'],
        destination: ['destination', 'dest', 'destination city'],
        distance: ['distance', 'miles', 'mi'],
        rate: ['rate', 'price', 'cost'],
        volume: ['volume', 'qty', 'quantity'],
        equipment: ['equipment', 'equip', 'trailer type']
      });
    }
  }, [initialMapping]);

  if (!isOpen) return null;

  const handleAddMapping = (field, headerValue) => {
    setMapping(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), headerValue]
    }));
  };

  const handleRemoveMapping = (field, index) => {
    setMapping(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    const template = {
      id: `template_${Date.now()}`,
      name: templateName,
      mapping: mapping,
      createdAt: new Date().toISOString()
    };

    saveTemplate(template);
    onSave(mapping);
  };

  const handleApply = () => {
    onSave(mapping);
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
            <h2 className="text-2xl font-bold text-white mb-1">Configure Template</h2>
            <p className="text-sm text-slate-400">Map file headers to lane fields</p>
          </div>
          <button
            onClick={onClose}
            className="glass-card p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Template Name (optional)
          </label>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="e.g., USPS Standard, E2Open, Custom Retail"
            className="w-full glass-card rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 border border-slate-700"
          />
        </div>

        {/* Header List */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-300 mb-3">File Headers</h3>
          <div className="glass-card rounded-lg p-4">
            <div className="flex flex-wrap gap-2">
              {headers.map((header, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (selectedField) {
                      handleAddMapping(selectedField, String(header || '').toLowerCase());
                      setSelectedField(null);
                    }
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    selectedField
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50 hover:bg-indigo-500/30'
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  {header || `Column ${index + 1}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Field Mappings */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Field Mappings</h3>
          <div className="space-y-3">
            {Object.keys(FIELD_LABELS).map(field => (
              <div key={field} className="glass-card rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-white">
                    {FIELD_LABELS[field]}
                  </label>
                  <button
                    onClick={() => setSelectedField(selectedField === field ? null : field)}
                    className={`text-xs px-2 py-1 rounded ${
                      selectedField === field
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {selectedField === field ? 'Click header to map' : 'Map'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(mapping[field] || []).map((value, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 px-2 py-1 bg-indigo-500/20 rounded text-xs text-indigo-400"
                    >
                      <span>{value}</span>
                      <button
                        onClick={() => handleRemoveMapping(field, index)}
                        className="hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {(!mapping[field] || mapping[field].length === 0) && (
                    <span className="text-xs text-slate-500">No mappings</span>
                  )}
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
          {templateName && (
            <button
              onClick={handleSaveTemplate}
              className="glass-card px-6 py-2.5 rounded-lg text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Template
            </button>
          )}
          <button
            onClick={handleApply}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-6 py-2.5 rounded-lg text-white font-medium transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/30"
          >
            Apply Mapping
          </button>
        </div>
      </div>
    </div>
  );
}



