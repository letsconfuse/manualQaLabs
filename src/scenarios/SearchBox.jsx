import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, HelpCircle, X, ChevronDown, CheckCircle, AlertTriangle, RefreshCw, FileText } from 'lucide-react';

export const SearchConfig = {
    id: 'search-box',
    title: 'The Search Box',
    description: 'Verify access controls and input sanitization on a codebase search interface. Test for query validation limits, escaping rules, database query injections, and script safety.',
    type: 'security',
    difficulty: 'Hard',
    requirements: [
        { id: 'empty', title: 'Empty Search', explanation: 'Clicking search with no input should be handled gracefully.' },
        { id: 'xss', title: 'XSS Attempt (<script>)', explanation: 'Injecting script tags is a common attack vector.' },
        { id: 'sqli', title: 'SQL Injection', explanation: 'Search queries often go directly to DB. Test for SQLi.' },
        { id: 'long', title: 'Buffer Overflow (>50 chars)', explanation: 'Extremely long strings can cause DOS or crashes.' },
        { id: 'no-results', title: 'No Results Found', explanation: 'User should be informed if query yields nothing.' },
        { id: 'html', title: 'HTML Injection (<b>)', explanation: 'Bold tags or other HTML should be escaped.' },
    ]
};

const HELP_AREAS = [
    {
        area: 'Empty Query Handling',
        hint1: 'Try searching with no input or only whitespace.',
        hint2: 'Click the search icon/button with an empty field or spaces to check the blank verification state.',
    },
    {
        area: 'Boundary & Overflow',
        hint1: 'What happens if a query is extremely long? Systems should limit search term sizes.',
        hint2: 'Try entering or pasting a query that is longer than 50 characters to see if it is rejected.',
    },
    {
        area: 'HTML Injection',
        hint1: 'If the results header displays the query exactly as typed, check if it renders raw HTML formatting.',
        hint2: 'Try entering formatting tags like <b>bold</b> or <i>italic</i> to check if the output text styles change.',
    },
    {
        area: 'Script Injection (XSS)',
        hint1: 'Verify if the field is vulnerable to dynamic script execution.',
        hint2: 'Try injecting standard XSS vectors like <script> or image onerror handlers.',
    },
    {
        area: 'SQL Injection',
        hint1: 'Queries usually search database tables. Check if input escaping handles query control characters.',
        hint2: 'Try using SQL injection terms like \' OR 1=1 -- or UNION SELECT.',
    },
    {
        area: 'Zero State Matches',
        hint1: 'Check how the results page displays when a query is valid but matches zero files.',
        hint2: 'Search for a random valid word (e.g., "unknownterm") that is not in the codebase database.',
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
                        <HelpCircle className="w-5 h-5 text-teal-500" />
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
                                <span className="text-sm font-medium text-primary-color group-hover:text-teal-400 transition-colors">{item.area}</span>
                                <ChevronDown className={`w-4 h-4 text-secondary-color transition-transform ${expanded[i] ? 'rotate-180' : ''}`} />
                            </button>

                            {expanded[i] && (
                                <div className="mt-3 space-y-2">
                                    <div className="bg-body border border-theme rounded-xl p-3 text-xs text-secondary-color">
                                        <span className="text-teal-400 font-semibold block mb-0.5">Clue →</span>
                                        {item.hint1}
                                    </div>

                                    {(revealed[i] || 0) >= 1 ? (
                                        <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-3 text-xs text-teal-300">
                                            <span className="font-semibold block mb-0.5">Detailed hint →</span>
                                            {item.hint2}
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => reveal(i)}
                                            className="text-xs text-secondary-color hover:text-teal-400 transition-colors underline underline-offset-2"
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
// SearchBox Scenario
// ─────────────────────────────────────────────────────────────────────────────
const SearchBox = ({ addLog }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [renderedQuery, setRenderedQuery] = useState('');
    const [showHelp, setShowHelp] = useState(false);
    const [hasHTML, setHasHTML] = useState(false);

    const searchClicks = useRef(0);
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

    // Triple click handler on Search Icon for help
    const handleSearchIconClick = () => {
        searchClicks.current += 1;
        clearTimeout(clickTimer.current);
        clickTimer.current = setTimeout(() => {
            searchClicks.current = 0;
        }, 700);

        if (searchClicks.current >= 3) {
            searchClicks.current = 0;
            setShowHelp(p => !p);
        }
    };

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        if (isSearching) return;

        setResults(null);
        setHasHTML(false);
        addLog({ type: 'info', message: `Initiating search query: "${query}"` });

        // 1. Empty Check
        if (!query.trim()) {
            addLog({ type: 'error', message: 'Search query is blank.', edgeCaseId: 'empty' });
            return;
        }

        setIsSearching(true);

        setTimeout(() => {
            let matches = [];
            setRenderedQuery(query);

            // 2. Buffer Limit Check (>50 chars)
            if (query.length > 50) {
                addLog({ type: 'success', message: `✅ Query too long: ${query.length} chars (Buffer limit exceeded).`, edgeCaseId: 'long' });
                setIsSearching(false);
                setResults([]);
                return;
            }

            // 3. SQL Injection Check
            const sqliPatterns = ["' OR", "1=1", "--", "UNION SELECT", "SELECT ", "DROP TABLE"];
            if (sqliPatterns.some(p => query.toUpperCase().includes(p))) {
                addLog({ type: 'success', message: `✅ SQL Injection payload flagged: "${query}"`, edgeCaseId: 'sqli' });
                setIsSearching(false);
                setResults([]);
                return;
            }

            // 4. XSS Script Injection Check
            const xssPatterns = ['<script>', 'javascript:', 'onerror', 'onload', 'alert('];
            if (xssPatterns.some(p => query.toLowerCase().includes(p))) {
                addLog({ type: 'success', message: `✅ XSS exploit signature matched: "${query}"`, edgeCaseId: 'xss' });
                // Simulate alert execution safely for visual feedback
                try {
                    alert(`XSS Vulnerability Executed!\nQuery payload: ${query}`);
                } catch(e) {}
            }

            // 5. HTML Injection Check
            const htmlPatterns = ['<b>', '<i>', '<u>', '<h1>', '<h2>', '<a>', '<span'];
            const hasHtmlTags = htmlPatterns.some(p => query.toLowerCase().includes(p));
            if (hasHtmlTags) {
                addLog({ type: 'success', message: `✅ Raw HTML tags rendered without escaping: "${query}"`, edgeCaseId: 'html' });
                setHasHTML(true);
            }

            // Search simulation
            const lowerQuery = query.toLowerCase();
            const mockDb = [
                { title: 'auth_controller.py', snippet: 'Vulnerability: Token verification bypassed due to invalid signature comparison.' },
                { title: 'database_config.js', snippet: 'Vulnerability: Plaintext root credentials stored in configuration file.' },
                { title: 'user_profile_component.jsx', snippet: 'Vulnerability: Profile image tags render raw inputs, enabling XSS.' },
                { title: 'payment_processor.go', snippet: 'Bug: Decimal rounding error leads to minor proration variance.' },
            ];

            matches = mockDb.filter(file => 
                file.title.toLowerCase().includes(lowerQuery) || 
                file.snippet.toLowerCase().includes(lowerQuery)
            );

            if (matches.length > 0) {
                setResults(matches);
                addLog({ type: 'info', message: `Results loaded: ${matches.length} matches found.` });
            } else {
                setResults([]);
                addLog({ type: 'success', message: `✅ Zero matches returned for query: "${query}"`, edgeCaseId: 'no-results' });
            }

            setIsSearching(false);
        }, 1000);
    };

    return (
        <>
            {showHelp && createPortal(<HelpOverlay onClose={() => setShowHelp(false)} />, document.body)}

            <div className="w-full max-w-lg bg-surface border border-theme rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
                <div className="absolute inset-0 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] dark:bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.02] pointer-events-none"></div>

                {/* Form header */}
                <form onSubmit={handleSearch} className="flex items-center px-5 py-4 border-b border-theme relative bg-surface/50 backdrop-blur">
                    <button
                        type="button"
                        onClick={handleSearchIconClick}
                        title="Click 3× for help"
                        className="p-1 rounded hover:bg-body focus:outline-none focus:ring-1 focus:ring-teal-500/30 mr-2 flex-shrink-0 transition-colors"
                    >
                        <Search className={`w-5 h-5 transition-colors ${isSearching ? 'text-teal-500 animate-pulse' : 'text-secondary-color'}`} />
                    </button>
                    <input
                        type="text"
                        autoFocus
                        disabled={isSearching}
                        className="w-full bg-transparent text-lg text-primary-color placeholder:text-secondary-color/60 outline-none pr-10"
                        placeholder="Search workspace repository..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={isSearching}
                        className="absolute right-4 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-teal-500 hover:bg-teal-600 text-white rounded-md text-xs font-semibold shadow shadow-teal-500/10 transition-colors disabled:opacity-50"
                    >
                        Search
                    </button>

                    {/* Scanner line indicator */}
                    {isSearching && (
                        <div className="absolute bottom-0 left-0 h-[1.5px] bg-gradient-to-r from-teal-500 to-emerald-500 w-full animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.5)]"></div>
                    )}
                </form>

                {/* Results block */}
                <div className="bg-body/30 min-h-[220px] flex flex-col justify-between">
                    <div className="p-4 flex-1">
                        {isSearching ? (
                            <div className="py-12 text-center flex flex-col items-center justify-center">
                                <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                                <p className="text-xs text-secondary-color">Scanning directories and index files...</p>
                            </div>
                        ) : results ? (
                            <div>
                                <div className="text-[10px] font-bold text-secondary-color uppercase tracking-wider mb-3 px-1">
                                    {hasHTML ? (
                                        <span>
                                            Results for:{' '}
                                            <span dangerouslySetInnerHTML={{ __html: renderedQuery }} />
                                        </span>
                                    ) : (
                                        <span>Results for: "{renderedQuery}"</span>
                                    )}
                                </div>

                                {results.length === 0 ? (
                                    <div className="py-10 text-center text-xs text-secondary-color italic border border-dashed border-theme rounded-xl bg-surface/20">
                                        No matching codebase items found.
                                    </div>
                                ) : (
                                    <ul className="space-y-2.5">
                                        {results.map((res, i) => (
                                            <li key={i} className="p-3 bg-surface border border-theme rounded-xl shadow-sm flex items-start gap-3 transition-colors hover:border-teal-500/40">
                                                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500 flex-shrink-0 mt-0.5">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-bold text-primary-color truncate">{res.title}</p>
                                                    <p className="text-[11px] text-secondary-color mt-1 leading-relaxed">{res.snippet}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-xs text-secondary-color flex flex-col items-center justify-center">
                                <Search className="w-8 h-8 text-secondary-color/20 mb-3" />
                                <p>Search the repository to discover matched vulnerability files.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer guide indicator */}
                    <div className="px-5 py-3 border-t border-theme bg-surface/30 flex justify-between items-center text-[10px] text-secondary-color">
                        <button
                            type="button"
                            onClick={() => setShowHelp(true)}
                            className="text-teal-500 hover:text-teal-400 transition-colors underline underline-offset-2"
                        >
                            Open testing guide
                        </button>
                        <span className="font-mono text-secondary-color/50">Shift+Alt+H</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SearchBox;
