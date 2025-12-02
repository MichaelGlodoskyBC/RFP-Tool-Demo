import React, { useState } from 'react';
import { Edit2, ChevronUp, ChevronDown, CheckCircle, AlertTriangle, XCircle, Check, X } from 'lucide-react';
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
  onSort,
  onLaneUpdate
}) {
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editError, setEditError] = useState(null);
  const startEditing = (laneId, field, currentValue) => {
    setEditingCell({ laneId, field });
    setEditValue(currentValue);
    setEditError(null);
  };

  const cancelEditing = () => {
    setEditingCell(null);
    setEditValue('');
    setEditError(null);
  };

  const validateAndSave = (lane, field, value) => {
    setEditError(null);
    
    switch (field) {
      case 'baseRate':
        const rate = parseFloat(value);
        if (isNaN(rate) || rate < 0) {
          setEditError('Rate must be a positive number');
          return false;
        }
        break;
      case 'distance':
        const dist = parseInt(value);
        if (isNaN(dist) || dist < 0) {
          setEditError('Distance must be a positive integer');
          return false;
        }
        break;
      case 'origin':
      case 'destination':
        if (!value.trim()) {
          setEditError('This field cannot be empty');
          return false;
        }
        break;
      default:
        break;
    }
    
    return true;
  };

  const saveEdit = () => {
    if (!editingCell) return;
    
    const { laneId, field } = editingCell;
    const lane = lanes.find(l => l.id === laneId);
    if (!lane) return;

    if (!validateAndSave(lane, field, editValue)) {
      return;
    }

    // Update lane
    const updatedLane = { ...lane };
    
    if (field === 'baseRate') {
      updatedLane.baseRate = parseFloat(editValue).toFixed(2);
      // Recalculate margin
      // baseRate is the rate per mile we charge (revenue)
      // Calculate revenue
      const revenue = parseFloat(updatedLane.baseRate) * updatedLane.distance;
      // Calculate cost components (excluding linehaul cost which we need to estimate)
      const fuel = parseFloat(updatedLane.fuelSurcharge) * updatedLane.distance;
      const accessorials = parseFloat(updatedLane.accessorials);
      const deadheadCost = updatedLane.deadhead * 1.5;
      // Estimate linehaul cost: typically 70-80% of revenue in freight industry
      // Using 75% as a standard estimate
      const estimatedLinehaulCost = revenue * 0.75;
      // Total cost = linehaul cost + other costs
      const totalCost = estimatedLinehaulCost + fuel + accessorials + deadheadCost;
      // Margin = (Revenue - Total Cost) / Total Cost * 100
      const margin = totalCost > 0 ? (((revenue - totalCost) / totalCost) * 100).toFixed(1) : '10.0';
      updatedLane.margin = margin;
      updatedLane.status = parseFloat(margin) < 8 ? 'Error' : parseFloat(margin) < 12 ? 'Warning' : 'Valid';
    } else if (field === 'distance') {
      updatedLane.distance = parseInt(editValue);
      // Recalculate margin using same logic
      const revenue = parseFloat(updatedLane.baseRate) * updatedLane.distance;
      const fuel = parseFloat(updatedLane.fuelSurcharge) * updatedLane.distance;
      const accessorials = parseFloat(updatedLane.accessorials);
      const deadheadCost = updatedLane.deadhead * 1.5;
      const estimatedLinehaulCost = revenue * 0.75;
      const totalCost = estimatedLinehaulCost + fuel + accessorials + deadheadCost;
      const margin = totalCost > 0 ? (((revenue - totalCost) / totalCost) * 100).toFixed(1) : '10.0';
      updatedLane.margin = margin;
      updatedLane.status = parseFloat(margin) < 8 ? 'Error' : parseFloat(margin) < 12 ? 'Warning' : 'Valid';
    } else {
      updatedLane[field] = editValue;
    }

    if (onLaneUpdate) {
      onLaneUpdate(updatedLane);
    }

    cancelEditing();
  };

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
                <EditableCell
                  lane={lane}
                  field="origin"
                  value={lane.origin}
                  editing={editingCell?.laneId === lane.id && editingCell?.field === 'origin'}
                  onStartEdit={() => startEditing(lane.id, 'origin', lane.origin)}
                  onSave={saveEdit}
                  onCancel={cancelEditing}
                  editValue={editValue}
                  setEditValue={setEditValue}
                  error={editError}
                />
                <EditableCell
                  lane={lane}
                  field="destination"
                  value={lane.destination}
                  editing={editingCell?.laneId === lane.id && editingCell?.field === 'destination'}
                  onStartEdit={() => startEditing(lane.id, 'destination', lane.destination)}
                  onSave={saveEdit}
                  onCancel={cancelEditing}
                  editValue={editValue}
                  setEditValue={setEditValue}
                  error={editError}
                />
                <EditableCell
                  lane={lane}
                  field="distance"
                  value={`${lane.distance}mi`}
                  editing={editingCell?.laneId === lane.id && editingCell?.field === 'distance'}
                  onStartEdit={() => startEditing(lane.id, 'distance', lane.distance)}
                  onSave={saveEdit}
                  onCancel={cancelEditing}
                  editValue={editValue}
                  setEditValue={setEditValue}
                  error={editError}
                  type="number"
                />
                <EditableCell
                  lane={lane}
                  field="baseRate"
                  value={`$${lane.baseRate}/mi`}
                  editing={editingCell?.laneId === lane.id && editingCell?.field === 'baseRate'}
                  onStartEdit={() => startEditing(lane.id, 'baseRate', lane.baseRate)}
                  onSave={saveEdit}
                  onCancel={cancelEditing}
                  editValue={editValue}
                  setEditValue={setEditValue}
                  error={editError}
                  type="number"
                />
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
                  {editingCell?.laneId === lane.id ? (
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={saveEdit}
                        className="text-emerald-400 hover:text-emerald-300 transition-colors"
                        title="Save"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(lane.id, 'baseRate', lane.baseRate);
                      }}
                      className="text-slate-400 hover:text-white transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
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

function EditableCell({ lane, field, value, editing, onStartEdit, onSave, onCancel, editValue, setEditValue, error, type = 'text' }) {
  if (editing) {
    return (
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          {field === 'baseRate' && <span className="text-sm text-slate-400">$</span>}
          <input
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSave();
              } else if (e.key === 'Escape') {
                onCancel();
              }
            }}
            className={`glass-card rounded px-2 py-1 text-sm text-white w-24 focus:outline-none focus:border-indigo-500 border ${
              error ? 'border-red-500' : 'border-slate-700'
            }`}
            autoFocus
          />
          {field === 'distance' && <span className="text-sm text-slate-400">mi</span>}
          {field === 'baseRate' && <span className="text-sm text-slate-400">/mi</span>}
        </div>
        {error && (
          <p className="text-xs text-red-400 mt-1">{error}</p>
        )}
      </td>
    );
  }

  return (
    <td
      className="px-4 py-3 text-sm text-slate-300 cursor-pointer hover:bg-slate-800/50 rounded transition-colors"
      onClick={(e) => {
        e.stopPropagation();
        onStartEdit();
      }}
      title="Click to edit"
    >
      {value}
    </td>
  );
}
