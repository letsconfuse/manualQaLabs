import React from 'react';
import { MousePointerClick, FileText, Bug } from 'lucide-react';

const HowItWorks = () => {
    const steps = [
        {
            icon: <MousePointerClick className="w-8 h-8 text-accent" />,
            title: "1. Choose a Challenge",
            description: "Browse the scenarios below. Each one simulates a specific feature with hidden bugs."
        },
        {
            icon: <FileText className="w-8 h-8 text-secondary-color" />,
            title: "2. Read the Brief",
            description: "Understand the requirements. Knowing how it *should* work is key to finding how it *doesn't*."
        },
        {
            icon: <Bug className="w-8 h-8 text-red-400" />,
            title: "3. Hunt for Bugs",
            description: "Test limits, inputs, and logic. Find the edge cases that break the system."
        }
    ];

    return (
        <div className="py-12 mb-16">
            <div className="text-center mb-12">
                <h2 className="text-2xl font-bold text-primary-color mb-2">How It <span className="text-accent">Works</span></h2>
                <p className="text-secondary-color">Follow these steps to begin your testing session.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center px-4">
                {steps.map((step, index) => (
                    <div key={index} className="flex flex-col items-center group perspective-1000">
                        <div className="mb-6 p-6 bg-surface rounded-3xl border border-theme shadow-3d group-hover:scale-110 transition-transform duration-300 ease-out">
                            {step.icon}
                        </div>
                        <h3 className="text-xl font-bold text-primary-color mb-3">{step.title}</h3>
                        <p className="text-sm text-secondary-color leading-relaxed max-w-xs">
                            {step.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HowItWorks;
