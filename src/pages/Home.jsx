import React from 'react';
import ChallengeCard from '../components/ChallengeCard';
import HowItWorks from '../components/HowItWorks';
import { getChallengeList } from '../data/challenges';
import { Link } from 'react-router-dom';

const Home = () => {
    const challenges = getChallengeList();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-20">
                <div className="inline-block animate-float mb-4">
                    <span className="px-4 py-1 rounded-full bg-accent-primary/10 text-accent font-bold text-sm border border-accent-primary/20 shadow-sm">
                        v1.0 Public Beta
                    </span>
                </div>
                <h1 className="text-5xl font-black text-primary-color sm:text-6xl sm:tracking-tight lg:text-7xl mb-6 drop-shadow-sm">
                    Break the Code. <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Master QA.</span>
                </h1>
                <p className="mt-5 max-w-2xl mx-auto text-xl text-secondary-color leading-relaxed">
                    Put your manual testing skills to the test. Find edge cases, security flaws, and logic bugs in these 3D interactive challenges.
                </p>

                <div className="mt-10 flex justify-center gap-4">
                    <Link
                        to="/challenges"
                        className="btn-3d-primary px-8 py-4 text-lg font-bold rounded-xl shadow-xl shadow-teal-500/20 inline-flex items-center"
                    >
                        Start Training
                    </Link>
                    <Link
                        to="/about"
                        className="px-8 py-4 text-lg font-bold text-secondary-color bg-surface border-2 border-theme hover:border-accent-primary rounded-xl transition-colors"
                    >
                        Learn More
                    </Link>
                </div>
            </div>

            <HowItWorks />
        </div>
    );
};

export default Home;
