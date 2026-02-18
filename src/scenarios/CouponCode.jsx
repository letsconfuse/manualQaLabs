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
    const [discounts, setDiscounts] = useState([]); // { code, amount }

    const handleApply = (e) => {
        e.preventDefault();
        const code = couponInput.trim();
        const upperCode = code.toUpperCase();

        addLog({ type: 'info', message: `Applying code: "${code}"` });

        if (!code) return;

        // Check Case Sensitivity Edge Case
        if (code !== upperCode && (upperCode === 'SAVE10' || upperCode === 'VIP50')) {
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
            if (cartTotal - 1000 < 0) {
                addLog({ type: 'success', message: 'Logic: Discount exceeds total (Negative Price).', edgeCaseId: 'negative' });
                // We allow negative visually for the "Receipt" effect to look broken
                applyDiscount(1000, 'MEGA1000');
            } else {
                applyDiscount(1000, 'MEGA1000');
            }
        } else {
            addLog({ type: 'info', message: 'Invalid coupon code.' });
        }

        setCouponInput('');
    };

    const applyDiscount = (amount, code) => {
        setCartTotal(prev => prev - amount);
        setAppliedCoupons(prev => [...prev, code]);
        setDiscounts(prev => [...prev, { code, amount }]);
        addLog({ type: 'info', message: `Coupon ${code} applied. -$${amount}` });
    };

    const resetCart = () => {
        setCartTotal(100);
        setAppliedCoupons([]);
        setDiscounts([]);
        addLog({ type: 'info', message: 'Cart reset.' });
    };

    return (
        <div className="w-full max-w-sm relative group font-mono text-xs">
            {/* Receipt jagged top */}
            <div className="h-4 bg-white relative">
                <div className="absolute top-0 left-0 w-full h-full" style={{ background: 'linear-gradient(135deg, transparent 75%, #f1f5f9 75%) -10px 0, linear-gradient(225deg, transparent 75%, #f1f5f9 75%) -10px 0', backgroundSize: '20px 20px', backgroundRepeat: 'repeat-x' }}></div>
                <div className="absolute bottom-0 left-0 w-full h-full" style={{ background: 'linear-gradient(45deg, transparent 75%, #f8fafc 75%) -10px 0, linear-gradient(-45deg, transparent 75%, #f8fafc 75%) -10px 0', backgroundSize: '20px 20px', backgroundRepeat: 'repeat-x' }}></div>
            </div>

            <div className="bg-surface text-primary-color p-6 shadow-xl relative filter drop-shadow-md">
                {/* Receipt Header */}
                <div className="text-center mb-6 border-b-2 border-dashed border-theme pb-4">
                    <h3 className="text-2xl font-black uppercase tracking-widest mb-1">STORE_RCPT</h3>
                    <div className="text-[10px] text-secondary-color">TERMINAL #442-B • {new Date().toLocaleTimeString()}</div>
                </div>

                {/* Items */}
                <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                        <span>ITEM_01: PREMIUM_PLAN</span>
                        <span className="font-bold">$100.00</span>
                    </div>
                    <div className="flex justify-between text-secondary-color">
                        <span>   QTY: 1 @ 100.00</span>
                    </div>
                </div>

                {/* Applied Discounts */}
                {discounts.length > 0 && (
                    <div className="space-y-2 mb-4 border-t border-dashed border-theme pt-2">
                        {discounts.map((d, i) => (
                            <div key={i} className="flex justify-between text-red-600">
                                <span>VOUCHER: {d.code}</span>
                                <span>-${d.amount.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Total */}
                <div className="border-t-2 border-primary-color pt-4 mb-6">
                    <div className="flex justify-between text-lg font-black">
                        <span>TOTAL</span>
                        <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    {cartTotal < 0 && (
                        <div className="text-center mt-2 bg-red-100 text-red-600 p-1 font-bold">
                            ⚠️ CREDIT OWED
                        </div>
                    )}
                </div>

                {/* Coupon Input */}
                <form onSubmit={handleApply} className="bg-body/50 p-2 rounded border border-theme mb-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="w-full bg-surface border border-theme px-2 py-1 outline-none uppercase placeholder-secondary-color text-primary-color"
                            placeholder="ENTER_CODE"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value)}
                        />
                        <button type="submit" className="bg-primary-color text-surface px-3 font-bold hover:bg-secondary-color transition-colors">Apply</button>
                    </div>
                </form>

                {/* Reset */}
                <div className="text-center border-t border-dashed border-slate-300 pt-4">
                    <button onClick={resetCart} className="text-[10px] underline hover:text-red-500">VOID TRANSACTION</button>
                    <div className="mt-4 text-[10px] opacity-50 barcode font-libre-barcode text-3xl overflow-hidden whitespace-nowrap">
                        1234567891011121314
                    </div>
                </div>
            </div>

            {/* Jagged Bottom */}
            <div className="h-4 bg-transparent relative -mt-[1px]">
                <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #f8fafc 75%, transparent 75%) -10px 0, linear-gradient(225deg, #f8fafc 75%, transparent 75%) -10px 0', backgroundSize: '20px 20px', backgroundRepeat: 'repeat-x' }}></div>
            </div>

            {/* Paper Texture Overlay */}
            <div className="absolute inset-0 bg-[#fffdf5] opacity-10 mix-blend-overlay pointer-events-none"></div>
        </div>
    );
};

export default CouponCode;
