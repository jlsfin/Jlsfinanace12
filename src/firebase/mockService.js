// Mock service for local testing when Firebase permissions are not configured
let mockCustomers = [
  {
    id: '1',
    fullName: 'Rajesh Kumar',
    phoneNumber: '9876543210',
    email: 'rajesh@example.com',
    address: 'Delhi, India',
    aadharNumber: '1234-5678-9012',
    panNumber: 'ABCDE1234F',
    status: 'active',
    creditScore: 750,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    fullName: 'Priya Sharma',
    phoneNumber: '9876543211',
    email: 'priya@example.com',
    address: 'Mumbai, India',
    aadharNumber: '2345-6789-0123',
    panNumber: 'BCDEF2345G',
    status: 'active',
    creditScore: 720,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '3',
    fullName: 'Amit Singh',
    phoneNumber: '9876543212',
    email: 'amit@example.com',
    address: 'Bangalore, India',
    aadharNumber: '3456-7890-1234',
    panNumber: 'CDEFG3456H',
    status: 'inactive',
    creditScore: 680,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25')
  }
];

let mockLoans = [
  {
    id: 'L001',
    customerId: '1',
    customerName: 'Rajesh Kumar',
    customerPhone: '9876543210',
    amount: 50000,
    interestRate: 12,
    tenure: 12,
    purpose: 'Business Expansion',
    processingFees: 1000,
    customerPhoto: '',
    idCardPhoto: '',
    emi: 4441,
    totalAmount: 53292,
    paidAmount: 31087,
    remainingAmount: 22205,
    status: 'active',
    nextDueDate: '2024-08-15',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'L002',
    customerId: '2',
    customerName: 'Priya Sharma',
    customerPhone: '9876543211',
    amount: 75000,
    interestRate: 12,
    tenure: 24,
    purpose: 'Home Renovation',
    processingFees: 1500,
    customerPhoto: '',
    idCardPhoto: '',
    emi: 3465,
    totalAmount: 83160,
    paidAmount: 20790,
    remainingAmount: 62370,
    status: 'active',
    nextDueDate: '2024-08-20',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: 'L003',
    customerId: '3',
    customerName: 'Amit Singh',
    customerPhone: '9876543212',
    amount: 30000,
    interestRate: 12,
    tenure: 18,
    purpose: 'Education',
    processingFees: 750,
    customerPhoto: '',
    idCardPhoto: '',
    emi: 1956,
    totalAmount: 35208,
    paidAmount: 35208,
    remainingAmount: 0,
    status: 'completed',
    nextDueDate: 'Completed',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-07-10')
  }
];

export const mockCustomerService = {
  async addCustomer(customerData) {
    try {
      const newCustomer = {
        id: (mockCustomers.length + 1).toString(),
        ...customerData,
        status: 'active',
        creditScore: customerData.creditScore || 650,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockCustomers.push(newCustomer);
      return newCustomer;
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  },

  async getAllCustomers() {
    try {
      return mockCustomers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error getting customers:', error);
      throw error;
    }
  },

  async updateCustomer(id, updates) {
    try {
      const index = mockCustomers.findIndex(customer => customer.id === id);
      if (index !== -1) {
        mockCustomers[index] = {
          ...mockCustomers[index],
          ...updates,
          updatedAt: new Date()
        };
        return mockCustomers[index];
      }
      throw new Error('Customer not found');
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  },

  async deleteCustomer(id) {
    try {
      const index = mockCustomers.findIndex(customer => customer.id === id);
      if (index !== -1) {
        mockCustomers.splice(index, 1);
        return true;
      }
      throw new Error('Customer not found');
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  },

  async searchCustomers(searchTerm) {
    try {
      const term = searchTerm.toLowerCase();
      return mockCustomers.filter(customer =>
        customer.fullName.toLowerCase().includes(term) ||
        customer.phoneNumber.includes(term) ||
        customer.email.toLowerCase().includes(term)
      );
    } catch (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
  }
};

export const mockLoanService = {
  async addLoan(loanData) {
    try {
      const newLoan = {
        id: `L${(mockLoans.length + 1).toString().padStart(3, '0')}`,
        ...loanData,
        emi: calculateEMI(loanData.amount, loanData.interestRate, loanData.tenure),
        totalAmount: calculateTotalAmount(loanData.amount, loanData.interestRate, loanData.tenure),
        paidAmount: 0,
        remainingAmount: calculateTotalAmount(loanData.amount, loanData.interestRate, loanData.tenure),
        status: 'active',
        nextDueDate: getNextDueDate(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockLoans.push(newLoan);
      return newLoan;
    } catch (error) {
      console.error('Error adding loan:', error);
      throw error;
    }
  },

  async getAllLoans() {
    try {
      return mockLoans.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error getting loans:', error);
      throw error;
    }
  },

  async updateLoan(id, updates) {
    try {
      const index = mockLoans.findIndex(loan => loan.id === id);
      if (index !== -1) {
        mockLoans[index] = {
          ...mockLoans[index],
          ...updates,
          updatedAt: new Date()
        };
        return mockLoans[index];
      }
      throw new Error('Loan not found');
    } catch (error) {
      console.error('Error updating loan:', error);
      throw error;
    }
  },

  async deleteLoan(id) {
    try {
      const index = mockLoans.findIndex(loan => loan.id === id);
      if (index !== -1) {
        mockLoans.splice(index, 1);
        return true;
      }
      throw new Error('Loan not found');
    } catch (error) {
      console.error('Error deleting loan:', error);
      throw error;
    }
  },

  async searchLoans(searchTerm) {
    try {
      const term = searchTerm.toLowerCase();
      return mockLoans.filter(loan =>
        loan.id.toLowerCase().includes(term) ||
        loan.customerName.toLowerCase().includes(term) ||
        loan.customerPhone.includes(term)
      );
    } catch (error) {
      console.error('Error searching loans:', error);
      throw error;
    }
  }
};

// Helper functions
function calculateEMI(principal, rate, tenure) {
  const monthlyRate = rate / (12 * 100);
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
              (Math.pow(1 + monthlyRate, tenure) - 1);
  return Math.round(emi);
}

function calculateTotalAmount(principal, rate, tenure) {
  const emi = calculateEMI(principal, rate, tenure);
  return emi * tenure;
}

function getNextDueDate() {
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  return nextMonth.toISOString().split('T')[0];
}

