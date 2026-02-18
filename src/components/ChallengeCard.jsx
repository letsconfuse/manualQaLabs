import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertTriangle, Shield, MousePointer } from 'lucide-react';

const icons = {
    boundary: MousePointer,
    validation: AlertTriangle,
    security: Shield,
};

const ChallengeCard = ({ id, title, description, type, difficulty }) => {
    const Icon = icons[type] || MousePointer;

    const difficultyColor = {
        Easy: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-400/10',
        Medium: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-400/10',
        Hard: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-400/10',
    }[difficulty];

    return (
        <div className="card-3d group relative overflow-hidden h-full flex flex-col justify-between">
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-lg ${difficultyColor} shadow-inner`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${difficultyColor} shadow-sm`}>
                        {difficulty}
                    </span>
                </div>

                <h3 className="text-lg font-bold text-primary-color mb-2 group-hover:text-accent transition-colors">
                    {title}
                </h3>
                <p className="text-secondary-color text-sm mb-4 line-clamp-2">
                    {description}
                </p>
            </div>

            <div className="px-6 pb-6 mt-auto">
                <div className="inline-flex items-center text-sm font-bold text-accent group-hover:translate-x-1 transition-transform">
                    Start Challenge <ArrowRight className="ml-2 w-4 h-4" />
                </div>
            </div>

            {/* Click overlay */}
            <Link to={`/challenge/${id}`} className="absolute inset-0 z-20 focus:outline-none" aria-label={`Start ${title} challenge`} />
        </div>
    );
};

export default ChallengeCard;
