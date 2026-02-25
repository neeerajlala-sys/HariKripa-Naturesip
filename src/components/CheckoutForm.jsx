import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MapPin, Phone, Home, User, CreditCard } from 'lucide-react';

const schema = z.object({
    fullName: z.string().min(3, "Full Name is required"),
    contact: z.string().regex(/^[0-9]{10}$/, "Invalid contact number (10 digits)"),
    houseNo: z.string().min(1, "House number is required"),
    locality: z.string().min(3, "Locality is required"),
    pincode: z.string().regex(/^[0-9]{6}$/, "Invalid Pincode (6 digits)"),
});

const CheckoutForm = ({ onSubmit, onCancel, amount }) => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema)
    });

    return (
        <div className="checkout-form">
            <h2 style={{ marginBottom: '20px', color: 'var(--color-forest)', textAlign: 'center' }}>Secure Checkout</h2>
            <p style={{ textAlign: 'center', marginBottom: '30px', color: '#666' }}>Amount to Pay: <span style={{ fontWeight: 800, color: 'var(--color-emerald)' }}>₹{amount}</span></p>

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
                        <CreditCard size={18} /> Pay via UPI
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CheckoutForm;
