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
    const [status, setStatus] = useState('LOCKED'); // LOCKED, GRANTED, DENIED

    // Keyboard support
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (status !== 'LOCKED') return;

            // Allow standard inputs for testing edge cases (negatives, decimals, text)
            if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                handlePress(e.key);
            } else if (e.key === 'Enter') {
                checkAge();
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                setInputValue(prev => prev.slice(0, -1));
            } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
                setInputValue('');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [status, inputValue]);

    const handlePress = (val) => {
        if (status !== 'LOCKED') return; // Freeze input if status is set

        if (val === 'ENTER') {
            checkAge();
            return;
        }

        if (val === 'C') {
            setInputValue('');
            return;
        }

        // Max 5 chars to allow testing "-100" or "18.5"
        setInputValue(prev => {
            if (prev.length < 5) return prev + val;
            return prev;
        });
    };

    const checkAge = () => {
        const num = Number(inputValue);
        addLog({ type: 'info', message: `Verifying identity age: "${inputValue}"` });

        let granted = false;

        if (inputValue === '') {
            addLog({ type: 'error', message: 'Identity missing.', edgeCaseId: 'empty' });
        } else if (isNaN(num)) {
            // Hard to do with keypad, but maybe if they paste? 
            // Logic kept for consistency if we allow keyboard input via hidden input
            addLog({ type: 'success', message: 'Syntax Error in Identity.', edgeCaseId: 'non-numeric' });
            setStatus('DENIED');
        } else if (inputValue.includes('.')) {
            addLog({ type: 'success', message: 'Decimal age detected.', edgeCaseId: 'decimal' });
            setStatus('DENIED');
        } else if (num < 0) {
            addLog({ type: 'success', message: 'Temporal Anomaly (Negative Age).', edgeCaseId: 'negative' });
            setStatus('DENIED');
        } else if (num === 0) {
            addLog({ type: 'success', message: 'Age Zero.', edgeCaseId: 'zero' });
            setStatus('DENIED');
        } else if (num === 17) {
            addLog({ type: 'success', message: 'Boundary: Underage (17).', edgeCaseId: 'below-min' });
            setStatus('DENIED');
        } else if (num === 18) {
            addLog({ type: 'success', message: 'Boundary: Minimum Age (18). Access Granted.', edgeCaseId: 'min-boundary' });
            granted = true;
            setStatus('GRANTED');
        } else if (num > 120) {
            addLog({ type: 'success', message: 'Biological Impossibility (>120).', edgeCaseId: 'upper-boundary' });
            setStatus('DENIED');
        } else if (num > 18) {
            granted = true;
            setStatus('GRANTED');
        } else {
            setStatus('DENIED');
        }

        // Reset after delay
        setTimeout(() => {
            setInputValue('');
            setStatus('LOCKED');
        }, 2000);
    };

    return (
        <div className="w-full max-w-sm bg-surface border-4 border-theme p-6 rounded-3xl shadow-3d overflow-hidden relative transition-colors">
            {/* Screws */}
            <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-theme flex items-center justify-center"><div className="w-full h-[1px] bg-secondary-color rotate-45"></div></div>
            <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-theme flex items-center justify-center"><div className="w-full h-[1px] bg-secondary-color rotate-45"></div></div>
            <div className="absolute bottom-4 left-4 w-3 h-3 rounded-full bg-theme flex items-center justify-center"><div className="w-full h-[1px] bg-secondary-color rotate-45"></div></div>
            <div className="absolute bottom-4 right-4 w-3 h-3 rounded-full bg-theme flex items-center justify-center"><div className="w-full h-[1px] bg-secondary-color rotate-45"></div></div>

            <div className="bg-body p-4 rounded-2xl border-b-2 border-theme mb-6 text-center transition-colors">
                <div className="text-[10px] text-secondary-color uppercase tracking-[0.2em] mb-1">Security Level 5</div>
                <h3 className="text-2xl font-black text-primary-color">AGE GATE</h3>
            </div>

            {/* Display */}
            <div className={`mb-6 p-4 rounded-2xl font-mono text-3xl text-center tracking-widest border-2 transition-colors shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] ${status === 'GRANTED' ? 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-500 text-emerald-600 dark:text-emerald-400' :
                status === 'DENIED' ? 'bg-rose-100 dark:bg-red-900/50 border-red-500 text-red-600 dark:text-red-500' :
                    'bg-body border-theme text-primary-color'
                }`}>
                {status !== 'LOCKED' ? status : (inputValue || '___')}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button
                        key={num}
                        onClick={() => handlePress(num.toString())}
                        className="h-14 rounded-xl bg-surface text-primary-color border-b-4 border-theme font-bold text-xl active:border-b-0 active:translate-y-[4px] transition-all hover:bg-body"
                    >
                        {num}
                    </button>
                ))}
                <button
                    onClick={() => handlePress('C')}
                    className="h-14 rounded-xl bg-rose-50 dark:bg-red-900/30 text-rose-600 dark:text-red-400 border-b-4 border-rose-200 dark:border-red-900/50 font-bold text-lg active:border-b-0 active:translate-y-[4px] transition-all hover:bg-rose-100 dark:hover:bg-red-900/50"
                >
                    CLR
                </button>
                <button
                    onClick={() => handlePress('0')}
                    className="h-14 rounded-xl bg-surface text-primary-color border-b-4 border-theme font-bold text-xl active:border-b-0 active:translate-y-[4px] transition-all hover:bg-body"
                >
                    0
                </button>
                <button
                    onClick={() => handlePress('ENTER')}
                    className="h-14 rounded-xl bg-emerald-500 dark:bg-emerald-600 text-white border-b-4 border-emerald-700 dark:border-emerald-800 font-bold text-lg active:border-b-0 active:translate-y-[4px] transition-all hover:bg-emerald-400 dark:hover:bg-emerald-500"
                >
                    ENT
                </button>
            </div>

            <div className="text-center">
                <div className={`inline-block w-2 h-2 rounded-full mb-1 ${status === 'LOCKED' ? 'bg-amber-500 animate-pulse' : 'bg-slate-400 dark:bg-slate-600'}`}></div>
            </div>
        </div>
    );
};

export default AgeGate;
