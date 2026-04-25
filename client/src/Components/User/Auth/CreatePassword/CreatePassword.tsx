import React, { useState } from "react";

interface CreatePasswordProps {
    onSave?: (password: string) => void;
}

export default function CreatePassword({ onSave }: CreatePasswordProps) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [focusedInput, setFocusedInput] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSave) onSave(password);
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1a1a2e", margin: 0, textAlign: "center" }}>
                Create Password
            </h2>
            
            <div style={{ marginTop: 4 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#444", marginBottom: 8 }}>
                    Password must have
                </p>
                <ul style={{ fontSize: 13, color: "#666", margin: 0, paddingLeft: 20, lineHeight: 1.6 }}>
                    <li>have at least 8 characters</li>
                    <li>have at least one upper case</li>
                    <li>have at least one special character (!, %, @, #, etc.)</li>
                </ul>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>New Password</label>
                <input
                    type="password"
                    placeholder="enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedInput("password")}
                    onBlur={() => setFocusedInput(null)}
                    style={{
                        width: "100%", padding: "12px 16px", borderRadius: 10, fontSize: 14,
                        color: "#222", outline: "none", boxSizing: "border-box",
                        background: focusedInput === "password" ? "white" : "#fafafa",
                        border: focusedInput === "password" ? "1.5px solid #4361ee" : "1.5px solid #e0e0e0",
                        boxShadow: focusedInput === "password" ? "0 0 0 3px rgba(67,97,238,0.12)" : "none",
                    }}
                />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>Confirm New Password</label>
                <input
                    type="password"
                    placeholder="enter confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocusedInput("confirm")}
                    onBlur={() => setFocusedInput(null)}
                    style={{
                        width: "100%", padding: "12px 16px", borderRadius: 10, fontSize: 14,
                        color: "#222", outline: "none", boxSizing: "border-box",
                        background: focusedInput === "confirm" ? "white" : "#fafafa",
                        border: focusedInput === "confirm" ? "1.5px solid #4361ee" : "1.5px solid #e0e0e0",
                        boxShadow: focusedInput === "confirm" ? "0 0 0 3px rgba(67,97,238,0.12)" : "none",
                    }}
                />
            </div>

            <button
                type="submit"
                style={{
                    width: "100%", padding: "13px 0", background: "#4361ee", color: "white",
                    border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(67,97,238,0.3)", marginTop: 8,
                }}
            >
                Save
            </button>
        </form>
    );
}
