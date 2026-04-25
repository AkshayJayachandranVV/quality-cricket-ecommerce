import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import map from "../../../assets/Home/map.png"

export default function Footer() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [email, setEmail] = useState("");
  const [scrollTop, setScrollTop] = useState(false);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    const onScroll = () => setScrollTop(window.scrollY > 400);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll);
    return () => { window.removeEventListener("resize", onResize); window.removeEventListener("scroll", onScroll); };
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  return (
    <>
      <footer style={{ background: "#3F51B5", color: "white", padding: isMobile ? "36px 16px 24px" : "52px 20px 32px" }}>
        <div style={{ maxWidth: 1800, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "2fr 1fr 1fr", gap: isMobile ? 32 : 40, marginBottom: 40 }}>

            {/* Column 1 */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <svg width="36" height="36" viewBox="0 0 44 44" fill="none">
                  <circle cx="22" cy="22" r="20" fill="#1a1a2e" stroke="#4361ee" strokeWidth="2" />
                  <text x="22" y="27" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="Georgia, serif">QC</text>
                </svg>
                <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>QUALITY CRICKET</span>
              </div>
              <p style={{ color: "#ddd", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum
              </p>
              <p style={{ fontSize: 13, color: "#aaa" }}>📞 23656352632</p>
              <div style={{ marginTop: 16, borderRadius: 8, overflow: "hidden", width: isMobile ? "100%" : 180, height: 100, background: "#2a2a4e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={map} alt="Map" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            </div>

            {/* Column 2 */}
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>RELATED LINKS</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                    { name: "Home", path: "/home" },
                    { name: "Sale", path: "/products" },
                    { name: "Accessories", path: "/products" },
                    { name: "All Products", path: "/products" },
                    { name: "Contact Us", path: "/contact" },
                    { name: "FAQ", path: "/faq" }
                ].map((link) => (
                  <li key={link.name}>
                    <Link to={link.path} style={{ color: "#ccc", textDecoration: "none", fontSize: 14 }}>{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>POLICY</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {["Privacy Policy", "Terms & Conditions", "Shipping Policy", "Refund Policy"].map((link) => (
                  <li key={link}>
                    <a href="#" style={{ color: "#ccc", textDecoration: "none", fontSize: 14 }}>{link}</a>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Newsletter */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 32, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <p style={{ fontSize: 14, color: "#ccc", marginBottom: 16 }}>Get the latest updates via email.</p>
            <div style={{ display: "flex", width: "100%", maxWidth: 400, background: "white", borderRadius: 4, overflow: "hidden" }}>
              <input
                type="email"
                placeholder="Enter you email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ flex: 1, padding: "12px 16px", border: "none", outline: "none", fontSize: 14 }}
              />
              <button style={{ background: "#1a1a2e", color: "white", border: "none", padding: "0 24px", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
                Subscribe
              </button>
            </div>
          </div>

          <p style={{ textAlign: "center", fontSize: 12, color: "#aaa", marginTop: 28 }}>
            © {new Date().getFullYear()} Quality Cricket. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ═══════════════════════════ SCROLL TO TOP ═══════════════════════════ */}
      {scrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            position: "fixed", bottom: 28, right: 20, width: 44, height: 44,
            borderRadius: "50%", background: "#4361ee", color: "white", border: "none",
            fontSize: 20, cursor: "pointer", boxShadow: "0 6px 20px rgba(67,97,238,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300,
          }}
        >
          ↑
        </button>
      )}
    </>
  );
}
