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

const CUSTOMERS_COLLECTION = 'customers';

export const customerService = {
  // Add a new customer
  async addCustomer(customerData) {
    try {
      const docRef = await addDoc(collection(db, CUSTOMERS_COLLECTION), {
        ...customerData,
        status: 'active',
        creditScore: customerData.creditScore || 650,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return {
        id: docRef.id,
        ...customerData,
        status: 'active',
        creditScore: customerData.creditScore || 650,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  },

  // Get all customers
  async getAllCustomers() {
    try {
      const q = query(
        collection(db, CUSTOMERS_COLLECTION), 
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const customers = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        customers.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });
      
      return customers;
    } catch (error) {
      console.error('Error getting customers:', error);
      throw error;
    }
  },

  // Update a customer
  async updateCustomer(customerId, customerData) {
    try {
      const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
      await updateDoc(customerRef, {
        ...customerData,
        updatedAt: serverTimestamp()
      });
      
      return {
        id: customerId,
        ...customerData,
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  },

  // Delete a customer (soft delete by updating status)
  async deleteCustomer(customerId) {
    try {
      const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
      await updateDoc(customerRef, {
        status: 'inactive',
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  },

  // Search customers by name, phone, or email
  async searchCustomers(searchTerm) {
    try {
      const customers = await this.getAllCustomers();
      
      return customers.filter(customer => 
        customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phoneNumber?.includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
  }
};

