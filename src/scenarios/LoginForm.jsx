import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Lock, Mail, Eye, EyeOff, CheckCircle, RefreshCw, HelpCircle, X, ChevronDown } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Config — edge cases the QA runner tracks
// ─────────────────────────────────────────────────────────────────────────────
export const LoginFormConfig = {
    id: 'login-form',
    title: 'The Login Form',
    description: 'A realistic login form with hidden flaws. Log in, fail gracefully, and uncover every edge case — from boundary values to security vulnerabilities.',
    type: 'security',
    difficulty: 'Medium',
    requirements: [
        { id: 'correct-login',       title: 'Successful Login',                    explanation: 'Valid credentials must redirect to a dashboard, create a session, and show user identity.' },
        { id: 'empty-both',          title: 'Submit Both Fields Empty',             explanation: 'Both fields must show validation errors simultaneously — not sequentially.' },
        { id: 'empty-email',         title: 'Missing Email',                        explanation: 'Email-specific validation error when only email is blank.' },
        { id: 'empty-password',      title: 'Missing Password',                     explanation: 'Password-specific validation error when only password is blank.' },
        { id: 'whitespace-only',     title: 'Whitespace-Only Input',                explanation: 'Spaces look like content but trimmed value is empty. Should be caught.' },
        { id: 'leading-trailing-ws', title: 'Leading/Trailing Whitespace',          explanation: 'Email with surrounding spaces should be trimmed and still authenticate.' },
        { id: 'invalid-email',       title: 'Invalid Email Format',                 explanation: 'Non-email strings must be rejected with a format error.' },
        { id: 'wrong-creds',         title: 'Generic Error on Wrong Credentials',   explanation: 'Error must NOT reveal which field failed — prevents credential stuffing.' },
        { id: 'username-enum',       title: 'Username Enumeration Prevention',      explanation: 'Unregistered email and wrong password must show identical error messages.' },
        { id: 'suspended-account',   title: 'Suspended Account',                    explanation: 'Specific message — not generic invalid credentials — with a recovery path.' },
        { id: 'expired-account',     title: 'Expired Account',                      explanation: 'Expiry message with a clear next step rather than a generic failure.' },
        { id: 'sqli',                title: 'SQL Injection Attempt',                explanation: "Payload like admin'-- in the email field must not bypass authentication." },
        { id: 'xss',                 title: 'XSS Payload in Password',              explanation: '<script>alert(1)</script> must render as text, never execute.' },
        { id: 'long-input',          title: 'Excessively Long Input',               explanation: '300+ characters should be gracefully rejected without crash or HTTP 500.' },
        { id: 'brute-force',         title: 'Brute-Force Lockout',                  explanation: 'Account locks after the maximum consecutive failures.' },
        { id: 'lockout-message',     title: 'Lockout Message Quality',              explanation: 'Message must state duration and recovery path, not just "locked".' },
        { id: 'remember-me',         title: 'Remember Me Produces Persistent Token', explanation: 'Checking Remember Me must issue a long-lived token vs a session token.' },
        { id: 'case-sensitivity',    title: 'Email Case Sensitivity Bug',           explanation: 'USER@TEST.COM should work if user@test.com is valid — this app has a bug here.' },
        { id: 'special-chars',       title: 'Special Characters in Password',       explanation: 'Passwords with @#$%^&*() must be processed correctly without stripping.' },
        { id: 'min-boundary',        title: 'Minimum Password Length Boundary',     explanation: 'Exactly 8-character password must succeed — boundary must be inclusive (≥ 8, not > 8).' },
    ]
};

// ─────────────────────────────────────────────────────────────────────────────
// Help system — tiered hints per area
// Help shortcut: Shift + Alt + H  OR  triple-click the lock icon
// ─────────────────────────────────────────────────────────────────────────────
const HELP_AREAS = [
    {
        area: 'Authentication Flow',
        hint1: 'There are known test accounts. Try to find the right format.',
        hint2: 'Valid active account: user@test.com — find the password by probing the password rules.',
    },
    {
        area: 'Validation & Boundaries',
        hint1: 'Think about what happens at the edges: zero characters, minimum, maximum.',
        hint2: 'Try submitting empty fields, whitespace-only fields, and passwords of exactly 8 characters.',
    },
    {
        area: 'Account States',
        hint1: 'Not all accounts are active. Some may have been restricted.',
        hint2: 'Try suspended@test.com and expired@test.com with an obvious password.',
    },
    {
        area: 'Security Vectors',
        hint1: 'Authentication inputs are a classic target. Think about injections.',
        hint2: "Try SQL injection in the email field (e.g. ' OR 1=1--) and an XSS payload in the password.",
    },
    {
        area: 'Session Behaviour',
        hint1: 'There is a control on the form that affects how long a session lasts.',
        hint2: 'Toggle the Remember Me checkbox and observe the difference in token type after login.',
    },
    {
        area: 'Error Message Quality',
        hint1: 'Pay attention to what error messages say — and what they should NOT say.',
        hint2: 'A good login form never reveals which field failed. Try an unknown email vs a known email with a wrong password.',
    },
    {
        area: 'Resilience & Edge Inputs',
        hint1: 'What happens if you paste a huge string or include HTML tags?',
        hint2: 'Try pasting 300+ characters and also try <script>alert(1)</script> in the password field.',
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Simulated user database
// ─────────────────────────────────────────────────────────────────────────────
const USER_DB = [
    { email: 'user@test.com',      password: 'Password1!', status: 'active',    name: 'Alex Tester'    },
    { email: 'special@test.com',   password: 'p@$$w0rd!',  status: 'active',    name: 'Sam Special'    },
    { email: 'short@test.com',     password: 'Short123',   status: 'active',    name: 'Min Boundary'   },
    { email: 'suspended@test.com', password: 'Password1!', status: 'suspended', name: 'Suspended User' },
    { email: 'expired@test.com',   password: 'Password1!', status: 'expired',   name: 'Expired User'   },
];

const MAX_LEN   = 256;
const MIN_PASS  = 8;
const MAX_TRIES = 5;
const LOCK_MIN  = 15;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SQL_RE   = /('|--|;|\/\*|\*\/|UNION|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|OR\s+\d+=\d+)/i;
const XSS_RE   = /<[^>]+>/;

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
                        <HelpCircle className="w-5 h-5 text-violet-500" />
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
                    <span>or triple-click the 🔒 icon</span>
                </div>

                {/* Areas */}
                <div className="overflow-y-auto max-h-[60vh] divide-y divide-theme">
                    {HELP_AREAS.map((item, i) => (
                        <div key={i} className="px-5 py-3">
                            <button
                                onClick={() => toggle(i)}
                                className="w-full flex items-center justify-between text-left group"
                            >
                                <span className="text-sm font-medium text-primary-color group-hover:text-violet-400 transition-colors">{item.area}</span>
                                <ChevronDown className={`w-4 h-4 text-secondary-color transition-transform ${expanded[i] ? 'rotate-180' : ''}`} />
                            </button>

                            {expanded[i] && (
                                <div className="mt-3 space-y-2">
                                    {/* Hint 1 — always shown when expanded */}
                                    <div className="bg-body border border-theme rounded-xl p-3 text-xs text-secondary-color">
                                        <span className="text-violet-400 font-semibold block mb-0.5">Clue →</span>
                                        {item.hint1}
                                    </div>

                                    {/* Hint 2 — only shown after clicking "I'm stuck" */}
                                    {(revealed[i] || 0) >= 1 ? (
                                        <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 text-xs text-violet-300">
                                            <span className="font-semibold block mb-0.5">Detailed hint →</span>
                                            {item.hint2}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => reveal(i)}
                                            className="text-xs text-secondary-color hover:text-violet-400 transition-colors underline underline-offset-2"
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
// Dashboard (post-login)
// ─────────────────────────────────────────────────────────────────────────────
const Dashboard = ({ user, rememberMe, onLogout }) => (
    <div className="flex flex-col items-center justify-center min-h-full p-8 bg-body">
        <div className="w-full max-w-sm bg-surface border border-theme rounded-2xl p-8 text-center shadow-lg">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-5 shadow-lg shadow-emerald-500/20">
                <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-primary-color mb-1">Welcome back, {user.name}!</h2>
            <p className="text-secondary-color text-sm mb-5">You are signed in to your account.</p>
            <div className="bg-body border border-theme rounded-xl p-3 text-xs text-secondary-color mb-6 text-left">
                <p className="font-semibold text-primary-color mb-1">Session details</p>
                <p>Token type: <span className="text-primary-color font-medium">{rememberMe ? 'Persistent (30 days)' : 'Session-only'}</span></p>
                <p>Account: <span className="text-primary-color font-medium">{user.email}</span></p>
            </div>
            <button onClick={onLogout}
                className="flex items-center gap-1.5 mx-auto text-xs text-secondary-color hover:text-primary-color transition-colors underline underline-offset-2">
                <RefreshCw className="w-3 h-3" /> Sign out
            </button>
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main login form
// ─────────────────────────────────────────────────────────────────────────────
const LoginForm = ({ addLog }) => {
    const [email, setEmail]             = useState('');
    const [password, setPassword]       = useState('');
    const [rememberMe, setRememberMe]   = useState(false);
    const [showPw, setShowPw]           = useState(false);
    const [emailErr, setEmailErr]       = useState('');
    const [passErr, setPassErr]         = useState('');
    const [status, setStatus]           = useState({ type: '', msg: '' });
    const [attempts, setAttempts]       = useState(0);
    const [loggedIn, setLoggedIn]       = useState(null);
    const [xssWarning, setXssWarning]   = useState(false);
    const [showHelp, setShowHelp]       = useState(false);

    const attemptRef      = useRef(0);
    const loggedCases     = useRef(new Set());
    const lockIconClicks  = useRef(0);
    const lockClickTimer  = useRef(null);

    // ── once-per-session edge case logger ──────────────────────────────────
    const logOnce = useCallback((id, type, msg) => {
        if (loggedCases.current.has(id)) return;
        loggedCases.current.add(id);
        addLog({ type, message: msg, edgeCaseId: id });
    }, [addLog]);

    // ── Keyboard shortcut: Shift + Alt + H ────────────────────────────────
    useEffect(() => {
        const onKey = (e) => {
            if (e.shiftKey && e.altKey && e.key.toLowerCase() === 'h') {
                e.preventDefault();
                setShowHelp(p => !p);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // ── Triple-click on lock icon ─────────────────────────────────────────
    const handleLockClick = () => {
        lockIconClicks.current += 1;
        clearTimeout(lockClickTimer.current);
        lockClickTimer.current = setTimeout(() => { lockIconClicks.current = 0; }, 700);
        if (lockIconClicks.current >= 3) {
            lockIconClicks.current = 0;
            setShowHelp(p => !p);
        }
    };

    const isLocked = status.type === 'locked';

    // ── Email input ────────────────────────────────────────────────────────
    const onEmailChange = (e) => {
        const v = e.target.value;
        if (v.length > MAX_LEN) {
            logOnce('long-input', 'success', '✅ Long input: email silently capped at 256 chars — no visual feedback (BUG).');
            return;
        }
        if (SQL_RE.test(v)) logOnce('sqli', 'success', `✅ SQL injection detected in email field: "${v}"`);
        setEmail(v);
        if (emailErr) setEmailErr('');
    };

    // ── Password input ─────────────────────────────────────────────────────
    const onPassChange = (e) => {
        const v = e.target.value;
        if (v.length > MAX_LEN) {
            logOnce('long-input', 'success', '✅ Long input: password silently capped at 256 chars — no visual feedback (BUG).');
            return;
        }
        if (XSS_RE.test(v)) {
            setXssWarning(true);
            logOnce('xss', 'success', `✅ XSS payload in password: "${v}" — rendered as text, never executed.`);
        } else {
            setXssWarning(false);
        }
        if (/[@#$%^&*()\-+=!]/.test(v)) logOnce('special-chars', 'success', '✅ Special characters in password — processed correctly without stripping.');
        setPassword(v);
        if (passErr) setPassErr('');
    };

    // ── Submit ─────────────────────────────────────────────────────────────
    const onSubmit = (e) => {
        e.preventDefault();
        if (isLocked) return;

        setEmailErr(''); setPassErr(''); setStatus({ type: '', msg: '' });

        const emailBlank    = email.length === 0;
        const passBlank     = password.length === 0;
        const emailWsOnly   = !emailBlank && email.trim() === '';
        const passWsOnly    = !passBlank  && password.trim() === '';

        // ── Empty / whitespace-only ────────────────────────────────────────
        const emailInvalid = emailBlank || emailWsOnly;
        const passInvalid  = passBlank  || passWsOnly;

        if (emailInvalid && passInvalid) {
            setEmailErr(emailBlank ? 'Email is required.' : 'Email cannot be whitespace only.');
            setPassErr(passBlank   ? 'Password is required.' : 'Password cannot be whitespace only.');
            addLog({
                type: 'success',
                message: emailBlank && passBlank
                    ? '✅ Both fields empty — simultaneous validation errors shown.'
                    : '✅ Whitespace-only inputs — trimmed to empty, rejected on both fields.',
                edgeCaseId: emailBlank && passBlank ? 'empty-both' : 'whitespace-only',
            });
            return;
        }
        if (emailInvalid) {
            setEmailErr(emailBlank ? 'Email is required.' : 'Email cannot be whitespace only.');
            addLog({ type: 'success', message: emailBlank ? '✅ Email field empty.' : '✅ Whitespace-only email rejected.', edgeCaseId: emailBlank ? 'empty-email' : 'whitespace-only' });
            return;
        }
        if (passInvalid) {
            setPassErr(passBlank ? 'Password is required.' : 'Password cannot be whitespace only.');
            addLog({ type: 'success', message: passBlank ? '✅ Password field empty.' : '✅ Whitespace-only password rejected.', edgeCaseId: passBlank ? 'empty-password' : 'whitespace-only' });
            return;
        }

        const trimEmail = email.trim();
        const trimPass  = password.trim();

        // ── Leading/trailing whitespace on valid input ──────────────────────
        if (email !== trimEmail) logOnce('leading-trailing-ws', 'success', `✅ Leading/trailing whitespace on email — trimmed before lookup: "${email}" → "${trimEmail}"`);

        // ── Email format ────────────────────────────────────────────────────
        if (!EMAIL_RE.test(trimEmail)) {
            setEmailErr('Please enter a valid email address (e.g. you@example.com).');
            addLog({ type: 'success', message: `✅ Invalid email format: "${trimEmail}"`, edgeCaseId: 'invalid-email' });
            return;
        }

        // ── Min password length ─────────────────────────────────────────────
        if (trimPass.length < MIN_PASS) {
            setPassErr(`Password must be at least ${MIN_PASS} characters.`);
            return;
        }
        if (trimPass.length === MIN_PASS) logOnce('min-boundary', 'success', `✅ Minimum password length boundary (${MIN_PASS} chars) — inclusive check confirmed.`);

        // ── Remember Me ─────────────────────────────────────────────────────
        logOnce('remember-me', 'success', `✅ Remember Me is ${rememberMe ? 'ON — persistent (30-day) token issued.' : 'OFF — session-only token issued.'}`);

        const lowerEmail = trimEmail.toLowerCase();

        // ── BUG: case-sensitive match ───────────────────────────────────────
        const exactMatch = USER_DB.find(u => u.email === trimEmail && u.password === trimPass);
        const caseMatch  = !exactMatch && USER_DB.find(u => u.email === lowerEmail && u.password === trimPass);
        if (caseMatch) addLog({ type: 'success', message: `✅ Case sensitivity BUG: "${trimEmail}" fails but "${lowerEmail}" would succeed.`, edgeCaseId: 'case-sensitivity' });

        // ── Account state checks (case-insensitive email for these) ─────────
        const accountRow = USER_DB.find(u => u.email === lowerEmail);
        if (accountRow && accountRow.password === trimPass) {
            if (accountRow.status === 'suspended') {
                setStatus({ type: 'warning', msg: 'Your account has been suspended. Please contact support@qalab.dev or visit our Help Centre to restore access.' });
                addLog({ type: 'success', message: '✅ Suspended account: specific message shown with recovery path (not generic invalid credentials).', edgeCaseId: 'suspended-account' });
                return;
            }
            if (accountRow.status === 'expired') {
                setStatus({ type: 'warning', msg: 'Your account access has expired. Please renew your subscription or contact your administrator for access.' });
                addLog({ type: 'success', message: '✅ Expired account: expiry message with next step shown.', edgeCaseId: 'expired-account' });
                return;
            }
        }

        // ── Auth result ─────────────────────────────────────────────────────
        if (exactMatch && exactMatch.status === 'active') {
            setLoggedIn({ ...exactMatch, rememberMe });
            addLog({ type: 'success', message: `✅ Successful login — dashboard redirect confirmed. ${rememberMe ? 'Persistent' : 'Session-only'} token created.`, edgeCaseId: 'correct-login' });
            attemptRef.current = 0; setAttempts(0);
            return;
        }

        // ── Wrong credentials ───────────────────────────────────────────────
        const n = attemptRef.current + 1;
        attemptRef.current = n; setAttempts(n);

        const emailKnown = USER_DB.some(u => u.email === lowerEmail);
        if (!emailKnown) logOnce('username-enum', 'success', `✅ Unregistered email "${trimEmail}" — error is identical to wrong-password message (prevents enumeration).`);
        addLog({ type: 'success', message: `✅ Wrong credentials — generic error, attempt ${n}/${MAX_TRIES}.`, edgeCaseId: 'wrong-creds' });

        if (n >= MAX_TRIES) {
            setStatus({ type: 'locked', msg: `Account locked for ${LOCK_MIN} minutes after ${MAX_TRIES} failed attempts. To unlock early, check your email for a reset link or contact support@qalab.dev.` });
            addLog({ type: 'success', message: `✅ Brute-force lockout after ${MAX_TRIES} attempts.`, edgeCaseId: 'brute-force' });
            addLog({ type: 'success', message: `✅ Lockout message includes duration (${LOCK_MIN} min) and recovery path.`, edgeCaseId: 'lockout-message' });
        } else {
            setStatus({ type: 'error', msg: `Invalid email or password. ${MAX_TRIES - n} attempt${MAX_TRIES - n !== 1 ? 's' : ''} remaining.` });
        }
    };

    // ── Reset ──────────────────────────────────────────────────────────────
    const reset = () => {
        setEmail(''); setPassword(''); setRememberMe(false); setShowPw(false);
        setEmailErr(''); setPassErr(''); setStatus({ type: '', msg: '' });
        setAttempts(0); attemptRef.current = 0;
        setLoggedIn(null); setXssWarning(false);
        loggedCases.current.clear();
        addLog({ type: 'info', message: 'Form reset.', edgeCaseId: null });
    };

    // ── Render dashboard ───────────────────────────────────────────────────
    if (loggedIn) return <Dashboard user={loggedIn} rememberMe={loggedIn.rememberMe} onLogout={reset} />;

    const bannerCls = {
        error:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        warning: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        locked:  'bg-red-500/10  text-red-400   border-red-500/20',
    }[status.type] || '';

    return (
        <>
            {showHelp && createPortal(<HelpOverlay onClose={() => setShowHelp(false)} />, document.body)}

            <div className="flex items-center justify-center min-h-full p-6 bg-body">
                <div className="w-full max-w-sm">

                    {/* Logo / header */}
                    <div className="text-center mb-8">
                        <button
                            onClick={handleLockClick}
                            title="Click 3× for help"
                            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 mb-4 shadow-lg shadow-violet-500/20 cursor-pointer hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        >
                            <Lock className="w-7 h-7 text-white" />
                        </button>
                        <h1 className="text-2xl font-bold text-primary-color">Welcome back</h1>
                        <p className="text-secondary-color text-sm mt-1">Sign in to your account to continue.</p>
                    </div>

                    {/* Status banner */}
                    {status.type && (
                        <div className={`rounded-xl px-4 py-3 mb-5 text-sm border ${bannerCls}`}>
                            {status.msg}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={onSubmit} noValidate className="space-y-4">

                        {/* Email */}
                        <div>
                            <label htmlFor="lf-email" className="block text-sm font-medium text-primary-color mb-1.5">Email address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-color pointer-events-none" />
                                <input
                                    id="lf-email"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={onEmailChange}
                                    disabled={isLocked}
                                    placeholder="you@example.com"
                                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-surface border text-primary-color placeholder:text-secondary-color outline-none transition-colors focus:ring-2 focus:ring-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed ${emailErr ? 'border-red-500/60' : 'border-theme focus:border-violet-500'}`}
                                />
                            </div>
                            {emailErr && <p className="mt-1.5 text-xs text-red-400">{emailErr}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label htmlFor="lf-password" className="text-sm font-medium text-primary-color">Password</label>
                                <button type="button" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Forgot password?</button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-color pointer-events-none" />
                                <input
                                    id="lf-password"
                                    type={showPw ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={onPassChange}
                                    disabled={isLocked}
                                    placeholder="••••••••"
                                    className={`w-full pl-9 pr-10 py-2.5 rounded-xl text-sm bg-surface border text-primary-color placeholder:text-secondary-color outline-none transition-colors focus:ring-2 focus:ring-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed ${passErr ? 'border-red-500/60' : 'border-theme focus:border-violet-500'}`}
                                />
                                <button type="button" onClick={() => setShowPw(p => !p)} disabled={isLocked}
                                    aria-label={showPw ? 'Hide password' : 'Show password'}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-color hover:text-primary-color transition-colors">
                                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {passErr    && <p className="mt-1.5 text-xs text-red-400">{passErr}</p>}
                            {xssWarning && <p className="mt-1.5 text-xs text-orange-400">⚠️ HTML detected — stored as plain text, not rendered.</p>}
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center gap-2.5">
                            <input id="lf-remember" type="checkbox" checked={rememberMe}
                                onChange={e => setRememberMe(e.target.checked)} disabled={isLocked}
                                className="w-4 h-4 rounded accent-violet-600 cursor-pointer" />
                            <label htmlFor="lf-remember" className="text-sm text-secondary-color cursor-pointer select-none">Remember me for 30 days</label>
                        </div>

                        {/* Attempt counter */}
                        {attempts > 0 && !isLocked && (
                            <p className="text-xs text-center text-secondary-color">
                                Failed attempts: <span className="text-red-400 font-semibold">{attempts}</span> / {MAX_TRIES}
                            </p>
                        )}

                        {/* Submit */}
                        <button id="lf-submit" type="submit" disabled={isLocked}
                            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isLocked
                                ? 'bg-surface text-secondary-color cursor-not-allowed border border-theme'
                                : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-violet-500/20 active:scale-[0.98]'}`}>
                            {isLocked ? '🔒 Account Locked' : 'Sign In'}
                        </button>
                    </form>

                    {/* Footer hint for help */}
                    <p className="mt-6 text-center text-xs text-secondary-color">
                        Need a clue?{' '}
                        <button onClick={() => setShowHelp(true)} className="text-violet-400 hover:text-violet-300 transition-colors underline underline-offset-2">
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

export default LoginForm;
