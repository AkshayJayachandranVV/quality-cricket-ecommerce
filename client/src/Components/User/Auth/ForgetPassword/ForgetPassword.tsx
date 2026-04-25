import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
interface ForgetPasswordProps {
    onContinue?: (email: string) => void;
}

export default function ForgetPassword({ onContinue }: ForgetPasswordProps) {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [focused, setFocused] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onContinue) onContinue(email);
    };

    const handleContinue = () => {
        // Redirection should be handled by the parent component (LoginPage) state
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24, textAlign: "center" }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>
                Forget Password
            </h2>
            <p style={{ fontSize: 14, color: "#666", margin: "0 auto", maxWidth: 300, lineHeight: 1.5 }}>
                Enter the email address associated<br />with your account.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "left", marginTop: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>Email</label>
                <input
                    type="email"
                    placeholder="enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={{
                        width: "100%", padding: "12px 16px", borderRadius: 10, fontSize: 14,
                        color: "#222", outline: "none", boxSizing: "border-box",
                        background: focused ? "white" : "#fafafa",
                        border: focused ? "1.5px solid #4361ee" : "1.5px solid #e0e0e0",
                        boxShadow: focused ? "0 0 0 3px rgba(67,97,238,0.12)" : "none",
                    }}
                />
            </div>

            <button
                type="submit"
                onClick={handleContinue}
                style={{
                    width: "100%", padding: "13px 0", background: "#4361ee", color: "white",
                    border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(67,97,238,0.3)", marginTop: 12,
                }}
            >
                Continue
            </button>
        </form>
    );
}
