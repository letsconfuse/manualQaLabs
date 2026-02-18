import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-body text-primary-color font-sans selection:bg-accent-primary/30 selection:text-accent-primary transition-colors duration-300">
            <Sidebar />
            <div className="flex-1 ml-0 md:ml-64 relative pb-24 md:pb-0">
                {/* Top Gradient Overlay for subtle atmosphere - Adapted for Light/Dark */}
                <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-accent-primary/5 to-transparent pointer-events-none z-0" />

                {/* Main Content */}
                <main className="relative z-10 p-6 md:p-12 max-w-7xl mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
