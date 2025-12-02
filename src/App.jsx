import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import RFPList from './components/RFPList';
import LaneEditor from './components/LaneEditor';
import Settings from './components/Settings';
import { demoRFPs } from './data/demoData';

export default function App() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedRFP, setSelectedRFP] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [rfps, setRfps] = useState(demoRFPs);
  const [showSettings, setShowSettings] = useState(false);

  const handleRFPAdded = (newRFP) => {
    setRfps(prev => [newRFP, ...prev]);
  };

  const handleRFPUpdate = (updatedRFP) => {
    setRfps(prev => prev.map(rfp => rfp.id === updatedRFP.id ? updatedRFP : rfp));
    setSelectedRFP(updatedRFP);
  };

  const filteredRFPs = useMemo(() => {
    return rfps.filter(rfp => {
      const matchesSearch = rfp.shipper.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           rfp.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || rfp.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [rfps, searchQuery, filterStatus]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <Header onSettingsClick={() => setShowSettings(true)} />
      
      {showSettings ? (
        <Settings onClose={() => setShowSettings(false)} />
      ) : (
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
                onRFPAdded={handleRFPAdded}
              />
            </>
          ) : (
            <LaneEditor
              rfp={selectedRFP}
              onBack={() => setSelectedRFP(null)}
              onRFPUpdate={handleRFPUpdate}
            />
          )}
        </div>
      )}
    </div>
  );
}
