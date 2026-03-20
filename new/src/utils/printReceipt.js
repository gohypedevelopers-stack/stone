export const printThermalReceipt = (bill) => {
  const isOffline = window.location.pathname.includes('billing') || String(bill.id).startsWith('OFF-') || !bill.orderStatus;
  const refString = (bill.id || 'N/A').slice(0, 8).toUpperCase();
  const dateString = new Date(bill.createdAt || Date.now()).toLocaleString();
  const custName = bill.name || bill.customerName || bill.customer?.name;
  const custMobile = bill.mobile || bill.customerMobile || bill.customer?.mobile;
  
  const printContent = `
    <html>
      <head>
        <title>Receipt ${isOffline ? 'OFF-' : 'ORD-'}${refString}</title>
        <style>
          @page { margin: 0; }
          body { 
            font-family: 'Courier New', monospace; 
            padding: 20px; 
            max-width: 320px; 
            margin: 0 auto; 
            color: #000; 
            font-size: 13px;
          }
          .center { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th, td { border-bottom: 1px dashed #000; padding: 8px 0; text-align: left; }
          th { border-top: 1px dashed #000; border-bottom: 1px dashed #000; font-weight: bold; }
          .right { text-align: right; }
          .total-row { 
            font-weight: bold; 
            font-size: 16px; 
            margin-top: 20px; 
            border-top: 1px dashed #000; 
            padding-top: 15px; 
            text-align: right;
          }
          .divider { border-bottom: 1px dashed #000; margin: 15px 0; border-top: 0; }
          .merchant-name { font-size: 18px; font-weight: bold; margin-bottom: 8px; }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="merchant-name">${bill.vendor?.businessName || bill.items?.[0]?.product?.vendor?.businessName || 'STONE RETAIL'}</div>
          <div>${isOffline ? 'Terminal Offline Transaction' : 'Online E-Commerce Order'}</div>
          <div style="font-size: 11px; margin-top: 15px;">Ref: ${isOffline ? 'OFF-' : 'ORD-'}${refString}</div>
          <div style="font-size: 11px;">Date: ${dateString}</div>
          <div class="divider"></div>
          ${custName ? `<div style="font-size: 12px; font-weight: bold;">Customer: ${custName}</div>` : ''}
          ${custMobile ? `<div style="font-size: 12px;">Mobile: ${custMobile}</div>` : ''}
          <div class="divider"></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th class="right">Qty</th>
              <th class="right">Amt</th>
            </tr>
          </thead>
          <tbody>
            ${(bill.items || []).map(item => `
              <tr>
                <td>${item.name || item.product?.name || 'Product'}</td>
                <td class="right">${item.quantity}</td>
                <td class="right">${Number(item.unitPrice || item.price || item.lineTotal/item.quantity || 0).toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        ${Number(bill.discountAmount) > 0 ? `
           <div style="text-align: right; font-size: 11px; margin-top: 10px;">
             Discount: - Rs. ${Number(bill.discountAmount).toLocaleString('en-IN')}
           </div>
        ` : ''}

        ${Number(bill.rewardPointsUsed) > 0 ? `
           <div style="text-align: right; font-size: 11px; margin-top: 5px;">
             Credits Applied: - Rs. ${Number(bill.rewardPointsUsed).toLocaleString('en-IN')}
           </div>
        ` : ''}

        <div class="total-row">
          TOTAL: Rs. ${Number(bill.amount || bill.totalAmount || 0).toLocaleString('en-IN')}
        </div>

        <div class="center" style="margin-top: 40px; font-size: 11px; font-style: italic;">
          * Original Itemized Copy *<br/>
          Thank you for choosing us!
        </div>
      </body>
    </html>
  `;
  
  const printWindow = window.open('', '', 'width=400,height=700');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400); // Allow DOM to parse properly before print blocking happens
  }
};
