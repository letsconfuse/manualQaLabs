import React from 'react';
import ChallengeCard from '../components/ChallengeCard';

const Home = () => {
    const challenges = [
        {
            id: 'age-gate',
            title: 'The Age Gate',
            description: 'Test a simple age verification input. Can you find all the boundary values and invalid inputs?',
            type: 'boundary',
            difficulty: 'Easy',
        },
        {
            id: 'username-validator',
            title: 'The Username Validator',
            description: 'A classic registration field with hidden rules. Test for length, characters, and SQL injection.',
            type: 'validation',
            difficulty: 'Medium',
        },
        {
            id: 'search-box',
            title: 'The Search Box',
            description: 'A search input prone to XSS and strange queries. Break the search logic.',
            type: 'security',
            difficulty: 'Hard',
        },
        {
            id: 'file-upload',
            title: 'The File Upload',
            description: 'Upload a picture. Test file types, size, and double extensions.',
            type: 'security',
            difficulty: 'Medium',
        },
        {
            id: 'coupon-code',
            title: 'The Coupon Code',
            description: 'Apply a discount. Test expired codes, stacking, and negative totals.',
            type: 'validation',
            difficulty: 'Hard',
        },
        {
            id: 'role-manager',
            title: 'Admin User Rights',
            description: 'Manage user permissions. Test parent/child dependency logic and role conflicts.',
            type: 'validation',
            difficulty: 'Hard',
        },
    ];

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
