import React from 'react';
import { Bug, Target, Shield, Code, CheckCircle } from 'lucide-react';

const About = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 text-slate-300">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold text-white mb-4">About the QA Challenge</h1>
                <p className="text-xl max-w-2xl mx-auto">
                    This project simulates real-world "buggy" interfaces to demonstrate the importance of <span className="text-primary font-semibold">Manual QA</span> and <span className="text-secondary font-semibold">Edge Case Analysis</span>.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
                <div className="bg-slate-800 p-8 rounded-xl border border-slate-700">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <Target className="text-primary" /> The Objective
                    </h2>
                    <p className="leading-relaxed">
                        Most developers test the "Happy Path" – the ideal scenario where users do everything right.
                        However, 80% of bugs hide in the edge cases. This tool showcases the ability to:
                    </p>
                    <ul className="mt-4 space-y-2">
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Identify Validation Gaps</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Test Security Vulnerabilities (XSS, SQLi)</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Analyze Boundary Values</li>
                    </ul>
                </div>

                <div className="bg-slate-800 p-8 rounded-xl border border-slate-700">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <Code className="text-secondary" /> How It Works
                    </h2>
                    <p className="leading-relaxed">
                        Each scenario is built with intentional logic to handle (or fail) specific inputs.
                        When you enter a value, the system analyzes it against a database of "known edge cases".
                        If you find one, it's logged and your progress increases.
                    </p>
                    <div className="mt-6 p-4 bg-slate-900 rounded-lg text-sm font-mono text-slate-400">
            // Example Logic<br />
                        if (input &lt; 0) return "Edge Case Found: Negative Value";
                    </div>
                </div>
            </div>

            <div className="text-center border-t border-slate-800 pt-12">
                <p className="mb-4">Built with React + Tailwind CSS by a QA Engineer who codes.</p>
                <a href="/" className="inline-block bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded transition-colors">
                    Back to Challenges
                </a>
            </div>
        </div>
    );
};

export default About;
