import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import AdminLayout from "./AdminLayout";
import { getAllOrdersAdmin, updateOrderStatus } from "../../services/orderService";
import { downloadFile } from "../../utils/downloadHelper";

interface Order {
    id: number;
    createdAt: string;
    totalAmount: number;
    quantity: number;
    status: string;
    paymentStatus: string;
    shippingAddress: string;
    user: {
        firstName: string;
        lastName: string;
        email: string;
    };
    product: {
        name: string;
    };
}

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        fetchOrders();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await getAllOrdersAdmin();
            setOrders(data);
        } catch (err: any) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.message || "Failed to fetch orders" });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId: number, newStatus: string) => {
        try {
            await updateOrderStatus(orderId, newStatus);
            Swal.fire({ icon: 'success', title: 'Updated', text: 'Status changed', timer: 1000, showConfirmButton: false });
            fetchOrders();
        } catch (err: any) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.message });
        }
    };

    const filteredOrders = orders.filter(order => 
        order.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${order.user.firstName} ${order.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toString().includes(searchTerm)
    );

    if (loading) return <AdminLayout><div>Loading orders...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div style={{ background: "white", borderRadius: 12, padding: isMobile ? 16 : 24, border: "1px solid #f1f5f9" }}>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>Order History</h2>
                        <button 
                            onClick={() => downloadFile(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/orders/admin/export`, 'orders_report.csv')}
                            style={{ padding: "8px 16px", background: "#ecfdf5", color: "#059669", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                        >
                            📊 Export Report
                        </button>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search ID, Product, Customer..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: "10px 16px", border: "1px solid #e2e8f0", borderRadius: 10, outline: "none", width: isMobile ? "100%" : 300, fontSize: 13 }} 
                    />
                </div>

                {isMobile ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {filteredOrders.map((order) => (
                            <div key={order.id} style={{ border: "1px solid #f1f5f9", borderRadius: 12, padding: 16, background: "#fafafa" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                                    <div>
                                        <div style={{ fontWeight: 700, color: "#1e293b" }}>Order #{order.id}</div>
                                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <span style={{ 
                                        padding: "4px 10px", 
                                        borderRadius: 20, 
                                        fontSize: 10, 
                                        fontWeight: 700,
                                        background: order.paymentStatus === 'Paid' ? "#ecfdf5" : "#fef2f2",
                                        color: order.paymentStatus === 'Paid' ? "#059669" : "#dc2626"
                                    }}>
                                        {order.paymentStatus.toUpperCase()}
                                    </span>
                                </div>
                                
                                <div style={{ marginBottom: 12 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{order.product.name}</div>
                                    <div style={{ fontSize: 12, color: "#64748b" }}>Customer: {order.user.firstName} {order.user.lastName}</div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: 12 }}>
                                    <div style={{ fontWeight: 700, fontSize: 16, color: "#1e293b" }}>${order.totalAmount}</div>
                                    <select 
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        style={{ 
                                            padding: "6px 10px", 
                                            border: "1px solid #e2e8f0", 
                                            borderRadius: 8, 
                                            fontSize: 11, 
                                            fontWeight: 600,
                                            background: "white", 
                                            color: order.status === 'Delivered' ? "#22c55e" : "#ea580c"
                                        }}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 1000 }}>
                            <thead>
                                <tr style={{ background: "#f8f9fa", textAlign: "left" }}>
                                    <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>Order Details</th>
                                    <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>Customer</th>
                                    <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>Product</th>
                                    <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>Amount</th>
                                    <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>Payment</th>
                                    <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>Status</th>
                                    <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                        <td style={{ padding: "16px 20px" }}>
                                            <div style={{ fontWeight: 600, color: "#1e293b" }}>#{order.id}</div>
                                            <div style={{ fontSize: 11, color: "#94a3b8" }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td style={{ padding: "16px 20px" }}>
                                            <div style={{ fontWeight: 500, color: "#334155" }}>{order.user.firstName} {order.user.lastName}</div>
                                            <div style={{ fontSize: 11, color: "#64748b" }}>{order.user.email}</div>
                                        </td>
                                        <td style={{ padding: "16px 20px" }}>
                                            <div style={{ fontWeight: 500, color: "#334155" }}>{order.product.name}</div>
                                            <div style={{ fontSize: 11, color: "#94a3b8" }}>Qty: {order.quantity}</div>
                                        </td>
                                        <td style={{ padding: "16px 20px" }}>
                                            <div style={{ fontWeight: 700, color: "#1e293b" }}>${order.totalAmount}</div>
                                        </td>
                                        <td style={{ padding: "16px 20px" }}>
                                            <span style={{ 
                                                padding: "4px 10px", 
                                                borderRadius: 20, 
                                                fontSize: 10, 
                                                fontWeight: 700,
                                                background: order.paymentStatus === 'Paid' ? "#ecfdf5" : "#fef2f2",
                                                color: order.paymentStatus === 'Paid' ? "#059669" : "#dc2626"
                                            }}>
                                                {order.paymentStatus.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: "16px 20px" }}>
                                            <select 
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                style={{ 
                                                    padding: "6px 12px", 
                                                    border: "1px solid #e2e8f0", 
                                                    borderRadius: 8, 
                                                    fontSize: 12, 
                                                    fontWeight: 600,
                                                    background: "white", 
                                                    outline: "none", 
                                                    cursor: "pointer",
                                                    color: order.status === 'Delivered' ? "#22c55e" : "#ea580c"
                                                }}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: "16px 20px" }}>
                                            <button 
                                                onClick={() => downloadFile(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/orders/${order.id}/invoice`, `invoice_${order.id}.pdf`)}
                                                style={{
                                                    background: "#f1f5f9",
                                                    border: "none",
                                                    padding: "8px 12px",
                                                    borderRadius: 8,
                                                    color: "#475569",
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    cursor: "pointer"
                                                }}
                                            >
                                                📄 Invoice
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
}
