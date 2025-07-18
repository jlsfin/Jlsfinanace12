// PDF generation utilities for loan agreement and loan card
import { generateEMISchedule } from './downloadUtils'

// Generate Loan Agreement PDF
export const generateLoanAgreementPDF = async (loanData, customerData, kycData) => {
  try {
    const schedule = generateEMISchedule(loanData)
    const currentDate = new Date().toLocaleDateString('en-IN')
    
    // Create comprehensive loan agreement HTML
    const agreementHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Loan Agreement - ${loanData.id || loanData.loanId}</title>
        <style>
          body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 5px;
          }
          .document-title {
            font-size: 20px;
            font-weight: bold;
            margin: 20px 0;
            text-decoration: underline;
          }
          .section {
            margin: 20px 0;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #1f2937;
          }
          .party-info {
            display: flex;
            justify-content: space-between;
            margin: 20px 0;
          }
          .party {
            width: 48%;
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 5px;
          }
          .terms-list {
            list-style-type: decimal;
            margin-left: 20px;
          }
          .terms-list li {
            margin: 10px 0;
          }
          .loan-details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .loan-details-table th,
          .loan-details-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          .loan-details-table th {
            background-color: #f8f9fa;
            font-weight: bold;
          }
          .signature-section {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
          }
          .signature-box {
            width: 45%;
            text-align: center;
            border-top: 1px solid #333;
            padding-top: 10px;
            margin-top: 50px;
          }
          .customer-photo {
            width: 120px;
            height: 150px;
            border: 2px solid #333;
            margin: 10px auto;
            display: block;
            object-fit: cover;
          }
          .schedule-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 12px;
          }
          .schedule-table th,
          .schedule-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: center;
          }
          .schedule-table th {
            background-color: #f8f9fa;
          }
          @media print {
            body { margin: 0; }
            .page-break { page-break-before: always; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">JLS Finance</div>
          <div>Microfinance Institution</div>
          <div style="font-size: 14px; margin-top: 10px;">
            Address: [Company Address] | Phone: [Company Phone] | Email: [Company Email]
          </div>
        </div>

        <div class="document-title">LOAN AGREEMENT</div>

        <div class="section">
          <p><strong>Agreement Date:</strong> ${currentDate}</p>
          <p><strong>Loan Agreement No:</strong> ${loanData.id || loanData.loanId || 'N/A'}</p>
        </div>

        <div class="section">
          <div class="section-title">PARTIES TO THE AGREEMENT</div>
          <div class="party-info">
            <div class="party">
              <h4>LENDER</h4>
              <p><strong>JLS Finance</strong></p>
              <p>Microfinance Institution</p>
              <p>Registered Address: [Company Address]</p>
              <p>Phone: [Company Phone]</p>
              <p>Email: [Company Email]</p>
            </div>
            <div class="party">
              <h4>BORROWER</h4>
              <p><strong>${loanData.customerName || 'N/A'}</strong></p>
              <p>Phone: ${loanData.customerPhone || customerData?.phoneNumber || 'N/A'}</p>
              <p>Email: ${customerData?.email || 'N/A'}</p>
              <p>Address: ${customerData?.address || 'N/A'}</p>
              <p>Aadhar: ${customerData?.aadharNumber || kycData?.idProofNumber || 'N/A'}</p>
              <p>PAN: ${customerData?.panNumber || kycData?.panNumber || 'N/A'}</p>
              ${(loanData.photoUrl || customerData?.photoUrl || kycData?.customerPhoto) ? 
                `<img src="${loanData.photoUrl || customerData?.photoUrl || kycData?.customerPhoto}" 
                     alt="Customer Photo" class="customer-photo" />` : 
                '<div class="customer-photo" style="display: flex; align-items: center; justify-content: center; background-color: #f0f0f0;">Photo Not Available</div>'
              }
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">LOAN DETAILS</div>
          <table class="loan-details-table">
            <tr>
              <th>Loan Amount</th>
              <td>₹${(loanData.amount || 0).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <th>Interest Rate</th>
              <td>${loanData.interestRate || 0}% per annum</td>
            </tr>
            <tr>
              <th>Loan Tenure</th>
              <td>${loanData.tenure || 0} months</td>
            </tr>
            <tr>
              <th>Monthly EMI</th>
              <td>₹${(loanData.monthlyEMI || loanData.emi || 0).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <th>Total Amount Payable</th>
              <td>₹${((loanData.monthlyEMI || loanData.emi || 0) * (loanData.tenure || 0)).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <th>Purpose of Loan</th>
              <td>${loanData.purpose || 'N/A'}</td>
            </tr>
            <tr>
              <th>Processing Fees</th>
              <td>₹${(loanData.processingFees || 0).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <th>Disbursement Date</th>
              <td>${loanData.disbursedDate ? new Date(loanData.disbursedDate).toLocaleDateString('en-IN') : currentDate}</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">TERMS AND CONDITIONS</div>
          <ol class="terms-list">
            <li><strong>Loan Amount and Interest:</strong> The Lender agrees to provide a loan of ₹${(loanData.amount || 0).toLocaleString('en-IN')} to the Borrower at an interest rate of ${loanData.interestRate || 0}% per annum.</li>
            
            <li><strong>Repayment Schedule:</strong> The Borrower agrees to repay the loan in ${loanData.tenure || 0} equal monthly installments (EMIs) of ₹${(loanData.monthlyEMI || loanData.emi || 0).toLocaleString('en-IN')} each, starting from ${schedule.length > 0 ? schedule[0].dueDate : 'N/A'}.</li>
            
            <li><strong>Purpose of Loan:</strong> The loan is sanctioned for ${loanData.purpose || 'specified purpose'} and shall not be used for any other purpose without prior written consent of the Lender.</li>
            
            <li><strong>Security:</strong> This loan is secured by the personal guarantee of the Borrower and any collateral as specified in the loan application.</li>
            
            <li><strong>Default and Penalties:</strong> In case of default in payment of any EMI, a penalty of 2% per month on the overdue amount will be charged. The Lender reserves the right to recall the entire outstanding amount in case of default.</li>
            
            <li><strong>Prepayment:</strong> The Borrower may prepay the loan in full or in part at any time without penalty, subject to giving 30 days prior notice to the Lender.</li>
            
            <li><strong>Insurance:</strong> The Borrower agrees to maintain adequate insurance coverage for the loan amount and provide the Lender with proof of such insurance.</li>
            
            <li><strong>Documentation:</strong> The Borrower has provided all necessary documents including identity proof, address proof, income proof, and photographs as required by the Lender.</li>
            
            <li><strong>Legal Jurisdiction:</strong> This agreement shall be governed by the laws of India and any disputes shall be subject to the jurisdiction of courts in [City Name].</li>
            
            <li><strong>Amendment:</strong> This agreement can only be amended by mutual written consent of both parties.</li>
          </ol>
        </div>

        <div class="page-break"></div>

        <div class="section">
          <div class="section-title">EMI REPAYMENT SCHEDULE</div>
          <table class="schedule-table">
            <thead>
              <tr>
                <th>EMI No.</th>
                <th>Due Date</th>
                <th>EMI Amount</th>
                <th>Principal</th>
                <th>Interest</th>
                <th>Outstanding Balance</th>
              </tr>
            </thead>
            <tbody>
              ${schedule.map(emi => `
                <tr>
                  <td>${emi.installmentNo}</td>
                  <td>${emi.dueDate}</td>
                  <td>₹${emi.emi.toLocaleString("en-IN")}</td>
                  <td>₹${emi.principal.toLocaleString("en-IN")}</td>
                  <td>₹${emi.interest.toLocaleString("en-IN")}</td>
                  <td>₹${emi.balance.toLocaleString("en-IN")}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <strong>BORROWER SIGNATURE</strong><br>
            ${loanData.customerName || 'N/A'}<br>
            Date: ${currentDate}
          </div>
          <div class="signature-box">
            <strong>LENDER SIGNATURE</strong><br>
            JLS Finance<br>
            Date: ${currentDate}
          </div>
        </div>

        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
          <p>This is a computer-generated document and does not require a physical signature.</p>
          <p>For any queries, please contact JLS Finance at [Company Phone] or [Company Email]</p>
        </div>
      </body>
      </html>
    `
    
    // Create and download HTML file (can be opened and printed as PDF)
    const blob = new Blob([agreementHTML], { type: 'text/html;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `Loan_Agreement_${loanData.id || loanData.loanId || 'loan'}.html`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error generating loan agreement:', error)
    throw error
  }
}

// Generate Loan Card PDF (Haryana Standard)
export const generateLoanCardPDF = async (loanData, customerData, kycData) => {
  try {
    const schedule = generateEMISchedule(loanData)
    const currentDate = new Date().toLocaleDateString('en-IN')
    
    // Create Haryana standard loan card HTML
    const loanCardHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Loan Card - ${loanData.id || loanData.loanId}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.4;
            margin: 20px;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
          }
          .card-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            padding: 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
          }
          .header p {
            margin: 5px 0 0 0;
            opacity: 0.9;
          }
          .card-body {
            padding: 30px;
          }
          .borrower-section {
            display: flex;
            margin-bottom: 30px;
            align-items: flex-start;
          }
          .borrower-info {
            flex: 1;
          }
          .borrower-photo {
            width: 120px;
            height: 150px;
            border: 3px solid #2a5298;
            border-radius: 10px;
            margin-left: 20px;
            object-fit: cover;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          .info-item {
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #2a5298;
          }
          .info-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          .info-value {
            font-size: 16px;
            font-weight: bold;
            color: #333;
          }
          .schedule-section {
            margin-top: 30px;
          }
          .schedule-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #2a5298;
            border-bottom: 2px solid #2a5298;
            padding-bottom: 5px;
          }
          .schedule-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }
          .schedule-table th,
          .schedule-table td {
            border: 1px solid #ddd;
            padding: 6px;
            text-align: center;
          }
          .schedule-table th {
            background: #2a5298;
            color: white;
            font-weight: bold;
          }
          .schedule-table tr:nth-child(even) {
            background: #f8f9fa;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #ddd;
          }
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 60px;
            color: rgba(42, 82, 152, 0.1);
            font-weight: bold;
            z-index: 0;
            pointer-events: none;
          }
          @media print {
            body { margin: 0; background: white; }
            .card-container { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="watermark">JLS FINANCE</div>
        <div class="card-container">
          <div class="header">
            <h1>HARYANA MICROFINANCE LOAN CARD</h1>
            <p>Government Approved Microfinance Institution</p>
            <p>Loan Card No: ${loanData.id || loanData.loanId || 'N/A'}</p>
          </div>
          
          <div class="card-body">
            <div class="borrower-section">
              <div class="borrower-info">
                <h2 style="margin: 0 0 15px 0; color: #2a5298;">BORROWER DETAILS</h2>
                <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">
                  ${loanData.customerName || 'N/A'}
                </div>
                <div style="color: #666; margin-bottom: 5px;">
                  Phone: ${loanData.customerPhone || customerData?.phoneNumber || 'N/A'}
                </div>
                <div style="color: #666; margin-bottom: 5px;">
                  Email: ${customerData?.email || 'N/A'}
                </div>
                <div style="color: #666;">
                  Address: ${customerData?.address || 'N/A'}
                </div>
              </div>
              ${(loanData.photoUrl || customerData?.photoUrl || kycData?.customerPhoto) ? 
                `<img src="${loanData.photoUrl || customerData?.photoUrl || kycData?.customerPhoto}" 
                     alt="Borrower Photo" class="borrower-photo" />` : 
                '<div class="borrower-photo" style="display: flex; align-items: center; justify-content: center; background-color: #f0f0f0; color: #666;">Photo Not Available</div>'
              }
            </div>
            
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Loan Amount</div>
                <div class="info-value">₹${(loanData.amount || loanData.principalAmount || 0).toLocaleString('en-IN')}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Interest Rate</div>
                <div class="info-value">${loanData.interestRate || 0}% per annum</div>
              </div>
              <div class="info-item">
                <div class="info-label">Loan Tenure</div>
                <div class="info-value">${loanData.tenure || loanData.loanTenure || 12} months</div>
              </div>
              <div class="info-item">
                <div class="info-label">Monthly EMI</div>
                <div class="info-value">₹${(loanData.monthlyEMI || loanData.emi || (() => {
                  const principal = parseFloat(loanData.amount || loanData.principalAmount || 0)
                  const rate = parseFloat(loanData.interestRate || 0)
                  const tenure = parseInt(loanData.tenure || loanData.loanTenure || 12)
                  if (!principal || !rate || !tenure) return 0
                  const monthlyRate = rate / 100 / 12
                  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                              (Math.pow(1 + monthlyRate, tenure) - 1)
                  return Math.round(emi)
                })()).toLocaleString('en-IN')}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Disbursement Date</div>
                <div class="info-value">${loanData.disbursedDate ? new Date(loanData.disbursedDate).toLocaleDateString('en-IN') : currentDate}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Loan Purpose</div>
                <div class="info-value">${loanData.purpose || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Aadhar Number</div>
                <div class="info-value">${customerData?.aadharNumber || kycData?.idProofNumber || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">PAN Number</div>
                <div class="info-value">${customerData?.panNumber || kycData?.panNumber || 'N/A'}</div>
              </div>
            </div>
            
            <div class="schedule-section">
              <div class="schedule-title">REPAYMENT SCHEDULE</div>
              <table class="schedule-table">
                <thead>
                  <tr>
                    <th>EMI No.</th>
                    <th>Due Date</th>
                    <th>EMI Amount</th>
                    <th>Principal</th>
                    <th>Interest</th>
                    <th>Balance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${schedule.map(emi => `
                    <tr>
                      <td>${emi.installmentNo}</td>
                      <td>${emi.dueDate}</td>
                      <td>₹${emi.emi.toLocaleString("en-IN")}</td>
                      <td>₹${emi.principal.toLocaleString("en-IN")}</td>
                      <td>₹${emi.interest.toLocaleString("en-IN")}</td>
                      <td>₹${emi.balance.toLocaleString("en-IN")}</td>
                      <td>${emi.installmentNo <= (loanData.completedEMIs || 0) ? 'PAID' : 'PENDING'}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Terms & Conditions:</strong></p>
            <p style="font-size: 12px; margin: 10px 0;">
              1. This loan card is valid for the entire tenure of the loan.<br>
              2. EMI payments must be made on or before the due date to avoid penalties.<br>
              3. Late payment charges of 2% per month will be applicable on overdue amounts.<br>
              4. This card must be presented during all loan-related transactions.<br>
              5. For any queries, contact JLS Finance at [Company Phone] or visit our office.
            </p>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">
              Generated on: ${currentDate} | This is a computer-generated document.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
    
    // Create and download HTML file (can be opened and printed as PDF)
    const blob = new Blob([loanCardHTML], { type: 'text/html;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `Loan_Card_${loanData.id || loanData.loanId || 'loan'}.html`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error generating loan card:', error)
    throw error
  }
}

