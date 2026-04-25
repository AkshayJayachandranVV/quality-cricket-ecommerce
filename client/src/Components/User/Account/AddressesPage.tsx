import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Navbar from "../Shared/Navbar";
import Footer from "../Shared/Footer";
import { getMyAddresses, addAddress, updateAddress, deleteAddress } from "../../../services/addressApi";

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

export default function AddressesPage() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Partial<Address> | null>(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await getMyAddresses();
      setAddresses(response.addresses);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddress) return;

    // Basic Validation
    if (!editingAddress.fullName || !editingAddress.mobileNumber || !editingAddress.pincode || !editingAddress.flatHouse || !editingAddress.areaStreet || !editingAddress.townCity || !editingAddress.state) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Please fill all required fields' });
        return;
    }

    try {
      if (editingAddress.id) {
        await updateAddress(editingAddress.id, editingAddress);
        Swal.fire({ icon: 'success', title: 'Updated', text: 'Address updated successfully', timer: 1500, showConfirmButton: false });
      } else {
        await addAddress(editingAddress);
        Swal.fire({ icon: 'success', title: 'Added', text: 'New address added', timer: 1500, showConfirmButton: false });
      }
      setIsModalOpen(false);
      setEditingAddress(null);
      fetchAddresses();
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Delete Address?',
      text: "Are you sure you want to remove this address?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3F51B5'
    });

    if (result.isConfirmed) {
      try {
        await deleteAddress(id);
        fetchAddresses();
        Swal.fire('Deleted!', 'Address removed.', 'success');
      } catch (err: any) {
        Swal.fire({ icon: 'error', title: 'Error', text: err.message });
      }
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#f8fafc", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <div style={{ background: "linear-gradient(90deg, #3F51B5 0%, #5C6BC0 100%)", color: "white", padding: "40px 24px", textAlign: "center" }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Manage Your Addresses</h1>
          <p style={{ margin: "8px 0 0", opacity: 0.9 }}>Add or edit your delivery locations</p>
      </div>

      <main style={{ flex: 1, maxWidth: 1100, margin: "0 auto", padding: "40px 24px", width: "100%", boxSizing: "border-box" }}>
        
        <div style={{ marginBottom: 32 }}>
            <button 
                onClick={() => navigate(-1)} 
                style={{ background: "none", border: "none", color: "#64748b", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}
            >
                ← Back to Account
            </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
            
            {/* Add New Card */}
            <div 
                onClick={() => { setEditingAddress({ country: 'India', isDefault: false }); setIsModalOpen(true); }}
                style={{ 
                    height: 220, 
                    background: "white", 
                    border: "2px dashed #cbd5e1", 
                    borderRadius: 16, 
                    display: "flex", 
                    flexDirection: "column",
                    alignItems: "center", 
                    justifyContent: "center", 
                    cursor: "pointer",
                    transition: "all 0.2s"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3F51B5"; e.currentTarget.style.background = "#f5f7ff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.background = "white"; }}
            >
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, fontSize: 24, color: "#3F51B5" }}>+</div>
                <span style={{ fontSize: 16, color: "#475569", fontWeight: 600 }}>Add New Address</span>
            </div>

            {loading ? (
                Array(2).fill(0).map((_, i) => <div key={i} style={{ height: 220, background: "#f1f5f9", borderRadius: 16, animation: "pulse 1.5s infinite" }} />)
            ) : (
                addresses.map((addr) => (
                    <div key={addr.id} style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", border: addr.isDefault ? "2px solid #3F51B5" : "1px solid #e2e8f0", position: "relative" }}>
                        {addr.isDefault && (
                            <span style={{ position: "absolute", top: 12, right: 12, background: "#eef2ff", color: "#3F51B5", fontSize: 10, fontWeight: 800, padding: "4px 8px", borderRadius: 4, textTransform: "uppercase" }}>Default</span>
                        )}
                        <h3 style={{ margin: "0 0 12px 0", fontSize: 16, fontWeight: 700, color: "#1e293b" }}>{addr.fullName}</h3>
                        <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, marginBottom: 20 }}>
                            <div>{addr.flatHouse}, {addr.areaStreet}</div>
                            {addr.landmark && <div>Near {addr.landmark}</div>}
                            <div>{addr.townCity}, {addr.state} - {addr.pincode}</div>
                            <div style={{ marginTop: 8, color: "#1e293b", fontWeight: 500 }}>📱 {addr.mobileNumber}</div>
                        </div>

                        <div style={{ display: "flex", gap: 16, borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
                            <button 
                                onClick={() => { setEditingAddress(addr); setIsModalOpen(true); }}
                                style={{ background: "none", border: "none", color: "#3F51B5", fontWeight: 700, fontSize: 13, cursor: "pointer", padding: 0 }}
                            >
                                Edit
                            </button>
                            <button 
                                onClick={() => handleDelete(addr.id)}
                                style={{ background: "none", border: "none", color: "#ef4444", fontWeight: 700, fontSize: 13, cursor: "pointer", padding: 0 }}
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && editingAddress && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}>
              <div style={{ background: "white", width: "100%", maxWidth: 500, borderRadius: 20, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", overflow: "hidden" }}>
                  <div style={{ padding: "24px 32px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1e293b" }}>{editingAddress.id ? "Edit Address" : "Add New Address"}</h2>
                      <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#94a3b8" }}>✕</button>
                  </div>
                  
                  <form onSubmit={handleSave} style={{ padding: 32 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                          <div style={{ gridColumn: "span 2" }}>
                              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>Full Name</label>
                              <input 
                                value={editingAddress.fullName || ""} 
                                onChange={e => setEditingAddress({...editingAddress, fullName: e.target.value})}
                                style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: 10, outline: "none" }}
                              />
                          </div>
                          <div>
                              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>Mobile Number</label>
                              <input 
                                value={editingAddress.mobileNumber || ""} 
                                onChange={e => setEditingAddress({...editingAddress, mobileNumber: e.target.value})}
                                style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: 10, outline: "none" }}
                              />
                          </div>
                          <div>
                              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>Pincode</label>
                              <input 
                                value={editingAddress.pincode || ""} 
                                onChange={e => setEditingAddress({...editingAddress, pincode: e.target.value})}
                                style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: 10, outline: "none" }}
                              />
                          </div>
                          <div style={{ gridColumn: "span 2" }}>
                              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>Flat, House no, Building</label>
                              <input 
                                value={editingAddress.flatHouse || ""} 
                                onChange={e => setEditingAddress({...editingAddress, flatHouse: e.target.value})}
                                style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: 10, outline: "none" }}
                              />
                          </div>
                          <div style={{ gridColumn: "span 2" }}>
                              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>Area, Street, Village</label>
                              <input 
                                value={editingAddress.areaStreet || ""} 
                                onChange={e => setEditingAddress({...editingAddress, areaStreet: e.target.value})}
                                style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: 10, outline: "none" }}
                              />
                          </div>
                          <div>
                              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>Town/City</label>
                              <input 
                                value={editingAddress.townCity || ""} 
                                onChange={e => setEditingAddress({...editingAddress, townCity: e.target.value})}
                                style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: 10, outline: "none" }}
                              />
                          </div>
                          <div>
                              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>State</label>
                              <input 
                                value={editingAddress.state || ""} 
                                onChange={e => setEditingAddress({...editingAddress, state: e.target.value})}
                                style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: 10, outline: "none" }}
                              />
                          </div>
                      </div>
                      
                      <div style={{ marginTop: 20 }}>
                          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14, color: "#475569" }}>
                              <input 
                                type="checkbox" 
                                checked={editingAddress.isDefault || false} 
                                onChange={e => setEditingAddress({...editingAddress, isDefault: e.target.checked})}
                                style={{ width: 18, height: 18, accentColor: "#3F51B5" }}
                              />
                              Set as default address
                          </label>
                      </div>

                      <button type="submit" style={{ marginTop: 32, width: "100%", padding: "14px", background: "#3F51B5", color: "white", border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer", fontSize: 15, boxShadow: "0 10px 15px -3px rgba(63, 81, 181, 0.4)" }}>
                          {editingAddress.id ? "Update Address" : "Add Address"}
                      </button>
                  </form>
              </div>
          </div>
      )}

      <Footer />
      <style>{`
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
}
