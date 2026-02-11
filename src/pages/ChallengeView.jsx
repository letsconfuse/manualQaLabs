import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import ChallengeRunner from '../components/ChallengeRunner';
import AgeGate, { AgeGateConfig } from '../scenarios/AgeGate';
import UsernameValidator, { UsernameConfig } from '../scenarios/UsernameValidator';
import SearchBox, { SearchConfig } from '../scenarios/SearchBox';
import FileUpload, { FileUploadConfig } from '../scenarios/FileUpload';
import CouponCode, { CouponConfig } from '../scenarios/CouponCode';
import RoleManager, { RoleConfig } from '../scenarios/RoleManager';

// Map of all challenges
const scenarios = {
    'age-gate': {
        component: AgeGate,
        config: AgeGateConfig
    },
    // Future challenges placeholders
    'username-validator': {
        component: UsernameValidator,
        config: UsernameConfig
    },
    'search-box': {
        component: SearchBox,
        config: SearchConfig
    },
    'file-upload': {
        component: FileUpload,
        config: FileUploadConfig
    },
    'coupon-code': {
        component: CouponCode,
        config: CouponConfig
    },
    'role-manager': {
        component: RoleManager,
        config: RoleConfig
    }
};

const ChallengeView = () => {
    const { id } = useParams();
    const scenario = scenarios[id];

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
