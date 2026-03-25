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
            font-family: 'Courier New', Courier, monospace; 
            padding: 15px; 
            max-width: 300px; 
            margin: 0 auto; 
            color: #000; 
            font-size: 13px;
            line-height: 1.2;
          }
          .center { text-align: center; }
          .right { text-align: right; }
          .bold { font-weight: bold; }
          .uppercase { text-transform: uppercase; }
          
          .header-main { font-size: 18px; font-weight: 900; margin-bottom: 4px; }
          .header-sub { font-size: 10px; font-weight: bold; letter-spacing: 2px; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 8px; }
          
          .info-grid { margin-bottom: 15px; font-size: 11px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
          
          .divider-solid { border-bottom: 2px solid #000; margin: 10px 0; }
          .divider-dashed { border-bottom: 1px dashed #000; margin: 10px 0; }
          .divider-double { border-bottom: 4px double #000; margin: 10px 0; }
          
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th { border-bottom: 1px solid #000; border-top: 1px solid #000; padding: 8px 0; font-size: 10px; text-transform: uppercase; }
          td { padding: 10px 0; font-size: 11px; vertical-align: top; border-bottom: 1px dashed #eee; }
          
          .total-section { margin-top: 10px; }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 11px; }
          .total-final { font-size: 18px; font-weight: 900; margin-top: 12px; padding-top: 12px; border-top: 2px solid #000; }
          
          .footer { margin-top: 40px; font-size: 10px; letter-spacing: 0.5px; }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="header-main uppercase">${bill.vendor?.businessName || bill.items?.[0]?.product?.vendor?.businessName || 'STONE RETAIL'}</div>
          <div class="header-sub uppercase">Audit Sync Dossier</div>
          
          <div class="info-grid">
            <div class="info-row">
              <span>REF ID:</span>
              <span class="bold">${isOffline ? 'OFF-' : 'ORD-'}${refString}</span>
            </div>
            <div class="info-row">
              <span>DATE:</span>
              <span>${dateString}</span>
            </div>
            <div class="info-row">
              <span>TYPE:</span>
              <span class="uppercase">${isOffline ? 'Offline' : 'Online'}</span>
            </div>
          </div>

          <div class="divider-dashed"></div>

          ${custName ? `
            <div class="info-grid" style="margin-top: 10px;">
              <div class="info-row">
                <span>CUSTOMER:</span>
                <span class="bold">${custName}</span>
              </div>
              ${custMobile ? `
                <div class="info-row">
                  <span>MOBILE:</span>
                  <span>${custMobile}</span>
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th align="left">ITEM DESCRIPTION</th>
              <th align="right" style="width: 40px; padding-right: 15px;">QTY</th>
              <th align="right" style="width: 70px;">VALUE</th>
            </tr>
          </thead>
          <tbody>
            ${(bill.items || []).map(item => `
              <tr>
                <td>${(item.name || item.product?.name || 'Product').toUpperCase()}</td>
                <td align="right" style="padding-right: 15px;">${item.quantity}</td>
                <td align="right">${Number(item.unitPrice || item.price || item.lineTotal/item.quantity || 0).toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total-section">
          <div class="total-row">
            <span>GROSS ARCHIVE VALUE:</span>
            <span>${Number(bill.subtotal || bill.amount || bill.totalAmount || 0).toLocaleString('en-IN')}</span>
          </div>
          
          ${Number(bill.discountAmount) > 0 ? `
            <div class="total-row">
              <span>SYSTEM DISCOUNT:</span>
              <span>- ${Number(bill.discountAmount).toLocaleString('en-IN')}</span>
            </div>
          ` : ''}

          ${Number(bill.rewardPointsUsed) > 0 ? `
            <div class="total-row">
              <span>LOYALTY CREDITS:</span>
              <span>- ${Number(bill.rewardPointsUsed).toLocaleString('en-IN')}</span>
            </div>
          ` : ''}

          <div class="total-final">
            <div class="total-row">
              <span class="bold">TOTAL SETTLEMENT:</span>
              <span class="bold">Rs. ${Number(bill.amount || bill.totalAmount || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div class="center footer">
          <div class="divider-dashed"></div>
          <div class="bold italic">* ORIGINAL ITEMISED COPY *</div>
          <div style="margin-top: 5px;">AUTH SYNC VERIFICATION OK</div>
          <div style="margin-top: 15px; font-size: 11px;">THANK YOU FOR CHOOSING US!</div>
          <div class="divider-double"></div>
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
