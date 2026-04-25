import React, { useState } from "react";
import Swal from "sweetalert2";

interface SignupProps {
    onContinue?: (formData: any) => void;
}

export default function Signup({ onContinue }: SignupProps) {
    const [extension, setExtension] = useState("+91");
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        mobileNumber: "",
        email: "",
        password: ""
    });
    const [focusedInput, setFocusedInput] = useState<string | null>(null);

    const COUNTRY_CODES = [
        { code: "+91", name: "India" },
        { code: "+1", name: "USA/Canada" },
        { code: "+44", name: "UK" },
        { code: "+971", name: "UAE" },
        { code: "+61", name: "Australia" },
    ];

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple validation
        if (!formData.firstName || !formData.lastName || !formData.mobileNumber || !formData.email || !formData.password) {
            Swal.fire({
                icon: 'warning',
                title: 'Required Info',
                text: "Please fill all fields to continue."
            });
            return;
        }
        if (onContinue) {
            onContinue({
                ...formData,
                mobileNumber: `${extension}${formData.mobileNumber}`
            });
        }
    };

    const getBorder = (id: string) => focusedInput === id ? "1.5px solid #4361ee" : "1.5px solid #e0e0e0";
    const getShadow = (id: string) => focusedInput === id ? "0 0 0 3px rgba(67,97,238,0.12)" : "none";

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: "#1a1a2e", margin: 0, textAlign: "center", marginBottom: 8 }}>
                Create Account
            </h2>

            {/* Name Row */}
            <div style={{ display: "flex", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>First Name</label>
                    <input
                        type="text"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={(e) => handleChange("firstName", e.target.value)}
                        onFocus={() => setFocusedInput("firstName")}
                        onBlur={() => setFocusedInput(null)}
                        style={{
                            width: "100%", padding: "12px 16px", borderRadius: 10, fontSize: 14,
                            color: "#222", outline: "none", boxSizing: "border-box",
                            background: focusedInput === "firstName" ? "white" : "#fafafa",
                            border: getBorder("firstName"),
                            boxShadow: getShadow("firstName"),
                        }}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>Last Name</label>
                    <input
                        type="text"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={(e) => handleChange("lastName", e.target.value)}
                        onFocus={() => setFocusedInput("lastName")}
                        onBlur={() => setFocusedInput(null)}
                        style={{
                            width: "100%", padding: "12px 16px", borderRadius: 10, fontSize: 14,
                            color: "#222", outline: "none", boxSizing: "border-box",
                            background: focusedInput === "lastName" ? "white" : "#fafafa",
                            border: getBorder("lastName"),
                            boxShadow: getShadow("lastName"),
                        }}
                    />
                </div>
            </div>

            {/* Mobile Number */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>Mobile Number</label>
                <div style={{ display: "flex", gap: 8 }}>
                    <select
                        value={extension}
                        onChange={(e) => setExtension(e.target.value)}
                        style={{
                            width: 80, padding: "12px 8px", borderRadius: 10, fontSize: 14,
                            border: "1.5px solid #e0e0e0", outline: "none", background: "#fafafa",
                            cursor: "pointer"
                        }}
                    >
                        {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                    </select>
                    <input
                        type="tel"
                        placeholder="enter mobile number"
                        value={formData.mobileNumber}
                        onChange={(e) => handleChange("mobileNumber", e.target.value)}
                        onFocus={() => setFocusedInput("mobileNumber")}
                        onBlur={() => setFocusedInput(null)}
                        style={{
                            flex: 1, padding: "12px 16px", borderRadius: 10, fontSize: 14,
                            color: "#222", outline: "none", boxSizing: "border-box",
                            background: focusedInput === "mobileNumber" ? "white" : "#fafafa",
                            border: getBorder("mobileNumber"),
                            boxShadow: getShadow("mobileNumber"),
                        }}
                    />
                </div>
            </div>

            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>Email</label>
                <input
                    type="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    onFocus={() => setFocusedInput("email")}
                    onBlur={() => setFocusedInput(null)}
                    style={{
                        width: "100%", padding: "12px 16px", borderRadius: 10, fontSize: 14,
                        color: "#222", outline: "none", boxSizing: "border-box",
                        background: focusedInput === "email" ? "white" : "#fafafa",
                        border: getBorder("email"),
                        boxShadow: getShadow("email"),
                    }}
                />
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>Password</label>
                <input
                    type="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    onFocus={() => setFocusedInput("password")}
                    onBlur={() => setFocusedInput(null)}
                    style={{
                        width: "100%", padding: "12px 16px", borderRadius: 10, fontSize: 14,
                        color: "#222", outline: "none", boxSizing: "border-box",
                        background: focusedInput === "password" ? "white" : "#fafafa",
                        border: getBorder("password"),
                        boxShadow: getShadow("password"),
                    }}
                />
                <span style={{ fontSize: 11, color: "#666", marginTop: 2 }}>*At least six characters</span>
            </div>

            <button
                type="submit"
                style={{
                    width: "100%", padding: "13px 0", background: "#4361ee", color: "white",
                    border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(67,97,238,0.3)", marginTop: 8,
                }}
            >
                Continue
            </button>
        </form>
    );
}
