import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Shared/Navbar";
import Footer from "../Shared/Footer";
import Swal from "sweetalert2";
import { getProductById } from "../../../services/productApi";
import { addToCart } from "../../../services/orderService";

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [product, setProduct] = useState<any>(null);
  const [activeImage, setActiveImage] = useState<string>("");
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.REACT_APP_IMAGE_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) fetchProductData(id);
  }, [id]);

  const fetchProductData = async (productId: string) => {
    setLoading(true);
    try {
      const response = await getProductById(Number(productId));
      const p = response.product;
      setProduct(p);

      let images: string[] = [];
      try {
        images = JSON.parse(p.imageUrls || "[]");
      } catch (e) { }

      if (images.length > 0) {
        setActiveImage(`${API_BASE}${images[0]}`);
      }
    } catch (err) {
      console.error("Failed to fetch product", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, 1);
      Swal.fire({
        icon: 'success',
        title: 'Added to Cart',
        text: 'Product has been added to your cart successfully!',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: err.message || "Failed to add to cart. Please log in."
      });
    }
  };

  const handleBuyNow = () => {
    navigate("/checkout", { state: { product, quantity: 1 } });
  };

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;
  const relatedCols = isDesktop ? 4 : isTablet ? 3 : 2;

  const getImages = (urlJson: string) => {
    try {
      return JSON.parse(urlJson || "[]").map((url: string) => `${API_BASE}${url}`);
    } catch (e) {
      return [];
    }
  };

  const productCard = (cardId: number): React.CSSProperties => ({
    background: "transparent",
    overflow: "hidden",
    border: hoveredProduct === cardId ? "2px solid #2196f3" : "2px solid transparent",
    transition: "border 0.1s ease",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
  });

  if (loading) return <Navbar />;
  if (!product) return <div style={{ textAlign: "center", padding: 100 }}>Product Not Found</div>;

  const productImages = getImages(product.imageUrls);
  const reviews = product.reviews || [];
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", background: "#f1f3f6", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: 1200, margin: "0 auto", padding: isMobile ? "20px 12px" : "32px 24px", width: "100%", boxSizing: "border-box" }}>

        <div style={{ background: "white", padding: isMobile ? "24px 16px" : "32px", borderRadius: 4, display: "flex", flexDirection: isMobile ? "column" : "row", gap: 40, marginBottom: 20 }}>

          <div style={{ display: "flex", flexDirection: "column", gap: 24, width: isMobile ? "100%" : "45%", flexShrink: 0 }}>
            <div style={{ display: "flex", flexDirection: isMobile ? "column-reverse" : "row", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: isMobile ? "row" : "column", gap: 12, overflowX: "auto" }}>
                {productImages.map((imgUrl: string, idx: number) => (
                  <div key={idx}
                    onMouseEnter={() => setActiveImage(imgUrl)}
                    style={{
                      width: 80, height: 90, border: activeImage === imgUrl ? "2px solid #4361ee" : "1px solid #eee",
                      padding: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4
                    }}>
                    <img src={imgUrl} alt="Thumbnail" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                  </div>
                ))}
              </div>

              <div style={{ flex: 1, border: "1px solid #f0f0f0", padding: 24, display: "flex", alignItems: "center", justifyContent: "center", height: isMobile ? 300 : 460 }}>
                <img src={activeImage} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 16, paddingLeft: isMobile ? 0 : 108 }}>
              <button onClick={handleAddToCart} style={{ flex: 1, padding: "14px 0", background: "#4361ee", color: "white", fontWeight: 700, border: "none", borderRadius: 4, cursor: "pointer", fontSize: 15 }}>
                Add to Cart
              </button>
              <button onClick={handleBuyNow} style={{ flex: 1, padding: "14px 0", background: "#3F51B5", color: "white", fontWeight: 700, border: "none", borderRadius: 4, cursor: "pointer", fontSize: 15 }}>
                Buy Now
              </button>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 500, color: "#1a1a2e", marginTop: 0, marginBottom: 16, lineHeight: 1.3 }}>
              {product.name}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ color: "#4361ee", fontSize: 20, fontWeight: 600 }}>{product.discountPercentage}% off</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: "#222" }}>$ {(product.basePrice * (1 - product.discountPercentage / 100)).toFixed(2)}</span>
            </div>

            <div style={{ fontSize: 13, color: "#777", marginBottom: 6 }}>
              M.R.P : <span style={{ textDecoration: "line-through" }}>${Number(product.basePrice).toFixed(2)}</span>
            </div>

            <div style={{ fontSize: 13, color: "#333", marginBottom: 32 }}>
              Inclusive of all taxes
            </div>

            <div style={{ borderTop: "1px solid #eee", paddingTop: 24, marginBottom: 32 }}>
              <p style={{ fontSize: 14, color: "#333", lineHeight: 1.6 }}>{product.description}</p>
              <ul style={{ listStyle: "disc", paddingLeft: 20, marginTop: 16, fontSize: 14, color: "#444" }}>
                <li>Category: {product.category}</li>
                <li>SKU: {product.sku}</li>
                {product.size && <li>Size: {product.size}</li>}
                {product.color && <li>Color: {product.color}</li>}
              </ul>
            </div>
          </div>
        </div>

        <div style={{ background: "white", padding: isMobile ? "24px 16px" : "32px", borderRadius: 4, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <h2 style={{ fontSize: 22, fontWeight: 500, margin: 0 }}>Rating & Reviews</h2>
            <button onClick={() => navigate(`/rate-product/${product.id}`)} style={{ padding: "10px 24px", background: "white", border: "1px solid #e0e0e0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", fontWeight: 600, fontSize: 14, cursor: "pointer", borderRadius: 4 }}>
              Write a Review
            </button>
          </div>

          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 48, marginBottom: 40, justifyContent: "center" }}>
              <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 32 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 42, color: "#222", lineHeight: 1 }}>{averageRating} <span style={{ fontSize: 24, verticalAlign: "top" }}>★</span></div>
                  <div style={{ fontSize: 13, color: "#777", marginTop: 8 }}>{reviews.length} total reviews</div>
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 32, display: "flex", flexDirection: "column", gap: 32 }}>
              {reviews.map((r: any, idx: number) => (
                <div key={idx} style={{ borderBottom: idx < reviews.length - 1 ? "1px solid #f0f0f0" : "none", paddingBottom: idx < reviews.length - 1 ? 32 : 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ background: r.rating >= 4 ? "#388e3c" : "#f57c00", color: "white", fontSize: 12, fontWeight: 600, padding: "2px 6px", borderRadius: 4 }}>
                      {r.rating} ★
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 500, color: "#222" }}>{r.user?.firstName} {r.user?.lastName}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "#444", lineHeight: 1.6, margin: "0 0 8px 0" }}>{r.comment}</p>
                  <span style={{ fontSize: 11, color: "#888" }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
              {reviews.length === 0 && <div style={{ textAlign: "center", color: "#888" }}>No reviews yet. Be the first to review!</div>}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
