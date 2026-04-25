import React, { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { requestLoginOtp, verifyLoginOtp } from "../../../services/authApi";

const validatePhone = (phone: string) => {
    if (!phone) return "Phone number is required.";
    if (!/^[0-9]{10,12}$/.test(phone.replace(/\s/g, ""))) return "Enter a valid phone number.";
    return "";
};

interface PhoneLoginFormProps {
    focusedInput: string | null;
    setFocusedInput: (id: string | null) => void;
    getInputBorder: (id: string, hasError: boolean | string) => string;
    getInputShadow: (id: string, hasError: boolean | string) => string;
    onSuccess: () => void;
}

const COUNTRY_CODES = [
    { code: "+91", name: "India" },
    { code: "+1", name: "USA/Canada" },
    { code: "+44", name: "UK" },
    { code: "+971", name: "UAE" },
    { code: "+61", name: "Australia" },
];

export default function PhoneLoginForm({
    focusedInput,
    setFocusedInput,
    getInputBorder,
    getInputShadow,
    onSuccess
}: PhoneLoginFormProps) {
    const navigate = useNavigate();
    const [phone, setPhone] = useState("");
    const [extension, setExtension] = useState("+91");
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [phoneError, setPhoneError] = useState("");
    const [phoneTouched, setPhoneTouched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0);

    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    React.useEffect(() => {
        let interval: any;
        if (isOtpSent && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isOtpSent, timer]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handlePhoneChange = (value: string) => {
        setPhone(value);
        if (phoneTouched) {
            setPhoneError(validatePhone(value));
        }
    };

    const handlePhoneBlur = () => {
        setFocusedInput(null);
        setPhoneTouched(true);
        setPhoneError(validatePhone(phone));
    };

    useEffect(() => {
        if (isOtpSent) {
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        }
    }, [isOtpSent]);

    const handleSendOtp = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const err = validatePhone(phone);
        setPhoneError(err);
        setPhoneTouched(true);
        if (!err) {
            setLoading(true);
            try {
                const fullPhone = `${extension}${phone}`;
                await requestLoginOtp(fullPhone);
                setIsOtpSent(true);
                setTimer(300); // 5 minutes
                setOtp(new Array(6).fill("")); // Reset OTP boxes
                Swal.fire({
                    icon: 'info',
                    title: 'OTP Sent',
                    text: `An OTP has been sent to ${fullPhone}. Valid for 5 minutes.`,
                    confirmButtonColor: '#4361ee'
                });
            } catch (err) {
                const error = err as Error;
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Error sending OTP',
                    confirmButtonColor: '#4361ee'
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const handleOtpChange = (value: string, index: number) => {
        if (!/^\d*$/.test(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Move to next input
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpString = otp.join("");
        if (otpString.length !== 6) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid OTP',
                text: 'Please enter a 6-digit OTP'
            });
            return;
        }
        setLoading(true);
        try {
            const data = await verifyLoginOtp(`${extension}${phone}`, otpString);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            onSuccess();
            Swal.fire({
                icon: 'success',
                title: 'Welcome Back!',
                text: 'Login successful.',
                timer: 1500,
                showConfirmButton: false
            });
            setTimeout(() => navigate('/home'), 1500);
        } catch (err) {
            const error = err as Error;
            Swal.fire({
                icon: 'error',
                title: 'Invalid OTP',
                text: error.message || 'Invalid OTP',
                confirmButtonColor: '#4361ee'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {!isOtpSent ? (
                <form onSubmit={handleSendOtp} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>Phone Number</label>
                        <div style={{ display: "flex", gap: 8 }}>
                            <select
                                value={extension}
                                onChange={(e) => setExtension(e.target.value)}
                                style={{
                                    width: 80, padding: "12px 8px", borderRadius: 10, fontSize: 14,
                                    border: "1.5px solid #e1e4e8", outline: "none", background: "#f8fafc",
                                    cursor: "pointer"
                                }}
                            >
                                {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                            </select>
                            <input
                                type="tel"
                                placeholder="enter phone number"
                                value={phone}
                                onChange={(e) => handlePhoneChange(e.target.value)}
                                onFocus={() => setFocusedInput("phone")}
                                onBlur={handlePhoneBlur}
                                style={{
                                    flex: 1, padding: "12px 16px", borderRadius: 10, fontSize: 14,
                                    color: "#222", outline: "none", boxSizing: "border-box",
                                    background: focusedInput === "phone" ? "white" : "#fafafa",
                                    border: getInputBorder("phone", phoneTouched && phoneError),
                                    boxShadow: getInputShadow("phone", phoneTouched && phoneError),
                                }}
                            />
                        </div>
                        {phoneTouched && phoneError && (
                            <span style={{ fontSize: 12, color: "#e53e3e", marginTop: 2 }}>⚠ {phoneError}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%", padding: "13px 0", background: "#4361ee", color: "white",
                            border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer",
                            boxShadow: "0 4px 14px rgba(67,97,238,0.3)", marginTop: 4,
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? "Sending..." : "Send OTP"}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>Enter OTP sent to {extension} {phone}</label>
                        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                            {otp.map((digit, idx) => (
                                <input
                                    key={idx}
                                    ref={(el) => { otpRefs.current[idx] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                                    onKeyDown={(e) => handleKeyDown(e, idx)}
                                    onFocus={() => setFocusedInput(`otp-${idx}`)}
                                    onBlur={() => setFocusedInput(null)}
                                    style={{
                                        width: 38, height: 48, borderRadius: 8, fontSize: 18, fontWeight: 600,
                                        textAlign: "center", border: focusedInput === `otp-${idx}` ? "2px solid #4361ee" : "1.5px solid #e1e4e8",
                                        outline: "none", background: "#fff", transition: "all 0.2s"
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || timer === 0}
                        style={{
                            width: "100%", padding: "13px 0", background: timer === 0 ? "#888" : "#4361ee", color: "white",
                            border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer",
                            boxShadow: timer === 0 ? "none" : "0 4px 14px rgba(67,97,238,0.3)", marginTop: 4,
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? "Verifying..." : "Verify & Login"}
                    </button>

                    <div style={{ textAlign: "center", fontSize: 13, color: timer === 0 ? "#ef4444" : "#666" }}>
                        {timer > 0 ? (
                            <span>OTP expires in <span style={{ fontWeight: 700, color: "#4361ee" }}>{formatTime(timer)}</span></span>
                        ) : (
                            <span>OTP has expired</span>
                        )}
                    </div>
                    
                    {timer === 0 && (
                        <button 
                            type="button" 
                            onClick={handleSendOtp}
                            style={{ background: "none", border: "none", color: "#4361ee", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                        >
                            Resend OTP
                        </button>
                    )}
                    
                    <button 
                        type="button" 
                        onClick={() => setIsOtpSent(false)}
                        style={{ background: "none", border: "none", color: "#4361ee", fontSize: 13, cursor: "pointer" }}
                    >
                        Change Phone Number
                    </button>
                </form>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#bbb", fontSize: 13, margin: "4px 0" }}>
                <div style={{ flex: 1, height: 1, background: "#e8e8e8" }} />
                New to Quality Cricket
                <div style={{ flex: 1, height: 1, background: "#e8e8e8" }} />
            </div>

            <button 
                type="button" 
                onClick={() => navigate('/signup')}
                style={{
                    width: "100%", padding: "12px 0", background: "#e2e8f0", color: "#333",
                    border: "1.5px solid #d1d5db", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}
            >
                Create account
            </button>
        </div>
    );
}
