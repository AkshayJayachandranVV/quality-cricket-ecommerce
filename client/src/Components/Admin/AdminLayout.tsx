import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 1024);
            if (window.innerWidth > 1024) setIsSidebarOpen(true);
            else setIsSidebarOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const SIDEBAR_LINKS = [
        { id: "dashboard", label: "Dashboard", path: "/admin", icon: "⊞" },
        { id: "add-product", label: "Add Product", path: "/admin/add-product", icon: "➕" },
        { id: "products", label: "All Products", path: "/admin/products", icon: "📄" },
        { id: "users", label: "Users List", path: "/admin/users", icon: "👤" },
        { id: "order", label: "Orders", path: "/admin/orders", icon: "📦" },
        { id: "faqs", label: "FAQs", path: "/admin/faqs", icon: "❓" },
    ];

    const activeLabel = SIDEBAR_LINKS.find(l => 
        location.pathname === l.path || (l.path !== "/admin" && location.pathname.startsWith(l.path))
    )?.label || "Dashboard";

    const sidebarStyle: React.CSSProperties = {
        width: 260,
        background: "white",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        boxShadow: "2px 0 10px rgba(0,0,0,0.03)",
        zIndex: 1000,
        position: isMobile ? "fixed" : "relative",
        height: "100vh",
        left: isSidebarOpen ? 0 : -260,
        transition: "left 0.3s ease"
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f8f9fa", fontFamily: "Inter, sans-serif" }}>
            
            {/* Sidebar Overlay for Mobile */}
            {isMobile && isSidebarOpen && (
                <div 
                    onClick={() => setIsSidebarOpen(false)}
                    style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 999 }}
                />
            )}

            {/* Sidebar */}
            <aside style={sidebarStyle}>
                <div style={{ height: 80, display: "flex", alignItems: "center", padding: "0 24px", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/home")}>
                        <div style={{ width: 32, height: 32, background: "#3F51B5", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold" }}>QC</div>
                        <span style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e" }}>QualityCricket</span>
                    </div>
                    {isMobile && <button onClick={() => setIsSidebarOpen(false)} style={{ border: "none", background: "none", fontSize: 20, cursor: "pointer" }}>✕</button>}
                </div>

                <nav style={{ flex: 1, padding: "20px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                    {SIDEBAR_LINKS.map(link => {
                        const isActive = location.pathname === link.path || (link.path !== "/admin" && location.pathname.startsWith(link.path));
                        return (
                            <div 
                                key={link.id}
                                onClick={() => {
                                    navigate(link.path);
                                    if (isMobile) setIsSidebarOpen(false);
                                }}
                                style={{ 
                                    display: "flex", 
                                    alignItems: "center", 
                                    gap: 12, 
                                    padding: "12px 16px", 
                                    borderRadius: 10, 
                                    cursor: "pointer",
                                    background: isActive ? "#3F51B5" : "transparent",
                                    color: isActive ? "white" : "#64748b",
                                    fontWeight: isActive ? 600 : 500,
                                    transition: "all 0.2s ease"
                                }}
                            >
                                <span style={{ fontSize: 18 }}>{link.icon}</span>
                                <span style={{ fontSize: 14 }}>{link.label}</span>
                            </div>
                        );
                    })}
                </nav>
                
                <div style={{ padding: 24, borderTop: "1px solid #f1f5f9" }}>
                    <button 
                        onClick={handleLogout}
                        style={{ width: "100%", padding: "12px", borderRadius: 8, border: "1px solid #f1f5f9", background: "white", color: "#ef4444", fontWeight: 600, cursor: "pointer" }}
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                
                <header style={{ 
                    height: 70, 
                    background: "white", 
                    padding: isMobile ? "0 12px" : "0 32px", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between", 
                    position: "sticky", 
                    top: 0, 
                    zIndex: 100, 
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)" 
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 16 }}>
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 8, border: "1px solid #f1f5f9", background: "white", cursor: "pointer" }}
                        >
                            {isSidebarOpen && !isMobile ? "◀" : "☰"}
                        </button>
                        <h1 style={{ fontSize: isMobile ? 16 : 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>{activeLabel}</h1>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 12 : 20 }}>
                        {!isMobile && (
                            <div style={{ position: "relative" }}>
                                <input 
                                    type="text" 
                                    placeholder="Global Search..." 
                                    style={{ padding: "10px 16px", paddingLeft: 40, borderRadius: 10, border: "1px solid #f1f5f9", background: "#f8f9fa", width: 200, fontSize: 13 }}
                                />
                                <span style={{ position: "absolute", left: 14, top: 11, color: "#94a3b8" }}>🔍</span>
                            </div>
                        )}
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#475569", fontSize: 12 }}>A</div>
                            {!isMobile && <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>Admin</span>}
                        </div>
                    </div>
                </header>

                <main style={{ 
                    padding: isMobile ? "12px" : "32px", 
                    flex: 1, 
                    width: "100%", 
                    maxWidth: "100%", 
                    boxSizing: "border-box",
                    overflowY: "auto"
                }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
