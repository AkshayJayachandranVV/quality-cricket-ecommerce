import React from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Navbar from "../Shared/Navbar";

export default function SecurityPage() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", background: "#eaeaea", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: 1000, margin: "0 auto", padding: "32px 24px", width: "100%", boxSizing: "border-box", position: "relative" }}>
        
        {/* Header section with back button */}
        <div style={{ marginBottom: 48 }}>
            <span onClick={() => navigate(-1)} style={{ cursor: "pointer", fontWeight: 600, fontSize: 16, color: "#333" }}>
                ‹ back
            </span>
        </div>

        {/* Centered Modal Content Container */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ background: "white", width: "100%", maxWidth: 450, padding: "32px", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
                <h1 style={{ textAlign: "center", margin: "0 0 32px 0", fontSize: 24, fontWeight: 500, color: "#222" }}>Login & security</h1>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div>
                        <label style={{ display: "block", fontSize: 13, color: "#777", marginBottom: 6 }}>Name</label>
                        <input type="text" defaultValue="Prana Shukla" style={{ width: "100%", padding: "12px", border: "1px solid #ccc", borderRadius: 4, outline: "none", boxSizing: "border-box", fontSize: 14, color: "#333" }} />
                    </div>
                    
                    <div>
                        <label style={{ display: "block", fontSize: 13, color: "#777", marginBottom: 6 }}>Mobile Number</label>
                        <input type="text" defaultValue="6325632563" style={{ width: "100%", padding: "12px", border: "1px solid #ccc", borderRadius: 4, outline: "none", boxSizing: "border-box", fontSize: 14, color: "#333" }} />
                    </div>
                    
                    <div>
                        <label style={{ display: "block", fontSize: 13, color: "#777", marginBottom: 6 }}>Email</label>
                        <input type="email" defaultValue="pranayshukla@gmail.com" style={{ width: "100%", padding: "12px", border: "1px solid #ccc", borderRadius: 4, outline: "none", boxSizing: "border-box", fontSize: 14, color: "#333" }} />
                    </div>
                    
                    <button 
                        onClick={() => {
                            Swal.fire({
                                icon: 'success',
                                title: 'Profile Updated',
                                text: 'Your profile has been updated successfully.',
                                timer: 2000,
                                showConfirmButton: false
                            });
                            navigate("/account");
                        }} 
                        style={{ marginTop: 16, width: "100%", padding: "14px", background: "#3F51B5", color: "white", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: 15 }}>
                        Save
                    </button>
                </div>
            </div>
        </div>

      </main>
    </div>
  );
}
