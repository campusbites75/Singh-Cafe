import { createContext, useEffect, useState } from "react";
import { menu_list } from "../assets/assets";
import axios from "axios";
import { io } from "socket.io-client"; // ✅ NEW

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const url = "https://singh-cafe-dql6.onrender.com";

  const [food_list, setFoodList] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const currency = "₹";
  const [searchQuery, setSearchQuery] = useState("");
  const [deliveryFee, setDeliveryFee] = useState(10);
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState("");

  const [kitchenOpen, setKitchenOpen] = useState(true); // ✅ NEW

  // ============================
  // AXIOS CONFIG
  // ============================
  useEffect(() => {
    axios.defaults.baseURL = url;

    const interceptor = axios.interceptors.request.use((config) => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        config.headers.Authorization = `Bearer ${storedToken}`;
      }
      return config;
    });

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  // ===============================
  // 🔥 FETCH SETTINGS (delivery + kitchen)
  // ===============================
  const fetchSettings = async () => {
    try {
      const res = await axios.get("/api/settings");
      if (res.data) {
        if (res.data.deliveryFee !== undefined) {
          setDeliveryFee(res.data.deliveryFee);
        }
        if (res.data.kitchenOpen !== undefined) {
          setKitchenOpen(res.data.kitchenOpen);
        }
      }
    } catch (err) {
      console.error("Settings fetch error:", err);
    }
  };

  // ===============================
  // 🔥 SOCKET LIVE SYNC
  // ===============================
  useEffect(() => {
    const socket = io("https://singh-cafe-dql6.onrender.com");

    socket.on("kitchenStatusUpdated", (status) => {
      console.log("⚡ Kitchen status updated:", status);
      setKitchenOpen(status);
    });

    return () => socket.disconnect();
  }, []);

  // ===============================
  // ADD TO CART
  // ===============================
  const addToCart = async (itemId) => {

    // 🔥 BLOCK WHEN CLOSED
    if (!kitchenOpen) {
      alert("Kitchen is closed 🚫");
      return;
    }

    setCartItems((prev) => {
      const updated = {
        ...prev,
        [itemId]: (prev[itemId] || 0) + 1,
      };

      if (!token) {
        localStorage.setItem("guestCart", JSON.stringify(updated));
      }

      return updated;
    });

    if (token) {
      try {
        await axios.post("/api/cart/add", { itemId });
      } catch (err) {
        console.error("Add to cart error:", err);
      }
    }
  };

  // ===============================
  // REMOVE FROM CART
  // ===============================
  const removeFromCart = async (itemId) => {
    setCartItems((prev) => {
      const updated = { ...prev };

      if (updated[itemId] > 1) {
        updated[itemId] -= 1;
      } else {
        delete updated[itemId];
      }

      if (!token) {
        localStorage.setItem("guestCart", JSON.stringify(updated));
      }

      return updated;
    });

    if (token) {
      try {
        await axios.post("/api/cart/remove", { itemId });
      } catch (err) {
        console.error("Remove from cart error:", err);
      }
    }
  };

  // ===============================
  // TOTAL CART
  // ===============================
  const getTotalCartAmount = () => {
    let totalAmount = 0;

    for (const item in cartItems) {
      const itemInfo = food_list.find((p) => p._id === item);
      if (itemInfo) {
        totalAmount += itemInfo.price * cartItems[item];
      }
    }

    return totalAmount;
  };

  // ===============================
  // FETCH FOOD
  // ===============================
  const fetchFoodList = async () => {
    const response = await axios.get("/api/food/list");
    setFoodList(response.data.data);
  };

  // ===============================
  // PLACE ORDER
  // ===============================
  const placeOrder = async ({
    address,
    paymentMethod,
    couponCode,
    items,
  }) => {
    try {
      if (!kitchenOpen) {
        return { success: false, message: "Kitchen is closed 🚫" };
      }

      if (!items || items.length === 0) {
        return { success: false, message: "Cart is empty" };
      }

      const subtotal = getTotalCartAmount();

      const endpoint =
        paymentMethod === "COD"
          ? "/api/order/placecod"
          : "/api/order/place";

      const response = await axios.post(endpoint, {
        items,
        amount: subtotal - discount,
        discount,
        couponCode,
        deliveryFee,
        totalAmount: subtotal + deliveryFee - discount,
        address,
        paymentMethod,
      });

      if (response.data.success && paymentMethod === "COD") {
        setCartItems({});
        localStorage.removeItem("guestCart");
      }

      return response.data;
    } catch (error) {
      console.error("Order error:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Order failed",
      };
    }
  };

  // ===============================
  // INITIAL LOAD
  // ===============================
  useEffect(() => {
    async function loadData() {
      await fetchFoodList();
      await fetchSettings(); // ✅ UPDATED

      const storedToken = localStorage.getItem("token");

      if (storedToken) {
        setToken(storedToken);
      } else {
        const guestCart =
          JSON.parse(localStorage.getItem("guestCart")) || {};
        setCartItems(guestCart);
      }
    }

    loadData();
  }, []);

  const contextValue = {
    url,
    food_list,
    menu_list,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    token,
    setToken,
    user,
    setUser,
    currency,
    deliveryFee,
    placeOrder,
    searchQuery,
    setSearchQuery,
    discount,
    setDiscount,
    couponCode,
    setCouponCode,
    kitchenOpen // ✅ NEW (important)
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
