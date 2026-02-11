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
        Easy: 'text-green-400 bg-green-400/10',
        Medium: 'text-yellow-400 bg-yellow-400/10',
        Hard: 'text-red-400 bg-red-400/10',
    }[difficulty];

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700/50 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 overflow-hidden group">
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-lg ${difficultyColor}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border border-current ${difficultyColor}`}>
                        {difficulty}
                    </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                    {title}
                </h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                    {description}
                </p>

                <Link
                    to={`/challenge/${id}`}
                    className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                    Start Challenge <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
            </div>
        </div>
    );
};

export default ChallengeCard;
