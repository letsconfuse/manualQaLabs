import React, { useState } from 'react';

export const BookingConfig = {
    id: 'booking-architect',
    title: 'The Booking Architect',
    description: 'Expert Level: A complex date-management system. Can you break the booking logic and time-based constraints?',
    type: 'logic',
    difficulty: 'Hard',
    requirements: [
        { id: 'reverse', title: 'The Time Paradox', explanation: 'Check-out is earlier than Check-in.' },
        { id: 'past', title: 'The Ghost of Christmas Past', explanation: 'Booking for a date that has already occurred.' },
        { id: 'same-day', title: 'Zero-Night Stay', explanation: 'Check-in and Check-out are the same day (Day Use logic).' },
        { id: 'leap-year', title: 'The Leap Year Trap', explanation: 'Handling February 29th on non-leap years or transitions.' },
        { id: 'format-locale', title: 'Locale Ambiguity', explanation: 'Confusion between US (MM/DD) and EU (DD/MM) formats.' },
        { id: 'duration-limit', title: 'The Extended Stay', explanation: 'Booking for an unrealistic duration (e.g., 500+ days).' },
        { id: 'invalid-days', title: 'Impossible Dates', explanation: 'Trying to book on dates like Jan 32nd or Feb 30th.' },
        { id: 'injection', title: 'Security Injection', explanation: 'Script or SQL injection inside date strings.' },
        { id: 'midnight', title: 'Midnight Boundary', explanation: 'Booking for "Today" when it is almost tomorrow.' },
        { id: 'negative-nights', title: 'Calculated Underflow', explanation: 'Manipulating nights count to go below zero.' },
        { id: 'null-byte', title: 'Null Terminator', explanation: 'Using \0 or other special control characters in input.' },
        { id: 'blackout-overlap', title: 'Blackout Conflict', explanation: 'Stay includes dates that are blocked for maintenance.' }
    ]
};

const BookingArchitect = ({ addLog }) => {
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [nights, setNights] = useState(0);

    const blackoutStart = new Date('2026-12-24');
    const blackoutEnd = new Date('2026-12-26');

    // Real-time calculation for UI feedback
    React.useEffect(() => {
        if (checkIn && checkOut) {
            const d1 = new Date(checkIn);
            const d2 = new Date(checkOut);
            if (!isNaN(d1) && !isNaN(d2)) {
                const diff = (d2 - d1) / (1000 * 60 * 60 * 24);
                setNights(Math.round(diff));
            } else {
                setNights(0);
            }
        }
    }, [checkIn, checkOut]);

    const handleBooking = (e) => {
        e.preventDefault();
        addLog({ type: 'info', message: `Verifying dates: In[${checkIn}] Out[${checkOut}]` });

        if (!checkIn || !checkOut) {
            addLog({ type: 'error', message: 'Incomplete date information.' });
            return;
        }

        // 8. Injection & 11. Null Byte
        const securityPattern = /<script|' OR|--|\\0|\0/i;
        if (securityPattern.test(checkIn) || securityPattern.test(checkOut)) {
            if (checkIn.includes('\0') || checkOut.includes('\0')) {
                addLog({ type: 'success', message: 'Edge case: Null Terminator detected. System parser confused.', edgeCaseId: 'null-byte' });
            } else {
                addLog({ type: 'success', message: 'Security vulnerability: Input not sanitized against injection.', edgeCaseId: 'injection' });
            }
            return;
        }

        // 7. Impossible Dates (Simple Regex check for common "bad" days)
        if (checkIn.match(/3[2-9]|31-02|31-04|31-06|31-09|31-11|30-02/) ||
            checkOut.match(/3[2-9]|31-02|31-04|31-06|31-09|31-11|30-02/)) {
            addLog({ type: 'success', message: 'Logic flaw: System accepts impossible calendar dates.', edgeCaseId: 'invalid-days' });
        }

        // Date Parsing
        const dateIn = new Date(checkIn);
        const dateOut = new Date(checkOut);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (isNaN(dateIn.getTime()) || isNaN(dateOut.getTime())) {
            // 5. Locale Ambiguity (Demo logic: if it's not a standard ISO, check if it looks like a flip)
            if (checkIn.includes('/') || checkOut.includes('/')) {
                addLog({ type: 'success', message: 'Edge case: Format ambiguity detected (EU vs US).', edgeCaseId: 'format-locale' });
            } else {
                addLog({ type: 'error', message: 'Critical error: Unable to parse date strings.' });
            }
            return;
        }

        // 1. Reverse Chronology
        if (dateOut < dateIn) {
            addLog({ type: 'success', message: 'Logic error: Time Paradox! Checkout before Checkin.', edgeCaseId: 'reverse' });
        }

        // 2. Date in the Past
        if (dateIn < today) {
            addLog({ type: 'success', message: 'Business rule violation: System accepted a date in the past.', edgeCaseId: 'past' });
        }

        // 3. Same Day
        if (dateIn.getTime() === dateOut.getTime()) {
            addLog({ type: 'success', message: 'Edge case found: Zero-night/Day-use stay.', edgeCaseId: 'same-day' });
        }

        // 4. Leap Year Trap
        const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        if ((checkIn.includes('02-29') && !isLeapYear(dateIn.getFullYear())) ||
            (checkOut.includes('02-29') && !isLeapYear(dateOut.getFullYear()))) {
            addLog({ type: 'success', message: 'Calculated logic error: Feb 29 accepted in non-leap year.', edgeCaseId: 'leap-year' });
        }

        // 6. Duration Limit
        const diffTime = Math.abs(dateOut - dateIn);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 500) {
            addLog({ type: 'success', message: 'Boundary hit: Stay duration exceeds technical limits (500+ days).', edgeCaseId: 'duration-limit' });
        }

        // 9. Midnight Boundary
        const now = new Date();
        if (dateIn.toDateString() === now.toDateString() && now.getHours() >= 23) {
            addLog({ type: 'success', message: 'Edge case found: Booking for "Today" within the midnight boundary (11 PM+).', edgeCaseId: 'midnight' });
        }

        // 10. Negative Nights (Simulation)
        if (diffDays === 1 && checkIn.includes('-') && !checkIn.startsWith('20')) {
            addLog({ type: 'success', message: 'Edge case: Negative quantity detected via input manipulation.', edgeCaseId: 'negative-nights' });
        }

        // 12. Blackout Conflict
        if ((dateIn <= blackoutEnd && dateOut >= blackoutStart)) {
            addLog({ type: 'success', message: 'Logic failure: Stay overlaps with a maintenance blackout (Dec 24-26).', edgeCaseId: 'blackout-overlap' });
        }

        if (dateIn >= today && dateOut >= dateIn && diffDays < 500) {
            addLog({ type: 'info', message: `Stay duration calculated: ${diffDays} nights.` });
        }
    };

    return (
        <div className="w-full max-w-sm bg-surface border border-theme p-0 rounded-3xl shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden transition-colors relative font-serif">
            {/* Elegant Header */}
            <div className="bg-body p-8 text-center border-b border-theme transition-colors">
                <div className="text-amber-600 dark:text-amber-500 font-bold tracking-[0.3em] text-[10px] uppercase mb-2">The Royal Suite</div>
                <h3 className="text-3xl italic text-primary-color font-serif">Grand Hotel</h3>
                <div className="w-16 h-[1px] bg-amber-500 dark:bg-amber-600 mx-auto mt-4"></div>
            </div>

            <div className="p-8 space-y-8 bg-surface transition-colors">
                <form onSubmit={handleBooking} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative group">
                            <label className="block text-[10px] font-bold text-amber-600/80 dark:text-amber-500/80 mb-1 uppercase tracking-wider pl-1">Arrival Date</label>
                            <input
                                type="text"
                                className="w-full bg-transparent border-b border-slate-300 dark:border-slate-800 focus:border-amber-500 text-primary-color py-2 px-1 outline-none transition-all font-mono text-sm tracking-wider placeholder-secondary-color"
                                placeholder="YYYY-MM-DD"
                                value={checkIn}
                                onChange={(e) => setCheckIn(e.target.value)}
                            />
                        </div>
                        <div className="relative group">
                            <label className="block text-[10px] font-bold text-amber-600/80 dark:text-amber-500/80 mb-1 uppercase tracking-wider pl-1">Departure Date</label>
                            <input
                                type="text"
                                className="w-full bg-transparent border-b border-slate-300 dark:border-slate-800 focus:border-amber-500 text-primary-color py-2 px-1 outline-none transition-all font-mono text-sm tracking-wider placeholder-secondary-color"
                                placeholder="YYYY-MM-DD"
                                value={checkOut}
                                onChange={(e) => setCheckOut(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Dynamic Cost Preview */}
                    <div className="flex justify-between items-center py-4 border-t border-theme transition-colors">
                        <div className="text-left">
                            <div className="text-[10px] text-secondary-color uppercase tracking-wider">Duration</div>
                            <div className={`text-xl font-mono ${nights < 0 ? 'text-red-500' : 'text-primary-color'}`}>
                                {nights} <span className="text-xs text-secondary-color">Nights</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-secondary-color uppercase tracking-wider">Total Est.</div>
                            <div className="text-xl font-mono text-amber-600 dark:text-amber-500">
                                ${(Math.max(0, nights) * 450).toLocaleString()}
                            </div>
                        </div>
                    </div>

                    <div className="p-3 bg-amber-500/5 border border-amber-500/20 text-[10px] text-amber-800 dark:text-amber-500 italic text-center transition-colors rounded-xl">
                        *Blackout dates apply: Dec 24-26
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-amber-500 hover:bg-amber-400 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-bold py-4 rounded-xl transition-all uppercase tracking-[0.2em] text-xs shadow-lg active:scale-[0.99]"
                    >
                        Reserve
                    </button>
                </form>
            </div>

            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-amber-500/30 dark:border-amber-800/50 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-amber-500/30 dark:border-amber-800/50 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-amber-500/30 dark:border-amber-800/50 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-amber-500/30 dark:border-amber-800/50 pointer-events-none"></div>
        </div>
    );
};

export default BookingArchitect;
