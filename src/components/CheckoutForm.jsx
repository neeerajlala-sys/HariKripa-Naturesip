import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MapPin, Phone, Home, User, CreditCard, Package } from 'lucide-react';

const schema = z.object({
    fullName: z.string().min(3, "Full Name is required"),
    contact: z.string().regex(/^[0-9]{10}$/, "Invalid contact number (10 digits)"),
    houseNo: z.string().min(1, "House number is required"),
    locality: z.string().min(3, "Locality is required"),
    pincode: z.string().regex(/^[0-9]{6}$/, "Invalid Pincode (6 digits)"),
    orderType: z.enum(['regular', 'sample']).default('regular'),
});

const CheckoutForm = ({ onSubmit, onCancel, amount, items = [] }) => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { orderType: 'regular' }
    });

    const orderType = watch('orderType');

    return (
        <div className="checkout-form" style={{ maxHeight: '85vh', overflowY: 'auto', padding: '10px' }}>
            <h2 style={{ marginBottom: '10px', color: 'var(--color-forest)', textAlign: 'center' }}>Secure Checkout</h2>

            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '20px', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.85rem', marginBottom: '10px', opacity: 0.6 }}>Order Summary</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span>{item.name} <span style={{ opacity: 0.5 }}>x {item.quantity || 1}</span></span>
                            <span style={{ fontWeight: 700 }}>₹{(item.quantity || 1) * 374}</span>
                        </div>
                    ))}
                </div>
                <div style={{ borderTop: '1px solid #ddd', marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                    <span>Total (Incl. Discount)</span>
                    <span style={{ color: 'var(--color-emerald)' }}>₹{orderType === 'sample' ? 0 : amount}</span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', background: '#f8f9fa', padding: '5px', borderRadius: '15px' }}>
                <label style={{ flex: 1, cursor: 'pointer', textAlign: 'center', padding: '10px', borderRadius: '12px', background: orderType === 'regular' ? 'white' : 'transparent', boxShadow: orderType === 'regular' ? '0 2px 10px rgba(0,0,0,0.05)' : 'none', fontWeight: 600, transition: '0.3s' }}>
                    <input type="radio" value="regular" {...register('orderType')} style={{ display: 'none' }} />
                    Full Pack
                </label>
                <label style={{ opacity: items.some(i => i.size !== '100g' && i.size !== '60 Tabs') ? 0.4 : 1, flex: 1, cursor: items.some(i => i.size !== '100g' && i.size !== '60 Tabs') ? 'not-allowed' : 'pointer', textAlign: 'center', padding: '10px', borderRadius: '12px', background: orderType === 'sample' ? 'white' : 'transparent', boxShadow: orderType === 'sample' ? '0 2px 10px rgba(0,0,0,0.05)' : 'none', fontWeight: 600, transition: '0.3s' }}>
                    <input type="radio" value="sample" disabled={items.some(i => i.size !== '100g' && i.size !== '60 Tabs')} {...register('orderType')} style={{ display: 'none' }} />
                    Sample Pack
                </label>
            </div>
            {items.some(i => i.size !== '100g' && i.size !== '60 Tabs') && (
                <p style={{ fontSize: '0.75rem', color: '#ff4d4f', textAlign: 'center', marginTop: '-10px', marginBottom: '15px' }}>
                    * Samples are only available for our smallest size packs.
                </p>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', fontSize: '0.85rem', fontWeight: 600 }}>
                        <User size={16} /> Full Name
                    </label>
                    <input
                        {...register('fullName')}
                        placeholder="e.g. Rahul Sharma"
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: errors.fullName ? '1px solid #ff4d4f' : '1px solid #ddd' }}
                    />
                    {errors.fullName && <span style={{ color: '#ff4d4f', fontSize: '0.75rem' }}>{errors.fullName.message}</span>}
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', fontSize: '0.85rem', fontWeight: 600 }}>
                        <Phone size={16} /> Contact Number
                    </label>
                    <input
                        {...register('contact')}
                        placeholder="10 digit mobile number"
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: errors.contact ? '1px solid #ff4d4f' : '1px solid #ddd' }}
                    />
                    {errors.contact && <span style={{ color: '#ff4d4f', fontSize: '0.75rem' }}>{errors.contact.message}</span>}
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', fontSize: '0.85rem', fontWeight: 600 }}>
                        <Home size={16} /> House No / Flat / Floor
                    </label>
                    <input
                        {...register('houseNo')}
                        placeholder="House No, Apartment name"
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: errors.houseNo ? '1px solid #ff4d4f' : '1px solid #ddd' }}
                    />
                    {errors.houseNo && <span style={{ color: '#ff4d4f', fontSize: '0.75rem' }}>{errors.houseNo.message}</span>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', fontSize: '0.85rem', fontWeight: 600 }}>
                            <MapPin size={16} /> Locality
                        </label>
                        <input
                            {...register('locality')}
                            placeholder="Area / Sector"
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: errors.locality ? '1px solid #ff4d4f' : '1px solid #ddd' }}
                        />
                        {errors.locality && <span style={{ color: '#ff4d4f', fontSize: '0.75rem' }}>{errors.locality.message}</span>}
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', fontSize: '0.85rem', fontWeight: 600 }}>
                            Pincode
                        </label>
                        <input
                            {...register('pincode')}
                            placeholder="6 digit PIN"
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: errors.pincode ? '1px solid #ff4d4f' : '1px solid #ddd' }}
                        />
                        {errors.pincode && <span style={{ color: '#ff4d4f', fontSize: '0.75rem' }}>{errors.pincode.message}</span>}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" onClick={onCancel} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #ddd', background: 'none', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                    <button type="submit" className="btn-primary" style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        {orderType === 'sample' ? <Package size={18} /> : <CreditCard size={18} />}
                        {orderType === 'sample' ? 'Order Free Sample' : 'Pay via UPI'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CheckoutForm;
