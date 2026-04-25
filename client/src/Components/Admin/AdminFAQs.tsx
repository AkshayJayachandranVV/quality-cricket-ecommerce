import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import Swal from "sweetalert2";

interface FAQ {
    id: number;
    question: string;
    answer: string;
    category: string;
}

export default function AdminFAQs() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showModal, setShowModal] = useState(false);
    const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
    const [formData, setFormData] = useState({ question: "", answer: "", category: "General" });

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const token = localStorage.getItem("token");

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        fetchFaqs();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchFaqs = async () => {
        try {
            const response = await fetch(`${API_URL}/faqs`);
            const data = await response.json();
            setFaqs(data);
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: "Failed to fetch FAQs" });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingFaq ? `${API_URL}/faqs/${editingFaq.id}` : `${API_URL}/faqs`;
            const method = editingFaq ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                Swal.fire({ icon: 'success', title: editingFaq ? 'Updated' : 'Created', timer: 1500, showConfirmButton: false });
                setShowModal(false);
                setEditingFaq(null);
                setFormData({ question: "", answer: "", category: "General" });
                fetchFaqs();
            }
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: "Operation failed" });
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Delete FAQ?',
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await fetch(`${API_URL}/faqs/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                fetchFaqs();
                Swal.fire('Deleted!', 'FAQ has been removed.', 'success');
            } catch (err) {
                Swal.fire('Error', 'Deletion failed', 'error');
            }
        }
    };

    const filteredFaqs = faqs.filter(f => 
        f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div style={{ background: "white", borderRadius: 12, padding: isMobile ? 16 : 24, border: "1px solid #f1f5f9" }}>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>FAQ Management</h2>
                        <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Manage help articles and documentation</p>
                    </div>
                    <div style={{ display: "flex", gap: 12, width: isMobile ? "100%" : "auto" }}>
                        <input 
                            type="text" 
                            placeholder="Search FAQs..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: "10px 16px", border: "1px solid #e2e8f0", borderRadius: 8, outline: "none", flex: 1, fontSize: 13 }} 
                        />
                        <button 
                            onClick={() => { setEditingFaq(null); setFormData({ question: "", answer: "", category: "General" }); setShowModal(true); }}
                            style={{ padding: "10px 20px", background: "#3F51B5", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
                        >
                            + New FAQ
                        </button>
                    </div>
                </div>

                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
                        <thead>
                            <tr style={{ background: "#f8f9fa", textAlign: "left" }}>
                                <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>Category</th>
                                <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>Question</th>
                                <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFaqs.map((faq) => (
                                <tr key={faq.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                    <td style={{ padding: "16px 20px" }}>
                                        <span style={{ padding: "4px 10px", borderRadius: 8, background: "#f1f5f9", color: "#475569", fontSize: 11, fontWeight: 600 }}>{faq.category}</span>
                                    </td>
                                    <td style={{ padding: "16px 20px", fontSize: 14, color: "#1e293b", fontWeight: 500 }}>{faq.question}</td>
                                    <td style={{ padding: "16px 20px" }}>
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <button 
                                                onClick={() => { setEditingFaq(faq); setFormData({ question: faq.question, answer: faq.answer, category: faq.category }); setShowModal(true); }}
                                                style={{ padding: "6px 12px", background: "#ecfdf5", color: "#059669", border: "none", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(faq.id)}
                                                style={{ padding: "6px 12px", background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Modal */}
                {showModal && (
                    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 20 }}>
                        <div style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 600, padding: 32, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
                            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>{editingFaq ? 'Edit FAQ' : 'Create New FAQ'}</h3>
                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Category</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        style={{ width: "100%", padding: "12px", borderRadius: 8, border: "1px solid #e2e8f0", outline: "none" }}
                                    />
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Question</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={formData.question}
                                        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                        style={{ width: "100%", padding: "12px", borderRadius: 8, border: "1px solid #e2e8f0", outline: "none" }}
                                    />
                                </div>
                                <div style={{ marginBottom: 24 }}>
                                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Answer</label>
                                    <textarea 
                                        required 
                                        value={formData.answer}
                                        onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                        style={{ width: "100%", padding: "12px", borderRadius: 8, border: "1px solid #e2e8f0", outline: "none", minHeight: 120, resize: "vertical" }}
                                    />
                                </div>
                                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowModal(false)}
                                        style={{ padding: "12px 24px", borderRadius: 8, border: "1px solid #e2e8f0", background: "white", fontWeight: 600, cursor: "pointer" }}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        style={{ padding: "12px 24px", borderRadius: 8, border: "none", background: "#3F51B5", color: "white", fontWeight: 600, cursor: "pointer" }}
                                    >
                                        {editingFaq ? 'Update FAQ' : 'Create FAQ'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
}
