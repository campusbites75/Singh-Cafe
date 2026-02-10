import React, { useContext, useState } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");

  const {
    getTotalCartAmount,
    token,
    setToken
  } = useContext(StoreContext);

  const navigate = useNavigate();
  const location = useLocation();

  // Hide menu & admin button on /select
  const hideGreenBox = location.pathname === "/select";

  // Admin access
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminKey, setAdminKey] = useState("");

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate('/');
  };

  return (
    <>
      <div className="navbar">

        {/* Logo */}
        <Link to="/">
          <img className="logo" src={assets.logo} alt="logo" />
        </Link>

        {/* Menu items */}
        {!hideGreenBox && (
          <ul className="navbar-menu">
            <Link to="/" onClick={() => setMenu("home")} className={menu === "home" ? "active" : ""}>
              HOME
            </Link>

            <a href="#explore-menu" onClick={() => setMenu("menu")} className={menu === "menu" ? "active" : ""}>
              MENU
            </a>

            <a href="#footer" onClick={() => setMenu("contact")} className={menu === "contact" ? "active" : ""}>
              CONTACT US
            </a>

            <Link to="/myorders" onClick={() => setMenu("previous")} className={menu === "previous" ? "active" : ""}>
              PREVIOUS ORSERS
            </Link>
          </ul>
        )}

        {/* Right side */}
        <div className="navbar-right">

          {/* Cart icon */}
          {!hideGreenBox && (
            <Link to="/cart" className="navbar-search-icon">
              <img src={assets.basket_icon} alt="cart" />
              <div className={getTotalCartAmount() > 0 ? "dot" : ""}></div>
            </Link>
          )}

          {/* Admin Panel */}
          {!hideGreenBox && (
            <button
              onClick={() => setShowAdminAuth(true)}
              style={{
                padding: "8px 14px",
                background: "black",
                color: "white",
                borderRadius: "6px",
                marginRight: "10px",
                cursor: "pointer",
                border: "none",
                fontSize: "14px"
              }}
            >
              Admin Panel
            </button>
          )}

          {/* Login / Profile */}
          {!token ? (
            <button onClick={() => setShowLogin(true)}>sign in</button>
          ) : (
            <div className="navbar-profile">
              <img src={assets.profile_icon} alt="profile" />
              <ul className="navbar-profile-dropdown">
                <li onClick={() => navigate('/myorders')}>
                  <img src={assets.bag_icon} alt="" />
                  <p>Orders</p>
                </li>
                <hr />
                <li onClick={logout}>
                  <img src={assets.logout_icon} alt="" />
                  <p>Logout</p>
                </li>
              </ul>
            </div>
          )}

        </div>
      </div>

      {/* Admin Auth Popup */}
      {showAdminAuth && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999
        }}>
          <div style={{
            background: "white",
            padding: "25px",
            borderRadius: "10px",
            textAlign: "center",
            width: "300px"
          }}>
            <h3>Enter Admin Access Code</h3>

            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Enter code"
              style={{
                padding: "10px",
                width: "100%",
                marginTop: "10px",
                borderRadius: "6px",
                border: "1px solid #ccc"
              }}
            />

            <br /><br />

            <button
              onClick={() => {
                if (adminKey === "12345") {
                  window.location.href = "http://localhost:5174/";
                } else {
                  alert("❌ Invalid Admin Code!");
                }
              }}
              style={{
                padding: "10px 14px",
                background: "black",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                width: "100%"
              }}
            >
              Enter
            </button>

            <br /><br />

            <button
              onClick={() => setShowAdminAuth(false)}
              style={{
                background: "grey",
                color: "white",
                padding: "10px 14px",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                width: "100%"
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
