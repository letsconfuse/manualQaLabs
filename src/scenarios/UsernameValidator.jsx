import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, HelpCircle, X, ChevronDown, CheckCircle, AlertOctagon, RefreshCw } from 'lucide-react';

export const UsernameConfig = {
    id: 'username-validator',
    title: 'The Username Validator',
    description: 'Verify access controls on a username registration field. The system expects unique alphanumeric usernames between 3 and 20 characters. Test the form to check boundary values, reserved words, duplicates, and security vectors.',
    type: 'validation',
    difficulty: 'Medium',
    requirements: [
        { id: 'empty', title: 'Empty Input', explanation: 'Required field validation is fundamental.' },
        { id: 'spaces', title: 'Leading/Trailing Spaces', explanation: 'Inputs should be trimmed, or spaces should be rejected if not allowed.' },
        { id: 'short', title: 'Too Short (<3)', explanation: 'Usernames typically have a minimum length.' },
        { id: 'long', title: 'Too Long (>20)', explanation: 'Buffer overflow protection / DB limits.' },
        { id: 'special', title: 'Special Characters', explanation: 'Many systems only allow alphanumeric characters.' },
        { id: 'sqli', title: 'SQL Injection Attempt', explanation: 'Inputs must be sanitized against SQLi attacks.' },
        { id: 'xss', title: 'XSS Payload Attempt', explanation: 'Inputs must block HTML or JavaScript tag insertions.' },
        { id: 'admin', title: 'Reserved Keyword', explanation: '"Admin" is often a reserved username.' },
        { id: 'duplicate', title: 'Already Registered Username', explanation: 'Registering an existing username must be rejected.' },
        { id: 'case-insensitive-taken', title: 'Case Spoofing Prevention', explanation: 'Usernames must be unique case-insensitively to prevent impersonation.' },
    ]
};

const HELP_AREAS = [
    {
        area: 'Length Boundaries',
        hint1: 'Test how the system behaves when the input length is outside the acceptable range.',
        hint2: 'Try entering a username with less than 3 characters (e.g., "ab") or more than 20 characters.',
    },
    {
        area: 'Whitespace Tolerance',
        hint1: 'Are spaces allowed in usernames? What happens if you include leading or trailing spaces?',
        hint2: 'Try entering spaces inside the username (e.g., "user name") or surrounding it (e.g., " admin ").',
    },
    {
        area: 'Character Restrictions',
        hint1: 'Test characters other than standard letters and numbers.',
        hint2: 'Try using special symbols (e.g., $, %, #, @) to see if the validation blocks them.',
    },
    {
        area: 'Reserved system terms',
        hint1: 'Some common names are reserved by the system to prevent impersonation or syntax errors.',
        hint2: 'Try registering the username "admin" or database keywords like "null".',
    },
    {
        area: 'Security exploits',
        hint1: 'Check if the registration field is vulnerable to database injections or script rendering bugs.',
        hint2: 'Try entering SQL syntax (like quotes \' or comments --) or HTML/script tags (like <script>).',
    },
    {
        area: 'Account Uniqueness',
        hint1: 'How does the system handle names that already exist? Is it secure against minor case variations?',
        hint2: 'Try registering exact existing users like "testUser" or "alex", and then try registration with a different case (like "TESTUSER").',
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
                        <HelpCircle className="w-5 h-5 text-indigo-500" />
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
                                <span className="text-sm font-medium text-primary-color group-hover:text-indigo-400 transition-colors">{item.area}</span>
                                <ChevronDown className={`w-4 h-4 text-secondary-color transition-transform ${expanded[i] ? 'rotate-180' : ''}`} />
                            </button>

                            {expanded[i] && (
                                <div className="mt-3 space-y-2">
                                    <div className="bg-body border border-theme rounded-xl p-3 text-xs text-secondary-color">
                                        <span className="text-indigo-400 font-semibold block mb-0.5">Clue →</span>
                                        {item.hint1}
                                    </div>

                                    {(revealed[i] || 0) >= 1 ? (
                                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 text-xs text-indigo-300">
                                            <span className="font-semibold block mb-0.5">Detailed hint →</span>
                                            {item.hint2}
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => reveal(i)}
                                            className="text-xs text-secondary-color hover:text-indigo-400 transition-colors underline underline-offset-2"
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
// UsernameValidator Component
// ─────────────────────────────────────────────────────────────────────────────
const UsernameValidator = ({ addLog }) => {
    const [username, setUsername] = useState('');
    const [status, setStatus] = useState('IDLE'); // IDLE, SCANNING, VALID, INVALID
    const [message, setMessage] = useState('');
    const [showHelp, setShowHelp] = useState(false);

    const userClicks = useRef(0);
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
    const handleUserClick = () => {
        userClicks.current += 1;
        clearTimeout(clickTimer.current);
        clickTimer.current = setTimeout(() => {
            userClicks.current = 0;
        }, 700);

        if (userClicks.current >= 3) {
            userClicks.current = 0;
            setShowHelp(p => !p);
        }
    };

    const handleScan = (e) => {
        if (e) e.preventDefault();
        if (status === 'SCANNING') return;

        addLog({ type: 'info', message: `Checking username availability: "${username}"` });

        // 1. Empty Check
        if (username === '') {
            addLog({ type: 'error', message: 'Username field cannot be left blank.', edgeCaseId: 'empty' });
            setStatus('INVALID');
            setMessage('Username is required.');
            return;
        }

        setStatus('SCANNING');
        setMessage('Querying credentials directory...');

        setTimeout(() => {
            let valid = true;
            let errs = [];

            // Database of existing users (for duplicate/case checks)
            const TAKEN_USERNAMES = ['testUser', 'alex', 'sam', 'moderator'];

            // 2. Spaces Check (leading/trailing or internal)
            if (username.includes(' ') || username !== username.trim()) {
                addLog({ type: 'success', message: '✅ Whitespace characters detected in username.', edgeCaseId: 'spaces' });
                valid = false;
                errs.push('Spaces are not permitted.');
            }

            // 3. Length checks
            if (username.length < 3) {
                addLog({ type: 'success', message: `✅ Boundary breached: Username too short (${username.length} chars).`, edgeCaseId: 'short' });
                valid = false;
                errs.push('Must be at least 3 characters.');
            } else if (username.length > 20) {
                addLog({ type: 'success', message: `✅ Boundary breached: Username too long (${username.length} chars).`, edgeCaseId: 'long' });
                valid = false;
                errs.push('Cannot exceed 20 characters.');
            }

            // 4. SQL Injection Check
            if (username.includes("'") || username.includes('"') || username.includes('--') || username.includes(';') || username.includes('/*')) {
                addLog({ type: 'success', message: `✅ SQL injection characters detected: "${username}"`, edgeCaseId: 'sqli' });
                valid = false;
                errs.push('Security constraint: Invalid characters.');
            }

            // 5. XSS Script Injection Check
            if (/<[^>]+>|script/i.test(username)) {
                addLog({ type: 'success', message: `✅ XSS/HTML tag payload detected: "${username}"`, edgeCaseId: 'xss' });
                valid = false;
                errs.push('Security constraint: HTML/Script tags are forbidden.');
            }

            // 6. Special Characters Check (only allow standard a-z, A-Z, 0-9, and _)
            const hasSpecial = /[^a-zA-Z0-9_]/.test(username);
            if (hasSpecial) {
                addLog({ type: 'success', message: `✅ Special characters detected: "${username}"`, edgeCaseId: 'special' });
                valid = false;
                if (!errs.length) {
                    errs.push('Only letters, numbers, and underscores are allowed.');
                }
            }

            // 7. Reserved Keyword Check
            const lowerUser = username.toLowerCase();
            if (lowerUser === 'admin' || lowerUser === 'null' || lowerUser === 'root' || lowerUser === 'system') {
                addLog({ type: 'success', message: `✅ Reserved keyword restricted: "${username}"`, edgeCaseId: 'admin' });
                valid = false;
                errs.push('This username is reserved.');
            }

            // 8 & 9. Duplicate & Case-Insensitive Uniqueness Check
            const exactMatch = TAKEN_USERNAMES.includes(username);
            const caseMatch = !exactMatch && TAKEN_USERNAMES.some(u => u.toLowerCase() === lowerUser);

            if (exactMatch) {
                addLog({ type: 'success', message: `✅ Duplicate username collision: "${username}" is already taken.`, edgeCaseId: 'duplicate' });
                valid = false;
                errs.push('Username is already taken.');
            } else if (caseMatch) {
                addLog({ type: 'success', message: `✅ Case spoofing detected: "${username}" matches existing user with different case.`, edgeCaseId: 'case-insensitive-taken' });
                valid = false;
                errs.push('Username is already taken (case-insensitive collision).');
            }

            if (valid) {
                setStatus('VALID');
                setMessage(`Username "${username}" is available!`);
                addLog({ type: 'success', message: `Username "${username}" successfully verified.` });
            } else {
                setStatus('INVALID');
                setMessage(errs[0] || 'Invalid username.');
            }
        }, 1200);
    };

    return (
        <>
            {showHelp && createPortal(<HelpOverlay onClose={() => setShowHelp(false)} />, document.body)}

            <div className="flex items-center justify-center min-h-full p-6 bg-body">
                <div className="w-full max-w-sm bg-surface border border-theme rounded-2xl p-6 shadow-xl relative transition-all overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.02)_1px,transparent_1px)] bg-[size:16px_16px]"></div>

                    {/* Header */}
                    <div className="relative text-center mb-6">
                        <button
                            type="button"
                            onClick={handleUserClick}
                            title="Click 3× for help"
                            className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                                status === 'VALID' ? 'bg-emerald-500/10 text-emerald-400' :
                                status === 'INVALID' ? 'bg-rose-500/10 text-rose-400' :
                                'bg-indigo-500/10 text-indigo-400 hover:scale-105'
                            }`}
                        >
                            <User className="w-7 h-7" />
                        </button>
                        <h2 className="text-xl font-bold text-primary-color">Choose Username</h2>
                        <p className="text-secondary-color text-xs mt-1">Check availability to configure your system identity.</p>
                    </div>

                    {/* Feedback states */}
                    {status !== 'IDLE' && status !== 'SCANNING' && (
                        <div className={`flex items-start gap-2.5 p-3.5 rounded-xl border text-xs mb-5 animate-fadeIn ${
                            status === 'VALID'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        }`}>
                            <p className="font-medium leading-relaxed">{message}</p>
                        </div>
                    )}

                    {/* Input form */}
                    <form onSubmit={handleScan} className="space-y-4 relative">
                        <div>
                            <label htmlFor="username-input" className="block text-sm font-medium text-primary-color mb-1.5">
                                Username
                            </label>
                            <div className="relative">
                                <input
                                    id="username-input"
                                    type="text"
                                    autoComplete="off"
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                        if (status !== 'IDLE') setStatus('IDLE');
                                    }}
                                    disabled={status === 'SCANNING'}
                                    placeholder="Enter username..."
                                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-surface border border-theme text-primary-color placeholder:text-secondary-color outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                {status === 'SCANNING' && (
                                    <div className="absolute inset-y-0 right-3 flex items-center">
                                        <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'SCANNING'}
                            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/10 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {status === 'SCANNING' ? 'Checking availability...' : 'Check Availability'}
                        </button>
                    </form>

                    {/* Footer instructions */}
                    <p className="mt-6 text-center text-xs text-secondary-color relative">
                        Need a clue?{' '}
                        <button
                            type="button"
                            onClick={() => setShowHelp(true)}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-2"
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

export default UsernameValidator;
