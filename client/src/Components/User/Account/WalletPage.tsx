import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Shared/Navbar";
import Footer from "../Shared/Footer";
import { getWalletData } from "../../../services/walletApi";

interface Transaction {
    id: number;
    amount: string;
    type: 'Credit' | 'Debit';
    description: string;
    createdAt: string;
    orderId?: number;
}

export default function WalletPage() {
    const navigate = useNavigate();
    const [balance, setBalance] = useState<number>(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchWalletInfo();
    }, []);

    const fetchWalletInfo = async () => {
        try {
            const data = await getWalletData();
            setBalance(Number(data.balance));
            setTransactions(data.transactions);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ fontFamily: "'Inter', sans-serif", background: "#f8fafc", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar />

            <div style={{ background: "linear-gradient(135deg, #3F51B5 0%, #1a237e 100%)", color: "white", padding: "60px 24px", textAlign: "center" }}>
                <p style={{ margin: 0, opacity: 0.8, fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Total Balance</p>
                <h1 style={{ margin: "12px 0 0", fontSize: 48, fontWeight: 800 }}>${balance.toFixed(2)}</h1>
            </div>

            <main style={{ flex: 1, maxWidth: 800, margin: "0 auto", padding: "40px 24px", width: "100%", boxSizing: "border-box" }}>
                
                <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <button 
                        onClick={() => navigate(-1)} 
                        style={{ background: "none", border: "none", color: "#64748b", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}
                    >
                        ← Back
                    </button>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1e293b" }}>Transaction History</h2>
                </div>

                <div style={{ background: "white", borderRadius: 20, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                    {loading ? (
                        <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Loading transactions...</div>
                    ) : transactions.length === 0 ? (
                        <div style={{ padding: 60, textAlign: "center" }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>💸</div>
                            <h3 style={{ margin: 0, color: "#1e293b" }}>No transactions yet</h3>
                            <p style={{ color: "#64748b", marginTop: 8 }}>Your wallet activity will appear here.</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            {transactions.map((tx, idx) => (
                                <div key={tx.id} style={{ 
                                    padding: "20px 24px", 
                                    borderBottom: idx === transactions.length - 1 ? "none" : "1px solid #f1f5f9",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}>
                                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                                        <div style={{ 
                                            width: 40, 
                                            height: 40, 
                                            borderRadius: 12, 
                                            background: tx.type === 'Credit' ? "#ecfdf5" : "#fff1f2",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: tx.type === 'Credit' ? "#059669" : "#e11d48",
                                            fontWeight: 800,
                                            fontSize: 20
                                        }}>
                                            {tx.type === 'Credit' ? "↓" : "↑"}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: "#1e293b", fontSize: 15 }}>{tx.description}</div>
                                            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{new Date(tx.createdAt).toLocaleDateString()} at {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                    </div>
                                    <div style={{ 
                                        fontWeight: 700, 
                                        fontSize: 16, 
                                        color: tx.type === 'Credit' ? "#059669" : "#e11d48" 
                                    }}>
                                        {tx.type === 'Credit' ? "+" : "-"}${Number(tx.amount).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ marginTop: 40, background: "#f1f5f9", padding: 24, borderRadius: 16, border: "1px solid #e2e8f0" }}>
                    <h3 style={{ margin: "0 0 8px 0", fontSize: 16, fontWeight: 700, color: "#1e293b" }}>How it works?</h3>
                    <ul style={{ margin: 0, padding: "0 0 0 20px", color: "#64748b", fontSize: 13, lineHeight: 1.6 }}>
                        <li>Cancellations and returns are automatically refunded to your wallet.</li>
                        <li>You can use your wallet balance to pay for new orders during checkout.</li>
                        <li>Wallet refunds are instant and can be reused immediately.</li>
                    </ul>
                </div>

            </main>

            <Footer />
        </div>
    );
}
