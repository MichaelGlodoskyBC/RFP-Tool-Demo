import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import RFPList from './components/RFPList';
import LaneEditor from './components/LaneEditor';
import { demoRFPs } from './data/demoData';

export default function App() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedRFP, setSelectedRFP] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredRFPs = useMemo(() => {
    return demoRFPs.filter(rfp => {
      const matchesSearch = rfp.shipper.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           rfp.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || rfp.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filterStatus]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        {!selectedRFP ? (
          <>
            <Dashboard />
            <RFPList
              rfps={filteredRFPs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSelectRFP={setSelectedRFP}
            />
          </>
        ) : (
          <LaneEditor
            rfp={selectedRFP}
            onBack={() => setSelectedRFP(null)}
          />
        )}
      </div>
    </div>
  );
}
