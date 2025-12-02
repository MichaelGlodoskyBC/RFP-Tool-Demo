import * as XLSX from 'xlsx';
import Papa from 'papaparse';

/**
 * Parse Excel file and extract lane data
 */
export async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Find header row (first non-empty row)
        let headerRowIndex = 0;
        for (let i = 0; i < jsonData.length; i++) {
          if (jsonData[i] && jsonData[i].length > 0 && jsonData[i].some(cell => cell)) {
            headerRowIndex = i;
            break;
          }
        }
        
        const headers = jsonData[headerRowIndex] || [];
        const rows = jsonData.slice(headerRowIndex + 1).filter(row => row && row.some(cell => cell));
        
        resolve({
          headers,
          rows,
          sheetName: firstSheetName,
          allSheets: workbook.SheetNames
        });
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error.message}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse CSV file and extract lane data
 */
export async function parseCSVFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0 && results.data.length === 0) {
          reject(new Error('Failed to parse CSV file'));
          return;
        }
        
        const data = results.data;
        if (data.length === 0) {
          reject(new Error('CSV file is empty'));
          return;
        }
        
        const headers = data[0] || [];
        const rows = data.slice(1);
        
        resolve({ headers, rows });
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV file: ${error.message}`));
      }
    });
  });
}

/**
 * Parse PDF file (basic text extraction)
 * Note: Full PDF parsing requires a backend service or more advanced library
 * This is a placeholder that extracts text from PDF
 */
export async function parsePDFFile(file) {
  // For now, return a placeholder structure
  // In production, you'd use a PDF parsing library or backend service
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      // This is a simplified approach - full PDF parsing would require pdf.js or backend
      resolve({
        headers: [],
        rows: [],
        note: 'PDF parsing requires additional setup. Please use Excel or CSV files for automatic parsing.'
      });
    };
    
    reader.onerror = () => reject(new Error('Failed to read PDF file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Extract lanes from parsed data using template mapping
 */
export function extractLanesFromData(parsedData, templateMapping = null) {
  const { headers, rows } = parsedData;
  
  if (!headers || headers.length === 0 || !rows || rows.length === 0) {
    return [];
  }
  
  // Default mapping if no template provided
  const defaultMapping = {
    origin: ['origin', 'orig', 'origin city', 'from', 'pickup'],
    destination: ['destination', 'dest', 'destination city', 'to', 'delivery'],
    distance: ['distance', 'miles', 'mi', 'mileage'],
    rate: ['rate', 'price', 'cost', 'base rate', 'rate/mile'],
    volume: ['volume', 'qty', 'quantity', 'loads'],
    equipment: ['equipment', 'equip', 'trailer type']
  };
  
  const mapping = templateMapping || defaultMapping;
  
  // Find column indices
  const findColumnIndex = (possibleNames) => {
    for (const name of possibleNames) {
      const index = headers.findIndex(h => 
        h && String(h).toLowerCase().includes(name.toLowerCase())
      );
      if (index !== -1) return index;
    }
    return -1;
  };
  
  const originIdx = findColumnIndex(mapping.origin || defaultMapping.origin);
  const destIdx = findColumnIndex(mapping.destination || defaultMapping.destination);
  const distanceIdx = findColumnIndex(mapping.distance || defaultMapping.distance);
  const rateIdx = findColumnIndex(mapping.rate || defaultMapping.rate);
  const volumeIdx = findColumnIndex(mapping.volume || defaultMapping.volume);
  const equipmentIdx = findColumnIndex(mapping.equipment || defaultMapping.equipment);
  
  // Extract lanes
  const lanes = rows
    .filter(row => row && (originIdx === -1 || row[originIdx]) && (destIdx === -1 || row[destIdx]))
    .map((row, index) => {
      const origin = originIdx !== -1 ? String(row[originIdx] || '').trim() : '';
      const dest = destIdx !== -1 ? String(row[destIdx] || '').trim() : '';
      
      if (!origin || !dest) return null;
      
      const distance = distanceIdx !== -1 ? parseFloat(row[distanceIdx]) || 0 : 0;
      const baseRate = rateIdx !== -1 ? parseFloat(row[rateIdx]) || 0 : 0;
      const volume = volumeIdx !== -1 ? parseInt(row[volumeIdx]) || 1 : 1;
      const equipment = equipmentIdx !== -1 ? String(row[equipmentIdx] || '').trim() : 'Dry Van';
      
      // Generate lane ID
      const laneId = `LANE-${String(index + 1).padStart(4, '0')}`;
      
      // Calculate margin (simplified - would use actual cost stack in production)
      const linehaul = baseRate * distance;
      const fuelSurcharge = (baseRate * 0.15).toFixed(2);
      const accessorials = (linehaul * 0.05).toFixed(2);
      const deadhead = Math.floor(distance * 0.1);
      const totalCost = linehaul + parseFloat(fuelSurcharge) * distance + parseFloat(accessorials) + deadhead * 1.5;
      const margin = totalCost > 0 ? ((baseRate * distance - totalCost) / totalCost * 100).toFixed(1) : '10.0';
      
      return {
        id: laneId,
        origin,
        destination: dest,
        equipment,
        distance: Math.floor(distance),
        volume,
        baseRate: baseRate.toFixed(2),
        fuelSurcharge,
        accessorials,
        deadhead,
        margin,
        scenario: 'Base',
        status: parseFloat(margin) < 8 ? 'Error' : parseFloat(margin) < 12 ? 'Warning' : 'Valid',
        warnings: parseFloat(margin) < 8 ? ['Margin below threshold'] : [],
        benchmark: (baseRate * 0.9).toFixed(2),
        historicalRate: null
      };
    })
    .filter(lane => lane !== null);
  
  return lanes;
}

/**
 * Validate file type
 */
export function validateFileType(file) {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv',
    'application/pdf'
  ];
  
  const validExtensions = ['.xlsx', '.xls', '.csv', '.pdf'];
  const fileName = file.name.toLowerCase();
  
  const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
  const hasValidType = validTypes.includes(file.type) || file.type === '';
  
  return hasValidExtension || hasValidType;
}



