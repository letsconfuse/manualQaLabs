import React, { useState, useEffect, useMemo } from 'react';
import {
    Trash2,
    Calendar,
    FileText,
    Activity,
    Database,
    Shield,
    Zap,
    User,
    Download
} from 'lucide-react';

// Config moved to challenges.js to prevent HMR issues


const SubscriptionNexus = ({ addLog }) => {
    // Core State
    const [plan, setPlan] = useState('Enterprise'); // Enterprise ($500), Pro ($100), Basic ($20)
    const [status, setStatus] = useState('Active'); // Active, Past Due, Lapsed
    const [currentDate, setCurrentDate] = useState('2026-01-31');
    const [addons, setAddons] = useState([
        { id: 'support', name: 'Elite Support', price: 95.0, type: 'taxable', active: true, icon: User },
        { id: 'consulting', name: 'Expert Consulting', price: 250.0, type: 'exempt', active: false, icon: Shield },
        { id: 'audit', name: 'Compliance Audit', price: 500.0, type: 'exempt', active: false, icon: FileText }
    ]);
    const [unitPrice] = useState(0.00038);
    const [unitInput, setUnitInput] = useState('0');
    const [discountAmount, setDiscountAmount] = useState(0);

    // -------------------------------------------------------------------------
    // "THE BEAST" - Financial Logic Engine (Intentionally Flawed)
    // -------------------------------------------------------------------------

    const invoice = useMemo(() => {
        const planCost = plan === 'Enterprise' ? 500 : plan === 'Pro' ? 100 : plan === 'Basic' ? 20 : 0;
        const activeAddons = addons.filter(a => a.active);

        // 1. Subtotal Calculation
        let subtotal = planCost + activeAddons.reduce((sum, a) => sum + a.price, 0);

        // 2. Usage Calculation (Metered)
        // BUG: Floating point math here is raw and unrounded until the very end
        let usageCost = parseFloat(unitInput || 0) * unitPrice;

        // Elite Case 3: Floating Point Logic
        const totalBeforeDiscount = subtotal + usageCost;

        // 3. Tax Calculation Logic (The "Compliance Engine")
        // We separate items into Taxable and Exempt buckets
        let taxableBase = (plan !== 'None' ? planCost : 0);
        let exemptBase = usageCost; // Usage is exempt in this jurisdiction (simulation)

        activeAddons.forEach(addon => {
            if (addon.type === 'taxable') taxableBase += addon.price;
            else exemptBase += addon.price;
        });

        // Elite Case 2: Tax Logic Flaw
        // When a discount is applied, it SHOULD reduce the Taxable amount first (to save customer tax).
        // BUG: This logic arbitrarily subtracts the discount from the EXEMPT base first.
        // If exempt base is 0, it subtracts from taxable.

        let adjustedTaxable = taxableBase;
        let adjustedExempt = exemptBase;

        if (discountAmount > 0) {
            if (adjustedExempt >= discountAmount) {
                adjustedExempt -= discountAmount; // WRONG: Reducing exempt base doesn't lower tax!
            } else {
                const remaining = discountAmount - adjustedExempt;
                adjustedExempt = 0;
                adjustedTaxable -= remaining;
            }
        }

        // Tax Rate: 10%
        const tax = Math.max(0, adjustedTaxable * 0.10);

        // Final Total
        const total = Math.max(0, adjustedTaxable + adjustedExempt + tax);

        return {
            planCost,
            activeAddons,
            usageCost,
            subtotal,
            tax,
            createdDate: currentDate,
            total,
            precisionRaw: totalBeforeDiscount // Exposed for checking the float bug
        };
    }, [plan, addons, unitInput, unitPrice, discountAmount, currentDate]);

    // -------------------------------------------------------------------------
    // EDGE CASE WATCHERS
    // -------------------------------------------------------------------------

    useEffect(() => {
        // Elite Case 3: Floating Point Check
        const rawString = invoice.precisionRaw.toFixed(20); // Expand to see the drift
        if (rawString.includes('000000000001') || rawString.includes('99999999999')) {
            addLog({ type: 'success', message: `BEAST FOUND: Floating point drift detected in ledger ($${invoice.precisionRaw})`, edgeCaseId: 'floating-point-drift' });
        }

        // Elite Case 5: Orphaned Add-on
        if (plan === 'None' && addons.some(a => a.active)) {
            addLog({ type: 'success', message: 'CRITICAL SECURITY: Parent subscription deleted but Add-ons are still billing!', edgeCaseId: 'orphan-dependency' });
        }

        // Elite Case 6: Leap Year Check
        if (currentDate === '2026-02-29') {
            addLog({ type: 'success', message: 'LOGIC BREAK: February 29th accepted for 2026 (Non-Leap Year). Billing calendar out of sync.', edgeCaseId: 'leap-year-rollover' });
        }
    }, [invoice, plan, addons, currentDate, addLog]);

    // -------------------------------------------------------------------------
    // ACTIONS
    // -------------------------------------------------------------------------

    const handleUpgrade = (newPlan) => {
        const day = parseInt(currentDate.split('-')[2]);
        addLog({ type: 'info', message: `Requesting migration: ${plan} -> ${newPlan} on Day ${day}` });

        // Elite Case 1: Proration Bug
        // Changing plan on the 15th of ANY month causes a specific rounding error in this legacy system
        if (day === 15) {
            addLog({ type: 'success', message: 'LOGIC BUG: Proration calculation drifted by $0.01 at exactly 50% month cycle.', edgeCaseId: 'proration-precision' });
        }
        setPlan(newPlan);
    };

    const applyGlobalDiscount = () => {
        const hasExempt = addons.some(a => a.type === 'exempt' && a.active);
        addLog({ type: 'info', message: 'Applying manual $50 retention discount...' });

        // Elite Case 2: Tax Logic Flaw Detection
        // If we have exempt items, the system (wrongly) reduces them first.
        if (hasExempt) {
            addLog({ type: 'success', message: 'COMPLIANCE FAILURE: Discount reduced Tax-Exempt balance first. Customer is overpaying tax.', edgeCaseId: 'tax-exemption-bug' });
        }
        setDiscountAmount(50);
    };

    const handleCancellation = () => {
        if (status === 'Lapsed') {
            addLog({ type: 'success', message: 'STATE DEADLOCK: User cannot cancel a "Lapsed" subscription. Account stuck in billing loop.', edgeCaseId: 'state-lockout' });
            addLog({ type: 'error', message: 'API Error (500): Unexpected state transition for ID: SUBS_8829' });
            return;
        }
        setPlan('None');
        addLog({ type: 'info', message: 'Cancellation request processed.' });
    };

    // -------------------------------------------------------------------------
    // RENDER
    // -------------------------------------------------------------------------

    return (
        <div className="w-full max-w-7xl mx-auto h-full min-h-[600px] bg-[#0f172a] rounded-3xl shadow-xl overflow-hidden flex flex-col font-sans border border-slate-800 relative">
            {/* Scroll Hint for small screens */}
            <div className="absolute top-4 right-4 z-20 lg:hidden bg-slate-800/80 backdrop-blur text-slate-400 text-[10px] px-2 py-1 rounded-full border border-slate-700 pointer-events-none animate-pulse">
                Scroll ➡️
            </div>
            <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar">
                <div className="h-full flex min-w-[1024px]">

                    {/* 1. SIDEBAR NAVIGATION */}
                    <aside className="w-64 shrink-0 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 flex flex-col p-4">
                        <div className="flex items-center gap-3 mb-6 text-emerald-400">
                            <Database className="w-6 h-6" />
                            <span className="font-bold tracking-wider text-sm">BILLING<span className="text-slate-500">OS</span></span>
                        </div>

                        <div className="space-y-4 flex-1">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Tenant</label>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                        <Activity className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium text-slate-200">Acme Corp</div>
                                        <div className="text-[10px] text-slate-500">ID: 992-882-11</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">System Date</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={currentDate}
                                        onChange={(e) => setCurrentDate(e.target.value)}
                                        className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 outline-none focus:border-emerald-500/50 transition-all pl-9"
                                    />
                                    <Calendar className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-800">
                                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 block">Account Status</label>
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold border ${status === 'Lapsed' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${status === 'Lapsed' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                                    {status.toUpperCase()}
                                </div>
                            </div>
                        </div>

                        <div className="text-[10px] text-slate-600 font-mono text-center">
                            v4.2.1-stable
                        </div>
                    </aside>

                    {/* 2. MAIN WORKSPACE */}
                    <main className="flex-1 bg-slate-900/30 p-5 overflow-y-auto custom-scrollbar">
                        <header className="mb-5 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-light text-white mb-1">Subscription Overview</h2>
                                <p className="text-xs text-slate-400">Manage plan tiers, addons, and billing cycles.</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setStatus(status === 'Active' ? 'Lapsed' : 'Active')}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-xs font-medium transition-all"
                                >
                                    Toggle Status
                                </button>
                            </div>
                        </header>

                        {/* Plan Selection */}
                        <section className="mb-6">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Core Plan</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {['Basic', 'Pro', 'Enterprise'].map(p => {
                                    const isSelected = plan === p;
                                    return (
                                        <button
                                            key={p}
                                            onClick={() => handleUpgrade(p)}
                                            className={`relative p-4 rounded-2xl border text-left transition-all duration-300 group ${isSelected
                                                ? 'bg-indigo-600/10 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                                                : 'bg-slate-800/20 border-slate-700/50 hover:bg-slate-800/40'}`}
                                        >
                                            {isSelected && <div className="absolute top-3 right-3 w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_10px_#818cf8]" />}
                                            <h4 className={`text-sm font-medium mb-1 ${isSelected ? 'text-white' : 'text-slate-300'}`}>{p}</h4>
                                            <div className="text-2xl font-light text-slate-200 mb-4">
                                                ${p === 'Enterprise' ? '500' : p === 'Pro' ? '100' : '20'}
                                                <span className="text-xs text-slate-500 font-normal">/mo</span>
                                            </div>
                                            <ul className="space-y-1">
                                                {[1, 2].map(i => (
                                                    <li key={i} className="flex items-center gap-2 text-[10px] text-slate-400">
                                                        <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-indigo-500' : 'bg-slate-600'}`} />
                                                        Feature inclusion {i}
                                                    </li>
                                                ))}
                                            </ul>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Addons */}
                        <section className="mb-6">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Expansion Modules</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {addons.map(addon => (
                                    <div key={addon.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/20 border border-slate-700/30 hover:border-slate-600/50 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${addon.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                                                <addon.icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-200">{addon.name}</div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs text-slate-400">${addon.price}/mo</span>
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded border ${addon.type === 'taxable' ? 'border-orange-500/30 text-orange-400' : 'border-blue-500/30 text-blue-400'}`}>
                                                        {addon.type.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setAddons(prev => prev.map(a => a.id === addon.id ? { ...a, active: !a.active } : a))}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${addon.active
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                                                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                                                }`}
                                        >
                                            {addon.active ? 'ACTIVE' : 'ADD'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Metered Usage */}
                        <section className="mb-6">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Usage Metering</h3>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/30 to-slate-900/30 border border-slate-700/30">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <div className="text-sm text-slate-300 font-medium mb-1">API Calls</div>
                                        <div className="text-xs text-slate-500">Rate: ${unitPrice} per call</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-mono text-white tracking-tight">{unitInput}</div>
                                        <div className="text-[10px] text-slate-500 text-right">UNITS</div>
                                    </div>
                                </div>
                                <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
                                    <div
                                        className="absolute top-0 left-0 h-full bg-indigo-500 transition-all duration-500"
                                        style={{ width: `${Math.min(100, (parseInt(unitInput) / 10000))}%` }}
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={unitInput}
                                    onChange={(e) => setUnitInput(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 transition-all font-mono"
                                    placeholder="Enter usage count..."
                                />
                            </div>
                        </section>

                        {/* Danger Zone */}
                        <section className="pt-6 border-t border-slate-800/50 flex gap-4">
                            <button
                                onClick={applyGlobalDiscount}
                                className="flex-1 py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-slate-700/50 hover:border-slate-600 flex items-center justify-center gap-2"
                            >
                                <Zap className="w-4 h-4 text-yellow-500" /> Apply Retention Offer
                            </button>
                            <button
                                onClick={handleCancellation}
                                className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center justify-center gap-2 ${status === 'Lapsed'
                                    ? 'bg-red-900/10 text-red-500/50 border-red-900/20 cursor-not-allowed opacity-50'
                                    : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                                    }`}
                                title={status === 'Lapsed' ? 'Cannot cancel while lapsed' : 'Cancel Subscription'}
                            >
                                <Trash2 className="w-4 h-4" /> Cancel Service
                            </button>
                        </section>
                    </main>

                    {/* 3. INVOICE PREVIEW */}
                    <aside className="w-80 shrink-0 bg-white text-slate-900 p-5 flex flex-col relative">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                        <header className="mb-5 flex justify-between items-start">
                            <div>
                                <h1 className="text-xl font-black tracking-tight mb-1">INVOICE</h1>
                                <div className="text-[10px] text-slate-500 font-mono">#INV-2026-001</div>
                            </div>
                            <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center">
                                <Zap className="w-4 h-4" />
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto">
                            <div className="space-y-3 text-xs">
                                <div className="flex justify-between border-b pb-2 mb-2 font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                                    <span>Item</span>
                                    <span>Cost</span>
                                </div>

                                {/* Line Items */}
                                {plan !== 'None' && (
                                    <div className="flex justify-between font-medium">
                                        <span>{plan} Plan</span>
                                        <span>${invoice.planCost.toFixed(2)}</span>
                                    </div>
                                )}

                                {invoice.activeAddons.map(a => (
                                    <div key={a.id} className="flex justify-between text-slate-600">
                                        <span>{a.name}</span>
                                        <span>${a.price.toFixed(2)}</span>
                                    </div>
                                ))}

                                {parseFloat(unitInput || 0) > 0 && (
                                    <div className="flex justify-between text-slate-600">
                                        <span>Usage ({unitInput})</span>
                                        <span>${invoice.usageCost.toFixed(2)}</span>
                                    </div>
                                )}

                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-bold">
                                        <span>Discount</span>
                                        <span>-${discountAmount.toFixed(2)}</span>
                                    </div>
                                )}

                                {/* Summary Block */}
                                <div className="border-t-2 border-slate-900 pt-4 mt-4 space-y-2">
                                    <div className="flex justify-between text-slate-500">
                                        <span>Subtotal</span>
                                        <span>${invoice.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500">
                                        <span>Tax (10%)</span>
                                        <span>${invoice.tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-black pt-2">
                                        <span>Total</span>
                                        <span>${invoice.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <footer className="mt-4 pt-4 border-t border-slate-100">
                            <button className="w-full py-3 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                                <Download className="w-4 h-4" /> Download PDF
                            </button>
                            <p className="text-[9px] text-center text-slate-400 mt-4 leading-normal">
                                Payment due within 30 days. Late fees apply for amounts over $1,000.
                            </p>
                        </footer>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionNexus;

