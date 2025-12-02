import React, { useState } from 'react';
import { FileText, Clock, Send, Award, Search, Filter, Plus, Upload } from 'lucide-react';
import RFPCard from './RFPCard';
import FileUploadModal from './FileUploadModal';
import AddRFPModal from './AddRFPModal';

export default function RFPList({ rfps, activeTab, setActiveTab, searchQuery, setSearchQuery, onSelectRFP, onRFPAdded }) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  return (
    <>
      {/* Navigation Tabs */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div className="glass-card rounded-xl p-1 flex flex-wrap gap-1 w-full lg:w-auto">
          {[
            { id: 'inbox', label: 'Inbox', icon: FileText, count: 5 },
            { id: 'active', label: 'In Progress', icon: Clock, count: 7 },
            { id: 'submitted', label: 'Submitted', icon: Send, count: 12 },
            { id: 'awarded', label: 'Awarded', icon: Award, count: 8 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <tab.icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{tab.label}</span>
              {tab.count > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                  activeTab === tab.id ? 'bg-indigo-500' : 'bg-slate-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap">
          <div className="glass-card rounded-lg px-4 py-2 flex items-center gap-3 flex-1 lg:flex-initial min-w-0">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search RFPs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-white placeholder-slate-500 w-full lg:w-64 focus:outline-none"
            />
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

      {/* RFP Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {rfps.map((rfp, index) => (
          <RFPCard
            key={rfp.id}
            rfp={rfp}
            onClick={() => onSelectRFP(rfp)}
            style={{ animationDelay: `${index * 0.1}s` }}
          />
        ))}
      </div>

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
