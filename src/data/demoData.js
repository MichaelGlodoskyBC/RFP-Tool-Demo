// Demo data generator for RFP lanes
export function generateLanes(count) {
  const origins = ['Chicago, IL', 'Atlanta, GA', 'Los Angeles, CA', 'Dallas, TX', 'New York, NY', 'Phoenix, AZ'];
  const destinations = ['Miami, FL', 'Seattle, WA', 'Boston, MA', 'Denver, CO', 'Philadelphia, PA', 'Houston, TX'];
  const equipment = ['Dry Van', 'Reefer', 'Flatbed'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `LANE-${String(i + 1).padStart(4, '0')}`,
    origin: origins[Math.floor(Math.random() * origins.length)],
    destination: destinations[Math.floor(Math.random() * destinations.length)],
    equipment: equipment[Math.floor(Math.random() * equipment.length)],
    distance: Math.floor(Math.random() * 1500) + 100,
    volume: Math.floor(Math.random() * 50) + 1,
    baseRate: (Math.random() * 2 + 1.5).toFixed(2),
    fuelSurcharge: (Math.random() * 0.5 + 0.2).toFixed(2),
    accessorials: (Math.random() * 200 + 50).toFixed(2),
    deadhead: Math.floor(Math.random() * 100),
    margin: (Math.random() * 15 + 5).toFixed(1),
    scenario: ['Aggressive', 'Base', 'Defensive'][Math.floor(Math.random() * 3)],
    status: ['Valid', 'Warning', 'Error'][Math.floor(Math.random() * 10) > 7 ? 2 : Math.floor(Math.random() * 2)],
    warnings: Math.random() > 0.7 ? ['Margin below threshold', 'Deadhead exceeds 80mi'] : [],
    benchmark: (Math.random() * 2.5 + 1.2).toFixed(2),
    historicalRate: Math.random() > 0.5 ? (Math.random() * 2.3 + 1.3).toFixed(2) : null
  }));
}

// Demo RFP data
export const demoRFPs = [
  {
    id: 'RFP-2024-001',
    shipper: 'USPS Northeast',
    dueDate: '2024-12-15T17:00:00',
    mode: 'FTL',
    status: 'In Progress',
    laneCount: 247,
    completeness: 78,
    triageScore: 8.5,
    template: 'USPS Standard',
    hasNDA: true,
    lanes: generateLanes(247),
    metadata: {
      totalVolume: 1240,
      avgDistance: 487,
      regions: ['Northeast', 'Mid-Atlantic'],
      equipment: ['Dry Van', 'Reefer']
    }
  },
  {
    id: 'RFP-2024-002',
    shipper: 'Retail Corp',
    dueDate: '2024-12-10T12:00:00',
    mode: 'LTL',
    status: 'Ready to Submit',
    laneCount: 89,
    completeness: 100,
    triageScore: 7.2,
    template: 'Custom Retail',
    hasNDA: false,
    lanes: generateLanes(89),
    metadata: {
      totalVolume: 320,
      avgDistance: 234,
      regions: ['Midwest'],
      equipment: ['Dry Van']
    }
  },
  {
    id: 'RFP-2024-003',
    shipper: 'Industrial Supply Co',
    dueDate: '2024-12-20T23:59:00',
    mode: 'FTL',
    status: 'Pending Review',
    laneCount: 156,
    completeness: 45,
    triageScore: 6.8,
    template: 'E2Open',
    hasNDA: true,
    lanes: generateLanes(156),
    metadata: {
      totalVolume: 890,
      avgDistance: 612,
      regions: ['Southeast', 'Southwest'],
      equipment: ['Flatbed', 'Dry Van']
    }
  }
];

// Scenario configurations
export const scenarios = [
  { id: 'aggressive', name: 'Aggressive', color: '#ef4444', marginTarget: '5-8%' },
  { id: 'base', name: 'Base', color: '#3b82f6', marginTarget: '10-12%' },
  { id: 'defensive', name: 'Defensive', color: '#10b981', marginTarget: '15-18%' }
];
