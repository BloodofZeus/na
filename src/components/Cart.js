import React from 'react';
import { useCart } from '../services/CartContext';

const Cart = ({ onConfirmOrder }) => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal, 
    getCartCount 
  } = useCart();

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  return (
    <div className="pwa-cart-wrapper">
      <div className="pwa-cart-header">
        <h4 className="pwa-cart-title">Cart ({getCartCount()})</h4>
        <div className="pwa-cart-actions">
          <button
            onClick={clearCart}
            disabled={cartItems.length === 0}
            className="pwa-cart-btn clear"
          >
            <i className="fas fa-trash me-1"></i>
            Clear
          </button>
          <button
            onClick={onConfirmOrder}
            disabled={cartItems.length === 0}
            className="pwa-cart-btn confirm"
          >
            <i className="fas fa-check me-1"></i>
            Confirm
          </button>
        </div>
      </div>

        <div className="pwa-cart-items">
          {cartItems.length === 0 ? (
            <div className="pwa-cart-empty">
              <i className="fas fa-shopping-cart fa-2x mb-2"></i>
              <p>Your cart is empty</p>
              <span className="text-muted">Add items from the menu to get started</span>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="pwa-cart-item">
                <div className="pwa-item-info">
                  <h6 className="pwa-item-name">{item.name}</h6>
                  <span className="pwa-item-price">
                    GHS {parseFloat(item.price || 0).toFixed(2)} each
                  </span>
                </div>
                
                <div className="pwa-item-controls">
                  <div className="pwa-quantity-controls">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="pwa-qty-btn"
                    >
                      <i className="fas fa-minus"></i>
                    </button>
                    
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                      className="pwa-qty-input"
                    />
                    
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="pwa-qty-btn"
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                  
                  <div className="pwa-item-total">
                    GHS {(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                  </div>
                  
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="pwa-remove-btn"
                    title="Remove item"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="pwa-cart-summary">
            <div className="pwa-cart-total">
              <span className="pwa-total-label">Order Total:</span>
              <span className="pwa-total-value">
                GHS {getCartTotal().toFixed(2)}
              </span>
            </div>
          </div>
        )}
    </div>
  );
};

export default Cart;