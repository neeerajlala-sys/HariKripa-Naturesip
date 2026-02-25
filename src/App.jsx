import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Droplets, FlaskConical, Shovel, ChevronRight, Play, Database, Activity, Star, ShieldCheck, Zap, LogOut, Package, ClipboardList, CheckCircle, Truck, Info } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import productsData from './data/products.json';
import { trackEvent, trackPageView } from './utils/analytics';
import CheckoutForm from './components/CheckoutForm';

// Security Helper
const sanitize = (str) => typeof str === 'string' ? str.replace(/[<>]/g, '') : str;

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

function App() {
    const [activeCategory, setActiveCategory] = useState('All');
    const [showAdmin, setShowAdmin] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [loginCreds, setLoginCreds] = useState({ user: '', pass: '' });
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const [showCheckout, setShowCheckout] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [orders, setOrders] = useState(() => JSON.parse(localStorage.getItem('ns_orders') || '[]'));

    useEffect(() => {
        trackPageView('Home');
        localStorage.setItem('ns_orders', JSON.stringify(orders));
    }, [orders]);

    const filteredProducts = activeCategory === 'All'
        ? productsData
        : productsData.filter(p => p.category === activeCategory);

    const categories = ['All', ...new Set(productsData.map(p => p.category))];

    const handleLogin = (e) => {
        e.preventDefault();
        // Updated credentials based on user request
        if (loginCreds.user === 'HARIKRIPA' && loginCreds.pass === 'HARIKRIPA1') {
            setIsAdminAuthenticated(true);
            setShowLogin(false);
            setShowAdmin(true);
            toast.success('Admin Authenticated');
            trackEvent('admin_login_success');
        } else {
            toast.error('Access Denied: Invalid Credentials');
            trackEvent('admin_login_fail', { user: loginCreds.user });
        }
    };

    const handleAdminToggle = () => {
        if (isAdminAuthenticated) {
            setShowAdmin(!showAdmin);
        } else {
            setShowLogin(true);
        }
    };

    const handleLogout = () => {
        setIsAdminAuthenticated(false);
        setShowAdmin(false);
        toast('Logged out safely');
    };

    const initiateCheckout = (product) => {
        setSelectedProduct(product);
        setShowCheckout(true);
        trackEvent('checkout_started', { product: product.name });
    };

    const handleOrderSubmit = (formData) => {
        const amount = 499; // Base price for simulation
        const orderId = `NS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Finalize order with tracking status
        const newOrder = {
            id: orderId,
            product: selectedProduct.name,
            customer: formData,
            amount: amount,
            status: 'Processing', // Stages: Processing -> Confirmed -> Shipped -> Delivered
            timestamp: new Date().toISOString()
        };

        // Simulate UPI Payment Redirect/Flow
        const upiUrl = `upi://pay?pa=harikripa@upi&pn=NatureSip&am=${amount}&tn=Order_${orderId}&cu=INR`;

        toast.promise(
            new Promise((resolve) => {
                setTimeout(() => {
                    setOrders([newOrder, ...orders]);
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                    resolve();
                }, 2000);
            }),
            {
                loading: 'Verifying UPI Payment...',
                success: 'Payment Confirmed! Your order is being processed.',
                error: 'Payment failed. Please try again.',
            }
        );

        setShowCheckout(false);
        trackEvent('order_placed', { orderId, product: selectedProduct.name });
    };

    const updateOrderStatus = (orderId, newStatus) => {
        const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
        setOrders(updated);
        toast(`Order ${orderId} status: ${newStatus}`, { icon: <Truck size={16} /> });
    };

    return (
        <div className="app">
            <Toaster position="top-right" reverseOrder={false} />
            <div className="grain-overlay" />

            <header className="glass-effect" style={{ position: 'fixed', width: '100%', zIndex: 100, padding: '15px 0' }}>
                <div className="premium-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        <img src="/src/assets/media/hari-kripa-logo-PaLxYu3Q.png" alt="NatureSip Logo" style={{ height: '40px' }} />
                        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-forest)', letterSpacing: '-0.5px' }}>NatureSip</span>
                    </motion.div>
                    <nav style={{ display: 'flex', gap: '30px', fontWeight: 600, alignItems: 'center', color: 'var(--color-forest)' }}>
                        <span className="nav-link" onClick={() => document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' })}>Catalog</span>
                        <div style={{ width: '1px', height: '20px', background: '#ddd' }} />
                        <span style={{ cursor: 'pointer', color: showAdmin ? 'var(--color-emerald)' : '#999' }} onClick={handleAdminToggle}>
                            {showAdmin ? <Activity size={20} /> : <Database size={20} />}
                        </span>
                        {isAdminAuthenticated && <LogOut size={20} style={{ cursor: 'pointer', color: '#ff4d4f' }} onClick={handleLogout} />}
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section style={{
                minHeight: '100vh',
                paddingTop: '120px',
                background: `radial-gradient(circle at top right, rgba(45, 90, 39, 0.05), transparent), url('/src/assets/media/hero-bg-DTUELamw.jpg')`,
                backgroundSize: 'cover',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div className="premium-container">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '60px', flexWrap: 'wrap' }}>
                        <motion.div
                            initial={{ opacity: 0, x: -60 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            style={{ flex: '1 1 500px' }}
                        >
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(45,90,39,0.1)', padding: '6px 15px', borderRadius: '50px', marginBottom: '20px' }}>
                                <ShieldCheck size={16} color="var(--color-forest)" />
                                <span style={{ color: 'var(--color-forest)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    Lab Tested • Zero Preservatives
                                </span>
                            </div>
                            <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)', lineHeight: '0.95', margin: '10px 0', color: 'var(--color-forest)', fontWeight: 800 }}>
                                Nutrition <br />
                                <span style={{ color: 'var(--color-emerald)' }}>Condensed.</span>
                            </h1>
                            <p style={{ fontSize: '1.25rem', color: '#555', marginBottom: '45px', maxWidth: '550px', lineHeight: '1.6' }}>
                                We use proprietary <strong>Flash Drying Technology</strong> to freeze the soul of nature into ultra-fine, nutrient-dense powders. Just add water.
                            </p>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <button className="btn-primary" onClick={() => {
                                    document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
                                }}>
                                    Explore Collection
                                </button>
                                <div style={{ display: 'flex', background: 'white', borderRadius: '50px', padding: '5px 5px 5px 20px', border: '1px solid #eee', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        placeholder="Order ID (e.g. NS-XXX)"
                                        style={{ border: 'none', outline: 'none', fontSize: '0.85rem', width: '150px' }}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                const order = orders.find(o => o.id === e.target.value.toUpperCase());
                                                if (order) {
                                                    toast.success(`Order ${order.id}: ${order.status}`, { icon: <Package /> });
                                                } else {
                                                    toast.error('Order ID not found');
                                                }
                                            }
                                        }}
                                    />
                                    <button style={{ background: 'var(--color-forest)', color: 'white', border: 'none', borderRadius: '50px', padding: '8px 15px', cursor: 'pointer', fontSize: '0.8rem' }}>Track</button>
                                </div>
                            </div>
                        </motion.div>


                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.2, delay: 0.2 }}
                            style={{ flex: '1 1 400px', position: 'relative' }}
                        >
                            <div className="glass-effect" style={{ padding: '15px', borderRadius: '40px', boxShadow: 'var(--shadow-premium)', overflow: 'hidden' }}>
                                <video autoPlay muted loop playsInline style={{ width: '100%', borderRadius: '25px', display: 'block' }}>
                                    <source src="/src/assets/media/tablet-yellow-Dv1BcmVm.mp4" type="video/mp4" />
                                </video>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Product Catalog */}
            <section id="catalog" style={{ padding: '120px 0', background: 'white' }}>
                <div className="premium-container">
                    <div style={{ marginBottom: '60px' }}>
                        <h2 style={{ fontSize: '3rem', color: 'var(--color-forest)', fontWeight: 800 }}>The Harvest</h2>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    style={{
                                        padding: '8px 20px',
                                        borderRadius: '20px',
                                        border: '1px solid #eee',
                                        background: activeCategory === cat ? 'var(--color-forest)' : 'white',
                                        color: activeCategory === cat ? 'white' : 'var(--color-forest)',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '40px' }}
                    >
                        {filteredProducts.map(product => (
                            <motion.div
                                key={product.id}
                                variants={itemVariants}
                                whileHover={{ y: -10 }}
                                onMouseEnter={() => setHoveredProduct(product.id)}
                                onMouseLeave={() => setHoveredProduct(null)}
                                style={{
                                    background: 'var(--color-cream)',
                                    borderRadius: '30px',
                                    overflow: 'hidden',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                                }}
                            >
                                <div style={{ height: '250px', overflow: 'hidden' }}>
                                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ padding: '25px' }}>
                                    <h3 style={{ color: 'var(--color-forest)', marginBottom: '10px' }}>{sanitize(product.name)}</h3>
                                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>{sanitize(product.description)}</p>
                                    <button
                                        className="btn-primary"
                                        style={{ width: '100%' }}
                                        onClick={() => initiateCheckout(product)}
                                    >
                                        Order Now
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Admin Dashboard */}
            <AnimatePresence>
                {showAdmin && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        style={{
                            position: 'fixed',
                            bottom: '20px',
                            right: '20px',
                            width: '400px',
                            maxHeight: '80vh',
                            background: 'white',
                            borderRadius: '30px',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                            zIndex: 1000,
                            padding: '25px',
                            overflowY: 'auto'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><ClipboardList /> Admin Orders</h3>
                            <button onClick={() => setShowAdmin(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
                        </div>

                        {orders.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>No orders yet.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {orders.map(order => (
                                    <div key={order.id} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '15px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.8rem' }}>
                                            <span>{order.id}</span>
                                            <span style={{ color: 'var(--color-emerald)' }}>₹{order.amount}</span>
                                        </div>
                                        <p style={{ fontWeight: 600, margin: '5px 0' }}>{order.product}</p>
                                        <p style={{ fontSize: '0.75rem', color: '#666' }}>{order.customer.fullName} | {order.customer.contact}</p>
                                        <p style={{ fontSize: '0.7rem', color: '#888' }}>{order.customer.houseNo}, {order.customer.locality}, {order.customer.pincode}</p>

                                        <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
                                            {['Confirmed', 'Shipped', 'Delivered'].map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => updateOrderStatus(order.id, s)}
                                                    style={{
                                                        fontSize: '0.6rem',
                                                        padding: '4px 8px',
                                                        borderRadius: '10px',
                                                        border: '1px solid #eee',
                                                        background: order.status === s ? 'var(--color-forest)' : 'white',
                                                        color: order.status === s ? 'white' : '#666'
                                                    }}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Login Modal */}
            <AnimatePresence>
                {showLogin && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            style={{ background: 'white', padding: '40px', borderRadius: '30px', width: '90%', maxWidth: '400px' }}
                        >
                            <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>Admin Access</h3>
                            <form onSubmit={handleLogin}>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '12px', border: '1px solid #eee' }}
                                    value={loginCreds.user}
                                    onChange={(e) => setLoginCreds({ ...loginCreds, user: e.target.value })}
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '12px', border: '1px solid #eee' }}
                                    value={loginCreds.pass}
                                    onChange={(e) => setLoginCreds({ ...loginCreds, pass: e.target.value })}
                                />
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button type="button" onClick={() => setShowLogin(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #eee' }}>Cancel</button>
                                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>Login</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Checkout Modal */}
            <AnimatePresence>
                {showCheckout && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                    >
                        <motion.div
                            initial={{ y: 50 }}
                            animate={{ y: 0 }}
                            style={{ background: 'white', padding: '30px', borderRadius: '30px', width: '100%', maxWidth: '500px' }}
                        >
                            <CheckoutForm amount={499} onSubmit={handleOrderSubmit} onCancel={() => setShowCheckout(false)} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <footer style={{ background: 'var(--color-forest)', color: 'white', padding: '60px 0' }}>
                <div className="premium-container" style={{ textAlign: 'center' }}>
                    <p>© 2024 NatureSip (Hari-Kripa) | Pure Nutrition Guaranteed</p>
                </div>
            </footer>
        </div>
    );
}

export default App;
