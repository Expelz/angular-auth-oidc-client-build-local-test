import { LoggerService } from '../logging/logger.service';
import { FlowHelper } from '../utils/flowHelper/flow-helper.service';
import { TokenHelperService } from '../utils/tokenHelper/oidc-token-helper.service';
import * as i0 from "@angular/core";
export declare class TokenValidationService {
    private tokenHelperService;
    private flowHelper;
    private loggerService;
    static refreshTokenNoncePlaceholder: string;
    keyAlgorithms: string[];
    constructor(tokenHelperService: TokenHelperService, flowHelper: FlowHelper, loggerService: LoggerService);
    hasIdTokenExpired(token: string, offsetSeconds?: number): boolean;
    validateIdTokenExpNotExpired(decodedIdToken: string, offsetSeconds?: number): boolean;
    validateAccessTokenNotExpired(accessTokenExpiresAt: Date, offsetSeconds?: number): boolean;
    validateRequiredIdToken(dataIdToken: any): boolean;
    validateIdTokenIatMaxOffset(dataIdToken: any, maxOffsetAllowedInSeconds: number, disableIatOffsetValidation: boolean): boolean;
    validateIdTokenNonce(dataIdToken: any, localNonce: any, ignoreNonceAfterRefresh: boolean): boolean;
    validateIdTokenIss(dataIdToken: any, authWellKnownEndpointsIssuer: any): boolean;
    validateIdTokenAud(dataIdToken: any, aud: any): boolean;
    validateIdTokenAzpExistsIfMoreThanOneAud(dataIdToken: any): boolean;
    validateIdTokenAzpValid(dataIdToken: any, clientId: string): boolean;
    validateStateFromHashCallback(state: any, localState: any): boolean;
    validateSignatureIdToken(idToken: any, jwtkeys: any): boolean;
    hasConfigValidResponseType(): boolean;
    validateIdTokenAtHash(accessToken: any, atHash: any, idTokenAlg: string): boolean;
    generateCodeChallenge(codeVerifier: any): string;
    private generateAtHash;
    static ɵfac: i0.ɵɵFactoryDef<TokenValidationService, never>;
    static ɵprov: i0.ɵɵInjectableDef<TokenValidationService>;
}
//# sourceMappingURL=token-validation.service.d.ts.map