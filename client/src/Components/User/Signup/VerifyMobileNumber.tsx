import React, { useState, useRef } from "react";

interface VerifyMobileNumberProps {
    mobileNumber?: string;
    onVerify?: (otp: string) => void;
}

export default function VerifyMobileNumber({ 
    mobileNumber = "+623636565632", 
    onVerify 
}: VerifyMobileNumberProps) {
    const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
        if (onVerify) onVerify(otp.join(""));
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24, textAlign: "center" }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>
                Verify Mobile Number
            </h2>
            
            <div>
                <p style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
                    We have send the OTP to Your<br />mobile number
                </p>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e", marginTop: 0 }}>
                    {mobileNumber}
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
                            onFocus={(e) => e.target.style.borderColor = "#4361ee"}
                            onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                        />
                    ))}
                </div>
            </div>

            <button
                type="submit"
                style={{
                    width: "100%", padding: "13px 0", background: "#4361ee", color: "white",
                    border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(67,97,238,0.3)", marginTop: 12,
                }}
            >
                Verify
            </button>
        </form>
    );
}
