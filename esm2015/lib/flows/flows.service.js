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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxvd3Muc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjLyIsInNvdXJjZXMiOlsibGliL2Zsb3dzL2Zsb3dzLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFjLEVBQUUsRUFBRSxVQUFVLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDbEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUd2RCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFRaEUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDaEYsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0saUNBQWlDLENBQUM7Ozs7Ozs7Ozs7Ozs7QUFNbkUsTUFBTSxPQUFPLFlBQVk7SUFDdkIsWUFDbUIsVUFBc0IsRUFDdEIsYUFBNEIsRUFDNUIsc0JBQThDLEVBQzlDLHFCQUE0QyxFQUM1QyxnQkFBa0MsRUFDbEMsZ0JBQWtDLEVBQ2xDLG9CQUEwQyxFQUMxQyxXQUF3QixFQUN4QixXQUF3QixFQUN4QixzQkFBOEMsRUFDOUMseUJBQW9EO1FBVnBELGVBQVUsR0FBVixVQUFVLENBQVk7UUFDdEIsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFDNUIsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF3QjtRQUM5QywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1FBQzVDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1FBQzFDLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1FBQ3hCLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1FBQ3hCLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBd0I7UUFDOUMsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUEyQjtJQUNwRSxDQUFDO0lBRUosc0JBQXNCO1FBQ3BCLElBQUksSUFBSSxDQUFDLHFCQUFxQixDQUFDLG1CQUFtQixDQUFDLFlBQVksRUFBRTtZQUMvRCw4QkFBOEI7WUFDOUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1NBQ3pDO1FBRUQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDN0MsSUFBSSxDQUFDLGdCQUFnQixDQUFDLDJCQUEyQixFQUFFLENBQUM7SUFDdEQsQ0FBQztJQUVELHVCQUF1QixDQUFDLFVBQWtCO1FBQ3hDLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FDM0MsU0FBUyxDQUFDLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsZUFBZSxDQUFDLENBQUMsRUFDekUsU0FBUyxDQUFDLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsZUFBZSxDQUFDLENBQUMsRUFDcEYsU0FBUyxDQUFDLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsZUFBZSxDQUFDLENBQUMsRUFDN0UsU0FBUyxDQUFDLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQ25FLENBQUM7SUFDSixDQUFDO0lBRUQsa0NBQWtDLENBQUMsWUFBNkI7UUFDOUQsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUNoRCxTQUFTLENBQUMsQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUNwRixTQUFTLENBQUMsQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUM3RSxTQUFTLENBQUMsQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FDbkUsQ0FBQztJQUNKLENBQUM7SUFFRCwyQkFBMkIsQ0FBQyxJQUFhO1FBQ3ZDLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FDekMsU0FBUyxDQUFDLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsZUFBZSxDQUFDLENBQUMsRUFDcEYsU0FBUyxDQUFDLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsZUFBZSxDQUFDLENBQUMsRUFDN0UsU0FBUyxDQUFDLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQ25FLENBQUM7SUFDSixDQUFDO0lBRUQsbUJBQW1CLENBQUMsWUFBMkQ7UUFDN0UsT0FBTyxJQUFJLENBQUMsK0JBQStCLEVBQUUsQ0FBQyxJQUFJLENBQ2hELFNBQVMsQ0FBQyxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLGVBQWUsRUFBRSxZQUFZLENBQUMsQ0FBQyxFQUM5RixTQUFTLENBQUMsQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUNwRixTQUFTLENBQUMsQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUM3RSxTQUFTLENBQUMsQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FDbkUsQ0FBQztJQUNKLENBQUM7SUFFRCxtQkFBbUI7SUFDWCxnQkFBZ0IsQ0FBQyxVQUFrQjtRQUN6QyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDakUsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ25FLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxlQUFlLENBQUMsSUFBSSxJQUFJLENBQUM7UUFFMUYsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNWLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDL0MsT0FBTyxVQUFVLENBQUMsaUJBQWlCLENBQUMsQ0FBQztTQUN0QztRQUNELElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDVCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQzlDLE9BQU8sVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUM7U0FDckM7UUFDRCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxpQ0FBaUMsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUUzRSxNQUFNLHNCQUFzQixHQUFHO1lBQzdCLElBQUk7WUFDSixZQUFZLEVBQUUsSUFBSTtZQUNsQixLQUFLO1lBQ0wsWUFBWTtZQUNaLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLGNBQWMsRUFBRSxLQUFLO1lBQ3JCLE9BQU8sRUFBRSxJQUFJO1lBQ2IsZ0JBQWdCLEVBQUUsSUFBSTtZQUN0QixlQUFlLEVBQUUsSUFBSTtTQUN0QixDQUFDO1FBRUYsT0FBTyxFQUFFLENBQUMsc0JBQXNCLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUQsdUJBQXVCO0lBQ2Ysb0JBQW9CLENBQUMsSUFBYTtRQUN4QyxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBRXhFLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLHdDQUF3QyxDQUFDLENBQUM7UUFDdEUsSUFBSSxDQUFDLGtCQUFrQixFQUFFO1lBQ3ZCLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1NBQy9CO1FBRUQsSUFBSSxHQUFHLElBQUksSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFOUMsTUFBTSxVQUFVLEdBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxVQUFlLEVBQUUsSUFBWSxFQUFFLEVBQUU7WUFDL0UsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM5QixVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBWSxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN0RCxPQUFPLFVBQVUsQ0FBQztRQUNwQixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFUCxNQUFNLGVBQWUsR0FBRztZQUN0QixJQUFJLEVBQUUsSUFBSTtZQUNWLFlBQVksRUFBRSxJQUFJO1lBQ2xCLEtBQUssRUFBRSxJQUFJO1lBQ1gsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVTtZQUNWLGNBQWMsRUFBRSxrQkFBa0I7WUFDbEMsT0FBTyxFQUFFLElBQUk7WUFDYixnQkFBZ0IsRUFBRSxJQUFJO1lBQ3RCLGVBQWUsRUFBRSxJQUFJO1NBQ3RCLENBQUM7UUFFRixPQUFPLEVBQUUsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBRUQseUJBQXlCO0lBQ2pCLCtCQUErQjtRQUNyQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsbUNBQW1DLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDN0YsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsOENBQThDLEdBQUcsU0FBUyxDQUFDLENBQUM7UUFDeEYsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQzdELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUVuRCxJQUFJLFlBQVksRUFBRTtZQUNoQixNQUFNLGVBQWUsR0FBRztnQkFDdEIsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsWUFBWTtnQkFDWixLQUFLLEVBQUUsU0FBUztnQkFDaEIsWUFBWSxFQUFFLElBQUk7Z0JBQ2xCLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixjQUFjLEVBQUUsSUFBSTtnQkFDcEIsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsZ0JBQWdCLEVBQUUsSUFBSTtnQkFDdEIsZUFBZSxFQUFFLE9BQU87YUFDekIsQ0FBQztZQUVGLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLGlFQUFpRSxDQUFDLENBQUM7WUFDL0YseUVBQXlFO1lBQ3pFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsc0JBQXNCLENBQUMsNEJBQTRCLENBQUMsQ0FBQztZQUVwRixPQUFPLEVBQUUsQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUM1QjthQUFNO1lBQ0wsTUFBTSxZQUFZLEdBQUcsc0NBQXNDLENBQUM7WUFDNUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDMUMsT0FBTyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDakM7SUFDSCxDQUFDO0lBRUQsdUJBQXVCO0lBQ2YsMEJBQTBCLENBQ2hDLGVBQWdDLEVBQ2hDLFlBQTJEO1FBRTNELElBQUksT0FBTyxHQUFnQixJQUFJLFdBQVcsRUFBRSxDQUFDO1FBQzdDLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxtQ0FBbUMsQ0FBQyxDQUFDO1FBRTNFLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUNwRixNQUFNLGFBQWEsR0FBRyxhQUFhLGFBQWIsYUFBYSx1QkFBYixhQUFhLENBQUUsYUFBYSxDQUFDO1FBQ25ELElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDbEIsT0FBTyxVQUFVLENBQUMsNEJBQTRCLENBQUMsQ0FBQztTQUNqRDtRQUVELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMseUNBQXlDLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQztRQUVuSCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUM3RCxTQUFTLENBQUMsQ0FBQyxRQUFhLEVBQUUsRUFBRTtZQUMxQixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQywwQkFBMEIsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNsRSxJQUFJLFVBQVUsR0FBUSxJQUFJLE1BQU0sRUFBRSxDQUFDO1lBQ25DLFVBQVUsR0FBRyxRQUFRLENBQUM7WUFDdEIsVUFBVSxDQUFDLEtBQUssR0FBRyxlQUFlLENBQUMsS0FBSyxDQUFDO1lBRXpDLGVBQWUsQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1lBQ3hDLE9BQU8sRUFBRSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzdCLENBQUMsQ0FBQyxFQUNGLFVBQVUsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ25CLE1BQU0sWUFBWSxHQUFHLDRCQUE0QixJQUFJLENBQUMscUJBQXFCLENBQUMsbUJBQW1CLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDNUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2pELE9BQU8sVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2xDLENBQUMsQ0FBQyxDQUNILENBQUM7SUFDSixDQUFDO0lBRUQsMERBQTBEO0lBQ2xELG1CQUFtQixDQUFDLGVBQWdDO1FBQzFELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyw2QkFBNkIsQ0FDOUUsZUFBZSxDQUFDLEtBQUssRUFDckIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLG1CQUFtQixFQUFFLENBQzVDLENBQUM7UUFFRixJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ25CLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLHFDQUFxQyxDQUFDLENBQUM7WUFDckUsT0FBTyxVQUFVLENBQUMscUNBQXFDLENBQUMsQ0FBQztTQUMxRDtRQUVELE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUNwRixNQUFNLGFBQWEsR0FBRyxhQUFhLGFBQWIsYUFBYSx1QkFBYixhQUFhLENBQUUsYUFBYSxDQUFDO1FBQ25ELElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDbEIsT0FBTyxVQUFVLENBQUMsNEJBQTRCLENBQUMsQ0FBQztTQUNqRDtRQUVELElBQUksT0FBTyxHQUFnQixJQUFJLFdBQVcsRUFBRSxDQUFDO1FBQzdDLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxtQ0FBbUMsQ0FBQyxDQUFDO1FBRTNFLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsZ0NBQWdDLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRS9GLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLGVBQWUsRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQ3hFLFNBQVMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFO1lBQ3JCLElBQUksVUFBVSxHQUFRLElBQUksTUFBTSxFQUFFLENBQUM7WUFDbkMsVUFBVSxHQUFHLFFBQVEsQ0FBQztZQUN0QixVQUFVLENBQUMsS0FBSyxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUM7WUFDekMsVUFBVSxDQUFDLGFBQWEsR0FBRyxlQUFlLENBQUMsWUFBWSxDQUFDO1lBRXhELGVBQWUsQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1lBQ3hDLE9BQU8sRUFBRSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzdCLENBQUMsQ0FBQyxFQUNGLFVBQVUsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ25CLE1BQU0sWUFBWSxHQUFHLDRCQUE0QixJQUFJLENBQUMscUJBQXFCLENBQUMsbUJBQW1CLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDNUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2pELE9BQU8sVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2xDLENBQUMsQ0FBQyxDQUNILENBQUM7SUFDSixDQUFDO0lBRUQsK0RBQStEO0lBQ3ZELDhCQUE4QixDQUFDLGVBQWdDO1FBQ3JFLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUVoRixJQUFJLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLGNBQWMsRUFBRTtZQUNwRSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztTQUM1QjthQUFNO1lBQ0wsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsMkJBQTJCLENBQUMsQ0FBQztTQUMxRDtRQUVELElBQUksZUFBZSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUU7WUFDcEMsTUFBTSxZQUFZLEdBQUcsZ0RBQWdELGVBQWUsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDeEcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDMUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7WUFDOUIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNuQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxlQUFlLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDL0YsT0FBTyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDakM7UUFFRCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDeEQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsb0RBQW9ELENBQUMsQ0FBQztRQUVsRixPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxJQUFJLENBQ3BELFNBQVMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ3BCLElBQUksT0FBTyxFQUFFO2dCQUNYLGVBQWUsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO2dCQUVsQyxPQUFPLEVBQUUsQ0FBQyxlQUFlLENBQUMsQ0FBQzthQUM1QjtZQUVELE1BQU0sWUFBWSxHQUFHLGdDQUFnQyxDQUFDO1lBQ3RELElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzVDLE9BQU8sVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2xDLENBQUMsQ0FBQyxFQUNGLFVBQVUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ2pCLE1BQU0sWUFBWSxHQUFHLDhDQUE4QyxHQUFHLEVBQUUsQ0FBQztZQUN6RSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUM1QyxPQUFPLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNsQyxDQUFDLENBQUMsQ0FDSCxDQUFDO0lBQ0osQ0FBQztJQUVELG1CQUFtQjtJQUNYLHVCQUF1QixDQUFDLGVBQWdDO1FBQzlELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLHVCQUF1QixDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzlGLGVBQWUsQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztRQUVwRCxJQUFJLGdCQUFnQixDQUFDLG1CQUFtQixFQUFFO1lBQ3hDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3JHLE9BQU8sRUFBRSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1NBQzVCO2FBQU07WUFDTCxNQUFNLFlBQVksR0FBRyxvRUFBb0UsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNoSCxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUM1QyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztZQUM5QixJQUFJLENBQUMsd0JBQXdCLENBQUMsZUFBZSxDQUFDLGdCQUFnQixFQUFFLGVBQWUsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNoRyxPQUFPLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUNqQztJQUNILENBQUM7SUFFRCxrQkFBa0I7SUFDVixZQUFZLENBQUMsZUFBZ0M7UUFDbkQsSUFBSSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLEVBQUU7WUFDaEUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxjQUFjLEVBQUU7Z0JBQ25DLDJFQUEyRTtnQkFDM0UsSUFBSSxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLENBQUM7YUFDdEY7WUFFRCxJQUFJLENBQUMsc0JBQXNCLENBQUMsZUFBZSxDQUFDLGdCQUFnQixFQUFFLGVBQWUsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM5RixPQUFPLEVBQUUsQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUM1QjtRQUVELE9BQU8sSUFBSSxDQUFDLFdBQVc7YUFDcEIsNEJBQTRCLENBQzNCLGVBQWUsQ0FBQyxjQUFjLEVBQzlCLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQ3hDLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQ2hEO2FBQ0EsSUFBSSxDQUNILFNBQVMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFO1lBQ3JCLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRTtnQkFDZCxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRTtvQkFDakMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2lCQUNqRjtnQkFDRCxJQUFJLENBQUMsc0JBQXNCLENBQUMsZUFBZSxDQUFDLGdCQUFnQixFQUFFLGVBQWUsQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDOUYsT0FBTyxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUM7YUFDNUI7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7Z0JBQzlCLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLEVBQUUsZUFBZSxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUNoRyxNQUFNLFlBQVksR0FBRyxxQ0FBcUMsUUFBUSxFQUFFLENBQUM7Z0JBQ3JFLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUM1QyxPQUFPLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUNqQztRQUNILENBQUMsQ0FBQyxFQUNGLFVBQVUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ2pCLE1BQU0sWUFBWSxHQUFHLDZDQUE2QyxHQUFHLEVBQUUsQ0FBQztZQUN4RSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUM1QyxPQUFPLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNsQyxDQUFDLENBQUMsQ0FDSCxDQUFDO0lBQ04sQ0FBQztJQUVPLHNCQUFzQixDQUFDLHFCQUE0QyxFQUFFLGNBQXVCO1FBQ2xHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyx5QkFBeUIsQ0FBQztZQUM5QyxrQkFBa0IsRUFBRSxlQUFlLENBQUMsVUFBVTtZQUM5QyxnQkFBZ0IsRUFBRSxxQkFBcUIsQ0FBQyxLQUFLO1lBQzdDLGNBQWM7U0FDZixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU8sd0JBQXdCLENBQUMscUJBQTRDLEVBQUUsY0FBdUI7UUFDcEcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLHlCQUF5QixDQUFDO1lBQzlDLGtCQUFrQixFQUFFLGVBQWUsQ0FBQyxZQUFZO1lBQ2hELGdCQUFnQixFQUFFLHFCQUFxQixDQUFDLEtBQUs7WUFDN0MsY0FBYztTQUNmLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTyw2QkFBNkIsQ0FBQyxNQUFXLEVBQUUsY0FBdUI7UUFDeEUsSUFBSSxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQztRQUUvRCxJQUFLLE1BQU0sQ0FBQyxLQUFnQixLQUFLLGdCQUFnQixFQUFFO1lBQ2pELGdCQUFnQixHQUFHLGdCQUFnQixDQUFDLGFBQWEsQ0FBQztTQUNuRDtRQUVELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyx5QkFBeUIsQ0FBQztZQUM5QyxrQkFBa0IsRUFBRSxlQUFlLENBQUMsWUFBWTtZQUNoRCxnQkFBZ0I7WUFDaEIsY0FBYztTQUNmLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTyxzQkFBc0I7UUFDNUIsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxtQkFBbUIsQ0FBQyxpQkFBaUIsQ0FBQztJQUMzRSxDQUFDO0lBRU8sbUJBQW1CO1FBQ3pCLE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzVHLENBQUM7O3dFQTlXVSxZQUFZO29EQUFaLFlBQVksV0FBWixZQUFZO2tEQUFaLFlBQVk7Y0FEeEIsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEh0dHBIZWFkZXJzIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xyXG5pbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IE9ic2VydmFibGUsIG9mLCB0aHJvd0Vycm9yIH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IGNhdGNoRXJyb3IsIHN3aXRjaE1hcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuaW1wb3J0IHsgRGF0YVNlcnZpY2UgfSBmcm9tICcuLi9hcGkvZGF0YS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgQXV0aFN0YXRlU2VydmljZSB9IGZyb20gJy4uL2F1dGhTdGF0ZS9hdXRoLXN0YXRlLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBBdXRob3JpemVkU3RhdGUgfSBmcm9tICcuLi9hdXRoU3RhdGUvYXV0aG9yaXplZC1zdGF0ZSc7XHJcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25Qcm92aWRlciB9IGZyb20gJy4uL2NvbmZpZy9jb25maWcucHJvdmlkZXInO1xyXG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi4vbG9nZ2luZy9sb2dnZXIuc2VydmljZSc7XHJcbmltcG9ydCB7IFN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UgfSBmcm9tICcuLi9zdG9yYWdlL3N0b3JhZ2UtcGVyc2lzdGFuY2Uuc2VydmljZSc7XHJcbmltcG9ydCB7IFVzZXJTZXJ2aWNlIH0gZnJvbSAnLi4vdXNlckRhdGEvdXNlci1zZXJ2aWNlJztcclxuaW1wb3J0IHsgVXJsU2VydmljZSB9IGZyb20gJy4uL3V0aWxzL3VybC91cmwuc2VydmljZSc7XHJcbmltcG9ydCB7IFN0YXRlVmFsaWRhdGlvblJlc3VsdCB9IGZyb20gJy4uL3ZhbGlkYXRpb24vc3RhdGUtdmFsaWRhdGlvbi1yZXN1bHQnO1xyXG5pbXBvcnQgeyBTdGF0ZVZhbGlkYXRpb25TZXJ2aWNlIH0gZnJvbSAnLi4vdmFsaWRhdGlvbi9zdGF0ZS12YWxpZGF0aW9uLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBUb2tlblZhbGlkYXRpb25TZXJ2aWNlIH0gZnJvbSAnLi4vdmFsaWRhdGlvbi90b2tlbi12YWxpZGF0aW9uLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBWYWxpZGF0aW9uUmVzdWx0IH0gZnJvbSAnLi4vdmFsaWRhdGlvbi92YWxpZGF0aW9uLXJlc3VsdCc7XHJcbmltcG9ydCB7IENhbGxiYWNrQ29udGV4dCB9IGZyb20gJy4vY2FsbGJhY2stY29udGV4dCc7XHJcbmltcG9ydCB7IEZsb3dzRGF0YVNlcnZpY2UgfSBmcm9tICcuL2Zsb3dzLWRhdGEuc2VydmljZSc7XHJcbmltcG9ydCB7IFNpZ25pbktleURhdGFTZXJ2aWNlIH0gZnJvbSAnLi9zaWduaW4ta2V5LWRhdGEuc2VydmljZSc7XHJcblxyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBGbG93c1NlcnZpY2Uge1xyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSB1cmxTZXJ2aWNlOiBVcmxTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBsb2dnZXJTZXJ2aWNlOiBMb2dnZXJTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSB0b2tlblZhbGlkYXRpb25TZXJ2aWNlOiBUb2tlblZhbGlkYXRpb25TZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlcixcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgYXV0aFN0YXRlU2VydmljZTogQXV0aFN0YXRlU2VydmljZSxcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgZmxvd3NEYXRhU2VydmljZTogRmxvd3NEYXRhU2VydmljZSxcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgc2lnbmluS2V5RGF0YVNlcnZpY2U6IFNpZ25pbktleURhdGFTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBkYXRhU2VydmljZTogRGF0YVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IHVzZXJTZXJ2aWNlOiBVc2VyU2VydmljZSxcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgc3RhdGVWYWxpZGF0aW9uU2VydmljZTogU3RhdGVWYWxpZGF0aW9uU2VydmljZSxcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZTogU3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZVxyXG4gICkge31cclxuXHJcbiAgcmVzZXRBdXRob3JpemF0aW9uRGF0YSgpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLmF1dG9Vc2VyaW5mbykge1xyXG4gICAgICAvLyBDbGVhciB1c2VyIGRhdGEuIEZpeGVzICM5Ny5cclxuICAgICAgdGhpcy51c2VyU2VydmljZS5yZXNldFVzZXJEYXRhSW5TdG9yZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZmxvd3NEYXRhU2VydmljZS5yZXNldFN0b3JhZ2VGbG93RGF0YSgpO1xyXG4gICAgdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLnNldFVuYXV0aG9yaXplZEFuZEZpcmVFdmVudCgpO1xyXG4gIH1cclxuXHJcbiAgcHJvY2Vzc0NvZGVGbG93Q2FsbGJhY2sodXJsVG9DaGVjazogc3RyaW5nKSB7XHJcbiAgICByZXR1cm4gdGhpcy5jb2RlRmxvd0NhbGxiYWNrKHVybFRvQ2hlY2spLnBpcGUoXHJcbiAgICAgIHN3aXRjaE1hcCgoY2FsbGJhY2tDb250ZXh0KSA9PiB0aGlzLmNvZGVGbG93Q29kZVJlcXVlc3QoY2FsbGJhY2tDb250ZXh0KSksXHJcbiAgICAgIHN3aXRjaE1hcCgoY2FsbGJhY2tDb250ZXh0KSA9PiB0aGlzLmNhbGxiYWNrSGlzdG9yeUFuZFJlc2V0Snd0S2V5cyhjYWxsYmFja0NvbnRleHQpKSxcclxuICAgICAgc3dpdGNoTWFwKChjYWxsYmFja0NvbnRleHQpID0+IHRoaXMuY2FsbGJhY2tTdGF0ZVZhbGlkYXRpb24oY2FsbGJhY2tDb250ZXh0KSksXHJcbiAgICAgIHN3aXRjaE1hcCgoY2FsbGJhY2tDb250ZXh0KSA9PiB0aGlzLmNhbGxiYWNrVXNlcihjYWxsYmFja0NvbnRleHQpKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIHByb2Nlc3NTaWxlbnRSZW5ld0NvZGVGbG93Q2FsbGJhY2soZmlyc3RDb250ZXh0OiBDYWxsYmFja0NvbnRleHQpIHtcclxuICAgIHJldHVybiB0aGlzLmNvZGVGbG93Q29kZVJlcXVlc3QoZmlyc3RDb250ZXh0KS5waXBlKFxyXG4gICAgICBzd2l0Y2hNYXAoKGNhbGxiYWNrQ29udGV4dCkgPT4gdGhpcy5jYWxsYmFja0hpc3RvcnlBbmRSZXNldEp3dEtleXMoY2FsbGJhY2tDb250ZXh0KSksXHJcbiAgICAgIHN3aXRjaE1hcCgoY2FsbGJhY2tDb250ZXh0KSA9PiB0aGlzLmNhbGxiYWNrU3RhdGVWYWxpZGF0aW9uKGNhbGxiYWNrQ29udGV4dCkpLFxyXG4gICAgICBzd2l0Y2hNYXAoKGNhbGxiYWNrQ29udGV4dCkgPT4gdGhpcy5jYWxsYmFja1VzZXIoY2FsbGJhY2tDb250ZXh0KSlcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBwcm9jZXNzSW1wbGljaXRGbG93Q2FsbGJhY2soaGFzaD86IHN0cmluZykge1xyXG4gICAgcmV0dXJuIHRoaXMuaW1wbGljaXRGbG93Q2FsbGJhY2soaGFzaCkucGlwZShcclxuICAgICAgc3dpdGNoTWFwKChjYWxsYmFja0NvbnRleHQpID0+IHRoaXMuY2FsbGJhY2tIaXN0b3J5QW5kUmVzZXRKd3RLZXlzKGNhbGxiYWNrQ29udGV4dCkpLFxyXG4gICAgICBzd2l0Y2hNYXAoKGNhbGxiYWNrQ29udGV4dCkgPT4gdGhpcy5jYWxsYmFja1N0YXRlVmFsaWRhdGlvbihjYWxsYmFja0NvbnRleHQpKSxcclxuICAgICAgc3dpdGNoTWFwKChjYWxsYmFja0NvbnRleHQpID0+IHRoaXMuY2FsbGJhY2tVc2VyKGNhbGxiYWNrQ29udGV4dCkpXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcHJvY2Vzc1JlZnJlc2hUb2tlbihjdXN0b21QYXJhbXM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfSkge1xyXG4gICAgcmV0dXJuIHRoaXMucmVmcmVzaFNlc3Npb25XaXRoUmVmcmVzaFRva2VucygpLnBpcGUoXHJcbiAgICAgIHN3aXRjaE1hcCgoY2FsbGJhY2tDb250ZXh0KSA9PiB0aGlzLnJlZnJlc2hUb2tlbnNSZXF1ZXN0VG9rZW5zKGNhbGxiYWNrQ29udGV4dCwgY3VzdG9tUGFyYW1zKSksXHJcbiAgICAgIHN3aXRjaE1hcCgoY2FsbGJhY2tDb250ZXh0KSA9PiB0aGlzLmNhbGxiYWNrSGlzdG9yeUFuZFJlc2V0Snd0S2V5cyhjYWxsYmFja0NvbnRleHQpKSxcclxuICAgICAgc3dpdGNoTWFwKChjYWxsYmFja0NvbnRleHQpID0+IHRoaXMuY2FsbGJhY2tTdGF0ZVZhbGlkYXRpb24oY2FsbGJhY2tDb250ZXh0KSksXHJcbiAgICAgIHN3aXRjaE1hcCgoY2FsbGJhY2tDb250ZXh0KSA9PiB0aGlzLmNhbGxiYWNrVXNlcihjYWxsYmFja0NvbnRleHQpKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8vIFNURVAgMSBDb2RlIEZsb3dcclxuICBwcml2YXRlIGNvZGVGbG93Q2FsbGJhY2sodXJsVG9DaGVjazogc3RyaW5nKTogT2JzZXJ2YWJsZTxDYWxsYmFja0NvbnRleHQ+IHtcclxuICAgIGNvbnN0IGNvZGUgPSB0aGlzLnVybFNlcnZpY2UuZ2V0VXJsUGFyYW1ldGVyKHVybFRvQ2hlY2ssICdjb2RlJyk7XHJcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMudXJsU2VydmljZS5nZXRVcmxQYXJhbWV0ZXIodXJsVG9DaGVjaywgJ3N0YXRlJyk7XHJcbiAgICBjb25zdCBzZXNzaW9uU3RhdGUgPSB0aGlzLnVybFNlcnZpY2UuZ2V0VXJsUGFyYW1ldGVyKHVybFRvQ2hlY2ssICdzZXNzaW9uX3N0YXRlJykgfHwgbnVsbDtcclxuXHJcbiAgICBpZiAoIXN0YXRlKSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zygnbm8gc3RhdGUgaW4gdXJsJyk7XHJcbiAgICAgIHJldHVybiB0aHJvd0Vycm9yKCdubyBzdGF0ZSBpbiB1cmwnKTtcclxuICAgIH1cclxuICAgIGlmICghY29kZSkge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ25vIGNvZGUgaW4gdXJsJyk7XHJcbiAgICAgIHJldHVybiB0aHJvd0Vycm9yKCdubyBjb2RlIGluIHVybCcpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdydW5uaW5nIHZhbGlkYXRpb24gZm9yIGNhbGxiYWNrJywgdXJsVG9DaGVjayk7XHJcblxyXG4gICAgY29uc3QgaW5pdGlhbENhbGxiYWNrQ29udGV4dCA9IHtcclxuICAgICAgY29kZSxcclxuICAgICAgcmVmcmVzaFRva2VuOiBudWxsLFxyXG4gICAgICBzdGF0ZSxcclxuICAgICAgc2Vzc2lvblN0YXRlLFxyXG4gICAgICBhdXRoUmVzdWx0OiBudWxsLFxyXG4gICAgICBpc1JlbmV3UHJvY2VzczogZmFsc2UsXHJcbiAgICAgIGp3dEtleXM6IG51bGwsXHJcbiAgICAgIHZhbGlkYXRpb25SZXN1bHQ6IG51bGwsXHJcbiAgICAgIGV4aXN0aW5nSWRUb2tlbjogbnVsbCxcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIG9mKGluaXRpYWxDYWxsYmFja0NvbnRleHQpO1xyXG4gIH1cclxuXHJcbiAgLy8gU1RFUCAxIEltcGxpY2l0IEZsb3dcclxuICBwcml2YXRlIGltcGxpY2l0Rmxvd0NhbGxiYWNrKGhhc2g/OiBzdHJpbmcpOiBPYnNlcnZhYmxlPENhbGxiYWNrQ29udGV4dD4ge1xyXG4gICAgY29uc3QgaXNSZW5ld1Byb2Nlc3NEYXRhID0gdGhpcy5mbG93c0RhdGFTZXJ2aWNlLmlzU2lsZW50UmVuZXdSdW5uaW5nKCk7XHJcblxyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdCRUdJTiBhdXRob3JpemVkQ2FsbGJhY2ssIG5vIGF1dGggZGF0YScpO1xyXG4gICAgaWYgKCFpc1JlbmV3UHJvY2Vzc0RhdGEpIHtcclxuICAgICAgdGhpcy5yZXNldEF1dGhvcml6YXRpb25EYXRhKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaGFzaCA9IGhhc2ggfHwgd2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyKDEpO1xyXG5cclxuICAgIGNvbnN0IGF1dGhSZXN1bHQ6IGFueSA9IGhhc2guc3BsaXQoJyYnKS5yZWR1Y2UoKHJlc3VsdERhdGE6IGFueSwgaXRlbTogc3RyaW5nKSA9PiB7XHJcbiAgICAgIGNvbnN0IHBhcnRzID0gaXRlbS5zcGxpdCgnPScpO1xyXG4gICAgICByZXN1bHREYXRhW3BhcnRzLnNoaWZ0KCkgYXMgc3RyaW5nXSA9IHBhcnRzLmpvaW4oJz0nKTtcclxuICAgICAgcmV0dXJuIHJlc3VsdERhdGE7XHJcbiAgICB9LCB7fSk7XHJcblxyXG4gICAgY29uc3QgY2FsbGJhY2tDb250ZXh0ID0ge1xyXG4gICAgICBjb2RlOiBudWxsLFxyXG4gICAgICByZWZyZXNoVG9rZW46IG51bGwsXHJcbiAgICAgIHN0YXRlOiBudWxsLFxyXG4gICAgICBzZXNzaW9uU3RhdGU6IG51bGwsXHJcbiAgICAgIGF1dGhSZXN1bHQsXHJcbiAgICAgIGlzUmVuZXdQcm9jZXNzOiBpc1JlbmV3UHJvY2Vzc0RhdGEsXHJcbiAgICAgIGp3dEtleXM6IG51bGwsXHJcbiAgICAgIHZhbGlkYXRpb25SZXN1bHQ6IG51bGwsXHJcbiAgICAgIGV4aXN0aW5nSWRUb2tlbjogbnVsbCxcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIG9mKGNhbGxiYWNrQ29udGV4dCk7XHJcbiAgfVxyXG5cclxuICAvLyBTVEVQIDEgUmVmcmVzaCBzZXNzaW9uXHJcbiAgcHJpdmF0ZSByZWZyZXNoU2Vzc2lvbldpdGhSZWZyZXNoVG9rZW5zKCk6IE9ic2VydmFibGU8Q2FsbGJhY2tDb250ZXh0PiB7XHJcbiAgICBjb25zdCBzdGF0ZURhdGEgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuZ2V0RXhpc3RpbmdPckNyZWF0ZUF1dGhTdGF0ZUNvbnRyb2woJ3JlZnJlc2gtdG9rZW4nKTtcclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnUmVmcmVzaFNlc3Npb24gY3JlYXRlZC4gYWRkaW5nIG15YXV0b3N0YXRlOiAnICsgc3RhdGVEYXRhKTtcclxuICAgIGNvbnN0IHJlZnJlc2hUb2tlbiA9IHRoaXMuYXV0aFN0YXRlU2VydmljZS5nZXRSZWZyZXNoVG9rZW4oKTtcclxuICAgIGNvbnN0IGlkVG9rZW4gPSB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UuZ2V0SWRUb2tlbigpO1xyXG5cclxuICAgIGlmIChyZWZyZXNoVG9rZW4pIHtcclxuICAgICAgY29uc3QgY2FsbGJhY2tDb250ZXh0ID0ge1xyXG4gICAgICAgIGNvZGU6IG51bGwsXHJcbiAgICAgICAgcmVmcmVzaFRva2VuLFxyXG4gICAgICAgIHN0YXRlOiBzdGF0ZURhdGEsXHJcbiAgICAgICAgc2Vzc2lvblN0YXRlOiBudWxsLFxyXG4gICAgICAgIGF1dGhSZXN1bHQ6IG51bGwsXHJcbiAgICAgICAgaXNSZW5ld1Byb2Nlc3M6IHRydWUsXHJcbiAgICAgICAgand0S2V5czogbnVsbCxcclxuICAgICAgICB2YWxpZGF0aW9uUmVzdWx0OiBudWxsLFxyXG4gICAgICAgIGV4aXN0aW5nSWRUb2tlbjogaWRUb2tlbixcclxuICAgICAgfTtcclxuXHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnZm91bmQgcmVmcmVzaCBjb2RlLCBvYnRhaW5pbmcgbmV3IGNyZWRlbnRpYWxzIHdpdGggcmVmcmVzaCBjb2RlJyk7XHJcbiAgICAgIC8vIE5vbmNlIGlzIG5vdCB1c2VkIHdpdGggcmVmcmVzaCB0b2tlbnM7IGJ1dCBLZXljbG9hayBtYXkgc2VuZCBpdCBhbnl3YXlcclxuICAgICAgdGhpcy5mbG93c0RhdGFTZXJ2aWNlLnNldE5vbmNlKFRva2VuVmFsaWRhdGlvblNlcnZpY2UucmVmcmVzaFRva2VuTm9uY2VQbGFjZWhvbGRlcik7XHJcblxyXG4gICAgICByZXR1cm4gb2YoY2FsbGJhY2tDb250ZXh0KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9ICdubyByZWZyZXNoIHRva2VuIGZvdW5kLCBwbGVhc2UgbG9naW4nO1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoZXJyb3JNZXNzYWdlKTtcclxuICAgICAgcmV0dXJuIHRocm93RXJyb3IoZXJyb3JNZXNzYWdlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFNURVAgMiBSZWZyZXNoIFRva2VuXHJcbiAgcHJpdmF0ZSByZWZyZXNoVG9rZW5zUmVxdWVzdFRva2VucyhcclxuICAgIGNhbGxiYWNrQ29udGV4dDogQ2FsbGJhY2tDb250ZXh0LFxyXG4gICAgY3VzdG9tUGFyYW1zPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIH1cclxuICApOiBPYnNlcnZhYmxlPENhbGxiYWNrQ29udGV4dD4ge1xyXG4gICAgbGV0IGhlYWRlcnM6IEh0dHBIZWFkZXJzID0gbmV3IEh0dHBIZWFkZXJzKCk7XHJcbiAgICBoZWFkZXJzID0gaGVhZGVycy5zZXQoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnKTtcclxuXHJcbiAgICBjb25zdCBhdXRoV2VsbEtub3duID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQoJ2F1dGhXZWxsS25vd25FbmRQb2ludHMnKTtcclxuICAgIGNvbnN0IHRva2VuRW5kcG9pbnQgPSBhdXRoV2VsbEtub3duPy50b2tlbkVuZHBvaW50O1xyXG4gICAgaWYgKCF0b2tlbkVuZHBvaW50KSB7XHJcbiAgICAgIHJldHVybiB0aHJvd0Vycm9yKCdUb2tlbiBFbmRwb2ludCBub3QgZGVmaW5lZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGRhdGEgPSB0aGlzLnVybFNlcnZpY2UuY3JlYXRlQm9keUZvckNvZGVGbG93UmVmcmVzaFRva2Vuc1JlcXVlc3QoY2FsbGJhY2tDb250ZXh0LnJlZnJlc2hUb2tlbiwgY3VzdG9tUGFyYW1zKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5kYXRhU2VydmljZS5wb3N0KHRva2VuRW5kcG9pbnQsIGRhdGEsIGhlYWRlcnMpLnBpcGUoXHJcbiAgICAgIHN3aXRjaE1hcCgocmVzcG9uc2U6IGFueSkgPT4ge1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygndG9rZW4gcmVmcmVzaCByZXNwb25zZTogJywgcmVzcG9uc2UpO1xyXG4gICAgICAgIGxldCBhdXRoUmVzdWx0OiBhbnkgPSBuZXcgT2JqZWN0KCk7XHJcbiAgICAgICAgYXV0aFJlc3VsdCA9IHJlc3BvbnNlO1xyXG4gICAgICAgIGF1dGhSZXN1bHQuc3RhdGUgPSBjYWxsYmFja0NvbnRleHQuc3RhdGU7XHJcblxyXG4gICAgICAgIGNhbGxiYWNrQ29udGV4dC5hdXRoUmVzdWx0ID0gYXV0aFJlc3VsdDtcclxuICAgICAgICByZXR1cm4gb2YoY2FsbGJhY2tDb250ZXh0KTtcclxuICAgICAgfSksXHJcbiAgICAgIGNhdGNoRXJyb3IoKGVycm9yKSA9PiB7XHJcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE9pZGNTZXJ2aWNlIGNvZGUgcmVxdWVzdCAke3RoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uc3RzU2VydmVyfWA7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGVycm9yTWVzc2FnZSwgZXJyb3IpO1xyXG4gICAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yTWVzc2FnZSk7XHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLy8gU1RFUCAyIENvZGUgRmxvdyAvLyAgQ29kZSBGbG93IFNpbGVudCBSZW5ldyBzdGFydHMgaGVyZVxyXG4gIHByaXZhdGUgY29kZUZsb3dDb2RlUmVxdWVzdChjYWxsYmFja0NvbnRleHQ6IENhbGxiYWNrQ29udGV4dCk6IE9ic2VydmFibGU8Q2FsbGJhY2tDb250ZXh0PiB7XHJcbiAgICBjb25zdCBpc1N0YXRlQ29ycmVjdCA9IHRoaXMudG9rZW5WYWxpZGF0aW9uU2VydmljZS52YWxpZGF0ZVN0YXRlRnJvbUhhc2hDYWxsYmFjayhcclxuICAgICAgY2FsbGJhY2tDb250ZXh0LnN0YXRlLFxyXG4gICAgICB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuZ2V0QXV0aFN0YXRlQ29udHJvbCgpXHJcbiAgICApO1xyXG5cclxuICAgIGlmICghaXNTdGF0ZUNvcnJlY3QpIHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2NvZGVGbG93Q29kZVJlcXVlc3QgaW5jb3JyZWN0IHN0YXRlJyk7XHJcbiAgICAgIHJldHVybiB0aHJvd0Vycm9yKCdjb2RlRmxvd0NvZGVSZXF1ZXN0IGluY29ycmVjdCBzdGF0ZScpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGF1dGhXZWxsS25vd24gPSB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZCgnYXV0aFdlbGxLbm93bkVuZFBvaW50cycpO1xyXG4gICAgY29uc3QgdG9rZW5FbmRwb2ludCA9IGF1dGhXZWxsS25vd24/LnRva2VuRW5kcG9pbnQ7XHJcbiAgICBpZiAoIXRva2VuRW5kcG9pbnQpIHtcclxuICAgICAgcmV0dXJuIHRocm93RXJyb3IoJ1Rva2VuIEVuZHBvaW50IG5vdCBkZWZpbmVkJyk7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGhlYWRlcnM6IEh0dHBIZWFkZXJzID0gbmV3IEh0dHBIZWFkZXJzKCk7XHJcbiAgICBoZWFkZXJzID0gaGVhZGVycy5zZXQoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnKTtcclxuXHJcbiAgICBjb25zdCBib2R5Rm9yQ29kZUZsb3cgPSB0aGlzLnVybFNlcnZpY2UuY3JlYXRlQm9keUZvckNvZGVGbG93Q29kZVJlcXVlc3QoY2FsbGJhY2tDb250ZXh0LmNvZGUpO1xyXG5cclxuICAgIHJldHVybiB0aGlzLmRhdGFTZXJ2aWNlLnBvc3QodG9rZW5FbmRwb2ludCwgYm9keUZvckNvZGVGbG93LCBoZWFkZXJzKS5waXBlKFxyXG4gICAgICBzd2l0Y2hNYXAoKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgbGV0IGF1dGhSZXN1bHQ6IGFueSA9IG5ldyBPYmplY3QoKTtcclxuICAgICAgICBhdXRoUmVzdWx0ID0gcmVzcG9uc2U7XHJcbiAgICAgICAgYXV0aFJlc3VsdC5zdGF0ZSA9IGNhbGxiYWNrQ29udGV4dC5zdGF0ZTtcclxuICAgICAgICBhdXRoUmVzdWx0LnNlc3Npb25fc3RhdGUgPSBjYWxsYmFja0NvbnRleHQuc2Vzc2lvblN0YXRlO1xyXG5cclxuICAgICAgICBjYWxsYmFja0NvbnRleHQuYXV0aFJlc3VsdCA9IGF1dGhSZXN1bHQ7XHJcbiAgICAgICAgcmV0dXJuIG9mKGNhbGxiYWNrQ29udGV4dCk7XHJcbiAgICAgIH0pLFxyXG4gICAgICBjYXRjaEVycm9yKChlcnJvcikgPT4ge1xyXG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBPaWRjU2VydmljZSBjb2RlIHJlcXVlc3QgJHt0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnN0c1NlcnZlcn1gO1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihlcnJvck1lc3NhZ2UsIGVycm9yKTtcclxuICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvck1lc3NhZ2UpO1xyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8vIFNURVAgMyBDb2RlIEZsb3csIFNURVAgMiBJbXBsaWNpdCBGbG93LCBTVEVQIDMgUmVmcmVzaCBUb2tlblxyXG4gIHByaXZhdGUgY2FsbGJhY2tIaXN0b3J5QW5kUmVzZXRKd3RLZXlzKGNhbGxiYWNrQ29udGV4dDogQ2FsbGJhY2tDb250ZXh0KTogT2JzZXJ2YWJsZTxDYWxsYmFja0NvbnRleHQ+IHtcclxuICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZSgnYXV0aG5SZXN1bHQnLCBjYWxsYmFja0NvbnRleHQuYXV0aFJlc3VsdCk7XHJcblxyXG4gICAgaWYgKHRoaXMuaGlzdG9yeUNsZWFuVXBUdXJuZWRPbigpICYmICFjYWxsYmFja0NvbnRleHQuaXNSZW5ld1Byb2Nlc3MpIHtcclxuICAgICAgdGhpcy5yZXNldEJyb3dzZXJIaXN0b3J5KCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ2hpc3RvcnkgY2xlYW4gdXAgaW5hY3RpdmUnKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoY2FsbGJhY2tDb250ZXh0LmF1dGhSZXN1bHQuZXJyb3IpIHtcclxuICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYGF1dGhvcml6ZWRDYWxsYmFja1Byb2NlZHVyZSBjYW1lIHdpdGggZXJyb3I6ICR7Y2FsbGJhY2tDb250ZXh0LmF1dGhSZXN1bHQuZXJyb3J9YDtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGVycm9yTWVzc2FnZSk7XHJcbiAgICAgIHRoaXMucmVzZXRBdXRob3JpemF0aW9uRGF0YSgpO1xyXG4gICAgICB0aGlzLmZsb3dzRGF0YVNlcnZpY2Uuc2V0Tm9uY2UoJycpO1xyXG4gICAgICB0aGlzLmhhbmRsZVJlc3VsdEVycm9yRnJvbUNhbGxiYWNrKGNhbGxiYWNrQ29udGV4dC5hdXRoUmVzdWx0LCBjYWxsYmFja0NvbnRleHQuaXNSZW5ld1Byb2Nlc3MpO1xyXG4gICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvck1lc3NhZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhjYWxsYmFja0NvbnRleHQuYXV0aFJlc3VsdCk7XHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ2F1dGhvcml6ZWRDYWxsYmFjayBjcmVhdGVkLCBiZWdpbiB0b2tlbiB2YWxpZGF0aW9uJyk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuc2lnbmluS2V5RGF0YVNlcnZpY2UuZ2V0U2lnbmluZ0tleXMoKS5waXBlKFxyXG4gICAgICBzd2l0Y2hNYXAoKGp3dEtleXMpID0+IHtcclxuICAgICAgICBpZiAoand0S2V5cykge1xyXG4gICAgICAgICAgY2FsbGJhY2tDb250ZXh0Lmp3dEtleXMgPSBqd3RLZXlzO1xyXG5cclxuICAgICAgICAgIHJldHVybiBvZihjYWxsYmFja0NvbnRleHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEZhaWxlZCB0byByZXRyaWV2ZSBzaWduaW5nIGtleWA7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoZXJyb3JNZXNzYWdlKTtcclxuICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvck1lc3NhZ2UpO1xyXG4gICAgICB9KSxcclxuICAgICAgY2F0Y2hFcnJvcigoZXJyKSA9PiB7XHJcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEZhaWxlZCB0byByZXRyaWV2ZSBzaWduaW5nIGtleSB3aXRoIGVycm9yOiAke2Vycn1gO1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKGVycm9yTWVzc2FnZSk7XHJcbiAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoZXJyb3JNZXNzYWdlKTtcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvLyBTVEVQIDQgQWxsIGZsb3dzXHJcbiAgcHJpdmF0ZSBjYWxsYmFja1N0YXRlVmFsaWRhdGlvbihjYWxsYmFja0NvbnRleHQ6IENhbGxiYWNrQ29udGV4dCk6IE9ic2VydmFibGU8Q2FsbGJhY2tDb250ZXh0PiB7XHJcbiAgICBjb25zdCB2YWxpZGF0aW9uUmVzdWx0ID0gdGhpcy5zdGF0ZVZhbGlkYXRpb25TZXJ2aWNlLmdldFZhbGlkYXRlZFN0YXRlUmVzdWx0KGNhbGxiYWNrQ29udGV4dCk7XHJcbiAgICBjYWxsYmFja0NvbnRleHQudmFsaWRhdGlvblJlc3VsdCA9IHZhbGlkYXRpb25SZXN1bHQ7XHJcblxyXG4gICAgaWYgKHZhbGlkYXRpb25SZXN1bHQuYXV0aFJlc3BvbnNlSXNWYWxpZCkge1xyXG4gICAgICB0aGlzLmF1dGhTdGF0ZVNlcnZpY2Uuc2V0QXV0aG9yaXphdGlvbkRhdGEodmFsaWRhdGlvblJlc3VsdC5hY2Nlc3NUb2tlbiwgY2FsbGJhY2tDb250ZXh0LmF1dGhSZXN1bHQpO1xyXG4gICAgICByZXR1cm4gb2YoY2FsbGJhY2tDb250ZXh0KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBhdXRob3JpemVkQ2FsbGJhY2ssIHRva2VuKHMpIHZhbGlkYXRpb24gZmFpbGVkLCByZXNldHRpbmcuIEhhc2g6ICR7d2luZG93LmxvY2F0aW9uLmhhc2h9YDtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoZXJyb3JNZXNzYWdlKTtcclxuICAgICAgdGhpcy5yZXNldEF1dGhvcml6YXRpb25EYXRhKCk7XHJcbiAgICAgIHRoaXMucHVibGlzaFVuYXV0aG9yaXplZFN0YXRlKGNhbGxiYWNrQ29udGV4dC52YWxpZGF0aW9uUmVzdWx0LCBjYWxsYmFja0NvbnRleHQuaXNSZW5ld1Byb2Nlc3MpO1xyXG4gICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvck1lc3NhZ2UpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gU1RFUCA1IHVzZXJEYXRhXHJcbiAgcHJpdmF0ZSBjYWxsYmFja1VzZXIoY2FsbGJhY2tDb250ZXh0OiBDYWxsYmFja0NvbnRleHQpOiBPYnNlcnZhYmxlPENhbGxiYWNrQ29udGV4dD4ge1xyXG4gICAgaWYgKCF0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLmF1dG9Vc2VyaW5mbykge1xyXG4gICAgICBpZiAoIWNhbGxiYWNrQ29udGV4dC5pc1JlbmV3UHJvY2Vzcykge1xyXG4gICAgICAgIC8vIHVzZXJEYXRhIGlzIHNldCB0byB0aGUgaWRfdG9rZW4gZGVjb2RlZCwgYXV0byBnZXQgdXNlciBkYXRhIHNldCB0byBmYWxzZVxyXG4gICAgICAgIHRoaXMudXNlclNlcnZpY2Uuc2V0VXNlckRhdGFUb1N0b3JlKGNhbGxiYWNrQ29udGV4dC52YWxpZGF0aW9uUmVzdWx0LmRlY29kZWRJZFRva2VuKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5wdWJsaXNoQXV0aG9yaXplZFN0YXRlKGNhbGxiYWNrQ29udGV4dC52YWxpZGF0aW9uUmVzdWx0LCBjYWxsYmFja0NvbnRleHQuaXNSZW5ld1Byb2Nlc3MpO1xyXG4gICAgICByZXR1cm4gb2YoY2FsbGJhY2tDb250ZXh0KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy51c2VyU2VydmljZVxyXG4gICAgICAuZ2V0QW5kUGVyc2lzdFVzZXJEYXRhSW5TdG9yZShcclxuICAgICAgICBjYWxsYmFja0NvbnRleHQuaXNSZW5ld1Byb2Nlc3MsXHJcbiAgICAgICAgY2FsbGJhY2tDb250ZXh0LnZhbGlkYXRpb25SZXN1bHQuaWRUb2tlbixcclxuICAgICAgICBjYWxsYmFja0NvbnRleHQudmFsaWRhdGlvblJlc3VsdC5kZWNvZGVkSWRUb2tlblxyXG4gICAgICApXHJcbiAgICAgIC5waXBlKFxyXG4gICAgICAgIHN3aXRjaE1hcCgodXNlckRhdGEpID0+IHtcclxuICAgICAgICAgIGlmICghIXVzZXJEYXRhKSB7XHJcbiAgICAgICAgICAgIGlmICghY2FsbGJhY2tDb250ZXh0LnJlZnJlc2hUb2tlbikge1xyXG4gICAgICAgICAgICAgIHRoaXMuZmxvd3NEYXRhU2VydmljZS5zZXRTZXNzaW9uU3RhdGUoY2FsbGJhY2tDb250ZXh0LmF1dGhSZXN1bHQuc2Vzc2lvbl9zdGF0ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5wdWJsaXNoQXV0aG9yaXplZFN0YXRlKGNhbGxiYWNrQ29udGV4dC52YWxpZGF0aW9uUmVzdWx0LCBjYWxsYmFja0NvbnRleHQuaXNSZW5ld1Byb2Nlc3MpO1xyXG4gICAgICAgICAgICByZXR1cm4gb2YoY2FsbGJhY2tDb250ZXh0KTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVzZXRBdXRob3JpemF0aW9uRGF0YSgpO1xyXG4gICAgICAgICAgICB0aGlzLnB1Ymxpc2hVbmF1dGhvcml6ZWRTdGF0ZShjYWxsYmFja0NvbnRleHQudmFsaWRhdGlvblJlc3VsdCwgY2FsbGJhY2tDb250ZXh0LmlzUmVuZXdQcm9jZXNzKTtcclxuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYENhbGxlZCBmb3IgdXNlckRhdGEgYnV0IHRoZXkgd2VyZSAke3VzZXJEYXRhfWA7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKGVycm9yTWVzc2FnZSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yTWVzc2FnZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSksXHJcbiAgICAgICAgY2F0Y2hFcnJvcigoZXJyKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgRmFpbGVkIHRvIHJldHJpZXZlIHVzZXIgaW5mbyB3aXRoIGVycm9yOiAgJHtlcnJ9YDtcclxuICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKGVycm9yTWVzc2FnZSk7XHJcbiAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvck1lc3NhZ2UpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHB1Ymxpc2hBdXRob3JpemVkU3RhdGUoc3RhdGVWYWxpZGF0aW9uUmVzdWx0OiBTdGF0ZVZhbGlkYXRpb25SZXN1bHQsIGlzUmVuZXdQcm9jZXNzOiBib29sZWFuKSB7XHJcbiAgICB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UudXBkYXRlQW5kUHVibGlzaEF1dGhTdGF0ZSh7XHJcbiAgICAgIGF1dGhvcml6YXRpb25TdGF0ZTogQXV0aG9yaXplZFN0YXRlLkF1dGhvcml6ZWQsXHJcbiAgICAgIHZhbGlkYXRpb25SZXN1bHQ6IHN0YXRlVmFsaWRhdGlvblJlc3VsdC5zdGF0ZSxcclxuICAgICAgaXNSZW5ld1Byb2Nlc3MsXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcHVibGlzaFVuYXV0aG9yaXplZFN0YXRlKHN0YXRlVmFsaWRhdGlvblJlc3VsdDogU3RhdGVWYWxpZGF0aW9uUmVzdWx0LCBpc1JlbmV3UHJvY2VzczogYm9vbGVhbikge1xyXG4gICAgdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLnVwZGF0ZUFuZFB1Ymxpc2hBdXRoU3RhdGUoe1xyXG4gICAgICBhdXRob3JpemF0aW9uU3RhdGU6IEF1dGhvcml6ZWRTdGF0ZS5VbmF1dGhvcml6ZWQsXHJcbiAgICAgIHZhbGlkYXRpb25SZXN1bHQ6IHN0YXRlVmFsaWRhdGlvblJlc3VsdC5zdGF0ZSxcclxuICAgICAgaXNSZW5ld1Byb2Nlc3MsXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlUmVzdWx0RXJyb3JGcm9tQ2FsbGJhY2socmVzdWx0OiBhbnksIGlzUmVuZXdQcm9jZXNzOiBib29sZWFuKSB7XHJcbiAgICBsZXQgdmFsaWRhdGlvblJlc3VsdCA9IFZhbGlkYXRpb25SZXN1bHQuU2VjdXJlVG9rZW5TZXJ2ZXJFcnJvcjtcclxuXHJcbiAgICBpZiAoKHJlc3VsdC5lcnJvciBhcyBzdHJpbmcpID09PSAnbG9naW5fcmVxdWlyZWQnKSB7XHJcbiAgICAgIHZhbGlkYXRpb25SZXN1bHQgPSBWYWxpZGF0aW9uUmVzdWx0LkxvZ2luUmVxdWlyZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLnVwZGF0ZUFuZFB1Ymxpc2hBdXRoU3RhdGUoe1xyXG4gICAgICBhdXRob3JpemF0aW9uU3RhdGU6IEF1dGhvcml6ZWRTdGF0ZS5VbmF1dGhvcml6ZWQsXHJcbiAgICAgIHZhbGlkYXRpb25SZXN1bHQsXHJcbiAgICAgIGlzUmVuZXdQcm9jZXNzLFxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhpc3RvcnlDbGVhblVwVHVybmVkT24oKSB7XHJcbiAgICByZXR1cm4gIXRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uaGlzdG9yeUNsZWFudXBPZmY7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlc2V0QnJvd3Nlckhpc3RvcnkoKSB7XHJcbiAgICB3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUoe30sIHdpbmRvdy5kb2N1bWVudC50aXRsZSwgd2luZG93LmxvY2F0aW9uLm9yaWdpbiArIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSk7XHJcbiAgfVxyXG59XHJcbiJdfQ==