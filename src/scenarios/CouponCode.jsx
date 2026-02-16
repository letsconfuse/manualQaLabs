import React, { useState } from 'react';
import { ShoppingCart, Tag } from 'lucide-react';

export const CouponConfig = {
    id: 'coupon-code',
    title: 'The Coupon Code',
    description: 'Apply a discount. Test expired codes, stacking, and negative totals.',
    type: 'validation',
    difficulty: 'Hard',
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
        <div className="w-full max-w-sm bg-slate-900 border border-slate-700 p-0 rounded-xl shadow-2xl overflow-hidden">
            <div className="bg-slate-800 p-6 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <ShoppingCart className="text-indigo-500" /> Cart
                </h3>
                <div className="text-right">
                    <p className="text-xs text-slate-400">Total</p>
                    <p className="text-2xl font-bold text-white">${cartTotal.toFixed(2)}</p>
                </div>
            </div>

            <div className="p-6 space-y-6">
                <form onSubmit={handleApply} className="flex gap-2">
                    <input
                        type="text"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-mono"
                        placeholder="Promo Code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-6 rounded-lg border border-slate-700 transition-colors whitespace-nowrap active:scale-[0.98]"
                    >
                        Apply
                    </button>
                </form>

                <div className="bg-slate-800/50 p-4 rounded-lg text-xs space-y-2 border border-slate-700/50">
                    <p className="font-bold text-slate-400 uppercase tracking-wider mb-2">Available Codes (Hidden Hints):</p>
                    <div className="flex flex-col gap-1">
                        <p className="font-mono text-emerald-400">SAVE10 <span className="text-slate-500">($10 off)</span></p>
                        <p className="font-mono text-slate-500 line-through decoration-slate-600">SUMMER2020 <span className="text-slate-600">(Expired)</span></p>
                        <p className="font-mono text-purple-400">MEGA1000 <span className="text-slate-500">($1000 off)</span></p>
                    </div>
                </div>

                <button onClick={resetCart} className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors underline decoration-slate-700 hover:decoration-slate-400">
                    Reset Cart
                </button>
            </div>
        </div>
    );
};

export default CouponCode;
