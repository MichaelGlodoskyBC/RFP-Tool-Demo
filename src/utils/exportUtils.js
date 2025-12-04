import * as XLSX from 'xlsx';

/**
 * Export lanes to Excel file
 */
export function exportToExcel(lanes, format = 'original', template = null) {
  let worksheetData = [];
  
  if (format === 'original' && template && template.mapping) {
    // Export in original template format
    const headers = [];
    const mapping = template.mapping;
    
    // Build headers based on template
    Object.keys(mapping).forEach(field => {
      const mappedNames = mapping[field];
      if (Array.isArray(mappedNames) && mappedNames.length > 0) {
        headers.push(mappedNames[0]); // Use first mapped name
      } else {
        headers.push(field);
      }
    });
    
    worksheetData.push(headers);
    
    // Map lanes to template format
    lanes.forEach(lane => {
      const row = [];
      Object.keys(mapping).forEach(field => {
        switch (field) {
          case 'origin':
            row.push(lane.origin);
            break;
          case 'destination':
            row.push(lane.destination);
            break;
          case 'distance':
            row.push(lane.distance);
            break;
          case 'rate':
            row.push(parseFloat(lane.baseRate));
            break;
          case 'volume':
            row.push(lane.volume || 1);
            break;
          case 'equipment':
            row.push(lane.equipment || 'Dry Van');
            break;
          default:
            row.push('');
        }
      });
      worksheetData.push(row);
    });
  } else if (format === 'tms') {
    // TMS format
    worksheetData = [
      ['Lane ID', 'Origin', 'Destination', 'Distance (mi)', 'Rate ($/mi)', 'Volume', 'Equipment', 'Margin %', 'Status', 'Scenario'],
      ...lanes.map(lane => [
        lane.id,
        lane.origin,
        lane.destination,
        lane.distance,
        parseFloat(lane.baseRate),
        lane.volume || 1,
        lane.equipment || 'Dry Van',
        parseFloat(lane.margin),
        lane.status,
        lane.scenario
      ])
    ];
  } else {
    // Custom/Standard format
    worksheetData = [
      ['Lane ID', 'Origin', 'Destination', 'Distance', 'Base Rate', 'Fuel Surcharge', 'Accessorials', 'Deadhead', 'Margin %', 'Volume', 'Equipment', 'Scenario', 'Status'],
      ...lanes.map(lane => [
        lane.id,
        lane.origin,
        lane.destination,
        lane.distance,
        parseFloat(lane.baseRate),
        parseFloat(lane.fuelSurcharge),
        parseFloat(lane.accessorials),
        lane.deadhead,
        parseFloat(lane.margin),
        lane.volume || 1,
        lane.equipment || 'Dry Van',
        lane.scenario,
        lane.status
      ])
    ];
  }
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // Set column widths
  const colWidths = worksheetData[0].map((_, i) => ({ wch: 15 }));
  ws['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(wb, ws, 'Lanes');
  
  // Generate file
  const fileName = `RFP_Lanes_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
  
  return fileName;
}






