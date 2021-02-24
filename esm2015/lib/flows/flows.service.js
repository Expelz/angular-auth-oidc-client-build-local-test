import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthorizedState } from '../authState/authorized-state';
import { TokenValidationService } from '../validation/token-validation.service';
import { ValidationResult } from '../validation/validation-result';
import * as i0 from "@angular/core";
import * as i1 from "../utils/url/url.service";
import * as i2 from "../logging/logger.service";
import * as i3 from "../validation/token-validation.service";
import * as i4 from "../config/config.provider";
import * as i5 from "../authState/auth-state.service";
import * as i6 from "./flows-data.service";
import * as i7 from "./signin-key-data.service";
import * as i8 from "../api/data.service";
import * as i9 from "../userData/user-service";
import * as i10 from "../validation/state-validation.service";
import * as i11 from "../storage/storage-persistance.service";
export class FlowsService {
    constructor(urlService, loggerService, tokenValidationService, configurationProvider, authStateService, flowsDataService, signinKeyDataService, dataService, userService, stateValidationService, storagePersistanceService) {
        this.urlService = urlService;
        this.loggerService = loggerService;
        this.tokenValidationService = tokenValidationService;
        this.configurationProvider = configurationProvider;
        this.authStateService = authStateService;
        this.flowsDataService = flowsDataService;
        this.signinKeyDataService = signinKeyDataService;
        this.dataService = dataService;
        this.userService = userService;
        this.stateValidationService = stateValidationService;
        this.storagePersistanceService = storagePersistanceService;
    }
    resetAuthorizationData() {
        if (this.configurationProvider.openIDConfiguration.autoUserinfo) {
            // Clear user data. Fixes #97.
            this.userService.resetUserDataInStore();
        }
        this.flowsDataService.resetStorageFlowData();
        this.authStateService.setUnauthorizedAndFireEvent();
    }
    processCodeFlowCallback(urlToCheck) {
        return this.codeFlowCallback(urlToCheck).pipe(switchMap((callbackContext) => this.codeFlowCodeRequest(callbackContext)), switchMap((callbackContext) => this.callbackHistoryAndResetJwtKeys(callbackContext)), switchMap((callbackContext) => this.callbackStateValidation(callbackContext)), switchMap((callbackContext) => this.callbackUser(callbackContext)));
    }
    processSilentRenewCodeFlowCallback(firstContext) {
        return this.codeFlowCodeRequest(firstContext).pipe(switchMap((callbackContext) => this.callbackHistoryAndResetJwtKeys(callbackContext)), switchMap((callbackContext) => this.callbackStateValidation(callbackContext)), switchMap((callbackContext) => this.callbackUser(callbackContext)));
    }
    processImplicitFlowCallback(hash) {
        return this.implicitFlowCallback(hash).pipe(switchMap((callbackContext) => this.callbackHistoryAndResetJwtKeys(callbackContext)), switchMap((callbackContext) => this.callbackStateValidation(callbackContext)), switchMap((callbackContext) => this.callbackUser(callbackContext)));
    }
    processRefreshToken(customParams) {
        return this.refreshSessionWithRefreshTokens().pipe(switchMap((callbackContext) => this.refreshTokensRequestTokens(callbackContext, customParams)), switchMap((callbackContext) => this.callbackHistoryAndResetJwtKeys(callbackContext)), switchMap((callbackContext) => this.callbackStateValidation(callbackContext)), switchMap((callbackContext) => this.callbackUser(callbackContext)));
    }
    // STEP 1 Code Flow
    codeFlowCallback(urlToCheck) {
        const code = this.urlService.getUrlParameter(urlToCheck, 'code');
        const state = this.urlService.getUrlParameter(urlToCheck, 'state');
        const sessionState = this.urlService.getUrlParameter(urlToCheck, 'session_state') || null;
        if (!state) {
            this.loggerService.logDebug('no state in url');
            return throwError('no state in url');
        }
        if (!code) {
            this.loggerService.logDebug('no code in url');
            return throwError('no code in url');
        }
        this.loggerService.logDebug('running validation for callback', urlToCheck);
        const initialCallbackContext = {
            code,
            refreshToken: null,
            state,
            sessionState,
            authResult: null,
            isRenewProcess: false,
            jwtKeys: null,
            validationResult: null,
            existingIdToken: null,
        };
        return of(initialCallbackContext);
    }
    // STEP 1 Implicit Flow
    implicitFlowCallback(hash) {
        const isRenewProcessData = this.flowsDataService.isSilentRenewRunning();
        this.loggerService.logDebug('BEGIN authorizedCallback, no auth data');
        if (!isRenewProcessData) {
            this.resetAuthorizationData();
        }
        hash = hash || window.location.hash.substr(1);
        const authResult = hash.split('&').reduce((resultData, item) => {
            const parts = item.split('=');
            resultData[parts.shift()] = parts.join('=');
            return resultData;
        }, {});
        const callbackContext = {
            code: null,
            refreshToken: null,
            state: null,
            sessionState: null,
            authResult,
            isRenewProcess: isRenewProcessData,
            jwtKeys: null,
            validationResult: null,
            existingIdToken: null,
        };
        return of(callbackContext);
    }
    // STEP 1 Refresh session
    refreshSessionWithRefreshTokens() {
        const stateData = this.flowsDataService.getExistingOrCreateAuthStateControl();
        this.loggerService.logDebug('RefreshSession created. adding myautostate: ' + stateData);
        const refreshToken = this.authStateService.getRefreshToken();
        const idToken = this.authStateService.getIdToken();
        if (refreshToken) {
            const callbackContext = {
                code: null,
                refreshToken,
                state: stateData,
                sessionState: null,
                authResult: null,
                isRenewProcess: true,
                jwtKeys: null,
                validationResult: null,
                existingIdToken: idToken,
            };
            this.loggerService.logDebug('found refresh code, obtaining new credentials with refresh code');
            // Nonce is not used with refresh tokens; but Keycloak may send it anyway
            this.flowsDataService.setNonce(TokenValidationService.refreshTokenNoncePlaceholder);
            return of(callbackContext);
        }
        else {
            const errorMessage = 'no refresh token found, please login';
            this.loggerService.logError(errorMessage);
            return throwError(errorMessage);
        }
    }
    // STEP 2 Refresh Token
    refreshTokensRequestTokens(callbackContext, customParams) {
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
        const authWellKnown = this.storagePersistanceService.read('authWellKnownEndPoints');
        const tokenEndpoint = authWellKnown === null || authWellKnown === void 0 ? void 0 : authWellKnown.tokenEndpoint;
        if (!tokenEndpoint) {
            return throwError('Token Endpoint not defined');
        }
        const data = this.urlService.createBodyForCodeFlowRefreshTokensRequest(callbackContext.refreshToken, customParams);
        return this.dataService.post(tokenEndpoint, data, headers).pipe(switchMap((response) => {
            this.loggerService.logDebug('token refresh response: ', response);
            let authResult = new Object();
            authResult = response;
            authResult.state = callbackContext.state;
            callbackContext.authResult = authResult;
            return of(callbackContext);
        }), catchError((error) => {
            const errorMessage = `OidcService code request ${this.configurationProvider.openIDConfiguration.stsServer}`;
            this.loggerService.logError(errorMessage, error);
            return throwError(errorMessage);
        }));
    }
    // STEP 2 Code Flow //  Code Flow Silent Renew starts here
    codeFlowCodeRequest(callbackContext) {
        const isStateCorrect = this.tokenValidationService.validateStateFromHashCallback(callbackContext.state, this.flowsDataService.getAuthStateControl());
        if (!isStateCorrect) {
            this.loggerService.logWarning('codeFlowCodeRequest incorrect state');
            return throwError('codeFlowCodeRequest incorrect state');
        }
        const authWellKnown = this.storagePersistanceService.read('authWellKnownEndPoints');
        const tokenEndpoint = authWellKnown === null || authWellKnown === void 0 ? void 0 : authWellKnown.tokenEndpoint;
        if (!tokenEndpoint) {
            return throwError('Token Endpoint not defined');
        }
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
        const bodyForCodeFlow = this.urlService.createBodyForCodeFlowCodeRequest(callbackContext.code);
        return this.dataService.post(tokenEndpoint, bodyForCodeFlow, headers).pipe(switchMap((response) => {
            let authResult = new Object();
            authResult = response;
            authResult.state = callbackContext.state;
            authResult.session_state = callbackContext.sessionState;
            callbackContext.authResult = authResult;
            return of(callbackContext);
        }), catchError((error) => {
            const errorMessage = `OidcService code request ${this.configurationProvider.openIDConfiguration.stsServer}`;
            this.loggerService.logError(errorMessage, error);
            return throwError(errorMessage);
        }));
    }
    // STEP 3 Code Flow, STEP 2 Implicit Flow, STEP 3 Refresh Token
    callbackHistoryAndResetJwtKeys(callbackContext) {
        this.storagePersistanceService.write('authnResult', callbackContext.authResult);
        if (this.historyCleanUpTurnedOn() && !callbackContext.isRenewProcess) {
            this.resetBrowserHistory();
        }
        else {
            this.loggerService.logDebug('history clean up inactive');
        }
        if (callbackContext.authResult.error) {
            const errorMessage = `authorizedCallbackProcedure came with error: ${callbackContext.authResult.error}`;
            this.loggerService.logDebug(errorMessage);
            this.resetAuthorizationData();
            this.flowsDataService.setNonce('');
            this.handleResultErrorFromCallback(callbackContext.authResult, callbackContext.isRenewProcess);
            return throwError(errorMessage);
        }
        this.loggerService.logDebug(callbackContext.authResult);
        this.loggerService.logDebug('authorizedCallback created, begin token validation');
        return this.signinKeyDataService.getSigningKeys().pipe(switchMap((jwtKeys) => {
            if (jwtKeys) {
                callbackContext.jwtKeys = jwtKeys;
                return of(callbackContext);
            }
            const errorMessage = `Failed to retrieve signing key`;
            this.loggerService.logWarning(errorMessage);
            return throwError(errorMessage);
        }), catchError((err) => {
            const errorMessage = `Failed to retrieve signing key with error: ${err}`;
            this.loggerService.logWarning(errorMessage);
            return throwError(errorMessage);
        }));
    }
    // STEP 4 All flows
    callbackStateValidation(callbackContext) {
        const validationResult = this.stateValidationService.getValidatedStateResult(callbackContext);
        callbackContext.validationResult = validationResult;
        if (validationResult.authResponseIsValid) {
            this.authStateService.setAuthorizationData(validationResult.accessToken, callbackContext.authResult);
            return of(callbackContext);
        }
        else {
            const errorMessage = `authorizedCallback, token(s) validation failed, resetting. Hash: ${window.location.hash}`;
            this.loggerService.logWarning(errorMessage);
            this.resetAuthorizationData();
            this.publishUnauthorizedState(callbackContext.validationResult, callbackContext.isRenewProcess);
            return throwError(errorMessage);
        }
    }
    // STEP 5 userData
    callbackUser(callbackContext) {
        if (!this.configurationProvider.openIDConfiguration.autoUserinfo) {
            if (!callbackContext.isRenewProcess) {
                // userData is set to the id_token decoded, auto get user data set to false
                this.userService.setUserDataToStore(callbackContext.validationResult.decodedIdToken);
            }
            this.publishAuthorizedState(callbackContext.validationResult, callbackContext.isRenewProcess);
            return of(callbackContext);
        }
        return this.userService
            .getAndPersistUserDataInStore(callbackContext.isRenewProcess, callbackContext.validationResult.idToken, callbackContext.validationResult.decodedIdToken)
            .pipe(switchMap((userData) => {
            if (!!userData) {
                if (!callbackContext.refreshToken) {
                    this.flowsDataService.setSessionState(callbackContext.authResult.session_state);
                }
                this.publishAuthorizedState(callbackContext.validationResult, callbackContext.isRenewProcess);
                return of(callbackContext);
            }
            else {
                this.resetAuthorizationData();
                this.publishUnauthorizedState(callbackContext.validationResult, callbackContext.isRenewProcess);
                const errorMessage = `Called for userData but they were ${userData}`;
                this.loggerService.logWarning(errorMessage);
                return throwError(errorMessage);
            }
        }), catchError((err) => {
            const errorMessage = `Failed to retrieve user info with error:  ${err}`;
            this.loggerService.logWarning(errorMessage);
            return throwError(errorMessage);
        }));
    }
    publishAuthorizedState(stateValidationResult, isRenewProcess) {
        this.authStateService.updateAndPublishAuthState({
            authorizationState: AuthorizedState.Authorized,
            validationResult: stateValidationResult.state,
            isRenewProcess,
        });
    }
    publishUnauthorizedState(stateValidationResult, isRenewProcess) {
        this.authStateService.updateAndPublishAuthState({
            authorizationState: AuthorizedState.Unauthorized,
            validationResult: stateValidationResult.state,
            isRenewProcess,
        });
    }
    handleResultErrorFromCallback(result, isRenewProcess) {
        let validationResult = ValidationResult.SecureTokenServerError;
        if (result.error === 'login_required') {
            validationResult = ValidationResult.LoginRequired;
        }
        this.authStateService.updateAndPublishAuthState({
            authorizationState: AuthorizedState.Unauthorized,
            validationResult,
            isRenewProcess,
        });
    }
    historyCleanUpTurnedOn() {
        return !this.configurationProvider.openIDConfiguration.historyCleanupOff;
    }
    resetBrowserHistory() {
        window.history.replaceState({}, window.document.title, window.location.origin + window.location.pathname);
    }
}
FlowsService.ɵfac = function FlowsService_Factory(t) { return new (t || FlowsService)(i0.ɵɵinject(i1.UrlService), i0.ɵɵinject(i2.LoggerService), i0.ɵɵinject(i3.TokenValidationService), i0.ɵɵinject(i4.ConfigurationProvider), i0.ɵɵinject(i5.AuthStateService), i0.ɵɵinject(i6.FlowsDataService), i0.ɵɵinject(i7.SigninKeyDataService), i0.ɵɵinject(i8.DataService), i0.ɵɵinject(i9.UserService), i0.ɵɵinject(i10.StateValidationService), i0.ɵɵinject(i11.StoragePersistanceService)); };
FlowsService.ɵprov = i0.ɵɵdefineInjectable({ token: FlowsService, factory: FlowsService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(FlowsService, [{
        type: Injectable
    }], function () { return [{ type: i1.UrlService }, { type: i2.LoggerService }, { type: i3.TokenValidationService }, { type: i4.ConfigurationProvider }, { type: i5.AuthStateService }, { type: i6.FlowsDataService }, { type: i7.SigninKeyDataService }, { type: i8.DataService }, { type: i9.UserService }, { type: i10.StateValidationService }, { type: i11.StoragePersistanceService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxvd3Muc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjLyIsInNvdXJjZXMiOlsibGliL2Zsb3dzL2Zsb3dzLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFjLEVBQUUsRUFBRSxVQUFVLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDbEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUd2RCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFRaEUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDaEYsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0saUNBQWlDLENBQUM7Ozs7Ozs7Ozs7Ozs7QUFNbkUsTUFBTSxPQUFPLFlBQVk7SUFDdkIsWUFDbUIsVUFBc0IsRUFDdEIsYUFBNEIsRUFDNUIsc0JBQThDLEVBQzlDLHFCQUE0QyxFQUM1QyxnQkFBa0MsRUFDbEMsZ0JBQWtDLEVBQ2xDLG9CQUEwQyxFQUMxQyxXQUF3QixFQUN4QixXQUF3QixFQUN4QixzQkFBOEMsRUFDOUMseUJBQW9EO1FBVnBELGVBQVUsR0FBVixVQUFVLENBQVk7UUFDdEIsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFDNUIsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF3QjtRQUM5QywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1FBQzVDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1FBQzFDLGdCQUFXLEdBQVgsV0FBVyxD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LENBQUM7SUFFTyx3QkFBd0IsQ0FBQyxxQkFBNEMsRUFBRSxjQUF1QjtRQUNwRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMseUJBQXlCLENBQUM7WUFDOUMsa0JBQWtCLEVBQUUsZUFBZSxDQUFDLFlBQVk7WUFDaEQsZ0JBQWdCLEVBQUUscUJBQXFCLENBQUMsS0FBSztZQUM3QyxjQUFjO1NBQ2YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVPLDZCQUE2QixDQUFDLE1BQVcsRUFBRSxjQUF1QjtRQUN4RSxJQUFJLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDLHNCQUFzQixDQUFDO1FBRS9ELElBQUssTUFBTSxDQUFDLEtBQWdCLEtBQUssZ0JBQWdCLEVBQUU7WUFDakQsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUMsYUFBYSxDQUFDO1NBQ25EO1FBRUQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLHlCQUF5QixDQUFDO1lBQzlDLGtCQUFrQixFQUFFLGVBQWUsQ0FBQyxZQUFZO1lBQ2hELGdCQUFnQjtZQUNoQixjQUFjO1NBQ2YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVPLHNCQUFzQjtRQUM1QixPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLG1CQUFtQixDQUFDLGlCQUFpQixDQUFDO0lBQzNFLENBQUM7SUFFTyxtQkFBbUI7UUFDekIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDNUcsQ0FBQzs7d0VBOVdVLFlBQVk7b0RBQVosWUFBWSxXQUFaLFlBQVk7a0RBQVosWUFBWTtjQUR4QixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSHR0cEhlYWRlcnMgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XHJcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgb2YsIHRocm93RXJyb3IgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgY2F0Y2hFcnJvciwgc3dpdGNoTWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQgeyBEYXRhU2VydmljZSB9IGZyb20gJy4uL2FwaS9kYXRhLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBBdXRoU3RhdGVTZXJ2aWNlIH0gZnJvbSAnLi4vYXV0aFN0YXRlL2F1dGgtc3RhdGUuc2VydmljZSc7XHJcbmltcG9ydCB7IEF1dGhvcml6ZWRTdGF0ZSB9IGZyb20gJy4uL2F1dGhTdGF0ZS9hdXRob3JpemVkLXN0YXRlJztcclxuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi4vY29uZmlnL2NvbmZpZy5wcm92aWRlcic7XHJcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgU3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZSB9IGZyb20gJy4uL3N0b3JhZ2Uvc3RvcmFnZS1wZXJzaXN0YW5jZS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgVXNlclNlcnZpY2UgfSBmcm9tICcuLi91c2VyRGF0YS91c2VyLXNlcnZpY2UnO1xyXG5pbXBvcnQgeyBVcmxTZXJ2aWNlIH0gZnJvbSAnLi4vdXRpbHMvdXJsL3VybC5zZXJ2aWNlJztcclxuaW1wb3J0IHsgU3RhdGVWYWxpZGF0aW9uUmVzdWx0IH0gZnJvbSAnLi4vdmFsaWRhdGlvbi9zdGF0ZS12YWxpZGF0aW9uLXJlc3VsdCc7XHJcbmltcG9ydCB7IFN0YXRlVmFsaWRhdGlvblNlcnZpY2UgfSBmcm9tICcuLi92YWxpZGF0aW9uL3N0YXRlLXZhbGlkYXRpb24uc2VydmljZSc7XHJcbmltcG9ydCB7IFRva2VuVmFsaWRhdGlvblNlcnZpY2UgfSBmcm9tICcuLi92YWxpZGF0aW9uL3Rva2VuLXZhbGlkYXRpb24uc2VydmljZSc7XHJcbmltcG9ydCB7IFZhbGlkYXRpb25SZXN1bHQgfSBmcm9tICcuLi92YWxpZGF0aW9uL3ZhbGlkYXRpb24tcmVzdWx0JztcclxuaW1wb3J0IHsgQ2FsbGJhY2tDb250ZXh0IH0gZnJvbSAnLi9jYWxsYmFjay1jb250ZXh0JztcclxuaW1wb3J0IHsgRmxvd3NEYXRhU2VydmljZSB9IGZyb20gJy4vZmxvd3MtZGF0YS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgU2lnbmluS2V5RGF0YVNlcnZpY2UgfSBmcm9tICcuL3NpZ25pbi1rZXktZGF0YS5zZXJ2aWNlJztcclxuXHJcbkBJbmplY3RhYmxlKClcclxuZXhwb3J0IGNsYXNzIEZsb3dzU2VydmljZSB7XHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IHVybFNlcnZpY2U6IFVybFNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IHRva2VuVmFsaWRhdGlvblNlcnZpY2U6IFRva2VuVmFsaWRhdGlvblNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNvbmZpZ3VyYXRpb25Qcm92aWRlcjogQ29uZmlndXJhdGlvblByb3ZpZGVyLFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBhdXRoU3RhdGVTZXJ2aWNlOiBBdXRoU3RhdGVTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBmbG93c0RhdGFTZXJ2aWNlOiBGbG93c0RhdGFTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBzaWduaW5LZXlEYXRhU2VydmljZTogU2lnbmluS2V5RGF0YVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IGRhdGFTZXJ2aWNlOiBEYXRhU2VydmljZSxcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgdXNlclNlcnZpY2U6IFVzZXJTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBzdGF0ZVZhbGlkYXRpb25TZXJ2aWNlOiBTdGF0ZVZhbGlkYXRpb25TZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBzdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlOiBTdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlXHJcbiAgKSB7fVxyXG5cclxuICByZXNldEF1dGhvcml6YXRpb25EYXRhKCk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uYXV0b1VzZXJpbmZvKSB7XHJcbiAgICAgIC8vIENsZWFyIHVzZXIgZGF0YS4gRml4ZXMgIzk3LlxyXG4gICAgICB0aGlzLnVzZXJTZXJ2aWNlLnJlc2V0VXNlckRhdGFJblN0b3JlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5mbG93c0RhdGFTZXJ2aWNlLnJlc2V0U3RvcmFnZUZsb3dEYXRhKCk7XHJcbiAgICB0aGlzLmF1dGhTdGF0ZVNlcnZpY2Uuc2V0VW5hdXRob3JpemVkQW5kRmlyZUV2ZW50KCk7XHJcbiAgfVxyXG5cclxuICBwcm9jZXNzQ29kZUZsb3dDYWxsYmFjayh1cmxUb0NoZWNrOiBzdHJpbmcpIHtcclxuICAgIHJldHVybiB0aGlzLmNvZGVGbG93Q2FsbGJhY2sodXJsVG9DaGVjaykucGlwZShcclxuICAgICAgc3dpdGNoTWFwKChjYWxsYmFja0NvbnRleHQpID0+IHRoaXMuY29kZUZsb3dDb2RlUmVxdWVzdChjYWxsYmFja0NvbnRleHQpKSxcclxuICAgICAgc3dpdGNoTWFwKChjYWxsYmFja0NvbnRleHQpID0+IHRoaXMuY2FsbGJhY2tIaXN0b3J5QW5kUmVzZXRKd3RLZXlzKGNhbGxiYWNrQ29udGV4dCkpLFxyXG4gICAgICBzd2l0Y2hNYXAoKGNhbGxiYWNrQ29udGV4dCkgPT4gdGhpcy5jYWxsYmFja1N0YXRlVmFsaWRhdGlvbihjYWxsYmFja0NvbnRleHQpKSxcclxuICAgICAgc3dpdGNoTWFwKChjYWxsYmFja0NvbnRleHQpID0+IHRoaXMuY2FsbGJhY2tVc2VyKGNhbGxiYWNrQ29udGV4dCkpXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcHJvY2Vzc1NpbGVudFJlbmV3Q29kZUZsb3dDYWxsYmFjayhmaXJzdENvbnRleHQ6IENhbGxiYWNrQ29udGV4dCkge1xyXG4gICAgcmV0dXJuIHRoaXMuY29kZUZsb3dDb2RlUmVxdWVzdChmaXJzdENvbnRleHQpLnBpcGUoXHJcbiAgICAgIHN3aXRjaE1hcCgoY2FsbGJhY2tDb250ZXh0KSA9PiB0aGlzLmNhbGxiYWNrSGlzdG9yeUFuZFJlc2V0Snd0S2V5cyhjYWxsYmFja0NvbnRleHQpKSxcclxuICAgICAgc3dpdGNoTWFwKChjYWxsYmFja0NvbnRleHQpID0+IHRoaXMuY2FsbGJhY2tTdGF0ZVZhbGlkYXRpb24oY2FsbGJhY2tDb250ZXh0KSksXHJcbiAgICAgIHN3aXRjaE1hcCgoY2FsbGJhY2tDb250ZXh0KSA9PiB0aGlzLmNhbGxiYWNrVXNlcihjYWxsYmFja0NvbnRleHQpKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIHByb2Nlc3NJbXBsaWNpdEZsb3dDYWxsYmFjayhoYXNoPzogc3RyaW5nKSB7XHJcbiAgICByZXR1cm4gdGhpcy5pbXBsaWNpdEZsb3dDYWxsYmFjayhoYXNoKS5waXBlKFxyXG4gICAgICBzd2l0Y2hNYXAoKGNhbGxiYWNrQ29udGV4dCkgPT4gdGhpcy5jYWxsYmFja0hpc3RvcnlBbmRSZXNldEp3dEtleXMoY2FsbGJhY2tDb250ZXh0KSksXHJcbiAgICAgIHN3aXRjaE1hcCgoY2FsbGJhY2tDb250ZXh0KSA9PiB0aGlzLmNhbGxiYWNrU3RhdGVWYWxpZGF0aW9uKGNhbGxiYWNrQ29udGV4dCkpLFxyXG4gICAgICBzd2l0Y2hNYXAoKGNhbGxiYWNrQ29udGV4dCkgPT4gdGhpcy5jYWxsYmFja1VzZXIoY2FsbGJhY2tDb250ZXh0KSlcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBwcm9jZXNzUmVmcmVzaFRva2VuKGN1c3RvbVBhcmFtcz86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB9KSB7XHJcbiAgICByZXR1cm4gdGhpcy5yZWZyZXNoU2Vzc2lvbldpdGhSZWZyZXNoVG9rZW5zKCkucGlwZShcclxuICAgICAgc3dpdGNoTWFwKChjYWxsYmFja0NvbnRleHQpID0+IHRoaXMucmVmcmVzaFRva2Vuc1JlcXVlc3RUb2tlbnMoY2FsbGJhY2tDb250ZXh0LCBjdXN0b21QYXJhbXMpKSxcclxuICAgICAgc3dpdGNoTWFwKChjYWxsYmFja0NvbnRleHQpID0+IHRoaXMuY2FsbGJhY2tIaXN0b3J5QW5kUmVzZXRKd3RLZXlzKGNhbGxiYWNrQ29udGV4dCkpLFxyXG4gICAgICBzd2l0Y2hNYXAoKGNhbGxiYWNrQ29udGV4dCkgPT4gdGhpcy5jYWxsYmFja1N0YXRlVmFsaWRhdGlvbihjYWxsYmFja0NvbnRleHQpKSxcclxuICAgICAgc3dpdGNoTWFwKChjYWxsYmFja0NvbnRleHQpID0+IHRoaXMuY2FsbGJhY2tVc2VyKGNhbGxiYWNrQ29udGV4dCkpXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLy8gU1RFUCAxIENvZGUgRmxvd1xyXG4gIHByaXZhdGUgY29kZUZsb3dDYWxsYmFjayh1cmxUb0NoZWNrOiBzdHJpbmcpOiBPYnNlcnZhYmxlPENhbGxiYWNrQ29udGV4dD4ge1xyXG4gICAgY29uc3QgY29kZSA9IHRoaXMudXJsU2VydmljZS5nZXRVcmxQYXJhbWV0ZXIodXJsVG9DaGVjaywgJ2NvZGUnKTtcclxuICAgIGNvbnN0IHN0YXRlID0gdGhpcy51cmxTZXJ2aWNlLmdldFVybFBhcmFtZXRlcih1cmxUb0NoZWNrLCAnc3RhdGUnKTtcclxuICAgIGNvbnN0IHNlc3Npb25TdGF0ZSA9IHRoaXMudXJsU2VydmljZS5nZXRVcmxQYXJhbWV0ZXIodXJsVG9DaGVjaywgJ3Nlc3Npb25fc3RhdGUnKSB8fCBudWxsO1xyXG5cclxuICAgIGlmICghc3RhdGUpIHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdubyBzdGF0ZSBpbiB1cmwnKTtcclxuICAgICAgcmV0dXJuIHRocm93RXJyb3IoJ25vIHN0YXRlIGluIHVybCcpO1xyXG4gICAgfVxyXG4gICAgaWYgKCFjb2RlKSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zygnbm8gY29kZSBpbiB1cmwnKTtcclxuICAgICAgcmV0dXJuIHRocm93RXJyb3IoJ25vIGNvZGUgaW4gdXJsJyk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ3J1bm5pbmcgdmFsaWRhdGlvbiBmb3IgY2FsbGJhY2snLCB1cmxUb0NoZWNrKTtcclxuXHJcbiAgICBjb25zdCBpbml0aWFsQ2FsbGJhY2tDb250ZXh0ID0ge1xyXG4gICAgICBjb2RlLFxyXG4gICAgICByZWZyZXNoVG9rZW46IG51bGwsXHJcbiAgICAgIHN0YXRlLFxyXG4gICAgICBzZXNzaW9uU3RhdGUsXHJcbiAgICAgIGF1dGhSZXN1bHQ6IG51bGwsXHJcbiAgICAgIGlzUmVuZXdQcm9jZXNzOiBmYWxzZSxcclxuICAgICAgand0S2V5czogbnVsbCxcclxuICAgICAgdmFsaWRhdGlvblJlc3VsdDogbnVsbCxcclxuICAgICAgZXhpc3RpbmdJZFRva2VuOiBudWxsLFxyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gb2YoaW5pdGlhbENhbGxiYWNrQ29udGV4dCk7XHJcbiAgfVxyXG5cclxuICAvLyBTVEVQIDEgSW1wbGljaXQgRmxvd1xyXG4gIHByaXZhdGUgaW1wbGljaXRGbG93Q2FsbGJhY2soaGFzaD86IHN0cmluZyk6IE9ic2VydmFibGU8Q2FsbGJhY2tDb250ZXh0PiB7XHJcbiAgICBjb25zdCBpc1JlbmV3UHJvY2Vzc0RhdGEgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuaXNTaWxlbnRSZW5ld1J1bm5pbmcoKTtcclxuXHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ0JFR0lOIGF1dGhvcml6ZWRDYWxsYmFjaywgbm8gYXV0aCBkYXRhJyk7XHJcbiAgICBpZiAoIWlzUmVuZXdQcm9jZXNzRGF0YSkge1xyXG4gICAgICB0aGlzLnJlc2V0QXV0aG9yaXphdGlvbkRhdGEoKTtcclxuICAgIH1cclxuXHJcbiAgICBoYXNoID0gaGFzaCB8fCB3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHIoMSk7XHJcblxyXG4gICAgY29uc3QgYXV0aFJlc3VsdDogYW55ID0gaGFzaC5zcGxpdCgnJicpLnJlZHVjZSgocmVzdWx0RGF0YTogYW55LCBpdGVtOiBzdHJpbmcpID0+IHtcclxuICAgICAgY29uc3QgcGFydHMgPSBpdGVtLnNwbGl0KCc9Jyk7XHJcbiAgICAgIHJlc3VsdERhdGFbcGFydHMuc2hpZnQoKSBhcyBzdHJpbmddID0gcGFydHMuam9pbignPScpO1xyXG4gICAgICByZXR1cm4gcmVzdWx0RGF0YTtcclxuICAgIH0sIHt9KTtcclxuXHJcbiAgICBjb25zdCBjYWxsYmFja0NvbnRleHQgPSB7XHJcbiAgICAgIGNvZGU6IG51bGwsXHJcbiAgICAgIHJlZnJlc2hUb2tlbjogbnVsbCxcclxuICAgICAgc3RhdGU6IG51bGwsXHJcbiAgICAgIHNlc3Npb25TdGF0ZTogbnVsbCxcclxuICAgICAgYXV0aFJlc3VsdCxcclxuICAgICAgaXNSZW5ld1Byb2Nlc3M6IGlzUmVuZXdQcm9jZXNzRGF0YSxcclxuICAgICAgand0S2V5czogbnVsbCxcclxuICAgICAgdmFsaWRhdGlvblJlc3VsdDogbnVsbCxcclxuICAgICAgZXhpc3RpbmdJZFRva2VuOiBudWxsLFxyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gb2YoY2FsbGJhY2tDb250ZXh0KTtcclxuICB9XHJcblxyXG4gIC8vIFNURVAgMSBSZWZyZXNoIHNlc3Npb25cclxuICBwcml2YXRlIHJlZnJlc2hTZXNzaW9uV2l0aFJlZnJlc2hUb2tlbnMoKTogT2JzZXJ2YWJsZTxDYWxsYmFja0NvbnRleHQ+IHtcclxuICAgIGNvbnN0IHN0YXRlRGF0YSA9IHRoaXMuZmxvd3NEYXRhU2VydmljZS5nZXRFeGlzdGluZ09yQ3JlYXRlQXV0aFN0YXRlQ29udHJvbCgpO1xyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdSZWZyZXNoU2Vzc2lvbiBjcmVhdGVkLiBhZGRpbmcgbXlhdXRvc3RhdGU6ICcgKyBzdGF0ZURhdGEpO1xyXG4gICAgY29uc3QgcmVmcmVzaFRva2VuID0gdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLmdldFJlZnJlc2hUb2tlbigpO1xyXG4gICAgY29uc3QgaWRUb2tlbiA9IHRoaXMuYXV0aFN0YXRlU2VydmljZS5nZXRJZFRva2VuKCk7XHJcblxyXG4gICAgaWYgKHJlZnJlc2hUb2tlbikge1xyXG4gICAgICBjb25zdCBjYWxsYmFja0NvbnRleHQgPSB7XHJcbiAgICAgICAgY29kZTogbnVsbCxcclxuICAgICAgICByZWZyZXNoVG9rZW4sXHJcbiAgICAgICAgc3RhdGU6IHN0YXRlRGF0YSxcclxuICAgICAgICBzZXNzaW9uU3RhdGU6IG51bGwsXHJcbiAgICAgICAgYXV0aFJlc3VsdDogbnVsbCxcclxuICAgICAgICBpc1JlbmV3UHJvY2VzczogdHJ1ZSxcclxuICAgICAgICBqd3RLZXlzOiBudWxsLFxyXG4gICAgICAgIHZhbGlkYXRpb25SZXN1bHQ6IG51bGwsXHJcbiAgICAgICAgZXhpc3RpbmdJZFRva2VuOiBpZFRva2VuLFxyXG4gICAgICB9O1xyXG5cclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdmb3VuZCByZWZyZXNoIGNvZGUsIG9idGFpbmluZyBuZXcgY3JlZGVudGlhbHMgd2l0aCByZWZyZXNoIGNvZGUnKTtcclxuICAgICAgLy8gTm9uY2UgaXMgbm90IHVzZWQgd2l0aCByZWZyZXNoIHRva2VuczsgYnV0IEtleWNsb2FrIG1heSBzZW5kIGl0IGFueXdheVxyXG4gICAgICB0aGlzLmZsb3dzRGF0YVNlcnZpY2Uuc2V0Tm9uY2UoVG9rZW5WYWxpZGF0aW9uU2VydmljZS5yZWZyZXNoVG9rZW5Ob25jZVBsYWNlaG9sZGVyKTtcclxuXHJcbiAgICAgIHJldHVybiBvZihjYWxsYmFja0NvbnRleHQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gJ25vIHJlZnJlc2ggdG9rZW4gZm91bmQsIHBsZWFzZSBsb2dpbic7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihlcnJvck1lc3NhZ2UpO1xyXG4gICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvck1lc3NhZ2UpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gU1RFUCAyIFJlZnJlc2ggVG9rZW5cclxuICBwcml2YXRlIHJlZnJlc2hUb2tlbnNSZXF1ZXN0VG9rZW5zKFxyXG4gICAgY2FsbGJhY2tDb250ZXh0OiBDYWxsYmFja0NvbnRleHQsXHJcbiAgICBjdXN0b21QYXJhbXM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfVxyXG4gICk6IE9ic2VydmFibGU8Q2FsbGJhY2tDb250ZXh0PiB7XHJcbiAgICBsZXQgaGVhZGVyczogSHR0cEhlYWRlcnMgPSBuZXcgSHR0cEhlYWRlcnMoKTtcclxuICAgIGhlYWRlcnMgPSBoZWFkZXJzLnNldCgnQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcpO1xyXG5cclxuICAgIGNvbnN0IGF1dGhXZWxsS25vd24gPSB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZCgnYXV0aFdlbGxLbm93bkVuZFBvaW50cycpO1xyXG4gICAgY29uc3QgdG9rZW5FbmRwb2ludCA9IGF1dGhXZWxsS25vd24/LnRva2VuRW5kcG9pbnQ7XHJcbiAgICBpZiAoIXRva2VuRW5kcG9pbnQpIHtcclxuICAgICAgcmV0dXJuIHRocm93RXJyb3IoJ1Rva2VuIEVuZHBvaW50IG5vdCBkZWZpbmVkJyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZGF0YSA9IHRoaXMudXJsU2VydmljZS5jcmVhdGVCb2R5Rm9yQ29kZUZsb3dSZWZyZXNoVG9rZW5zUmVxdWVzdChjYWxsYmFja0NvbnRleHQucmVmcmVzaFRva2VuLCBjdXN0b21QYXJhbXMpO1xyXG5cclxuICAgIHJldHVybiB0aGlzLmRhdGFTZXJ2aWNlLnBvc3QodG9rZW5FbmRwb2ludCwgZGF0YSwgaGVhZGVycykucGlwZShcclxuICAgICAgc3dpdGNoTWFwKChyZXNwb25zZTogYW55KSA9PiB7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCd0b2tlbiByZWZyZXNoIHJlc3BvbnNlOiAnLCByZXNwb25zZSk7XHJcbiAgICAgICAgbGV0IGF1dGhSZXN1bHQ6IGFueSA9IG5ldyBPYmplY3QoKTtcclxuICAgICAgICBhdXRoUmVzdWx0ID0gcmVzcG9uc2U7XHJcbiAgICAgICAgYXV0aFJlc3VsdC5zdGF0ZSA9IGNhbGxiYWNrQ29udGV4dC5zdGF0ZTtcclxuXHJcbiAgICAgICAgY2FsbGJhY2tDb250ZXh0LmF1dGhSZXN1bHQgPSBhdXRoUmVzdWx0O1xyXG4gICAgICAgIHJldHVybiBvZihjYWxsYmFja0NvbnRleHQpO1xyXG4gICAgICB9KSxcclxuICAgICAgY2F0Y2hFcnJvcigoZXJyb3IpID0+IHtcclxuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgT2lkY1NlcnZpY2UgY29kZSByZXF1ZXN0ICR7dGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5zdHNTZXJ2ZXJ9YDtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoZXJyb3JNZXNzYWdlLCBlcnJvcik7XHJcbiAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoZXJyb3JNZXNzYWdlKTtcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvLyBTVEVQIDIgQ29kZSBGbG93IC8vICBDb2RlIEZsb3cgU2lsZW50IFJlbmV3IHN0YXJ0cyBoZXJlXHJcbiAgcHJpdmF0ZSBjb2RlRmxvd0NvZGVSZXF1ZXN0KGNhbGxiYWNrQ29udGV4dDogQ2FsbGJhY2tDb250ZXh0KTogT2JzZXJ2YWJsZTxDYWxsYmFja0NvbnRleHQ+IHtcclxuICAgIGNvbnN0IGlzU3RhdGVDb3JyZWN0ID0gdGhpcy50b2tlblZhbGlkYXRpb25TZXJ2aWNlLnZhbGlkYXRlU3RhdGVGcm9tSGFzaENhbGxiYWNrKFxyXG4gICAgICBjYWxsYmFja0NvbnRleHQuc3RhdGUsXHJcbiAgICAgIHRoaXMuZmxvd3NEYXRhU2VydmljZS5nZXRBdXRoU3RhdGVDb250cm9sKClcclxuICAgICk7XHJcblxyXG4gICAgaWYgKCFpc1N0YXRlQ29ycmVjdCkge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnY29kZUZsb3dDb2RlUmVxdWVzdCBpbmNvcnJlY3Qgc3RhdGUnKTtcclxuICAgICAgcmV0dXJuIHRocm93RXJyb3IoJ2NvZGVGbG93Q29kZVJlcXVlc3QgaW5jb3JyZWN0IHN0YXRlJyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYXV0aFdlbGxLbm93biA9IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5yZWFkKCdhdXRoV2VsbEtub3duRW5kUG9pbnRzJyk7XHJcbiAgICBjb25zdCB0b2tlbkVuZHBvaW50ID0gYXV0aFdlbGxLbm93bj8udG9rZW5FbmRwb2ludDtcclxuICAgIGlmICghdG9rZW5FbmRwb2ludCkge1xyXG4gICAgICByZXR1cm4gdGhyb3dFcnJvcignVG9rZW4gRW5kcG9pbnQgbm90IGRlZmluZWQnKTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgaGVhZGVyczogSHR0cEhlYWRlcnMgPSBuZXcgSHR0cEhlYWRlcnMoKTtcclxuICAgIGhlYWRlcnMgPSBoZWFkZXJzLnNldCgnQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcpO1xyXG5cclxuICAgIGNvbnN0IGJvZHlGb3JDb2RlRmxvdyA9IHRoaXMudXJsU2VydmljZS5jcmVhdGVCb2R5Rm9yQ29kZUZsb3dDb2RlUmVxdWVzdChjYWxsYmFja0NvbnRleHQuY29kZSk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuZGF0YVNlcnZpY2UucG9zdCh0b2tlbkVuZHBvaW50LCBib2R5Rm9yQ29kZUZsb3csIGhlYWRlcnMpLnBpcGUoXHJcbiAgICAgIHN3aXRjaE1hcCgocmVzcG9uc2UpID0+IHtcclxuICAgICAgICBsZXQgYXV0aFJlc3VsdDogYW55ID0gbmV3IE9iamVjdCgpO1xyXG4gICAgICAgIGF1dGhSZXN1bHQgPSByZXNwb25zZTtcclxuICAgICAgICBhdXRoUmVzdWx0LnN0YXRlID0gY2FsbGJhY2tDb250ZXh0LnN0YXRlO1xyXG4gICAgICAgIGF1dGhSZXN1bHQuc2Vzc2lvbl9zdGF0ZSA9IGNhbGxiYWNrQ29udGV4dC5zZXNzaW9uU3RhdGU7XHJcblxyXG4gICAgICAgIGNhbGxiYWNrQ29udGV4dC5hdXRoUmVzdWx0ID0gYXV0aFJlc3VsdDtcclxuICAgICAgICByZXR1cm4gb2YoY2FsbGJhY2tDb250ZXh0KTtcclxuICAgICAgfSksXHJcbiAgICAgIGNhdGNoRXJyb3IoKGVycm9yKSA9PiB7XHJcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE9pZGNTZXJ2aWNlIGNvZGUgcmVxdWVzdCAke3RoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uc3RzU2VydmVyfWA7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGVycm9yTWVzc2FnZSwgZXJyb3IpO1xyXG4gICAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yTWVzc2FnZSk7XHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLy8gU1RFUCAzIENvZGUgRmxvdywgU1RFUCAyIEltcGxpY2l0IEZsb3csIFNURVAgMyBSZWZyZXNoIFRva2VuXHJcbiAgcHJpdmF0ZSBjYWxsYmFja0hpc3RvcnlBbmRSZXNldEp3dEtleXMoY2FsbGJhY2tDb250ZXh0OiBDYWxsYmFja0NvbnRleHQpOiBPYnNlcnZhYmxlPENhbGxiYWNrQ29udGV4dD4ge1xyXG4gICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLndyaXRlKCdhdXRoblJlc3VsdCcsIGNhbGxiYWNrQ29udGV4dC5hdXRoUmVzdWx0KTtcclxuXHJcbiAgICBpZiAodGhpcy5oaXN0b3J5Q2xlYW5VcFR1cm5lZE9uKCkgJiYgIWNhbGxiYWNrQ29udGV4dC5pc1JlbmV3UHJvY2Vzcykge1xyXG4gICAgICB0aGlzLnJlc2V0QnJvd3Nlckhpc3RvcnkoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnaGlzdG9yeSBjbGVhbiB1cCBpbmFjdGl2ZScpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChjYWxsYmFja0NvbnRleHQuYXV0aFJlc3VsdC5lcnJvcikge1xyXG4gICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgYXV0aG9yaXplZENhbGxiYWNrUHJvY2VkdXJlIGNhbWUgd2l0aCBlcnJvcjogJHtjYWxsYmFja0NvbnRleHQuYXV0aFJlc3VsdC5lcnJvcn1gO1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoZXJyb3JNZXNzYWdlKTtcclxuICAgICAgdGhpcy5yZXNldEF1dGhvcml6YXRpb25EYXRhKCk7XHJcbiAgICAgIHRoaXMuZmxvd3NEYXRhU2VydmljZS5zZXROb25jZSgnJyk7XHJcbiAgICAgIHRoaXMuaGFuZGxlUmVzdWx0RXJyb3JGcm9tQ2FsbGJhY2soY2FsbGJhY2tDb250ZXh0LmF1dGhSZXN1bHQsIGNhbGxiYWNrQ29udGV4dC5pc1JlbmV3UHJvY2Vzcyk7XHJcbiAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yTWVzc2FnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGNhbGxiYWNrQ29udGV4dC5hdXRoUmVzdWx0KTtcclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnYXV0aG9yaXplZENhbGxiYWNrIGNyZWF0ZWQsIGJlZ2luIHRva2VuIHZhbGlkYXRpb24nKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5zaWduaW5LZXlEYXRhU2VydmljZS5nZXRTaWduaW5nS2V5cygpLnBpcGUoXHJcbiAgICAgIHN3aXRjaE1hcCgoand0S2V5cykgPT4ge1xyXG4gICAgICAgIGlmIChqd3RLZXlzKSB7XHJcbiAgICAgICAgICBjYWxsYmFja0NvbnRleHQuand0S2V5cyA9IGp3dEtleXM7XHJcblxyXG4gICAgICAgICAgcmV0dXJuIG9mKGNhbGxiYWNrQ29udGV4dCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgRmFpbGVkIHRvIHJldHJpZXZlIHNpZ25pbmcga2V5YDtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZyhlcnJvck1lc3NhZ2UpO1xyXG4gICAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yTWVzc2FnZSk7XHJcbiAgICAgIH0pLFxyXG4gICAgICBjYXRjaEVycm9yKChlcnIpID0+IHtcclxuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgRmFpbGVkIHRvIHJldHJpZXZlIHNpZ25pbmcga2V5IHdpdGggZXJyb3I6ICR7ZXJyfWA7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoZXJyb3JNZXNzYWdlKTtcclxuICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvck1lc3NhZ2UpO1xyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8vIFNURVAgNCBBbGwgZmxvd3NcclxuICBwcml2YXRlIGNhbGxiYWNrU3RhdGVWYWxpZGF0aW9uKGNhbGxiYWNrQ29udGV4dDogQ2FsbGJhY2tDb250ZXh0KTogT2JzZXJ2YWJsZTxDYWxsYmFja0NvbnRleHQ+IHtcclxuICAgIGNvbnN0IHZhbGlkYXRpb25SZXN1bHQgPSB0aGlzLnN0YXRlVmFsaWRhdGlvblNlcnZpY2UuZ2V0VmFsaWRhdGVkU3RhdGVSZXN1bHQoY2FsbGJhY2tDb250ZXh0KTtcclxuICAgIGNhbGxiYWNrQ29udGV4dC52YWxpZGF0aW9uUmVzdWx0ID0gdmFsaWRhdGlvblJlc3VsdDtcclxuXHJcbiAgICBpZiAodmFsaWRhdGlvblJlc3VsdC5hdXRoUmVzcG9uc2VJc1ZhbGlkKSB7XHJcbiAgICAgIHRoaXMuYXV0aFN0YXRlU2VydmljZS5zZXRBdXRob3JpemF0aW9uRGF0YSh2YWxpZGF0aW9uUmVzdWx0LmFjY2Vzc1Rva2VuLCBjYWxsYmFja0NvbnRleHQuYXV0aFJlc3VsdCk7XHJcbiAgICAgIHJldHVybiBvZihjYWxsYmFja0NvbnRleHQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYGF1dGhvcml6ZWRDYWxsYmFjaywgdG9rZW4ocykgdmFsaWRhdGlvbiBmYWlsZWQsIHJlc2V0dGluZy4gSGFzaDogJHt3aW5kb3cubG9jYXRpb24uaGFzaH1gO1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZyhlcnJvck1lc3NhZ2UpO1xyXG4gICAgICB0aGlzLnJlc2V0QXV0aG9yaXphdGlvbkRhdGEoKTtcclxuICAgICAgdGhpcy5wdWJsaXNoVW5hdXRob3JpemVkU3RhdGUoY2FsbGJhY2tDb250ZXh0LnZhbGlkYXRpb25SZXN1bHQsIGNhbGxiYWNrQ29udGV4dC5pc1JlbmV3UHJvY2Vzcyk7XHJcbiAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yTWVzc2FnZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBTVEVQIDUgdXNlckRhdGFcclxuICBwcml2YXRlIGNhbGxiYWNrVXNlcihjYWxsYmFja0NvbnRleHQ6IENhbGxiYWNrQ29udGV4dCk6IE9ic2VydmFibGU8Q2FsbGJhY2tDb250ZXh0PiB7XHJcbiAgICBpZiAoIXRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uYXV0b1VzZXJpbmZvKSB7XHJcbiAgICAgIGlmICghY2FsbGJhY2tDb250ZXh0LmlzUmVuZXdQcm9jZXNzKSB7XHJcbiAgICAgICAgLy8gdXNlckRhdGEgaXMgc2V0IHRvIHRoZSBpZF90b2tlbiBkZWNvZGVkLCBhdXRvIGdldCB1c2VyIGRhdGEgc2V0IHRvIGZhbHNlXHJcbiAgICAgICAgdGhpcy51c2VyU2VydmljZS5zZXRVc2VyRGF0YVRvU3RvcmUoY2FsbGJhY2tDb250ZXh0LnZhbGlkYXRpb25SZXN1bHQuZGVjb2RlZElkVG9rZW4pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnB1Ymxpc2hBdXRob3JpemVkU3RhdGUoY2FsbGJhY2tDb250ZXh0LnZhbGlkYXRpb25SZXN1bHQsIGNhbGxiYWNrQ29udGV4dC5pc1JlbmV3UHJvY2Vzcyk7XHJcbiAgICAgIHJldHVybiBvZihjYWxsYmFja0NvbnRleHQpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzLnVzZXJTZXJ2aWNlXHJcbiAgICAgIC5nZXRBbmRQZXJzaXN0VXNlckRhdGFJblN0b3JlKFxyXG4gICAgICAgIGNhbGxiYWNrQ29udGV4dC5pc1JlbmV3UHJvY2VzcyxcclxuICAgICAgICBjYWxsYmFja0NvbnRleHQudmFsaWRhdGlvblJlc3VsdC5pZFRva2VuLFxyXG4gICAgICAgIGNhbGxiYWNrQ29udGV4dC52YWxpZGF0aW9uUmVzdWx0LmRlY29kZWRJZFRva2VuXHJcbiAgICAgIClcclxuICAgICAgLnBpcGUoXHJcbiAgICAgICAgc3dpdGNoTWFwKCh1c2VyRGF0YSkgPT4ge1xyXG4gICAgICAgICAgaWYgKCEhdXNlckRhdGEpIHtcclxuICAgICAgICAgICAgaWYgKCFjYWxsYmFja0NvbnRleHQucmVmcmVzaFRva2VuKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5mbG93c0RhdGFTZXJ2aWNlLnNldFNlc3Npb25TdGF0ZShjYWxsYmFja0NvbnRleHQuYXV0aFJlc3VsdC5zZXNzaW9uX3N0YXRlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnB1Ymxpc2hBdXRob3JpemVkU3RhdGUoY2FsbGJhY2tDb250ZXh0LnZhbGlkYXRpb25SZXN1bHQsIGNhbGxiYWNrQ29udGV4dC5pc1JlbmV3UHJvY2Vzcyk7XHJcbiAgICAgICAgICAgIHJldHVybiBvZihjYWxsYmFja0NvbnRleHQpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5yZXNldEF1dGhvcml6YXRpb25EYXRhKCk7XHJcbiAgICAgICAgICAgIHRoaXMucHVibGlzaFVuYXV0aG9yaXplZFN0YXRlKGNhbGxiYWNrQ29udGV4dC52YWxpZGF0aW9uUmVzdWx0LCBjYWxsYmFja0NvbnRleHQuaXNSZW5ld1Byb2Nlc3MpO1xyXG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgQ2FsbGVkIGZvciB1c2VyRGF0YSBidXQgdGhleSB3ZXJlICR7dXNlckRhdGF9YDtcclxuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoZXJyb3JNZXNzYWdlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoZXJyb3JNZXNzYWdlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KSxcclxuICAgICAgICBjYXRjaEVycm9yKChlcnIpID0+IHtcclxuICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBGYWlsZWQgdG8gcmV0cmlldmUgdXNlciBpbmZvIHdpdGggZXJyb3I6ICAke2Vycn1gO1xyXG4gICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoZXJyb3JNZXNzYWdlKTtcclxuICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yTWVzc2FnZSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcHVibGlzaEF1dGhvcml6ZWRTdGF0ZShzdGF0ZVZhbGlkYXRpb25SZXN1bHQ6IFN0YXRlVmFsaWRhdGlvblJlc3VsdCwgaXNSZW5ld1Byb2Nlc3M6IGJvb2xlYW4pIHtcclxuICAgIHRoaXMuYXV0aFN0YXRlU2VydmljZS51cGRhdGVBbmRQdWJsaXNoQXV0aFN0YXRlKHtcclxuICAgICAgYXV0aG9yaXphdGlvblN0YXRlOiBBdXRob3JpemVkU3RhdGUuQXV0aG9yaXplZCxcclxuICAgICAgdmFsaWRhdGlvblJlc3VsdDogc3RhdGVWYWxpZGF0aW9uUmVzdWx0LnN0YXRlLFxyXG4gICAgICBpc1JlbmV3UHJvY2VzcyxcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBwdWJsaXNoVW5hdXRob3JpemVkU3RhdGUoc3RhdGVWYWxpZGF0aW9uUmVzdWx0OiBTdGF0ZVZhbGlkYXRpb25SZXN1bHQsIGlzUmVuZXdQcm9jZXNzOiBib29sZWFuKSB7XHJcbiAgICB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UudXBkYXRlQW5kUHVibGlzaEF1dGhTdGF0ZSh7XHJcbiAgICAgIGF1dGhvcml6YXRpb25TdGF0ZTogQXV0aG9yaXplZFN0YXRlLlVuYXV0aG9yaXplZCxcclxuICAgICAgdmFsaWRhdGlvblJlc3VsdDogc3RhdGVWYWxpZGF0aW9uUmVzdWx0LnN0YXRlLFxyXG4gICAgICBpc1JlbmV3UHJvY2VzcyxcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVSZXN1bHRFcnJvckZyb21DYWxsYmFjayhyZXN1bHQ6IGFueSwgaXNSZW5ld1Byb2Nlc3M6IGJvb2xlYW4pIHtcclxuICAgIGxldCB2YWxpZGF0aW9uUmVzdWx0ID0gVmFsaWRhdGlvblJlc3VsdC5TZWN1cmVUb2tlblNlcnZlckVycm9yO1xyXG5cclxuICAgIGlmICgocmVzdWx0LmVycm9yIGFzIHN0cmluZykgPT09ICdsb2dpbl9yZXF1aXJlZCcpIHtcclxuICAgICAgdmFsaWRhdGlvblJlc3VsdCA9IFZhbGlkYXRpb25SZXN1bHQuTG9naW5SZXF1aXJlZDtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UudXBkYXRlQW5kUHVibGlzaEF1dGhTdGF0ZSh7XHJcbiAgICAgIGF1dGhvcml6YXRpb25TdGF0ZTogQXV0aG9yaXplZFN0YXRlLlVuYXV0aG9yaXplZCxcclxuICAgICAgdmFsaWRhdGlvblJlc3VsdCxcclxuICAgICAgaXNSZW5ld1Byb2Nlc3MsXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGlzdG9yeUNsZWFuVXBUdXJuZWRPbigpIHtcclxuICAgIHJldHVybiAhdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5oaXN0b3J5Q2xlYW51cE9mZjtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcmVzZXRCcm93c2VySGlzdG9yeSgpIHtcclxuICAgIHdpbmRvdy5oaXN0b3J5LnJlcGxhY2VTdGF0ZSh7fSwgd2luZG93LmRvY3VtZW50LnRpdGxlLCB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lKTtcclxuICB9XHJcbn1cclxuIl19