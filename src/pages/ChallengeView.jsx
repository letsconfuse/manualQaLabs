import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import ChallengeRunner from '../components/ChallengeRunner';
import { challengeRegistry } from '../data/challenges';

const ChallengeView = () => {
    const { id } = useParams();
    const scenario = challengeRegistry[id];

    if (!scenario) {
        return <Navigate to="/" replace />;
    }

    const { component: ScenarioComponent, config } = scenario;

    return (
        <ChallengeRunner
            title={config.title}
            description={config.description}
            requirements={config.requirements}
            onTest={() => { }} // Not used directly, logic is in component via addLog
        >
            <ScenarioComponent />
        </ChallengeRunner>
    );
};

export default ChallengeView;
