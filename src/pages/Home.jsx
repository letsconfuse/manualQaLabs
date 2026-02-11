import React from 'react';
import ChallengeCard from '../components/ChallengeCard';
import { getChallengeList } from '../data/challenges';

const Home = () => {
    const challenges = getChallengeList();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
                    Break the Code. <span className="text-primary">Master QA.</span>
                </h1>
                <p className="mt-5 max-w-xl mx-auto text-xl text-slate-400">
                    Put your manual testing skills to the test. Find edge cases, security flaws, and logic bugs in these interactive challenges.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {challenges.map((challenge) => (
                    <ChallengeCard key={challenge.id} {...challenge} />
                ))}
            </div>
        </div>
    );
};

export default Home;
