import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';

const LOANS_COLLECTION = 'loans';

export const loanService = {
  // Add a new loan
  async addLoan(loanData) {
    try {
      // Generate loan ID
      const allLoans = await this.getAllLoans();
      const loanNumber = allLoans.length + 1;
      const loanId = `L${loanNumber.toString().padStart(3, '0')}`;
      
      // Calculate EMI
      const principal = parseFloat(loanData.amount);
      const rate = parseFloat(loanData.interestRate) / 100 / 12; // Monthly rate
      const tenure = parseInt(loanData.tenure);
      
      const emi = principal * (rate * Math.pow(1 + rate, tenure)) / (Math.pow(1 + rate, tenure) - 1);
      const totalAmount = emi * tenure;
      
      const docRef = await addDoc(collection(db, LOANS_COLLECTION), {
        loanId,
        customerId: loanData.customerId,
        customerName: loanData.customerName,
        customerPhone: loanData.customerPhone,
        principalAmount: principal,
        interestRate: parseFloat(loanData.interestRate),
        tenureMonths: tenure,
        monthlyEmi: Math.round(emi),
        totalAmount: Math.round(totalAmount),
        purpose: loanData.purpose,
        processingFees: parseFloat(loanData.processingFees) || 0,
        photoUrl: loanData.photoUrl || '',
        idCardUrl: loanData.idCardUrl || '',
        status: 'active',
        disbursedDate: new Date(),
        nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        totalPaid: 0,
        remainingAmount: Math.round(totalAmount),
        completedEmis: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return {
        id: docRef.id,
        loanId,
        customerId: loanData.customerId,
        customerName: loanData.customerName,
        customerPhone: loanData.customerPhone,
        principalAmount: principal,
        interestRate: parseFloat(loanData.interestRate),
        tenureMonths: tenure,
        monthlyEmi: Math.round(emi),
        totalAmount: Math.round(totalAmount),
        purpose: loanData.purpose,
        processingFees: parseFloat(loanData.processingFees) || 0,
        photoUrl: loanData.photoUrl || '',
        idCardUrl: loanData.idCardUrl || '',
        status: 'active',
        disbursedDate: new Date(),
        nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        totalPaid: 0,
        remainingAmount: Math.round(totalAmount),
        completedEmis: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error adding loan:', error);
      throw error;
    }
  },

  // Get all loans
  async getAllLoans() {
    try {
      const q = query(
        collection(db, LOANS_COLLECTION), 
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const loans = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        loans.push({
          id: doc.id,
          ...data,
          disbursedDate: data.disbursedDate?.toDate() || new Date(),
          nextDueDate: data.nextDueDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });
      
      return loans;
    } catch (error) {
      console.error('Error getting loans:', error);
      throw error;
    }
  },

  // Update a loan
  async updateLoan(loanId, loanData) {
    try {
      const loanRef = doc(db, LOANS_COLLECTION, loanId);
      await updateDoc(loanRef, {
        ...loanData,
        updatedAt: serverTimestamp()
      });
      
      return {
        id: loanId,
        ...loanData,
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error updating loan:', error);
      throw error;
    }
  },

  // Delete a loan (soft delete by updating status)
  async deleteLoan(loanId) {
    try {
      const loanRef = doc(db, LOANS_COLLECTION, loanId);
      await updateDoc(loanRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting loan:', error);
      throw error;
    }
  },

  // Get loans for a specific customer
  async getLoansByCustomer(customerId) {
    try {
      const q = query(
        collection(db, LOANS_COLLECTION),
        where('customerId', '==', customerId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const loans = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        loans.push({
          id: doc.id,
          ...data,
          disbursedDate: data.disbursedDate?.toDate() || new Date(),
          nextDueDate: data.nextDueDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });
      
      return loans;
    } catch (error) {
      console.error('Error getting customer loans:', error);
      throw error;
    }
  },

  // Calculate EMI
  calculateEMI(principal, rate, tenure) {
    const monthlyRate = rate / 100 / 12;
    const emi = principal * (monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
    return Math.round(emi);
  }
};

