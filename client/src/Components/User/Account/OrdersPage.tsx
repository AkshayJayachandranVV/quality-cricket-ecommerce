import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Shared/Navbar";
import Footer from "../Shared/Footer";
import { getMyOrders, cancelOrder, returnOrder } from "../../../services/orderService";
import { downloadFile } from "../../../utils/downloadHelper";
import Swal from "sweetalert2";

export default function OrdersPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const API_BASE = process.env.REACT_APP_IMAGE_BASE_URL || 'http://localhost:5000';

    useEffect(() => {
        const onResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", onResize);
        window.scrollTo(0, 0);
        fetchOrders();
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await getMyOrders();
            setOrders(data);
        } catch (err: any) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'Failed to fetch orders' });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (id: number) => {
        const result = await Swal.fire({
            title: 'Cancel Order?',
            text: "Are you sure you want to cancel this order? The amount will be refunded to your wallet.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, cancel it!'
        });

        if (result.isConfirmed) {
            try {
                await cancelOrder(id);
                await fetchOrders();
                Swal.fire('Cancelled!', 'Your order has been cancelled and refunded.', 'success');
            } catch (err: any) {
                Swal.fire('Error', err.message, 'error');
            }
        }
    };

    const handleReturnOrder = async (id: number) => {
        const result = await Swal.fire({
            title: 'Return Order?',
            text: "Do you want to return this product? The amount will be instantly refunded to your wallet.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3F51B5',
            confirmButtonText: 'Yes, return it!'
        });

        if (result.isConfirmed) {
            try {
                await returnOrder(id);
                await fetchOrders();
                Swal.fire('Returned!', 'Return processed and amount refunded to wallet.', 'success');
            } catch (err: any) {
                Swal.fire('Error', err.message, 'error');
            }
        }
    };

    const getProductImage = (imageUrlsJson: string) => {
        try {
            const urls = imageUrlsJson ? JSON.parse(imageUrlsJson) : [];
            return urls && urls.length > 0 ? `${API_BASE}${urls[0]}` : "https://via.placeholder.com/200";
        } catch (e) {
            return "https://via.placeholder.com/200";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Delivered': return '#4caf50';
            case 'Shipped': return '#2196f3';
            case 'Processing': return '#ff9800';
            case 'Cancelled': return '#f44336';
            default: return '#9e9e9e';
        }
    };

    const isMobile = windowWidth < 768;

    return (
        <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", background: "#f8f9fa", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar />

            <main style={{ flex: 1, maxWidth: 1000, margin: "40px auto", padding: "0 20px", width: "100%", boxSizing: "border-box" }}>
                <div style={{ display: "flex", alignItems: "center", position: "relative", marginBottom: 32 }}>
                    <span onClick={() => navigate(-1)} style={{ cursor: "pointer", fontWeight: 600, fontSize: 16, color: "#333", position: "absolute", left: 0 }}>
                        ‹ back
                    </span>
                    <h1 style={{ fontSize: isMobile ? 24 : 28, fontWeight: 700, color: "#1a1a2e", margin: "0 auto", textAlign: "center" }}>
                        My Orders
                    </h1>
                </div>

                {loading ? (
                    <div style={{ textAlign: "center", padding: "100px 0" }}>
                        <div className="spinner"></div>
                        <p style={{ marginTop: 16, color: "#666" }}>Loading your orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div style={{ textAlign: "center", background: "white", padding: "80px 40px", borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                        <div style={{ fontSize: 64, marginBottom: 20 }}>📦</div>
                        <h2 style={{ color: "#333", marginBottom: 12 }}>No orders found</h2>
                        <p style={{ color: "#666", marginBottom: 32 }}>Looks like you haven't placed any orders yet.</p>
                        <button
                            onClick={() => navigate('/products')}
                            style={{ padding: "12px 32px", background: "#43A047", color: "white", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        {orders.map((order) => (
                            <div key={order.id} style={{ background: "white", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid #edf2f7" }}>
                                <div style={{ padding: "16px 24px", background: "#f8fafd", borderBottom: "1px solid #edf2f7", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                                    <div style={{ display: "flex", gap: isMobile ? 16 : 32, flexWrap: "wrap" }}>
                                        <div>
                                            <p style={{ fontSize: 11, color: "#718096", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>Order Placed</p>
                                            <p style={{ fontSize: 13, color: "#2d3748", fontWeight: 500 }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: 11, color: "#718096", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>Total</p>
                                            <p style={{ fontSize: 13, color: "#2d3748", fontWeight: 600 }}>${order.totalAmount}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: 11, color: "#718096", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>Ship To</p>
                                            <p style={{ fontSize: 13, color: "#4A5568", fontWeight: 500, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{order.shippingAddress || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: isMobile ? "left" : "right" }}>
                                        <p style={{ fontSize: 11, color: "#718096", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>Order ID</p>
                                        <p style={{ fontSize: 13, color: "#2d3748", fontWeight: 500 }}>#{order.razorpayOrderId || order.id}</p>
                                    </div>
                                </div>
                                <div style={{ padding: isMobile ? "16px" : "24px", display: "flex", flexDirection: isMobile ? "column" : "row", gap: 24, alignItems: "flex-start" }}>
                                    <div style={{ width: isMobile ? "100%" : 120, height: 120, flexShrink: 0, border: "1px solid #edf2f7", borderRadius: 8, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "white" }}>
                                        <img
                                            src={getProductImage(order.product?.imageUrls)}
                                            alt={order.product?.name}
                                            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", flexDirection: isMobile ? "column" : "row", gap: 16 }}>
                                            <div>
                                                <h3 onClick={() => navigate(`/product/${order.productId}`)} style={{ fontSize: 17, color: "#1a202c", marginBottom: 8, fontWeight: 600, cursor: "pointer" }}>{order.product?.name}</h3>
                                                <p style={{ fontSize: 14, color: "#4a5568", marginBottom: 16 }}>Qty: {order.quantity}</p>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: getStatusColor(order.status) }}></span>
                                                    <span style={{ fontSize: 15, fontWeight: 600, color: getStatusColor(order.status) }}>{order.status}</span>
                                                </div>
                                            </div>
                                            <div style={{ display: "flex", flexDirection: isMobile ? "row" : "column", gap: 12, minWidth: 150 }}>
                                                <button
                                                    onClick={() => navigate(`/product/${order.productId}`)}
                                                    style={{ flex: 1, padding: "10px 16px", background: "white", color: "#4351B5", border: "1px solid #4351B5", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: 13 }}
                                                >
                                                    View Details
                                                </button>
                                                {['Pending', 'Processing', 'Shipped'].includes(order.status) && (
                                                    <button
                                                        onClick={() => handleCancelOrder(order.id)}
                                                        style={{ flex: 1, padding: "10px 16px", background: "#fff1f2", color: "#e11d48", border: "1px solid #e11d48", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: 13 }}
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                                {order.status === 'Delivered' && (
                                                    <button
                                                        onClick={() => handleReturnOrder(order.id)}
                                                        style={{ flex: 1, padding: "10px 16px", background: "#f8fafc", color: "#334155", border: "1px solid #334155", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: 13 }}
                                                    >
                                                        Return
                                                    </button>
                                                )}
                                                {order.status === 'Delivered' && (
                                                    <button
                                                        onClick={() => navigate(`/rate-product/${order.productId}`)}
                                                        style={{ flex: 1, padding: "10px 16px", background: "#4351B5", color: "white", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: 13 }}
                                                    >
                                                        Rate
                                                    </button>
                                                )}
                                                {order.paymentStatus === 'Paid' && (
                                                    <button
                                                        onClick={() => downloadFile(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/orders/${order.id}/invoice`, `invoice_${order.id}.pdf`)}
                                                        style={{ flex: 1, padding: "10px 16px", background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: 13 }}
                                                    >
                                                        Invoice
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
            <style>{`
                .spinner {
                    border: 4px solid rgba(0, 0, 0, 0.1);
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    border-left-color: #4351B5;
                    animation: spin 1s linear infinite;
                    display: inline-block;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
