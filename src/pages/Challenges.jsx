import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getChallengeList } from '../data/challenges';
import { Search, ChevronRight, CheckCircle, Circle, Play } from 'lucide-react';

const Challenges = () => {
    const allChallenges = getChallengeList();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredChallenges = allChallenges.filter(challenge =>
        challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getDifficultyColor = (diff) => {
        switch (diff?.toLowerCase()) {
            case 'easy': return 'text-emerald-700 dark:text-emerald-400 bg-white dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 shadow-sm';
            case 'medium': return 'text-amber-700 dark:text-amber-400 bg-white dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 shadow-sm';
            case 'hard': return 'text-rose-700 dark:text-rose-400 bg-white dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 shadow-sm';
            default: return 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20 shadow-sm';
        }
    };

    return (
        <div className="animate-fade-in max-w-6xl mx-auto px-4 py-8">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary-color mb-2">Challenge Library</h1>
                    <p className="text-secondary-color">Select a protocol to begin testing.</p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-color" />
                    <input
                        type="text"
                        placeholder="Search challenges..."
                        className="w-full pl-10 pr-4 py-2 bg-surface border border-theme rounded-lg text-primary-color placeholder-slate-500 focus:outline-none focus:border-accent-primary transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 mb-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider pl-10 border border-slate-300 dark:border-slate-700">
                <div className="col-span-1 text-center">Status</div>
                <div className="col-span-6 md:col-span-5">Title</div>
                <div className="col-span-3 hidden md:block">Category</div>
                <div className="col-span-2 hidden md:block">Difficulty</div>
                <div className="col-span-3 md:col-span-1 text-right">Action</div>
            </div>

            {/* List Items */}
            <div className="space-y-4">
                {filteredChallenges.map((challenge) => (
                    <div key={challenge.id} className="card-3d grid grid-cols-12 gap-4 px-6 py-5 items-center group cursor-pointer hover:border-accent-primary/50 relative">
                        {/* Status Icon */}
                        <div className="col-span-1 flex justify-center">
                            <Circle className="w-5 h-5 text-slate-300 dark:text-slate-500" />
                        </div>

                        {/* Title */}
                        <div className="col-span-6 md:col-span-5">
                            <Link to={`/challenge/${challenge.id}`} className="block text-lg font-bold text-primary-color group-hover:text-accent transition-colors">
                                {challenge.title}
                            </Link>
                            <span className="text-xs text-secondary-color line-clamp-1 mt-0.5 pr-4 hidden md:block">
                                {challenge.description}
                            </span>
                        </div>

                        {/* Category Badge */}
                        <div className="col-span-3 hidden md:block">
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-slate-200 text-slate-900 dark:bg-slate-100 dark:text-slate-900 border border-slate-300 dark:border-transparent shadow-sm">
                                {challenge.type || 'General'}
                            </span>
                        </div>

                        {/* Difficulty Badge */}
                        <div className="col-span-2 hidden md:block">
                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border ${getDifficultyColor(challenge.difficulty)}`}>
                                {challenge.difficulty}
                            </span>
                        </div>

                        {/* Action Button */}
                        <div className="col-span-3 md:col-span-1 flex justify-end relative z-10">
                            <Link
                                to={`/challenge/${challenge.id}`}
                                className="btn-3d-primary p-2.5 rounded-lg shadow-lg shadow-teal-500/20"
                                title="Start Challenge"
                            >
                                <Play className="w-4 h-4 fill-current" />
                            </Link>
                        </div>

                        {/* Click overlay */}
                        <Link to={`/challenge/${challenge.id}`} className="absolute inset-0 z-0" />
                    </div>
                ))}
            </div>

            {filteredChallenges.length === 0 && (
                <div className="p-8 text-center text-secondary-color">
                    No challenges found matching "{searchTerm}"
                </div>
            )}

            <div className="mt-4 text-center text-sm text-secondary-color">
                Showing {filteredChallenges.length} challenges
            </div>
        </div>
    );
};

export default Challenges;
