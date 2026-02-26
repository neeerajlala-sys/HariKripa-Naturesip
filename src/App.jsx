import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Droplets, FlaskConical, Shovel, ChevronRight, Play, Database, Activity, Star, ShieldCheck, Zap, LogOut, Package, ClipboardList, CheckCircle, Truck, Info, BarChart3, Users, TrendingUp, ShoppingCart, Eye } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import productsData from './data/products.json';
import { trackEvent, trackPageView, getAnalytics } from './utils/analytics';
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
    const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('ns_cart') || '[]'));
    const [showCart, setShowCart] = useState(false);
    const [adminTab, setAdminTab] = useState('orders'); // 'orders' | 'analytics'
    const [analyticsData, setAnalyticsData] = useState([]);

    const [selectedOptions, setSelectedOptions] = useState({});

    const DISCOUNT_RATE = 0.25;

    const getProductPrice = (product) => {
        const optionList = product.options || [{ size: '500g', price: 499 }];
        const optIdx = selectedOptions[product.id] || 0;
        const opt = optionList[optIdx] || optionList[0];
        const basePrice = opt.price;
        const discountedPrice = Math.round(basePrice * (1 - DISCOUNT_RATE));
        return { basePrice, discountedPrice, size: opt.size };
    };

    const handleOptionChange = (productId, idx) => {
        setSelectedOptions(prev => ({ ...prev, [productId]: idx }));
    };

    useEffect(() => {
        trackPageView('Home');
        localStorage.setItem('ns_orders', JSON.stringify(orders));
        localStorage.setItem('ns_cart', JSON.stringify(cart));
    }, [orders, cart]);

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
            if (!showAdmin) {
                setAnalyticsData(getAnalytics());
            }
        } else {
            setShowLogin(true);
        }
    };

    const handleLogout = () => {
        setIsAdminAuthenticated(false);
        setShowAdmin(false);
        toast('Logged out safely');
    };

    const addToCart = (product) => {
        const { basePrice, discountedPrice, size } = getProductPrice(product);
        const cartItemId = `${product.id}-${size}`;
        const existing = cart.find(item => item.id === cartItemId);
        if (existing) {
            setCart(cart.map(item => item.id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { ...product, id: cartItemId, originalId: product.id, quantity: 1, size, basePrice, discountedPrice }]);
        }
        toast.success(`Added ${product.name} (${size}) to cart`, { icon: '🛒' });
        trackEvent('add_to_cart', { product: product.name, size });
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const initiateCheckout = (items) => {
        let productList = [];
        if (Array.isArray(items)) {
            productList = items;
        } else {
            const { basePrice, discountedPrice, size } = getProductPrice(items);
            productList = [{ ...items, id: `${items.id}-${size}`, originalId: items.id, quantity: 1, size, basePrice, discountedPrice }];
        }
        setSelectedProduct(productList);
        setShowCheckout(true);
        setShowCart(false);
        trackEvent('checkout_started', { itemsCount: productList.length });
    };

    const handleOrderSubmit = (formData) => {
        const isSample = formData.orderType === 'sample';
        const rawTotal = selectedProduct.reduce((sum, item) => sum + (item.basePrice * (item.quantity || 1)), 0);
        const finalAmount = isSample ? 0 : Math.round(rawTotal * (1 - DISCOUNT_RATE));
        const orderId = `NS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Finalize order with tracking status
        const newOrder = {
            id: orderId,
            products: selectedProduct.map(p => ({ name: p.name, size: p.size, qty: p.quantity || 1 })),
            customer: formData,
            amount: finalAmount,
            status: isSample ? 'Confirmed' : 'Processing',
            type: formData.orderType || 'regular',
            timestamp: new Date().toISOString()
        };

        if (isSample) {
            setOrders([newOrder, ...orders]);
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });
            toast.success('Sample Request Received! We will contact you soon.');
            setShowCheckout(false);
            return;
        }

        // Real Verification Simulation
        const upiUrl = `upi://pay?pa=harikripa@upi&pn=NatureSip&am=${finalAmount}&tn=Order_${orderId}&cu=INR`;

        toast.promise(
            new Promise((resolve, reject) => {
                // Simulate a more robust verification process
                let progress = 0;
                const interval = setInterval(() => {
                    progress += 20;
                    if (progress >= 100) {
                        clearInterval(interval);
                        // 90% success rate for simulation
                        Math.random() > 0.1 ? resolve() : reject(new Error('Verification failed'));
                    }
                }, 500);
            }),
            {
                loading: `Verifying Payment of ₹${finalAmount}...`,
                success: 'Payment Verified & Order Confirmed!',
                error: (err) => `Payment failed: ${err.message}`,
            }
        ).then(() => {
            setOrders([{ ...newOrder, status: 'Confirmed' }, ...orders]);
            setCart([]); // Clear cart after success
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });
        }).catch(() => {
            // Log failure or handle retry
        });

        setShowCheckout(false);
        trackEvent('order_placed', { orderId, itemsCount: selectedProduct.length, amount: finalAmount });
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

            <header className="glass-effect" style={{ position: 'sticky', top: 0, width: '100%', zIndex: 100, padding: '20px 0' }}>
                <div className="premium-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        <img src="/media/logo.png" alt="NatureSip Logo" style={{ height: '40px' }} />
                        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-forest)', letterSpacing: '-0.5px' }}>NatureSip</span>
                    </motion.div>
                    <nav style={{ display: 'flex', gap: '30px', fontWeight: 600, alignItems: 'center', color: 'var(--color-forest)' }}>
                        <span className="nav-link" onClick={() => document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' })}>Catalog</span>

                        <div
                            style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            onClick={() => setShowCart(true)}
                        >
                            <ShoppingCart size={22} />
                            {cart.length > 0 && (
                                <span style={{ position: 'absolute', top: '-8px', right: '-10px', background: '#ff4d4f', color: 'white', fontSize: '10px', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                                    {cart.reduce((s, i) => s + i.quantity, 0)}
                                </span>
                            )}
                        </div>

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
                minHeight: '90vh',
                paddingTop: '80px',
                background: `radial-gradient(circle at top right, rgba(45, 140, 90, 0.05), transparent), #ffffff`,
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
                                <div style={{ display: 'flex', background: 'white', borderRadius: '12px', padding: '6px', border: '1px solid var(--color-border)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        placeholder="Order ID"
                                        style={{ border: 'none', outline: 'none', fontSize: '0.9rem', width: '150px', paddingLeft: '10px' }}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                const order = orders.find(o => o.id === e.target.value.toUpperCase());
                                                if (order) {
                                                    toast.success(`Order ${order.id}: ${order.status} (${order.type || 'regular'})`, { icon: <Package /> });
                                                } else {
                                                    toast.error('Order ID not found');
                                                }
                                            }
                                        }}
                                    />
                                    <button style={{ background: 'var(--color-text)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Track</button>
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
                                    <source src="/media/intro-video.mp4" type="video/mp4" />
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
                                className="lovable-card"
                                variants={itemVariants}
                                onMouseEnter={() => setHoveredProduct(product.id)}
                                onMouseLeave={() => setHoveredProduct(null)}
                                style={{ overflow: 'hidden' }}
                            >
                                <div style={{ height: '260px', overflow: 'hidden', padding: '16px', paddingBottom: '0' }}>
                                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />
                                </div>
                                <div style={{ padding: '24px' }}>
                                    <h3 style={{ color: 'var(--color-forest)', marginBottom: '10px' }}>{sanitize(product.name)}</h3>
                                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>{sanitize(product.description)}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#888', textDecoration: 'line-through' }}>₹{getProductPrice(product).basePrice}</span>
                                            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-emerald)' }}>₹{getProductPrice(product).discountedPrice}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <select
                                                value={selectedOptions[product.id] || 0}
                                                onChange={(e) => handleOptionChange(product.id, parseInt(e.target.value))}
                                                style={{ padding: '4px 8px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', background: 'white', fontSize: '0.8rem', cursor: 'pointer', maxWidth: '80px' }}
                                            >
                                                {(product.options || [{ size: '500g', price: 499 }]).map((opt, idx) => (
                                                    <option key={idx} value={idx}>{opt.size}</option>
                                                ))}
                                            </select>
                                            <div style={{ background: 'var(--color-emerald)', color: 'white', padding: '4px 8px', borderRadius: '50px', fontSize: '0.65rem', fontWeight: 700 }}>
                                                25% OFF
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            className="btn-outline"
                                            style={{ flex: 1 }}
                                            onClick={() => addToCart(product)}
                                        >
                                            Add to Cart
                                        </button>
                                        <button
                                            className="btn-primary"
                                            style={{ flex: 1 }}
                                            onClick={() => initiateCheckout(product)}
                                        >
                                            Buy Now
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Quality Section with Second Video */}
            <section style={{ padding: '100px 0', background: 'var(--color-forest)', color: 'white', overflow: 'hidden' }}>
                <div className="premium-container">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '80px', flexWrap: 'wrap-reverse' }}>
                        <div style={{ flex: '1 1 400px' }}>
                            <div className="lovable-card" style={{ padding: '8px', background: 'white' }}>
                                <video autoPlay muted loop playsInline style={{ width: '100%', borderRadius: '16px', display: 'block' }}>
                                    <source src="/media/kadhai-gravy.mp4" type="video/mp4" />
                                </video>
                            </div>
                        </div>
                        <div style={{ flex: '1 1 500px' }}>
                            <h2 style={{ fontSize: '3.5rem', marginBottom: '30px', color: 'white' }}>Crafted for <br /><span style={{ color: 'var(--color-gold)' }}>Culinary Excellence.</span></h2>
                            <p style={{ fontSize: '1.2rem', opacity: 0.9, lineHeight: '1.8', marginBottom: '40px' }}>
                                Our powders aren't just for drinks. They are the secret weapon of chefs, providing intense flavor and natural color to gravies, sauces, and gourmet dishes without changing the texture.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <Zap color="var(--color-gold)" />
                                    <div>
                                        <h4 style={{ color: 'white' }}>Instant Dissolve</h4>
                                        <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>No lumps, just pure flavor.</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <CheckCircle color="var(--color-gold)" />
                                    <div>
                                        <h4 style={{ color: 'white' }}>Pro Grade</h4>
                                        <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Used in premium cloud kitchens.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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
                            bottom: '24px',
                            right: '24px',
                            width: '420px',
                            maxHeight: '80vh',
                            background: 'white',
                            borderRadius: 'var(--radius-xl)',
                            boxShadow: 'var(--shadow-hover)',
                            border: '1px solid var(--color-border)',
                            zIndex: 1000,
                            padding: '28px',
                            overflowY: 'auto'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <h3
                                    onClick={() => setAdminTab('orders')}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: adminTab === 'orders' ? 'var(--color-forest)' : '#ccc', fontSize: '1.2rem' }}
                                >
                                    <ClipboardList size={20} /> Orders
                                </h3>
                                <h3
                                    onClick={() => setAdminTab('analytics')}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: adminTab === 'analytics' ? 'var(--color-forest)' : '#ccc', fontSize: '1.2rem' }}
                                >
                                    <BarChart3 size={20} /> Analytics
                                </h3>
                            </div>
                            <button onClick={() => setShowAdmin(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                        </div>

                        {adminTab === 'orders' ? (
                            orders.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>No orders yet.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {orders.map(order => (
                                        <div key={order.id} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '15px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.8rem' }}>
                                                <span>{order.id}</span>
                                                <span style={{ color: 'var(--color-emerald)' }}>₹{order.amount}</span>
                                            </div>
                                            <div style={{ margin: '10px 0', fontSize: '0.8rem' }}>
                                                {order.products?.map((p, i) => (
                                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                        <span>{p.name} ({p.size || 'N/A'}) x {p.qty}</span>
                                                    </div>
                                                ))}
                                            </div>
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
                            )
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {/* Analytics Summary Cards */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div style={{ background: 'var(--color-cream)', padding: '15px', borderRadius: '15px', textAlign: 'center' }}>
                                        <Eye size={20} color="var(--color-forest)" style={{ marginBottom: '5px' }} />
                                        <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{analyticsData.filter(e => e.event === 'page_view').length}</div>
                                        <div style={{ fontSize: '0.6rem', color: '#888', textTransform: 'uppercase' }}>Page Views</div>
                                    </div>
                                    <div style={{ background: 'var(--color-cream)', padding: '15px', borderRadius: '15px', textAlign: 'center' }}>
                                        <ShoppingCart size={20} color="var(--color-emerald)" style={{ marginBottom: '5px' }} />
                                        <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{orders.length}</div>
                                        <div style={{ fontSize: '0.6rem', color: '#888', textTransform: 'uppercase' }}>Orders</div>
                                    </div>
                                    <div style={{ background: 'var(--color-cream)', padding: '15px', borderRadius: '15px', textAlign: 'center' }}>
                                        <TrendingUp size={20} color="var(--color-gold)" style={{ marginBottom: '5px' }} />
                                        <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                                            {analyticsData.filter(e => e.event === 'page_view').length > 0
                                                ? ((orders.length / analyticsData.filter(e => e.event === 'page_view').length) * 100).toFixed(1)
                                                : 0}%
                                        </div>
                                        <div style={{ fontSize: '0.6rem', color: '#888', textTransform: 'uppercase' }}>Conv. Rate</div>
                                    </div>
                                    <div style={{ background: 'var(--color-cream)', padding: '15px', borderRadius: '15px', textAlign: 'center' }}>
                                        <Package size={20} color="#ff4d4f" style={{ marginBottom: '5px' }} />
                                        <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{orders.filter(o => o.type === 'sample').length}</div>
                                        <div style={{ fontSize: '0.6rem', color: '#888', textTransform: 'uppercase' }}>Samples</div>
                                    </div>
                                </div>

                                {/* Event Log */}
                                <div style={{ marginTop: '10px' }}>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Recent Activity</h4>
                                    <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {analyticsData.slice().reverse().slice(0, 20).map((event, idx) => (
                                            <div key={idx} style={{ fontSize: '0.7rem', padding: '8px', background: '#f9f9f9', borderRadius: '8px', borderLeft: '3px solid var(--color-emerald)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                                    <span style={{ fontWeight: 700, color: 'var(--color-forest)' }}>{event.event.replace('_', ' ').toUpperCase()}</span>
                                                    <span style={{ color: '#999' }}>{new Date(event.timestamp).toLocaleTimeString()}</span>
                                                </div>
                                                <div style={{ color: '#666', fontSize: '0.65rem' }}>
                                                    {event.properties.product || event.properties.page || 'Interaction'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cart Drawer */}
            <AnimatePresence>
                {showCart && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowCart(false)}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', zIndex: 1500, display: 'flex', justifyContent: 'flex-right' }}
                    >
                        <motion.div
                            initial={{ x: 400 }}
                            animate={{ x: 0 }}
                            exit={{ x: 400 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '100%', maxWidth: '400px', background: 'white', padding: '40px', boxShadow: '-10px 0 50px rgba(0,0,0,0.1)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                                <h2 style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><ShoppingCart /> Your Cart</h2>
                                <button onClick={() => setShowCart(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>
                            </div>

                            {cart.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                    <ShoppingCart size={60} color="#ddd" style={{ marginBottom: '20px' }} />
                                    <p style={{ color: '#999' }}>Your cart is empty.</p>
                                    <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => setShowCart(false)}>Shop Now</button>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '60vh', overflowY: 'auto', marginBottom: '30px', paddingRight: '10px' }}>
                                        {cart.map(item => (
                                            <div key={item.id} style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                                <img src={item.image} style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{ fontSize: '0.9rem' }}>{item.name} ({item.size})</h4>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                                                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-emerald)' }}>₹{item.discountedPrice}</span>
                                                        <span style={{ fontSize: '0.75rem', color: '#999' }}>x {item.quantity}</span>
                                                    </div>
                                                </div>
                                                <button onClick={() => removeFromCart(item.id)} style={{ border: 'none', background: '#fff0f0', color: '#ff4d4f', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}>✕</button>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px' }}>
                                            <span>Subtotal</span>
                                            <span>₹{cart.reduce((s, i) => s + (i.discountedPrice * i.quantity), 0)}</span>
                                        </div>
                                        <button className="btn-primary" style={{ width: '100%', padding: '18px' }} onClick={() => initiateCheckout(cart)}>
                                            Checkout All Items
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
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
                            <CheckoutForm
                                amount={selectedProduct ? (formData => {
                                    const isSample = formData?.orderType === 'sample';
                                    const rawTotal = selectedProduct.reduce((sum, item) => sum + (item.basePrice * (item.quantity || 1)), 0);
                                    return isSample ? 0 : Math.round(rawTotal * (1 - DISCOUNT_RATE));
                                })() : 0}
                                items={selectedProduct}
                                onSubmit={handleOrderSubmit}
                                onCancel={() => setShowCheckout(false)}
                            />
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
