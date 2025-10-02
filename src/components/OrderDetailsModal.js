import React from 'react';

const OrderDetailsModal = ({ order, onClose }) => {
  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Details - ${order.id}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .receipt-header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            .receipt-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .receipt-subtitle {
              font-size: 12px;
              color: #666;
            }
            .receipt-info {
              margin-bottom: 15px;
            }
            .receipt-info div {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
            }
            .receipt-items {
              margin-bottom: 15px;
            }
            .receipt-items h5 {
              margin-bottom: 10px;
              font-size: 14px;
            }
            .item-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            .receipt-total {
              border-top: 2px solid #000;
              padding-top: 10px;
              margin-top: 15px;
            }
            .receipt-total div {
              display: flex;
              justify-content: space-between;
              font-weight: bold;
              font-size: 14px;
            }
            .receipt-footer {
              text-align: center;
              margin-top: 20px;
              font-size: 11px;
              color: #666;
            }
            @media print {
              body { margin: 0; padding: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-header">
            <div class="receipt-title">Shawarma Boss</div>
            <div class="receipt-subtitle">Order Details</div>
          </div>
          
          <div class="receipt-info">
            <div><span>Order ID:</span><span>#${order.id.slice(-8)}</span></div>
            <div><span>Staff:</span><span>${order.staff}</span></div>
            <div><span>Date:</span><span>${new Date(order.timestamp).toLocaleString()}</span></div>
            <div><span>Status:</span><span>${order.status || 'Completed'}</span></div>
          </div>
          
          <div class="receipt-items">
            <h5>Items:</h5>
            ${order.items.map(item => `
              <div class="item-row">
                <span>${item.name} × ${item.quantity}</span>
                <span>GHS ${(parseFloat(item.price || 0) * item.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="receipt-total">
            <div>
              <span>Total:</span>
              <span>GHS ${parseFloat(order.total || 0).toFixed(2)}</span>
            </div>
          </div>
          
          <div class="receipt-footer">
            Thank you for your business!
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleDownloadPDF = () => {
    // This would integrate with jsPDF or similar library
    alert('PDF download feature would be implemented here');
  };

  if (!order) {
    console.log('OrderDetailsModal: No order provided');
    return null;
  }

  console.log('OrderDetailsModal: Rendering modal with order:', order);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        style={{
          position: 'relative',
          zIndex: 10000,
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '42rem',
          width: '100%',
          margin: '0 1rem',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
          <h3 className="text-xl font-bold text-danger">Order Details</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          {/* Order Header */}
          <div className="text-center mb-6">
            <h4 className="font-bold text-2xl text-danger">Shawarma Boss</h4>
            <p className="text-sm text-muted">Order Details</p>
          </div>
          
          {/* Order Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h6 className="font-semibold text-gray-700 mb-2">Order Information</h6>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-mono font-semibold">#{order.id.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Staff:</span>
                  <span className="font-semibold">{order.staff}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-semibold">{new Date(order.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="badge bg-success text-white px-2 py-1 rounded text-xs">
                    {order.status || 'Completed'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h6 className="font-semibold text-gray-700 mb-2">Order Summary</h6>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-semibold">{order.items?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Quantity:</span>
                  <span className="font-semibold">
                    {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Total:</span>
                  <span className="font-bold text-lg text-success">
                    GHS {parseFloat(order.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Items List */}
          <div className="mb-6">
            <h5 className="font-bold text-lg mb-4 flex items-center">
              <i className="fas fa-utensils me-2 text-warning"></i>
              Order Items
            </h5>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h6 className="font-semibold text-gray-800 mb-1">{item.name}</h6>
                      <p className="text-sm text-gray-600">
                        Price: GHS {parseFloat(item.price || 0).toFixed(2)} each
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 mb-1">
                        Quantity: <span className="font-semibold">{item.quantity}</span>
                      </div>
                      <div className="font-bold text-lg text-success">
                        GHS {(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Total Section */}
          <div className="border-t pt-4">
            <div className="bg-success bg-opacity-10 border border-success border-opacity-20 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">Order Total:</span>
                <span className="text-2xl font-bold text-success">
                  GHS {parseFloat(order.total || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="text-center text-sm text-muted mt-6">
            <i className="fas fa-check-circle text-success me-1"></i>
            Order completed successfully
          </div>
        </div>
        
        <div className="flex gap-2 p-4 border-t sticky bottom-0 bg-white">
          <button
            onClick={handlePrint}
            className="btn btn-danger flex-1"
          >
            <i className="fas fa-print me-2"></i>
            Print Details
          </button>
          <button
            onClick={handleDownloadPDF}
            className="btn btn-outline-danger flex-1"
          >
            <i className="fas fa-download me-2"></i>
            Download PDF
          </button>
          <button
            onClick={onClose}
            className="btn btn-outline-secondary"
          >
            <i className="fas fa-times me-2"></i>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
