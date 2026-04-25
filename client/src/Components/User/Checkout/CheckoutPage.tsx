import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar from "../Shared/Navbar";
import Footer from "../Shared/Footer";
import { createCheckoutSession, verifyPayment, placeOrderWithWallet } from "../../../services/orderService";
import { getMyAddresses } from "../../../services/addressApi";
import { getWalletData } from "../../../services/walletApi";

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface Address {
    id: number;
    fullName: string;
    mobileNumber: string;
    pincode: string;
    flatHouse: string;
    areaStreet: string;
    landmark: string;
    townCity: string;
    state: string;
    country: string;
    isDefault: boolean;
}

export default function CheckoutPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { product, quantity: initialQuantity } = location.state || {};

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [currentStep, setCurrentStep] = useState<"summary" | "payment">("summary");

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

    const [quantity, setQuantity] = useState(initialQuantity || 1);
    const [loading, setLoading] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);
    const [useWallet, setUseWallet] = useState(false);

    useEffect(() => {
        const onResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", onResize);
        window.scrollTo(0, 0);

        fetchAddresses();
        fetchWalletBalance();

        // Load Razorpay Script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            window.removeEventListener("resize", onResize);
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const fetchWalletBalance = async () => {
        try {
            const data = await getWalletData();
            setWalletBalance(Number(data.balance) || 0);
        } catch (err) {
            console.error("Failed to fetch wallet balance", err);
        }
    };

    const fetchAddresses = async () => {
        try {
            const response = await getMyAddresses();
            setAddresses(response.addresses);
            // Auto select default address
            const defaultAddr = response.addresses.find((a: Address) => a.isDefault);
            if (defaultAddr) setSelectedAddressId(defaultAddr.id);
            else if (response.addresses.length > 0) setSelectedAddressId(response.addresses[0].id);
        } catch (err: any) {
            console.error(err);
        }
    };

    if (!product) {
        return (
            <div style={{ textAlign: "center", padding: 100 }}>
                <h2>No product selected for checkout</h2>
                <button onClick={() => navigate("/products")}>Go back to products</button>
            </div>
        );
    }

    const isMobile = windowWidth < 768;
    const API_BASE = process.env.REACT_APP_IMAGE_BASE_URL || 'http://localhost:5000';

    const getProductImage = (imageUrlsJson: string) => {
        try {
            const urls = imageUrlsJson ? JSON.parse(imageUrlsJson) : [];
            return urls && urls.length > 0 ? `${API_BASE}${urls[0]}` : "";
        } catch (e) {
            return "";
        }
    };

    const selectedAddress = addresses.find(a => a.id === selectedAddressId);

    const handleRazorpayPayment = async () => {
        if (!selectedAddress) {
            Swal.fire({ icon: 'warning', title: 'Address Needed', text: 'Please select a delivery address' });
            return;
        }

        setLoading(true);
        try {
            const fullAddressStr = `${selectedAddress.fullName}, ${selectedAddress.flatHouse}, ${selectedAddress.areaStreet}, ${selectedAddress.townCity}, ${selectedAddress.state} - ${selectedAddress.pincode}. Mobile: ${selectedAddress.mobileNumber}`;

            const session = await createCheckoutSession({
                productId: product.id,
                quantity: quantity,
                shippingAddress: fullAddressStr
            });

            const options = {
                key: session.key_id,
                amount: session.amount,
                currency: session.currency,
                name: "Quality Cricket",
                description: `Payment for ${product.name}`,
                order_id: session.razorpayOrderId,
                handler: async function (response: any) {
                    try {
                        await verifyPayment({
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            signature: response.razorpay_signature
                        });
                        Swal.fire({
                            icon: 'success',
                            title: 'Order Placed!',
                            text: 'Your order has been placed successfully.',
                            confirmButtonColor: '#3F51B5'
                        });
                        navigate("/account/orders");
                    } catch (err: any) {
                        Swal.fire({ icon: 'error', title: 'Payment Failed', text: err.message, confirmButtonColor: '#3F51B5' });
                    }
                },
                prefill: {
                    name: selectedAddress.fullName,
                    contact: selectedAddress.mobileNumber
                },
                theme: { color: "#3F51B5" }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err: any) {
            Swal.fire({ icon: 'error', title: 'Checkout Error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleWalletPayment = async () => {
        if (!selectedAddress) {
            Swal.fire({ icon: 'warning', title: 'Address Needed', text: 'Please select a delivery address' });
            return;
        }

        setLoading(true);
        try {
            const fullAddressStr = `${selectedAddress.fullName}, ${selectedAddress.flatHouse}, ${selectedAddress.areaStreet}, ${selectedAddress.townCity}, ${selectedAddress.state} - ${selectedAddress.pincode}. Mobile: ${selectedAddress.mobileNumber}`;

            await placeOrderWithWallet({
                productId: product.id,
                quantity: quantity,
                shippingAddress: fullAddressStr
            });

            Swal.fire({
                icon: 'success',
                title: 'Order Placed!',
                text: 'Paid successfully using your wallet balance.',
                confirmButtonColor: '#3F51B5'
            });
            navigate("/account/orders");
        } catch (err: any) {
            Swal.fire({ icon: 'error', title: 'Payment Failed', text: err.message, confirmButtonColor: '#3F51B5' });
        } finally {
            setLoading(false);
        }
    };

    const unitPrice = Number(product.basePrice) * (1 - (product.discountPercentage || 0) / 100);
    const totalPrice = unitPrice * quantity;
    const walletUsedAmount = useWallet ? Math.min(totalPrice, walletBalance) : 0;
    const finalPayable = totalPrice - walletUsedAmount;

    return (
        <div style={{ fontFamily: "'Inter', sans-serif", background: "#f8fafc", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar />

            <main style={{ flex: 1, maxWidth: 1200, margin: "0 auto", padding: isMobile ? "20px 16px" : "40px 24px", width: "100%", boxSizing: "border-box" }}>

                <h1 style={{ textAlign: "center", fontSize: isMobile ? 24 : 32, fontWeight: 800, color: "#1e293b", margin: "0 0 40px" }}>Secure Checkout</h1>

                <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 40, alignItems: "flex-start" }}>

                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>

                        {/* 1. Address Section */}
                        <div style={{ background: "white", padding: 24, borderRadius: 16, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#eef2ff", color: "#3F51B5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>1</div>
                                    <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#1e293b" }}>Shipping Address</h2>
                                </div>
                                <button onClick={() => setIsAddressModalOpen(true)} style={{ background: "none", border: "none", color: "#3F51B5", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                                    {addresses.length === 0 ? "+ Add Address" : "Change"}
                                </button>
                            </div>

                            {selectedAddress ? (
                                <div style={{ padding: "16px 20px", background: "#f8fafc", borderRadius: 12, border: "1px solid #f1f5f9" }}>
                                    <div style={{ fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>{selectedAddress.fullName}</div>
                                    <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.5 }}>
                                        {selectedAddress.flatHouse}, {selectedAddress.areaStreet}, {selectedAddress.townCity}, {selectedAddress.state} - {selectedAddress.pincode}
                                    </div>
                                    <div style={{ fontSize: 13, color: "#475569", marginTop: 8, fontWeight: 500 }}>📱 {selectedAddress.mobileNumber}</div>
                                </div>
                            ) : (
                                <div style={{ padding: 20, textAlign: "center", color: "#94a3b8", fontSize: 14, border: "2px dashed #e2e8f0", borderRadius: 12 }}>
                                    No address selected. Please add or select an address.
                                </div>
                            )}
                        </div>

                        {/* 2. Order Summary */}
                        <div style={{ background: "white", padding: 24, borderRadius: 16, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#eef2ff", color: "#3F51B5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>2</div>
                                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#1e293b" }}>Order Summary</h2>
                            </div>

                            <div style={{ display: "flex", gap: 24, flexDirection: isMobile ? "column" : "row" }}>
                                <div style={{ width: 120, height: 120, background: "#f8fafc", borderRadius: 12, padding: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <img src={getProductImage(product.imageUrls)} alt={product.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 8px" }}>{product.name}</h3>
                                    <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>Category: {product.category}</div>

                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                                        <div>
                                            <div style={{ fontSize: 18, fontWeight: 800, color: "#3F51B5" }}>$ {unitPrice.toFixed(2)}</div>
                                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                                <span style={{ fontSize: 13, color: "#94a3b8", textDecoration: "line-through" }}>$ {Number(product.basePrice).toFixed(2)}</span>
                                                <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}>{product.discountPercentage}% Instant Discount</span>
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#f1f5f9", padding: "6px 12px", borderRadius: 8 }}>
                                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 18, color: "#64748b" }}>−</button>
                                            <span style={{ minWidth: 20, textAlign: "center", fontWeight: 700, color: "#1e293b" }}>{quantity}</span>
                                            <button onClick={() => setQuantity(quantity + 1)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 18, color: "#64748b" }}>+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Payment Button */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {useWallet && walletBalance >= totalPrice ? (
                                <button
                                    disabled={loading || !selectedAddress}
                                    onClick={handleWalletPayment}
                                    style={{
                                        width: "100%",
                                        padding: "18px",
                                        background: (loading || !selectedAddress) ? "#e2e8f0" : "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                                        color: "white",
                                        border: "none",
                                        borderRadius: 16,
                                        fontWeight: 800,
                                        cursor: (loading || !selectedAddress) ? "default" : "pointer",
                                        fontSize: 16,
                                        boxShadow: (loading || !selectedAddress) ? "none" : "0 10px 15px -3px rgba(5, 150, 105, 0.4)",
                                    }}
                                >
                                    {loading ? "Processing..." : `Pay $${totalPrice.toFixed(2)} from Wallet`}
                                </button>
                            ) : (
                                <button
                                    disabled={loading || !selectedAddress}
                                    onClick={handleRazorpayPayment}
                                    style={{
                                        width: "100%",
                                        padding: "18px",
                                        background: (loading || !selectedAddress) ? "#e2e8f0" : "linear-gradient(135deg, #3F51B5 0%, #5C6BC0 100%)",
                                        color: (loading || !selectedAddress) ? "#94a3b8" : "white",
                                        border: "none",
                                        borderRadius: 16,
                                        fontWeight: 800,
                                        cursor: (loading || !selectedAddress) ? "default" : "pointer",
                                        fontSize: 16,
                                        boxShadow: (loading || !selectedAddress) ? "none" : "0 10px 15px -3px rgba(63, 81, 181, 0.4)",
                                    }}
                                >
                                    {loading ? "Preparing Payment..." : `Pay $${finalPayable.toFixed(2)} with Razorpay`}
                                </button>
                            )}
                            {!selectedAddress && <p style={{ fontSize: 12, color: "#ef4444", textAlign: "center", margin: 0, fontWeight: 500 }}>⚠️ Please select a delivery address to continue</p>}
                        </div>
                    </div>

                    {/* Price Sidebar */}
                    <aside style={{ width: isMobile ? "100%" : 350, background: "white", borderRadius: 20, padding: 24, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", height: "fit-content" }}>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", margin: "0 0 24px", borderBottom: "1px solid #f1f5f9", paddingBottom: 16 }}>Price Summary</h3>

                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#64748b" }}>
                                <span>Subtotal ({quantity} units)</span>
                                <span style={{ fontWeight: 600, color: "#1e293b" }}>$ {(Number(product.basePrice) * quantity).toFixed(2)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#64748b" }}>
                                <span>Shipping Fee</span>
                                <span style={{ fontWeight: 700, color: "#22c55e" }}>FREE</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#64748b" }}>
                                <span>Tax (Calculated at checkout)</span>
                                <span style={{ fontWeight: 600, color: "#1e293b" }}>$ 0.00</span>
                            </div>

                            {walletBalance > 0 && (
                                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: 16, borderRadius: 12, marginTop: 8 }}>
                                    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                                        <input 
                                            type="checkbox" 
                                            checked={useWallet} 
                                            onChange={e => setUseWallet(e.target.checked)} 
                                            style={{ width: 18, height: 18, accentColor: "#059669" }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: "#166534" }}>Use Wallet Balance</div>
                                            <div style={{ fontSize: 12, color: "#15803d" }}>Available: ${walletBalance.toFixed(2)}</div>
                                        </div>
                                    </label>
                                </div>
                            )}

                            <div style={{ marginTop: 8, paddingTop: 20, borderTop: "2px dashed #f1f5f9", display: "flex", flexDirection: "column", gap: 12 }}>
                                {useWallet && walletUsedAmount > 0 && (
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#059669", fontWeight: 600 }}>
                                        <span>Wallet Applied</span>
                                        <span>− $ {walletUsedAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: 16, fontWeight: 800, color: "#1e293b" }}>Final Payable</span>
                                    <span style={{ fontSize: 22, fontWeight: 900, color: "#3F51B5" }}>$ {finalPayable.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 32, padding: 16, background: "#f8fafc", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ fontSize: 20 }}>🛡️</div>
                            <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.4 }}>
                                <span style={{ fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 2 }}>Secure Transaction</span>
                                Payments are processed securely via SSL and Razorpay.
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            {/* Address Selection Modal */}
            {isAddressModalOpen && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}>
                    <div style={{ background: "white", width: "100%", maxWidth: 600, borderRadius: 24, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", overflow: "hidden" }}>
                        <div style={{ padding: "24px 32px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1e293b" }}>Select Delivery Address</h2>
                            <button onClick={() => setIsAddressModalOpen(false)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#94a3b8" }}>✕</button>
                        </div>

                        <div style={{ padding: 32, maxHeight: "70vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
                            {addresses.length === 0 ? (
                                <div style={{ textAlign: "center", padding: 40 }}>
                                    <p style={{ color: "#64748b", marginBottom: 20 }}>You haven't saved any addresses yet.</p>
                                    <button onClick={() => navigate("/account/addresses")} style={{ padding: "12px 24px", background: "#3F51B5", color: "white", borderRadius: 12, border: "none", fontWeight: 700, cursor: "pointer" }}>Add New Address</button>
                                </div>
                            ) : (
                                addresses.map(addr => (
                                    <div
                                        key={addr.id}
                                        onClick={() => { setSelectedAddressId(addr.id); setIsAddressModalOpen(false); }}
                                        style={{
                                            padding: 20,
                                            border: selectedAddressId === addr.id ? "2px solid #3F51B5" : "1px solid #e2e8f0",
                                            borderRadius: 16,
                                            cursor: "pointer",
                                            background: selectedAddressId === addr.id ? "#f5f7ff" : "white",
                                            transition: "all 0.2s"
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                            <span style={{ fontWeight: 700, color: "#1e293b" }}>{addr.fullName}</span>
                                            {addr.isDefault && <span style={{ fontSize: 10, background: "#3F51B5", color: "white", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>Default</span>}
                                        </div>
                                        <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
                                            {addr.flatHouse}, {addr.areaStreet}, {addr.townCity}, {addr.state} - {addr.pincode}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div style={{ padding: 24, background: "#f8fafc", textAlign: "center", borderTop: "1px solid #f1f5f9" }}>
                            <button onClick={() => navigate("/account/addresses")} style={{ background: "none", border: "none", color: "#3F51B5", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>+ Manage Addresses</button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
