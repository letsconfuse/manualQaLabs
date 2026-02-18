import React, { useState } from 'react';
import { User } from 'lucide-react';

export const UsernameConfig = {
    id: 'username-validator',
    title: 'The Username Validator',
    description: 'A classic registration field with hidden rules. Test for length, characters, and SQL injection.',
    type: 'validation',
    difficulty: 'Medium',
    requirements: [
        { id: 'empty', title: 'Empty Input', explanation: 'Required field validation is fundamental.' },
        { id: 'spaces', title: 'Leading/Trailing Spaces', explanation: 'Inputs should be trimmed, or spaces should be rejected if not allowed.' },
        { id: 'short', title: 'Too Short (<3)', explanation: 'Usernames typically have a minimum length.' },
        { id: 'long', title: 'Too Long (>20)', explanation: 'Buffer overflow protection / DB limits.' },
        { id: 'special', title: 'Special Characters', explanation: 'Many systems only allow alphanumeric characters.' },
        { id: 'sqli', title: 'SQL Injection Attempt', explanation: 'Inputs must be sanitized against SQLi attacks.' },
        { id: 'admin', title: 'Reserved Keyword', explanation: '"Admin" is often a reserved username.' },
    ]
};

const UsernameValidator = ({ addLog }) => {
    const [username, setUsername] = useState('');
    const [checks, setChecks] = useState({
        length: false,
        chars: false,
        audit: false,
        unique: false
    });
    const [status, setStatus] = useState('IDLE'); // IDLE, SCANNING, VALID, INVALID

    const handleInput = (e) => {
        const val = e.target.value;
        setUsername(val);
        validate(val);
    };

    const validate = (val) => {
        const newChecks = {
            length: val.length >= 3 && val.length <= 20,
            chars: /^[a-zA-Z0-9_]+$/.test(val),
            audit: !val.toLowerCase().includes('admin') && !val.toLowerCase().includes('null'),
            unique: val !== 'testUser' // Mock DB check
        };
        setChecks(newChecks);

        // Edge Case Logging (Debounced slightly in real world, but here generic)
        if (val.includes(' ')) {
            addLog({ type: 'success', message: 'Whitespace detected: Spaces are not allowed.', edgeCaseId: 'spaces' });
        }
        if (val.length > 20) {
            addLog({ type: 'success', message: 'Buffer limit exceeded (>20 chars).', edgeCaseId: 'long' });
        }
        if (val.includes("'") || val.includes('"')) {
            addLog({ type: 'success', message: 'Security Alert: SQL Injection characters detected.', edgeCaseId: 'sqli' });
        }
    };

    const handleScan = () => {
        if (!username) return;
        setStatus('SCANNING');
        addLog({ type: 'info', message: `Initiating identity scan for: ${username}` });

        setTimeout(() => {
            const allPassed = Object.values(checks).every(c => c);
            if (allPassed) {
                setStatus('VALID');
                addLog({ type: 'info', message: 'Identity verified. Access generated.' });
            } else {
                setStatus('INVALID');
                addLog({ type: 'error', message: 'Identity verification failed.' });
            }

            // Auto-reset for next attempt
            setTimeout(() => {
                setStatus('IDLE');
                setUsername('');
                setChecks({
                    length: false,
                    chars: false,
                    audit: false,
                    unique: false
                });
            }, 2000);
        }, 1500);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && status !== 'SCANNING' && username) {
            handleScan();
        }
    };


    return (
        <div className="w-full max-w-sm bg-surface border border-theme p-0 rounded-2xl shadow-3d overflow-hidden relative group transition-colors">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

            {/* Header */}
            <div className="relative p-6 border-b border-theme bg-surface/90 backdrop-blur transition-colors">
                <div className="flex justify-between items-center mb-2">
                    <User className="w-6 h-6 text-accent-secondary" />
                    <div className="text-[10px] font-mono text-accent-secondary/70 animate-pulse">SYSTEM_READY</div>
                </div>
                <h3 className="text-lg font-bold text-primary-color tracking-tight">Identity Register</h3>
            </div>

            <div className="relative p-6 space-y-6">
                {/* Input Area */}
                <div className="relative">
                    <input
                        type="text"
                        className="w-full bg-body border-2 border-theme focus:border-accent-secondary rounded-xl px-4 py-4 text-primary-color placeholder-slate-400 focus:outline-none transition-all font-mono text-center tracking-widest uppercase"
                        placeholder="ENTER_ID"
                        value={username}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        disabled={status === 'SCANNING'}
                    />
                    {status === 'SCANNING' && (
                        <div className="absolute inset-0 bg-accent-secondary/10 animate-pulse rounded-xl border-2 border-accent-secondary/50"></div>
                    )}
                </div>

                {/* Live Checklist */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-secondary-color font-mono">
                        <span>Length (3-20)</span>
                        <div className={`w-2 h-2 rounded-full ${checks.length ? 'bg-accent-secondary shadow-[0_0_8px_#10b981]' : 'bg-slate-300 dark:bg-slate-700'}`} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-secondary-color font-mono">
                        <span>Alphanumeric Only</span>
                        <div className={`w-2 h-2 rounded-full ${checks.chars ? 'bg-accent-secondary shadow-[0_0_8px_#10b981]' : 'bg-slate-300 dark:bg-slate-700'}`} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-secondary-color font-mono">
                        <span>Restricted Terms</span>
                        <div className={`w-2 h-2 rounded-full ${checks.audit ? 'bg-accent-secondary shadow-[0_0_8px_#10b981]' : 'bg-slate-300 dark:bg-slate-700'}`} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-secondary-color font-mono">
                        <span>Availability</span>
                        <div className={`w-2 h-2 rounded-full ${checks.unique ? 'bg-accent-secondary shadow-[0_0_8px_#10b981]' : 'bg-slate-300 dark:bg-slate-700'}`} />
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={handleScan}
                    disabled={status === 'SCANNING' || !username}
                    className={`w-full py-4 rounded-xl font-bold tracking-widest uppercase transition-all relative overflow-hidden ${status === 'VALID' ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]' :
                        status === 'INVALID' ? 'bg-red-600 text-white shadow-[0_0_20px_#dc2626]' :
                            'bg-body border border-theme text-secondary-color hover:bg-slate-900 hover:text-white dark:hover:bg-slate-100 dark:hover:text-slate-900'
                        }`}
                >
                    {status === 'SCANNING' ? 'VERIFYING...' :
                        status === 'VALID' ? 'ACCESS GRANTED' :
                            status === 'INVALID' ? 'ACCESS DENIED' : 'INITIATE SCAN'}

                    {status === 'SCANNING' && (
                        <div className="absolute bottom-0 left-0 h-1 bg-accent-secondary animate-[width_1.5s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
                    )}
                </button>
            </div>

            {/* Scanner Line */}
            <div className="absolute top-0 w-full h-[2px] bg-emerald-500/30 blur-[1px] animate-[scan_3s_linear_infinite] pointer-events-none"></div>
        </div>
    );
};

export default UsernameValidator;
