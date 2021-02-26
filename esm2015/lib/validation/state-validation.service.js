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
import * as i8 from "../flows/flows-data.service";
export class StateValidationService {
    constructor(storagePersistanceService, tokenValidationService, tokenHelperService, loggerService, configurationProvider, equalityService, flowHelper, flowsDataService) {
        this.storagePersistanceService = storagePersistanceService;
        this.tokenValidationService = tokenValidationService;
        this.tokenHelperService = tokenHelperService;
        this.loggerService = loggerService;
        this.configurationProvider = configurationProvider;
        this.equalityService = equalityService;
        this.flowHelper = flowHelper;
        this.flowsDataService = flowsDataService;
    }
    getValidatedStateResult(callbackContext) {
        if (callbackContext === null || callbackContext === void 0 ? void 0 : callbackContext.authResult.error) {
            return new StateValidationResult('', '', false, {});
        }
        return this.validateState(callbackContext);
    }
    validateState(callbackContext) {
        const toReturn = new StateValidationResult();
        const authStateControl = this.flowsDataService.getAuthStateControl();
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
StateValidationService.ɵfac = function StateValidationService_Factory(t) { return new (t || StateValidationService)(i0.ɵɵinject(i1.StoragePersistanceService), i0.ɵɵinject(i2.TokenValidationService), i0.ɵɵinject(i3.TokenHelperService), i0.ɵɵinject(i4.LoggerService), i0.ɵɵinject(i5.ConfigurationProvider), i0.ɵɵinject(i6.EqualityService), i0.ɵɵinject(i7.FlowHelper), i0.ɵɵinject(i8.FlowsDataService)); };
StateValidationService.ɵprov = i0.ɵɵdefineInjectable({ token: StateValidationService, factory: StateValidationService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(StateValidationService, [{
        type: Injectable
    }], function () { return [{ type: i1.StoragePersistanceService }, { type: i2.TokenValidationService }, { type: i3.TokenHelperService }, { type: i4.LoggerService }, { type: i5.ConfigurationProvider }, { type: i6.EqualityService }, { type: i7.FlowHelper }, { type: i8.FlowsDataService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGUtdmFsaWRhdGlvbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvIiwic291cmNlcyI6WyJsaWIvdmFsaWRhdGlvbi9zdGF0ZS12YWxpZGF0aW9uLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQVMzQyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUVsRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQzs7Ozs7Ozs7OztBQUd2RCxNQUFNLE9BQU8sc0JBQXNCO0lBQ2pDLFlBQ1UseUJBQW9ELEVBQ3BELHNCQUE4QyxFQUM5QyxrQkFBc0MsRUFDdEMsYUFBNEIsRUFDNUIscUJBQTRDLEVBQzVDLGVBQWdDLEVBQ2hDLFVBQXNCLEVBQ3RCLGdCQUFrQztRQVBsQyw4QkFBeUIsR0FBekIseUJBQXlCLENBQTJCO1FBQ3BELDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBd0I7UUFDOUMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtRQUN0QyxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUM1QiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1FBQzVDLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtRQUNoQyxlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQ3RCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7SUFDekMsQ0FBQztJQUVKLHVCQUF1QixDQUFDLGVBQWdDO1FBQ3RELElBQUksZUFBZSxhQUFmLGVBQWUsdUJBQWYsZUFBZSxDQUFFLFVBQVUsQ0FBQyxLQUFLLEVBQUU7WUFDckMsT0FBTyxJQUFJLHFCQUFxQixDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ3JEO1FBRUQsT0FBTyxJQUFJLENBQUMsYUFB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REFBa0Q7UUFDbEQsSUFBSSxjQUFjLENBQUMsU0FBUyxLQUFLLFVBQVUsQ0FBQyxTQUFTLEVBQUU7WUFDckQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsMkJBQTJCLGNBQWMsQ0FBQyxTQUFTLElBQUksVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7WUFDM0csT0FBTyxLQUFLLENBQUM7U0FDZDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVPLDBCQUEwQjtRQUNoQyxJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUV0RCxJQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxtQkFBbUIsQ0FBQyxpQ0FBaUMsRUFBRTtZQUNwRixJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQzlEO1FBQ0QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsaURBQWlELENBQUMsQ0FBQztJQUNqRixDQUFDO0lBRU8sNEJBQTRCO1FBQ2xDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRXRELElBQUksSUFBSSxDQUFDLHFCQUFxQixDQUFDLG1CQUFtQixDQUFDLGlDQUFpQyxFQUFFO1lBQ3BGLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDOUQ7UUFDRCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7OzRGQS9QVSxzQkFBc0I7OERBQXRCLHNCQUFzQixXQUF0QixzQkFBc0I7a0RBQXRCLHNCQUFzQjtjQURsQyxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuLi9jb25maWcvY29uZmlnLnByb3ZpZGVyJztcclxuaW1wb3J0IHsgQ2FsbGJhY2tDb250ZXh0IH0gZnJvbSAnLi4vZmxvd3MvY2FsbGJhY2stY29udGV4dCc7XHJcbmltcG9ydCB7IEZsb3dzRGF0YVNlcnZpY2UgfSBmcm9tICcuLi9mbG93cy9mbG93cy1kYXRhLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi4vbG9nZ2luZy9sb2dnZXIuc2VydmljZSc7XHJcbmltcG9ydCB7IFN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UgfSBmcm9tICcuLi9zdG9yYWdlL3N0b3JhZ2UtcGVyc2lzdGFuY2Uuc2VydmljZSc7XHJcbmltcG9ydCB7IEVxdWFsaXR5U2VydmljZSB9IGZyb20gJy4uL3V0aWxzL2VxdWFsaXR5L2VxdWFsaXR5LnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBGbG93SGVscGVyIH0gZnJvbSAnLi4vdXRpbHMvZmxvd0hlbHBlci9mbG93LWhlbHBlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgVG9rZW5IZWxwZXJTZXJ2aWNlIH0gZnJvbSAnLi4vdXRpbHMvdG9rZW5IZWxwZXIvb2lkYy10b2tlbi1oZWxwZXIuc2VydmljZSc7XHJcbmltcG9ydCB7IFN0YXRlVmFsaWRhdGlvblJlc3VsdCB9IGZyb20gJy4vc3RhdGUtdmFsaWRhdGlvbi1yZXN1bHQnO1xyXG5pbXBvcnQgeyBUb2tlblZhbGlkYXRpb25TZXJ2aWNlIH0gZnJvbSAnLi90b2tlbi12YWxpZGF0aW9uLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBWYWxpZGF0aW9uUmVzdWx0IH0gZnJvbSAnLi92YWxpZGF0aW9uLXJlc3VsdCc7XHJcblxyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBTdGF0ZVZhbGlkYXRpb25TZXJ2aWNlIHtcclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZTogU3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZSxcclxuICAgIHByaXZhdGUgdG9rZW5WYWxpZGF0aW9uU2VydmljZTogVG9rZW5WYWxpZGF0aW9uU2VydmljZSxcclxuICAgIHByaXZhdGUgdG9rZW5IZWxwZXJTZXJ2aWNlOiBUb2tlbkhlbHBlclNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGNvbmZpZ3VyYXRpb25Qcm92aWRlcjogQ29uZmlndXJhdGlvblByb3ZpZGVyLFxyXG4gICAgcHJpdmF0ZSBlcXVhbGl0eVNlcnZpY2U6IEVxdWFsaXR5U2VydmljZSxcclxuICAgIHByaXZhdGUgZmxvd0hlbHBlcjogRmxvd0hlbHBlcixcclxuICAgIHByaXZhdGUgZmxvd3NEYXRhU2VydmljZTogRmxvd3NEYXRhU2VydmljZVxyXG4gICkge31cclxuXHJcbiAgZ2V0VmFsaWRhdGVkU3RhdGVSZXN1bHQoY2FsbGJhY2tDb250ZXh0OiBDYWxsYmFja0NvbnRleHQpOiBTdGF0ZVZhbGlkYXRpb25SZXN1bHQge1xyXG4gICAgaWYgKGNhbGxiYWNrQ29udGV4dD8uYXV0aFJlc3VsdC5lcnJvcikge1xyXG4gICAgICByZXR1cm4gbmV3IFN0YXRlVmFsaWRhdGlvblJlc3VsdCgnJywgJycsIGZhbHNlLCB7fSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMudmFsaWRhdGVTdGF0ZShjYWxsYmFja0NvbnRleHQpO1xyXG4gIH1cclxuXHJcbiAgdmFsaWRhdGVTdGF0ZShjYWxsYmFja0NvbnRleHQpOiBTdGF0ZVZhbGlkYXRpb25SZXN1bHQge1xyXG4gICAgY29uc3QgdG9SZXR1cm4gPSBuZXcgU3RhdGVWYWxpZGF0aW9uUmVzdWx0KCk7XHJcbiAgICBjb25zdCBhdXRoU3RhdGVDb250cm9sID0gdGhpcy5mbG93c0RhdGFTZXJ2aWNlLmdldEF1dGhTdGF0ZUNvbnRyb2woKTtcclxuXHJcbiAgICBpZiAoIXRoaXMudG9rZW5WYWxpZGF0aW9uU2VydmljZS52YWxpZGF0ZVN0YXRlRnJvbUhhc2hDYWxsYmFjayhjYWxsYmFja0NvbnRleHQuYXV0aFJlc3VsdC5zdGF0ZSwgYXV0aFN0YXRlQ29udHJvbCkpIHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2F1dGhvcml6ZWRDYWxsYmFjayBpbmNvcnJlY3Qgc3RhdGUnKTtcclxuICAgICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0LlN0YXRlc0RvTm90TWF0Y2g7XHJcbiAgICAgIHRoaXMuaGFuZGxlVW5zdWNjZXNzZnVsVmFsaWRhdGlvbigpO1xyXG4gICAgICByZXR1cm4gdG9SZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaXNDdXJyZW50Rmxvd0ltcGxpY2l0Rmxvd1dpdGhBY2Nlc3NUb2tlbiA9IHRoaXMuZmxvd0hlbHBlci5pc0N1cnJlbnRGbG93SW1wbGljaXRGbG93V2l0aEFjY2Vzc1Rva2VuKCk7XHJcbiAgICBjb25zdCBpc0N1cnJlbnRGbG93Q29kZUZsb3cgPSB0aGlzLmZsb3dIZWxwZXIuaXNDdXJyZW50Rmxvd0NvZGVGbG93KCk7XHJcblxyXG4gICAgaWYgKGlzQ3VycmVudEZsb3dJbXBsaWNpdEZsb3dXaXRoQWNjZXNzVG9rZW4gfHwgaXNDdXJyZW50Rmxvd0NvZGVGbG93KSB7XHJcbiAgICAgIHRvUmV0dXJuLmFjY2Vzc1Rva2VuID0gY2FsbGJhY2tDb250ZXh0LmF1dGhSZXN1bHQuYWNjZXNzX3Rva2VuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChjYWxsYmFja0NvbnRleHQuYXV0aFJlc3VsdC5pZF90b2tlbikge1xyXG4gICAgICB0b1JldHVybi5pZFRva2VuID0gY2FsbGJhY2tDb250ZXh0LmF1dGhSZXN1bHQuaWRfdG9rZW47XHJcblxyXG4gICAgICB0b1JldHVybi5kZWNvZGVkSWRUb2tlbiA9IHRoaXMudG9rZW5IZWxwZXJTZXJ2aWNlLmdldFBheWxvYWRGcm9tVG9rZW4odG9SZXR1cm4uaWRUb2tlbiwgZmFsc2UpO1xyXG5cclxuICAgICAgaWYgKCF0aGlzLnRva2VuVmFsaWRhdGlvblNlcnZpY2UudmFsaWRhdGVTaWduYXR1cmVJZFRva2VuKHRvUmV0dXJuLmlkVG9rZW4sIGNhbGxiYWNrQ29udGV4dC5qd3RLZXlzKSkge1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnYXV0aG9yaXplZENhbGxiYWNrIFNpZ25hdHVyZSB2YWxpZGF0aW9uIGZhaWxlZCBpZF90b2tlbicpO1xyXG4gICAgICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5TaWduYXR1cmVGYWlsZWQ7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XHJcbiAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBhdXRoTm9uY2UgPSB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZCgnYXV0aE5vbmNlJyk7XHJcblxyXG4gICAgICBpZiAoXHJcbiAgICAgICAgIXRoaXMudG9rZW5WYWxpZGF0aW9uU2VydmljZS52YWxpZGF0ZUlkVG9rZW5Ob25jZShcclxuICAgICAgICAgIHRvUmV0dXJuLmRlY29kZWRJZFRva2VuLFxyXG4gICAgICAgICAgYXV0aE5vbmNlLFxyXG4gICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5pZ25vcmVOb25jZUFmdGVyUmVmcmVzaFxyXG4gICAgICAgIClcclxuICAgICAgKSB7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2F1dGhvcml6ZWRDYWxsYmFjayBpbmNvcnJlY3Qgbm9uY2UnKTtcclxuICAgICAgICB0b1JldHVybi5zdGF0ZSA9IFZhbGlkYXRpb25SZXN1bHQuSW5jb3JyZWN0Tm9uY2U7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XHJcbiAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIXRoaXMudG9rZW5WYWxpZGF0aW9uU2VydmljZS52YWxpZGF0ZVJlcXVpcmVkSWRUb2tlbih0b1JldHVybi5kZWNvZGVkSWRUb2tlbikpIHtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ2F1dGhvcml6ZWRDYWxsYmFjayBWYWxpZGF0aW9uLCBvbmUgb2YgdGhlIFJFUVVJUkVEIHByb3BlcnRpZXMgbWlzc2luZyBmcm9tIGlkX3Rva2VuJyk7XHJcbiAgICAgICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0LlJlcXVpcmVkUHJvcGVydHlNaXNzaW5nO1xyXG4gICAgICAgIHRoaXMuaGFuZGxlVW5zdWNjZXNzZnVsVmFsaWRhdGlvbigpO1xyXG4gICAgICAgIHJldHVybiB0b1JldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKFxyXG4gICAgICAgICF0aGlzLnRva2VuVmFsaWRhdGlvblNlcnZpY2UudmFsaWRhdGVJZFRva2VuSWF0TWF4T2Zmc2V0KFxyXG4gICAgICAgICAgdG9SZXR1cm4uZGVjb2RlZElkVG9rZW4sXHJcbiAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLm1heElkVG9rZW5JYXRPZmZzZXRBbGxvd2VkSW5TZWNvbmRzLFxyXG4gICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5kaXNhYmxlSWF0T2Zmc2V0VmFsaWRhdGlvblxyXG4gICAgICAgIClcclxuICAgICAgKSB7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2F1dGhvcml6ZWRDYWxsYmFjayBWYWxpZGF0aW9uLCBpYXQgcmVqZWN0ZWQgaWRfdG9rZW4gd2FzIGlzc3VlZCB0b28gZmFyIGF3YXkgZnJvbSB0aGUgY3VycmVudCB0aW1lJyk7XHJcbiAgICAgICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0Lk1heE9mZnNldEV4cGlyZWQ7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XHJcbiAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBhdXRoV2VsbEtub3duRW5kUG9pbnRzID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQoJ2F1dGhXZWxsS25vd25FbmRQb2ludHMnKTtcclxuXHJcbiAgICAgIGlmIChhdXRoV2VsbEtub3duRW5kUG9pbnRzKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uaXNzVmFsaWRhdGlvbk9mZikge1xyXG4gICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdpc3MgdmFsaWRhdGlvbiBpcyB0dXJuZWQgb2ZmLCB0aGlzIGlzIG5vdCByZWNvbW1lbmRlZCEnKTtcclxuICAgICAgICB9IGVsc2UgaWYgKFxyXG4gICAgICAgICAgIXRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uaXNzVmFsaWRhdGlvbk9mZiAmJlxyXG4gICAgICAgICAgIXRoaXMudG9rZW5WYWxpZGF0aW9uU2VydmljZS52YWxpZGF0ZUlkVG9rZW5Jc3ModG9SZXR1cm4uZGVjb2RlZElkVG9rZW4sIGF1dGhXZWxsS25vd25FbmRQb2ludHMuaXNzdWVyKVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2F1dGhvcml6ZWRDYWxsYmFjayBpbmNvcnJlY3QgaXNzIGRvZXMgbm90IG1hdGNoIGF1dGhXZWxsS25vd25FbmRwb2ludHMgaXNzdWVyJyk7XHJcbiAgICAgICAgICB0b1JldHVybi5zdGF0ZSA9IFZhbGlkYXRpb25SZXN1bHQuSXNzRG9lc05vdE1hdGNoSXNzdWVyO1xyXG4gICAgICAgICAgdGhpcy5oYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XHJcbiAgICAgICAgICByZXR1cm4gdG9SZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdhdXRoV2VsbEtub3duRW5kcG9pbnRzIGlzIHVuZGVmaW5lZCcpO1xyXG4gICAgICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5Ob0F1dGhXZWxsS25vd25FbmRQb2ludHM7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XHJcbiAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoXHJcbiAgICAgICAgIXRoaXMudG9rZW5WYWxpZGF0aW9uU2VydmljZS52YWxpZGF0ZUlkVG9rZW5BdWQodG9SZXR1cm4uZGVjb2RlZElkVG9rZW4sIHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uY2xpZW50SWQpXHJcbiAgICAgICkge1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdhdXRob3JpemVkQ2FsbGJhY2sgaW5jb3JyZWN0IGF1ZCcpO1xyXG4gICAgICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5JbmNvcnJlY3RBdWQ7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XHJcbiAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIXRoaXMudG9rZW5WYWxpZGF0aW9uU2VydmljZS52YWxpZGF0ZUlkVG9rZW5BenBFeGlzdHNJZk1vcmVUaGFuT25lQXVkKHRvUmV0dXJuLmRlY29kZWRJZFRva2VuKSkge1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdhdXRob3JpemVkQ2FsbGJhY2sgbWlzc2luZyBhenAnKTtcclxuICAgICAgICB0b1JldHVybi5zdGF0ZSA9IFZhbGlkYXRpb25SZXN1bHQuSW5jb3JyZWN0QXpwO1xyXG4gICAgICAgIHRoaXMuaGFuZGxlVW5zdWNjZXNzZnVsVmFsaWRhdGlvbigpO1xyXG4gICAgICAgIHJldHVybiB0b1JldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKFxyXG4gICAgICAgICF0aGlzLnRva2VuVmFsaWRhdGlvblNlcnZpY2UudmFsaWRhdGVJZFRva2VuQXpwVmFsaWQoXHJcbiAgICAgICAgICB0b1JldHVybi5kZWNvZGVkSWRUb2tlbixcclxuICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uY2xpZW50SWRcclxuICAgICAgICApXHJcbiAgICAgICkge1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdhdXRob3JpemVkQ2FsbGJhY2sgaW5jb3JyZWN0IGF6cCcpO1xyXG4gICAgICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5JbmNvcnJlY3RBenA7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XHJcbiAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIXRoaXMuaXNJZFRva2VuQWZ0ZXJSZWZyZXNoVG9rZW5SZXF1ZXN0VmFsaWQoY2FsbGJhY2tDb250ZXh0LCB0b1JldHVybi5kZWNvZGVkSWRUb2tlbikpIHtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnYXV0aG9yaXplZENhbGxiYWNrIHByZSwgcG9zdCBpZF90b2tlbiBjbGFpbXMgZG8gbm90IG1hdGNoIGluIHJlZnJlc2gnKTtcclxuICAgICAgICB0b1JldHVybi5zdGF0ZSA9IFZhbGlkYXRpb25SZXN1bHQuSW5jb3JyZWN0SWRUb2tlbkNsYWltc0FmdGVyUmVmcmVzaDtcclxuICAgICAgICB0aGlzLmhhbmRsZVVuc3VjY2Vzc2Z1bFZhbGlkYXRpb24oKTtcclxuICAgICAgICByZXR1cm4gdG9SZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghdGhpcy50b2tlblZhbGlkYXRpb25TZXJ2aWNlLnZhbGlkYXRlSWRUb2tlbkV4cE5vdEV4cGlyZWQodG9SZXR1cm4uZGVjb2RlZElkVG9rZW4pKSB7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2F1dGhvcml6ZWRDYWxsYmFjayBpZCB0b2tlbiBleHBpcmVkJyk7XHJcbiAgICAgICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0LlRva2VuRXhwaXJlZDtcclxuICAgICAgICB0aGlzLmhhbmRsZVVuc3VjY2Vzc2Z1bFZhbGlkYXRpb24oKTtcclxuICAgICAgICByZXR1cm4gdG9SZXR1cm47XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnTm8gaWRfdG9rZW4gZm91bmQsIHNraXBwaW5nIGlkX3Rva2VuIHZhbGlkYXRpb24nKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBmbG93IGlkX3Rva2VuXHJcbiAgICBpZiAoIWlzQ3VycmVudEZsb3dJbXBsaWNpdEZsb3dXaXRoQWNjZXNzVG9rZW4gJiYgIWlzQ3VycmVudEZsb3dDb2RlRmxvdykge1xyXG4gICAgICB0b1JldHVybi5hdXRoUmVzcG9uc2VJc1ZhbGlkID0gdHJ1ZTtcclxuICAgICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0Lk9rO1xyXG4gICAgICB0aGlzLmhhbmRsZVN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XHJcbiAgICAgIHRoaXMuaGFuZGxlVW5zdWNjZXNzZnVsVmFsaWRhdGlvbigpO1xyXG4gICAgICByZXR1cm4gdG9SZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaWRUb2tlbkhlYWRlciA9IHRoaXMudG9rZW5IZWxwZXJTZXJ2aWNlLmdldEhlYWRlckZyb21Ub2tlbih0b1JldHVybi5pZFRva2VuLCBmYWxzZSk7XHJcblxyXG4gICAgLy8gVGhlIGF0X2hhc2ggaXMgb3B0aW9uYWwgZm9yIHRoZSBjb2RlIGZsb3dcclxuICAgIGlmIChpc0N1cnJlbnRGbG93Q29kZUZsb3cgJiYgISh0b1JldHVybi5kZWNvZGVkSWRUb2tlbi5hdF9oYXNoIGFzIHN0cmluZykpIHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdDb2RlIEZsb3cgYWN0aXZlLCBhbmQgbm8gYXRfaGFzaCBpbiB0aGUgaWRfdG9rZW4sIHNraXBwaW5nIGNoZWNrIScpO1xyXG4gICAgfSBlbHNlIGlmIChcclxuICAgICAgIXRoaXMudG9rZW5WYWxpZGF0aW9uU2VydmljZS52YWxpZGF0ZUlkVG9rZW5BdEhhc2goXHJcbiAgICAgICAgdG9SZXR1cm4uYWNjZXNzVG9rZW4sXHJcbiAgICAgICAgdG9SZXR1cm4uZGVjb2RlZElkVG9rZW4uYXRfaGFzaCxcclxuICAgICAgICBpZFRva2VuSGVhZGVyLmFsZyAvLyAnUlNBMjU2J1xyXG4gICAgICApIHx8XHJcbiAgICAgICF0b1JldHVybi5hY2Nlc3NUb2tlblxyXG4gICAgKSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdhdXRob3JpemVkQ2FsbGJhY2sgaW5jb3JyZWN0IGF0X2hhc2gnKTtcclxuICAgICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0LkluY29ycmVjdEF0SGFzaDtcclxuICAgICAgdGhpcy5oYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XHJcbiAgICAgIHJldHVybiB0b1JldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0b1JldHVybi5hdXRoUmVzcG9uc2VJc1ZhbGlkID0gdHJ1ZTtcclxuICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5PaztcclxuICAgIHRoaXMuaGFuZGxlU3VjY2Vzc2Z1bFZhbGlkYXRpb24oKTtcclxuICAgIHJldHVybiB0b1JldHVybjtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaXNJZFRva2VuQWZ0ZXJSZWZyZXNoVG9rZW5SZXF1ZXN0VmFsaWQoY2FsbGJhY2tDb250ZXh0OiBDYWxsYmFja0NvbnRleHQsIG5ld0lkVG9rZW46IGFueSk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCF0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnVzZVJlZnJlc2hUb2tlbikge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWNhbGxiYWNrQ29udGV4dC5leGlzdGluZ0lkVG9rZW4pIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBjb25zdCBkZWNvZGVkSWRUb2tlbiA9IHRoaXMudG9rZW5IZWxwZXJTZXJ2aWNlLmdldFBheWxvYWRGcm9tVG9rZW4oY2FsbGJhY2tDb250ZXh0LmV4aXN0aW5nSWRUb2tlbiwgZmFsc2UpO1xyXG5cclxuICAgIC8vIFVwb24gc3VjY2Vzc2Z1bCB2YWxpZGF0aW9uIG9mIHRoZSBSZWZyZXNoIFRva2VuLCB0aGUgcmVzcG9uc2UgYm9keSBpcyB0aGUgVG9rZW4gUmVzcG9uc2Ugb2YgU2VjdGlvbiAzLjEuMy4zXHJcbiAgICAvLyBleGNlcHQgdGhhdCBpdCBtaWdodCBub3QgY29udGFpbiBhbiBpZF90b2tlbi5cclxuXHJcbiAgICAvLyBJZiBhbiBJRCBUb2tlbiBpcyByZXR1cm5lZCBhcyBhIHJlc3VsdCBvZiBhIHRva2VuIHJlZnJlc2ggcmVxdWVzdCwgdGhlIGZvbGxvd2luZyByZXF1aXJlbWVudHMgYXBwbHk6XHJcblxyXG4gICAgLy8gaXRzIGlzcyBDbGFpbSBWYWx1ZSBNVVNUIGJlIHRoZSBzYW1lIGFzIGluIHRoZSBJRCBUb2tlbiBpc3N1ZWQgd2hlbiB0aGUgb3JpZ2luYWwgYXV0aGVudGljYXRpb24gb2NjdXJyZWQsXHJcbiAgICBpZiAoZGVjb2RlZElkVG9rZW4uaXNzICE9PSBuZXdJZFRva2VuLmlzcykge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYGlzcyBkbyBub3QgbWF0Y2g6ICR7ZGVjb2RlZElkVG9rZW4uaXNzfSAke25ld0lkVG9rZW4uaXNzfWApO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICAvLyBpdHMgYXpwIENsYWltIFZhbHVlIE1VU1QgYmUgdGhlIHNhbWUgYXMgaW4gdGhlIElEIFRva2VuIGlzc3VlZCB3aGVuIHRoZSBvcmlnaW5hbCBhdXRoZW50aWNhdGlvbiBvY2N1cnJlZDtcclxuICAgIC8vICAgaWYgbm8gYXpwIENsYWltIHdhcyBwcmVzZW50IGluIHRoZSBvcmlnaW5hbCBJRCBUb2tlbiwgb25lIE1VU1QgTk9UIGJlIHByZXNlbnQgaW4gdGhlIG5ldyBJRCBUb2tlbiwgYW5kXHJcbiAgICAvLyBvdGhlcndpc2UsIHRoZSBzYW1lIHJ1bGVzIGFwcGx5IGFzIGFwcGx5IHdoZW4gaXNzdWluZyBhbiBJRCBUb2tlbiBhdCB0aGUgdGltZSBvZiB0aGUgb3JpZ2luYWwgYXV0aGVudGljYXRpb24uXHJcbiAgICBpZiAoZGVjb2RlZElkVG9rZW4uYXpwICE9PSBuZXdJZFRva2VuLmF6cCkge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYGF6cCBkbyBub3QgbWF0Y2g6ICR7ZGVjb2RlZElkVG9rZW4uYXpwfSAke25ld0lkVG9rZW4uYXpwfWApO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICAvLyBpdHMgc3ViIENsYWltIFZhbHVlIE1VU1QgYmUgdGhlIHNhbWUgYXMgaW4gdGhlIElEIFRva2VuIGlzc3VlZCB3aGVuIHRoZSBvcmlnaW5hbCBhdXRoZW50aWNhdGlvbiBvY2N1cnJlZCxcclxuICAgIGlmIChkZWNvZGVkSWRUb2tlbi5zdWIgIT09IG5ld0lkVG9rZW4uc3ViKSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhgc3ViIGRvIG5vdCBtYXRjaDogJHtkZWNvZGVkSWRUb2tlbi5zdWJ9ICR7bmV3SWRUb2tlbi5zdWJ9YCk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpdHMgYXVkIENsYWltIFZhbHVlIE1VU1QgYmUgdGhlIHNhbWUgYXMgaW4gdGhlIElEIFRva2VuIGlzc3VlZCB3aGVuIHRoZSBvcmlnaW5hbCBhdXRoZW50aWNhdGlvbiBvY2N1cnJlZCxcclxuICAgIGlmICghdGhpcy5lcXVhbGl0eVNlcnZpY2UuaXNTdHJpbmdFcXVhbE9yTm9uT3JkZXJlZEFycmF5RXF1YWwoZGVjb2RlZElkVG9rZW4/LmF1ZCwgbmV3SWRUb2tlbj8uYXVkKSkge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYGF1ZCBpbiBuZXcgaWRfdG9rZW4gaXMgbm90IHZhbGlkOiAnJHtkZWNvZGVkSWRUb2tlbj8uYXVkfScgJyR7bmV3SWRUb2tlbi5hdWR9J2ApO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uZGlzYWJsZVJlZnJlc2hJZFRva2VuQXV0aFRpbWVWYWxpZGF0aW9uKSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGl0cyBpYXQgQ2xhaW0gTVVTVCByZXByZXNlbnQgdGhlIHRpbWUgdGhhdCB0aGUgbmV3IElEIFRva2VuIGlzIGlzc3VlZCxcclxuICAgIC8vIGlmIHRoZSBJRCBUb2tlbiBjb250YWlucyBhbiBhdXRoX3RpbWUgQ2xhaW0sIGl0cyB2YWx1ZSBNVVNUIHJlcHJlc2VudCB0aGUgdGltZSBvZiB0aGUgb3JpZ2luYWwgYXV0aGVudGljYXRpb25cclxuICAgIC8vIC0gbm90IHRoZSB0aW1lIHRoYXQgdGhlIG5ldyBJRCB0b2tlbiBpcyBpc3N1ZWQsXHJcbiAgICBpZiAoZGVjb2RlZElkVG9rZW4uYXV0aF90aW1lICE9PSBuZXdJZFRva2VuLmF1dGhfdGltZSkge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYGF1dGhfdGltZSBkbyBub3QgbWF0Y2g6ICR7ZGVjb2RlZElkVG9rZW4uYXV0aF90aW1lfSAke25ld0lkVG9rZW4uYXV0aF90aW1lfWApO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZVN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCkge1xyXG4gICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLndyaXRlKCdhdXRoTm9uY2UnLCAnJyk7XHJcblxyXG4gICAgaWYgKHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uYXV0b0NsZWFuU3RhdGVBZnRlckF1dGhlbnRpY2F0aW9uKSB7XHJcbiAgICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZSgnYXV0aFN0YXRlQ29udHJvbCcsICcnKTtcclxuICAgIH1cclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnQXV0aG9yaXplZENhbGxiYWNrIHRva2VuKHMpIHZhbGlkYXRlZCwgY29udGludWUnKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlVW5zdWNjZXNzZnVsVmFsaWRhdGlvbigpIHtcclxuICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZSgnYXV0aE5vbmNlJywgJycpO1xyXG5cclxuICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLmF1dG9DbGVhblN0YXRlQWZ0ZXJBdXRoZW50aWNhdGlvbikge1xyXG4gICAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2Uud3JpdGUoJ2F1dGhTdGF0ZUNvbnRyb2wnLCAnJyk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ0F1dGhvcml6ZWRDYWxsYmFjayB0b2tlbihzKSBpbnZhbGlkJyk7XHJcbiAgfVxyXG59XHJcbiJdfQ==