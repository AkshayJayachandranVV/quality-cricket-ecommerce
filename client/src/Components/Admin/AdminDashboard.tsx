import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { getDashboardStats } from "../../services/dashboardApi";
import Swal from "sweetalert2";

interface DashboardData {
    totalEarning: number;
    totalSales: number;
    totalOrders: number;
    totalCustomers: number;
    todayTotalSale: number;
    recentOrders: any[];
    salesHistory: { date: string, total: string }[];
}

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        fetchStats();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchStats = async () => {
        try {
            const stats = await getDashboardStats();
            setData(stats);
        } catch (err: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || "Failed to fetch dashboard stats"
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading || !data) return <AdminLayout><div>Loading Dashboard...</div></AdminLayout>;

    const METRICS = [
        { label: "Total Earning", value: `$${data.totalEarning.toLocaleString()}`, bg: "#3F51B5", icon: "💰" },
        { label: "Total Sales", value: data.totalSales.toLocaleString(), bg: "#43a047", icon: "📈" },
        { label: "Orders", value: data.totalOrders.toLocaleString(), bg: "#fb8c00", icon: "📦" },
        { label: "Customers", value: data.totalCustomers.toLocaleString(), bg: "#00acc1", icon: "👥" },
        { label: "Today Sale", value: `$${data.todayTotalSale.toLocaleString()}`, bg: "#e53935", icon: "🛒" },
    ];

    const maxVal = Math.max(...data.salesHistory.map(d => parseFloat(d.total)), 100);
    const points = data.salesHistory.map((d, i) => {
        const x = (i / Math.max(data.salesHistory.length - 1, 1)) * 800;
        const y = 200 - (parseFloat(d.total) / maxVal) * 180;
        return `${x},${y}`;
    }).join(" ");

    return (
        <AdminLayout>
            <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 16 : 32 }}>

                {/* Metrics Grid */}
                <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
                    gap: isMobile ? 12 : 20 
                }}>
                    {METRICS.map((m, i) => (
                        <div key={i} style={{ 
                            background: "white", 
                            borderRadius: 12, 
                            padding: isMobile ? "16px" : "20px", 
                            display: "flex", 
                            alignItems: "center", 
                            gap: 16, 
                            border: "1px solid #f1f5f9",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.05)" 
                        }}>
                            <div style={{ 
                                width: isMobile ? 40 : 48, height: isMobile ? 40 : 48, 
                                background: m.bg, 
                                borderRadius: 12, 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center", 
                                fontSize: isMobile ? 18 : 20,
                                color: "white"
                            }}>
                                {m.icon}
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2, fontWeight: 500 }}>{m.label}</div>
                                <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: "#1e293b" }}>{m.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Chart Section */}
                <div style={{ background: "white", borderRadius: 12, border: "1px solid #f1f5f9", padding: isMobile ? "16px" : "24px" }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", marginBottom: 24, margin: 0 }}>Sales Performance</h2>
                    
                    <div style={{ height: 280, position: "relative", marginTop: 20 }}>
                        <div style={{ height: "100%", width: "100%", position: "relative", borderLeft: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9" }}>
                            <svg width="100%" height="80%" viewBox="0 0 800 200" preserveAspectRatio="none">
                                <polyline points={points} fill="none" stroke="#3F51B5" strokeWidth="4" strokeLinejoin="round" />
                                {data.salesHistory.map((d, i) => (
                                    <circle key={i} cx={(i / Math.max(data.salesHistory.length - 1, 1)) * 800} cy={200 - (parseFloat(d.total) / maxVal) * 180} r="5" fill="#3F51B5" />
                                ))}
                            </svg>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
                                {data.salesHistory.filter((_, idx) => !isMobile || idx % 2 === 0).map((d, i) => (
                                    <span key={i} style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{new Date(d.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Orders Table */}
                <div style={{ background: "white", borderRadius: 12, padding: isMobile ? "16px" : "24px", border: "1px solid #f1f5f9", overflow: "hidden" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: 0 }}>Recent Orders</h2>
                        <a href="/admin/orders" style={{ fontSize: 13, color: "#3F51B5", fontWeight: 600, textDecoration: "none" }}>View All</a>
                    </div>

                    <div style={{ overflowX: "auto", margin: isMobile ? "0 -16px" : 0 }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: 600 }}>
                            <thead>
                                <tr style={{ background: "#f8f9fa", color: "#64748b", fontSize: 12 }}>
                                    <th style={{ padding: "12px 16px", fontWeight: 600 }}>Order</th>
                                    <th style={{ padding: "12px 16px", fontWeight: 600 }}>Customer</th>
                                    <th style={{ padding: "12px 16px", fontWeight: 600 }}>Amount</th>
                                    <th style={{ padding: "12px 16px", fontWeight: 600 }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.recentOrders.map((order, index) => (
                                    <tr key={index} style={{ borderBottom: "1px solid #f1f5f9", fontSize: 13 }}>
                                        <td style={{ padding: "16px", fontWeight: 600 }}>#{order.id}</td>
                                        <td style={{ padding: "16px" }}>{order.user.firstName} {order.user.lastName}</td>
                                        <td style={{ padding: "16px", fontWeight: 700 }}>${order.totalAmount}</td>
                                        <td style={{ padding: "16px" }}>
                                            <span style={{ 
                                                padding: "6px 12px", 
                                                borderRadius: 20, 
                                                fontSize: 11, 
                                                fontWeight: 700,
                                                background: order.status === 'Delivered' ? "#ecfdf5" : "#fff7ed",
                                                color: order.status === 'Delivered' ? "#059669" : "#ea580c"
                                            }}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
