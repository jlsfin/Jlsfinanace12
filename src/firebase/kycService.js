import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

const KYC_COLLECTION = 'kycDetails';

export const kycService = {
  async addKycDetails(kycData) {
    try {
      const docRef = await addDoc(collection(db, KYC_COLLECTION), {
        ...kycData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return {
        id: docRef.id,
        ...kycData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error adding KYC details:', error);
      throw error;
    }
  },

  async getKycDetailsByCustomerId(customerId) {
    try {
      const q = query(collection(db, KYC_COLLECTION), where('customerId', '==', customerId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting KYC details:', error);
      throw error;
    }
  },

  async updateKycDetails(kycId, kycData) {
    try {
      const kycRef = doc(db, KYC_COLLECTION, kycId);
      await updateDoc(kycRef, {
        ...kycData,
        updatedAt: serverTimestamp()
      });
      return {
        id: kycId,
        ...kycData,
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error updating KYC details:', error);
      throw error;
    }
  }
};

