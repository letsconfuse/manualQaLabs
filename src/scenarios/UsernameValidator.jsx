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
    };

    return (
        <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow-lg text-slate-900">
            <h3 className="text-xl font-bold mb-4">Create Username</h3>
            <form onSubmit={handleCheck} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">3-20 characters, alphanumeric only.</p>
                </div>
                <button
                    type="submit"
                    className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                    Check Availability
                </button>
            </form>
        </div>
    );
};

export default UsernameValidator;
