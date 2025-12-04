import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import RFPList from './components/RFPList';
import LaneEditor from './components/LaneEditor';
import Settings from './components/Settings';
import ErrorBoundary from './components/common/ErrorBoundary';
import { useRFPFilter } from './hooks/useRFPFilter';
import { getAllRFPs, subscribeToRFPs, createRFP, updateRFP } from './services/rfpService';

export default function App() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedRFP, setSelectedRFP] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [rfps, setRfps] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load RFPs on mount
  useEffect(() => {
    const loadRFPs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllRFPs();
        setRfps(data);
      } catch (err) {
        console.error('Failed to load RFPs:', err);
        setError('Failed to load RFPs. Please check your Firebase configuration.');
      } finally {
        setLoading(false);
      }
    };

    loadRFPs();

    // Optional: Set up real-time subscription (uncomment to enable)
    // const unsubscribe = subscribeToRFPs((updatedRFPs) => {
    //   setRfps(updatedRFPs);
    // });
    // return () => unsubscribe();
  }, []);

  const handleRFPAdded = async (newRFP) => {
    try {
      const createdRFP = await createRFP(newRFP);
      setRfps(prev => [createdRFP, ...prev]);
    } catch (err) {
      console.error('Failed to create RFP:', err);
      alert('Failed to create RFP. Please try again.');
    }
  };

  const handleRFPUpdate = async (updatedRFP) => {
    try {
      const savedRFP = await updateRFP(updatedRFP.id, updatedRFP);
      setRfps(prev => prev.map(rfp => rfp.id === savedRFP.id ? savedRFP : rfp));
      setSelectedRFP(savedRFP);
    } catch (err) {
      console.error('Failed to update RFP:', err);
      alert('Failed to update RFP. Please try again.');
    }
  };

  const filteredRFPs = useRFPFilter(rfps, searchQuery, filterStatus);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading RFPs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 max-w-md">
          <div className="text-red-400 text-xl font-semibold mb-2">Error Loading Data</div>
          <div className="text-red-300 text-sm">{error}</div>
          <div className="text-gray-400 text-xs mt-4">
            Make sure you've set up your Firebase configuration in the .env file.
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
