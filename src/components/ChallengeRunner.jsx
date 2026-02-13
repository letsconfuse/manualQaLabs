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
    const [solvedCases, setSolvedCases] = useState(new Set());
    const [progress, setProgress] = useState(0);
    const [isPanelExpanded, setIsPanelExpanded] = useState(true);

    // Expose a method for the child component to report results
    // Expose a method for the child component to report results
    // useCallback prevents this from changing reference on every render, which stops infinite loops in child useEffects
    const addLog = React.useCallback((entry) => {
        // entry: { type: 'success' | 'error' | 'info', message: string, edgeCaseId: string }
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [{ ...entry, timestamp }, ...prev]);

        if (entry.edgeCaseId && entry.type === 'success') {
            setSolvedCases(prev => {
                // Only update if not already solved (optimization)
                if (prev.has(entry.edgeCaseId)) return prev;
                const newSet = new Set(prev);
                newSet.add(entry.edgeCaseId);
                return newSet;
            });
        }
    }, []);

    useEffect(() => {
        if (requirements.length > 0) {
            setProgress(Math.round((solvedCases.size / requirements.length) * 100));
        }
    }, [solvedCases, requirements.length]);

    return (
        <div className="h-[calc(100vh-64px)] w-full bg-slate-950 flex flex-col md:flex-row overflow-hidden font-sans text-slate-300">

            {/* LEFT PANE: Interactive App Stage */}
            <div className="flex-grow h-full relative overflow-auto flex flex-col">
                {/* Header / Breadcrumbs */}
                <div className="flex-shrink-0 h-14 border-b border-slate-800 flex items-center px-6 bg-[#0b1121]">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="text-slate-500 hover:text-white text-xs uppercase tracking-wider font-bold transition-colors">&larr; Back</Link>
                        <div className="w-px h-4 bg-slate-800"></div>
                        <h2 className="text-sm font-bold text-white">{title}</h2>
                    </div>
                </div>

                {/* Challenge Container */}
                <div className="flex-grow relative bg-slate-950 flex flex-col items-center justify-center p-4">
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"></div>

                    {progress === 100 ? (
                        <div className="z-20 text-center animate-bounceIn">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6 shadow-[0_0_30px_rgba(34,197,94,0.5)]">
                                <CheckCircle className="w-12 h-12 text-white" />
                            </div>
                            <h2 className="text-4xl font-black text-white mb-2 tracking-tight">CHALLENGE COMPLETE!</h2>
                            <p className="text-slate-400 mb-8 max-w-xs mx-auto">Outstanding work! You've successfully identified every single edge case in this scenario.</p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link
                                    to="/"
                                    className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-all shadow-lg shadow-primary/20"
                                >
                                    Take Another Challenge
                                </Link>
                                <button
                                    onClick={() => setSolvedCases(new Set())}
                                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-all"
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
            <div className="w-full md:w-96 flex-shrink-0 flex flex-col border-l border-slate-800 bg-[#0f172a] h-full overflow-hidden transition-all duration-300">

                {/* Progress Header */}
                <div className="flex-shrink-0 p-4 border-b border-slate-800 bg-slate-900/50">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progress</h3>
                        <span className="text-primary font-mono text-xs font-bold">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                        <div
                            className="bg-primary h-1.5 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Requirements List (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <h3 className="font-mono font-bold text-slate-500 uppercase text-[10px] tracking-widest mb-3 flex items-center gap-2">
                        <CheckCircle className="w-3 h-3" /> Test Cases
                    </h3>
                    <div className="space-y-1">
                        {requirements.map((req) => (
                            <div
                                key={req.id}
                                className={`flex items-start p-2.5 rounded-lg border text-xs transition-all ${solvedCases.has(req.id)
                                    ? 'bg-green-500/10 border-green-500/20 text-green-300'
                                    : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:border-slate-700'
                                    }`}
                            >
                                <div className="mt-0.5 mr-3 flex-shrink-0">
                                    {solvedCases.has(req.id)
                                        ? <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                        : <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />
                                    }
                                </div>
                                <div>
                                    <p className="font-medium leading-relaxed">
                                        {solvedCases.has(req.id) ? req.title : '??? (Hidden QA Case)'}
                                    </p>
                                    {solvedCases.has(req.id) && (
                                        <p className="text-[10px] text-green-400/50 mt-1">{req.explanation}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Console / Logs (Sticky Bottom Half) */}
                <div className="flex-shrink-0 h-1/3 min-h-[200px] border-t border-slate-800 flex flex-col bg-[#050912]">
                    <div className="flex-shrink-0 p-2 border-b border-slate-800 flex justify-between items-center px-4 bg-slate-900/30">
                        <span className="flex items-center text-slate-400 gap-2 font-bold tracking-wider text-[10px] uppercase">
                            <Terminal className="w-3 h-3" /> System Console
                        </span>
                        <button
                            onClick={() => setLogs([])}
                            className="text-slate-600 hover:text-white transition-colors"
                            title="Clear Logs"
                        >
                            <RefreshCw className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="flex-1 p-3 overflow-y-auto font-mono text-xs custom-scrollbar">
                        {logs.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-700 italic opacity-50">
                                <Terminal className="w-8 h-8 mb-2 opacity-20" />
                                <span>Ready for input...</span>
                            </div>
                        )}
                        <div className="flex flex-col gap-1">
                            {logs.map((log, index) => (
                                <div key={index} className="flex gap-2 animate-fadeIn border-b border-white/5 pb-1 mb-1 last:border-0 last:mb-0">
                                    <span className="text-slate-600 flex-shrink-0 select-none">[{log.timestamp}]</span>
                                    <span className={`break-words
                        ${log.type === 'success' ? 'text-emerald-400' : ''}
                        ${log.type === 'error' ? 'text-red-400' : ''}
                        ${log.type === 'info' ? 'text-blue-400' : ''}
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
