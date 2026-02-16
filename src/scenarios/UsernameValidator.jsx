import React, { useState } from 'react';

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

    const handleCheck = (e) => {
        e.preventDefault();

        addLog({ type: 'info', message: `Checking username: "${username}"` });

        if (!username) {
            addLog({ type: 'error', message: 'Username is empty.', edgeCaseId: 'empty' });
            return;
        }

        // specific SQLi patterns
        const sqliPatterns = ["' OR '1'='1", "' OR 1=1", "--", "; DROP TABLE"];
        if (sqliPatterns.some(p => username.toUpperCase().includes(p.toUpperCase()))) {
            addLog({ type: 'success', message: 'Security Alert: SQL Injection pattern detected!', edgeCaseId: 'sqli' });
            return;
        }

        if (username.startsWith(' ') || username.endsWith(' ')) {
            addLog({ type: 'success', message: 'Edge case: Input has un-trimmed whitespace.', edgeCaseId: 'spaces' });
        }

        if (username.length < 3) {
            addLog({ type: 'success', message: 'Validation: Username too short.', edgeCaseId: 'short' });
        } else if (username.length > 20) {
            addLog({ type: 'success', message: 'Validation: Username too long.', edgeCaseId: 'long' });
        }

        if (/[^a-zA-Z0-9 ]/.test(username)) {
            addLog({ type: 'success', message: 'Validation: Contains special characters.', edgeCaseId: 'special' });
        }

        if (username.toLowerCase() === 'admin') {
            addLog({ type: 'success', message: 'Business Logic: Restricted username.', edgeCaseId: 'admin' });
        }

        // Use a slightly different logic for "success" feedback for valid inputs
        if (username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9]+$/.test(username.trim()) && username.toLowerCase() !== 'admin') {
            addLog({ type: 'info', message: 'Username appears valid.' });
        }

        setUsername('');
    };

    return (
        <div className="w-full max-w-sm bg-slate-900 border border-slate-700 p-0 rounded-xl shadow-2xl overflow-hidden">
            <div className="bg-slate-800 p-6 border-b border-slate-700">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">👤</span> Create Username
                </h3>
                <p className="text-slate-400 text-xs mt-1">Claim your unique digital identity.</p>
            </div>

            <div className="p-6 space-y-6">
                <form onSubmit={handleCheck} className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Username</label>
                        <input
                            type="text"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-mono text-lg"
                            placeholder="e.g. user_123"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <p className="text-xs text-slate-500">3-20 characters, alphanumeric only.</p>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 active:scale-[0.98]"
                    >
                        Check Availability
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UsernameValidator;
