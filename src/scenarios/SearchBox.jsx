import React, { useState } from 'react';
import { Search } from 'lucide-react';

export const SearchConfig = {
    id: 'search-box',
    title: 'The Search Box',
    description: 'Search bars are the main entry point for attacks. Can you find the security flaws and logic gaps?',
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
    };

    return (
        <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-lg text-slate-900">
            <h3 className="text-xl font-bold mb-4">Product Search</h3>
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="Search for products..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                </div>
                <button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-6 rounded transition-colors"
                >
                    Search
                </button>
            </form>

            {results && (
                <div className="mt-6 border-t pt-4 animate-fadeIn">
                    <h4 className="text-sm font-semibold text-gray-500 mb-2">
                        {results.length === 0 ? 'No results found' : `${results.length} results found`}
                    </h4>
                    <ul className="space-y-2">
                        {results.map((res, i) => (
                            <li key={i} className="p-3 bg-slate-50 rounded border border-slate-200 text-sm">
                                {res}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchBox;
