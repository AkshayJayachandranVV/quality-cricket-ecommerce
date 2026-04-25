import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Navbar from "../Shared/Navbar";
import { submitContactForm } from "../../../services/contactApi";

export default function ContactUsPage() {
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contact: "",
    message: ""
  });

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    window.scrollTo(0, 0);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.message) {
        Swal.fire({ icon: 'warning', title: 'Missing Info', text: 'Please fill in all required fields.' });
        return;
    }

    setLoading(true);
    try {
        await submitContactForm(formData);
        Swal.fire({
            icon: 'success',
            title: 'Message Sent!',
            text: 'Our team will get back to you within 24 hours.',
            confirmButtonColor: '#3F51B5'
        });
        setFormData({ fullName: "", email: "", contact: "", message: "" });
        navigate("/home");
    } catch (err: any) {
        Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    } finally {
        setLoading(false);
    }
  };

  const isMobile = windowWidth < 768;

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", background: "#fdfdfd", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: 1000, margin: "0 auto", padding: isMobile ? "20px 12px" : "48px 24px", width: "100%", boxSizing: "border-box" }}>
        
        {/* Header section with back button */}
        <div style={{ display: "flex", alignItems: "center", position: "relative", marginBottom: 48 }}>
            <span onClick={() => navigate(-1)} style={{ cursor: "pointer", fontWeight: 600, fontSize: 16, color: "#333", position: "absolute", left: 0 }}>
                ‹ back
            </span>
            <h1 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 500, color: "#333", margin: "0 auto", textAlign: "center" }}>
                Contact Us
            </h1>
        </div>

        {/* Content Split Container */}
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 32, minHeight: 400 }}>
            
            {/* Left Column: Address Information */}
            <div style={{ flex: 1, padding: "20px 0" }}>
                <h2 style={{ fontSize: 20, color: "#3F51B5", margin: "0 0 16px 0", fontWeight: 600 }}>ADDRESS</h2>
                <div style={{ fontSize: 14, color: "#333", textDecoration: "underline", marginBottom: 12 }}>Main office:</div>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 32 }}>
                    {/* Left block of the left block */}
                    <div style={{ display: "flex", gap: 8, flex: 1 }}>
                        <div style={{ fontSize: 16, color: "#555", marginTop: 2 }}>📍</div>
                        <div style={{ fontSize: 14, color: "#333", lineHeight: 1.5 }}>
                            123 Cricket Lane, Stadium District, Mumbai, Maharashtra 400001
                        </div>
                    </div>
                    {/* Right block of the left block (Phones) */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16, flexShrink: 0 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14, fontWeight: 600, color: "#333" }}>
                            <span style={{ fontSize: 14, color: "#555" }}>📞</span> +91 9876543210
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14, fontWeight: 600, color: "#333" }}>
                            <span style={{ fontSize: 14, color: "#555" }}>📞</span> +91 9876543211
                        </div>
                    </div>
                </div>

                <div style={{ fontSize: 14, color: "#222", fontWeight: 500 }}>
                    Write to us at <span style={{ color: "#3F51B5" }}>qualitycricket@gmail.com</span>
                </div>
            </div>

            {/* Right Column: Quote Form */}
            <div style={{ flex: 1, background: "#f8f9ff", borderRadius: 16, padding: isMobile ? "24px" : "32px 40px", boxSizing: "border-box", border: "1px solid #eef2ff" }}>
                <h2 style={{ textAlign: "center", fontSize: 22, fontWeight: 600, color: "#222", margin: "0 0 8px 0" }}>Get a quote</h2>
                <p style={{ textAlign: "center", fontSize: 13, color: "#666", margin: "0 0 24px 0" }}>Fill up the form and our Team will get back to you within 24 hours.</p>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    
                    <div style={{ display: "flex", gap: 16, flexDirection: isMobile ? "column" : "row" }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#444", marginBottom: 6 }}>Full Name</label>
                            <input 
                                type="text" 
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                placeholder="Enter Full name" 
                                style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: 8, outline: "none", boxSizing: "border-box" }} 
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#444", marginBottom: 6 }}>Email</label>
                            <input 
                                type="email" 
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter email" 
                                style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: 8, outline: "none", boxSizing: "border-box" }} 
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#444", marginBottom: 6 }}>Contact number</label>
                        <input 
                            type="text" 
                            name="contact"
                            value={formData.contact}
                            onChange={handleInputChange}
                            placeholder="Enter contact number" 
                            style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: 8, outline: "none", boxSizing: "border-box" }} 
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#444", marginBottom: 6 }}>Message</label>
                        <textarea 
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            placeholder="Enter your message" 
                            style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: 8, outline: "none", boxSizing: "border-box", minHeight: "120px", resize: "none", fontFamily: "inherit" }} 
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        style={{ marginTop: 8, padding: "12px 32px", background: loading ? "#cbd5e1" : "#3F51B5", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: loading ? "default" : "pointer", fontSize: 14, boxShadow: loading ? "none" : "0 4px 6px -1px rgba(63, 81, 181, 0.2)" }}>
                        {loading ? "Sending..." : "Send"}
                    </button>
                    
                </form>
            </div>
        </div>

      </main>
    </div>
  );
}
