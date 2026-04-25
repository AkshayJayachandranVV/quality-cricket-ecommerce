import React, { useState } from "react";
import Swal from "sweetalert2";

interface ChangePasswordProps {
    onReset: (password: string) => void;
}

export default function ChangePassword({ onReset }: ChangePasswordProps) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [focused, setFocused] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Mismatch',
                text: "Passwords do not match!"
            });
            return;
        }
        if (password.length < 6) {
            Swal.fire({
                icon: 'warning',
                title: 'Weak Password',
                text: "Password must be at least 6 characters."
            });
            return;
        }
        onReset(password);
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24, textAlign: "center" }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>
                Set New Password
            </h2>
            <p style={{ fontSize: 14, color: "#666", margin: "0 auto", maxWidth: 300, lineHeight: 1.5 }}>
                Enter a new secure password for your account.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 20, textAlign: "left", marginTop: 8 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>New Password</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocused("pass")}
                        onBlur={() => setFocused(null)}
                        style={{
                            width: "100%", padding: "12px 16px", borderRadius: 10, fontSize: 14,
                            color: "#222", outline: "none", boxSizing: "border-box",
                            background: focused === "pass" ? "white" : "#fafafa",
                            border: focused === "pass" ? "1.5px solid #4361ee" : "1.5px solid #e0e0e0",
                            boxShadow: focused === "pass" ? "0 0 0 3px rgba(67,97,238,0.12)" : "none",
                        }}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>Confirm Password</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onFocus={() => setFocused("confirm")}
                        onBlur={() => setFocused(null)}
                        style={{
                            width: "100%", padding: "12px 16px", borderRadius: 10, fontSize: 14,
                            color: "#222", outline: "none", boxSizing: "border-box",
                            background: focused === "confirm" ? "white" : "#fafafa",
                            border: focused === "confirm" ? "1.5px solid #4361ee" : "1.5px solid #e0e0e0",
                            boxShadow: focused === "confirm" ? "0 0 0 3px rgba(67,97,238,0.12)" : "none",
                        }}
                    />
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
                Reset Password
            </button>
        </form>
    );
}
