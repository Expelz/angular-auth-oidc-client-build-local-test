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
        return this.codeFlowCodeRequestOnlyForSilentRenew(firstContext).pipe(switchMap((callbackContext) => {
            var _a;
            if (((_a = callbackContext === null || callbackContext === void 0 ? void 0 : callbackContext.validationResult) === null || _a === void 0 ? void 0 : _a.state) === ValidationResult.StatesDoNotMatch) {
                this.loggerService.logError(`processSilentRenewCodeFlowCallback > AFTER TOKEN REQUEST STATES DONT MATCH VALIDATION RESULT = ValidationResult.StatesDoNotMatch`);
                return of(callbackContext);
            }
            return of(callbackContext).pipe(switchMap((callbackContext) => this.callbackHistoryAndResetJwtKeys(callbackContext)), switchMap((callbackContext) => this.callbackStateValidation(callbackContext)), switchMap((callbackContext) => this.callbackUser(callbackContext)));
        }));
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
        const stateData = this.flowsDataService.getExistingOrCreateAuthStateControl('refresh-token');
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
    // STEP 2 Code Flow Silent Renew starts here OUR FLOW
    codeFlowCodeRequestOnlyForSilentRenew(callbackContext) {
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
            const currentState = this.flowsDataService.getAuthStateControl();
            const isStateCorrectAfterTokenRequest = this.tokenValidationService.validateStateFromHashCallback(callbackContext.state, currentState);
            if (!isStateCorrectAfterTokenRequest) {
                this.loggerService.logError(`silentRenewEventHandler > AFTER code request callback > states don't match stateFromUrl: ${callbackContext.state} currentState: ${currentState}`);
                callbackContext.validationResult = {
                    accessToken: null,
                    authResponseIsValid: null,
                    decodedIdToken: null,
                    idToken: null,
                    state: ValidationResult.StatesDoNotMatch
                };
                return (of(callbackContext));
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxvd3Muc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjLyIsInNvdXJjZXMiOlsibGliL2Zsb3dzL2Zsb3dzLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFjLEVBQUUsRUFBRSxVQUFVLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDbEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUd2RCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFRaEUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDaEYsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0saUNBQWlDLENBQUM7Ozs7Ozs7Ozs7Ozs7QUFNbkUsTUFBTSxPQUFPLFlBQVk7SUFDdkIsWUFDbUIsVUFBc0IsRUFDdEIsYUFBNEIsRUFDNUIsc0JBQThDLEVBQzlDLHFCQUE0QyxFQUM1QyxnQkFBa0MsRUFDbEMsZ0JBQWtDLEVBQ2xDLG9CQUEwQyxFQUMxQyxXQUF3QixFQUN4QixXQUF3QixFQUN4QixzQkFBOEMsRUFDOUMseUJBQW9EO1FBVnBELGVBQVUsR0FBVixVQUFVLENBQVk7UUFDdEIsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFDNUIsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF3QjtRQUM5QywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1FBQzVDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1FBQzFDLGdCQUFXLEdBQVgsV0FBVyxD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QUFLLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM1RyxDQUFDOzt3RUF4YlUsWUFBWTtvREFBWixZQUFZLFdBQVosWUFBWTtrREFBWixZQUFZO2NBRHhCLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIdHRwSGVhZGVycyB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcclxuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBvZiwgdGhyb3dFcnJvciB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBjYXRjaEVycm9yLCBzd2l0Y2hNYXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcbmltcG9ydCB7IERhdGFTZXJ2aWNlIH0gZnJvbSAnLi4vYXBpL2RhdGEuc2VydmljZSc7XHJcbmltcG9ydCB7IEF1dGhTdGF0ZVNlcnZpY2UgfSBmcm9tICcuLi9hdXRoU3RhdGUvYXV0aC1zdGF0ZS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgQXV0aG9yaXplZFN0YXRlIH0gZnJvbSAnLi4vYXV0aFN0YXRlL2F1dGhvcml6ZWQtc3RhdGUnO1xyXG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuLi9jb25maWcvY29uZmlnLnByb3ZpZGVyJztcclxuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBTdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlIH0gZnJvbSAnLi4vc3RvcmFnZS9zdG9yYWdlLXBlcnNpc3RhbmNlLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBVc2VyU2VydmljZSB9IGZyb20gJy4uL3VzZXJEYXRhL3VzZXItc2VydmljZSc7XHJcbmltcG9ydCB7IFVybFNlcnZpY2UgfSBmcm9tICcuLi91dGlscy91cmwvdXJsLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBTdGF0ZVZhbGlkYXRpb25SZXN1bHQgfSBmcm9tICcuLi92YWxpZGF0aW9uL3N0YXRlLXZhbGlkYXRpb24tcmVzdWx0JztcclxuaW1wb3J0IHsgU3RhdGVWYWxpZGF0aW9uU2VydmljZSB9IGZyb20gJy4uL3ZhbGlkYXRpb24vc3RhdGUtdmFsaWRhdGlvbi5zZXJ2aWNlJztcclxuaW1wb3J0IHsgVG9rZW5WYWxpZGF0aW9uU2VydmljZSB9IGZyb20gJy4uL3ZhbGlkYXRpb24vdG9rZW4tdmFsaWRhdGlvbi5zZXJ2aWNlJztcclxuaW1wb3J0IHsgVmFsaWRhdGlvblJlc3VsdCB9IGZyb20gJy4uL3ZhbGlkYXRpb24vdmFsaWRhdGlvbi1yZXN1bHQnO1xyXG5pbXBvcnQgeyBDYWxsYmFja0NvbnRleHQgfSBmcm9tICcuL2NhbGxiYWNrLWNvbnRleHQnO1xyXG5pbXBvcnQgeyBGbG93c0RhdGFTZXJ2aWNlIH0gZnJvbSAnLi9mbG93cy1kYXRhLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBTaWduaW5LZXlEYXRhU2VydmljZSB9IGZyb20gJy4vc2lnbmluLWtleS1kYXRhLnNlcnZpY2UnO1xyXG5cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgRmxvd3NTZXJ2aWNlIHtcclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgdXJsU2VydmljZTogVXJsU2VydmljZSxcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZSxcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgdG9rZW5WYWxpZGF0aW9uU2VydmljZTogVG9rZW5WYWxpZGF0aW9uU2VydmljZSxcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgY29uZmlndXJhdGlvblByb3ZpZGVyOiBDb25maWd1cmF0aW9uUHJvdmlkZXIsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IGF1dGhTdGF0ZVNlcnZpY2U6IEF1dGhTdGF0ZVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IGZsb3dzRGF0YVNlcnZpY2U6IEZsb3dzRGF0YVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IHNpZ25pbktleURhdGFTZXJ2aWNlOiBTaWduaW5LZXlEYXRhU2VydmljZSxcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgZGF0YVNlcnZpY2U6IERhdGFTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSB1c2VyU2VydmljZTogVXNlclNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IHN0YXRlVmFsaWRhdGlvblNlcnZpY2U6IFN0YXRlVmFsaWRhdGlvblNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IHN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2U6IFN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2VcclxuICApIHt9XHJcblxyXG4gIHJlc2V0QXV0aG9yaXphdGlvbkRhdGEoKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5hdXRvVXNlcmluZm8pIHtcclxuICAgICAgLy8gQ2xlYXIgdXNlciBkYXRhLiBGaXhlcyAjOTcuXHJcbiAgICAgIHRoaXMudXNlclNlcnZpY2UucmVzZXRVc2VyRGF0YUluU3RvcmUoKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmZsb3dzRGF0YVNlcnZpY2UucmVzZXRTdG9yYWdlRmxvd0RhdGEoKTtcclxuICAgIHRoaXMuYXV0aFN0YXRlU2VydmljZS5zZXRVbmF1dGhvcml6ZWRBbmRGaXJlRXZlbnQoKTtcclxuICB9XHJcblxyXG4gIHByb2Nlc3NDb2RlRmxvd0NhbGxiYWNrKHVybFRvQ2hlY2s6IHN0cmluZykge1xyXG4gICAgcmV0dXJuIHRoaXMuY29kZUZsb3dDYWxsYmFjayh1cmxUb0NoZWNrKS5waXBlKFxyXG4gICAgICBzd2l0Y2hNYXAoKGNhbGxiYWNrQ29udGV4dCkgPT4gdGhpcy5jb2RlRmxvd0NvZGVSZXF1ZXN0KGNhbGxiYWNrQ29udGV4dCkpLFxyXG4gICAgICBzd2l0Y2hNYXAoKGNhbGxiYWNrQ29udGV4dCkgPT4gdGhpcy5jYWxsYmFja0hpc3RvcnlBbmRSZXNldEp3dEtleXMoY2FsbGJhY2tDb250ZXh0KSksXHJcbiAgICAgIHN3aXRjaE1hcCgoY2FsbGJhY2tDb250ZXh0KSA9PiB0aGlzLmNhbGxiYWNrU3RhdGVWYWxpZGF0aW9uKGNhbGxiYWNrQ29udGV4dCkpLFxyXG4gICAgICBzd2l0Y2hNYXAoKGNhbGxiYWNrQ29udGV4dCkgPT4gdGhpcy5jYWxsYmFja1VzZXIoY2FsbGJhY2tDb250ZXh0KSlcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBwcm9jZXNzU2lsZW50UmVuZXdDb2RlRmxvd0NhbGxiYWNrKGZpcnN0Q29udGV4dDogQ2FsbGJhY2tDb250ZXh0KSB7XHJcbiAgICByZXR1cm4gdGhpcy5jb2RlRmxvd0NvZGVSZXF1ZXN0T25seUZvclNpbGVudFJlbmV3KGZpcnN0Q29udGV4dCkucGlwZShcclxuICAgICAgc3dpdGNoTWFwKChjYWxsYmFja0NvbnRleHQpID0+IHtcclxuICAgICAgICBpZiAoY2FsbGJhY2tDb250ZXh0Py52YWxpZGF0aW9uUmVzdWx0Py5zdGF0ZSA9PT0gVmFsaWRhdGlvblJlc3VsdC5TdGF0ZXNEb05vdE1hdGNoKXtcclxuICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihcclxuICAgICAgICAgICAgYHByb2Nlc3NTaWxlbnRSZW5ld0NvZGVGbG93Q2FsbGJhY2sgPiBBRlRFUiBUT0tFTiBSRVFVRVNUIFNUQVRFUyBET05UIE1BVENIIFZBTElEQVRJT04gUkVTVUxUID0gVmFsaWRhdGlvblJlc3VsdC5TdGF0ZXNEb05vdE1hdGNoYFxyXG4gICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICByZXR1cm4gb2YoY2FsbGJhY2tDb250ZXh0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBvZihjYWxsYmFja0NvbnRleHQpLnBpcGUoc3dpdGNoTWFwKChjYWxsYmFja0NvbnRleHQpID0+IHRoaXMuY2FsbGJhY2tIaXN0b3J5QW5kUmVzZXRKd3RLZXlzKGNhbGxiYWNrQ29udGV4dCkpLFxyXG4gICAgICAgICAgc3dpdGNoTWFwKChjYWxsYmFja0NvbnRleHQpID0+IHRoaXMuY2FsbGJhY2tTdGF0ZVZhbGlkYXRpb24oY2FsbGJhY2tDb250ZXh0KSksXHJcbiAgICAgICAgICBzd2l0Y2hNYXAoKGNhbGxiYWNrQ29udGV4dCkgPT4gdGhpcy5jYWxsYmFja1VzZXIoY2FsbGJhY2tDb250ZXh0KSkpXHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcHJvY2Vzc0ltcGxpY2l0Rmxvd0NhbGxiYWNrKGhhc2g/OiBzdHJpbmcpIHtcclxuICAgIHJldHVybiB0aGlzLmltcGxpY2l0Rmxvd0NhbGxiYWNrKGhhc2gpLnBpcGUoXHJcbiAgICAgIHN3aXRjaE1hcCgoY2FsbGJhY2tDb250ZXh0KSA9PiB0aGlzLmNhbGxiYWNrSGlzdG9yeUFuZFJlc2V0Snd0S2V5cyhjYWxsYmFja0NvbnRleHQpKSxcclxuICAgICAgc3dpdGNoTWFwKChjYWxsYmFja0NvbnRleHQpID0+IHRoaXMuY2FsbGJhY2tTdGF0ZVZhbGlkYXRpb24oY2FsbGJhY2tDb250ZXh0KSksXHJcbiAgICAgIHN3aXRjaE1hcCgoY2FsbGJhY2tDb250ZXh0KSA9PiB0aGlzLmNhbGxiYWNrVXNlcihjYWxsYmFja0NvbnRleHQpKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIHByb2Nlc3NSZWZyZXNoVG9rZW4oY3VzdG9tUGFyYW1zPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIH0pIHtcclxuICAgIHJldHVybiB0aGlzLnJlZnJlc2hTZXNzaW9uV2l0aFJlZnJlc2hUb2tlbnMoKS5waXBlKFxyXG4gICAgICBzd2l0Y2hNYXAoKGNhbGxiYWNrQ29udGV4dCkgPT4gdGhpcy5yZWZyZXNoVG9rZW5zUmVxdWVzdFRva2VucyhjYWxsYmFja0NvbnRleHQsIGN1c3RvbVBhcmFtcykpLFxyXG4gICAgICBzd2l0Y2hNYXAoKGNhbGxiYWNrQ29udGV4dCkgPT4gdGhpcy5jYWxsYmFja0hpc3RvcnlBbmRSZXNldEp3dEtleXMoY2FsbGJhY2tDb250ZXh0KSksXHJcbiAgICAgIHN3aXRjaE1hcCgoY2FsbGJhY2tDb250ZXh0KSA9PiB0aGlzLmNhbGxiYWNrU3RhdGVWYWxpZGF0aW9uKGNhbGxiYWNrQ29udGV4dCkpLFxyXG4gICAgICBzd2l0Y2hNYXAoKGNhbGxiYWNrQ29udGV4dCkgPT4gdGhpcy5jYWxsYmFja1VzZXIoY2FsbGJhY2tDb250ZXh0KSlcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvLyBTVEVQIDEgQ29kZSBGbG93XHJcbiAgcHJpdmF0ZSBjb2RlRmxvd0NhbGxiYWNrKHVybFRvQ2hlY2s6IHN0cmluZyk6IE9ic2VydmFibGU8Q2FsbGJhY2tDb250ZXh0PiB7XHJcbiAgICBjb25zdCBjb2RlID0gdGhpcy51cmxTZXJ2aWNlLmdldFVybFBhcmFtZXRlcih1cmxUb0NoZWNrLCAnY29kZScpO1xyXG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLnVybFNlcnZpY2UuZ2V0VXJsUGFyYW1ldGVyKHVybFRvQ2hlY2ssICdzdGF0ZScpO1xyXG4gICAgY29uc3Qgc2Vzc2lvblN0YXRlID0gdGhpcy51cmxTZXJ2aWNlLmdldFVybFBhcmFtZXRlcih1cmxUb0NoZWNrLCAnc2Vzc2lvbl9zdGF0ZScpIHx8IG51bGw7XHJcblxyXG4gICAgaWYgKCFzdGF0ZSkge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ25vIHN0YXRlIGluIHVybCcpO1xyXG4gICAgICByZXR1cm4gdGhyb3dFcnJvcignbm8gc3RhdGUgaW4gdXJsJyk7XHJcbiAgICB9XHJcbiAgICBpZiAoIWNvZGUpIHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdubyBjb2RlIGluIHVybCcpO1xyXG4gICAgICByZXR1cm4gdGhyb3dFcnJvcignbm8gY29kZSBpbiB1cmwnKTtcclxuICAgIH1cclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygncnVubmluZyB2YWxpZGF0aW9uIGZvciBjYWxsYmFjaycsIHVybFRvQ2hlY2spO1xyXG5cclxuICAgIGNvbnN0IGluaXRpYWxDYWxsYmFja0NvbnRleHQgPSB7XHJcbiAgICAgIGNvZGUsXHJcbiAgICAgIHJlZnJlc2hUb2tlbjogbnVsbCxcclxuICAgICAgc3RhdGUsXHJcbiAgICAgIHNlc3Npb25TdGF0ZSxcclxuICAgICAgYXV0aFJlc3VsdDogbnVsbCxcclxuICAgICAgaXNSZW5ld1Byb2Nlc3M6IGZhbHNlLFxyXG4gICAgICBqd3RLZXlzOiBudWxsLFxyXG4gICAgICB2YWxpZGF0aW9uUmVzdWx0OiBudWxsLFxyXG4gICAgICBleGlzdGluZ0lkVG9rZW46IG51bGwsXHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiBvZihpbml0aWFsQ2FsbGJhY2tDb250ZXh0KTtcclxuICB9XHJcblxyXG4gIC8vIFNURVAgMSBJbXBsaWNpdCBGbG93XHJcbiAgcHJpdmF0ZSBpbXBsaWNpdEZsb3dDYWxsYmFjayhoYXNoPzogc3RyaW5nKTogT2JzZXJ2YWJsZTxDYWxsYmFja0NvbnRleHQ+IHtcclxuICAgIGNvbnN0IGlzUmVuZXdQcm9jZXNzRGF0YSA9IHRoaXMuZmxvd3NEYXRhU2VydmljZS5pc1NpbGVudFJlbmV3UnVubmluZygpO1xyXG5cclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnQkVHSU4gYXV0aG9yaXplZENhbGxiYWNrLCBubyBhdXRoIGRhdGEnKTtcclxuICAgIGlmICghaXNSZW5ld1Byb2Nlc3NEYXRhKSB7XHJcbiAgICAgIHRoaXMucmVzZXRBdXRob3JpemF0aW9uRGF0YSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGhhc2ggPSBoYXNoIHx8IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cigxKTtcclxuXHJcbiAgICBjb25zdCBhdXRoUmVzdWx0OiBhbnkgPSBoYXNoLnNwbGl0KCcmJykucmVkdWNlKChyZXN1bHREYXRhOiBhbnksIGl0ZW06IHN0cmluZykgPT4ge1xyXG4gICAgICBjb25zdCBwYXJ0cyA9IGl0ZW0uc3BsaXQoJz0nKTtcclxuICAgICAgcmVzdWx0RGF0YVtwYXJ0cy5zaGlmdCgpIGFzIHN0cmluZ10gPSBwYXJ0cy5qb2luKCc9Jyk7XHJcbiAgICAgIHJldHVybiByZXN1bHREYXRhO1xyXG4gICAgfSwge30pO1xyXG5cclxuICAgIGNvbnN0IGNhbGxiYWNrQ29udGV4dCA9IHtcclxuICAgICAgY29kZTogbnVsbCxcclxuICAgICAgcmVmcmVzaFRva2VuOiBudWxsLFxyXG4gICAgICBzdGF0ZTogbnVsbCxcclxuICAgICAgc2Vzc2lvblN0YXRlOiBudWxsLFxyXG4gICAgICBhdXRoUmVzdWx0LFxyXG4gICAgICBpc1JlbmV3UHJvY2VzczogaXNSZW5ld1Byb2Nlc3NEYXRhLFxyXG4gICAgICBqd3RLZXlzOiBudWxsLFxyXG4gICAgICB2YWxpZGF0aW9uUmVzdWx0OiBudWxsLFxyXG4gICAgICBleGlzdGluZ0lkVG9rZW46IG51bGwsXHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiBvZihjYWxsYmFja0NvbnRleHQpO1xyXG4gIH1cclxuXHJcbiAgLy8gU1RFUCAxIFJlZnJlc2ggc2Vzc2lvblxyXG4gIHByaXZhdGUgcmVmcmVzaFNlc3Npb25XaXRoUmVmcmVzaFRva2VucygpOiBPYnNlcnZhYmxlPENhbGxiYWNrQ29udGV4dD4ge1xyXG4gICAgY29uc3Qgc3RhdGVEYXRhID0gdGhpcy5mbG93c0RhdGFTZXJ2aWNlLmdldEV4aXN0aW5nT3JDcmVhdGVBdXRoU3RhdGVDb250cm9sKCdyZWZyZXNoLXRva2VuJyk7XHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ1JlZnJlc2hTZXNzaW9uIGNyZWF0ZWQuIGFkZGluZyBteWF1dG9zdGF0ZTogJyArIHN0YXRlRGF0YSk7XHJcbiAgICBjb25zdCByZWZyZXNoVG9rZW4gPSB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UuZ2V0UmVmcmVzaFRva2VuKCk7XHJcbiAgICBjb25zdCBpZFRva2VuID0gdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLmdldElkVG9rZW4oKTtcclxuXHJcbiAgICBpZiAocmVmcmVzaFRva2VuKSB7XHJcbiAgICAgIGNvbnN0IGNhbGxiYWNrQ29udGV4dCA9IHtcclxuICAgICAgICBjb2RlOiBudWxsLFxyXG4gICAgICAgIHJlZnJlc2hUb2tlbixcclxuICAgICAgICBzdGF0ZTogc3RhdGVEYXRhLFxyXG4gICAgICAgIHNlc3Npb25TdGF0ZTogbnVsbCxcclxuICAgICAgICBhdXRoUmVzdWx0OiBudWxsLFxyXG4gICAgICAgIGlzUmVuZXdQcm9jZXNzOiB0cnVlLFxyXG4gICAgICAgIGp3dEtleXM6IG51bGwsXHJcbiAgICAgICAgdmFsaWRhdGlvblJlc3VsdDogbnVsbCxcclxuICAgICAgICBleGlzdGluZ0lkVG9rZW46IGlkVG9rZW4sXHJcbiAgICAgIH07XHJcblxyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ2ZvdW5kIHJlZnJlc2ggY29kZSwgb2J0YWluaW5nIG5ldyBjcmVkZW50aWFscyB3aXRoIHJlZnJlc2ggY29kZScpO1xyXG4gICAgICAvLyBOb25jZSBpcyBub3QgdXNlZCB3aXRoIHJlZnJlc2ggdG9rZW5zOyBidXQgS2V5Y2xvYWsgbWF5IHNlbmQgaXQgYW55d2F5XHJcbiAgICAgIHRoaXMuZmxvd3NEYXRhU2VydmljZS5zZXROb25jZShUb2tlblZhbGlkYXRpb25TZXJ2aWNlLnJlZnJlc2hUb2tlbk5vbmNlUGxhY2Vob2xkZXIpO1xyXG5cclxuICAgICAgcmV0dXJuIG9mKGNhbGxiYWNrQ29udGV4dCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSAnbm8gcmVmcmVzaCB0b2tlbiBmb3VuZCwgcGxlYXNlIGxvZ2luJztcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGVycm9yTWVzc2FnZSk7XHJcbiAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yTWVzc2FnZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBTVEVQIDIgUmVmcmVzaCBUb2tlblxyXG4gIHByaXZhdGUgcmVmcmVzaFRva2Vuc1JlcXVlc3RUb2tlbnMoXHJcbiAgICBjYWxsYmFja0NvbnRleHQ6IENhbGxiYWNrQ29udGV4dCxcclxuICAgIGN1c3RvbVBhcmFtcz86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB9XHJcbiAgKTogT2JzZXJ2YWJsZTxDYWxsYmFja0NvbnRleHQ+IHtcclxuICAgIGxldCBoZWFkZXJzOiBIdHRwSGVhZGVycyA9IG5ldyBIdHRwSGVhZGVycygpO1xyXG4gICAgaGVhZGVycyA9IGhlYWRlcnMuc2V0KCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyk7XHJcblxyXG4gICAgY29uc3QgYXV0aFdlbGxLbm93biA9IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5yZWFkKCdhdXRoV2VsbEtub3duRW5kUG9pbnRzJyk7XHJcbiAgICBjb25zdCB0b2tlbkVuZHBvaW50ID0gYXV0aFdlbGxLbm93bj8udG9rZW5FbmRwb2ludDtcclxuICAgIGlmICghdG9rZW5FbmRwb2ludCkge1xyXG4gICAgICByZXR1cm4gdGhyb3dFcnJvcignVG9rZW4gRW5kcG9pbnQgbm90IGRlZmluZWQnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBkYXRhID0gdGhpcy51cmxTZXJ2aWNlLmNyZWF0ZUJvZHlGb3JDb2RlRmxvd1JlZnJlc2hUb2tlbnNSZXF1ZXN0KGNhbGxiYWNrQ29udGV4dC5yZWZyZXNoVG9rZW4sIGN1c3RvbVBhcmFtcyk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuZGF0YVNlcnZpY2UucG9zdCh0b2tlbkVuZHBvaW50LCBkYXRhLCBoZWFkZXJzKS5waXBlKFxyXG4gICAgICBzd2l0Y2hNYXAoKHJlc3BvbnNlOiBhbnkpID0+IHtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ3Rva2VuIHJlZnJlc2ggcmVzcG9uc2U6ICcsIHJlc3BvbnNlKTtcclxuICAgICAgICBsZXQgYXV0aFJlc3VsdDogYW55ID0gbmV3IE9iamVjdCgpO1xyXG4gICAgICAgIGF1dGhSZXN1bHQgPSByZXNwb25zZTtcclxuICAgICAgICBhdXRoUmVzdWx0LnN0YXRlID0gY2FsbGJhY2tDb250ZXh0LnN0YXRlO1xyXG5cclxuICAgICAgICBjYWxsYmFja0NvbnRleHQuYXV0aFJlc3VsdCA9IGF1dGhSZXN1bHQ7XHJcbiAgICAgICAgcmV0dXJuIG9mKGNhbGxiYWNrQ29udGV4dCk7XHJcbiAgICAgIH0pLFxyXG4gICAgICBjYXRjaEVycm9yKChlcnJvcikgPT4ge1xyXG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBPaWRjU2VydmljZSBjb2RlIHJlcXVlc3QgJHt0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnN0c1NlcnZlcn1gO1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihlcnJvck1lc3NhZ2UsIGVycm9yKTtcclxuICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvck1lc3NhZ2UpO1xyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8vIFNURVAgMiBDb2RlIEZsb3cgLy8gIENvZGUgRmxvdyBTaWxlbnQgUmVuZXcgc3RhcnRzIGhlcmVcclxuICBwcml2YXRlIGNvZGVGbG93Q29kZVJlcXVlc3QoY2FsbGJhY2tDb250ZXh0OiBDYWxsYmFja0NvbnRleHQpOiBPYnNlcnZhYmxlPENhbGxiYWNrQ29udGV4dD4ge1xyXG4gICAgY29uc3QgaXNTdGF0ZUNvcnJlY3QgPSB0aGlzLnRva2VuVmFsaWRhdGlvblNlcnZpY2UudmFsaWRhdGVTdGF0ZUZyb21IYXNoQ2FsbGJhY2soXHJcbiAgICAgIGNhbGxiYWNrQ29udGV4dC5zdGF0ZSxcclxuICAgICAgdGhpcy5mbG93c0RhdGFTZXJ2aWNlLmdldEF1dGhTdGF0ZUNvbnRyb2woKVxyXG4gICAgKTtcclxuXHJcbiAgICBpZiAoIWlzU3RhdGVDb3JyZWN0KSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdjb2RlRmxvd0NvZGVSZXF1ZXN0IGluY29ycmVjdCBzdGF0ZScpO1xyXG4gICAgICByZXR1cm4gdGhyb3dFcnJvcignY29kZUZsb3dDb2RlUmVxdWVzdCBpbmNvcnJlY3Qgc3RhdGUnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhdXRoV2VsbEtub3duID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQoJ2F1dGhXZWxsS25vd25FbmRQb2ludHMnKTtcclxuICAgIGNvbnN0IHRva2VuRW5kcG9pbnQgPSBhdXRoV2VsbEtub3duPy50b2tlbkVuZHBvaW50O1xyXG4gICAgaWYgKCF0b2tlbkVuZHBvaW50KSB7XHJcbiAgICAgIHJldHVybiB0aHJvd0Vycm9yKCdUb2tlbiBFbmRwb2ludCBub3QgZGVmaW5lZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBoZWFkZXJzOiBIdHRwSGVhZGVycyA9IG5ldyBIdHRwSGVhZGVycygpO1xyXG4gICAgaGVhZGVycyA9IGhlYWRlcnMuc2V0KCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyk7XHJcblxyXG4gICAgY29uc3QgYm9keUZvckNvZGVGbG93ID0gdGhpcy51cmxTZXJ2aWNlLmNyZWF0ZUJvZHlGb3JDb2RlRmxvd0NvZGVSZXF1ZXN0KGNhbGxiYWNrQ29udGV4dC5jb2RlKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5kYXRhU2VydmljZS5wb3N0KHRva2VuRW5kcG9pbnQsIGJvZHlGb3JDb2RlRmxvdywgaGVhZGVycykucGlwZShcclxuICAgICAgc3dpdGNoTWFwKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgIGxldCBhdXRoUmVzdWx0OiBhbnkgPSBuZXcgT2JqZWN0KCk7XHJcbiAgICAgICAgYXV0aFJlc3VsdCA9IHJlc3BvbnNlO1xyXG4gICAgICAgIGF1dGhSZXN1bHQuc3RhdGUgPSBjYWxsYmFja0NvbnRleHQuc3RhdGU7XHJcbiAgICAgICAgYXV0aFJlc3VsdC5zZXNzaW9uX3N0YXRlID0gY2FsbGJhY2tDb250ZXh0LnNlc3Npb25TdGF0ZTtcclxuXHJcbiAgICAgICAgY2FsbGJhY2tDb250ZXh0LmF1dGhSZXN1bHQgPSBhdXRoUmVzdWx0O1xyXG4gICAgICAgIHJldHVybiBvZihjYWxsYmFja0NvbnRleHQpO1xyXG4gICAgICB9KSxcclxuICAgICAgY2F0Y2hFcnJvcigoZXJyb3IpID0+IHtcclxuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgT2lkY1NlcnZpY2UgY29kZSByZXF1ZXN0ICR7dGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5zdHNTZXJ2ZXJ9YDtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoZXJyb3JNZXNzYWdlLCBlcnJvcik7XHJcbiAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoZXJyb3JNZXNzYWdlKTtcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvLyBTVEVQIDIgQ29kZSBGbG93IFNpbGVudCBSZW5ldyBzdGFydHMgaGVyZSBPVVIgRkxPV1xyXG4gIHByaXZhdGUgY29kZUZsb3dDb2RlUmVxdWVzdE9ubHlGb3JTaWxlbnRSZW5ldyhjYWxsYmFja0NvbnRleHQ6IENhbGxiYWNrQ29udGV4dCk6IE9ic2VydmFibGU8Q2FsbGJhY2tDb250ZXh0PiB7XHJcbiAgICBjb25zdCBpc1N0YXRlQ29ycmVjdCA9IHRoaXMudG9rZW5WYWxpZGF0aW9uU2VydmljZS52YWxpZGF0ZVN0YXRlRnJvbUhhc2hDYWxsYmFjayhcclxuICAgICAgY2FsbGJhY2tDb250ZXh0LnN0YXRlLFxyXG4gICAgICB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuZ2V0QXV0aFN0YXRlQ29udHJvbCgpXHJcbiAgICApO1xyXG5cclxuICAgIGlmICghaXNTdGF0ZUNvcnJlY3QpIHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2NvZGVGbG93Q29kZVJlcXVlc3QgaW5jb3JyZWN0IHN0YXRlJyk7XHJcbiAgICAgIHJldHVybiB0aHJvd0Vycm9yKCdjb2RlRmxvd0NvZGVSZXF1ZXN0IGluY29ycmVjdCBzdGF0ZScpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGF1dGhXZWxsS25vd24gPSB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZCgnYXV0aFdlbGxLbm93bkVuZFBvaW50cycpO1xyXG4gICAgY29uc3QgdG9rZW5FbmRwb2ludCA9IGF1dGhXZWxsS25vd24/LnRva2VuRW5kcG9pbnQ7XHJcbiAgICBpZiAoIXRva2VuRW5kcG9pbnQpIHtcclxuICAgICAgcmV0dXJuIHRocm93RXJyb3IoJ1Rva2VuIEVuZHBvaW50IG5vdCBkZWZpbmVkJyk7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGhlYWRlcnM6IEh0dHBIZWFkZXJzID0gbmV3IEh0dHBIZWFkZXJzKCk7XHJcbiAgICBoZWFkZXJzID0gaGVhZGVycy5zZXQoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnKTtcclxuXHJcbiAgICBjb25zdCBib2R5Rm9yQ29kZUZsb3cgPSB0aGlzLnVybFNlcnZpY2UuY3JlYXRlQm9keUZvckNvZGVGbG93Q29kZVJlcXVlc3QoY2FsbGJhY2tDb250ZXh0LmNvZGUpO1xyXG5cclxuICAgIHJldHVybiB0aGlzLmRhdGFTZXJ2aWNlLnBvc3QodG9rZW5FbmRwb2ludCwgYm9keUZvckNvZGVGbG93LCBoZWFkZXJzKS5waXBlKFxyXG4gICAgICBzd2l0Y2hNYXAoKHJlc3BvbnNlKSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRTdGF0ZSA9IHRoaXMuZmxvd3NEYXRhU2VydmljZS5nZXRBdXRoU3RhdGVDb250cm9sKCk7XHJcbiAgICAgICAgY29uc3QgaXNTdGF0ZUNvcnJlY3RBZnRlclRva2VuUmVxdWVzdCA9IHRoaXMudG9rZW5WYWxpZGF0aW9uU2VydmljZS52YWxpZGF0ZVN0YXRlRnJvbUhhc2hDYWxsYmFjayhcclxuICAgICAgICAgIGNhbGxiYWNrQ29udGV4dC5zdGF0ZSxcclxuICAgICAgICAgIGN1cnJlbnRTdGF0ZVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmICghaXNTdGF0ZUNvcnJlY3RBZnRlclRva2VuUmVxdWVzdCkge1xyXG4gICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKFxyXG4gICAgICAgICAgICBgc2lsZW50UmVuZXdFdmVudEhhbmRsZXIgPiBBRlRFUiBjb2RlIHJlcXVlc3QgY2FsbGJhY2sgPiBzdGF0ZXMgZG9uJ3QgbWF0Y2ggc3RhdGVGcm9tVXJsOiAke2NhbGxiYWNrQ29udGV4dC5zdGF0ZX0gY3VycmVudFN0YXRlOiAke2N1cnJlbnRTdGF0ZX1gXHJcbiAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgIGNhbGxiYWNrQ29udGV4dC52YWxpZGF0aW9uUmVzdWx0ID0ge1xyXG4gICAgICAgICAgICBhY2Nlc3NUb2tlbjogbnVsbCxcclxuICAgICAgICAgICAgYXV0aFJlc3BvbnNlSXNWYWxpZDogbnVsbCxcclxuICAgICAgICAgICAgZGVjb2RlZElkVG9rZW46IG51bGwsXHJcbiAgICAgICAgICAgIGlkVG9rZW46IG51bGwsXHJcbiAgICAgICAgICAgIHN0YXRlOiBWYWxpZGF0aW9uUmVzdWx0LlN0YXRlc0RvTm90TWF0Y2hcclxuICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgcmV0dXJuKG9mKGNhbGxiYWNrQ29udGV4dCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGF1dGhSZXN1bHQ6IGFueSA9IG5ldyBPYmplY3QoKTtcclxuICAgICAgICBhdXRoUmVzdWx0ID0gcmVzcG9uc2U7XHJcbiAgICAgICAgYXV0aFJlc3VsdC5zdGF0ZSA9IGNhbGxiYWNrQ29udGV4dC5zdGF0ZTtcclxuICAgICAgICBhdXRoUmVzdWx0LnNlc3Npb25fc3RhdGUgPSBjYWxsYmFja0NvbnRleHQuc2Vzc2lvblN0YXRlO1xyXG5cclxuICAgICAgICBjYWxsYmFja0NvbnRleHQuYXV0aFJlc3VsdCA9IGF1dGhSZXN1bHQ7XHJcbiAgICAgICAgcmV0dXJuIG9mKGNhbGxiYWNrQ29udGV4dCk7XHJcbiAgICAgIH0pLFxyXG4gICAgICBjYXRjaEVycm9yKChlcnJvcikgPT4ge1xyXG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBPaWRjU2VydmljZSBjb2RlIHJlcXVlc3QgJHt0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnN0c1NlcnZlcn1gO1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihlcnJvck1lc3NhZ2UsIGVycm9yKTtcclxuICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvck1lc3NhZ2UpO1xyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8vIFNURVAgMyBDb2RlIEZsb3csIFNURVAgMiBJbXBsaWNpdCBGbG93LCBTVEVQIDMgUmVmcmVzaCBUb2tlblxyXG4gIHByaXZhdGUgY2FsbGJhY2tIaXN0b3J5QW5kUmVzZXRKd3RLZXlzKGNhbGxiYWNrQ29udGV4dDogQ2FsbGJhY2tDb250ZXh0KTogT2JzZXJ2YWJsZTxDYWxsYmFja0NvbnRleHQ+IHtcclxuICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZSgnYXV0aG5SZXN1bHQnLCBjYWxsYmFja0NvbnRleHQuYXV0aFJlc3VsdCk7XHJcblxyXG4gICAgaWYgKHRoaXMuaGlzdG9yeUNsZWFuVXBUdXJuZWRPbigpICYmICFjYWxsYmFja0NvbnRleHQuaXNSZW5ld1Byb2Nlc3MpIHtcclxuICAgICAgdGhpcy5yZXNldEJyb3dzZXJIaXN0b3J5KCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ2hpc3RvcnkgY2xlYW4gdXAgaW5hY3RpdmUnKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoY2FsbGJhY2tDb250ZXh0LmF1dGhSZXN1bHQuZXJyb3IpIHtcclxuICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYGF1dGhvcml6ZWRDYWxsYmFja1Byb2NlZHVyZSBjYW1lIHdpdGggZXJyb3I6ICR7Y2FsbGJhY2tDb250ZXh0LmF1dGhSZXN1bHQuZXJyb3J9YDtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGVycm9yTWVzc2FnZSk7XHJcbiAgICAgIHRoaXMucmVzZXRBdXRob3JpemF0aW9uRGF0YSgpO1xyXG4gICAgICB0aGlzLmZsb3dzRGF0YVNlcnZpY2Uuc2V0Tm9uY2UoJycpO1xyXG4gICAgICB0aGlzLmhhbmRsZVJlc3VsdEVycm9yRnJvbUNhbGxiYWNrKGNhbGxiYWNrQ29udGV4dC5hdXRoUmVzdWx0LCBjYWxsYmFja0NvbnRleHQuaXNSZW5ld1Byb2Nlc3MpO1xyXG4gICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvck1lc3NhZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhjYWxsYmFja0NvbnRleHQuYXV0aFJlc3VsdCk7XHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ2F1dGhvcml6ZWRDYWxsYmFjayBjcmVhdGVkLCBiZWdpbiB0b2tlbiB2YWxpZGF0aW9uJyk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuc2lnbmluS2V5RGF0YVNlcnZpY2UuZ2V0U2lnbmluZ0tleXMoKS5waXBlKFxyXG4gICAgICBzd2l0Y2hNYXAoKGp3dEtleXMpID0+IHtcclxuICAgICAgICBpZiAoand0S2V5cykge1xyXG4gICAgICAgICAgY2FsbGJhY2tDb250ZXh0Lmp3dEtleXMgPSBqd3RLZXlzO1xyXG5cclxuICAgICAgICAgIHJldHVybiBvZihjYWxsYmFja0NvbnRleHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEZhaWxlZCB0byByZXRyaWV2ZSBzaWduaW5nIGtleWA7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoZXJyb3JNZXNzYWdlKTtcclxuICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvck1lc3NhZ2UpO1xyXG4gICAgICB9KSxcclxuICAgICAgY2F0Y2hFcnJvcigoZXJyKSA9PiB7XHJcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEZhaWxlZCB0byByZXRyaWV2ZSBzaWduaW5nIGtleSB3aXRoIGVycm9yOiAke2Vycn1gO1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKGVycm9yTWVzc2FnZSk7XHJcbiAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoZXJyb3JNZXNzYWdlKTtcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvLyBTVEVQIDQgQWxsIGZsb3dzXHJcbiAgcHJpdmF0ZSBjYWxsYmFja1N0YXRlVmFsaWRhdGlvbihjYWxsYmFja0NvbnRleHQ6IENhbGxiYWNrQ29udGV4dCk6IE9ic2VydmFibGU8Q2FsbGJhY2tDb250ZXh0PiB7XHJcbiAgICBjb25zdCB2YWxpZGF0aW9uUmVzdWx0ID0gdGhpcy5zdGF0ZVZhbGlkYXRpb25TZXJ2aWNlLmdldFZhbGlkYXRlZFN0YXRlUmVzdWx0KGNhbGxiYWNrQ29udGV4dCk7XHJcbiAgICBjYWxsYmFja0NvbnRleHQudmFsaWRhdGlvblJlc3VsdCA9IHZhbGlkYXRpb25SZXN1bHQ7XHJcblxyXG4gICAgaWYgKHZhbGlkYXRpb25SZXN1bHQuYXV0aFJlc3BvbnNlSXNWYWxpZCkge1xyXG4gICAgICB0aGlzLmF1dGhTdGF0ZVNlcnZpY2Uuc2V0QXV0aG9yaXphdGlvbkRhdGEodmFsaWRhdGlvblJlc3VsdC5hY2Nlc3NUb2tlbiwgY2FsbGJhY2tDb250ZXh0LmF1dGhSZXN1bHQpO1xyXG4gICAgICByZXR1cm4gb2YoY2FsbGJhY2tDb250ZXh0KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBhdXRob3JpemVkQ2FsbGJhY2ssIHRva2VuKHMpIHZhbGlkYXRpb24gZmFpbGVkLCByZXNldHRpbmcuIEhhc2g6ICR7d2luZG93LmxvY2F0aW9uLmhhc2h9YDtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoZXJyb3JNZXNzYWdlKTtcclxuICAgICAgdGhpcy5yZXNldEF1dGhvcml6YXRpb25EYXRhKCk7XHJcbiAgICAgIHRoaXMucHVibGlzaFVuYXV0aG9yaXplZFN0YXRlKGNhbGxiYWNrQ29udGV4dC52YWxpZGF0aW9uUmVzdWx0LCBjYWxsYmFja0NvbnRleHQuaXNSZW5ld1Byb2Nlc3MpO1xyXG4gICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvck1lc3NhZ2UpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gU1RFUCA1IHVzZXJEYXRhXHJcbiAgcHJpdmF0ZSBjYWxsYmFja1VzZXIoY2FsbGJhY2tDb250ZXh0OiBDYWxsYmFja0NvbnRleHQpOiBPYnNlcnZhYmxlPENhbGxiYWNrQ29udGV4dD4ge1xyXG4gICAgaWYgKCF0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLmF1dG9Vc2VyaW5mbykge1xyXG4gICAgICBpZiAoIWNhbGxiYWNrQ29udGV4dC5pc1JlbmV3UHJvY2Vzcykge1xyXG4gICAgICAgIC8vIHVzZXJEYXRhIGlzIHNldCB0byB0aGUgaWRfdG9rZW4gZGVjb2RlZCwgYXV0byBnZXQgdXNlciBkYXRhIHNldCB0byBmYWxzZVxyXG4gICAgICAgIHRoaXMudXNlclNlcnZpY2Uuc2V0VXNlckRhdGFUb1N0b3JlKGNhbGxiYWNrQ29udGV4dC52YWxpZGF0aW9uUmVzdWx0LmRlY29kZWRJZFRva2VuKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5wdWJsaXNoQXV0aG9yaXplZFN0YXRlKGNhbGxiYWNrQ29udGV4dC52YWxpZGF0aW9uUmVzdWx0LCBjYWxsYmFja0NvbnRleHQuaXNSZW5ld1Byb2Nlc3MpO1xyXG4gICAgICByZXR1cm4gb2YoY2FsbGJhY2tDb250ZXh0KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy51c2VyU2VydmljZVxyXG4gICAgICAuZ2V0QW5kUGVyc2lzdFVzZXJEYXRhSW5TdG9yZShcclxuICAgICAgICBjYWxsYmFja0NvbnRleHQuaXNSZW5ld1Byb2Nlc3MsXHJcbiAgICAgICAgY2FsbGJhY2tDb250ZXh0LnZhbGlkYXRpb25SZXN1bHQuaWRUb2tlbixcclxuICAgICAgICBjYWxsYmFja0NvbnRleHQudmFsaWRhdGlvblJlc3VsdC5kZWNvZGVkSWRUb2tlblxyXG4gICAgICApXHJcbiAgICAgIC5waXBlKFxyXG4gICAgICAgIHN3aXRjaE1hcCgodXNlckRhdGEpID0+IHtcclxuICAgICAgICAgIGlmICghIXVzZXJEYXRhKSB7XHJcbiAgICAgICAgICAgIGlmICghY2FsbGJhY2tDb250ZXh0LnJlZnJlc2hUb2tlbikge1xyXG4gICAgICAgICAgICAgIHRoaXMuZmxvd3NEYXRhU2VydmljZS5zZXRTZXNzaW9uU3RhdGUoY2FsbGJhY2tDb250ZXh0LmF1dGhSZXN1bHQuc2Vzc2lvbl9zdGF0ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5wdWJsaXNoQXV0aG9yaXplZFN0YXRlKGNhbGxiYWNrQ29udGV4dC52YWxpZGF0aW9uUmVzdWx0LCBjYWxsYmFja0NvbnRleHQuaXNSZW5ld1Byb2Nlc3MpO1xyXG4gICAgICAgICAgICByZXR1cm4gb2YoY2FsbGJhY2tDb250ZXh0KTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVzZXRBdXRob3JpemF0aW9uRGF0YSgpO1xyXG4gICAgICAgICAgICB0aGlzLnB1Ymxpc2hVbmF1dGhvcml6ZWRTdGF0ZShjYWxsYmFja0NvbnRleHQudmFsaWRhdGlvblJlc3VsdCwgY2FsbGJhY2tDb250ZXh0LmlzUmVuZXdQcm9jZXNzKTtcclxuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYENhbGxlZCBmb3IgdXNlckRhdGEgYnV0IHRoZXkgd2VyZSAke3VzZXJEYXRhfWA7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKGVycm9yTWVzc2FnZSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yTWVzc2FnZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSksXHJcbiAgICAgICAgY2F0Y2hFcnJvcigoZXJyKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgRmFpbGVkIHRvIHJldHJpZXZlIHVzZXIgaW5mbyB3aXRoIGVycm9yOiAgJHtlcnJ9YDtcclxuICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKGVycm9yTWVzc2FnZSk7XHJcbiAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvck1lc3NhZ2UpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHB1Ymxpc2hBdXRob3JpemVkU3RhdGUoc3RhdGVWYWxpZGF0aW9uUmVzdWx0OiBTdGF0ZVZhbGlkYXRpb25SZXN1bHQsIGlzUmVuZXdQcm9jZXNzOiBib29sZWFuKSB7XHJcbiAgICB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UudXBkYXRlQW5kUHVibGlzaEF1dGhTdGF0ZSh7XHJcbiAgICAgIGF1dGhvcml6YXRpb25TdGF0ZTogQXV0aG9yaXplZFN0YXRlLkF1dGhvcml6ZWQsXHJcbiAgICAgIHZhbGlkYXRpb25SZXN1bHQ6IHN0YXRlVmFsaWRhdGlvblJlc3VsdC5zdGF0ZSxcclxuICAgICAgaXNSZW5ld1Byb2Nlc3MsXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcHVibGlzaFVuYXV0aG9yaXplZFN0YXRlKHN0YXRlVmFsaWRhdGlvblJlc3VsdDogU3RhdGVWYWxpZGF0aW9uUmVzdWx0LCBpc1JlbmV3UHJvY2VzczogYm9vbGVhbikge1xyXG4gICAgdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLnVwZGF0ZUFuZFB1Ymxpc2hBdXRoU3RhdGUoe1xyXG4gICAgICBhdXRob3JpemF0aW9uU3RhdGU6IEF1dGhvcml6ZWRTdGF0ZS5VbmF1dGhvcml6ZWQsXHJcbiAgICAgIHZhbGlkYXRpb25SZXN1bHQ6IHN0YXRlVmFsaWRhdGlvblJlc3VsdC5zdGF0ZSxcclxuICAgICAgaXNSZW5ld1Byb2Nlc3MsXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlUmVzdWx0RXJyb3JGcm9tQ2FsbGJhY2socmVzdWx0OiBhbnksIGlzUmVuZXdQcm9jZXNzOiBib29sZWFuKSB7XHJcbiAgICBsZXQgdmFsaWRhdGlvblJlc3VsdCA9IFZhbGlkYXRpb25SZXN1bHQuU2VjdXJlVG9rZW5TZXJ2ZXJFcnJvcjtcclxuXHJcbiAgICBpZiAoKHJlc3VsdC5lcnJvciBhcyBzdHJpbmcpID09PSAnbG9naW5fcmVxdWlyZWQnKSB7XHJcbiAgICAgIHZhbGlkYXRpb25SZXN1bHQgPSBWYWxpZGF0aW9uUmVzdWx0LkxvZ2luUmVxdWlyZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLnVwZGF0ZUFuZFB1Ymxpc2hBdXRoU3RhdGUoe1xyXG4gICAgICBhdXRob3JpemF0aW9uU3RhdGU6IEF1dGhvcml6ZWRTdGF0ZS5VbmF1dGhvcml6ZWQsXHJcbiAgICAgIHZhbGlkYXRpb25SZXN1bHQsXHJcbiAgICAgIGlzUmVuZXdQcm9jZXNzLFxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhpc3RvcnlDbGVhblVwVHVybmVkT24oKSB7XHJcbiAgICByZXR1cm4gIXRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uaGlzdG9yeUNsZWFudXBPZmY7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlc2V0QnJvd3Nlckhpc3RvcnkoKSB7XHJcbiAgICB3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUoe30sIHdpbmRvdy5kb2N1bWVudC50aXRsZSwgd2luZG93LmxvY2F0aW9uLm9yaWdpbiArIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSk7XHJcbiAgfVxyXG59XHJcbiJdfQ==