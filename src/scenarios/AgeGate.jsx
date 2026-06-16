import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Shield, HelpCircle, X, ChevronDown, CheckCircle, AlertOctagon, CornerDownLeft } from 'lucide-react';

export const AgeGateConfig = {
    id: 'age-gate',
    title: 'The Age Gate',
    description: 'Verify access controls on an age-restricted interface. The system expects users to be 18 years or older. Your goal is to probe the boundaries, formats, and validation constraints to check for flaws.',
    type: 'boundary',
    difficulty: 'Easy',
    requirements: [
        { id: 'min-boundary', title: 'Minimum Boundary (18)', explanation: '18 is the exact threshold for allowed access.' },
        { id: 'below-min', title: 'Below Boundary (17)', explanation: '17 is the immediate value below the threshold.' },
        { id: 'typical-valid', title: 'Typical Adult Age', explanation: 'A normal valid age (19-149) must successfully grant access.' },
        { id: 'typical-invalid', title: 'Typical Child Age', explanation: 'A normal child age (1-16) must correctly deny access.' },
        { id: 'negative', title: 'Negative Value', explanation: 'Age cannot be negative. Logic should block this.' },
        { id: 'zero', title: 'Zero Value', explanation: '0 is a valid number but invalid age.' },
        { id: 'non-numeric', title: 'Text / Non-Numeric', explanation: 'Input should reject non-numeric characters.' },
        { id: 'decimal', title: 'Decimal Value', explanation: 'Age is typically an integer.' },
        { id: 'upper-boundary', title: 'Unrealistic High', explanation: 'Values like 150+ should probably be flagged.' },
        { id: 'trim-whitespace', title: 'Leading/Trailing Spaces', explanation: 'Age inputs with surrounding whitespace should be trimmed and verified.' },
        { id: 'leading-zeros', title: 'Leading Zeros', explanation: 'Inputs like "018" should be parsed correctly and verified.' },
    ]
};

const HELP_AREAS = [
    {
        area: 'Age Boundary Values',
        hint1: 'Test the exact threshold and values immediately surrounding it.',
        hint2: 'Try entering 18 (the minimum required age) and 17 (just below the minimum).',
    },
    {
        area: 'Invalid Numbers & Math',
        hint1: 'Consider what numeric values are mathematically possible but logically invalid for an age.',
        hint2: 'Try entering a negative number (e.g., -5) or exactly 0.',
    },
    {
        area: 'Format & Type Validation',
        hint1: 'What happens if the input is not a whole integer?',
        hint2: 'Try entering a decimal number (e.g., 18.5) or alphabetic text (e.g., "eighteen").',
    },
    {
        area: 'Unrealistic & Extreme Values',
        hint1: 'Are there human age limits? What if the user claims to be extremely old?',
        hint2: 'Try entering an unrealistic age, such as 150 or older.',
    },
    {
        area: 'Whitespace Tolerance',
        hint1: 'Should copying and pasting an age with accidental spaces fail to authenticate?',
        hint2: 'Try entering " 18 " or " 25" (with leading/trailing spaces) and check if it validates.',
    },
    {
        area: 'Formatting Gracefulness',
        hint1: 'What if someone fills in their age with leading zeros, like "018"?',
        hint2: 'Try entering "018" or "025" and see if the system handles the prefix correctly.',
    },
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
                            <p className="text-xs text-secondary-color">Click an area for a clue. Reveal more if you're stuck.</p>
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
                    <span>or triple-click the header icon</span>
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
// AgeGate Scenario
// ─────────────────────────────────────────────────────────────────────────────
const AgeGate = ({ addLog }) => {
    const [inputValue, setInputValue] = useState('');
    const [status, setStatus] = useState('LOCKED'); // LOCKED, GRANTED, DENIED
    const [message, setMessage] = useState('');
    const [showHelp, setShowHelp] = useState(false);

    const shieldClicks = useRef(0);
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

    // Triple click handler for help
    const handleShieldClick = () => {
        shieldClicks.current += 1;
        clearTimeout(clickTimer.current);
        clickTimer.current = setTimeout(() => {
            shieldClicks.current = 0;
        }, 700);

        if (shieldClicks.current >= 3) {
            shieldClicks.current = 0;
            setShowHelp(p => !p);
        }
    };

    const checkAge = (e) => {
        if (e) e.preventDefault();
        if (status !== 'LOCKED') return;

        const trimmed = inputValue.trim();
        const num = Number(trimmed);
        addLog({ type: 'info', message: `Verifying identity age: "${inputValue}"` });

        if (inputValue.trim() === '') {
            addLog({ type: 'error', message: 'Identity missing.', edgeCaseId: 'empty' });
            setMessage('Please enter your age.');
            return;
        }

        // Trigger trim-whitespace if value has surrounding whitespace and is otherwise valid
        if (inputValue !== trimmed) {
            const trimmedNum = Number(trimmed);
            if (!isNaN(trimmedNum) && trimmedNum >= 18 && trimmedNum < 150 && !trimmed.includes('.')) {
                addLog({ type: 'success', message: `✅ Leading/trailing whitespace trimmed: "${inputValue}" → "${trimmed}"`, edgeCaseId: 'trim-whitespace' });
            }
        }

        // Trigger leading-zeros if value has leading zeros (e.g., "018" or "0025") and is otherwise valid
        if (/^0+\d+/.test(inputValue)) {
            const parsed = parseInt(inputValue, 10);
            if (parsed >= 18 && parsed < 150) {
                addLog({ type: 'success', message: `✅ Leading zeros parsed correctly: "${inputValue}" → ${parsed}`, edgeCaseId: 'leading-zeros' });
            }
        }

        if (isNaN(num)) {
            addLog({ type: 'success', message: 'Syntax Error in Identity.', edgeCaseId: 'non-numeric' });
            setStatus('DENIED');
            setMessage('Invalid character syntax detected in identity fields.');
        } else if (trimmed.includes('.')) {
            addLog({ type: 'success', message: 'Decimal age detected.', edgeCaseId: 'decimal' });
            setStatus('DENIED');
            setMessage('Decimal age formats are not accepted.');
        } else if (num < 0) {
            addLog({ type: 'success', message: 'Temporal Anomaly (Negative Age).', edgeCaseId: 'negative' });
            setStatus('DENIED');
            setMessage('Negative age values cannot be authenticated.');
        } else if (num === 0) {
            addLog({ type: 'success', message: 'Age Zero.', edgeCaseId: 'zero' });
            setStatus('DENIED');
            setMessage('Age 0 is mathematically valid but disallowed.');
        } else if (num >= 1 && num <= 16) {
            addLog({ type: 'success', message: `Typical Child Age (${num}). Access Denied.`, edgeCaseId: 'typical-invalid' });
            setStatus('DENIED');
            setMessage('Access Denied. You must be 18 years or older.');
        } else if (num === 17) {
            addLog({ type: 'success', message: 'Boundary: Underage (17).', edgeCaseId: 'below-min' });
            setStatus('DENIED');
            setMessage('Access Denied. You must be 18 years or older to proceed.');
        } else if (num === 18) {
            addLog({ type: 'success', message: 'Boundary: Minimum Age (18). Access Granted.', edgeCaseId: 'min-boundary' });
            setStatus('GRANTED');
            setMessage('Verification successful! Access Granted.');
        } else if (num >= 150) {
            addLog({ type: 'success', message: 'Biological Impossibility (>=150).', edgeCaseId: 'upper-boundary' });
            setStatus('DENIED');
            setMessage('Unrealistic age input flagged by security policies.');
        } else if (num > 18 && num < 150) {
            addLog({ type: 'success', message: `Typical Adult Age (${num}). Access Granted.`, edgeCaseId: 'typical-valid' });
            setStatus('GRANTED');
            setMessage('Verification successful! Access Granted.');
        } else {
            setStatus('DENIED');
            setMessage('Access Denied. You must be 18 years or older.');
        }

        // Reset after delay to let the tester try another input
        setTimeout(() => {
            setInputValue('');
            setStatus('LOCKED');
            setMessage('');
        }, 3000);
    };

    return (
        <>
            {showHelp && createPortal(<HelpOverlay onClose={() => setShowHelp(false)} />, document.body)}

            <div className="flex items-center justify-center min-h-full p-6 bg-body">
                <div className="w-full max-w-sm bg-surface border border-theme rounded-2xl p-6 shadow-xl relative transition-all">
                    
                    {/* Header */}
                    <div className="text-center mb-6">
                        <button
                            type="button"
                            onClick={handleShieldClick}
                            title="Click 3× for help"
                            className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500/50 ${
                                status === 'GRANTED' ? 'bg-emerald-500/10 text-emerald-400' :
                                status === 'DENIED' ? 'bg-rose-500/10 text-rose-400' :
                                'bg-teal-500/10 text-teal-400 hover:scale-105'
                            }`}
                        >
                            <Shield className="w-7 h-7" />
                        </button>
                        <h2 className="text-xl font-bold text-primary-color">Age Verification</h2>
                        <p className="text-secondary-color text-xs mt-1">Please confirm your age to access restricted content.</p>
                    </div>

                    {/* Feedback states */}
                    {status !== 'LOCKED' && (
                        <div className={`flex items-start gap-2.5 p-3.5 rounded-xl border text-xs mb-5 animate-fadeIn ${
                            status === 'GRANTED'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        }`}>
                            {status === 'GRANTED' ? (
                                <CheckCircle className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            ) : (
                                <AlertOctagon className="w-4.5 h-4.5 text-rose-400 flex-shrink-0 mt-0.5" />
                            )}
                            <p className="font-medium leading-relaxed">{message}</p>
                        </div>
                    )}

                    {/* Input form */}
                    <form onSubmit={checkAge} className="space-y-4">
                        <div>
                            <label htmlFor="age-input" className="block text-sm font-medium text-primary-color mb-1.5">
                                Your Age
                            </label>
                            <div className="relative">
                                <input
                                    id="age-input"
                                    type="text"
                                    autoComplete="off"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    disabled={status !== 'LOCKED'}
                                    placeholder="Enter your age..."
                                    className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm bg-surface border border-theme text-primary-color placeholder:text-secondary-color outline-none transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-secondary-color/40">
                                    <CornerDownLeft className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={status !== 'LOCKED'}
                            className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-teal-500/10 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Verify Identity
                        </button>
                    </form>

                    {/* Footer instructions */}
                    <p className="mt-6 text-center text-xs text-secondary-color">
                        Need a clue?{' '}
                        <button
                            type="button"
                            onClick={() => setShowHelp(true)}
                            className="text-teal-400 hover:text-teal-300 transition-colors underline underline-offset-2"
                        >
                            Open testing guide
                        </button>
                        {' '}or press{' '}
                        <span className="font-mono text-primary-color">Shift+Alt+H</span>
                    </p>
                </div>
            </div>
        </>
    );
};

export default AgeGate;
