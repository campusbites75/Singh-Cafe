import React, { useContext } from 'react';
import './FoodItem.css';
import { StoreContext } from '../../Context/StoreContext';

const FoodItem = ({ name, price, desc, id }) => {
    const { cartItems, addToCart, removeFromCart, currency } = useContext(StoreContext);

    return (
        <div className='food-item'>
            {/* Top Section */}
            <div className="food-item-header">
                <h3>{name}</h3>
                <p className="food-item-price">
                    {currency}{price}
                </p>
            </div>

            {/* Description */}
            <p className="food-item-desc">{desc}</p>

            {/* Cart Controls */}
            <div className="food-item-actions">
                {!cartItems?.[id] ? (
                    <button className="add-btn" onClick={() => addToCart(id)}>
                        + Add
                    </button>
                ) : (
                    <div className="counter">
                        <button onClick={() => removeFromCart(id)}>-</button>
                        <span>{cartItems?.[id]}</span>
                        <button onClick={() => addToCart(id)}>+</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FoodItem;
