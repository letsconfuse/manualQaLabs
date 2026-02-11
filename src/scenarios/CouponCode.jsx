import React, { useState } from 'react';
import { ShoppingCart, Tag } from 'lucide-react';

export const CouponConfig = {
    id: 'coupon-code',
    title: 'The Coupon Code',
    description: 'Apply a discount to your shopping cart. Watch out for stacking, expiry, and negative totals.',
    requirements: [
        { id: 'expired', title: 'Expired Coupon', explanation: 'Old codes should be rejected gracefully.' },
        { id: 'stacking', title: 'Coupon Stacking', explanation: 'Prevent applying the same coupon twice.' },
        { id: 'negative', title: 'Negative Total', explanation: 'Discount cannot exceed cart total (unless store credit).' },
        { id: 'case', title: 'Case Sensitivity', explanation: 'Code "save10" should work same as "SAVE10".' },
        { id: 'sqli', title: 'SQL Injection', explanation: 'Codes are DB queries too.' },
        { id: 'invalid', title: 'Invalid Code', explanation: 'Standard error for non-existent codes.' },
    ]
};

const CouponCode = ({ addLog }) => {
    const [cartTotal, setCartTotal] = useState(100);
    const [couponInput, setCouponInput] = useState('');
    const [appliedCoupons, setAppliedCoupons] = useState([]);

    const handleApply = (e) => {
        e.preventDefault();
        const code = couponInput.trim();
        const upperCode = code.toUpperCase();

        addLog({ type: 'info', message: `Applying code: "${code}"` });

        if (!code) return;

        // Check Case Sensitivity Edge Case
        if (code !== upperCode && (upperCode === 'SAVE10' || upperCode === 'VIP50')) {
            // If they typed lowercase but it worked, that's a pass for case sensitivity check really,
            // but let's explicity log it if they tried lowercase.
            addLog({ type: 'success', message: 'UX: Case sensitivity tested.', edgeCaseId: 'case' });
        }

        // Check SQLi
        if (code.includes("'") || code.includes("--")) {
            addLog({ type: 'success', message: 'Security: SQL Injection attempt.', edgeCaseId: 'sqli' });
            return;
        }

        // Check if already applied (Stacking)
        if (appliedCoupons.includes(upperCode)) {
            addLog({ type: 'success', message: 'Logic: Coupon stacking attempted.', edgeCaseId: 'stacking' });
            return;
        }

        // Logic for specific codes
        if (upperCode === 'SUMMER2020') {
            addLog({ type: 'success', message: 'Logic: Expired coupon used.', edgeCaseId: 'expired' });
        } else if (upperCode === 'SAVE10') {
            applyDiscount(10, 'SAVE10');
        } else if (upperCode === 'VIP50') {
            applyDiscount(50, 'VIP50');
        } else if (upperCode === 'MEGA1000') {
            // Mock a huge discount to test negative total
            if (cartTotal - 1000 < 0) {
                addLog({ type: 'success', message: 'Logic: Discount exceeds total (Negative Price).', edgeCaseId: 'negative' });
                setCartTotal(0); // Cap at 0 for UI
            } else {
                applyDiscount(1000, 'MEGA1000');
            }
        } else {
            addLog({ type: 'info', message: 'Invalid coupon code.' });
            // Could map to 'invalid' requirement if we strictly track it
        }

        setCouponInput('');
    };

    const applyDiscount = (amount, code) => {
        setCartTotal(prev => Math.max(0, prev - amount));
        setAppliedCoupons(prev => [...prev, code]);
        addLog({ type: 'info', message: `Coupon ${code} applied. -$${amount}` });
    };

    const resetCart = () => {
        setCartTotal(100);
        setAppliedCoupons([]);
        addLog({ type: 'info', message: 'Cart reset.' });
    };

    return (
        <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow-lg text-slate-900">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <ShoppingCart className="text-primary" /> Cart
                </h3>
                <div className="text-right">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-2xl font-bold text-slate-800">${cartTotal.toFixed(2)}</p>
                </div>
            </div>

            <div className="space-y-4">
                <form onSubmit={handleApply} className="flex gap-2">
                    <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Promo Code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded transition-colors whitespace-nowrap"
                    >
                        Apply
                    </button>
                </form>

                <div className="bg-slate-50 p-3 rounded text-xs space-y-1 border border-slate-100">
                    <p className="font-semibold text-gray-500 mb-1">Available Codes (Hidden Hints):</p>
                    <p className="font-mono text-slate-600">SAVE10 <span className="text-gray-400">($10 off)</span></p>
                    <p className="font-mono text-slate-600">SUMMER2020 <span className="text-gray-400">(Expired)</span></p>
                    <p className="font-mono text-slate-600">MEGA1000 <span className="text-gray-400">($1000 off)</span></p>
                </div>

                <button onClick={resetCart} className="w-full text-xs text-gray-400 hover:text-gray-600 underline">
                    Reset Cart
                </button>
            </div>
        </div>
    );
};

export default CouponCode;
