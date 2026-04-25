import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import AdminLayout from "./AdminLayout";
import { getAllUsers, updateUser, deleteUser } from "../../services/authApi";

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    role: string;
    isVerified: boolean;
    isBlocked: boolean;
    createdAt: string;
}

export default function AllUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        fetchUsers();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await getAllUsers();
            setUsers(data.users || []);
        } catch (err: any) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.message || "Failed to fetch users" });
        } finally {
            setLoading(false);
        }
    };

    const handleBlockToggle = async (user: User) => {
        const action = user.isBlocked ? 'Unblock' : 'Block';
        const result = await Swal.fire({
            title: `${action} User?`,
            text: `Are you sure you want to ${action.toLowerCase()} ${user.firstName}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3F51B5',
            confirmButtonText: `Yes, ${action}!`
        });

        if (result.isConfirmed) {
            try {
                await updateUser(user.id, { isBlocked: !user.isBlocked });
                fetchUsers();
                Swal.fire('Updated!', `User has been ${action.toLowerCase()}ed.`, 'success');
            } catch (err: any) {
                Swal.fire({ icon: 'error', title: 'Error', text: err.message });
            }
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Delete User?',
            text: "This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete!'
        });

        if (result.isConfirmed) {
            try {
                await deleteUser(id);
                fetchUsers();
                Swal.fire('Deleted!', 'User has been removed.', 'success');
            } catch (err: any) {
                Swal.fire({ icon: 'error', title: 'Error', text: err.message });
            }
        }
    };

    const handleEditSave = async () => {
        if (!editingUser) return;
        try {
            await updateUser(editingUser.id, {
                firstName: editingUser.firstName,
                lastName: editingUser.lastName,
                role: editingUser.role
            });
            setEditingUser(null);
            fetchUsers();
            Swal.fire('Success', 'User details updated', 'success');
        } catch (err: any) {
            Swal.fire('Error', err.message, 'error');
        }
    };

    const filteredUsers = Array.isArray(users) ? users.filter(u => 
        u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    if (loading) return <AdminLayout><div>Loading Users...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div style={{ background: "white", borderRadius: 12, padding: isMobile ? 16 : 24, border: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>Registered Users</h2>
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: "10px 16px", border: "1px solid #e2e8f0", borderRadius: 8, outline: "none", width: isMobile ? "100%" : 260, fontSize: 13 }}
                    />
                </div>

                {isMobile ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {filteredUsers.map((user) => (
                            <div key={user.id} style={{ border: "1px solid #f1f5f9", borderRadius: 12, padding: 16, background: "#fafafa" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                    <div>
                                        <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 15 }}>{user.firstName} {user.lastName}</div>
                                        <div style={{ fontSize: 12, color: "#64748b" }}>{user.email}</div>
                                    </div>
                                    <span style={{ padding: "4px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, background: "#f1f5f9", color: "#475569" }}>
                                        {user.role}
                                    </span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: 12 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: user.isBlocked ? "#ef4444" : "#22c55e" }} />
                                        <span style={{ fontSize: 13, fontWeight: 500, color: user.isBlocked ? "#ef4444" : "#22c55e" }}>
                                            {user.isBlocked ? "Blocked" : "Active"}
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                                        <button 
                                            onClick={() => handleBlockToggle(user)}
                                            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #cbd5e1", background: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", color: user.isBlocked ? "#22c55e" : "#ef4444" }}
                                        >
                                            {user.isBlocked ? "Unblock" : "Block"}
                                        </button>
                                        <span style={{ fontSize: 18, cursor: "pointer" }} onClick={() => setEditingUser(user)}>📝</span>
                                        <span style={{ fontSize: 18, cursor: "pointer", color: "#ef4444" }} onClick={() => handleDelete(user.id)}>🗑</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 800 }}>
                            <thead>
                                <tr style={{ background: "#f8f9fa", textAlign: "left" }}>
                                    <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>User</th>
                                    <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>Role</th>
                                    <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>Status</th>
                                    <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                        <td style={{ padding: "16px 20px" }}>
                                            <div style={{ fontWeight: 600, color: "#1e293b" }}>{user.firstName} {user.lastName}</div>
                                            <div style={{ fontSize: 12, color: "#94a3b8" }}>{user.email}</div>
                                        </td>
                                        <td style={{ padding: "16px 20px" }}>
                                            <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: "#f1f5f9", color: "#475569" }}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: "16px 20px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <span style={{ width: 8, height: 8, borderRadius: "50%", background: user.isBlocked ? "#ef4444" : "#22c55e" }} />
                                                <span style={{ fontSize: 13, fontWeight: 500, color: user.isBlocked ? "#ef4444" : "#22c55e" }}>
                                                    {user.isBlocked ? "Blocked" : "Active"}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: "16px 20px" }}>
                                            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                                <button 
                                                    onClick={() => handleBlockToggle(user)}
                                                    style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #cbd5e1", background: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", color: user.isBlocked ? "#22c55e" : "#ef4444" }}
                                                >
                                                    {user.isBlocked ? "Unblock" : "Block"}
                                                </button>
                                                <span style={{ cursor: "pointer" }} onClick={() => setEditingUser(user)}>📝</span>
                                                <span style={{ cursor: "pointer", color: "#ef4444" }} onClick={() => handleDelete(user.id)}>🗑</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Edit Modal Refactored for Responsiveness */}
                {editingUser && (
                    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 16 }}>
                        <div style={{ background: "white", padding: isMobile ? 20 : 32, borderRadius: 16, width: "100%", maxWidth: 450, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
                            <h3 style={{ marginBottom: 24, fontSize: 18, fontWeight: 700 }}>Edit User Details</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                                <div>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>First Name</label>
                                    <input 
                                        value={editingUser.firstName}
                                        onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})}
                                        style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: 8, outline: "none" }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Last Name</label>
                                    <input 
                                        value={editingUser.lastName}
                                        onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})}
                                        style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: 8, outline: "none" }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Account Role</label>
                                    <select 
                                        value={editingUser.role}
                                        onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                                        style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: 8, outline: "none", background: "white" }}
                                    >
                                        <option value="Customer">Customer</option>
                                        <option value="Vendor">Vendor</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 12, marginTop: 32, justifyContent: "flex-end" }}>
                                <button onClick={() => setEditingUser(null)} style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #e2e8f0", background: "white", cursor: "pointer", fontSize: 14, fontWeight: 500 }}>Cancel</button>
                                <button onClick={handleEditSave} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "#3F51B5", color: "white", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
