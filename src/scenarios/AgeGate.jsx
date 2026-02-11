import React, { useState } from 'react';

export const AgeGateConfig = {
    id: 'age-gate',
    title: 'The Age Gate',
    description: 'A simple age verification form. Users must be 18+. Find the boundary values and invalid inputs.',
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
                addLog({ type: 'info', message: 'Standard valid input.' });
            } else {
                addLog({ type: 'info', message: 'Standard invalid input.' });
            }
        }
    };

    return (
        <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow-lg text-slate-900">
            <h3 className="text-xl font-bold mb-4">Verify Your Age</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Enter Age</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="e.g. 21"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                    Verify
                </button>
            </form>
        </div>
    );
};

export default AgeGate;
