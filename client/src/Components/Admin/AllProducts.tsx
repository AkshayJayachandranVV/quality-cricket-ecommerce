import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import AdminLayout from "./AdminLayout";
import { getAllProducts, deleteProduct, updateProduct } from "../../services/productApi";

const API_BASE = process.env.REACT_APP_IMAGE_BASE_URL || 'http://localhost:5000'; // Base URL for images

interface Product {
    id: number;
    name: string;
    description: string;
    category: string;
    basePrice: number;
    stockQuantity: number;
    discountPercentage: number;
    imageUrls: string;
    sku: string;
    isCustomizable: boolean;
    size: string;
    color: string;
    tags: string;
    createdAt: string;
}

export default function AllProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [imagesToKeep, setImagesToKeep] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [selectedPreviews, setSelectedPreviews] = useState<string[]>([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        fetchProducts();
        return () => {
            window.removeEventListener('resize', handleResize);
            selectedPreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, []);

    const startEditing = (prod: Product) => {
        setEditingProduct(prod);
        setSelectedFiles([]);
        setSelectedPreviews([]);
        try {
            setImagesToKeep(JSON.parse(prod.imageUrls || "[]"));
        } catch (e) {
            setImagesToKeep([]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const previews = files.map(file => URL.createObjectURL(file));
            setSelectedFiles(prev => [...prev, ...files]);
            setSelectedPreviews(prev => [...prev, ...previews]);
        }
    };

    const removeNewFile = (index: number) => {
        URL.revokeObjectURL(selectedPreviews[index]);
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setSelectedPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const fetchProducts = async () => {
        try {
            const response = await getAllProducts();
            setProducts(response.products);
        } catch (err: any) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.message || "Failed to fetch products" });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Delete Product?',
            text: "This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3F51B5',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await deleteProduct(id);
                fetchProducts();
                Swal.fire('Deleted!', 'Product removed successfully.', 'success');
            } catch (err: any) {
                Swal.fire({ icon: 'error', title: 'Error', text: err.message });
            }
        }
    };

    const handleEditSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;

        const formData = new FormData();
        const skipKeys = ['imageUrls', 'vendorId', 'createdAt', 'updatedAt', 'id'];

        Object.entries(editingProduct).forEach(([key, val]) => {
            if (!skipKeys.includes(key)) formData.append(key, String(val));
        });

        formData.append('imagesToKeep', JSON.stringify(imagesToKeep));

        selectedFiles.forEach(file => {
            formData.append('images', file);
        });

        try {
            await updateProduct(editingProduct.id, formData);
            Swal.fire({ icon: 'success', title: 'Updated', text: 'Product saved', timer: 1500 });
            setEditingProduct(null);
            setImagesToKeep([]);
            setSelectedFiles([]);
            setSelectedPreviews([]);
            fetchProducts();
        } catch (err: any) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.message });
        }
    };

    const getFirstImage = (urlJson: string) => {
        try {
            const urls = JSON.parse(urlJson);
            if (Array.isArray(urls) && urls.length > 0) return `${API_BASE}${urls[0]}`;
        } catch (e) {}
        return "https://via.placeholder.com/44";
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <AdminLayout><div>Loading products...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div style={{ background: "white", borderRadius: 12, padding: isMobile ? 16 : 24, border: "1px solid #f1f5f9" }}>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>Product Inventory</h2>
                    <input 
                        type="text" 
                        placeholder="Filter by name/category..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: "10px 16px", border: "1px solid #e2e8f0", borderRadius: 10, outline: "none", width: isMobile ? "100%" : 260, fontSize: 13 }} 
                    />
                </div>

                {isMobile ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {filteredProducts.map((prod) => (
                            <div key={prod.id} style={{ border: "1px solid #f1f5f9", borderRadius: 12, padding: 16, background: "#fafafa" }}>
                                <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                                    <img src={getFirstImage(prod.imageUrls)} alt="preview" style={{ width: 64, height: 64, objectFit: "contain", borderRadius: 8, border: "1px solid #f1f5f9", background: "white" }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 15 }}>{prod.name}</div>
                                        <div style={{ fontSize: 11, color: "#94a3b8" }}>SKU: {prod.sku}</div>
                                        <span style={{ display: "inline-block", marginTop: 4, padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: "#f1f5f9", color: "#475569" }}>{prod.category}</span>
                                    </div>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: 12 }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 16, color: "#1e293b" }}>${prod.basePrice}</div>
                                        <div style={{ fontSize: 11, color: prod.stockQuantity < 10 ? "#ef4444" : "#22c55e", fontWeight: 600 }}>{prod.stockQuantity} in stock</div>
                                    </div>
                                    <div style={{ display: "flex", gap: 20 }}>
                                        <button onClick={() => startEditing(prod)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 20 }}>📝</button>
                                        <button onClick={() => handleDelete(prod.id)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 20 }}>🗑️</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 900 }}>
                            <thead>
                                <tr style={{ background: "#f8f9fa", textAlign: "left" }}>
                                    <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>Preview</th>
                                    <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>Product Name</th>
                                    <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>Category</th>
                                    <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>Price</th>
                                    <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>Stock</th>
                                    <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((prod) => (
                                    <tr key={prod.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                        <td style={{ padding: "16px 20px" }}>
                                            <img src={getFirstImage(prod.imageUrls)} alt="preview" style={{ width: 44, height: 44, objectFit: "contain", borderRadius: 8, border: "1px solid #f1f5f9" }} />
                                        </td>
                                        <td style={{ padding: "16px 20px" }}>
                                            <div style={{ fontWeight: 600, color: "#1e293b", fontSize: 14 }}>{prod.name}</div>
                                            <div style={{ fontSize: 11, color: "#94a3b8" }}>SKU: {prod.sku}</div>
                                        </td>
                                        <td style={{ padding: "16px 20px" }}>
                                            <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: "#f1f5f9", color: "#475569" }}>{prod.category}</span>
                                        </td>
                                        <td style={{ padding: "16px 20px" }}>
                                            <div style={{ fontWeight: 700, color: "#1e293b" }}>${prod.basePrice}</div>
                                            {prod.discountPercentage > 0 && <div style={{ fontSize: 11, color: "#22c55e" }}>{prod.discountPercentage}% off</div>}
                                        </td>
                                        <td style={{ padding: "16px 20px" }}>
                                            <div style={{ fontSize: 14, color: prod.stockQuantity < 10 ? "#ef4444" : "#475569", fontWeight: 600 }}>{prod.stockQuantity} in stock</div>
                                        </td>
                                        <td style={{ padding: "16px 20px" }}>
                                            <div style={{ display: "flex", gap: 16 }}>
                                                <button onClick={() => startEditing(prod)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 16 }}>📝</button>
                                                <button onClick={() => handleDelete(prod.id)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 16 }}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Edit Modal Refactored */}
                {editingProduct && (
                    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
                        <div style={{ background: "white", padding: isMobile ? 20 : 32, borderRadius: 16, width: "100%", maxWidth: 650, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, alignItems: "center" }}>
                                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Edit Product</h3>
                                <button onClick={() => setEditingProduct(null)} style={{ border: "none", background: "none", fontSize: 24, cursor: "pointer", color: "#94a3b8" }}>✕</button>
                            </div>
                            
                            <form onSubmit={handleEditSave} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>
                                <div style={{ gridColumn: isMobile ? "span 1" : "span 2" }}>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Title</label>
                                    <input value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: 10, outline: "none", boxSizing: "border-box" }} />
                                </div>
                                <div style={{ gridColumn: isMobile ? "span 1" : "span 2" }}>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Description</label>
                                    <textarea value={editingProduct.description} onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})} style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: 10, outline: "none", boxSizing: "border-box", minHeight: 80 }} />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Price ($)</label>
                                    <input type="number" value={editingProduct.basePrice} onChange={(e) => setEditingProduct({...editingProduct, basePrice: Number(e.target.value)})} style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: 10, outline: "none", boxSizing: "border-box" }} />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Stock</label>
                                    <input type="number" value={editingProduct.stockQuantity} onChange={(e) => setEditingProduct({...editingProduct, stockQuantity: Number(e.target.value)})} style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: 10, outline: "none", boxSizing: "border-box" }} />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Category</label>
                                    <input value={editingProduct.category} onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})} style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: 10, outline: "none", boxSizing: "border-box" }} />
                                </div>
                                <div style={{ gridColumn: isMobile ? "span 1" : "span 2" }}>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 12 }}>Image Gallery Management</label>
                                    
                                    {/* Existing Images */}
                                    <div style={{ marginBottom: 20 }}>
                                        <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8, fontWeight: 700, textTransform: "uppercase" }}>Current Images</div>
                                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                                            {imagesToKeep.map((img, idx) => (
                                                <div key={idx} style={{ position: "relative", width: 80, height: 80, border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden", background: "#f8f9fa" }}>
                                                    <img src={`${API_BASE}${img}`} alt="prod" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                                                    <button 
                                                        type="button"
                                                        onClick={() => setImagesToKeep(imagesToKeep.filter((_, i) => i !== idx))}
                                                        style={{ position: "absolute", top: 2, right: 2, background: "#ef4444", color: "white", border: "none", borderRadius: "50%", width: 20, height: 20, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}
                                                    >✕</button>
                                                </div>
                                            ))}
                                            {imagesToKeep.length === 0 && <div style={{ fontSize: 12, color: "#94a3b8", padding: "10px 0" }}>No existing images retained.</div>}
                                        </div>
                                    </div>

                                    {/* Newly Selected Previews */}
                                    {selectedPreviews.length > 0 && (
                                        <div style={{ marginBottom: 20 }}>
                                            <div style={{ fontSize: 11, color: "#3F51B5", marginBottom: 8, fontWeight: 700, textTransform: "uppercase" }}>New Uploads (Preview)</div>
                                            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                                                {selectedPreviews.map((url, idx) => (
                                                    <div key={idx} style={{ position: "relative", width: 80, height: 80, border: "2px dashed #3F51B5", borderRadius: 8, overflow: "hidden", background: "#f5f7ff" }}>
                                                        <img src={url} alt="new-preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                                                        <button 
                                                            type="button"
                                                            onClick={() => removeNewFile(idx)}
                                                            style={{ position: "absolute", top: 2, right: 2, background: "#3F51B5", color: "white", border: "none", borderRadius: "50%", width: 20, height: 20, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}
                                                        >✕</button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 8 }}>Add More Images</label>
                                    <div style={{ position: "relative" }}>
                                        <input 
                                            type="file" 
                                            multiple 
                                            onChange={handleFileChange} 
                                            style={{ 
                                                width: "100%", 
                                                padding: "30px 10px", 
                                                border: "2px dashed #cbd5e1", 
                                                borderRadius: 12, 
                                                textAlign: "center", 
                                                cursor: "pointer",
                                                fontSize: 12,
                                                color: "#64748b",
                                                background: "#f8fafc"
                                            }} 
                                        />
                                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", pointerEvents: "none", color: "#94a3b8" }}>
                                            {selectedFiles.length > 0 ? `+ Add ${selectedFiles.length} more files` : "Click or drag to upload new images"}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ gridColumn: isMobile ? "span 1" : "span 2", display: "flex", gap: 12, marginTop: 20 }}>
                                    <button type="button" onClick={() => setEditingProduct(null)} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid #e2e8f0", background: "white", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                                    <button type="submit" style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: "#3F51B5", color: "white", fontWeight: 700, cursor: "pointer" }}>Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
