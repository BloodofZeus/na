import React, { useState } from 'react';
import { useCart } from '../services/CartContext';

const MenuGrid = ({ menu }) => {
  const { addToCart } = useCart();
  const [quantities, setQuantities] = useState({});

  // Filter out unavailable items
  const availableMenu = menu.filter(item => item.is_available !== false);

  const handleQuantityChange = (itemId, quantity) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(1, parseInt(quantity) || 1)
    }));
  };

  const handleAddToCart = (item) => {
    const quantity = quantities[item.id] || 1;
    if (item.stock < quantity) {
      alert(`Not enough stock! Only ${item.stock} available.`);
      return;
    }
    addToCart(item, quantity);
    // Reset quantity to 1 after adding
    setQuantities(prev => ({
      ...prev,
      [item.id]: 1
    }));
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', class: 'stock-out text-danger' };
    if (stock <= 5) return { text: `Low Stock (${stock})`, class: 'stock-low text-warning' };
    return { text: `In Stock (${stock})`, class: 'stock-good text-success' };
  };

  return (
    <div className="pos-menu-grid">
      {availableMenu.map((item, index) => {
        const stockStatus = getStockStatus(item.stock);
        const quantity = quantities[item.id] || 1;
        
        return (
          <div key={item.id} className="menu-item-card stagger-item hover-lift transition-all">
            <div className="menu-item-header">
              <h5 className="menu-item-name">{item.name}</h5>
              <span className="menu-item-price">
                GHS {parseFloat(item.price || 0).toFixed(2)}
              </span>
            </div>
            
            <div className={`menu-item-stock ${stockStatus.class}`}>
              <i className={`fas ${
                item.stock === 0 ? 'fa-times-circle' : 
                item.stock <= 5 ? 'fa-exclamation-triangle' : 
                'fa-check-circle'
              } me-1`}></i>
              {stockStatus.text}
            </div>
            
            <div className="menu-item-actions">
              <div className="quantity-selector">
                <button 
                  className="btn btn-outline-secondary btn-sm qty-btn"
                  onClick={() => handleQuantityChange(item.id, Math.max(1, quantity - 1))}
                  disabled={item.stock === 0 || quantity <= 1}
                >
                  <i className="fas fa-minus"></i>
                </button>
                <input
                  type="number"
                  min="1"
                  max={item.stock}
                  value={quantity}
                  onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                  className="form-control form-control-sm qty-input"
                  disabled={item.stock === 0}
                />
                <button 
                  className="btn btn-outline-secondary btn-sm qty-btn"
                  onClick={() => handleQuantityChange(item.id, Math.min(item.stock, quantity + 1))}
                  disabled={item.stock === 0 || quantity >= item.stock}
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              <button
                onClick={() => handleAddToCart(item)}
                disabled={item.stock === 0}
                className={`btn add-to-cart-btn transition-all ${
                  item.stock === 0 ? 'btn-secondary' : 'btn-danger'
                }`}
              >
                <i className={`fas ${
                  item.stock === 0 ? 'fa-ban' : 'fa-cart-plus'
                } me-1`}></i>
                {item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        );
      })}
      
      {availableMenu.length === 0 && (
        <div className="no-menu-items">
          <i className="fas fa-utensils fa-3x text-muted mb-3"></i>
          <p className="text-muted mb-0">No menu items available</p>
        </div>
      )}
    </div>
  );
};

export default MenuGrid;