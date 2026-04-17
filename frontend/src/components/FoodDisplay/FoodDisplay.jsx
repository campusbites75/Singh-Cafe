import React, { useContext, useMemo } from "react";
import "./FoodDisplay.css";
import FoodItem from "../FoodItem/FoodItem";
import { StoreContext } from "../../Context/StoreContext";

const FoodDisplay = ({ category }) => {
  const { food_list, searchQuery, url } = useContext(StoreContext);

  const filteredFoods = useMemo(() => {
    return food_list.filter((item) => {
      const itemCategory =
        typeof item.category === "object" && item.category !== null
          ? item.category.name
          : item.category;

      const matchesCategory =
        category === "All" ||
        itemCategory?.toLowerCase() === category.toLowerCase();

      const matchesSearch =
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [food_list, category, searchQuery]);

  return (
    <div className="food-display" id="food-display">
      <h2>Top dishes near you</h2>

      <div className="food-display-list">
        {filteredFoods.length > 0 ? (
          filteredFoods.map((item) => {
            // ✅ FIX: safe image URL
            const imageUrl =
              item.image && url
                ? `${url}/images/${item.image}`
                : "https://dummyimage.com/300x200/cccccc/000000&text=No+Image";

            return (
              <FoodItem
                key={item._id}
                image={imageUrl}
                name={item.name}
                desc={item.description}
                price={item.price}
                id={item._id}
              />
            );
          })
        ) : (
          <p style={{ marginTop: "20px" }}>
            No items match your search.
          </p>
        )}
      </div>
    </div>
  );
};

export default FoodDisplay;