import React, { useContext, useState } from 'react';
import './FoodItem.css';
import { StoreContext } from '../../Context/StoreContext';
import { motion } from 'framer-motion';

const FoodItem = ({ name, price, desc, id, image, isPremium = false }) => {
    const { cartItems, addToCart, removeFromCart, currency, url } = useContext(StoreContext);
    const [isHovered, setIsHovered] = useState(false);
    const quantity = cartItems?.[id] || 0;

    return (
        <motion.div 
            className={`food-item ${isPremium ? 'premium' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.4 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            {/* Premium Badge */}
            {isPremium && (
                <div className="premium-badge">⭐ Premium</div>
            )}

            {/* Image */}
            <div className="food-image">
                <img src={`${url}${image}`} alt={name} className="food-img" />
                <div className={`image-overlay ${isHovered ? 'hovered' : ''}`} />
            </div>

            {/* Content */}
            <div className="food-content">
                <h3 className="food-name">{name}</h3>
                <p className="food-desc">{desc}</p>

                <div className="price-section">
                    <span className="current-price">
                        {currency}{price}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="food-actions">
                {quantity === 0 ? (
                    <motion.button
                        className="add-btn"
                        onClick={() => addToCart(id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        + Add
                    </motion.button>
                ) : (
                    <div className="quantity-counter">
                        <button onClick={() => removeFromCart(id)}>−</button>
                        <span>{quantity}</span>
                        <button onClick={() => addToCart(id)}>+</button>
                    </div>
                )}
            </div>

            {/* Glow */}
            <div className={`hover-glow ${isHovered ? 'active' : ''}`} />
        </motion.div>
    );
};

export default FoodItem;
