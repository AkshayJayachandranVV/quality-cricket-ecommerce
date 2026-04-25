import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './Components/Shared/ProtectedRoute';

// User Imports
import HomePage from './Components/User/Home/HomePage';
import LoginPage from './Components/User/Login/Login';
import SignupPage from './Components/User/Signup/SignupPage';
import ProductPage from './Components/User/Products/ProductPage';
import ProductDetailsPage from './Components/User/Products/ProductDetailsPage';
import CheckoutPage from './Components/User/Checkout/CheckoutPage';
import RateProductPage from './Components/User/Products/RateProductPage';
import CartPage from './Components/User/Cart/CartPage';
import AccountPage from './Components/User/Account/AccountPage';
import OrdersPage from './Components/User/Account/OrdersPage';
import SecurityPage from './Components/User/Account/SecurityPage';
import AddressesPage from './Components/User/Account/AddressesPage';
import WalletPage from './Components/User/Account/WalletPage';
import ContactUsPage from './Components/User/Contact/ContactUsPage';
import FAQPage from './Components/User/Documentation/FAQPage';

// Admin Imports
import AdminDashboard from './Components/Admin/AdminDashboard';
import AddProduct from './Components/Admin/AddProduct';
import AllProducts from './Components/Admin/AllProducts';
import AllUsers from './Components/Admin/AllUsers';
import AdminOrders from './Components/Admin/AdminOrders';
import AdminLogin from './Components/Admin/AdminLogin';
import AdminFAQs from './Components/Admin/AdminFAQs';

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/products" element={<ProductPage />} />
                <Route path="/product/:id" element={<ProductDetailsPage />} />
                <Route path="/contact" element={<ContactUsPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Protected User Routes */}
                <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                <Route path="/rate-product/:id" element={<ProtectedRoute><RateProductPage /></ProtectedRoute>} />
                <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
                <Route path="/account/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                <Route path="/account/security" element={<ProtectedRoute><SecurityPage /></ProtectedRoute>} />
                <Route path="/account/addresses" element={<ProtectedRoute><AddressesPage /></ProtectedRoute>} />
                <Route path="/account/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />

                {/* Protected Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute requiredRole="Admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/add-product" element={<ProtectedRoute requiredRole="Admin"><AddProduct /></ProtectedRoute>} />
                <Route path="/admin/products" element={<ProtectedRoute requiredRole="Admin"><AllProducts /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute requiredRole="Admin"><AllUsers /></ProtectedRoute>} />
                <Route path="/admin/orders" element={<ProtectedRoute requiredRole="Admin"><AdminOrders /></ProtectedRoute>} />
                <Route path="/admin/faqs" element={<ProtectedRoute requiredRole="Admin"><AdminFAQs /></ProtectedRoute>} />

                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
