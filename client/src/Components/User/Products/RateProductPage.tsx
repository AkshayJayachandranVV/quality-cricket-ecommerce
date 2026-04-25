import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Shared/Navbar";
import Footer from "../Shared/Footer";
import { getProductById, createReview } from "../../../services/productApi";

export default function RateProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [product, setProduct] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const API_BASE = process.env.REACT_APP_IMAGE_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    window.scrollTo(0, 0);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (id) fetchProductData(id);
  }, [id]);

  const fetchProductData = async (productId: string) => {
    try {
      const response = await getProductById(Number(productId));
      setProduct(response.product);
    } catch (err) {
      console.error("Failed to fetch product", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Rating Required',
        text: 'Please select a rating star.'
      });
      return;
    }
    if (!comment.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Review Required',
        text: 'Please enter your review comments.'
      });
      return;
    }

    setSubmitting(true);
    try {
      await createReview({
        productId: Number(id),
        rating,
        comment
      });
      Swal.fire({
        icon: 'success',
        title: 'Review Submitted',
        text: 'Thank you for your feedback!',
        timer: 2000,
        showConfirmButton: false
      });
      navigate(`/product/${id}`);
    } catch (err: any) {
      console.error("Failed to submit review", err);
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: err.message || "Failed to submit review. Please make sure you are logged in."
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isMobile = windowWidth < 768;

  if (loading) return <Navbar />;
  if (!product) return <div style={{ textAlign: "center", padding: 100 }}>Product Not Found</div>;

  const getFirstImage = () => {
    try {
      const urls = JSON.parse(product.imageUrls || "[]");
      return urls.length > 0 ? `${API_BASE}${urls[0]}` : "";
    } catch (e) {
      return "";
    }
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", background: "#e8eaed", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: 1000, margin: "0 auto", padding: isMobile ? "20px 12px" : "32px 24px", width: "100%", boxSizing: "border-box" }}>

        <div style={{ display: "flex", alignItems: "center", position: "relative", marginBottom: 32 }}>
          <span onClick={() => navigate(-1)} style={{ cursor: "pointer", fontWeight: 600, fontSize: 16, color: "#333", position: "absolute", left: 0 }}>
            ‹ back
          </span>
          <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, color: "#444", margin: "0 auto", textAlign: "center" }}>
            Ratings & Reviews
          </h1>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "#222", margin: 0 }}>Share your experience</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, color: "#333", marginBottom: 4 }}>{product.name}</div>
            </div>
            <div style={{ width: 40, height: 40, background: "white", padding: 4, borderRadius: 4 }}>
              <img src={getFirstImage()} alt="Thumb" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
          </div>
        </div>

        <div style={{ background: "white", borderRadius: 8, display: "flex", flexDirection: isMobile ? "column" : "row", overflow: "hidden", minHeight: 400, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>

          <div style={{ width: isMobile ? "100%" : "35%", padding: "32px 24px", borderRight: isMobile ? "none" : "1px solid #eee", borderBottom: isMobile ? "1px solid #eee" : "none" }}>
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#333", margin: "0 0 8px 0" }}>Have you used this product?</h3>
              <p style={{ fontSize: 13, color: "#555", margin: 0, lineHeight: 1.5 }}>
                Your review should be about your experience with the product.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#333", margin: "0 0 8px 0" }}>Why review products?</h3>
              <p style={{ fontSize: 13, color: "#555", margin: 0, lineHeight: 1.5 }}>
                Your valuable feedback will help fellow shoppers decide!
              </p>
            </div>
          </div>

          <div style={{ flex: 1, padding: "32px 32px 48px", display: "flex", flexDirection: "column" }}>

            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#333", margin: "0 0 12px 0" }}>Rate this product</h3>
            <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    fontSize: 32,
                    color: rating >= star ? "#ffc107" : "#ccc",
                    cursor: "pointer",
                    transition: "color 0.2s"
                  }}
                >
                  {rating >= star ? "★" : "☆"}
                </span>
              ))}
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#333", margin: "0 0 12px 0" }}>Review this product</h3>
            <textarea
              placeholder="Enter product review"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{
                flex: 1, minHeight: 180, padding: 16, borderRadius: 8,
                border: "none", background: "#f5f6ff",
                fontFamily: "inherit", fontSize: 14, color: "#333", outline: "none", resize: "none",
                marginBottom: 24
              }}
            />

            <div>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  padding: "14px 64px",
                  background: submitting ? "#ccc" : "#3F51B5",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  fontWeight: 600,
                  cursor: submitting ? "default" : "pointer",
                  fontSize: 15
                }}
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
