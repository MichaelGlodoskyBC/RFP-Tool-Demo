import React, { useState } from 'react';
import { Search, Filter, Plus, Upload, Columns, Table } from 'lucide-react';
import KanbanBoard from './KanbanBoard';
import RFPTableView from './RFPTableView';
import FileUploadModal from './FileUploadModal';
import AddRFPModal from './AddRFPModal';

export default function RFPList({ rfps, activeTab, setActiveTab, searchQuery, setSearchQuery, onSelectRFP, onRFPAdded }) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'kanban'
  const [selectedRFPs, setSelectedRFPs] = useState(new Set());
  return (
    <>
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mb-6">
        <div className="flex items-center gap-3 w-full flex-wrap">
          <div className="glass-card rounded-lg px-4 py-2 flex items-center gap-3 flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search RFPs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-white placeholder-slate-500 w-full focus:outline-none"
            />
          </div>
          
          {/* View Toggle */}
          <div className="glass-card rounded-lg p-1 flex items-center gap-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 rounded-md transition-all flex items-center gap-2 ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
              title="Table View"
            >
              <Table className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-2 rounded-md transition-all flex items-center gap-2 ${
                viewMode === 'kanban'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
              title="Board View"
            >
              <Columns className="w-4 h-4" />
            </button>
          </div>
          
          <button className="glass-card px-4 py-2 rounded-lg text-slate-300 hover:text-white transition-colors flex-shrink-0">
            <Filter className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button 
              onClick={() => setShowUploadModal(true)}
              className="glass-card px-4 py-2.5 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload File</span>
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-4 lg:px-6 py-2.5 rounded-lg text-white font-medium transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/30 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm lg:text-base">Add RFP</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selection Bar */}
      {selectedRFPs.size > 0 && viewMode === 'table' && (
        <div className="glass-card rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-300">
              <span className="font-medium text-white">{selectedRFPs.size}</span> RFP{selectedRFPs.size !== 1 ? 's' : ''} selected
            </span>
          </div>
          <button
            onClick={() => setSelectedRFPs(new Set())}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* RFP View - Table or Kanban */}
      {viewMode === 'table' ? (
        <RFPTableView
          rfps={rfps}
          onSelectRFP={onSelectRFP}
          selectedRFPs={selectedRFPs}
          onToggleSelection={(rfpId) => {
            setSelectedRFPs(prev => {
              const next = new Set(prev);
              if (next.has(rfpId)) {
                next.delete(rfpId);
              } else {
                next.add(rfpId);
              }
              return next;
            });
          }}
          onSelectAll={(rfpIds) => {
            setSelectedRFPs(new Set(rfpIds));
          }}
        />
      ) : (
        <KanbanBoard
          rfps={rfps}
          onSelectRFP={onSelectRFP}
        />
      )}

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        rfp={null}
        onRFPAdded={onRFPAdded}
      />

      {/* Add RFP Modal */}
      <AddRFPModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onRFPAdded={onRFPAdded}
      />
    </>
  );
}
