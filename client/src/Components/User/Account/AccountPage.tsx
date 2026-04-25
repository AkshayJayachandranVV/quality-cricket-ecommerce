import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Shared/Navbar";
import Footer from "../Shared/Footer";
import order from '../../../assets/Account/orders.png'
import location from '../../../assets/Account/location.png'
import contact from '../../../assets/Account/contact.png'


export default function AccountPage() {
    const navigate = useNavigate();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const onResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", onResize);
        window.scrollTo(0, 0);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const isMobile = windowWidth < 768;

    const CARDS = [
        { id: "orders", title: "Your Orders", desc: "Track, return, or buy things again", icon: order, path: "/account/orders" },
        { id: "security", title: "Login & security", desc: "Edit login, name, mobile number and email", icon: "🔒", path: "/account/security" },
        { id: "addresses", title: "Your Address", desc: "Edit addresses for orders", icon: location, path: "/account/addresses" },
        { id: "wallet", title: "Your Wallet", desc: "Manage your refunds and wallet balance", icon: "💳", path: "/account/wallet" },
        { id: "contact", title: "Contact Us", desc: "", icon: contact, path: "/contact" }
    ];

    return (
        <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", background: "#fdfdfd", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar />

            <main style={{ flex: 1, maxWidth: 1000, margin: "0 auto", padding: isMobile ? "20px 12px" : "48px 24px", width: "100%", boxSizing: "border-box" }}>

                {/* Header section with back button */}
                <div style={{ display: "flex", alignItems: "center", position: "relative", marginBottom: 48 }}>
                    <span onClick={() => navigate(-1)} style={{ cursor: "pointer", fontWeight: 600, fontSize: 16, color: "#333", position: "absolute", left: 0 }}>
                        ‹ back
                    </span>
                    <h1 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 500, color: "#333", margin: "0 auto", textAlign: "center" }}>
                        Your Account
                    </h1>
                </div>

                {/* Dynamic Grid Container */}
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 24, justifyContent: "center" }}>

                    {CARDS.map((card, idx) => (
                        <div
                            key={card.id}
                            onClick={() => navigate(card.path)}
                            style={{
                                background: "white",
                                border: "1px solid #ddd",
                                borderRadius: 8,
                                padding: "24px 20px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 16,
                                boxShadow: "0 2px 5px rgba(0,0,0,0.02)",
                                ...({ gridColumn: idx === 3 && !isMobile ? "1 / span 1" : "auto" }) // Contact Us alignment
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#c0c0c0")}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#ddd")}
                        >
                            <div style={{ fontSize: 36, color: "#3F51B5", width: 48, height: 48, textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                {card.icon.length > 5 ? (
                                    <img src={card.icon} alt={card.title} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                                ) : (
                                    <span>{card.icon}</span>
                                )}
                            </div>
                            <div>
                                <h2 style={{ fontSize: 16, fontWeight: 500, color: "#333", margin: "0 0 4px 0" }}>{card.title}</h2>
                                {card.desc && <p style={{ fontSize: 12, color: "#777", margin: 0 }}>{card.desc}</p>}
                            </div>
                        </div>
                    ))}

                </div>

            </main>

            <Footer />
        </div>
    );
}
