import React, { useContext, useEffect, useRef } from "react";
import "./LoginPopup.css";
import { StoreContext } from "../../Context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";

const LoginPopup = ({ showLogin, setShowLogin }) => {
  const { setToken, setUser, url } = useContext(StoreContext);
  const googleDivRef = useRef(null);

  // ================= GOOGLE RESPONSE =================
  const handleGoogleResponse = async (response) => {
    const googleToken = response.credential;

    try {
      const res = await axios.post(`${url}/api/user/google-login`, {
        token: googleToken,
      });

      if (res.data.success) {
        const newToken = res.data.token;
        const userData = res.data.user;

        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(userData));

        setToken(newToken);
        setUser(userData);

        const guestCart =
          JSON.parse(localStorage.getItem("guestCart")) || {};

        if (Object.keys(guestCart).length > 0) {
          await axios.post(
            `${url}/api/cart/merge`,
            { guestCart },
            {
              headers: {
                Authorization: `Bearer ${newToken}`,
              },
            }
          );

          localStorage.removeItem("guestCart");
        }

        toast.success("Login Successful 🎉");
        setShowLogin(false);

        const canteenLink = localStorage.getItem("canteenLink");

        if (canteenLink) {
          localStorage.removeItem("canteenLink");
          window.location.href = canteenLink;
        } else {
          window.location.reload();
        }
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error("Google login failed");
    }
  };

  // ================= GOOGLE INIT =================
  useEffect(() => {
    if (!showLogin) return; // ✅ SAFE CONDITION HERE

    if (!window.google || !googleDivRef.current) return;

    googleDivRef.current.innerHTML = "";

    window.google.accounts.id.initialize({
      client_id:
        "850316169928-5a6nn5cq63ikm5vrdr9q5gm9mqplhohg.apps.googleusercontent.com",
      callback: handleGoogleResponse,
    });

    window.google.accounts.id.renderButton(googleDivRef.current, {
      theme: "outline",
      size: "large",
      width: 300,
    });
  }, [showLogin]); // ✅ IMPORTANT DEPENDENCY

  // ✅ RETURN AFTER HOOKS
  if (!showLogin) return null;

  return (
    <div className="login-popup">
      <div className="login-popup-container">

        <div className="login-popup-title">
          <h2>Sign in</h2>
        </div>

        <div
          ref={googleDivRef}
          style={{
            marginTop: "15px",
            display: "flex",
            justifyContent: "center",
          }}
        ></div>

      </div>
    </div>
  );
};

export default LoginPopup;
