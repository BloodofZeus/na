import React from 'react';

const OrderModal = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // This would integrate with jsPDF or similar library
    alert('PDF download feature would be implemented here');
  };

  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-danger">Order Receipt</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="p-4">
          {/* Receipt Content */}
          <div id="receipt-content" className="space-y-4">
            <div className="text-center">
              <h4 className="font-bold text-lg">Shawarma Boss</h4>
              <p className="text-sm text-muted">Order Receipt</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span className="font-mono">#{order.id.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span>Staff:</span>
                <span>{order.staff}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date(order.timestamp).toLocaleString()}</span>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h5 className="font-bold mb-2">Items:</h5>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>GHS {(parseFloat(item.price || 0) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>GHS {parseFloat(order.total || 0).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="text-center text-sm text-muted mt-4">
              Thank you for your business!
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 p-4 border-t">
          <button
            onClick={handlePrint}
            className="btn btn-danger flex-1"
          >
            Print Receipt
          </button>
          <button
            onClick={handleDownloadPDF}
            className="btn btn-outline-danger flex-1"
          >
            Download PDF
          </button>
          <button
            onClick={onClose}
            className="btn btn-outline-danger"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;