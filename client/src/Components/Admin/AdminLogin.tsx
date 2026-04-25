import React, { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { loginEmail } from "../../services/authApi";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await loginEmail({ email, password });
            if (response.user.role !== 'Admin') {
                setError("Access denied. Admin privileges required.");
                setLoading(false);
                return;
            }

            login(response.user, response.token);
            Swal.fire({
                icon: 'success',
                title: 'Welcome Admin!',
                text: 'Admin login successful.',
                timer: 1500,
                showConfirmButton: false
            });
            navigate("/admin");
        } catch (err: any) {
            setError(err.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f0f2f5"
        }}>
            <div style={{
                width: 380,
                padding: 40,
                background: "white",
                borderRadius: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}>
                <h2 style={{ textAlign: "center", marginBottom: 24, color: "#1a1a2e" }}>Admin Login</h2>

                {error && (
                    <div style={{
                        padding: 10,
                        background: "#fff5f5",
                        color: "#c53030",
                        borderRadius: 6,
                        fontSize: 13,
                        marginBottom: 20,
                        border: "1px solid #feb2b2"
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@example.com"
                            style={{
                                width: "100%", padding: "12px", border: "1px solid #ddd",
                                borderRadius: 8, outline: "none", boxSizing: "border-box"
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{
                                width: "100%", padding: "12px", border: "1px solid #ddd",
                                borderRadius: 8, outline: "none", boxSizing: "border-box"
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: "13px",
                            background: loading ? "#888" : "#3F51B5",
                            color: "white",
                            border: "none",
                            borderRadius: 8,
                            fontWeight: 700,
                            cursor: loading ? "not-allowed" : "pointer",
                            marginTop: 10,
                            boxShadow: "0 4px 10px rgba(63,81,181,0.2)"
                        }}
                    >
                        {loading ? "Logging in..." : "Login to Dashboard"}
                    </button>
                </form>
            </div>
        </div>
    );
}
