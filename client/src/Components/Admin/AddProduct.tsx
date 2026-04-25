import React, { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import AdminLayout from "./AdminLayout";
import { createProduct } from "../../services/productApi";

export default function AddProduct() {
    const [formData, setFormData] = useState({
        name: "",
        basePrice: "",
        discountPercentage: "0",
        stockQuantity: 1,
        sku: "",
        category: "Bats",
        size: "",
        color: "",
        tags: "",
        description: "",
        sizeChart: "",
        isCustomizable: false
    });

    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const remainingSlots = 4 - imageFiles.length;
            const filesToAdd = files.slice(0, remainingSlots);

            if (files.length > remainingSlots) {
                Swal.fire({ icon: 'warning', title: 'Limit Exceeded', text: "Max 4 images allowed." });
            }

            const newFiles = [...imageFiles, ...filesToAdd];
            const newPreviews = [...imagePreviews, ...filesToAdd.map(file => URL.createObjectURL(file))];

            setImageFiles(newFiles);
            setImagePreviews(newPreviews);
        }
    };

    const removeImage = (index: number) => {
        const newFiles = [...imageFiles];
        const newPreviews = [...imagePreviews];
        URL.revokeObjectURL(newPreviews[index]);
        newFiles.splice(index, 1);
        newPreviews.splice(index, 1);
        setImageFiles(newFiles);
        setImagePreviews(newPreviews);
    };

    const validate = () => {
        const newErrors: any = {};
        if (!formData.name) newErrors.name = "Name is required";
        if (!formData.basePrice || isNaN(Number(formData.basePrice))) newErrors.basePrice = "Valid price required";
        if (!formData.sku) newErrors.sku = "SKU is required";
        if (imageFiles.length === 0) newErrors.image = "At least one image is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => data.append(key, value.toString()));
            imageFiles.forEach(file => data.append('images', file));

            await createProduct(data);
            Swal.fire({ icon: 'success', title: 'Success!', text: "Product added!", timer: 2000, showConfirmButton: false });
            setFormData({ name: "", basePrice: "", discountPercentage: "0", stockQuantity: 1, sku: "", category: "Bats", size: "", color: "", tags: "", description: "", sizeChart: "", isCustomizable: false });
            setImageFiles([]);
            setImagePreviews([]);
        } catch (err: any) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div style={{ background: "white", borderRadius: 12, padding: isMobile ? "20px" : "32px", border: "1px solid #f1f5f9" }}>
                <h2 style={{ marginBottom: 32, fontSize: 24, fontWeight: 700, color: "#1e293b" }}>Add New Product</h2>
                
                <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.5fr", gap: isMobile ? 32 : 48 }}>

                    {/* Image Upload Section */}
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>Product Images</span>
                            <span style={{ fontSize: 12, color: "#94a3b8" }}>{imageFiles.length}/4</span>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            {[0, 1, 2, 3].map((index) => (
                                <div 
                                    key={index}
                                    onClick={() => index === imageFiles.length ? fileInputRef.current?.click() : null}
                                    style={{ 
                                        aspectRatio: "1/1",
                                        border: index === imageFiles.length ? (errors.image ? "2px dashed #ef4444" : "2px dashed #cbd5e1") : "1px solid #f1f5f9", 
                                        borderRadius: 12, 
                                        background: index === imageFiles.length ? "#f8fafc" : "white", 
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        cursor: index === imageFiles.length ? "pointer" : "default",
                                        position: "relative", overflow: "hidden"
                                    }}
                                >
                                    {imagePreviews[index] ? (
                                        <>
                                            <img src={imagePreviews[index]} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            <div onClick={(e) => { e.stopPropagation(); removeImage(index); }} style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, background: "#ef4444", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, cursor: "pointer" }}>✕</div>
                                        </>
                                    ) : index === imageFiles.length ? (
                                        <div style={{ textAlign: "center", color: "#64748b" }}>
                                            <div style={{ fontSize: 24, fontWeight: 300 }}>+</div>
                                            <div style={{ fontSize: 11 }}>Add Photo</div>
                                        </div>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                        <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} accept="image/*" multiple />
                        {errors.image && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 8 }}>{errors.image}</div>}
                    </div>

                    {/* Details Section */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: 16 }}>
                            <div>
                                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Product Name*</label>
                                <input name="name" value={formData.name} onChange={handleChange} style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: 8, outline: "none", boxSizing: "border-box" }} />
                                {errors.name && <span style={{ color: "#ef4444", fontSize: 11 }}>{errors.name}</span>}
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>SKU*</label>
                                <input name="sku" value={formData.sku} onChange={handleChange} style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: 8, outline: "none", boxSizing: "border-box" }} />
                                {errors.sku && <span style={{ color: "#ef4444", fontSize: 11 }}>{errors.sku}</span>}
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div>
                                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Price ($)*</label>
                                <input name="basePrice" value={formData.basePrice} onChange={handleChange} style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: 8, outline: "none", boxSizing: "border-box" }} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Discount %</label>
                                <input name="discountPercentage" value={formData.discountPercentage} onChange={handleChange} type="number" style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: 8, outline: "none", boxSizing: "border-box" }} />
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                            <div>
                                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Category</label>
                                <select name="category" value={formData.category} onChange={handleChange} style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: 8, outline: "none", boxSizing: "border-box", background: "white" }}>
                                    {["Bats", "Balls", "Pads", "Gloves", "Helmets", "Accessories"].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Stock Quantity</label>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button type="button" onClick={() => setFormData(p => ({ ...p, stockQuantity: Math.max(0, p.stockQuantity - 1) }))} style={{ flex: 1, padding: "10px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#f8fafc", cursor: "pointer" }}>-</button>
                                    <input value={formData.stockQuantity} readOnly style={{ width: 60, textAlign: "center", border: "1px solid #e2e8f0", borderRadius: 8 }} />
                                    <button type="button" onClick={() => setFormData(p => ({ ...p, stockQuantity: p.stockQuantity + 1 }))} style={{ flex: 1, padding: "10px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#f8fafc", cursor: "pointer" }}>+</button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: 8, outline: "none", minHeight: 100, boxSizing: "border-box", resize: "none" }} />
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <input name="isCustomizable" checked={formData.isCustomizable} onChange={handleChange} type="checkbox" id="custom" />
                            <label htmlFor="custom" style={{ fontSize: 14, color: "#475569", cursor: "pointer" }}>Enable Customization</label>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            style={{ width: "100%", padding: "14px", background: "#3F51B5", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 16, cursor: loading ? "not-allowed" : "pointer", marginTop: 10 }}
                        >
                            {loading ? "Processing..." : "Save Product"}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
