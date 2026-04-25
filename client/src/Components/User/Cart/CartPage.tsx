import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar from "../Shared/Navbar";
import Footer from "../Shared/Footer";
import { getCart, removeFromCart } from "../../../services/orderService";
import { getAllProducts } from "../../../services/productApi";

export default function CartPage() {
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.REACT_APP_IMAGE_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    window.scrollTo(0, 0);
    fetchCart();
    fetchRecommendations();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const fetchRecommendations = async () => {
    try {
      const data = await getAllProducts();
      setRecommendations(data.products || []);
    } catch (err) {
      console.error("Failed to fetch recommendations", err);
    }
  };

  const fetchCart = async () => {
    setLoading(true);
    try {
      const data = await getCart();
      setCartItems(data);
    } catch (err: any) {
      console.error("Failed to fetch cart", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: number) => {
    try {
      await removeFromCart(id);
      setCartItems(cartItems.filter(item => item.id !== id));
      Swal.fire({
        icon: 'success',
        title: 'Removed!',
        text: 'Product removed from cart',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to remove: ' + err.message
      });
    }
  };

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const recommendedCols = windowWidth >= 1024 ? 4 : isTablet ? 3 : 2;

  const getProductImage = (imageUrlsJson: string) => {
    try {
      const urls = imageUrlsJson ? JSON.parse(imageUrlsJson) : [];
      return urls && urls.length > 0 ? `${API_BASE}${urls[0]}` : "";
    } catch (e) {
      return "";
    }
  };

  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const productCard = (cardId: number): React.CSSProperties => ({
    background: "transparent",
    overflow: "hidden",
    border: hoveredProduct === cardId ? "2px solid #2196f3" : "2px solid transparent",
    transition: "border 0.1s ease",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
  });

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", background: "#fdfdfd", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: 1200, margin: "0 auto", padding: isMobile ? "20px 12px" : "48px 24px", width: "100%", boxSizing: "border-box" }}>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: 40 }}>
          <h1 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 600, color: "#333", margin: 0 }}>
            Your Cart
          </h1>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 50 }}>Loading your cart...</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 64 }}>
            {cartItems.length > 0 ? (
              cartItems.map((item) => {
                const p = item.product;
                return (
                  <div key={item.id} style={{ border: "1px solid #ddd", borderRadius: 8, overflow: "hidden", background: "white" }}>
                    <div style={{ background: "#f8f9fa", padding: "12px 24px", display: "flex", justifyContent: "space-between", fontSize: 13, color: "#555" }}>
                      <div>Cart Item <span style={{ fontWeight: 600, color: "#333" }}>ID: {item.id}</span></div>
                      <div style={{ color: "#e91e63", cursor: "pointer", fontWeight: 600 }} onClick={() => handleRemove(item.id)}>
                        REMOVE
                      </div>
                    </div>

                    <div style={{ padding: "24px", display: "flex", flexDirection: isMobile ? "column" : "row", gap: 24, alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 24, flex: 1 }}>
                        <div style={{ width: 100, height: 100, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <img src={getProductImage(p.imageUrls)} alt={p.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: 16, fontWeight: 500, color: "#1a1a2e", margin: "0 0 8px 0" }}>{p.name}</h3>
                          <div style={{ fontSize: 13, color: "#4361ee", marginBottom: 8 }}>{p.discountPercentage}% off</div>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                            <span style={{ fontSize: 18, fontWeight: 700, color: "#222" }}>$ {(p.basePrice * (1 - p.discountPercentage / 100)).toFixed(2)}</span>
                            <span style={{ fontSize: 13, color: "#888", textDecoration: "line-through" }}>${Number(p.basePrice).toFixed(2)}</span>
                            <span style={{ fontSize: 13, color: "#888" }}>Qty: {item.quantity}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 12 }}>
                        <button onClick={() => navigate("/checkout", { state: { product: p, quantity: item.quantity } })} style={{ padding: "12px 32px", background: "#3F51B5", color: "white", border: "none", borderRadius: 4, fontWeight: 600, cursor: "pointer", fontSize: 15 }}>
                          Checkout Now
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "#f9f9f9", borderRadius: 8 }}>
                <h2 style={{ color: "#888", fontWeight: 400 }}>Your cart is empty</h2>
                <button onClick={() => navigate("/products")} style={{ marginTop: 20, padding: "12px 24px", background: "#4361ee", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}>
                  Browse Products
                </button>
              </div>
            )}
          </div>
        )}

        <div style={{ borderTop: "1px solid #eee", paddingTop: 48 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <h2 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 500, color: "#111", margin: 0 }}>Recommended For You</h2>
            <button onClick={() => navigate("/products")} style={{ padding: "10px 24px", background: "white", border: "1px solid #ddd", color: "#333", borderRadius: 4, fontWeight: 500, cursor: "pointer", fontSize: 13 }}>
              Continue shopping
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: `repeat(${recommendedCols}, 1fr)`, gap: 16 }}>
            {recommendations.slice(0, recommendedCols).map((p) => (
              <div key={p.id} onClick={() => navigate(`/product/${p.id}`)} style={productCard(p.id)} onMouseEnter={() => setHoveredProduct(p.id)} onMouseLeave={() => setHoveredProduct(null)}>
                <div style={{ position: "relative", padding: "16px", display: "flex", justifyContent: "center", alignItems: "center", height: isMobile ? 140 : 200 }}>
                  <img src={getProductImage(p.imageUrls)} alt={p.name} style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} />
                </div>
                <div style={{ padding: "10px 8px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 8, justifyContent: "space-between" }}>
                  <p style={{ fontSize: 12, color: "#333", margin: 0, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.name}</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#3F51B5" }}>$ {(p.basePrice * (1 - (p.discountPercentage || 0) / 100)).toFixed(2)}</span>
                    <span style={{ fontSize: 11, color: "#999", textDecoration: "line-through" }}>${Number(p.basePrice).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
