import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Terminal, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const ChallengeRunner = ({
    title,
    description,
    requirements = [],
    onTest,
    children
}) => {
    const [logs, setLogs] = useState([]);
    // Load solved cases from localStorage based on the challenge title (or a stable ID if passed)
    // We'll use a sanitized version of the title as the key for now since ID isn't directly passed prop
    const storageKey = `qa-labs-progress-${title.toLowerCase().replace(/\s+/g, '-')}`;

    const [solvedCases, setSolvedCases] = useState(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch (e) {
            console.error("Failed to load progress:", e);
            return new Set();
        }
    });

    const [progress, setProgress] = useState(0);
    const [isPanelExpanded, setIsPanelExpanded] = useState(true);
    const [showConfetti, setShowConfetti] = useState(false);

    // Persist solvedCases whenever they change
    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify([...solvedCases]));
        } catch (e) {
            console.error("Failed to save progress:", e);
        }
    }, [solvedCases, storageKey]);

    // Expose a method for the child component to report results
    // useCallback prevents this from changing reference on every render
    const addLog = React.useCallback((entry) => {
        // entry: { type: 'success' | 'error' | 'info', message: string, edgeCaseId: string }
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [{ ...entry, timestamp }, ...prev]);

        if (entry.edgeCaseId && entry.type === 'success') {
            setSolvedCases(prev => {
                // Only update if not already solved
                if (prev.has(entry.edgeCaseId)) return prev;

                // Trigger celebration
                const newSet = new Set(prev);
                newSet.add(entry.edgeCaseId);
                return newSet;
            });
        }
    }, []);

    useEffect(() => {
        if (requirements.length > 0) {
            const newProgress = Math.round((solvedCases.size / requirements.length) * 100);
            if (newProgress > progress && newProgress === 100) {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 5000);
            }
            setProgress(newProgress);
        }
    }, [solvedCases, requirements.length, progress]);

    return (
        <div className="h-auto md:h-[calc(100vh-64px)] w-full bg-body flex flex-col md:flex-row overflow-visible md:overflow-hidden font-sans text-secondary-color rounded-2xl md:rounded-l-2xl shadow-sm border border-theme">

            {/* LEFT PANE: Interactive App Stage */}
            <div className="flex-grow h-full relative overflow-auto flex flex-col">
                {/* Header / Breadcrumbs */}
                <div className="flex-shrink-0 h-14 border-b border-theme flex items-center px-6 bg-surface">
                    <div className="flex items-center gap-3">
                        <Link to="/challenges" className="text-secondary-color hover:text-primary-color text-xs uppercase tracking-wider font-bold transition-colors">&larr; Back</Link>
                        <div className="w-px h-4 bg-theme"></div>
                        <h2 className="text-sm font-bold text-primary-color">{title}</h2>
                    </div>
                </div>

                {/* Challenge Container */}
                <div className="flex-grow relative bg-body flex flex-col items-center justify-center p-4 transition-colors">
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px]"></div>

                    {showConfetti && (
                        <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
                            {[...Array(50)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute animate-float"
                                    style={{
                                        left: `${Math.random() * 100}%`,
                                        top: `-10%`,
                                        animationDuration: `${Math.random() * 3 + 2}s`,
                                        animationDelay: `${Math.random() * 2}s`,
                                    }}
                                >
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{
                                            backgroundColor: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][Math.floor(Math.random() * 5)],
                                            transform: `rotate(${Math.random() * 360}deg)`
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {progress === 100 ? (
                        <div className="z-20 text-center animate-bounceIn">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500 rounded-full mb-6 shadow-[0_0_30px_rgba(34,197,94,0.5)]">
                                <CheckCircle className="w-12 h-12 text-white" />
                            </div>
                            <h2 className="text-4xl font-black text-primary-color mb-2 tracking-tight">CHALLENGE COMPLETE!</h2>
                            <p className="text-secondary-color mb-8 max-w-xs mx-auto">Outstanding work! You've successfully identified every single edge case in this scenario.</p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link
                                    to="/challenges"
                                    className="px-6 py-3 bg-accent-primary hover:bg-opacity-90 text-white font-bold rounded-lg transition-all shadow-lg shadow-indigo-500/20"
                                >
                                    Take Another Challenge
                                </Link>
                                <button
                                    onClick={() => setSolvedCases(new Set())}
                                    className="px-6 py-3 bg-theme hover:bg-opacity-80 text-primary-color font-bold rounded-lg transition-all"
                                >
                                    Reset & Play Again
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="z-10 w-full h-full flex flex-col items-center justify-center">
                            {React.cloneElement(children, { addLog })}
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT PANE: Sidebar Tools (Checklist & Console) */}
            <div className="w-full md:w-96 flex-shrink-0 flex flex-col border-t md:border-t-0 md:border-l border-theme bg-surface h-auto md:h-full overflow-hidden transition-all duration-300 shadow-xl z-20 rounded-b-2xl md:rounded-b-none md:rounded-r-2xl">

                {/* Progress Header */}
                <div className="flex-shrink-0 p-4 border-b border-theme bg-body">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xs font-bold text-secondary-color uppercase tracking-wider">Progress</h3>
                        <span className="text-accent font-mono text-xs font-bold">{progress}%</span>
                    </div>
                    <div className="w-full bg-theme/50 rounded-full h-1.5">
                        <div
                            className="bg-accent-primary h-1.5 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(var(--accent-primary),0.5)]"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Requirements List (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <h3 className="font-mono font-bold text-secondary-color uppercase text-[10px] tracking-widest mb-3 flex items-center gap-2">
                        <CheckCircle className="w-3 h-3" /> Test Cases
                    </h3>
                    <div className="space-y-1">
                        {requirements.map((req) => (
                            <div
                                key={req.id}
                                className={`flex items-start p-2.5 rounded-lg border text-xs transition-all ${solvedCases.has(req.id)
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-surface border-theme text-secondary-color hover:border-accent-primary/50'
                                    }`}
                            >
                                <div className="mt-0.5 mr-3 flex-shrink-0">
                                    {solvedCases.has(req.id)
                                        ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                        : <div className="w-3.5 h-3.5 rounded-full border-theme" />
                                    }
                                </div>
                                <div>
                                    <p className="font-medium leading-relaxed">
                                        {solvedCases.has(req.id) ? req.title : '??? (Hidden QA Case)'}
                                    </p>
                                    {solvedCases.has(req.id) && (
                                        <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/90 mt-1">{req.explanation}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Console / Logs (Sticky Bottom Half) */}
                <div className="flex-shrink-0 h-1/3 min-h-[200px] border-t border-theme flex flex-col bg-surface text-secondary-color transition-colors">
                    <div className="flex-shrink-0 p-2 border-b border-theme flex justify-between items-center px-4 bg-body">
                        <span className="flex items-center text-secondary-color gap-2 font-bold tracking-wider text-[10px] uppercase">
                            <Terminal className="w-3 h-3" /> System Console
                        </span>
                        <button
                            onClick={() => setLogs([])}
                            className="text-secondary-color hover:text-primary-color transition-colors"
                            title="Clear Logs"
                        >
                            <RefreshCw className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="flex-1 p-3 overflow-y-auto font-mono text-xs custom-scrollbar">
                        {logs.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-secondary-color italic opacity-50">
                                <Terminal className="w-8 h-8 mb-2 opacity-20" />
                                <span>Ready for input...</span>
                            </div>
                        )}
                        <div className="flex-col gap-1 flex">
                            {logs.map((log, index) => (
                                <div key={index} className="flex gap-2 animate-fadeIn border-b border-theme/50 pb-1 mb-1 last:border-0 last:mb-0">
                                    <span className="text-secondary-color flex-shrink-0 select-none">[{log.timestamp}]</span>
                                    <span className={`break-words
                        ${log.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : ''}
                        ${log.type === 'error' ? 'text-rose-600 dark:text-rose-400' : ''}
                        ${log.type === 'info' ? 'text-blue-600 dark:text-blue-400' : ''}
                        `}>
                                        {log.type === 'success' && '✓ '}
                                        {log.type === 'error' && '✕ '}
                                        {log.type === 'info' && '» '}
                                        {log.message}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChallengeRunner;
