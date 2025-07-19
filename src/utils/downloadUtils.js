// Download utilities for EMI schedules and reports

// Generate EMI schedule data
export const generateEMISchedule = (loanData) => {
  console.log("generateEMISchedule received loanData:", loanData);
  if (!loanData) return []
  
  const amount = parseFloat(loanData.amount || loanData.loanAmount || loanData.principalAmount || 0)
  const interestRate = parseFloat(loanData.interestRate || loanData.rate || 0)
  const tenure = parseInt(loanData.tenure || loanData.months || loanData.loanTenure || 12) // Default to 12 months if not specified
  const disbursedDate = loanData.disbursedDate || loanData.startDate || loanData.createdAt || new Date().toISOString().split("T")[0]
  
  console.log("Parsed values:", { amount, interestRate, tenure, disbursedDate });
  
  if (!amount || !interestRate || !tenure) {
    console.warn("Invalid loan data for EMI schedule generation:", { amount, interestRate, tenure, loanData })
    return []
  }
  
  const principal = amount
  const rate = interestRate / (12 * 100) // Monthly interest rate
  const months = tenure
  
  // Calculate EMI using formula: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
  const emi = rate > 0 ? 
    (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1) :
    principal / months // If no interest
  
  const schedule = []
  let remainingPrincipal = principal
  const startDate = new Date(disbursedDate)
  
  for (let i = 1; i <= months; i++) {
    const interestAmount = remainingPrincipal * rate
    const principalAmount = emi - interestAmount
    remainingPrincipal = Math.max(0, remainingPrincipal - principalAmount)
    
    const dueDate = new Date(startDate)
    dueDate.setMonth(startDate.getMonth() + i)
    
    schedule.push({
      installmentNo: i,
      dueDate: dueDate.toLocaleDateString("en-IN"),
      emi: Math.round(emi),
      principal: Math.round(principalAmount),
      interest: Math.round(interestAmount),
      balance: Math.round(remainingPrincipal)
    })
  }
  
  return schedule
}

// Download EMI schedule as CSV
export const downloadEMIScheduleCSV = (loanData) => {
  try {
    const schedule = generateEMISchedule(loanData)
    
    if (!schedule || schedule.length === 0) {
      alert("No EMI schedule data available to download")
      return
    }
    
    // Create CSV content
    const headers = ["Installment No", "Due Date", "EMI Amount", "Principal", "Interest", "Outstanding Balance"]
    const csvContent = [
      headers.join(","),
      ...schedule.map(row => [
        row.installmentNo,
        `"${row.dueDate}"`, // Wrap date in quotes to handle commas
        row.emi,
        row.principal,
        row.interest,
        row.balance
      ].join(","))
    ].join("\n")
    
    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `EMI_Schedule_${loanData.id || loanData.loanId || "loan"}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error downloading EMI schedule:", error)
    alert("Failed to download EMI schedule. Please try again.")
  }
}

// Download loan details as PDF (simplified version)
export const downloadLoanDetailsPDF = (loanData) => {
  try {
    if (!loanData) {
      alert("No loan data available to download")
      return
    }
    
    const schedule = generateEMISchedule(loanData)
    
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Loan Details - ${loanData.id || loanData.loanId}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .loan-info { margin-bottom: 30px; }
          .loan-info table { width: 100%; border-collapse: collapse; }
          .loan-info th, .loan-info td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .loan-info th { background-color: #f2f2f2; }
          .schedule { margin-top: 30px; }
          .schedule table { width: 100%; border-collapse: collapse; font-size: 12px; }
          .schedule th, .schedule td { border: 1px solid #ddd; padding: 6px; text-align: center; }
          .schedule th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Loan Details & EMI Schedule</h1>
          <h2>Loan ID: ${loanData.id || loanData.loanId || "N/A"}</h2>
        </div>
        
        <div class="loan-info">
          <h3>Loan Information</h3>
          <table>
            <tr><th>Customer Name</th><td>${loanData.customerName || "N/A"}</td></tr>
            <tr><th>Customer Phone</th><td>${loanData.customerPhone || "N/A"}</td></tr>
            <tr><th>Loan Amount</th><td>₹${(loanData.amount || 0).toLocaleString("en-IN")}</td></tr>
            <tr><th>Interest Rate</th><td>${loanData.interestRate || 0}% p.a.</td></tr>
            <tr><th>Tenure</th><td>${loanData.tenure || 0} months</td></tr>
            <tr><th>Monthly EMI</th><td>₹${(loanData.monthlyEMI || loanData.emi || 0).toLocaleString("en-IN")}</td></tr>
            <tr><th>Purpose</th><td>${loanData.purpose || "N/A"}</td></tr>
            <tr><th>Status</th><td>${loanData.status || "N/A"}</td></tr>
          </table>
        </div>
        
        <div class="schedule">
          <h3>EMI Schedule</h3>
          <table>
            <thead>
              <tr>
                <th>Installment</th>
                <th>Due Date</th>
                <th>EMI Amount</th>
                <th>Principal</th>
                <th>Interest</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              ${schedule.map(row => `
                <tr>
                  <td>${row.installmentNo}</td>
                  <td>${row.dueDate}</td>
                  <td>₹${row.emi.toLocaleString("en-IN")}</td>
                  <td>₹${row.principal.toLocaleString("en-IN")}</td>
                  <td>₹${row.interest.toLocaleString("en-IN")}</td>
                  <td>₹${row.balance.toLocaleString("en-IN")}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `
    
    // Create and download HTML file (can be opened and printed as PDF)
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `Loan_Details_${loanData.id || loanData.loanId || "loan"}.html`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error downloading loan details:", error)
    alert("Failed to download loan details. Please try again.")
  }
}

// Download customer list as CSV
export const downloadCustomerListCSV = (customers) => {
  try {
    if (!customers || customers.length === 0) {
      alert("No customer data available to download")
      return
    }
    
    const headers = ["ID", "Name", "Phone", "Email", "Status", "Credit Score", "Join Date"]
    const csvContent = [
      headers.join(","),
      ...customers.map(customer => [
        customer.id || "",
        `"${customer.fullName || customer.name || ""}"`,
        customer.phoneNumber || customer.phone || "",
        customer.email || "",
        customer.status || "",
        customer.creditScore || "",
        customer.createdAt ? new Date(customer.createdAt).toLocaleDateString("en-IN") : ""
      ].join(","))
    ].join("\n")
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "Customer_List.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error downloading customer list:", error)
    alert("Failed to download customer list. Please try again.")
  }
}

// Download loans list as CSV
export const downloadLoansListCSV = (loans) => {
  try {
    if (!loans || loans.length === 0) {
      alert("No loan data available to download")
      return
    }
    
    const headers = ["Loan ID", "Customer Name", "Phone", "Amount", "EMI", "Status", "Next Due Date"]
    const csvContent = [
      headers.join(","),
      ...loans.map(loan => [
        loan.id || loan.loanId || "",
        `"${loan.customerName || ""}"`,
        loan.customerPhone || "",
        loan.amount || 0,
        loan.monthlyEMI || loan.emi || 0,
        loan.status || "",
        loan.nextDueDate || ""
      ].join(","))
    ].join("\n")
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "Loans_List.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error downloading loans list:", error)
    alert("Failed to download loans list. Please try again.")
  }
}


