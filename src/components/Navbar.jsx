import React from 'react';
import { Link } from 'react-router-dom';
import { Bug, CheckCircle } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="bg-slate-800 border-b border-slate-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <Bug className="h-8 w-8 text-secondary" />
                            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                QA Challenges
                            </span>
                        </Link>
                    </div>
                    <div className="flex space-x-4">
                        <Link to="/" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                            Challenges
                        </Link>
                        <Link to="/about" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                            About
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
