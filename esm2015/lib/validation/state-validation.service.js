import { Injectable } from '@angular/core';
import { StateValidationResult } from './state-validation-result';
import { ValidationResult } from './validation-result';
import * as i0 from "@angular/core";
import * as i1 from "../storage/storage-persistance.service";
import * as i2 from "./token-validation.service";
import * as i3 from "../utils/tokenHelper/oidc-token-helper.service";
import * as i4 from "../logging/logger.service";
import * as i5 from "../config/config.provider";
import * as i6 from "../utils/equality/equality.service";
import * as i7 from "../utils/flowHelper/flow-helper.service";
export class StateValidationService {
    constructor(storagePersistanceService, tokenValidationService, tokenHelperService, loggerService, configurationProvider, equalityService, flowHelper) {
        this.storagePersistanceService = storagePersistanceService;
        this.tokenValidationService = tokenValidationService;
        this.tokenHelperService = tokenHelperService;
        this.loggerService = loggerService;
        this.configurationProvider = configurationProvider;
        this.equalityService = equalityService;
        this.flowHelper = flowHelper;
    }
    getValidatedStateResult(callbackContext) {
        if (callbackContext === null || callbackContext === void 0 ? void 0 : callbackContext.authResult.error) {
            return new StateValidationResult('', '', false, {});
        }
        return this.validateState(callbackContext);
    }
    validateState(callbackContext) {
        const toReturn = new StateValidationResult();
        const authStateControl = this.storagePersistanceService.read('authStateControl');
        if (!this.tokenValidationService.validateStateFromHashCallback(callbackContext.authResult.state, authStateControl)) {
            this.loggerService.logWarning('authorizedCallback incorrect state');
            toReturn.state = ValidationResult.StatesDoNotMatch;
            this.handleUnsuccessfulValidation();
            return toReturn;
        }
        const isCurrentFlowImplicitFlowWithAccessToken = this.flowHelper.isCurrentFlowImplicitFlowWithAccessToken();
        const isCurrentFlowCodeFlow = this.flowHelper.isCurrentFlowCodeFlow();
        if (isCurrentFlowImplicitFlowWithAccessToken || isCurrentFlowCodeFlow) {
            toReturn.accessToken = callbackContext.authResult.access_token;
        }
        if (callbackContext.authResult.id_token) {
            toReturn.idToken = callbackContext.authResult.id_token;
            toReturn.decodedIdToken = this.tokenHelperService.getPayloadFromToken(toReturn.idToken, false);
            if (!this.tokenValidationService.validateSignatureIdToken(toReturn.idToken, callbackContext.jwtKeys)) {
                this.loggerService.logDebug('authorizedCallback Signature validation failed id_token');
                toReturn.state = ValidationResult.SignatureFailed;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            const authNonce = this.storagePersistanceService.read('authNonce');
            if (!this.tokenValidationService.validateIdTokenNonce(toReturn.decodedIdToken, authNonce, this.configurationProvider.openIDConfiguration.ignoreNonceAfterRefresh)) {
                this.loggerService.logWarning('authorizedCallback incorrect nonce');
                toReturn.state = ValidationResult.IncorrectNonce;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.tokenValidationService.validateRequiredIdToken(toReturn.decodedIdToken)) {
                this.loggerService.logDebug('authorizedCallback Validation, one of the REQUIRED properties missing from id_token');
                toReturn.state = ValidationResult.RequiredPropertyMissing;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.tokenValidationService.validateIdTokenIatMaxOffset(toReturn.decodedIdToken, this.configurationProvider.openIDConfiguration.maxIdTokenIatOffsetAllowedInSeconds, this.configurationProvider.openIDConfiguration.disableIatOffsetValidation)) {
                this.loggerService.logWarning('authorizedCallback Validation, iat rejected id_token was issued too far away from the current time');
                toReturn.state = ValidationResult.MaxOffsetExpired;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            const authWellKnownEndPoints = this.storagePersistanceService.read('authWellKnownEndPoints');
            if (authWellKnownEndPoints) {
                if (this.configurationProvider.openIDConfiguration.issValidationOff) {
                    this.loggerService.logDebug('iss validation is turned off, this is not recommended!');
                }
                else if (!this.configurationProvider.openIDConfiguration.issValidationOff &&
                    !this.tokenValidationService.validateIdTokenIss(toReturn.decodedIdToken, authWellKnownEndPoints.issuer)) {
                    this.loggerService.logWarning('authorizedCallback incorrect iss does not match authWellKnownEndpoints issuer');
                    toReturn.state = ValidationResult.IssDoesNotMatchIssuer;
                    this.handleUnsuccessfulValidation();
                    return toReturn;
                }
            }
            else {
                this.loggerService.logWarning('authWellKnownEndpoints is undefined');
                toReturn.state = ValidationResult.NoAuthWellKnownEndPoints;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.tokenValidationService.validateIdTokenAud(toReturn.decodedIdToken, this.configurationProvider.openIDConfiguration.clientId)) {
                this.loggerService.logWarning('authorizedCallback incorrect aud');
                toReturn.state = ValidationResult.IncorrectAud;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.tokenValidationService.validateIdTokenAzpExistsIfMoreThanOneAud(toReturn.decodedIdToken)) {
                this.loggerService.logWarning('authorizedCallback missing azp');
                toReturn.state = ValidationResult.IncorrectAzp;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.tokenValidationService.validateIdTokenAzpValid(toReturn.decodedIdToken, this.configurationProvider.openIDConfiguration.clientId)) {
                this.loggerService.logWarning('authorizedCallback incorrect azp');
                toReturn.state = ValidationResult.IncorrectAzp;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.isIdTokenAfterRefreshTokenRequestValid(callbackContext, toReturn.decodedIdToken)) {
                this.loggerService.logWarning('authorizedCallback pre, post id_token claims do not match in refresh');
                toReturn.state = ValidationResult.IncorrectIdTokenClaimsAfterRefresh;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.tokenValidationService.validateIdTokenExpNotExpired(toReturn.decodedIdToken)) {
                this.loggerService.logWarning('authorizedCallback id token expired');
                toReturn.state = ValidationResult.TokenExpired;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
        }
        else {
            this.loggerService.logDebug('No id_token found, skipping id_token validation');
        }
        // flow id_token
        if (!isCurrentFlowImplicitFlowWithAccessToken && !isCurrentFlowCodeFlow) {
            toReturn.authResponseIsValid = true;
            toReturn.state = ValidationResult.Ok;
            this.handleSuccessfulValidation();
            this.handleUnsuccessfulValidation();
            return toReturn;
        }
        const idTokenHeader = this.tokenHelperService.getHeaderFromToken(toReturn.idToken, false);
        // The at_hash is optional for the code flow
        if (isCurrentFlowCodeFlow && !toReturn.decodedIdToken.at_hash) {
            this.loggerService.logDebug('Code Flow active, and no at_hash in the id_token, skipping check!');
        }
        else if (!this.tokenValidationService.validateIdTokenAtHash(toReturn.accessToken, toReturn.decodedIdToken.at_hash, idTokenHeader.alg // 'RSA256'
        ) ||
            !toReturn.accessToken) {
            this.loggerService.logWarning('authorizedCallback incorrect at_hash');
            toReturn.state = ValidationResult.IncorrectAtHash;
            this.handleUnsuccessfulValidation();
            return toReturn;
        }
        toReturn.authResponseIsValid = true;
        toReturn.state = ValidationResult.Ok;
        this.handleSuccessfulValidation();
        return toReturn;
    }
    isIdTokenAfterRefreshTokenRequestValid(callbackContext, newIdToken) {
        if (!this.configurationProvider.openIDConfiguration.useRefreshToken) {
            return true;
        }
        if (!callbackContext.existingIdToken) {
            return true;
        }
        const decodedIdToken = this.tokenHelperService.getPayloadFromToken(callbackContext.existingIdToken, false);
        // Upon successful validation of the Refresh Token, the response body is the Token Response of Section 3.1.3.3
        // except that it might not contain an id_token.
        // If an ID Token is returned as a result of a token refresh request, the following requirements apply:
        // its iss Claim Value MUST be the same as in the ID Token issued when the original authentication occurred,
        if (decodedIdToken.iss !== newIdToken.iss) {
            this.loggerService.logDebug(`iss do not match: ${decodedIdToken.iss} ${newIdToken.iss}`);
            return false;
        }
        // its azp Claim Value MUST be the same as in the ID Token issued when the original authentication occurred;
        //   if no azp Claim was present in the original ID Token, one MUST NOT be present in the new ID Token, and
        // otherwise, the same rules apply as apply when issuing an ID Token at the time of the original authentication.
        if (decodedIdToken.azp !== newIdToken.azp) {
            this.loggerService.logDebug(`azp do not match: ${decodedIdToken.azp} ${newIdToken.azp}`);
            return false;
        }
        // its sub Claim Value MUST be the same as in the ID Token issued when the original authentication occurred,
        if (decodedIdToken.sub !== newIdToken.sub) {
            this.loggerService.logDebug(`sub do not match: ${decodedIdToken.sub} ${newIdToken.sub}`);
            return false;
        }
        // its aud Claim Value MUST be the same as in the ID Token issued when the original authentication occurred,
        if (!this.equalityService.isStringEqualOrNonOrderedArrayEqual(decodedIdToken === null || decodedIdToken === void 0 ? void 0 : decodedIdToken.aud, newIdToken === null || newIdToken === void 0 ? void 0 : newIdToken.aud)) {
            this.loggerService.logDebug(`aud in new id_token is not valid: '${decodedIdToken === null || decodedIdToken === void 0 ? void 0 : decodedIdToken.aud}' '${newIdToken.aud}'`);
            return false;
        }
        if (this.configurationProvider.openIDConfiguration.disableRefreshIdTokenAuthTimeValidation) {
            return true;
        }
        // its iat Claim MUST represent the time that the new ID Token is issued,
        // if the ID Token contains an auth_time Claim, its value MUST represent the time of the original authentication
        // - not the time that the new ID token is issued,
        if (decodedIdToken.auth_time !== newIdToken.auth_time) {
            this.loggerService.logDebug(`auth_time do not match: ${decodedIdToken.auth_time} ${newIdToken.auth_time}`);
            return false;
        }
        return true;
    }
    handleSuccessfulValidation() {
        this.storagePersistanceService.write('authNonce', '');
        if (this.configurationProvider.openIDConfiguration.autoCleanStateAfterAuthentication) {
            this.storagePersistanceService.write('authStateControl', '');
        }
        this.loggerService.logDebug('AuthorizedCallback token(s) validated, continue');
    }
    handleUnsuccessfulValidation() {
        this.storagePersistanceService.write('authNonce', '');
        if (this.configurationProvider.openIDConfiguration.autoCleanStateAfterAuthentication) {
            this.storagePersistanceService.write('authStateControl', '');
        }
        this.loggerService.logDebug('AuthorizedCallback token(s) invalid');
    }
}
StateValidationService.ɵfac = function StateValidationService_Factory(t) { return new (t || StateValidationService)(i0.ɵɵinject(i1.StoragePersistanceService), i0.ɵɵinject(i2.TokenValidationService), i0.ɵɵinject(i3.TokenHelperService), i0.ɵɵinject(i4.LoggerService), i0.ɵɵinject(i5.ConfigurationProvider), i0.ɵɵinject(i6.EqualityService), i0.ɵɵinject(i7.FlowHelper)); };
StateValidationService.ɵprov = i0.ɵɵdefineInjectable({ token: StateValidationService, factory: StateValidationService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(StateValidationService, [{
        type: Injectable
    }], function () { return [{ type: i1.StoragePersistanceService }, { type: i2.TokenValidationService }, { type: i3.TokenHelperService }, { type: i4.LoggerService }, { type: i5.ConfigurationProvider }, { type: i6.EqualityService }, { type: i7.FlowHelper }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGUtdmFsaWRhdGlvbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvIiwic291cmNlcyI6WyJsaWIvdmFsaWRhdGlvbi9zdGF0ZS12YWxpZGF0aW9uLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQVEzQyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUVsRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQzs7Ozs7Ozs7O0FBR3ZELE1BQU0sT0FBTyxzQkFBc0I7SUFDakMsWUFDVSx5QkFBb0QsRUFDcEQsc0JBQThDLEVBQzlDLGtCQUFzQyxFQUN0QyxhQUE0QixFQUM1QixxQkFBNEMsRUFDNUMsZUFBZ0MsRUFDaEMsVUFBc0I7UUFOdEIsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUEyQjtRQUNwRCwyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXdCO1FBQzlDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7UUFDdEMsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFDNUIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQUM1QyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUFDaEMsZUFBVSxHQUFWLFVBQVUsQ0FBWTtJQUM3QixDQUFDO0lBRUosdUJBQXVCLENBQUMsZUFBZ0M7UUFDdEQsSUFBSSxlQUFlLGFBQWYsZUFBZSx1QkFBZixlQUFlLENBQUUsVUFBVSxDQUFDLEtBQUssRUFBRTtZQUNyQyxPQUFPLElBQUkscUJBQXFCLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDckQ7UUFFRCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELGFBQWEsQ0FB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LFVBQVUsQ0FBQyxTQUFTLEVBQUU7WUFDckQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsMkJBQTJCLGNBQWMsQ0FBQyxTQUFTLElBQUksVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7WUFDM0csT0FBTyxLQUFLLENBQUM7U0FDZDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVPLDBCQUEwQjtRQUNoQyxJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUV0RCxJQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxtQkFBbUIsQ0FBQyxpQ0FBaUMsRUFBRTtZQUNwRixJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQzlEO1FBQ0QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsaURBQWlELENBQUMsQ0FBQztJQUNqRixDQUFDO0lBRU8sNEJBQTRCO1FBQ2xDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRXRELElBQUksSUFBSSxDQUFDLHFCQUFxQixDQUFDLG1CQUFtQixDQUFDLGlDQUFpQyxFQUFFO1lBQ3BGLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDOUQ7UUFDRCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7OzRGQTlQVSxzQkFBc0I7OERBQXRCLHNCQUFzQixXQUF0QixzQkFBc0I7a0RBQXRCLHNCQUFzQjtjQURsQyxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuLi9jb25maWcvY29uZmlnLnByb3ZpZGVyJztcclxuaW1wb3J0IHsgQ2FsbGJhY2tDb250ZXh0IH0gZnJvbSAnLi4vZmxvd3MvY2FsbGJhY2stY29udGV4dCc7XHJcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgU3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZSB9IGZyb20gJy4uL3N0b3JhZ2Uvc3RvcmFnZS1wZXJzaXN0YW5jZS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgRXF1YWxpdHlTZXJ2aWNlIH0gZnJvbSAnLi4vdXRpbHMvZXF1YWxpdHkvZXF1YWxpdHkuc2VydmljZSc7XHJcbmltcG9ydCB7IEZsb3dIZWxwZXIgfSBmcm9tICcuLi91dGlscy9mbG93SGVscGVyL2Zsb3ctaGVscGVyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBUb2tlbkhlbHBlclNlcnZpY2UgfSBmcm9tICcuLi91dGlscy90b2tlbkhlbHBlci9vaWRjLXRva2VuLWhlbHBlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgU3RhdGVWYWxpZGF0aW9uUmVzdWx0IH0gZnJvbSAnLi9zdGF0ZS12YWxpZGF0aW9uLXJlc3VsdCc7XHJcbmltcG9ydCB7IFRva2VuVmFsaWRhdGlvblNlcnZpY2UgfSBmcm9tICcuL3Rva2VuLXZhbGlkYXRpb24uc2VydmljZSc7XHJcbmltcG9ydCB7IFZhbGlkYXRpb25SZXN1bHQgfSBmcm9tICcuL3ZhbGlkYXRpb24tcmVzdWx0JztcclxuXHJcbkBJbmplY3RhYmxlKClcclxuZXhwb3J0IGNsYXNzIFN0YXRlVmFsaWRhdGlvblNlcnZpY2Uge1xyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSBzdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlOiBTdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSB0b2tlblZhbGlkYXRpb25TZXJ2aWNlOiBUb2tlblZhbGlkYXRpb25TZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSB0b2tlbkhlbHBlclNlcnZpY2U6IFRva2VuSGVscGVyU2VydmljZSxcclxuICAgIHByaXZhdGUgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZSxcclxuICAgIHByaXZhdGUgY29uZmlndXJhdGlvblByb3ZpZGVyOiBDb25maWd1cmF0aW9uUHJvdmlkZXIsXHJcbiAgICBwcml2YXRlIGVxdWFsaXR5U2VydmljZTogRXF1YWxpdHlTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBmbG93SGVscGVyOiBGbG93SGVscGVyXHJcbiAgKSB7fVxyXG5cclxuICBnZXRWYWxpZGF0ZWRTdGF0ZVJlc3VsdChjYWxsYmFja0NvbnRleHQ6IENhbGxiYWNrQ29udGV4dCk6IFN0YXRlVmFsaWRhdGlvblJlc3VsdCB7XHJcbiAgICBpZiAoY2FsbGJhY2tDb250ZXh0Py5hdXRoUmVzdWx0LmVycm9yKSB7XHJcbiAgICAgIHJldHVybiBuZXcgU3RhdGVWYWxpZGF0aW9uUmVzdWx0KCcnLCAnJywgZmFsc2UsIHt9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy52YWxpZGF0ZVN0YXRlKGNhbGxiYWNrQ29udGV4dCk7XHJcbiAgfVxyXG5cclxuICB2YWxpZGF0ZVN0YXRlKGNhbGxiYWNrQ29udGV4dCk6IFN0YXRlVmFsaWRhdGlvblJlc3VsdCB7XHJcbiAgICBjb25zdCB0b1JldHVybiA9IG5ldyBTdGF0ZVZhbGlkYXRpb25SZXN1bHQoKTtcclxuICAgIGNvbnN0IGF1dGhTdGF0ZUNvbnRyb2wgPSB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZCgnYXV0aFN0YXRlQ29udHJvbCcpO1xyXG5cclxuICAgIGlmICghdGhpcy50b2tlblZhbGlkYXRpb25TZXJ2aWNlLnZhbGlkYXRlU3RhdGVGcm9tSGFzaENhbGxiYWNrKGNhbGxiYWNrQ29udGV4dC5hdXRoUmVzdWx0LnN0YXRlLCBhdXRoU3RhdGVDb250cm9sKSkge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnYXV0aG9yaXplZENhbGxiYWNrIGluY29ycmVjdCBzdGF0ZScpO1xyXG4gICAgICB0b1JldHVybi5zdGF0ZSA9IFZhbGlkYXRpb25SZXN1bHQuU3RhdGVzRG9Ob3RNYXRjaDtcclxuICAgICAgdGhpcy5oYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XHJcbiAgICAgIHJldHVybiB0b1JldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBpc0N1cnJlbnRGbG93SW1wbGljaXRGbG93V2l0aEFjY2Vzc1Rva2VuID0gdGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dJbXBsaWNpdEZsb3dXaXRoQWNjZXNzVG9rZW4oKTtcclxuICAgIGNvbnN0IGlzQ3VycmVudEZsb3dDb2RlRmxvdyA9IHRoaXMuZmxvd0hlbHBlci5pc0N1cnJlbnRGbG93Q29kZUZsb3coKTtcclxuXHJcbiAgICBpZiAoaXNDdXJyZW50Rmxvd0ltcGxpY2l0Rmxvd1dpdGhBY2Nlc3NUb2tlbiB8fCBpc0N1cnJlbnRGbG93Q29kZUZsb3cpIHtcclxuICAgICAgdG9SZXR1cm4uYWNjZXNzVG9rZW4gPSBjYWxsYmFja0NvbnRleHQuYXV0aFJlc3VsdC5hY2Nlc3NfdG9rZW47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGNhbGxiYWNrQ29udGV4dC5hdXRoUmVzdWx0LmlkX3Rva2VuKSB7XHJcbiAgICAgIHRvUmV0dXJuLmlkVG9rZW4gPSBjYWxsYmFja0NvbnRleHQuYXV0aFJlc3VsdC5pZF90b2tlbjtcclxuXHJcbiAgICAgIHRvUmV0dXJuLmRlY29kZWRJZFRva2VuID0gdGhpcy50b2tlbkhlbHBlclNlcnZpY2UuZ2V0UGF5bG9hZEZyb21Ub2tlbih0b1JldHVybi5pZFRva2VuLCBmYWxzZSk7XHJcblxyXG4gICAgICBpZiAoIXRoaXMudG9rZW5WYWxpZGF0aW9uU2VydmljZS52YWxpZGF0ZVNpZ25hdHVyZUlkVG9rZW4odG9SZXR1cm4uaWRUb2tlbiwgY2FsbGJhY2tDb250ZXh0Lmp3dEtleXMpKSB7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdhdXRob3JpemVkQ2FsbGJhY2sgU2lnbmF0dXJlIHZhbGlkYXRpb24gZmFpbGVkIGlkX3Rva2VuJyk7XHJcbiAgICAgICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0LlNpZ25hdHVyZUZhaWxlZDtcclxuICAgICAgICB0aGlzLmhhbmRsZVVuc3VjY2Vzc2Z1bFZhbGlkYXRpb24oKTtcclxuICAgICAgICByZXR1cm4gdG9SZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGF1dGhOb25jZSA9IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5yZWFkKCdhdXRoTm9uY2UnKTtcclxuXHJcbiAgICAgIGlmIChcclxuICAgICAgICAhdGhpcy50b2tlblZhbGlkYXRpb25TZXJ2aWNlLnZhbGlkYXRlSWRUb2tlbk5vbmNlKFxyXG4gICAgICAgICAgdG9SZXR1cm4uZGVjb2RlZElkVG9rZW4sXHJcbiAgICAgICAgICBhdXRoTm9uY2UsXHJcbiAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLmlnbm9yZU5vbmNlQWZ0ZXJSZWZyZXNoXHJcbiAgICAgICAgKVxyXG4gICAgICApIHtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnYXV0aG9yaXplZENhbGxiYWNrIGluY29ycmVjdCBub25jZScpO1xyXG4gICAgICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5JbmNvcnJlY3ROb25jZTtcclxuICAgICAgICB0aGlzLmhhbmRsZVVuc3VjY2Vzc2Z1bFZhbGlkYXRpb24oKTtcclxuICAgICAgICByZXR1cm4gdG9SZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghdGhpcy50b2tlblZhbGlkYXRpb25TZXJ2aWNlLnZhbGlkYXRlUmVxdWlyZWRJZFRva2VuKHRvUmV0dXJuLmRlY29kZWRJZFRva2VuKSkge1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnYXV0aG9yaXplZENhbGxiYWNrIFZhbGlkYXRpb24sIG9uZSBvZiB0aGUgUkVRVUlSRUQgcHJvcGVydGllcyBtaXNzaW5nIGZyb20gaWRfdG9rZW4nKTtcclxuICAgICAgICB0b1JldHVybi5zdGF0ZSA9IFZhbGlkYXRpb25SZXN1bHQuUmVxdWlyZWRQcm9wZXJ0eU1pc3Npbmc7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XHJcbiAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoXHJcbiAgICAgICAgIXRoaXMudG9rZW5WYWxpZGF0aW9uU2VydmljZS52YWxpZGF0ZUlkVG9rZW5JYXRNYXhPZmZzZXQoXHJcbiAgICAgICAgICB0b1JldHVybi5kZWNvZGVkSWRUb2tlbixcclxuICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24ubWF4SWRUb2tlbklhdE9mZnNldEFsbG93ZWRJblNlY29uZHMsXHJcbiAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLmRpc2FibGVJYXRPZmZzZXRWYWxpZGF0aW9uXHJcbiAgICAgICAgKVxyXG4gICAgICApIHtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnYXV0aG9yaXplZENhbGxiYWNrIFZhbGlkYXRpb24sIGlhdCByZWplY3RlZCBpZF90b2tlbiB3YXMgaXNzdWVkIHRvbyBmYXIgYXdheSBmcm9tIHRoZSBjdXJyZW50IHRpbWUnKTtcclxuICAgICAgICB0b1JldHVybi5zdGF0ZSA9IFZhbGlkYXRpb25SZXN1bHQuTWF4T2Zmc2V0RXhwaXJlZDtcclxuICAgICAgICB0aGlzLmhhbmRsZVVuc3VjY2Vzc2Z1bFZhbGlkYXRpb24oKTtcclxuICAgICAgICByZXR1cm4gdG9SZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGF1dGhXZWxsS25vd25FbmRQb2ludHMgPSB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZCgnYXV0aFdlbGxLbm93bkVuZFBvaW50cycpO1xyXG5cclxuICAgICAgaWYgKGF1dGhXZWxsS25vd25FbmRQb2ludHMpIHtcclxuICAgICAgICBpZiAodGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5pc3NWYWxpZGF0aW9uT2ZmKSB7XHJcbiAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ2lzcyB2YWxpZGF0aW9uIGlzIHR1cm5lZCBvZmYsIHRoaXMgaXMgbm90IHJlY29tbWVuZGVkIScpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoXHJcbiAgICAgICAgICAhdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5pc3NWYWxpZGF0aW9uT2ZmICYmXHJcbiAgICAgICAgICAhdGhpcy50b2tlblZhbGlkYXRpb25TZXJ2aWNlLnZhbGlkYXRlSWRUb2tlbklzcyh0b1JldHVybi5kZWNvZGVkSWRUb2tlbiwgYXV0aFdlbGxLbm93bkVuZFBvaW50cy5pc3N1ZXIpXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnYXV0aG9yaXplZENhbGxiYWNrIGluY29ycmVjdCBpc3MgZG9lcyBub3QgbWF0Y2ggYXV0aFdlbGxLbm93bkVuZHBvaW50cyBpc3N1ZXInKTtcclxuICAgICAgICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5Jc3NEb2VzTm90TWF0Y2hJc3N1ZXI7XHJcbiAgICAgICAgICB0aGlzLmhhbmRsZVVuc3VjY2Vzc2Z1bFZhbGlkYXRpb24oKTtcclxuICAgICAgICAgIHJldHVybiB0b1JldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2F1dGhXZWxsS25vd25FbmRwb2ludHMgaXMgdW5kZWZpbmVkJyk7XHJcbiAgICAgICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0Lk5vQXV0aFdlbGxLbm93bkVuZFBvaW50cztcclxuICAgICAgICB0aGlzLmhhbmRsZVVuc3VjY2Vzc2Z1bFZhbGlkYXRpb24oKTtcclxuICAgICAgICByZXR1cm4gdG9SZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChcclxuICAgICAgICAhdGhpcy50b2tlblZhbGlkYXRpb25TZXJ2aWNlLnZhbGlkYXRlSWRUb2tlbkF1ZCh0b1JldHVybi5kZWNvZGVkSWRUb2tlbiwgdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5jbGllbnRJZClcclxuICAgICAgKSB7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2F1dGhvcml6ZWRDYWxsYmFjayBpbmNvcnJlY3QgYXVkJyk7XHJcbiAgICAgICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0LkluY29ycmVjdEF1ZDtcclxuICAgICAgICB0aGlzLmhhbmRsZVVuc3VjY2Vzc2Z1bFZhbGlkYXRpb24oKTtcclxuICAgICAgICByZXR1cm4gdG9SZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghdGhpcy50b2tlblZhbGlkYXRpb25TZXJ2aWNlLnZhbGlkYXRlSWRUb2tlbkF6cEV4aXN0c0lmTW9yZVRoYW5PbmVBdWQodG9SZXR1cm4uZGVjb2RlZElkVG9rZW4pKSB7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2F1dGhvcml6ZWRDYWxsYmFjayBtaXNzaW5nIGF6cCcpO1xyXG4gICAgICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5JbmNvcnJlY3RBenA7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XHJcbiAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoXHJcbiAgICAgICAgIXRoaXMudG9rZW5WYWxpZGF0aW9uU2VydmljZS52YWxpZGF0ZUlkVG9rZW5BenBWYWxpZChcclxuICAgICAgICAgIHRvUmV0dXJuLmRlY29kZWRJZFRva2VuLFxyXG4gICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5jbGllbnRJZFxyXG4gICAgICAgIClcclxuICAgICAgKSB7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2F1dGhvcml6ZWRDYWxsYmFjayBpbmNvcnJlY3QgYXpwJyk7XHJcbiAgICAgICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0LkluY29ycmVjdEF6cDtcclxuICAgICAgICB0aGlzLmhhbmRsZVVuc3VjY2Vzc2Z1bFZhbGlkYXRpb24oKTtcclxuICAgICAgICByZXR1cm4gdG9SZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghdGhpcy5pc0lkVG9rZW5BZnRlclJlZnJlc2hUb2tlblJlcXVlc3RWYWxpZChjYWxsYmFja0NvbnRleHQsIHRvUmV0dXJuLmRlY29kZWRJZFRva2VuKSkge1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdhdXRob3JpemVkQ2FsbGJhY2sgcHJlLCBwb3N0IGlkX3Rva2VuIGNsYWltcyBkbyBub3QgbWF0Y2ggaW4gcmVmcmVzaCcpO1xyXG4gICAgICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5JbmNvcnJlY3RJZFRva2VuQ2xhaW1zQWZ0ZXJSZWZyZXNoO1xyXG4gICAgICAgIHRoaXMuaGFuZGxlVW5zdWNjZXNzZnVsVmFsaWRhdGlvbigpO1xyXG4gICAgICAgIHJldHVybiB0b1JldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCF0aGlzLnRva2VuVmFsaWRhdGlvblNlcnZpY2UudmFsaWRhdGVJZFRva2VuRXhwTm90RXhwaXJlZCh0b1JldHVybi5kZWNvZGVkSWRUb2tlbikpIHtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnYXV0aG9yaXplZENhbGxiYWNrIGlkIHRva2VuIGV4cGlyZWQnKTtcclxuICAgICAgICB0b1JldHVybi5zdGF0ZSA9IFZhbGlkYXRpb25SZXN1bHQuVG9rZW5FeHBpcmVkO1xyXG4gICAgICAgIHRoaXMuaGFuZGxlVW5zdWNjZXNzZnVsVmFsaWRhdGlvbigpO1xyXG4gICAgICAgIHJldHVybiB0b1JldHVybjtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdObyBpZF90b2tlbiBmb3VuZCwgc2tpcHBpbmcgaWRfdG9rZW4gdmFsaWRhdGlvbicpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGZsb3cgaWRfdG9rZW5cclxuICAgIGlmICghaXNDdXJyZW50Rmxvd0ltcGxpY2l0Rmxvd1dpdGhBY2Nlc3NUb2tlbiAmJiAhaXNDdXJyZW50Rmxvd0NvZGVGbG93KSB7XHJcbiAgICAgIHRvUmV0dXJuLmF1dGhSZXNwb25zZUlzVmFsaWQgPSB0cnVlO1xyXG4gICAgICB0b1JldHVybi5zdGF0ZSA9IFZhbGlkYXRpb25SZXN1bHQuT2s7XHJcbiAgICAgIHRoaXMuaGFuZGxlU3VjY2Vzc2Z1bFZhbGlkYXRpb24oKTtcclxuICAgICAgdGhpcy5oYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XHJcbiAgICAgIHJldHVybiB0b1JldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBpZFRva2VuSGVhZGVyID0gdGhpcy50b2tlbkhlbHBlclNlcnZpY2UuZ2V0SGVhZGVyRnJvbVRva2VuKHRvUmV0dXJuLmlkVG9rZW4sIGZhbHNlKTtcclxuXHJcbiAgICAvLyBUaGUgYXRfaGFzaCBpcyBvcHRpb25hbCBmb3IgdGhlIGNvZGUgZmxvd1xyXG4gICAgaWYgKGlzQ3VycmVudEZsb3dDb2RlRmxvdyAmJiAhKHRvUmV0dXJuLmRlY29kZWRJZFRva2VuLmF0X2hhc2ggYXMgc3RyaW5nKSkge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ0NvZGUgRmxvdyBhY3RpdmUsIGFuZCBubyBhdF9oYXNoIGluIHRoZSBpZF90b2tlbiwgc2tpcHBpbmcgY2hlY2shJyk7XHJcbiAgICB9IGVsc2UgaWYgKFxyXG4gICAgICAhdGhpcy50b2tlblZhbGlkYXRpb25TZXJ2aWNlLnZhbGlkYXRlSWRUb2tlbkF0SGFzaChcclxuICAgICAgICB0b1JldHVybi5hY2Nlc3NUb2tlbixcclxuICAgICAgICB0b1JldHVybi5kZWNvZGVkSWRUb2tlbi5hdF9oYXNoLFxyXG4gICAgICAgIGlkVG9rZW5IZWFkZXIuYWxnIC8vICdSU0EyNTYnXHJcbiAgICAgICkgfHxcclxuICAgICAgIXRvUmV0dXJuLmFjY2Vzc1Rva2VuXHJcbiAgICApIHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2F1dGhvcml6ZWRDYWxsYmFjayBpbmNvcnJlY3QgYXRfaGFzaCcpO1xyXG4gICAgICB0b1JldHVybi5zdGF0ZSA9IFZhbGlkYXRpb25SZXN1bHQuSW5jb3JyZWN0QXRIYXNoO1xyXG4gICAgICB0aGlzLmhhbmRsZVVuc3VjY2Vzc2Z1bFZhbGlkYXRpb24oKTtcclxuICAgICAgcmV0dXJuIHRvUmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRvUmV0dXJuLmF1dGhSZXNwb25zZUlzVmFsaWQgPSB0cnVlO1xyXG4gICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0Lk9rO1xyXG4gICAgdGhpcy5oYW5kbGVTdWNjZXNzZnVsVmFsaWRhdGlvbigpO1xyXG4gICAgcmV0dXJuIHRvUmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBpc0lkVG9rZW5BZnRlclJlZnJlc2hUb2tlblJlcXVlc3RWYWxpZChjYWxsYmFja0NvbnRleHQ6IENhbGxiYWNrQ29udGV4dCwgbmV3SWRUb2tlbjogYW55KTogYm9vbGVhbiB7XHJcbiAgICBpZiAoIXRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24udXNlUmVmcmVzaFRva2VuKSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghY2FsbGJhY2tDb250ZXh0LmV4aXN0aW5nSWRUb2tlbikge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIGNvbnN0IGRlY29kZWRJZFRva2VuID0gdGhpcy50b2tlbkhlbHBlclNlcnZpY2UuZ2V0UGF5bG9hZEZyb21Ub2tlbihjYWxsYmFja0NvbnRleHQuZXhpc3RpbmdJZFRva2VuLCBmYWxzZSk7XHJcblxyXG4gICAgLy8gVXBvbiBzdWNjZXNzZnVsIHZhbGlkYXRpb24gb2YgdGhlIFJlZnJlc2ggVG9rZW4sIHRoZSByZXNwb25zZSBib2R5IGlzIHRoZSBUb2tlbiBSZXNwb25zZSBvZiBTZWN0aW9uIDMuMS4zLjNcclxuICAgIC8vIGV4Y2VwdCB0aGF0IGl0IG1pZ2h0IG5vdCBjb250YWluIGFuIGlkX3Rva2VuLlxyXG5cclxuICAgIC8vIElmIGFuIElEIFRva2VuIGlzIHJldHVybmVkIGFzIGEgcmVzdWx0IG9mIGEgdG9rZW4gcmVmcmVzaCByZXF1ZXN0LCB0aGUgZm9sbG93aW5nIHJlcXVpcmVtZW50cyBhcHBseTpcclxuXHJcbiAgICAvLyBpdHMgaXNzIENsYWltIFZhbHVlIE1VU1QgYmUgdGhlIHNhbWUgYXMgaW4gdGhlIElEIFRva2VuIGlzc3VlZCB3aGVuIHRoZSBvcmlnaW5hbCBhdXRoZW50aWNhdGlvbiBvY2N1cnJlZCxcclxuICAgIGlmIChkZWNvZGVkSWRUb2tlbi5pc3MgIT09IG5ld0lkVG9rZW4uaXNzKSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgaXNzIGRvIG5vdCBtYXRjaDogJHtkZWNvZGVkSWRUb2tlbi5pc3N9ICR7bmV3SWRUb2tlbi5pc3N9YCk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIC8vIGl0cyBhenAgQ2xhaW0gVmFsdWUgTVVTVCBiZSB0aGUgc2FtZSBhcyBpbiB0aGUgSUQgVG9rZW4gaXNzdWVkIHdoZW4gdGhlIG9yaWdpbmFsIGF1dGhlbnRpY2F0aW9uIG9jY3VycmVkO1xyXG4gICAgLy8gICBpZiBubyBhenAgQ2xhaW0gd2FzIHByZXNlbnQgaW4gdGhlIG9yaWdpbmFsIElEIFRva2VuLCBvbmUgTVVTVCBOT1QgYmUgcHJlc2VudCBpbiB0aGUgbmV3IElEIFRva2VuLCBhbmRcclxuICAgIC8vIG90aGVyd2lzZSwgdGhlIHNhbWUgcnVsZXMgYXBwbHkgYXMgYXBwbHkgd2hlbiBpc3N1aW5nIGFuIElEIFRva2VuIGF0IHRoZSB0aW1lIG9mIHRoZSBvcmlnaW5hbCBhdXRoZW50aWNhdGlvbi5cclxuICAgIGlmIChkZWNvZGVkSWRUb2tlbi5henAgIT09IG5ld0lkVG9rZW4uYXpwKSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgYXpwIGRvIG5vdCBtYXRjaDogJHtkZWNvZGVkSWRUb2tlbi5henB9ICR7bmV3SWRUb2tlbi5henB9YCk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIC8vIGl0cyBzdWIgQ2xhaW0gVmFsdWUgTVVTVCBiZSB0aGUgc2FtZSBhcyBpbiB0aGUgSUQgVG9rZW4gaXNzdWVkIHdoZW4gdGhlIG9yaWdpbmFsIGF1dGhlbnRpY2F0aW9uIG9jY3VycmVkLFxyXG4gICAgaWYgKGRlY29kZWRJZFRva2VuLnN1YiAhPT0gbmV3SWRUb2tlbi5zdWIpIHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBzdWIgZG8gbm90IG1hdGNoOiAke2RlY29kZWRJZFRva2VuLnN1Yn0gJHtuZXdJZFRva2VuLnN1Yn1gKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGl0cyBhdWQgQ2xhaW0gVmFsdWUgTVVTVCBiZSB0aGUgc2FtZSBhcyBpbiB0aGUgSUQgVG9rZW4gaXNzdWVkIHdoZW4gdGhlIG9yaWdpbmFsIGF1dGhlbnRpY2F0aW9uIG9jY3VycmVkLFxyXG4gICAgaWYgKCF0aGlzLmVxdWFsaXR5U2VydmljZS5pc1N0cmluZ0VxdWFsT3JOb25PcmRlcmVkQXJyYXlFcXVhbChkZWNvZGVkSWRUb2tlbj8uYXVkLCBuZXdJZFRva2VuPy5hdWQpKSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgYXVkIGluIG5ldyBpZF90b2tlbiBpcyBub3QgdmFsaWQ6ICcke2RlY29kZWRJZFRva2VuPy5hdWR9JyAnJHtuZXdJZFRva2VuLmF1ZH0nYCk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5kaXNhYmxlUmVmcmVzaElkVG9rZW5BdXRoVGltZVZhbGlkYXRpb24pIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaXRzIGlhdCBDbGFpbSBNVVNUIHJlcHJlc2VudCB0aGUgdGltZSB0aGF0IHRoZSBuZXcgSUQgVG9rZW4gaXMgaXNzdWVkLFxyXG4gICAgLy8gaWYgdGhlIElEIFRva2VuIGNvbnRhaW5zIGFuIGF1dGhfdGltZSBDbGFpbSwgaXRzIHZhbHVlIE1VU1QgcmVwcmVzZW50IHRoZSB0aW1lIG9mIHRoZSBvcmlnaW5hbCBhdXRoZW50aWNhdGlvblxyXG4gICAgLy8gLSBub3QgdGhlIHRpbWUgdGhhdCB0aGUgbmV3IElEIHRva2VuIGlzIGlzc3VlZCxcclxuICAgIGlmIChkZWNvZGVkSWRUb2tlbi5hdXRoX3RpbWUgIT09IG5ld0lkVG9rZW4uYXV0aF90aW1lKSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgYXV0aF90aW1lIGRvIG5vdCBtYXRjaDogJHtkZWNvZGVkSWRUb2tlbi5hdXRoX3RpbWV9ICR7bmV3SWRUb2tlbi5hdXRoX3RpbWV9YCk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlU3VjY2Vzc2Z1bFZhbGlkYXRpb24oKSB7XHJcbiAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2Uud3JpdGUoJ2F1dGhOb25jZScsICcnKTtcclxuXHJcbiAgICBpZiAodGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5hdXRvQ2xlYW5TdGF0ZUFmdGVyQXV0aGVudGljYXRpb24pIHtcclxuICAgICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLndyaXRlKCdhdXRoU3RhdGVDb250cm9sJywgJycpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdBdXRob3JpemVkQ2FsbGJhY2sgdG9rZW4ocykgdmFsaWRhdGVkLCBjb250aW51ZScpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCkge1xyXG4gICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLndyaXRlKCdhdXRoTm9uY2UnLCAnJyk7XHJcblxyXG4gICAgaWYgKHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uYXV0b0NsZWFuU3RhdGVBZnRlckF1dGhlbnRpY2F0aW9uKSB7XHJcbiAgICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZSgnYXV0aFN0YXRlQ29udHJvbCcsICcnKTtcclxuICAgIH1cclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnQXV0aG9yaXplZENhbGxiYWNrIHRva2VuKHMpIGludmFsaWQnKTtcclxuICB9XHJcbn1cclxuIl19