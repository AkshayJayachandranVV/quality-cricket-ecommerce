import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Signup from "./Signup";
import VerifyMobileNumber from "./VerifyMobileNumber";
import { requestRegisterOtp, verifyRegisterOtp } from "../../../services/authApi";

import { useAuth } from "../../../context/AuthContext";

export default function SignupPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handler = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);

    const isMobile = windowWidth <= 768;
    const isSmall = windowWidth <= 400;

    const [mobileOpen, setMobileOpen] = useState(false);
    const [hoveredNav, setHoveredNav] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState<"signup" | "verify">("signup");
    
    // tracking user's entered data
    const [formData, setFormData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const navLinks = ["Home", "Sale", "Accessories", "All Products", "Contact Us", "FAQ's"];

    const handleContinue = async (data: any) => {
        setFormData(data);
        setLoading(true);
        try {
            await requestRegisterOtp({ ...data, phoneNumber: data.mobileNumber });
            Swal.fire({
                icon: 'info',
                title: 'Verify Mobile',
                text: 'An OTP has been sent to your mobile number.',
                confirmButtonColor: '#4361ee'
            });
            setCurrentStep("verify");
        } catch (err) {
            const error = err as Error;
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || "Error requesting OTP",
                confirmButtonColor: '#4361ee'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (otp: string) => {
        if (!formData) return;
        setLoading(true);
        try {
            const resData = await verifyRegisterOtp({ email: formData.email, otp });
            login(resData.user, resData.token);
            Swal.fire({
                icon: 'success',
                title: 'Welcome!',
                text: 'Registration successful!',
                timer: 2000,
                showConfirmButton: false
            });
            navigate('/home');
        } catch (err) {
            const error = err as Error;
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || "Verification failed",
                confirmButtonColor: '#4361ee'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh", display: "flex", flexDirection: "column",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            margin: 0, padding: 0,
        }}>
            {/* ── NAVBAR ── */}
            <nav style={{
                background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                position: "sticky", top: 0, zIndex: 100,
            }}>
                <div style={{
                    maxWidth: 1200, margin: "0 auto", padding: "0 24px",
                    height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                    {/* Logo */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                            <circle cx="22" cy="22" r="20" fill="#1a1a2e" stroke="#4361ee" strokeWidth="2" />
                            <text x="22" y="27" textAnchor="middle" fill="white" fontSize="15"
                                fontWeight="bold" fontFamily="Georgia, serif">QC</text>
                        </svg>
                        <span style={{ fontSize: 10, color: "#333", lineHeight: 1.2, fontFamily: "Georgia, serif" }}>
                            quality<br />cricket.com
                        </span>
                    </div>

                    {/* Nav links — hidden on mobile */}
                    {!isMobile && (
                        <ul style={{ display: "flex", alignItems: "center", gap: 32, listStyle: "none", margin: 0, padding: 0 }}>
                            {navLinks.map((link) => (
                                <li key={link}>
                                    <a
                                        href={link === "Home" ? "/home" : "#"}
                                        style={{
                                            textDecoration: "none",
                                            color: hoveredNav === link || link === "Home" ? "#4361ee" : "#333",
                                            fontSize: 15, fontWeight: 500,
                                            borderBottom: link === "Home" ? "2px solid #4361ee" : "none",
                                            paddingBottom: link === "Home" ? 2 : 0,
                                            cursor: "pointer",
                                        }}
                                        onMouseEnter={() => setHoveredNav(link)}
                                        onMouseLeave={() => setHoveredNav(null)}
                                    >
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Login button — hidden on mobile */}
                    {!isMobile && (
                        <button 
                            onClick={() => navigate("/login")}
                            style={{
                                background: "#4361ee", color: "white", border: "none",
                                padding: "10px 28px", borderRadius: 50, fontSize: 15, fontWeight: 600, cursor: "pointer",
                            }}>
                            Login
                        </button>
                    )}

                    {/* Hamburger — visible on mobile only */}
                    {isMobile && (
                        <button
                            onClick={() => setMobileOpen((p) => !p)}
                            style={{
                                display: "flex", flexDirection: "column", gap: 5,
                                cursor: "pointer", background: "none", border: "none", padding: 4,
                            }}
                            aria-label="Toggle menu"
                        >
                            <span style={{ display: "block", width: 24, height: 2, background: "#333", borderRadius: 2 }} />
                            <span style={{ display: "block", width: 24, height: 2, background: "#333", borderRadius: 2 }} />
                            <span style={{ display: "block", width: 24, height: 2, background: "#333", borderRadius: 2 }} />
                        </button>
                    )}
                </div>

                {/* Mobile dropdown */}
                {isMobile && mobileOpen && (
                    <div style={{
                        background: "white", borderTop: "1px solid #eee", padding: "16px 24px",
                        display: "flex", flexDirection: "column", gap: 16,
                    }}>
                        {navLinks.map((link) => (
                            <a key={link} href={link === "Home" ? "/home" : "#"} style={{ textDecoration: "none", color: "#333", fontSize: 15, fontWeight: 500 }}>
                                {link}
                            </a>
                        ))}
                        <button 
                            onClick={() => navigate("/login")}
                            style={{
                                background: "#4361ee", color: "white", border: "none",
                                padding: "10px 0", borderRadius: 50, fontSize: 15, fontWeight: 600,
                                cursor: "pointer", width: "100%", marginTop: 4,
                            }}>
                            Login
                        </button>
                    </div>
                )}
            </nav>

            {/* ── HERO ── */}
            <div style={{
                flex: 1, position: "relative", display: "flex", alignItems: "center",
                justifyContent: "center", padding: "40px 16px",
                minHeight: "calc(100vh - 64px)", overflow: "hidden",
            }}>
                {/* Background image */}
                <div style={{
                    position: "absolute", inset: 0,
                    background: "url('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1600&q=80') center/cover no-repeat",
                    filter: "brightness(0.55)", zIndex: 0,
                }} />

                {/* ── SIGNUP CARD ── */}
                <div style={{
                    position: "relative", zIndex: 1, background: "white", borderRadius: 16,
                    padding: isSmall ? "24px 16px 20px" : isMobile ? "32px 24px 28px" : "40px 40px 36px",
                    width: "100%", maxWidth: isMobile ? "100%" : 460,
                    boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
                }}>
                    {currentStep === "signup" && (
                        <Signup onContinue={handleContinue} />
                    )}
                    {currentStep === "verify" && (
                        <VerifyMobileNumber 
                            mobileNumber={formData?.mobileNumber} 
                            onVerify={handleVerify} 
                        />
                    )}
                    {loading && (
                        <div style={{
                            position: "absolute", inset: 0, background: "rgba(255,255,255,0.7)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            borderRadius: 16, zIndex: 10
                        }}>
                            <div style={{ fontSize: 16, fontWeight: 600, color: "#4361ee" }}>Processing...</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
