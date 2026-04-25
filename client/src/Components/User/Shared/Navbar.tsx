import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { NAV_LINKS } from "./dummyData";

export default function Navbar() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  
  const getIsActive = (link: string) => {
    if (link === "Home" && location.pathname === "/home") return true;
    if (link === "All Products" && location.pathname === "/products") return true;
    if (link === "My Orders" && location.pathname.includes("/account/orders")) return true;
    return false;
  };

  const handleLogout = () => {
    logout();
    navigate("/home");
  };

  return (
    <nav style={{ background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", position: "sticky", top: 0, zIndex: 200, width: "100%" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/home")}>
          <div style={{ width: 40, height: 40, background: "#1a1a2e", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #4361ee" }}>
            <span style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>QC</span>
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#1a1a2e", letterSpacing: -0.5 }}>QualityCricket</span>
        </div>

        {/* Desktop nav links */}
        {!isMobile && (
          <ul style={{ display: "flex", gap: isTablet ? 20 : 32, listStyle: "none", margin: 0, padding: 0 }}>
            {NAV_LINKS.map((link) => {
              const isActive = getIsActive(link);
              return (
                <li key={link}>
                  <div
                    onMouseEnter={() => setHoveredNav(link)}
                    onMouseLeave={() => setHoveredNav(null)}
                    onClick={() => {
                        if(link === "All Products" || link === "Sale" || link === "Accessories") navigate("/products");
                        else if(link === "Home") navigate("/home");
                        else if(link === "Contact Us") navigate("/contact");
                        else if(link === "My Orders") navigate("/account/orders");
                    }}
                    style={{ 
                        textDecoration: "none", fontSize: 14, fontWeight: isActive ? 600 : 500, cursor: "pointer", 
                        color: isActive || hoveredNav === link ? "#4361ee" : "#64748b", 
                        transition: "all 0.2s ease",
                        position: "relative",
                        padding: "8px 0"
                    }}
                  >
                    {link}
                    {(isActive || hoveredNav === link) && (
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "#4361ee", borderRadius: 2 }} />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Desktop icons */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div onClick={() => navigate("/cart")} style={{ position: "relative", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: 22 }}>🛒</span>
            </div>

            {isAuthenticated ? (
              <div 
                style={{ position: "relative" }}
                onMouseEnter={() => {
                  setShowProfileMenu(true);
                }}
                onMouseLeave={() => {
                  // Add a small delay so user can move mouse to the menu
                  setTimeout(() => {
                    setShowProfileMenu(false);
                  }, 300);
                }}
              >
                <div 
                  style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "4px 12px", background: "#f8faff", borderRadius: 20, border: "1px solid #eef2ff" }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#4361ee", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 700 }}>
                    {user?.firstName?.charAt(0)}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{user?.firstName}</span>
                  <span style={{ fontSize: 10 }}>▼</span>
                </div>

                {showProfileMenu && (
                  <div 
                    style={{ 
                      position: "absolute", 
                      top: "100%", 
                      right: 0, 
                      width: 180, 
                      background: "white", 
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)", 
                      borderRadius: 12, 
                      padding: "8px", 
                      marginTop: 0, // Removed gap to maintain hover
                      paddingTop: "12px", // Added internal space instead
                      border: "1px solid #f1f5f9",
                      zIndex: 300,
                      animation: "fadeIn 0.2s ease"
                    }}
                  >
                    <div onClick={() => { navigate("/account"); setShowProfileMenu(false); }} style={{ padding: "10px 12px", fontSize: 13, color: "#475569", fontWeight: 500, borderRadius: 8, cursor: "pointer" }} onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>My Account</div>
                    <div onClick={() => { navigate("/account/orders"); setShowProfileMenu(false); }} style={{ padding: "10px 12px", fontSize: 13, color: "#475569", fontWeight: 500, borderRadius: 8, cursor: "pointer" }} onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>My Orders</div>
                    {user?.role === 'Admin' && <div onClick={() => { navigate("/admin"); setShowProfileMenu(false); }} style={{ padding: "10px 12px", fontSize: 13, color: "#4361ee", fontWeight: 600, borderRadius: 8, cursor: "pointer" }} onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>Admin Panel</div>}
                    <hr style={{ border: 0, borderTop: "1px solid #f1f5f9", margin: "4px 0" }} />
                    <div onClick={handleLogout} style={{ padding: "10px 12px", fontSize: 13, color: "#ef4444", fontWeight: 600, borderRadius: 8, cursor: "pointer" }} onMouseEnter={(e) => e.currentTarget.style.background = "#fff1f1"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>Logout</div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => navigate("/login")} style={{ padding: "8px 20px", borderRadius: 20, border: "none", background: "transparent", color: "#4361ee", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Login</button>
                <button onClick={() => navigate("/signup")} style={{ padding: "8px 20px", borderRadius: 20, border: "none", background: "#4361ee", color: "white", fontWeight: 600, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 10px rgba(67,97,238,0.2)" }}>Sign Up</button>
              </div>
            )}
          </div>
        )}

        {/* Mobile menu button */}
        {isMobile && (
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ padding: 8, border: "none", background: "#f8faff", borderRadius: 8, cursor: "pointer" }}>
            <span style={{ fontSize: 20 }}>{mobileMenuOpen ? "✕" : "☰"}</span>
          </button>
        )}
      </div>

      {/* Mobile menu dropdown */}
      {isMobile && mobileMenuOpen && (
        <div style={{ background: "white", borderTop: "1px solid #f1f5f9", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          {NAV_LINKS.map(link => (
            <div key={link} onClick={() => {
              if(link === "All Products" || link === "Sale" || link === "Accessories") navigate("/products");
              else if(link === "Home") navigate("/home");
              else if(link === "Contact Us") navigate("/contact");
              else if(link === "My Orders") navigate("/account/orders");
              setMobileMenuOpen(false);
            }} style={{ fontSize: 15, fontWeight: 600, color: "#1e293b" }}>{link}</div>
          ))}
          <hr style={{ border: 0, borderTop: "1px solid #f1f5f9" }} />
          {isAuthenticated ? (
            <>
              <div onClick={() => navigate("/account")} style={{ fontSize: 15, fontWeight: 600, color: "#1e293b" }}>Account Settings</div>
              <div onClick={handleLogout} style={{ fontSize: 15, fontWeight: 600, color: "#ef4444" }}>Logout</div>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => navigate("/login")} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid #e2e8f0", background: "white", fontWeight: 600 }}>Login</button>
              <button onClick={() => navigate("/signup")} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: "#4361ee", color: "white", fontWeight: 600 }}>Sign Up</button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
