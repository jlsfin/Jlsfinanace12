// PDF generation utilities for loan agreement and loan card
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { generateEMISchedule } from './downloadUtils'

// Generate Loan Agreement PDF
export const generateLoanAgreementPDF = async (loanData, customerData, kycData) => {
  try {
    const schedule = generateEMISchedule(loanData)
    const currentDate = new Date().toLocaleDateString('en-IN')
    
    // Create a temporary div for PDF generation
    const tempDiv = document.createElement('div')
    tempDiv.style.position = 'absolute'
    tempDiv.style.left = '-9999px'
    tempDiv.style.width = '210mm'
    tempDiv.style.padding = '20px'
    tempDiv.style.fontFamily = 'Arial, sans-serif'
    tempDiv.style.fontSize = '12px'
    tempDiv.style.lineHeight = '1.4'
    tempDiv.style.color = '#333333'
    tempDiv.style.backgroundColor = '#ffffff'
    
    tempDiv.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333333; padding-bottom: 20px;">
        <div style="font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 5px;">JLS Finance</div>
        <div>Microfinance Institution</div>
        <div style="font-size: 14px; margin-top: 10px;">
          Address: [Company Address] | Phone: [Company Phone] | Email: [Company Email]
        </div>
      </div>

      <div style="font-size: 20px; font-weight: bold; margin: 20px 0; text-decoration: underline; text-align: center;">LOAN AGREEMENT</div>

      <div style="margin: 20px 0;">
        <p><strong>Agreement Date:</strong> ${currentDate}</p>
        <p><strong>Loan Agreement No:</strong> ${loanData.id || loanData.loanId || 'N/A'}</p>
      </div>

      <div style="margin: 20px 0;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #1f2937;">PARTIES TO THE AGREEMENT</div>
        <div style="display: flex; justify-content: space-between; margin: 20px 0;">
          <div style="width: 48%; border: 1px solid #dddddd; padding: 15px; border-radius: 5px;">
            <h4>LENDER</h4>
            <p><strong>JLS Finance</strong></p>
            <p>Microfinance Institution</p>
            <p>Registered Address: [Company Address]</p>
            <p>Phone: [Company Phone]</p>
            <p>Email: [Company Email]</p>
          </div>
          <div style="width: 48%; border: 1px solid #dddddd; padding: 15px; border-radius: 5px;">
            <h4>BORROWER</h4>
            <p><strong>${loanData.customerName || 'N/A'}</strong></p>
            <p>Phone: ${loanData.customerPhone || customerData?.phoneNumber || 'N/A'}</p>
            <p>Email: ${customerData?.email || 'N/A'}</p>
            <p>Address: ${customerData?.address || 'N/A'}</p>
            <p>Aadhar: ${customerData?.aadharNumber || kycData?.idProofNumber || 'N/A'}</p>
            <p>PAN: ${customerData?.panNumber || kycData?.panNumber || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div style="margin: 20px 0;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #1f2937;">LOAN DETAILS</div>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <th style="border: 1px solid #dddddd; padding: 12px; text-align: left; background-color: #f8f9fa; font-weight: bold;">Loan Amount</th>
            <td style="border: 1px solid #dddddd; padding: 12px; text-align: left;">₹${(loanData.amount || 0).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <th style="border: 1px solid #dddddd; padding: 12px; text-align: left; background-color: #f8f9fa; font-weight: bold;">Interest Rate</th>
            <td style="border: 1px solid #dddddd; padding: 12px; text-align: left;">${loanData.interestRate || 0}% per annum</td>
          </tr>
          <tr>
            <th style="border: 1px solid #dddddd; padding: 12px; text-align: left; background-color: #f8f9fa; font-weight: bold;">Loan Tenure</th>
            <td style="border: 1px solid #dddddd; padding: 12px; text-align: left;">${loanData.tenure || 0} months</td>
          </tr>
          <tr>
            <th style="border: 1px solid #dddddd; padding: 12px; text-align: left; background-color: #f8f9fa; font-weight: bold;">Monthly EMI</th>
            <td style="border: 1px solid #dddddd; padding: 12px; text-align: left;">₹${(loanData.monthlyEMI || loanData.emi || 0).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <th style="border: 1px solid #dddddd; padding: 12px; text-align: left; background-color: #f8f9fa; font-weight: bold;">Total Amount Payable</th>
            <td style="border: 1px solid #dddddd; padding: 12px; text-align: left;">₹${((loanData.monthlyEMI || loanData.emi || 0) * (loanData.tenure || 0)).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <th style="border: 1px solid #dddddd; padding: 12px; text-align: left; background-color: #f8f9fa; font-weight: bold;">Purpose of Loan</th>
            <td style="border: 1px solid #dddddd; padding: 12px; text-align: left;">${loanData.purpose || 'N/A'}</td>
          </tr>
        </table>
      </div>

      <div style="margin: 20px 0;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #1f2937;">EMI REPAYMENT SCHEDULE</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
          <thead>
            <tr>
              <th style="border: 1px solid #dddddd; padding: 6px; text-align: center; background-color: #f8f9fa;">EMI No.</th>
              <th style="border: 1px solid #dddddd; padding: 6px; text-align: center; background-color: #f8f9fa;">Due Date</th>
              <th style="border: 1px solid #dddddd; padding: 6px; text-align: center; background-color: #f8f9fa;">EMI Amount</th>
              <th style="border: 1px solid #dddddd; padding: 6px; text-align: center; background-color: #f8f9fa;">Principal</th>
              <th style="border: 1px solid #dddddd; padding: 6px; text-align: center; background-color: #f8f9fa;">Interest</th>
              <th style="border: 1px solid #dddddd; padding: 6px; text-align: center; background-color: #f8f9fa;">Outstanding Balance</th>
            </tr>
          </thead>
          <tbody>
            ${schedule.map(emi => `
              <tr>
                <td style="border: 1px solid #dddddd; padding: 6px; text-align: center;">${emi.installmentNo}</td>
                <td style="border: 1px solid #dddddd; padding: 6px; text-align: center;">${emi.dueDate}</td>
                <td style="border: 1px solid #dddddd; padding: 6px; text-align: center;">₹${emi.emi.toLocaleString("en-IN")}</td>
                <td style="border: 1px solid #dddddd; padding: 6px; text-align: center;">₹${emi.principal.toLocaleString("en-IN")}</td>
                <td style="border: 1px solid #dddddd; padding: 6px; text-align: center;">₹${emi.interest.toLocaleString("en-IN")}</td>
                <td style="border: 1px solid #dddddd; padding: 6px; text-align: center;">₹${emi.balance.toLocaleString("en-IN")}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <div style="margin-top: 50px; display: flex; justify-content: space-between;">
        <div style="width: 45%; text-align: center; border-top: 1px solid #333333; padding-top: 10px; margin-top: 50px;">
          <strong>BORROWER SIGNATURE</strong><br>
          ${loanData.customerName || 'N/A'}<br>
          Date: ${currentDate}
        </div>
        <div style="width: 45%; text-align: center; border-top: 1px solid #333333; padding-top: 10px; margin-top: 50px;">
          <strong>LENDER SIGNATURE</strong><br>
          JLS Finance<br>
          Date: ${currentDate}
        </div>
      </div>
    `
    
    document.body.appendChild(tempDiv)
    
    // Generate PDF using html2canvas and jsPDF
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    })
    
    document.body.removeChild(tempDiv)
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 210
    const pageHeight = 295
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    
    let position = 0
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }
    
    pdf.save(`Loan_Agreement_${loanData.id || loanData.loanId || 'loan'}.pdf`)
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
    
    // Create a temporary div for PDF generation
    const tempDiv = document.createElement('div')
    tempDiv.style.position = 'absolute'
    tempDiv.style.left = '-9999px'
    tempDiv.style.width = '210mm'
    tempDiv.style.padding = '20px'
    tempDiv.style.fontFamily = 'Arial, sans-serif'
    tempDiv.style.fontSize = '12px'
    tempDiv.style.lineHeight = '1.4'
    tempDiv.style.color = '#333333'
    tempDiv.style.backgroundColor = '#ffffff'
    
    tempDiv.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto; background: #ffffff; border-radius: 15px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: #ffffff; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">HARYANA MICROFINANCE LOAN CARD</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Government Approved Microfinance Institution</p>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Loan Card No: ${loanData.id || loanData.loanId || 'N/A'}</p>
        </div>
        
        <div style="padding: 30px;">
          <div style="display: flex; margin-bottom: 30px; align-items: flex-start;">
            <div style="flex: 1;">
              <h2 style="margin: 0 0 15px 0; color: #2a5298;">BORROWER DETAILS</h2>
              <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">
                ${loanData.customerName || 'N/A'}
              </div>
              <div style="color: #666666; margin-bottom: 5px;">
                Phone: ${loanData.customerPhone || customerData?.phoneNumber || 'N/A'}
              </div>
              <div style="color: #666666; margin-bottom: 5px;">
                Email: ${customerData?.email || 'N/A'}
              </div>
              <div style="color: #666666;">
                Address: ${customerData?.address || 'N/A'}
              </div>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
            <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #2a5298;">
              <div style="font-size: 12px; color: #666666; text-transform: uppercase; margin-bottom: 5px;">Loan Amount</div>
              <div style="font-size: 16px; font-weight: bold; color: #333333;">₹${(loanData.amount || loanData.principalAmount || 0).toLocaleString('en-IN')}</div>
            </div>
            <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #2a5298;">
              <div style="font-size: 12px; color: #666666; text-transform: uppercase; margin-bottom: 5px;">Interest Rate</div>
              <div style="font-size: 16px; font-weight: bold; color: #333333;">${loanData.interestRate || 0}% per annum</div>
            </div>
            <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #2a5298;">
              <div style="font-size: 12px; color: #666666; text-transform: uppercase; margin-bottom: 5px;">Loan Tenure</div>
              <div style="font-size: 16px; font-weight: bold; color: #333333;">${loanData.tenure || loanData.loanTenure || 12} months</div>
            </div>
            <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #2a5298;">
              <div style="font-size: 12px; color: #666666; text-transform: uppercase; margin-bottom: 5px;">Monthly EMI</div>
              <div style="font-size: 16px; font-weight: bold; color: #333333;">₹${(loanData.monthlyEMI || loanData.emi || (() => {
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
          </div>
          
          <div style="margin-top: 30px;">
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #2a5298; border-bottom: 2px solid #2a5298; padding-bottom: 5px;">REPAYMENT SCHEDULE</div>
            <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
              <thead>
                <tr>
                  <th style="border: 1px solid #dddddd; padding: 6px; text-align: center; background: #2a5298; color: #ffffff; font-weight: bold;">EMI No.</th>
                  <th style="border: 1px solid #dddddd; padding: 6px; text-align: center; background: #2a5298; color: #ffffff; font-weight: bold;">Due Date</th>
                  <th style="border: 1px solid #dddddd; padding: 6px; text-align: center; background: #2a5298; color: #ffffff; font-weight: bold;">EMI Amount</th>
                  <th style="border: 1px solid #dddddd; padding: 6px; text-align: center; background: #2a5298; color: #ffffff; font-weight: bold;">Principal</th>
                  <th style="border: 1px solid #dddddd; padding: 6px; text-align: center; background: #2a5298; color: #ffffff; font-weight: bold;">Interest</th>
                  <th style="border: 1px solid #dddddd; padding: 6px; text-align: center; background: #2a5298; color: #ffffff; font-weight: bold;">Balance</th>
                  <th style="border: 1px solid #dddddd; padding: 6px; text-align: center; background: #2a5298; color: #ffffff; font-weight: bold;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${schedule.map((emi, index) => `
                  <tr style="${index % 2 === 1 ? 'background: #f8f9fa;' : ''}">
                    <td style="border: 1px solid #dddddd; padding: 6px; text-align: center;">${emi.installmentNo}</td>
                    <td style="border: 1px solid #dddddd; padding: 6px; text-align: center;">${emi.dueDate}</td>
                    <td style="border: 1px solid #dddddd; padding: 6px; text-align: center;">₹${emi.emi.toLocaleString("en-IN")}</td>
                    <td style="border: 1px solid #dddddd; padding: 6px; text-align: center;">₹${emi.principal.toLocaleString("en-IN")}</td>
                    <td style="border: 1px solid #dddddd; padding: 6px; text-align: center;">₹${emi.interest.toLocaleString("en-IN")}</td>
                    <td style="border: 1px solid #dddddd; padding: 6px; text-align: center;">₹${emi.balance.toLocaleString("en-IN")}</td>
                    <td style="border: 1px solid #dddddd; padding: 6px; text-align: center;">${emi.installmentNo <= (loanData.completedEMIs || 0) ? 'PAID' : 'PENDING'}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #dddddd;">
          <p><strong>Terms & Conditions:</strong></p>
          <p style="font-size: 12px; margin: 10px 0;">
            1. This loan card is valid for the entire tenure of the loan.<br>
            2. EMI payments must be made on or before the due date to avoid penalties.<br>
            3. Late payment charges of 2% per month will be applicable on overdue amounts.<br>
            4. This card must be presented during all loan-related transactions.<br>
            5. For any queries, contact JLS Finance at [Company Phone] or visit our office.
          </p>
          <p style="margin-top: 20px; font-size: 12px; color: #666666;">
            Generated on: ${currentDate} | This is a computer-generated document.
          </p>
        </div>
      </div>
    `
    
    document.body.appendChild(tempDiv)
    
    // Generate PDF using html2canvas and jsPDF
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    })
    
    document.body.removeChild(tempDiv)
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 210
    const pageHeight = 295
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    
    let position = 0
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }
    
    pdf.save(`Loan_Card_${loanData.id || loanData.loanId || 'loan'}.pdf`)
  } catch (error) {
    console.error('Error generating loan card:', error)
    throw error
  }
}

