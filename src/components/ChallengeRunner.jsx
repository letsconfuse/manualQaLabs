import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Terminal, AlertCircle, RefreshCw } from 'lucide-react';
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

    // Expose a method for the child component to report results
    const addLog = (entry) => {
        // entry: { type: 'success' | 'error' | 'info', message: string, edgeCaseId: string }
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [{ ...entry, timestamp }, ...prev]);

        if (entry.edgeCaseId && entry.type === 'success') {
            setSolvedCases(prev => {
                const newSet = new Set(prev);
                newSet.add(entry.edgeCaseId);
                return newSet;
            });
        }
    };

    useEffect(() => {
        if (requirements.length > 0) {
            setProgress(Math.round((solvedCases.size / requirements.length) * 100));
        }
    }, [solvedCases, requirements.length]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-64px)] flex flex-col md:flex-row gap-6">

            {/* Left Panel: Requirements & Progress */}
            <div className="w-full md:w-1/3 h-full">
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl h-full flex flex-col">
                    <div className="mb-4 flex-shrink-0">
                        <Link to="/" className="text-slate-400 hover:text-white text-sm mb-2 inline-block">&larr; Back to Challenges</Link>
                        <h2 className="text-2xl font-bold text-white">{title}</h2>
                        <p className="text-slate-400 text-sm mt-1">{description}</p>
                    </div>

                    <div className="mb-6 flex-shrink-0">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-300">Progress</span>
                            <span className="text-primary font-bold">{progress}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                            <div
                                className="bg-primary h-2.5 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="flex-grow overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        <h3 className="font-semibold text-slate-200 uppercase text-xs tracking-wider sticky top-0 bg-slate-800 pb-2 z-10">Edge Case Checklist</h3>
                        {requirements.map((req) => (
                            <div
                                key={req.id}
                                className={`flex items-start p-3 rounded-lg border transition-all ${solvedCases.has(req.id)
                                    ? 'bg-green-500/10 border-green-500/30'
                                    : 'bg-slate-700/30 border-slate-700/50'
                                    }`}
                            >
                                <div className="mt-0.5 mr-3 flex-shrink-0">
                                    {solvedCases.has(req.id)
                                        ? <CheckCircle className="w-5 h-5 text-green-400" />
                                        : <div className="w-5 h-5 rounded-full border-2 border-slate-600" />
                                    }
                                </div>
                                <div>
                                    <p className={`text-sm font-medium ${solvedCases.has(req.id) ? 'text-green-300' : 'text-slate-300'}`}>
                                        {solvedCases.has(req.id) ? req.title : '??? (Hidden)'}
                                    </p>
                                    {solvedCases.has(req.id) && (
                                        <p className="text-xs text-green-400/70 mt-1">{req.explanation}</p>
                                    )}
                                    {/* Hint Logic could go here */}
                                    {!solvedCases.has(req.id) && (
                                        <p className="text-xs text-slate-500 mt-1 italic">Find this edge case...</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel: Interactive Area & Console */}
            <div className="w-full md:w-2/3 flex flex-col gap-6">

                {/* Interactive Component Area */}
                <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 flex-grow flex flex-col items-center justify-center relative bg-grid-pattern overflow-hidden">
                    <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]"></div>

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
                        <div className="z-10 w-full max-w-md">
                            {/* Clone children to inject the addLog prop */}
                            {React.cloneElement(children, { addLog })}
                        </div>
                    )}
                </div>

                {/* Console / Logs */}
                <div className="bg-black/80 rounded-xl border border-slate-800 h-64 flex flex-col overflow-hidden font-mono text-xs">
                    <div className="bg-slate-900/50 p-2 border-b border-slate-800 flex justify-between items-center px-4">
                        <span className="flex items-center text-slate-400 gap-2">
                            <Terminal className="w-4 h-4" /> System Logs
                        </span>
                        <button
                            onClick={() => setLogs([])}
                            className="text-slate-500 hover:text-white transition-colors"
                        >
                            <RefreshCw className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="p-4 overflow-y-auto space-y-2 flex-grow">
                        {logs.length === 0 && (
                            <div className="text-slate-600 italic text-center mt-10">Waiting for user interactions...</div>
                        )}
                        {logs.map((log, index) => (
                            <div key={index} className="flex gap-2 animate-fadeIn">
                                <span className="text-slate-600">[{log.timestamp}]</span>
                                <span className={`
                  ${log.type === 'success' ? 'text-green-400' : ''}
                  ${log.type === 'error' ? 'text-red-400' : ''}
                  ${log.type === 'info' ? 'text-blue-300' : ''}
                `}>
                                    {log.type === 'success' && '✓ '}
                                    {log.type === 'error' && '✕ '}
                                    {log.type === 'info' && 'ℹ '}
                                    {log.message}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ChallengeRunner;
