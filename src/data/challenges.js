import AgeGate, { AgeGateConfig } from '../scenarios/AgeGate';
import UsernameValidator, { UsernameConfig } from '../scenarios/UsernameValidator';
import SearchBox, { SearchConfig } from '../scenarios/SearchBox';
import FileUpload, { FileUploadConfig } from '../scenarios/FileUpload';
import CouponCode, { CouponConfig } from '../scenarios/CouponCode';
import RoleManager, { RoleConfig } from '../scenarios/RoleManager';
import BookingArchitect, { BookingConfig } from '../scenarios/BookingArchitect';
import SubscriptionNexus, { SubscriptionConfig } from '../scenarios/SubscriptionNexus';

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

export const getChallengeList = () => {
    return Object.entries(challengeRegistry).map(([id, data]) => ({
        id,
        ...data.config
    }));
};
