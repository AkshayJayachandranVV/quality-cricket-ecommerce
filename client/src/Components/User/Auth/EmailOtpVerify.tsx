import React, { useState, useRef, useEffect } from "react";

interface EmailOtpVerifyProps {
    email: string;
    onVerify: (otp: string) => void;
    onResend?: () => void;
}

export default function EmailOtpVerify({ email, onVerify, onResend }: EmailOtpVerifyProps) {
    const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
    const [timer, setTimer] = useState(300); // 5 minutes
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        let interval: any;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value !== "" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && otp[index] === "" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onVerify(otp.join(""));
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24, textAlign: "center" }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>
                Verify Your Email
            </h2>
            
            <div>
                <p style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
                    We have sent an OTP code to your<br />registered email address:
                </p>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e", marginTop: 0 }}>
                    {email}
                </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>OTP</label>
                <div style={{ display: "flex", gap: 12, justifyContent: "space-between", width: "100%" }}>
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => { inputRefs.current[index] = el; }}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            style={{
                                width: 44, height: 44, textAlign: "center", fontSize: 18, fontWeight: 600,
                                borderRadius: 8, border: "1.5px solid #e0e0e0", outline: "none",
                                background: digit ? "white" : "#fafafa",
                                color: "#222",
                            }}
                            onFocus={(e) => (e.target as any).style.borderColor = "#4361ee"}
                            onBlur={(e) => (e.target as any).style.borderColor = "#e0e0e0"}
                        />
                    ))}
                </div>
            </div>

            <button
                type="submit"
                disabled={timer === 0}
                style={{
                    width: "100%", padding: "13px 0", background: timer === 0 ? "#888" : "#4361ee", color: "white",
                    border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer",
                    boxShadow: timer === 0 ? "none" : "0 4px 14px rgba(67,97,238,0.3)", marginTop: 12,
                }}
            >
                Verify
            </button>

            <div style={{ fontSize: 13, color: timer === 0 ? "#ef4444" : "#666" }}>
                {timer > 0 ? (
                    <span>Code expires in <span style={{ fontWeight: 700, color: "#4361ee" }}>{formatTime(timer)}</span></span>
                ) : (
                    <span>OTP has expired</span>
                )}
            </div>

            {timer === 0 && onResend && (
                <button 
                    type="button" 
                    onClick={() => {
                        setTimer(300);
                        onResend();
                    }}
                    style={{ background: "none", border: "none", color: "#4361ee", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                >
                    Resend OTP
                </button>
            )}
        </form>
    );
}
