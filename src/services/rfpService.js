import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

const RFPS_COLLECTION = 'rfps';
const LANES_COLLECTION = 'lanes';

// Convert Firestore Timestamp to ISO string
const timestampToISO = (timestamp) => {
  if (!timestamp) return null;
  if (timestamp.toDate) {
    return timestamp.toDate().toISOString();
  }
  return timestamp;
};

// Convert ISO string to Firestore Timestamp
const isoToTimestamp = (isoString) => {
  if (!isoString) return null;
  return Timestamp.fromDate(new Date(isoString));
};

// Convert RFP document from Firestore format
const convertRFPFromFirestore = (doc) => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    dueDate: timestampToISO(data.dueDate),
    createdAt: timestampToISO(data.createdAt),
    updatedAt: timestampToISO(data.updatedAt),
    // Lanes are stored as subcollection, so we'll fetch them separately
  };
};

// Convert RFP to Firestore format
const convertRFPToFirestore = (rfp) => {
  const { id, lanes, ...rfpData } = rfp;
  return {
    ...rfpData,
    dueDate: isoToTimestamp(rfpData.dueDate),
    createdAt: rfpData.createdAt ? isoToTimestamp(rfpData.createdAt) : Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
};

// Convert Lane document from Firestore format
const convertLaneFromFirestore = (doc) => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
  };
};

// Convert Lane to Firestore format
const convertLaneToFirestore = (lane) => {
  const { id, ...laneData } = lane;
  return {
    ...laneData,
    // Ensure numeric fields are numbers
    distance: typeof laneData.distance === 'string' ? parseFloat(laneData.distance) : laneData.distance,
    volume: typeof laneData.volume === 'string' ? parseInt(laneData.volume) : laneData.volume,
    baseRate: typeof laneData.baseRate === 'string' ? parseFloat(laneData.baseRate) : laneData.baseRate,
    fuelSurcharge: typeof laneData.fuelSurcharge === 'string' ? parseFloat(laneData.fuelSurcharge) : laneData.fuelSurcharge,
    accessorials: typeof laneData.accessorials === 'string' ? parseFloat(laneData.accessorials) : laneData.accessorials,
    deadhead: typeof laneData.deadhead === 'string' ? parseInt(laneData.deadhead) : laneData.deadhead,
    margin: typeof laneData.margin === 'string' ? parseFloat(laneData.margin) : laneData.margin,
  };
};

// Get all RFPs
export const getAllRFPs = async () => {
  try {
    const q = query(collection(db, RFPS_COLLECTION), orderBy('dueDate', 'desc'));
    const querySnapshot = await getDocs(q);
    const rfps = [];
    
    for (const docSnap of querySnapshot.docs) {
      const rfp = convertRFPFromFirestore(docSnap);
      // Fetch lanes for this RFP
      const lanesSnapshot = await getDocs(collection(db, RFPS_COLLECTION, docSnap.id, LANES_COLLECTION));
      rfp.lanes = lanesSnapshot.docs.map(laneDoc => convertLaneFromFirestore(laneDoc)) || [];
      rfps.push(rfp);
    }
    
    return rfps;
  } catch (error) {
    console.error('Error fetching RFPs:', error);
    throw error;
  }
};

// Get a single RFP by ID
export const getRFPById = async (rfpId) => {
  try {
    const rfpDoc = await getDoc(doc(db, RFPS_COLLECTION, rfpId));
    if (!rfpDoc.exists()) {
      throw new Error('RFP not found');
    }
    
    const rfp = convertRFPFromFirestore(rfpDoc);
    
    // Fetch lanes
    const lanesSnapshot = await getDocs(collection(db, RFPS_COLLECTION, rfpId, LANES_COLLECTION));
    rfp.lanes = lanesSnapshot.docs.map(laneDoc => convertLaneFromFirestore(laneDoc)) || [];
    
    return rfp;
  } catch (error) {
    console.error('Error fetching RFP:', error);
    throw error;
  }
};

// Create a new RFP
export const createRFP = async (rfpData) => {
  try {
    const rfpToSave = convertRFPToFirestore(rfpData);
    const { lanes, ...rfpWithoutLanes } = rfpToSave;
    
    // Add RFP document
    const rfpDocRef = await addDoc(collection(db, RFPS_COLLECTION), rfpWithoutLanes);
    
    // Add lanes as subcollection
    if (rfpData.lanes && rfpData.lanes.length > 0) {
      const lanesPromises = rfpData.lanes.map(lane => {
        const laneToSave = convertLaneToFirestore(lane);
        return addDoc(collection(db, RFPS_COLLECTION, rfpDocRef.id, LANES_COLLECTION), laneToSave);
      });
      await Promise.all(lanesPromises);
    }
    
    // Return the created RFP with lanes
    return await getRFPById(rfpDocRef.id);
  } catch (error) {
    console.error('Error creating RFP:', error);
    throw error;
  }
};

// Update an RFP
export const updateRFP = async (rfpId, rfpData) => {
  try {
    const rfpToSave = convertRFPToFirestore(rfpData);
    const { lanes, ...rfpWithoutLanes } = rfpToSave;
    
    // Update RFP document
    const rfpDocRef = doc(db, RFPS_COLLECTION, rfpId);
    await updateDoc(rfpDocRef, rfpWithoutLanes);
    
    // Update lanes (delete all and recreate for simplicity)
    // In production, you might want to do a more sophisticated merge
    if (rfpData.lanes) {
      // Delete existing lanes
      const existingLanes = await getDocs(collection(db, RFPS_COLLECTION, rfpId, LANES_COLLECTION));
      const deletePromises = existingLanes.docs.map(laneDoc => 
        deleteDoc(doc(db, RFPS_COLLECTION, rfpId, LANES_COLLECTION, laneDoc.id))
      );
      await Promise.all(deletePromises);
      
      // Add new lanes
      const addPromises = rfpData.lanes.map(lane => {
        const laneToSave = convertLaneToFirestore(lane);
        return addDoc(collection(db, RFPS_COLLECTION, rfpId, LANES_COLLECTION), laneToSave);
      });
      await Promise.all(addPromises);
    }
    
    return await getRFPById(rfpId);
  } catch (error) {
    console.error('Error updating RFP:', error);
    throw error;
  }
};

// Delete an RFP
export const deleteRFP = async (rfpId) => {
  try {
    // Delete all lanes first
    const lanesSnapshot = await getDocs(collection(db, RFPS_COLLECTION, rfpId, LANES_COLLECTION));
    const deleteLanesPromises = lanesSnapshot.docs.map(laneDoc =>
      deleteDoc(doc(db, RFPS_COLLECTION, rfpId, LANES_COLLECTION, laneDoc.id))
    );
    await Promise.all(deleteLanesPromises);
    
    // Delete RFP
    await deleteDoc(doc(db, RFPS_COLLECTION, rfpId));
  } catch (error) {
    console.error('Error deleting RFP:', error);
    throw error;
  }
};

// Subscribe to RFPs (real-time updates)
export const subscribeToRFPs = (callback) => {
  const q = query(collection(db, RFPS_COLLECTION), orderBy('dueDate', 'desc'));
  
  return onSnapshot(q, async (snapshot) => {
    const rfps = [];
    
    for (const docSnap of snapshot.docs) {
      const rfp = convertRFPFromFirestore(docSnap);
      // Fetch lanes for each RFP
      const lanesSnapshot = await getDocs(collection(db, RFPS_COLLECTION, docSnap.id, LANES_COLLECTION));
      rfp.lanes = lanesSnapshot.docs.map(laneDoc => convertLaneFromFirestore(laneDoc)) || [];
      rfps.push(rfp);
    }
    
    callback(rfps);
  }, (error) => {
    console.error('Error in RFP subscription:', error);
  });
};

// Subscribe to a single RFP (real-time updates)
export const subscribeToRFP = (rfpId, callback) => {
  const rfpDocRef = doc(db, RFPS_COLLECTION, rfpId);
  
  return onSnapshot(rfpDocRef, async (docSnap) => {
    if (!docSnap.exists()) {
      callback(null);
      return;
    }
    
    const rfp = convertRFPFromFirestore(docSnap);
    
    // Subscribe to lanes as well
    const lanesUnsubscribe = onSnapshot(
      collection(db, RFPS_COLLECTION, rfpId, LANES_COLLECTION),
      (lanesSnapshot) => {
        rfp.lanes = lanesSnapshot.docs.map(laneDoc => convertLaneFromFirestore(laneDoc)) || [];
        callback(rfp);
      }
    );
    
    return lanesUnsubscribe;
  }, (error) => {
    console.error('Error in RFP subscription:', error);
  });
};

