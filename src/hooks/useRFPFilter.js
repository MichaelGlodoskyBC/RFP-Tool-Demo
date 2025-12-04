import { useMemo } from 'react';

/**
 * Custom hook for filtering RFPs
 * @param {Array} rfps - Array of RFP objects
 * @param {string} searchQuery - Search query string
 * @param {string} filterStatus - Status filter ('all' or specific status)
 * @returns {Array} - Filtered array of RFPs
 */
export function useRFPFilter(rfps, searchQuery, filterStatus) {
  return useMemo(() => {
    return rfps.filter(rfp => {
      const matchesSearch = 
        rfp.shipper?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rfp.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        false;
      
      const matchesFilter = 
        filterStatus === 'all' || rfp.status === filterStatus;
      
      return matchesSearch && matchesFilter;
    });
  }, [rfps, searchQuery, filterStatus]);
}




