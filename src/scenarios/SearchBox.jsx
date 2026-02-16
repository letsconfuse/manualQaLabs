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

    const handleSearch = (e) => {
        e.preventDefault();
        setResults(null);

        addLog({ type: 'info', message: `Searching for: "${query}"` });

        if (!query.trim()) {
            addLog({ type: 'error', message: 'Search term is empty.', edgeCaseId: 'empty' });
            return;
        }

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
            setResults(['Bug #1: Login fails', 'Bug #2: Typo in header']);
            addLog({ type: 'info', message: 'Results found.' });
        } else {
            setResults([]);
            addLog({ type: 'success', message: 'UX: No results found state.', edgeCaseId: 'no-results' });
        }
        setQuery('');
    };

    return (
        <div className="w-full max-w-lg bg-slate-900 border border-slate-700 p-0 rounded-xl shadow-2xl overflow-hidden">
            <div className="bg-slate-800 p-6 border-b border-slate-700">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🔍</span> Product Search
                </h3>
                <p className="text-slate-400 text-xs mt-1">Find what you're looking for... or break the query.</p>
            </div>

            <div className="p-6 space-y-6">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-mono"
                            placeholder="Search for products..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <Search className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
                    </div>
                    <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 active:scale-[0.98]"
                    >
                        Search
                    </button>
                </form>

                {results && (
                    <div className="border-t border-slate-800 pt-4 animate-fadeIn">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            {results.length === 0 ? 'No results found' : `${results.length} results found`}
                        </h4>
                        <ul className="space-y-2">
                            {results.map((res, i) => (
                                <li key={i} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 text-sm text-slate-300 font-mono">
                                    {res}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchBox;
