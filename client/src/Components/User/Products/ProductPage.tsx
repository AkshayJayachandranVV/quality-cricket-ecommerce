import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Shared/Navbar";
import Footer from "../Shared/Footer";
import { ALL_PRODUCTS, Product } from "../Shared/dummyData";

const PRODUCT_TYPES = ["BAT", "Bails", "Batting Leg Guards", "CRICKET ACCESSORIES", "Cricket Bat Accessories", "Cricket Sets", "GLOVES", "IMPACT_PROTECTION_GEAR", "KIT BAGS", "Kits", "SPORTING_GOODS", "SPORT_ACTIVITY_GLOVE", "SPORT_BAT", "SPORT_EQUIPMENT_BAG_CASE", "SPORT_HELMET"];
const SIZES = ["Boys", "Harrow", "Junior", "Large", "Medium", "Senior", "Size 4", "Size 5", "Size 6", "Small", "Youth"];

export default function ProductPage() {
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter States
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState("Price, high to low");

  const API_BASE = process.env.REACT_APP_IMAGE_BASE_URL || 'http://localhost:5000';

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

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  const cols = isDesktop ? 4 : isTablet ? 3 : 2;

  const getProductImage = (imageUrlsJson: string) => {
    try {
      const urls = imageUrlsJson ? JSON.parse(imageUrlsJson) : [];
      return urls && urls.length > 0 ? `${API_BASE}${urls[0]}` : "https://via.placeholder.com/200";
    } catch (e) {
      return "https://via.placeholder.com/200";
    }
  };

  // Toggle Filter Helper
  const toggleFilter = (list: string[], setList: (l: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Filtering & Sorting Logic
  let processedProducts = products.filter(p => {
    // Search filter
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());

    // Collection filter (using mapped categories for simplicity)
    const matchesCollection = selectedCollections.length === 0 || selectedCollections.includes(p.category);

    // Availability filter
    const matchesAvailability = selectedAvailability.length === 0 ||
      (selectedAvailability.includes("In Stock") && p.stockQuantity > 0) ||
      (selectedAvailability.includes("Out Of Stock") && p.stockQuantity === 0);

    // Size filter
    const matchesSize = selectedSizes.length === 0 || (p.size && selectedSizes.includes(p.size));

    // Product Type filter
    const matchesType = selectedProductTypes.length === 0 || selectedProductTypes.includes(p.category);

    return matchesSearch && matchesCollection && matchesAvailability && matchesSize && matchesType;
  });

  // Sort logic
  processedProducts.sort((a, b) => {
    switch (sortOption) {
      case "Price, low to high":
        return a.basePrice - b.basePrice;
      case "Price, high to low":
        return b.basePrice - a.basePrice;
      case "Alphabetically, A-Z":
        return a.name.localeCompare(b.name);
      case "Date, new to old":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = processedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(processedProducts.length / productsPerPage);

  // Reusable card styling
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
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", background: "#f7f8fc", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: 1440, margin: "0 auto", padding: isMobile ? "20px 12px" : "32px 24px", width: "100%", boxSizing: "border-box" }}>
        {/* Breadcrumbs */}
        <div style={{ fontSize: 13, color: "#666", marginBottom: 24, fontWeight: 500 }}>
          <span style={{ cursor: "pointer", color: "#666" }}>All Product</span> {'>'} <span>showing filters: {processedProducts.length} results</span>
        </div>

        <div style={{ display: "flex", gap: 32, flexDirection: isMobile ? "column" : "row", alignItems: "flex-start" }}>

          {/* Left Sidebar (Filters) */}
          {!isMobile && (
            <aside style={{ width: 240, flexShrink: 0, paddingRight: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                <span style={{ fontSize: 16 }}>⯋</span>
                <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: 0.5, color: "#1a1a2e" }}>FILTERS</span>
              </div>

              {/* COLLECTION */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 12 }}>
                  <span style={{ fontSize: 10, color: "#555" }}>ᐱ</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>COLLECTION</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {["Bats", "Balls", "Pads", "Gloves", "Helmets", "Accessories"].map(item => (
                    <label key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#555", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={selectedCollections.includes(item)}
                        onChange={() => toggleFilter(selectedCollections, setSelectedCollections, item)}
                        style={{ accentColor: "#4361ee" }}
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ borderBottom: "1px dashed #ccc", marginBottom: 24 }} />

              {/* VENDOR */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 12 }}>
                  <span style={{ fontSize: 10, color: "#555" }}>ᐱ</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>VENDOR</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {["MRF", "SS", "Adidas", "Nike", "Puma"].map(item => (
                    <label key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#555", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={selectedVendors.includes(item)}
                        onChange={() => toggleFilter(selectedVendors, setSelectedVendors, item)}
                        style={{ accentColor: "#4361ee" }}
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>

              {/* PRODUCT TYPE */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 12 }}>
                  <span style={{ fontSize: 10, color: "#555" }}>ᐱ</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>PRODUCT TYPE</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {PRODUCT_TYPES.map(item => (
                    <label key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#555", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={selectedProductTypes.includes(item)}
                        onChange={() => toggleFilter(selectedProductTypes, setSelectedProductTypes, item)}
                        style={{ accentColor: "#4361ee", width: 13, height: 13 }}
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>

              {/* AVAILABILITY */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 12 }}>
                  <span style={{ fontSize: 10, color: "#555" }}>ᐱ</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>AVAILABILITY</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {["In Stock", "Out Of Stock"].map(item => (
                    <label key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#555", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={selectedAvailability.includes(item)}
                        onChange={() => toggleFilter(selectedAvailability, setSelectedAvailability, item)}
                        style={{ accentColor: "#4361ee" }}
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>

              {/* SIZE */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 12 }}>
                  <span style={{ fontSize: 10, color: "#555" }}>ᐱ</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>SIZE</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {SIZES.map(item => (
                    <label key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#555", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={selectedSizes.includes(item)}
                        onChange={() => toggleFilter(selectedSizes, setSelectedSizes, item)}
                        style={{ accentColor: "#4361ee", width: 13, height: 13 }}
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>

            </aside>
          )}

          {/* Right Main Content */}
          <div style={{ flex: 1, minWidth: 0, background: "white", padding: isMobile ? 16 : 32, borderRadius: 8, boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
            <h1 style={{ textAlign: "center", fontSize: isMobile ? 24 : 32, fontWeight: 700, color: "#1a1a2e", marginTop: 0, marginBottom: 24 }}>All Products</h1>

            {/* Toolbar */}
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center", gap: 16, marginBottom: 32 }}>

              <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                <input
                  type="text"
                  placeholder="Search Products..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  style={{ width: "100%", maxWidth: 400, padding: "10px 20px", borderRadius: 50, border: "1px solid #eee", background: "#f9f9f9", outline: "none", fontSize: 14, boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", flexShrink: 0, position: "relative" }}>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  style={{ background: "#4351B5", color: "white", padding: "10px 16px", borderRadius: 4, outline: "none", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", minWidth: 160 }}
                >
                  <option>Price, high to low</option>
                  <option>Price, low to high</option>
                  <option>Alphabetically, A-Z</option>
                  <option>Date, new to old</option>
                </select>
              </div>

            </div>

            {/* Product Grid */}
            {processedProducts.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: isMobile ? 12 : 24 }}>
                {currentProducts.map((product) => (
                  <div key={product.id} onClick={() => navigate(`/product/${product.id}`)} style={productCard(product.id)} onMouseEnter={() => setHoveredProduct(product.id)} onMouseLeave={() => setHoveredProduct(null)}>
                    <div style={{ position: "relative", padding: "16px", display: "flex", justifyContent: "center", alignItems: "center", height: isMobile ? 140 : 200, background: "white", borderRadius: 8 }}>
                      <img src={getProductImage(product.imageUrls)} alt={product.name} style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} />
                    </div>
                    <div style={{ padding: "10px 8px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 8, justifyContent: "space-between" }}>
                      <p style={{ fontSize: isMobile ? 11 : 12, color: "#333", margin: 0, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", fontWeight: 500 }}>{product.name}</p>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                        <span style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, color: "#4351B5" }}>$ {(product.basePrice * (1 - product.discountPercentage / 100)).toFixed(2)}</span>
                        {product.discountPercentage > 0 && (
                          <span style={{ fontSize: 11, color: "#999", textDecoration: "line-through" }}>${Number(product.basePrice).toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "80px 0", color: "#888" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <h3>No products found matching your criteria.</h3>
                <p>Try clearing some filters or using different keywords.</p>
              </div>
            )}

            {/* Pagination Box */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 48, marginBottom: 16 }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <span
                    key={page}
                    onClick={() => { setCurrentPage(page); window.scrollTo(0, 0); }}
                    style={{
                      cursor: "pointer",
                      width: 36, height: 36,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      borderRadius: "50%",
                      fontSize: 14,
                      fontWeight: 600,
                      background: currentPage === page ? "#4351B5" : "white",
                      color: currentPage === page ? "white" : "#555",
                      border: "1px solid #eee",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {page}
                  </span>
                ))}
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
