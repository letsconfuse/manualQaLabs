import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
    ShoppingCart, 
    Tag, 
    Plus, 
    Minus, 
    Trash2, 
    RotateCcw, 
    HelpCircle, 
    X, 
    ChevronDown, 
    Check, 
    AlertTriangle, 
    AlertCircle, 
    Shield, 
    Info 
} from 'lucide-react';

export const CouponConfig = {
    id: 'coupon-code',
    title: 'The Coupon Code',
    description: 'Apply promotional discounts on an e-commerce checkout interface. Test coupon expiration, stacking rules, case sensitivity, minimum spend thresholds, database injection, and script safety.',
    type: 'validation',
    difficulty: 'Hard',
    requirements: [
        { id: 'invalid', title: 'Invalid Code', explanation: 'Standard error feedback for non-existent codes.' },
        { id: 'case', title: 'Case Sensitivity', explanation: 'Code "save10" should work the same as "SAVE10".' },
        { id: 'whitespace', title: 'Whitespace Tolerance', explanation: 'Coupon codes with surrounding spaces should be trimmed and accepted.' },
        { id: 'empty', title: 'Empty Input', explanation: 'Applying an empty coupon code field should trigger a validation error.' },
        { id: 'expired', title: 'Expired Coupon', explanation: 'Old codes should be rejected gracefully with specific status.' },
        { id: 'stacking', title: 'Coupon Stacking', explanation: 'Prevent applying the same coupon code twice.' },
        { id: 'minimum-spend', title: 'Minimum Spend Boundary', explanation: 'Verify minimum purchase requirements (e.g. $150 limit) are checked dynamically.' },
        { id: 'negative', title: 'Negative Total Balance', explanation: 'Vulnerability where coupon discount exceeds total value and creates a negative balance.' },
        { id: 'sqli', title: 'SQL Injection', explanation: 'Promotional inputs should be sanitized against database injection syntax.' },
        { id: 'html-xss', title: 'HTML/XSS Injection', explanation: 'Testing input sanitization on error reflection messages.' }
    ]
};

const HELP_AREAS = [
    {
        area: 'Normal Operations & Case Tolerance',
        hint1: 'Test standard active codes like SAVE10 or VIP50. Verify if the field is case-sensitive.',
        hint2: 'Try entering "save10" or "vIp50" in lowercase/mixed case to see if the system handles casing gracefully.',
    },
    {
        area: 'Whitespace Tolerance',
        hint1: 'Check if copy-pasted codes with accidental spacing around them fail validation.',
        hint2: 'Try entering "  SAVE10  " (with spaces before and after) to see if it is correctly trimmed and applied.',
    },
    {
        area: 'Expired & Inactive Coupons',
        hint1: 'Test codes that should no longer be active under current system time or promotion phases.',
        hint2: 'Try entering the promotional code "SUMMER2020" and observe the system response.',
    },
    {
        area: 'Coupon Stacking Restrictions',
        hint1: 'Can you apply the same discount code multiple times to double-dip the savings?',
        hint2: 'Apply a valid code like "SAVE10", then try to submit "SAVE10" again to verify if it blocks duplicate applications.',
    },
    {
        area: 'Minimum Purchase Boundaries',
        hint1: 'Some high-value coupons require a minimum cart value. Adjust items to test spend boundaries.',
        hint2: 'Try applying "SAVE20" (which requires $150 minimum spend) when the cart is under $150, and when it is exactly $150 or more.',
    },
    {
        area: 'Total Value Anomalies (Negative Prices)',
        hint1: 'Check if applying large value discounts can reduce the cart balance to a negative number.',
        hint2: 'Try applying the extremely high-value code "MEGA1000" and check if the total goes below zero without security bounds.',
    },
    {
        area: 'SQL Injection Vulnerability',
        hint1: 'Coupon databases are queried via text input. Test if query control sequences can bypass validation.',
        hint2: 'Try entering standard SQL injection strings like "\' OR 1=1 --" or "\' UNION SELECT" to test input sanitization.',
    },
    {
        area: 'XSS & HTML Injection',
        hint1: 'If invalid coupon inputs are reflected back in messages or lists, check if the application renders unescaped scripts/HTML.',
        hint2: 'Try entering a code containing HTML tags like "<u>invalid</u>" or scripts like "<script>alert(1)</script>" to inspect reflection handling.',
    }
];

// ─────────────────────────────────────────────────────────────────────────────
// Help overlay component
// ─────────────────────────────────────────────────────────────────────────────
const HelpOverlay = ({ onClose }) => {
    const [expanded, setExpanded] = useState({});
    const [revealed, setRevealed] = useState({});

    const toggle = (i) => setExpanded(p => ({ ...p, [i]: !p[i] }));
    const reveal = (i) => setRevealed(p => ({ ...p, [i]: (p[i] || 0) + 1 }));

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
            <div className="w-full max-w-lg bg-surface border border-theme rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-theme bg-body">
                    <div className="flex items-center gap-2.5">
                        <HelpCircle className="w-5 h-5 text-teal-500" />
                        <div>
                            <p className="text-sm font-bold text-primary-color">Testing Guide</p>
                            <p className="text-xs text-secondary-color">Click an area for a clue. Reveal more if you\'re stuck.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-secondary-color hover:text-primary-color transition-colors p-1 rounded-lg hover:bg-body">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Shortcut badge */}
                <div className="px-5 py-2.5 border-b border-theme flex items-center gap-2 text-xs text-secondary-color">
                    <span>Shortcut to open this:</span>
                    <span className="px-1.5 py-0.5 bg-body border border-theme rounded text-primary-color font-mono font-semibold">Shift</span>
                    <span>+</span>
                    <span className="px-1.5 py-0.5 bg-body border border-theme rounded text-primary-color font-mono font-semibold">Alt</span>
                    <span>+</span>
                    <span className="px-1.5 py-0.5 bg-body border border-theme rounded text-primary-color font-mono font-semibold">H</span>
                    <span className="mx-2 text-theme">·</span>
                    <span>or triple-click the receipt header tag icon</span>
                </div>

                {/* Areas */}
                <div className="overflow-y-auto max-h-[60vh] divide-y divide-theme">
                    {HELP_AREAS.map((item, i) => (
                        <div key={i} className="px-5 py-3">
                            <button
                                type="button"
                                onClick={() => toggle(i)}
                                className="w-full flex items-center justify-between text-left group"
                            >
                                <span className="text-sm font-medium text-primary-color group-hover:text-teal-400 transition-colors">{item.area}</span>
                                <ChevronDown className={`w-4 h-4 text-secondary-color transition-transform ${expanded[i] ? 'rotate-180' : ''}`} />
                            </button>

                            {expanded[i] && (
                                <div className="mt-3 space-y-2">
                                    <div className="bg-body border border-theme rounded-xl p-3 text-xs text-secondary-color">
                                        <span className="text-teal-400 font-semibold block mb-0.5">Clue →</span>
                                        {item.hint1}
                                    </div>

                                    {(revealed[i] || 0) >= 1 ? (
                                        <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-3 text-xs text-teal-300">
                                            <span className="font-semibold block mb-0.5">Detailed hint →</span>
                                            {item.hint2}
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => reveal(i)}
                                            className="text-xs text-secondary-color hover:text-teal-400 transition-colors underline underline-offset-2"
                                        >
                                            Still stuck? Reveal a more detailed hint
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// CouponCode Scenario
// ─────────────────────────────────────────────────────────────────────────────
const CouponCode = ({ addLog }) => {
    // Default cart items
    const [cartItems, setCartItems] = useState([
        { id: 'plan', name: 'PREMIUM_PLAN', price: 100, qty: 1, desc: 'Cloud IDE + 100GB Workspace' },
        { id: 'keyboard', name: 'MECH_KEYBOARD', price: 80, qty: 0, desc: 'RGB tactile blue switches' },
        { id: 'deskpad', name: 'DEV_DESK_PAD', price: 30, qty: 0, desc: 'Micro-weave desk mat' }
    ]);

    const [couponInput, setCouponInput] = useState('');
    const [appliedCoupons, setAppliedCoupons] = useState([]);
    
    // Feedback and security reflection state
    const [feedback, setFeedback] = useState(null); // { type, message }
    const [errorReflection, setErrorReflection] = useState(null); // { rawText, hasHtml }
    const [showHelp, setShowHelp] = useState(false);

    const tagClicks = useRef(0);
    const clickTimer = useRef(null);

    // Keyboard shortcut to open help
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.shiftKey && e.altKey && e.key.toLowerCase() === 'h') {
                e.preventDefault();
                setShowHelp(p => !p);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Triple click handler on header Tag icon for help
    const handleTagIconClick = () => {
        tagClicks.current += 1;
        clearTimeout(clickTimer.current);
        clickTimer.current = setTimeout(() => {
            tagClicks.current = 0;
        }, 700);

        if (tagClicks.current >= 3) {
            tagClicks.current = 0;
            setShowHelp(p => !p);
        }
    };

    // Calculate subtotal
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

    // Dynamic Coupon Calculations
    let totalDiscount = 0;
    const couponList = appliedCoupons.map(coupon => {
        let active = true;
        let discountVal = 0;
        let note = '';

        if (coupon.type === 'flat') {
            discountVal = coupon.amount;
        } else if (coupon.type === 'flat-mega') {
            discountVal = coupon.amount;
        } else if (coupon.type === 'min-spend-150') {
            if (subtotal >= 150) {
                discountVal = coupon.amount;
                active = true;
            } else {
                discountVal = 0;
                active = false;
                note = 'Inactive (min. $150 required)';
            }
        }

        totalDiscount += discountVal;

        return {
            ...coupon,
            active,
            discountVal,
            note
        };
    });

    const finalTotal = subtotal - totalDiscount;

    // Monitor for Negative Balance success conditions
    useEffect(() => {
        if (finalTotal < 0) {
            addLog({ 
                type: 'success', 
                message: `✅ Logic flaw: Discount exceeds total ($${finalTotal.toFixed(2)}). Balance is negative.`, 
                edgeCaseId: 'negative' 
            });
        }
    }, [finalTotal]);

    // Monitor for SAVE20 minimum spend success conditions
    const isSave20Applied = appliedCoupons.some(c => c.code === 'SAVE20');
    useEffect(() => {
        if (isSave20Applied && subtotal >= 150) {
            addLog({ 
                type: 'success', 
                message: `✅ Boundary: SAVE20 applied successfully with subtotal >= $150 ($${subtotal.toFixed(2)})`, 
                edgeCaseId: 'minimum-spend' 
            });
        }
    }, [subtotal, isSave20Applied]);

    // Quantity modifiers
    const adjustQty = (id, delta) => {
        setCartItems(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, item.qty + delta);
                return { ...item, qty: newQty };
            }
            return item;
        }));
        setFeedback(null);
        setErrorReflection(null);
    };

    const applyCoupon = (code, amount, type) => {
        setAppliedCoupons(prev => [...prev, { code, amount, type }]);
        setFeedback({ type: 'success', message: `Coupon "${code}" applied successfully! (-$${amount.toFixed(2)})` });
    };

    const handleApply = (e) => {
        if (e) e.preventDefault();

        const rawCode = couponInput;
        const trimmed = rawCode.trim();
        const upperCode = trimmed.toUpperCase();

        setFeedback(null);
        setErrorReflection(null);

        addLog({ type: 'info', message: `Applying coupon field input: "${rawCode}"` });

        // 1. Empty Input check
        if (rawCode === '') {
            addLog({ type: 'success', message: '❌ Validation: Applied an empty coupon code input.', edgeCaseId: 'empty' });
            setFeedback({ type: 'error', message: 'Error: Coupon code cannot be empty.' });
            return;
        }

        // 2. Whitespace Tolerance check
        if (rawCode !== trimmed && ['SAVE10', 'VIP50', 'SAVE20', 'MEGA1000', 'SUMMER2020'].includes(upperCode)) {
            addLog({ 
                type: 'success', 
                message: `✅ Whitespace Tolerance: Coupon trimmed from "${rawCode}" to "${trimmed}"`, 
                edgeCaseId: 'whitespace' 
            });
        }

        // 3. SQL Injection check
        if (trimmed.includes("'") || trimmed.includes("--") || trimmed.toUpperCase().includes('UNION') || trimmed.toUpperCase().includes('SELECT')) {
            addLog({ type: 'success', message: `⚠️ Security: SQL Injection payload bypassed to coupon validation database: "${trimmed}"`, edgeCaseId: 'sqli' });
            setFeedback({ type: 'error', message: 'DB Error: Syntax error in promotional query lookup.' });
            return;
        }

        // 4. HTML/XSS check
        const htmlPatterns = ['<b>', '<i>', '<u>', '<h1>', '<h2>', '<a>', '<span'];
        const xssPatterns = ['<script>', 'javascript:', 'onerror', 'onload', 'alert('];
        const containsXSS = xssPatterns.some(p => rawCode.toLowerCase().includes(p));
        const containsHTML = htmlPatterns.some(p => rawCode.toLowerCase().includes(p));

        if (containsXSS || containsHTML) {
            addLog({ type: 'success', message: `⚠️ Security: HTML/XSS validation reflection vulnerability triggered: "${rawCode}"`, edgeCaseId: 'html-xss' });
            if (containsXSS) {
                try {
                    alert(`XSS Vulnerability Executed!\nPayload: ${rawCode}`);
                } catch(e) {}
            }
            setErrorReflection({ rawText: rawCode, hasHtml: true });
            setFeedback({ type: 'error', message: 'Coupon not found.' });
            setCouponInput('');
            return;
        }

        // 5. Stacking check
        if (appliedCoupons.some(c => c.code === upperCode)) {
            addLog({ type: 'success', message: `⚠️ Logic: Prevented applying duplicate code "${upperCode}".`, edgeCaseId: 'stacking' });
            setFeedback({ type: 'warning', message: `Coupon "${upperCode}" is already applied.` });
            setCouponInput('');
            return;
        }

        // 6. Case Sensitivity check
        if (trimmed !== upperCode && ['SAVE10', 'VIP50', 'SAVE20', 'MEGA1000'].includes(upperCode)) {
            addLog({ type: 'success', message: `✅ UX: Case sensitivity tolerated. Entered "${trimmed}", applied "${upperCode}"`, edgeCaseId: 'case' });
        }

        // 7. Evaluate Promo Codes
        if (upperCode === 'SUMMER2020') {
            addLog({ type: 'success', message: `❌ Promotion expired: "${upperCode}"`, edgeCaseId: 'expired' });
            setFeedback({ type: 'error', message: 'This coupon code expired on August 31, 2020.' });
        } else if (upperCode === 'SAVE10') {
            applyCoupon('SAVE10', 10.00, 'flat');
        } else if (upperCode === 'VIP50') {
            applyCoupon('VIP50', 50.00, 'flat');
        } else if (upperCode === 'SAVE20') {
            if (subtotal < 150) {
                addLog({ 
                    type: 'success', 
                    message: `✅ Boundary: SAVE20 applied but remains inactive due to subtotal under $150 ($${subtotal.toFixed(2)})`, 
                    edgeCaseId: 'minimum-spend' 
                });
            }
            applyCoupon('SAVE20', 20.00, 'min-spend-150');
        } else if (upperCode === 'MEGA1000') {
            applyCoupon('MEGA1000', 1000.00, 'flat-mega');
        } else {
            // Standard Invalid code
            addLog({ type: 'success', message: `❌ Validation: Invalid coupon code submitted: "${trimmed}"`, edgeCaseId: 'invalid' });
            setErrorReflection({ rawText: trimmed, hasHtml: false });
            setFeedback({ type: 'error', message: 'Coupon not found.' });
        }

        setCouponInput('');
    };

    const voidTransaction = () => {
        setCartItems([
            { id: 'plan', name: 'PREMIUM_PLAN', price: 100, qty: 1, desc: 'Cloud IDE + 100GB Workspace' },
            { id: 'keyboard', name: 'MECH_KEYBOARD', price: 80, qty: 0, desc: 'RGB tactile blue switches' },
            { id: 'deskpad', name: 'DEV_DESK_PAD', price: 30, qty: 0, desc: 'Micro-weave desk mat' }
        ]);
        setAppliedCoupons([]);
        setFeedback(null);
        setErrorReflection(null);
        setCouponInput('');
        addLog({ type: 'info', message: 'Transaction voided. Cart reset.' });
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-4 md:p-6 bg-surface border border-theme rounded-2xl shadow-3xl">
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-theme mb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <Tag className="w-6 h-6 text-teal-500" />
                        <h2 className="text-lg font-bold text-primary-color">Checkout Discount Validator</h2>
                    </div>
                    <p className="text-xs text-secondary-color mt-1">
                        Interact with the POS inventory system on the left to modify item quantities, then test promotional voucher entry logic on the receipt.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowHelp(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-body border border-theme text-secondary-color hover:text-primary-color rounded-xl text-xs font-medium transition-all"
                    >
                        <HelpCircle className="w-4 h-4" />
                        Testing Guide
                    </button>
                    <button
                        onClick={voidTransaction}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 rounded-xl text-xs font-medium transition-all"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset Session
                    </button>
                </div>
            </div>

            {/* Main Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left side: POS Inventory customization */}
                <div className="lg:col-span-6 space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <ShoppingCart className="w-4 h-4 text-teal-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-secondary-color">POS Terminal Inventory</span>
                    </div>

                    <div className="space-y-3">
                        {cartItems.map((item) => (
                            <div key={item.id} className="card-3d p-4 flex items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-primary-color">{item.name}</span>
                                        <span className="text-xs px-2 py-0.5 bg-body border border-theme rounded-md font-mono text-teal-400 font-semibold">
                                            ${item.price.toFixed(2)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-secondary-color">{item.desc}</p>
                                </div>

                                <div className="flex items-center gap-2 bg-body border border-theme rounded-xl p-1 shadow-inner">
                                    <button
                                        type="button"
                                        onClick={() => adjustQty(item.id, -1)}
                                        disabled={item.qty <= 0}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-secondary-color hover:bg-surface hover:text-primary-color disabled:opacity-40 transition-colors"
                                    >
                                        <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="w-8 text-center text-xs font-bold text-primary-color font-mono">
                                        {item.qty}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => adjustQty(item.id, 1)}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-secondary-color hover:bg-surface hover:text-primary-color transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Hint card for valid codes */}
                    <div className="bg-body border border-theme rounded-xl p-4 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-color">
                            <Info className="w-3.5 h-3.5 text-teal-500" />
                            <span>System Documentation (Coupon Registry):</span>
                        </div>
                        <ul className="text-[11px] text-secondary-color space-y-1 font-mono list-disc pl-4">
                            <li><strong className="text-primary-color">SAVE10</strong>: $10.00 Flat Discount</li>
                            <li><strong className="text-primary-color">VIP50</strong>: $50.00 Flat Discount</li>
                            <li><strong className="text-primary-color">SAVE20</strong>: $20.00 Discount (Subtotal must be ≥ $150)</li>
                            <li><strong className="text-primary-color">SUMMER2020</strong>: Campaign coupon (Expired)</li>
                            <li><strong className="text-primary-color">MEGA1000</strong>: VIP High Value Voucher ($1000.00)</li>
                        </ul>
                    </div>
                </div>

                {/* Right side: Digital Thermal Receipt */}
                <div className="lg:col-span-6 flex justify-center">
                    <div className="w-full max-w-sm relative font-mono text-xs text-slate-800">
                        {/* Jagged Receipt top */}
                        <div className="h-3 bg-transparent relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-[6px]" style={{ background: 'radial-gradient(circle, transparent, transparent 50%, #faf8f0 50%, #faf8f0) 0 0/12px 12px repeat-x' }}></div>
                        </div>

                        {/* Receipt Container */}
                        <div className="bg-[#faf8f0] p-6 shadow-2xl relative border-x border-[#f1efe6] text-[#334155]">
                            
                            {/* Terminal Details & Help Triggers */}
                            <div className="text-center mb-6 border-b border-dashed border-slate-300 pb-4">
                                <div className="flex justify-center mb-1">
                                    <button 
                                        onClick={handleTagIconClick} 
                                        className="p-1 rounded hover:bg-slate-200/50 transition-colors"
                                        title="Triple-click for testing guide"
                                    >
                                        <Tag className="w-6 h-6 text-teal-600 animate-pulse" />
                                    </button>
                                </div>
                                <h3 className="text-sm font-bold tracking-wider uppercase text-slate-900">GEEK_MERCH_POS</h3>
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                    STATION #1337-X • {new Date().toLocaleDateString()}
                                </p>
                            </div>

                            {/* Cart List */}
                            <div className="space-y-2.5 mb-4">
                                <div className="flex justify-between text-[10px] text-slate-500 font-bold border-b border-slate-200 pb-1">
                                    <span>ITEM DESCRIP.</span>
                                    <span className="w-12 text-center">QTY</span>
                                    <span className="w-16 text-right">TOTAL</span>
                                </div>
                                
                                {cartItems.filter(i => i.qty > 0).length === 0 ? (
                                    <div className="text-center py-4 text-slate-400 border-b border-dashed border-slate-200">
                                        *** CART IS EMPTY ***
                                    </div>
                                ) : (
                                    cartItems.filter(i => i.qty > 0).map((item) => (
                                        <div key={item.id} className="flex justify-between items-center text-slate-800 border-b border-dashed border-slate-200/60 pb-1.5">
                                            <div className="flex-1 min-w-0 pr-2">
                                                <p className="font-bold truncate text-[11px]">{item.name}</p>
                                                <p className="text-[9px] text-slate-500">@ ${item.price.toFixed(2)}</p>
                                            </div>
                                            <span className="w-12 text-center font-bold text-slate-700">{item.qty}</span>
                                            <span className="w-16 text-right font-bold">${(item.price * item.qty).toFixed(2)}</span>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Subtotal */}
                            <div className="flex justify-between text-xs font-bold text-slate-700 mt-4">
                                <span>SUBTOTAL</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>

                            {/* Coupons breakdown */}
                            {couponList.length > 0 && (
                                <div className="space-y-1.5 py-2.5 border-t border-dashed border-slate-300 my-2 text-[11px]">
                                    {couponList.map((coupon, idx) => (
                                        <div key={idx} className="flex items-center justify-between">
                                            <div className="flex items-center gap-1 min-w-0">
                                                <Tag className="w-3 h-3 text-red-500 shrink-0" />
                                                <span className={`font-bold truncate ${coupon.active ? 'text-red-600' : 'text-slate-400 line-through'}`}>
                                                    {coupon.code}
                                                </span>
                                                {coupon.note && (
                                                    <span className="text-[8px] bg-amber-100 text-amber-700 px-1 rounded uppercase shrink-0 font-sans">
                                                        {coupon.note}
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`font-bold shrink-0 ${coupon.active ? 'text-red-600' : 'text-slate-400'}`}>
                                                -${coupon.discountVal.toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Total Area */}
                            <div className="border-t-2 border-double border-slate-800 pt-3 mt-4 mb-4">
                                <div className="flex justify-between text-base font-black text-slate-900">
                                    <span>TOTAL</span>
                                    <span>${finalTotal.toFixed(2)}</span>
                                </div>

                                {finalTotal < 0 && (
                                    <div className="mt-3 bg-red-600 text-white p-2 rounded text-center font-bold flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider animate-pulse">
                                        <AlertTriangle className="w-4 h-4 shrink-0" />
                                        <span>⚠️ POS Alert: negative balance</span>
                                    </div>
                                )}
                            </div>

                            {/* Coupon Code Form */}
                            <form onSubmit={handleApply} className="mt-4 pt-3 border-t border-dashed border-slate-300">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 outline-none uppercase placeholder-slate-400 font-bold focus:border-slate-500"
                                            placeholder="ENTER PROMO"
                                            value={couponInput}
                                            onChange={(e) => setCouponInput(e.target.value)}
                                        />
                                    </div>
                                    <button 
                                        type="submit" 
                                        className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded transition-all text-xs active:scale-95 shrink-0"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </form>

                            {/* Error Reflection & Feedbacks */}
                            {(feedback || errorReflection) && (
                                <div className="mt-4 p-2.5 rounded border text-[11px] leading-relaxed">
                                    {feedback && (
                                        <div className="flex gap-1.5">
                                            {feedback.type === 'success' && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />}
                                            {feedback.type === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />}
                                            {feedback.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />}
                                            
                                            <div>
                                                {/* If there is reflected text and type is error, render the reflection */}
                                                {feedback.type === 'error' && errorReflection ? (
                                                    <span className="text-red-700 font-medium">
                                                        Coupon "
                                                        {errorReflection.hasHtml ? (
                                                            <span dangerouslySetInnerHTML={{ __html: errorReflection.rawText }} />
                                                        ) : (
                                                            errorReflection.rawText
                                                        )}
                                                        " not found.
                                                    </span>
                                                ) : (
                                                    <span className={`font-semibold ${
                                                        feedback.type === 'success' ? 'text-emerald-700' : 
                                                        feedback.type === 'error' ? 'text-red-700' : 'text-amber-700'
                                                    }`}>
                                                        {feedback.message}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Receipt Footer */}
                            <div className="text-center mt-6 border-t border-dashed border-slate-300 pt-4">
                                <button 
                                    onClick={voidTransaction} 
                                    className="text-[9px] font-bold text-slate-500 hover:text-red-600 transition-colors uppercase underline tracking-wider"
                                >
                                    VOID TRANSACTION
                                </button>
                                
                                {/* Simulated Barcode */}
                                <div className="mt-4 flex flex-col items-center">
                                    <div className="flex justify-center h-8 w-48 bg-transparent opacity-85">
                                        {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 2, 1, 4, 2, 1, 3, 1, 2].map((w, i) => (
                                            <div 
                                                key={i} 
                                                className="h-full bg-slate-800" 
                                                style={{ 
                                                    width: `${w}px`, 
                                                    marginRight: `${(i % 3 === 0) ? 2 : 1}px` 
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-[8px] text-slate-400 font-mono tracking-widest mt-1">
                                        *990392138902*
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Jagged Receipt Bottom */}
                        <div className="h-3 bg-transparent relative overflow-hidden -mt-[1px]">
                            <div className="absolute bottom-0 left-0 w-full h-[6px]" style={{ background: 'radial-gradient(circle, transparent, transparent 50%, #faf8f0 50%, #faf8f0) 0 0/12px 12px repeat-x', transform: 'rotate(180deg)' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Help portal */}
            {showHelp && createPortal(
                <HelpOverlay onClose={() => setShowHelp(false)} />,
                document.body
            )}
        </div>
    );
};

export default CouponCode;
