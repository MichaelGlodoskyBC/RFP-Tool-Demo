import { createRFP } from '../services/rfpService';
import { demoRFPs } from '../data/demoData';

/**
 * Utility function to migrate demo data to Firestore
 * Run this once to populate your Firestore database with sample data
 * 
 * Usage: Call this function from browser console or create a temporary button
 * Example: migrateDemoData().then(() => console.log('Migration complete!'))
 */
export const migrateDemoData = async () => {
  try {
    console.log('Starting migration of demo data to Firestore...');
    const results = [];
    
    for (const rfp of demoRFPs) {
      try {
        const createdRFP = await createRFP(rfp);
        results.push({ success: true, rfpId: createdRFP.id, originalId: rfp.id });
        console.log(`✓ Migrated RFP: ${rfp.id} -> ${createdRFP.id}`);
      } catch (error) {
        results.push({ success: false, rfpId: rfp.id, error: error.message });
        console.error(`✗ Failed to migrate RFP: ${rfp.id}`, error);
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    console.log(`\nMigration complete!`);
    console.log(`Successfully migrated: ${successCount} RFPs`);
    if (failCount > 0) {
      console.log(`Failed to migrate: ${failCount} RFPs`);
    }
    
    return results;
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

// Make it available globally for easy access from browser console
if (typeof window !== 'undefined') {
  window.migrateDemoData = migrateDemoData;
}



