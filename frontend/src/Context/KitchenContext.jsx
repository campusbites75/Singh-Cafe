import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const KitchenContext = createContext();

const KitchenProvider = ({ children }) => {
  const [kitchenOpen, setKitchenOpen] = useState(false);

  const baseURL = "https://singhcafe.onrender.com";

  // ✅ FETCH STATUS
  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${baseURL}/api/settings`);

      // 🔥 IMPORTANT FIX
      if (res.data?.kitchenOpen !== undefined) {
        setKitchenOpen(res.data.kitchenOpen);
      }

      console.log("Kitchen Status:", res.data); // debug
    } catch (err) {
      console.error("Kitchen fetch error:", err);
    }
  };

  // ✅ TOGGLE
  const toggleKitchen = async () => {
    try {
      const res = await axios.post(
        `${baseURL}/api/settings/toggle-kitchen`
      );

      if (res.data?.kitchenOpen !== undefined) {
        setKitchenOpen(res.data.kitchenOpen);
      }

      console.log("Kitchen toggled:", res.data); // debug
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  // ✅ INITIAL LOAD
  useEffect(() => {
    fetchStatus();
  }, []);

  // 🔥 AUTO SYNC (VERY IMPORTANT)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStatus();
    }, 5000); // every 5 sec

    return () => clearInterval(interval);
  }, []);

  return (
    <KitchenContext.Provider
      value={{ kitchenOpen, toggleKitchen, fetchStatus }}
    >
      {children}
    </KitchenContext.Provider>
  );
};

export default KitchenProvider;
