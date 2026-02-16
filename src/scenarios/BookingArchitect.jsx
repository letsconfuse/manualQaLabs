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

    const blackoutStart = new Date('2026-12-24');
    const blackoutEnd = new Date('2026-12-26');

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
        <div className="w-full max-w-sm bg-slate-900 border border-slate-700 p-0 rounded-xl shadow-2xl overflow-hidden">
            <div className="bg-slate-800 p-6 border-b border-slate-700">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">📅</span> Elite Booking Engine
                </h3>
                <p className="text-slate-400 text-xs mt-1">Reserve your stay... if time permits.</p>
            </div>

            <div className="p-6 space-y-6">
                <p className="text-xs text-slate-500 font-mono text-center mb-2">*System Format: YYYY-MM-DD*</p>
                <form onSubmit={handleBooking} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Check-in</label>
                            <input
                                type="text"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-mono text-sm"
                                placeholder="YYYY-MM-DD"
                                value={checkIn}
                                onChange={(e) => setCheckIn(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Check-out</label>
                            <input
                                type="text"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-mono text-sm"
                                placeholder="YYYY-MM-DD"
                                value={checkOut}
                                onChange={(e) => setCheckOut(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-[10px] text-slate-400 italic flex gap-2 items-center">
                        <span className="text-lg">⚠️</span>
                        Developer Note: Maintenance scheduled for Dec 24-26, 2026.
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-slate-100 hover:bg-white text-slate-900 font-bold py-3 rounded-lg transition-all uppercase tracking-widest text-xs shadow-lg shadow-white/5 active:scale-[0.98]"
                    >
                        Confirm Reservation
                    </button>
                </form>

                <div className="pt-4 border-t border-slate-800 flex justify-around opacity-50">
                    <div className="text-center">
                        <span className="block font-bold text-xs text-slate-500">Total</span>
                        <span className="text-xs text-indigo-400 font-mono">$ --</span>
                    </div>
                    <div className="text-center">
                        <span className="block font-bold text-xs text-slate-500">Tax</span>
                        <span className="text-xs text-indigo-400 font-mono">$ --</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingArchitect;
