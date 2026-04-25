import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";
import PhoneLoginForm from "./PhoneLoginForm";
import ForgetPassword from "../Auth/ForgetPassword/ForgetPassword";
import ChangePassword from "../Auth/ChangePassword";
import EmailOtpVerify from "../Auth/EmailOtpVerify";
import { useAuth } from "../../../context/AuthContext";
import { 
    loginEmail, 
    forgotPasswordRequest, 
    forgotPasswordVerify, 
    resetPassword,
    googleLoginApi
} from "../../../services/authApi";
import { GoogleLogin } from '@react-oauth/google';

const validateEmail = (email: string) => {
    if (!email) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
    return "";
};

const validatePassword = (password: string) => {
    if (!password) return "Password is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return "";
};

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const from = location.state?.from?.pathname || "/home";

    useEffect(() => {
        const handler = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);

    const isMobile = windowWidth <= 768;
    const isSmall = windowWidth <= 400;

    const [activeTab, setActiveTab] = useState("email");
    const [mobileOpen, setMobileOpen] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [hoveredNav, setHoveredNav] = useState<string | null>(null);
    const [focusedInput, setFocusedInput] = useState<string | null>(null);

    const [emailForm, setEmailForm] = useState({ email: "", password: "" });
    const [emailErrors, setEmailErrors] = useState({ email: "", password: "" });
    const [emailTouched, setEmailTouched] = useState({ email: false, password: false });

    // Forgot password state
    const [resetEmail, setResetEmail] = useState("");
    const [resetOtp, setResetOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const handleEmailChange = (field: "email" | "password", value: string) => {
        setEmailForm((p) => ({ ...p, [field]: value }));
        if (emailTouched[field]) {
            setEmailErrors((p) => ({
                ...p,
                [field]: field === "email" ? validateEmail(value) : validatePassword(value),
            }));
        }
    };

    const handleEmailBlur = (field: "email" | "password") => {
        setFocusedInput(null);
        setEmailTouched((p) => ({ ...p, [field]: true }));
        setEmailErrors((p) => ({
            ...p,
            [field]: field === "email" ? validateEmail(emailForm.email) : validatePassword(emailForm.password),
        }));
    };

    const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const errors = { email: validateEmail(emailForm.email), password: validatePassword(emailForm.password) };
        setEmailErrors(errors);
        setEmailTouched({ email: true, password: true });
        if (!errors.email && !errors.password) {
            setLoading(true);
            try {
                const data = await loginEmail(emailForm);
                login(data.user, data.token);
                setLoginSuccess(true);
                Swal.fire({
                    icon: 'success',
                    title: 'Welcome Back!',
                    text: 'Login successful.',
                    timer: 1500,
                    showConfirmButton: false
                });
                setTimeout(() => navigate(from, { replace: true }), 1500);
            } catch (err) {
                const error = err as Error;
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: error.message || 'Login failed',
                    confirmButtonColor: '#4361ee'
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const navLinks = ["Home", "Sale", "Accessories", "All Products", "Contact Us", "FAQ's"];

    const getInputBorder = (id: string, hasError: boolean | string) => {
        if (hasError) return "1.5px solid #e53e3e";
        if (focusedInput === id) return "1.5px solid #4361ee";
        return "1.5px solid #e0e0e0";
    };

    const getInputShadow = (id: string, hasError: boolean | string) => {
        if (focusedInput === id) {
            return hasError ? "0 0 0 3px rgba(229,62,62,0.12)" : "0 0 0 3px rgba(67,97,238,0.12)";
        }
        return "none";
    };

    const handleForgetPassword = () => {
        setActiveTab("forget-password");
    }

    const handleForgotRequest = async (email: string) => {
        setResetEmail(email);
        setLoading(true);
        try {
            await forgotPasswordRequest(email);
            Swal.fire({
                icon: 'info',
                title: 'OTP Sent',
                text: 'An OTP has been sent to your email address.',
                confirmButtonColor: '#4361ee'
            });
            setActiveTab("forget-verify");
        } catch (err) {
            const error = err as Error;
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || "Failed to send OTP",
                confirmButtonColor: '#4361ee'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleForgotVerify = async (otp: string) => {
        setResetOtp(otp);
        setLoading(true);
        try {
            await forgotPasswordVerify(resetEmail, otp);
            setActiveTab("change-password");
        } catch (err) {
            const error = err as Error;
            Swal.fire({
                icon: 'error',
                title: 'Invalid OTP',
                text: error.message || "Invalid OTP",
                confirmButtonColor: '#4361ee'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleForgotReset = async (newPassword: string) => {
        setLoading(true);
        try {
            await resetPassword({ email: resetEmail, otp: resetOtp, newPassword });
            Swal.fire({
                icon: 'success',
                title: 'Password Reset',
                text: 'Password reset successfully! Please login with your new password.',
                confirmButtonColor: '#4361ee'
            });
            setActiveTab("email");
        } catch (err) {
            const error = err as Error;
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || "Failed to reset password",
                confirmButtonColor: '#4361ee'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setLoading(true);
        try {
            const data = await googleLoginApi(credentialResponse.credential);
            login(data.user, data.token);
            setLoginSuccess(true);
            Swal.fire({
                icon: 'success',
                title: 'Welcome!',
                text: 'Google login successful.',
                timer: 1500,
                showConfirmButton: false
            });
            setTimeout(() => navigate(from, { replace: true }), 1500);
        } catch (err: any) {
            Swal.fire({
                icon: 'error',
                title: 'Google Login Failed',
                text: err.message || 'Social login failed',
                confirmButtonColor: '#4361ee'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* SUCCESS TOAST */}
            {loginSuccess && (
                <div style={{
                    position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)",
                    background: "#38a169", color: "white", padding: "12px 28px",
                    borderRadius: 50, fontSize: 14, fontWeight: 600,
                    boxShadow: "0 8px 24px rgba(56,161,105,0.4)", zIndex: 999,
                }}>
                    ✓ Login successful! Welcome back.
                </div>
            )}

            {/* PAGE WRAPPER */}
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
                        <div style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }} onClick={() => navigate("/home")}>
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
                                        <div
                                            onClick={() => {
                                                if(link === "Home") navigate("/home");
                                                else if(link === "All Products") navigate("/products");
                                                else if(link === "Contact Us") navigate("/contact");
                                            }}
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
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Login button — hidden on mobile */}
                        {!isMobile && (
                            <button style={{
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
                                <div key={link} style={{ textDecoration: "none", color: "#333", fontSize: 15, fontWeight: 500 }}>
                                    {link}
                                </div>
                            ))}
                            <button style={{
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

                    {/* ── LOGIN CARD ── */}
                    <div style={{
                        position: "relative", zIndex: 1, background: "white", borderRadius: 16,
                        padding: isSmall ? "24px 16px 20px" : isMobile ? "32px 24px 28px" : "40px 40px 36px",
                        width: "100%", maxWidth: isMobile ? "100%" : 460,
                        boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
                    }}>
                        {(activeTab === "email" || activeTab === "phone") && (
                            <>
                                <h1 style={{
                                    textAlign: "center", fontSize: isMobile ? 22 : 26, fontWeight: 700,
                                    color: "#1a1a2e", marginBottom: 24, letterSpacing: "-0.3px",
                                }}>
                                    Login
                                </h1>

                                {/* Tabs */}
                                <div style={{
                                    display: "flex", background: "#f0f2f5", borderRadius: 50,
                                    padding: 4, marginBottom: 28, gap: 4,
                                }}>
                                    {[
                                        { key: "email", label: "Email" },
                                        { key: "phone", label: "Phone Number" },
                                    ].map(({ key, label }) => (
                                        <button
                                            key={key}
                                            onClick={() => { setActiveTab(key); }}
                                            style={{
                                                flex: 1, padding: "10px 0", border: "none", borderRadius: 50,
                                                fontSize: 14, fontWeight: 600, cursor: "pointer",
                                                background: activeTab === key ? "#4361ee" : "transparent",
                                                color: activeTab === key ? "white" : "#888",
                                                boxShadow: activeTab === key ? "0 4px 12px rgba(67,97,238,0.3)" : "none",
                                                transition: "all 0.25s",
                                            }}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* ── EMAIL FORM ── */}
                        {activeTab === "email" && (
                            <form onSubmit={handleEmailSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                                {/* Email */}
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>Email</label>
                                    <input
                                        type="email"
                                        placeholder="enter email"
                                        value={emailForm.email}
                                        onChange={(e) => handleEmailChange("email", e.target.value)}
                                        onFocus={() => setFocusedInput("email")}
                                        onBlur={() => handleEmailBlur("email")}
                                        style={{
                                            width: "100%", padding: "12px 16px", borderRadius: 10, fontSize: 14,
                                            color: "#222", outline: "none", boxSizing: "border-box",
                                            background: focusedInput === "email" ? "white" : "#fafafa",
                                            border: getInputBorder("email", emailTouched.email && emailErrors.email),
                                            boxShadow: getInputShadow("email", emailTouched.email && emailErrors.email),
                                        }}
                                    />
                                    {emailTouched.email && emailErrors.email && (
                                        <span style={{ fontSize: 12, color: "#e53e3e", marginTop: 2 }}>⚠ {emailErrors.email}</span>
                                    )}
                                </div>

                                {/* Password */}
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>Password</label>
                                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter password"
                                            value={emailForm.password}
                                            onChange={(e) => handleEmailChange("password", e.target.value)}
                                            onFocus={() => setFocusedInput("password")}
                                            onBlur={() => handleEmailBlur("password")}
                                            style={{
                                                width: "100%", padding: "12px 44px 12px 16px", borderRadius: 10, fontSize: 14,
                                                color: "#222", outline: "none", boxSizing: "border-box",
                                                background: focusedInput === "password" ? "white" : "#fafafa",
                                                border: getInputBorder("password", emailTouched.password && emailErrors.password),
                                                boxShadow: getInputShadow("password", emailTouched.password && emailErrors.password),
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((p) => !p)}
                                            style={{
                                                position: "absolute", right: 12, background: "none", border: "none",
                                                cursor: "pointer", color: "#aaa", padding: 4, fontSize: 16, display: "flex", alignItems: "center",
                                            }}
                                        >
                                            {showPassword ? "🙈" : "👁"}
                                        </button>
                                    </div>
                                    {emailTouched.password && emailErrors.password && (
                                        <span style={{ fontSize: 12, color: "#e53e3e", marginTop: 2 }}>⚠ {emailErrors.password}</span>
                                    )}
                                </div>

                                {/* Forgot password */}
                                <div style={{ textAlign: "right", marginTop: -8 }}>
                                    <button type="button" onClick={handleForgetPassword} style={{
                                        fontSize: 13, color: "#4361ee", fontWeight: 500,
                                        cursor: "pointer", background: "none", border: "none", padding: 0,
                                    }}>
                                        Forget Password ?
                                    </button>
                                </div>

                                <button type="submit" style={{
                                    width: "100%", padding: "13px 0", background: "#4361ee", color: "white",
                                    border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer",
                                    boxShadow: "0 4px 14px rgba(67,97,238,0.3)", marginTop: 4,
                                }}>
                                    Login
                                </button>

                                <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => {
                                            Swal.fire({
                                                icon: 'error',
                                                title: 'Google Error',
                                                text: 'Google authentication failed',
                                                confirmButtonColor: '#4361ee'
                                            });
                                        }}
                                        useOneTap
                                        theme="outline"
                                        shape="pill"
                                        width="100%"
                                    />
                                </div>

                                {/* Divider */}
                                <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#bbb", fontSize: 13, margin: "4px 0" }}>
                                    <div style={{ flex: 1, height: 1, background: "#e8e8e8" }} />
                                    New to Quality Cricket
                                    <div style={{ flex: 1, height: 1, background: "#e8e8e8" }} />
                                </div>

                                <button 
                                    type="button" 
                                    onClick={() => navigate('/signup')}
                                    style={{
                                        width: "100%", padding: "12px 0", background: "#f5f5f5", color: "#333",
                                        border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer",
                                    }}
                                >
                                    Create account
                                </button>
                            </form>
                        )}

                        {/* ── PHONE FORM ── */}
                        {activeTab === "phone" && (
                            <PhoneLoginForm
                                focusedInput={focusedInput}
                                setFocusedInput={setFocusedInput}
                                getInputBorder={getInputBorder}
                                getInputShadow={getInputShadow}
                                onSuccess={() => {
                                    setLoginSuccess(true);
                                    setTimeout(() => setLoginSuccess(false), 3000);
                                }}
                            />
                        )}

                        {/* ── FORGET PASSWORD FLOW ── */}
                        {activeTab === "forget-password" && (
                            <ForgetPassword onContinue={handleForgotRequest} />
                        )}

                        {activeTab === "forget-verify" && (
                            <EmailOtpVerify 
                                email={resetEmail} 
                                onVerify={handleForgotVerify} 
                                onResend={() => handleForgotRequest(resetEmail)}
                            />
                        )}

                        {activeTab === "change-password" && (
                            <ChangePassword onReset={handleForgotReset} />
                        )}

                        {/* Back to Login link */}
                        {activeTab.startsWith("forget") || activeTab === "change-password" ? (
                            <div style={{ marginTop: 20, textAlign: "center" }}>
                                <button
                                    onClick={() => setActiveTab("email")}
                                    style={{ background: "none", border: "none", color: "#666", fontSize: 13, cursor: "pointer", fontWeight: 500 }}
                                >
                                    ← Back to Login
                                </button>
                            </div>
                        ) : null}

                        {/* Loading Overlay */}
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
        </>
    );
}
