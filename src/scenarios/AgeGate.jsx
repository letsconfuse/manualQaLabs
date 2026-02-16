import React, { useState } from 'react';

export const AgeGateConfig = {
    id: 'age-gate',
    title: 'The Age Gate',
    description: 'Test a simple age verification input. Can you find all the boundary values and invalid inputs?',
    type: 'boundary',
    difficulty: 'Easy',
    requirements: [
        { id: 'min-boundary', title: 'Minimum Boundary (18)', explanation: '18 is the exact threshold for allowed access.' },
        { id: 'below-min', title: 'Below Boundary (17)', explanation: '17 is the immediate value below the threshold.' },
        { id: 'negative', title: 'Negative Value', explanation: 'Age cannot be negative. Logic should block this.' },
        { id: 'zero', title: 'Zero Value', explanation: '0 is a valid number but invalid age.' },
        { id: 'non-numeric', title: 'Text / Non-Numeric', explanation: 'Input should reject non-numeric characters.' },
        { id: 'decimal', title: 'Decimal Value', explanation: 'Age is typically an integer.' },
        { id: 'upper-boundary', title: 'Unrealistic High', explanation: 'Values like 150+ should probably be flagged.' },
    ]
};

const AgeGate = ({ addLog }) => {
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        // Check specific edge cases
        const num = Number(inputValue);
        const isInt = Number.isInteger(num);

        // Log interaction
        addLog({ type: 'info', message: `User submitted: "${inputValue}"` });

        if (inputValue === '') {
            addLog({ type: 'error', message: 'Input is empty.', edgeCaseId: 'empty' });
            return;
        }

        if (isNaN(num)) {
            addLog({ type: 'success', message: 'Reproduced bug: System accepts text but fails logic.', edgeCaseId: 'non-numeric' });
            setInputValue('');
            return;
        }

        if (inputValue.includes('.')) {
            addLog({ type: 'success', message: 'Edge case found: Decimal age.', edgeCaseId: 'decimal' });
        }

        if (num < 0) {
            addLog({ type: 'success', message: 'Edge case found: Negative age.', edgeCaseId: 'negative' });
        } else if (num === 0) {
            addLog({ type: 'success', message: 'Edge case found: Age is 0.', edgeCaseId: 'zero' });
        } else if (num === 17) {
            addLog({ type: 'success', message: 'Boundary found: 17 (Just below limit).', edgeCaseId: 'below-min' });
        } else if (num === 18) {
            addLog({ type: 'success', message: 'Boundary found: 18 (Exact limit).', edgeCaseId: 'min-boundary' });
        } else if (num > 120) {
            addLog({ type: 'success', message: 'Edge case found: Unrealistic age.', edgeCaseId: 'upper-boundary' });
        } else {
            // Normal behaviors
            if (num > 18) {
            } else {
                addLog({ type: 'info', message: 'Standard invalid input.' });
            }
        }

        // UX: Clear input for next test
        setInputValue('');
    };

    return (
        <div className="w-full max-w-sm bg-slate-900 border border-slate-700 p-0 rounded-xl shadow-2xl overflow-hidden">
            <div className="bg-slate-800 p-6 border-b border-slate-700">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🔞</span> Verify Your Age
                </h3>
                <p className="text-slate-400 text-xs mt-1">Access restricted to authorized personnel.</p>
            </div>

            <div className="p-6 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Enter Age</label>
                        <input
                            type="text"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono text-lg"
                            placeholder="e.g. 21"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 active:scale-[0.98]"
                    >
                        Verify Access
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AgeGate;
