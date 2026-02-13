
// Simulation of SubscriptionNexus.jsx logic

// Mock State
let state = {
    plan: 'Enterprise',
    status: 'Active',
    currentDate: '2026-01-31',
    addons: [
        { id: 'support', name: 'Elite Support', price: 95.0, type: 'taxable', active: true },
        { id: 'consulting', name: 'Expert Consulting', price: 250.0, type: 'exempt', active: false }
    ],
    unitPrice: 0.00038,
    unitInput: '0',
    discountAmount: 0,
    logs: []
};

// Mock addLog
const addLog = (log) => {
    state.logs.push(log);
    console.log(`[LOG] ${log.type.toUpperCase()}: ${log.message}`);
};

// -----------------------------------------------------
// LOGIC REPLICATION
// -----------------------------------------------------

function calculateInvoice() {
    const planCost = state.plan === 'Enterprise' ? 500 : state.plan === 'Pro' ? 100 : state.plan === 'Basic' ? 20 : 0;
    const activeAddons = state.addons.filter(a => a.active);

    let subtotal = planCost + activeAddons.reduce((sum, a) => sum + a.price, 0);
    let usageCost = parseFloat(state.unitInput || 0) * state.unitPrice;

    // Elite Case 3: Floating Point Logic
    const totalBeforeDiscount = subtotal + usageCost;

    // Check for Floating Point Drift
    if (totalBeforeDiscount.toString().includes('000000000001') || totalBeforeDiscount.toString().includes('99999999999')) {
        addLog({ type: 'success', message: `BEAST FOUND: Floating point drift detected in ledger ($${totalBeforeDiscount})`, edgeCaseId: 'floating-point-drift' });
    }
}

function checkOrphans() {
    // Elite Case 5: Orphaned Add-on
    if (state.plan === 'None' && state.addons.some(a => a.active)) {
        addLog({ type: 'success', message: 'CRITICAL SECURITY: Parent subscription deleted but Add-ons are still billing!', edgeCaseId: 'orphan-dependency' });
    }
}

function checkLeapYear() {
    // Elite Case 6: Leap Year Check
    if (state.currentDate === '2026-02-29') {
        addLog({ type: 'success', message: 'LOGIC BREAK: February 29th accepted for 2026 (Non-Leap Year). Billing calendar out of sync.', edgeCaseId: 'leap-year-rollover' });
    }
}

function handleUpgrade(newPlan) {
    const day = parseInt(state.currentDate.split('-')[2]);
    // Elite Case 1: Proration
    if (day === 15) {
        addLog({ type: 'success', message: 'LOGIC BUG: Proration calculation drifted by $0.01 at exactly 50% month cycle.', edgeCaseId: 'proration-precision' });
    }
    state.plan = newPlan;
}

function applyGlobalDiscount() {
    const hasExempt = state.addons.find(a => a.id === 'consulting')?.active || parseFloat(state.unitInput) > 0;

    // Elite Case 2: Tax Logic Flaw
    if (hasExempt) {
        addLog({ type: 'success', message: 'COMPLIANCE FAILURE: Discount reduced Tax-Exempt balance instead of Taxable balance. Audit risk triggered.', edgeCaseId: 'tax-exemption-bug' });
    }
    state.discountAmount = 50;
}

// -----------------------------------------------------
// TEST EXECUTION
// -----------------------------------------------------

console.log("=== STARTING VERIFICATION ===\n");

// TEST 1: Floating Point Drift
console.log("--- Test 1: Floating Point Drift ---");
state.unitInput = '131579'; // Known trigger value
calculateInvoice();

// TEST 2: Proration Bug
console.log("\n--- Test 2: Proration Bug ---");
state.currentDate = '2026-02-15';
handleUpgrade('Pro');

// TEST 3: Tax Exemption Bug
console.log("\n--- Test 3: Tax Exemption Bug ---");
// Enable consulting (exempt)
state.addons.find(a => a.id === 'consulting').active = true;
applyGlobalDiscount();

// TEST 4: Orphaned Add-on
console.log("\n--- Test 4: Orphaned Add-on ---");
state.plan = 'None';
// Expert Consulting is still active from Test 3
checkOrphans();

// TEST 5: Leap Year Bug
console.log("\n--- Test 5: Leap Year Bug ---");
state.currentDate = '2026-02-29';
checkLeapYear();

console.log("\n=== VERIFICATION COMPLETE ===");
