import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import banner from "../../../assets/Home/home-banner.jpg"
import bannerLeft from "../../../assets/Home/banner-left.png"
import bannerRight from "../../../assets/Home/banner-right.png"
import product1 from "../../../assets/Home/product-1.png"
import product2 from "../../../assets/Home/product-2.png"
import product3 from "../../../assets/Home/product-3.png"
import product4 from "../../../assets/Home/product-4.png"
import product5 from "../../../assets/Home/product-5.png"
import about from "../../../assets/Home/footer-right.jpg"
import map from "../../../assets/Home/map.png"
import logo from "../../../assets/logo.png"

import Navbar from "../Shared/Navbar";
import Footer from "../Shared/Footer";
import { ALL_PRODUCTS, REVIEWS, FILTER_TABS } from "../Shared/dummyData";

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All Products");
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [bannerSlide, setBannerSlide] = useState(0);
  const [email, setEmail] = useState("");
  const [scrollTop, setScrollTop] = useState(false);

  const API_BASE = process.env.REACT_APP_IMAGE_BASE_URL || 'http://localhost:5000';

  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const onResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobile(width < 992);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };
    const onScroll = () => setScrollTop(window.scrollY > 400);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll);
    
    // Initial check
    onResize();
    
    return () => { 
      window.removeEventListener("resize", onResize); 
      window.removeEventListener("scroll", onScroll); 
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setBannerSlide((p) => (p + 1) % 3), 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/products`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  const cols = isDesktop ? 5 : isTablet ? 3 : 2;
  const topSellerCols = isDesktop ? 5 : isTablet ? 3 : 2;

  const filteredProducts =
    activeFilter === "All Products"
      ? products
      : products.filter((p) => {
        const name = p.name?.toUpperCase() || "";
        const cat = p.category?.toUpperCase() || "";

        if (activeFilter === "MRF") return name.includes("MRF");
        if (activeFilter === "SS TON") return name.includes("SS") || name.includes("TON");
        if (activeFilter === "Cricket Bats") return cat.includes("BAT") || name.includes("BAT");
        if (activeFilter === "Accessories") return cat.includes("ACCESSOR") || name.includes("ACCESSOR") || cat.includes("KIT") || name.includes("KIT");
        return p.category === activeFilter;
      });

  const getProductImage = (imageUrlsJson: string) => {
    try {
      const urls = imageUrlsJson ? JSON.parse(imageUrlsJson) : [];
      return urls && urls.length > 0 ? `${API_BASE}${urls[0]}` : product1;
    } catch (e) {
      return product1;
    }
  };

  // ── Reusable styles ──
  const sectionTitle: React.CSSProperties = {
    textAlign: "center",
    fontSize: isMobile ? 22 : 28,
    fontWeight: 700,
    color: "#1a1a2e",
    marginBottom: isMobile ? 20 : 32,
    fontFamily: "Georgia, 'Times New Roman', serif",
    letterSpacing: "-0.3px",
  };

  const productCard = (id: number): React.CSSProperties => ({
    background: "transparent",
    overflow: "hidden",
    border: hoveredProduct === id ? "2px solid #2196f3" : "2px solid transparent",
    transition: "border 0.1s ease",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
  });

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", background: "#f7f8fc", minHeight: "100vh", width: "100%", overflowX: "hidden" }}>

      {/* ═══════════════════════════ NAVBAR ═══════════════════════════ */}
      <Navbar />

      {/* ═══════════════════════════ HERO BANNER ═══════════════════════════ */}
      <div style={{ width: "100%", padding: isMobile ? "0 8px" : "0 20px", boxSizing: "border-box", maxWidth: 1800, margin: "0 auto", marginTop: 12 }}>
        <div style={{
          position: "relative", width: "100%", aspectRatio: "1397 / 483",
          overflow: "hidden", background: "#1a1a2e", borderRadius: 4,
          display: "flex", justifyContent: "center"
        }}>

          {/* Main Background */}
          <img src={banner} alt="stadium background" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />

          {/* Left Decors: approx 300x300 */}
          <img src={bannerLeft} alt="" style={{
            position: "absolute", bottom: "0%", left: "1%",
            width: "21.4%", maxHeight: "62%",
            objectFit: "contain", zIndex: 1, objectPosition: "bottom left"
          }} />

          {/* Right Decors: approx 200x201 */}
          <img src={bannerRight} alt="" style={{
            position: "absolute", bottom: "0%", right: "1%",
            width: "40.3%", maxHeight: "42%",
            objectFit: "contain", zIndex: 1, objectPosition: "bottom right"
          }} />

          {/* Center Text Group (Skewed) */}
          <div style={{
            position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "2.5%", zIndex: 2,
            width: "max-content", height: "100%"
          }}>
            {/* Top White Line */}
            <div style={{ width: "90%", height: 3, background: "white", alignSelf: "flex-start", marginBottom: isMobile ? 0 : "1%", transform: "translateX(-10%)" }} />

            {/* PREMIUM Box */}
            <div style={{
              background: "linear-gradient(87.3deg, #3F51B5 3.47%, #BC67B6 123.24%)",
              width: isMobile ? "60vw" : "23.7vw", maxWidth: 332, height: isMobile ? "20%" : "24%", minHeight: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
              transform: "skewX(-12deg)", borderRadius: 2
            }}>
              <span style={{
                color: "white", fontSize: "clamp(16px, 4vw, 52px)", fontWeight: 900,
                textTransform: "uppercase", letterSpacing: isMobile ? 1 : 2, transform: "skewX(12deg)"
              }}>
                PREMIUM
              </span>
            </div>

            {/* Cricket Accessories Text */}
            <div style={{ padding: "0", margin: "1% 0" }}>
              <span style={{ color: "white", fontSize: "clamp(12px, 2.5vw, 32px)", fontWeight: 700, textShadow: "0 2px 4px rgba(0,0,0,0.6)", textAlign: "center" }}>
                Cricket Accessories
              </span>
            </div>

            {/* Buy Now Box */}
            <div style={{
              background: "linear-gradient(87.3deg, #3F51B5 3.47%, #BC67B6 123.24%)",
              padding: isMobile ? "1.5% 6%" : "2% 8%", display: "inline-flex", alignItems: "center", justifyContent: "center",
              transform: "skewX(-12deg)", cursor: "pointer", borderRadius: 2
            }}>
              <span style={{ color: "white", fontSize: "clamp(12px, 1.8vw, 24px)", fontWeight: 800, transform: "skewX(12deg)" }}>
                Buy Now
              </span>
            </div>

            {/* Bottom White Line */}
            <div style={{ width: "60%", height: 3, background: "white", alignSelf: "flex-end", marginTop: isMobile ? 0 : "1%", transform: "translateX(10%)" }} />
          </div>

          {/* Product Cards Centered Over Grass */}
          <div style={{
            position: "absolute", bottom: "4%", left: "50%", transform: "translateX(-50%)",
            display: "flex", gap: "1.2vw", zIndex: 3, width: "max-content"
          }}>
            {[product1, product2, product3, product4, product5, product1].map((img, i) => (
              <div key={i} style={{
                width: "clamp(40px, 6.5vw, 90px)",
                height: "clamp(40px, 6.5vw, 90px)",
                background: "white", borderRadius: "clamp(4px, 0.8vw, 12px)", padding: "0.5vw",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)"
              }}>
                <img src={img} alt={`Featured product ${i}`} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ═══════════════════════════ TOP SELLERS ═══════════════════════════ */}
      <section style={{ padding: isMobile ? "36px 16px" : "52px 20px", maxWidth: 1800, margin: "0 auto", width: "100%" }}>
        <h2 style={sectionTitle}>Top Sellers</h2>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: isMobile ? 12 : 20, marginBottom: isMobile ? 24 : 40 }}>
          {products.slice(0, cols).map((p) => (
            <div key={p.id} onClick={() => navigate(`/product/${p.id}`)} style={productCard(p.id)} onMouseEnter={() => setHoveredProduct(p.id)} onMouseLeave={() => setHoveredProduct(null)}>
              <div style={{ position: "relative", padding: "16px", display: "flex", justifyContent: "center", alignItems: "center", height: isMobile ? 140 : 200 }}>
                <img src={getProductImage(p.imageUrls)} alt={p.name} style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} />
              </div>
              <div style={{ padding: "10px 8px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ fontSize: isMobile ? 11 : 12, color: "#333", margin: 0, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.name}</p>

                {/* Badges mimicking screenshot */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ background: "#4351B5", color: "white", fontSize: 10, padding: "3px 6px", borderRadius: 2 }}>
                    {p.discountPercentage}% off
                  </span>
                  <span style={{ color: "#4351B5", fontSize: 11, fontWeight: 500 }}>Deal of the Day</span>
                </div>

                {/* Price */}
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontSize: isMobile ? 13 : 15, fontWeight: 700, color: "#4351B5" }}>$ {(p.basePrice * (1 - p.discountPercentage / 100)).toFixed(2)}</span>
                  <span style={{ fontSize: 11, color: "#999", textDecoration: "line-through" }}>$ {Number(p.basePrice).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════ FEATURED PRODUCTS ═══════════════════════════ */}
      <section style={{ padding: isMobile ? "0 16px 40px" : "0 20px 60px", maxWidth: 1800, margin: "0 auto", width: "100%" }}>
        <h2 style={sectionTitle}>Featured Products</h2>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: isMobile ? 8 : 12, flexWrap: "wrap", justifyContent: "center", marginBottom: isMobile ? 20 : 32 }}>
          {FILTER_TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveFilter(tab)} style={{
              padding: isMobile ? "7px 14px" : "8px 32px",
              borderRadius: 50,
              border: activeFilter === tab ? "1px solid #3F51B5" : "1px solid #ccc",
              background: activeFilter === tab ? "#3F51B5" : "white",
              color: activeFilter === tab ? "white" : "#555",
              fontSize: isMobile ? 12 : 13,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: activeFilter === tab ? "0 4px 12px rgba(67,97,238,0.3)" : "none",
              transition: "all 0.2s",
            }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Products grid */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: isMobile ? 12 : 20 }}>
          {filteredProducts.map((p) => (
            <div key={p.id} onClick={() => navigate(`/product/${p.id}`)} style={productCard(p.id)} onMouseEnter={() => setHoveredProduct(p.id)} onMouseLeave={() => setHoveredProduct(null)}>
              <div style={{ position: "relative", padding: "16px", display: "flex", justifyContent: "center", alignItems: "center", height: isMobile ? 140 : 200, background: "white", borderRadius: 4 }}>
                <img src={getProductImage(p.imageUrls)} alt={p.name} style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} />
              </div>
              <div style={{ padding: "10px 8px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 8, justifyContent: "space-between" }}>
                <p style={{ fontSize: isMobile ? 11 : 12, color: "#333", margin: 0, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.name}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontSize: isMobile ? 13 : 15, fontWeight: 700, color: "#4351B5" }}>$ {(p.basePrice * (1 - p.discountPercentage / 100)).toFixed(2)}</span>
                  <span style={{ fontSize: 11, color: "#999", textDecoration: "line-through" }}>${Number(p.basePrice).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All button */}
        <div style={{ textAlign: "center", marginTop: isMobile ? 28 : 40 }}>
          <button
            onClick={() => navigate("/products")}
            style={{
              background: "#4361ee", color: "white", border: "none",
              padding: isMobile ? "11px 36px" : "13px 48px",
              borderRadius: 50, fontSize: isMobile ? 13 : 15, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 6px 20px rgba(67,97,238,0.35)",
            }}>
            View All
          </button>
        </div>
      </section>

      {/* ═══════════════════════════ ABOUT US ═══════════════════════════ */}
      <section style={{ background: "white", padding: isMobile ? "40px 16px" : "64px 20px" }}>
        <div style={{ maxWidth: 1800, margin: "0 auto" }}>
          <h2 style={sectionTitle}>About Us</h2>
          <div style={{ display: "flex", gap: isMobile ? 0 : 48, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "center" : "flex-start" }}>

            {/* Illustration / Image area */}
            <div style={{ flexShrink: 0, position: "relative", minWidth: isMobile ? "auto" : 400, maxWidth: 450, marginTop: isMobile ? 50 : 70 }}>
              <img src={logo} alt="QC Logo" style={{ position: "absolute", top: isMobile ? -40 : -50, left: "50%", transform: "translateX(-50%)", width: isMobile ? 110 : 140, height: "auto", objectFit: "contain", zIndex: 1 }} />
              <img src={about} alt="About Quality Cricket illustration" style={{ width: "100%", height: "auto", objectFit: "contain", display: "block" }} />
            </div>

            {/* Text content */}
            <div style={{ flex: 1, marginTop: isMobile ? 50 : 70 }}>
              <p style={{ fontSize: isMobile ? 15 : 17, fontWeight: 700, color: "#1a1a2e", marginBottom: 12, lineHeight: 1.5 }}>
                Select your Bat from our collection of 100's of actual pictures with weights.
              </p>
              <p style={{ fontSize: isMobile ? 13 : 14, color: "#666", lineHeight: 1.8, marginBottom: 20 }}>
                Every Bat that arrives in the UAE is weighed, catalogued and uploaded on Crickettable with their actual weight and pictures. All Items listed online are in stock in the UAE and will be packed & delivered within 48 hours.
              </p>

              <h4 style={{ fontSize: isMobile ? 15 : 16, fontWeight: 700, color: "#1a1a2e", marginBottom: 8 }}>Who Are We?</h4>
              <p style={{ fontSize: isMobile ? 13 : 14, color: "#666", lineHeight: 1.8, marginBottom: 20 }}>
                We are the authorised dealers of MRF Sports Equipment & SS Sports (Sareen Sports Industries) in the UAE. We provide cricketers an easy-to-shop, safe and secure experience with fast deliveries at their doorstep.
              </p>

              <h4 style={{ fontSize: isMobile ? 15 : 16, fontWeight: 700, color: "#1a1a2e", marginBottom: 8 }}>Why you should buy from us?</h4>
              <p style={{ fontSize: isMobile ? 13 : 14, color: "#666", lineHeight: 1.8 }}>
                Being a 100% Dubai based e-commerce business and sourcing our products direct from the manufacturer, we keep our overheads low and pass on these savings to our customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ CUSTOMER REVIEWS ═══════════════════════════ */}
      <section style={{ padding: isMobile ? "40px 16px" : "64px 20px", background: "#f7f8fc" }}>
        <div style={{ maxWidth: 1800, margin: "0 auto" }}>
          <h2 style={sectionTitle}>Customer Reviews</h2>
          <p style={{ textAlign: "center", color: "#888", fontSize: 14, marginTop: -20, marginBottom: isMobile ? 24 : 36 }}>What our customer say about quality cricket</p>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: isMobile ? 16 : 20 }}>
            {REVIEWS.map((review) => (
              <div key={review.id} style={{ background: "white", borderRadius: 12, padding: isMobile ? 18 : 22, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontSize: 28, color: "#4361ee", fontFamily: "Georgia, serif", lineHeight: 1, opacity: 0.5 }}>"</div>
                <p style={{ fontSize: 12, color: "#666", lineHeight: 1.7, flex: 1 }}>{review.text}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 10, borderTop: "1px solid #f0f0f0" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #4361ee, #3a0ca3)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                    {review.avatar}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>{review.name}</p>
                    <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} style={{ fontSize: 11, color: s <= review.rating ? "#f6ad55" : "#ddd" }}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ FOOTER ═══════════════════════════ */}
      <Footer />

    </div>
  );
}
