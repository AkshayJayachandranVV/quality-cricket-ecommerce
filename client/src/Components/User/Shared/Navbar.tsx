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

  // Enhanced responsive detection
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    // Initial check
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 992; // Slightly higher threshold for better UX on smaller tablets
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
    <nav style={{ 
      background: "white", 
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)", 
      position: "sticky", 
      top: 0, 
      zIndex: 1000, 
      width: "100%",
      height: isMobile ? 60 : 72,
      display: "flex",
      alignItems: "center"
    }}>
      <div style={{ 
        width: "100%",
        maxWidth: 1800, 
        margin: "0 auto", 
        padding: isMobile ? "0 16px" : "0 40px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between" 
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flexShrink: 0 }} onClick={() => navigate("/home")}>
          <div style={{ width: isMobile ? 32 : 40, height: isMobile ? 32 : 40, background: "#1a1a2e", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #4361ee" }}>
            <span style={{ color: "white", fontWeight: "bold", fontSize: isMobile ? 12 : 16 }}>QC</span>
          </div>
          <span style={{ fontSize: isMobile ? 14 : 18, fontWeight: 800, color: "#1a1a2e", letterSpacing: -0.5 }}>QualityCricket</span>
        </div>

        {/* Desktop nav links */}
        {!isMobile && (
          <ul style={{ display: "flex", gap: isTablet ? 16 : 28, listStyle: "none", margin: 0, padding: 0 }}>
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
                        else if(link === "FAQ's") navigate("/faq");
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

        {/* Action icons */}
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 12 : 24, flexShrink: 0 }}>
          {!isMobile && (
            <div onClick={() => navigate("/cart")} style={{ position: "relative", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: 22 }}>🛒</span>
            </div>
          )}

          {isAuthenticated ? (
            <div 
              style={{ position: "relative" }}
              onMouseEnter={() => !isMobile && setShowProfileMenu(true)}
              onMouseLeave={() => !isMobile && setShowProfileMenu(false)}
            >
              <div 
                onClick={() => isMobile && setMobileMenuOpen(!mobileMenuOpen)}
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 8, 
                  cursor: "pointer", 
                  padding: isMobile ? "4px" : "6px 14px", 
                  background: isMobile ? "transparent" : "#f8faff", 
                  borderRadius: 20, 
                  border: isMobile ? "none" : "1px solid #eef2ff" 
                }}
              >
                <div style={{ width: isMobile ? 32 : 30, height: isMobile ? 32 : 30, borderRadius: "50%", background: "#4361ee", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 700 }}>
                  {user?.firstName?.charAt(0)}
                </div>
                {!isMobile && (
                  <>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{user?.firstName}</span>
                    <span style={{ fontSize: 10 }}>▼</span>
                  </>
                )}
              </div>

              {showProfileMenu && !isMobile && (
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
                    marginTop: 4,
                    border: "1px solid #f1f5f9",
                    zIndex: 1100,
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
            <div style={{ display: "flex", gap: isMobile ? 8 : 12 }}>
              <button 
                onClick={() => navigate("/login")} 
                style={{ 
                  padding: isMobile ? "6px 12px" : "8px 20px", 
                  borderRadius: 20, 
                  border: "1px solid #4361ee", 
                  background: "transparent", 
                  color: "#4361ee", 
                  fontWeight: 600, 
                  fontSize: isMobile ? 12 : 13, 
                  cursor: "pointer" 
                }}
              >
                Login
              </button>
              {!isMobile && (
                <button 
                  onClick={() => navigate("/signup")} 
                  style={{ 
                    padding: "8px 20px", 
                    borderRadius: 20, 
                    border: "none", 
                    background: "#4361ee", 
                    color: "white", 
                    fontWeight: 600, 
                    fontSize: 13, 
                    cursor: "pointer", 
                    boxShadow: "0 4px 10px rgba(67,97,238,0.2)" 
                  }}
                >
                  Sign Up
                </button>
              )}
            </div>
          )}

          {isMobile && (
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              style={{ 
                width: 36, 
                height: 36, 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                border: "none", 
                background: "#f0f4ff", 
                color: "#4361ee",
                borderRadius: 8, 
                cursor: "pointer" 
              }}
            >
              <span style={{ fontSize: 20, fontWeight: "bold" }}>{mobileMenuOpen ? "✕" : "☰"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isMobile && mobileMenuOpen && (
        <div style={{ 
          position: "fixed",
          top: 60,
          left: 0,
          right: 0,
          bottom: 0,
          background: "white", 
          padding: "24px", 
          display: "flex", 
          flexDirection: "column", 
          gap: 20,
          zIndex: 999,
          overflowY: "auto",
          animation: "slideIn 0.3s ease-out"
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h3 style={{ fontSize: 12, textTransform: "uppercase", color: "#94a3b8", letterSpacing: 1, margin: "0 0 4px" }}>Menu</h3>
            {NAV_LINKS.map(link => (
              <div key={link} onClick={() => {
                if(link === "All Products" || link === "Sale" || link === "Accessories") navigate("/products");
                else if(link === "Home") navigate("/home");
                else if(link === "Contact Us") navigate("/contact");
                else if(link === "My Orders") navigate("/account/orders");
                else if(link === "FAQ's") navigate("/faq");
                setMobileMenuOpen(false);
              }} style={{ 
                fontSize: 16, 
                fontWeight: 600, 
                color: getIsActive(link) ? "#4361ee" : "#1e293b",
                padding: "12px 16px",
                background: getIsActive(link) ? "#f0f4ff" : "transparent",
                borderRadius: 12
              }}>{link}</div>
            ))}
          </div>

          <hr style={{ border: 0, borderTop: "1px solid #f1f5f9" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h3 style={{ fontSize: 12, textTransform: "uppercase", color: "#94a3b8", letterSpacing: 1, margin: "0 0 4px" }}>Account</h3>
            {isAuthenticated ? (
              <>
                <div onClick={() => { navigate("/account"); setMobileMenuOpen(false); }} style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", padding: "12px 16px" }}>My Profile</div>
                <div onClick={() => { navigate("/account/orders"); setMobileMenuOpen(false); }} style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", padding: "12px 16px" }}>Orders & Returns</div>
                <div onClick={() => { navigate("/cart"); setMobileMenuOpen(false); }} style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", padding: "12px 16px" }}>Shopping Cart 🛒</div>
                <div onClick={handleLogout} style={{ fontSize: 16, fontWeight: 600, color: "#ef4444", padding: "12px 16px" }}>Logout</div>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <button onClick={() => { navigate("/login"); setMobileMenuOpen(false); }} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "2px solid #4361ee", background: "white", color: "#4361ee", fontWeight: 700 }}>Login</button>
                <button onClick={() => { navigate("/signup"); setMobileMenuOpen(false); }} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "#4361ee", color: "white", fontWeight: 700 }}>Create Account</button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
