import React, { useState } from 'react';
import { Search } from 'lucide-react';

export const SearchConfig = {
    id: 'search-box',
    title: 'The Search Box',
    description: 'A search input prone to XSS and strange queries. Break the search logic.',
    type: 'security',
    difficulty: 'Hard',
    requirements: [
        { id: 'empty', title: 'Empty Search', explanation: 'Clicking search with no input should be handled gracefully.' },
        { id: 'xss', title: 'XSS Attempt (<script>)', explanation: 'Injecting script tags is a common attack vector.' },
        { id: 'sqli', title: 'SQL Injection', explanation: 'Search queries often go directly to DB. Test for SQLi.' },
        { id: 'long', title: 'Buffer Overflow (>50 chars)', explanation: 'Extremely long strings can cause DOS or crashes.' },
        { id: 'no-results', title: 'No Results Found', explanation: 'User should be informed if query yields nothing.' },
        { id: 'html', title: 'HTML Injection (<b>)', explanation: ' bold tags or other HTML should be escaped.' },
    ]
};

const SearchBox = ({ addLog }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        if (isSearching) return;

        setResults(null);
        addLog({ type: 'info', message: `Searching for: "${query}"` });

        if (!query.trim()) {
            addLog({ type: 'error', message: 'Search term is empty.', edgeCaseId: 'empty' });
            return;
        }

        setIsSearching(true);

        // Simulate network delay for effect
        setTimeout(() => {
            performValidation();
            setIsSearching(false);
        }, 800);
    };

    const performValidation = () => {
        if (query.toLowerCase().includes('<script>')) {
            addLog({ type: 'success', message: 'Security: XSS script tag detected!', edgeCaseId: 'xss' });
            return;
        }

        if (query.includes('<b>') || query.includes('<i>')) {
            addLog({ type: 'success', message: 'Security: HTML injection detected.', edgeCaseId: 'html' });
            return;
        }

        const sqliPatterns = ["' OR", "1=1", "--", "UNION SELECT"];
        if (sqliPatterns.some(p => query.toUpperCase().includes(p))) {
            addLog({ type: 'success', message: 'Security: SQL Injection pattern detected!', edgeCaseId: 'sqli' });
            return;
        }

        if (query.length > 50) {
            addLog({ type: 'success', message: 'Performance: Query too long (Buffer Overflow sim).', edgeCaseId: 'long' });
            return;
        }

        // Mock results logic
        if (query.toLowerCase().includes('bug')) {
            setResults(['Bug #1: Login fails on Safari', 'Bug #2: Typo in header', 'Bug #3: API 500 Error']);
            addLog({ type: 'info', message: 'Results found.' });
        } else {
            setResults([]);
            addLog({ type: 'success', message: 'UX: No results found state.', edgeCaseId: 'no-results' });
        }
    };

    return (
        <div className="w-full max-w-lg relative perspective-1000">
            {/* Glow Effect - Adjusted for light mode */}
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl blur opacity-25 dark:opacity-25 opacity-10"></div>

            <div className="relative bg-surface/90 backdrop-blur-xl border border-theme p-0 rounded-2xl shadow-2xl overflow-hidden flex flex-col min-h-[100px] transition-colors">

                {/* Search Header */}
                <form onSubmit={handleSearch} className="flex items-center px-6 py-4 border-b border-theme relative">
                    <Search className={`w-6 h-6 mr-4 transition-colors ${isSearching ? 'text-teal-500 dark:text-teal-400 animate-pulse' : 'text-secondary-color'}`} />
                    <input
                        type="text"
                        autoFocus
                        className="w-full bg-transparent text-xl font-light text-primary-color placeholder-secondary-color outline-none transition-colors"
                        placeholder="Search codebase..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="hidden md:flex gap-2">
                        <kbd className="hidden md:inline-block px-2 py-1 bg-body rounded text-[10px] text-secondary-color font-mono border border-theme">ESC</kbd>
                        <kbd className="hidden md:inline-block px-2 py-1 bg-teal-50 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded text-[10px] font-mono border border-teal-200 dark:border-teal-500/30">ENTER</kbd>
                    </div>

                    {/* Scanning Line Animation */}
                    {isSearching && (
                        <div className="absolute bottom-0 left-0 h-[1px] bg-teal-500 w-full animate-float shadow-[0_0_10px_#14b8a6]"></div>
                    )}
                </form>

                {/* Results Area */}
                <div className="flex-1 bg-body/50 transition-colors">
                    {isSearching ? (
                        <div className="p-8 text-center">
                            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-xs text-secondary-color">Indexing content...</p>
                        </div>
                    ) : results ? (
                        <div className="py-2">
                            <div className="px-4 py-2 text-[10px] font-bold text-secondary-color uppercase tracking-wider">
                                {results.length === 0 ? 'No Results' : 'Best Matches'}
                            </div>
                            {results.length === 0 ? (
                                <div className="px-6 py-8 text-center text-secondary-color italic">
                                    No bugs found matching "{query}"
                                </div>
                            ) : (
                                <ul>
                                    {results.map((res, i) => (
                                        <li key={i} className="px-4 py-3 mx-2 rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 cursor-pointer flex items-center gap-3 group transition-colors">
                                            <div className="w-8 h-8 rounded bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                                                <Search className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm text-primary-color group-hover:text-primary-color">{res}</span>
                                            <span className="ml-auto text-[10px] text-secondary-color group-hover:text-secondary-color">Jump to</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-secondary-color text-sm">
                            Try searching for <span className="text-teal-600 dark:text-teal-500/70 font-mono bg-teal-50 dark:bg-teal-500/10 px-1 rounded">bug</span>, <span className="text-red-600 dark:text-red-500/70 font-mono bg-red-50 dark:bg-red-500/10 px-1 rounded">&lt;script&gt;</span>, or <span className="text-blue-600 dark:text-blue-500/70 font-mono bg-blue-50 dark:bg-blue-500/10 px-1 rounded">SQL</span>...
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 bg-body border-t border-theme flex justify-between items-center text-[10px] text-secondary-color transition-colors">
                    <span>ProTip: Input length is restricted to 50 chars.</span>
                    <div className="flex gap-4">
                        <span>Search: <strong>Global</strong></span>
                        <span>Index: <strong>v2.4</strong></span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchBox;
