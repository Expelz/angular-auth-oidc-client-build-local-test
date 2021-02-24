import { ValidationResult } from './validation-result';
export declare class StateValidationResult {
    accessToken: string;
    idToken: string;
    authResponseIsValid: boolean;
    decodedIdToken: any;
    state: ValidationResult;
    constructor(accessToken?: string, idToken?: string, authResponseIsValid?: boolean, decodedIdToken?: any, state?: ValidationResult);
}
//# sourceMappingURL=state-validation-result.d.ts.map