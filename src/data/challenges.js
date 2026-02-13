import AgeGate, { AgeGateConfig } from '../scenarios/AgeGate';
import UsernameValidator, { UsernameConfig } from '../scenarios/UsernameValidator';
import SearchBox, { SearchConfig } from '../scenarios/SearchBox';
import FileUpload, { FileUploadConfig } from '../scenarios/FileUpload';
import CouponCode, { CouponConfig } from '../scenarios/CouponCode';
import RoleManager, { RoleConfig } from '../scenarios/RoleManager';
import BookingArchitect, { BookingConfig } from '../scenarios/BookingArchitect';
import SubscriptionNexus from '../scenarios/SubscriptionNexus';

const SubscriptionConfig = {
    id: 'subscription-nexus',
    title: 'The Subscription Nexus',
    description: 'Elite Level: A hyper-realistic billing console simulation. Test proration math, tax liability, and state machine integrity.',
    type: 'logic',
    difficulty: 'Hard',
    requirements: [
        { id: 'proration-precision', title: 'Mid-Month Upgrade Logic', explanation: 'Upgrade precisely on Day 15 to find the $0.01 calculation drift.' },
        { id: 'tax-exemption-bug', title: 'Tax Hierarchy Flaw', explanation: 'Applying a manual discount to a mixed taxable/exempt basket.' },
        { id: 'floating-point-drift', title: 'Unit Math Precision', explanation: 'Generate an invoice for exactly 131,579 units at $0.00038/unit.' },
        { id: 'state-lockout', title: 'Grace Period Deadlock', explanation: 'Trying to cancel a subscription that is currently in a "Lapsed" state.' },
        { id: 'orphan-dependency', title: 'Orphaned Add-on Charge', explanation: 'The "Enterprise Support" add-on remains active even if the parent plan is deleted.' },
        { id: 'leap-year-rollover', title: 'Leap Year Cycle Drift', explanation: 'Setting the signup date to Feb 29th and simulating a monthly rollover.' }
    ]
};

/**
 * To add a new challenge:
 * 1. Create your scenario file in /src/scenarios/
 * 2. Export a component and a config object (title, description, difficulty, requirements, type)
 * 3. Import and add it to registry below
 */

export const challengeRegistry = {
    'age-gate': {
        component: AgeGate,
        config: AgeGateConfig,
    },
    'username-validator': {
        component: UsernameValidator,
        config: UsernameConfig,
    },
    'search-box': {
        component: SearchBox,
        config: SearchConfig,
    },
    'file-upload': {
        component: FileUpload,
        config: FileUploadConfig,
    },
    'coupon-code': {
        component: CouponCode,
        config: CouponConfig,
    },
    'role-manager': {
        component: RoleManager,
        config: RoleConfig,
    },
    'booking-architect': {
        component: BookingArchitect,
        config: BookingConfig,
    },
    'subscription-nexus': {
        component: SubscriptionNexus,
        config: SubscriptionConfig,
    }
};

console.log('Challenge Registry Loaded:', challengeRegistry);

export const getChallengeList = () => {
    return Object.entries(challengeRegistry).map(([id, data]) => ({
        id,
        ...data.config
    }));
};
