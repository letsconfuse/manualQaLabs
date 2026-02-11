import React, { useState, useEffect } from 'react';
import { CreditCard, Trash2, ArrowUpCircle, AlertCircle, Calendar, DollarSign } from 'lucide-react';

export const SubscriptionConfig = {
    id: 'subscription-nexus',
    title: 'The Subscription Nexus',
    description: 'Elite Level: A high-tier SaaS billing engine. Test proration, tax logic, and lifecycle state machines.',
    type: 'logic',
    difficulty: 'Hard',
    requirements: [
        { id: 'proration-precision', title: 'The Proration Paradox', explanation: 'Upgrading mid-month should credit exactly the unused portion of the old plan.' },
        { id: 'tax-discount-chain', title: 'Tax-Exempt Discounting', explanation: 'Applying a global discount to a mix of taxable and tax-exempt items.' },
        { id: 'floating-point', title: 'The Floating Point Penny', explanation: 'Calculations with small decimal units (e.g., $0.00076) must be precisely rounded.' },
        { id: 'grace-period-race', title: 'Grace Period Race', explanation: 'Downgrading an account that is already in a past-due grace period.' },
        { id: 'orphan-addon', title: 'The Orphaned Add-on', explanation: 'Deleting a parent plan while leaving a paid add-on active.' },
        { id: 'billing-drift', title: 'Billing Date Drift', explanation: 'Subscriptions starting on Jan 31st vs Feb 28th/29th transitions.' }
    ]
};

const SubscriptionNexus = ({ addLog }) => {
    // State machine
    const [plan, setPlan] = useState('Basic'); // Basic: $10, Pro: $100
    const [addons, setAddons] = useState([]); // {id: 'sec', name: 'Security', price: 15}
    const [status, setStatus] = useState('Active'); // Active, Past Due, Grace Period
    const [currentDate, setCurrentDate] = useState('2026-01-15');
    const [unitPrice, setUnitPrice] = useState('0.00076');
    const [unitCount, setUnitCount] = useState('100000');

    // Derived values
    const planPrice = plan === 'Basic' ? 10 : 100;
    const addonsTotal = addons.reduce((sum, a) => sum + a.price, 0);

    const handleUpgrade = () => {
        if (plan === 'Pro') return;

        const dayOfMonth = parseInt(currentDate.split('-')[2]);
        const daysInMonth = 30; // Simplified for the challenge

        addLog({ type: 'info', message: `Initiating upgrade to Pro on Day ${dayOfMonth}...` });

        // Elite Case 1: Proration Paradox
        // Correct logic: Refund (30 - dayOfMonth)/30 * 10, then charge (30-dayOfMonth)/30 * 100
        // We'll simulate a common bug where it just charges the full $100
        const oldPlanRefund = ((daysInMonth - dayOfMonth) / daysInMonth) * 10;
        const newPlanCharge = ((daysInMonth - dayOfMonth) / daysInMonth) * 100;

        if (dayOfMonth === 15) {
            // If they happen to be on exactly 15, we'll check if the math is perfect
            addLog({ type: 'success', message: 'Math Check: Exactly 50% proration verified.', edgeCaseId: 'proration-precision' });
        } else {
            addLog({ type: 'warning', message: `Proration notice: Crediting $${oldPlanRefund.toFixed(2)} from Basic, Charging $${newPlanCharge.toFixed(2)} for Pro.` });
        }

        setPlan('Pro');
        addLog({ type: 'info', message: 'Plan successfully updated to Pro.' });
    };

    const handleUnitCalculation = () => {
        const uPrice = parseFloat(unitPrice);
        const uCount = parseInt(unitCount);
        const total = uPrice * uCount;

        addLog({ type: 'info', message: `Calculating usage: ${uCount} units @ $${uPrice}/unit` });

        // Elite Case 3: Floating Point Penny
        // 0.00076 * 100000 = 76.00000000000001 in some JS engines or drift environments
        // We simulate the check here
        if (total.toString().includes('000000')) {
            addLog({ type: 'success', message: `Floating point drift detected! Calculated: $${total}. Expected: $76.00`, edgeCaseId: 'floating-point' });
        } else if (total === 76) {
            addLog({ type: 'info', message: 'Precision check: $76.00 (Standard representation)' });
        }
    };

    const toggleAddon = (id, name, price) => {
        if (addons.find(a => a.id === id)) {
            setAddons(addons.filter(a => a.id !== id));
            addLog({ type: 'info', message: `Removed Add-on: ${name}` });
        } else {
            setAddons([...addons, { id, name, price }]);
            addLog({ type: 'info', message: `Added Add-on: ${name} (+$${price}/mo)` });
        }
    };

    const cancelSubscription = () => {
        addLog({ type: 'info', message: 'Attempting to cancel primary plan...' });

        // Elite Case 5: Orphaned Add-on
        if (addons.length > 0) {
            addLog({ type: 'success', message: 'Logic Flaw: Primary plan cancelled, but paid add-ons remain active! User will still be billed for orphans.', edgeCaseId: 'orphan-addon' });
        }

        setPlan('None');
        setStatus('Cancelled');
        addLog({ type: 'info', message: 'Subscription cancelled.' });
    };

    const handleGracePeriodDowngrade = () => {
        addLog({ type: 'info', message: 'Downgrading during Grace Period...' });

        // Elite Case 4: Grace Period Race
        if (status === 'Grace Period') {
            addLog({ type: 'success', message: 'Race Condition: System allowed downgrade of a past-due account without clearing the debt first.', edgeCaseId: 'grace-period-race' });
        }
        setPlan('Basic');
    };

    const checkBillingDate = () => {
        addLog({ type: 'info', message: `Verifying billing anniversary for start date: ${currentDate}` });

        // Elite Case 6: Billing Drift
        if (currentDate.endsWith('-31')) {
            addLog({ type: 'success', message: 'Leap-year logic error found: System cannot resolve "Feb 31st" for next month bill.', edgeCaseId: 'billing-drift' });
        } else {
            addLog({ type: 'info', message: 'Next cycle projected normally.' });
        }
    };

    const applyTaxDiscount = () => {
        // Elite Case 2: Tax-Exempt Discounting
        // SaaS (Taxable 10%) + Consulting (Exempt 0%)
        // If we apply a $20 discount, where does it go?
        addLog({ type: 'info', message: 'Applying $20 global discount to Invoice #882...' });
        addLog({ type: 'success', message: 'Compliance Bug: Discount applied to Tax-Exempt items first, lowering tax liability illegally.', edgeCaseId: 'tax-discount-chain' });
    };

    return (
        <div className="w-full max-w-xl bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-2xl text-slate-100 font-sans">
            <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
                <div>
                    <h3 className="text-2xl font-black text-white flex items-center gap-2">
                        <CreditCard className="text-primary" /> Nexus Billing
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">Environment: PRODUCTION | Node: 14.x</p>
                </div>
                <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${status === 'Active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                        Status: {status}
                    </span>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Dashboard Side */}
                <div className="space-y-6">
                    <section>
                        <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3">Subscription Controls</h4>
                        <div className="bg-slate-800/50 p-4 rounded-xl space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Current Plan: <strong>{plan}</strong></span>
                                <span className="text-sm font-bold text-primary">${planPrice}/mo</span>
                            </div>

                            {plan !== 'Pro' && plan !== 'None' && (
                                <button
                                    onClick={handleUpgrade}
                                    className="w-full bg-primary hover:bg-primary/90 text-white py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                                >
                                    <ArrowUpCircle className="w-4 h-4" /> Upgrade to Pro
                                </button>
                            )}

                            <div className="pt-2 flex gap-2">
                                <button
                                    onClick={() => setStatus('Grace Period')}
                                    className="flex-1 bg-slate-700 hover:bg-slate-600 py-1.5 rounded-lg text-[10px] font-bold uppercase"
                                >
                                    Force Grace
                                </button>
                                <button
                                    onClick={handleGracePeriodDowngrade}
                                    className="flex-1 bg-slate-700 hover:bg-slate-600 py-1.5 rounded-lg text-[10px] font-bold uppercase"
                                >
                                    Downgrade
                                </button>
                                <button
                                    onClick={cancelSubscription}
                                    className="bg-red-900/40 hover:bg-red-900/60 p-1.5 rounded-lg text-red-400"
                                    title="Cancel Plan"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3">Usage & precision</h4>
                        <div className="bg-slate-800/50 p-4 rounded-xl space-y-3">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={unitCount}
                                    onChange={(e) => setUnitCount(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs outline-none focus:border-primary"
                                    placeholder="Units"
                                />
                                <button
                                    onClick={handleUnitCalculation}
                                    className="bg-slate-700 px-3 rounded text-[10px] font-bold"
                                >
                                    CALC
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-500 font-mono">Current Lambda Price: ${unitPrice}/op</p>
                        </div>
                    </section>
                </div>

                {/* Ledger Side */}
                <div className="space-y-6">
                    <section>
                        <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3">System Date Control</h4>
                        <div className="bg-slate-800/50 p-4 rounded-xl space-y-3">
                            <input
                                type="text"
                                value={currentDate}
                                onChange={(e) => setCurrentDate(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-center font-mono outline-none focus:border-primary"
                                placeholder="YYYY-MM-DD"
                            />
                            <button
                                onClick={checkBillingDate}
                                className="w-full text-[10px] text-slate-400 hover:text-white flex items-center justify-center gap-1"
                            >
                                <Calendar className="w-3 h-3" /> Verify Next Anniversary
                            </button>
                        </div>
                    </section>

                    <section>
                        <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3">Add-ons & Invoicing</h4>
                        <div className="bg-slate-800/50 p-4 rounded-xl space-y-3">
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => toggleAddon('sec', 'Security', 15)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${addons.find(a => a.id === 'sec') ? 'bg-primary border-primary text-white' : 'border-slate-700 text-slate-400'
                                        }`}
                                >
                                    + Security ($15)
                                </button>
                                <button
                                    onClick={applyTaxDiscount}
                                    className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-slate-700 hover:bg-slate-600 text-slate-200"
                                >
                                    Verify Tax Logic
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between text-slate-400">
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Live Audit Mode</span>
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Current Balance</p>
                    <p className="text-xl font-black text-white">${(planPrice + addonsTotal).toFixed(2)}</p>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionNexus;
