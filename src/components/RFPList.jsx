import React, { useState } from 'react';
import { FileText, Clock, Send, Award, Search, Filter, Plus } from 'lucide-react';
import RFPCard from './RFPCard';
import FileUploadModal from './FileUploadModal';

export default function RFPList({ rfps, activeTab, setActiveTab, searchQuery, setSearchQuery, onSelectRFP }) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  return (
    <>
      {/* Navigation Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="glass-card rounded-xl p-1 inline-flex gap-1">
          {[
            { id: 'inbox', label: 'Inbox', icon: FileText, count: 5 },
            { id: 'active', label: 'In Progress', icon: Clock, count: 7 },
            { id: 'submitted', label: 'Submitted', icon: Send, count: 12 },
            { id: 'awarded', label: 'Awarded', icon: Award, count: 8 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-indigo-500' : 'bg-slate-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="glass-card rounded-lg px-4 py-2 flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search RFPs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-white placeholder-slate-500 w-64 focus:outline-none"
            />
          </div>
          <button className="glass-card px-4 py-2 rounded-lg text-slate-300 hover:text-white transition-colors">
            <Filter className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-6 py-2.5 rounded-lg text-white font-medium transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/30"
          >
            <Plus className="w-4 h-4" />
            Add RFP
          </button>
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
      />
    </>
  );
}
