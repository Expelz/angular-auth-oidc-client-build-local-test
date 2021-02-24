import { OpenIdConfiguration } from '../config/openid-configuration';
export interface Rule {
    validate(passedConfig: OpenIdConfiguration): RuleValidationResult;
}
export interface RuleValidationResult {
    result: boolean;
    messages: string[];
    level: Level;
}
export declare const POSITIVE_VALIDATION_RESULT: {
    result: boolean;
    messages: any[];
    level: any;
};
export declare type Level = 'warning' | 'error';
//# sourceMappingURL=rule.d.ts.map