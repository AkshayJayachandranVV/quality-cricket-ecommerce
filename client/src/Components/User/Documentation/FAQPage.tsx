import React, { useState, useEffect } from 'react';
import Navbar from '../Shared/Navbar';
import Footer from '../Shared/Footer';

interface FAQ {
    id: number;
    question: string;
    answer: string;
    category: string;
}

export default function FAQPage() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        try {
            const response = await fetch(`${API_URL}/faqs`);
            const data = await response.json();
            setFaqs(data);
        } catch (err) {
            console.error("Failed to fetch FAQs", err);
        } finally {
            setLoading(false);
        }
    };

    const categories = Array.from(new Set(faqs.map(f => f.category)));

    const filteredFaqs = faqs.filter(f => 
        f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ background: "#f8f9fa", minHeight: "100vh" }}>
            <Navbar />
            
            <div style={{ maxWidth: 900, margin: "60px auto", padding: "0 20px" }}>
                <div style={{ textAlign: "center", marginBottom: 50 }}>
                    <h1 style={{ fontSize: 36, fontWeight: 800, color: "#1a1a2e", marginBottom: 16 }}>How can we help?</h1>
                    <div style={{ position: "relative", maxWidth: 600, margin: "0 auto" }}>
                        <input 
                            type="text" 
                            placeholder="Search for questions..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ 
                                width: "100%", 
                                padding: "18px 24px", 
                                borderRadius: 50, 
                                border: "none", 
                                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                                fontSize: 16,
                                outline: "none"
                            }} 
                        />
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: "center" }}>Loading FAQs...</div>
                ) : (
                    categories.map(cat => {
                        const catFaqs = filteredFaqs.filter(f => f.category === cat);
                        if (catFaqs.length === 0) return null;

                        return (
                            <div key={cat} style={{ marginBottom: 40 }}>
                                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#3F51B5", marginBottom: 20, textTransform: "uppercase", letterSpacing: 1 }}>{cat}</h2>
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {catFaqs.map(faq => (
                                        <div key={faq.id} style={{ background: "white", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                                            <button 
                                                onClick={() => setActiveIndex(activeIndex === faq.id ? null : faq.id)}
                                                style={{ 
                                                    width: "100%", 
                                                    padding: "20px 24px", 
                                                    textAlign: "left", 
                                                    border: "none", 
                                                    background: "none", 
                                                    display: "flex", 
                                                    justifyContent: "space-between", 
                                                    alignItems: "center",
                                                    cursor: "pointer",
                                                    fontWeight: 600,
                                                    color: "#334155",
                                                    fontSize: 16
                                                }}
                                            >
                                                {faq.question}
                                                <span style={{ transition: "transform 0.2s", transform: activeIndex === faq.id ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
                                            </button>
                                            {activeIndex === faq.id && (
                                                <div style={{ padding: "0 24px 20px", color: "#64748b", lineHeight: 1.6, fontSize: 15 }}>
                                                    {faq.answer}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                )}

                {!loading && filteredFaqs.length === 0 && (
                    <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
                        No results found for your search.
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
