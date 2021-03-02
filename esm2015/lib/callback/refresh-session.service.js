import { Injectable } from '@angular/core';
import { forkJoin, from, of, throwError, TimeoutError } from 'rxjs';
import { catchError, map, switchMap, take, timeout } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "../utils/flowHelper/flow-helper.service";
import * as i2 from "../config/config.provider";
import * as i3 from "../flows/flows-data.service";
import * as i4 from "../logging/logger.service";
import * as i5 from "../iframe/silent-renew.service";
import * as i6 from "../authState/auth-state.service";
import * as i7 from "../config/auth-well-known.service";
import * as i8 from "../iframe/refresh-session-iframe.service";
import * as i9 from "./refresh-session-refresh-token.service";
import * as i10 from "./../iframe/tabs-synchronization.service";
export const MAX_RETRY_ATTEMPTS = 3;
export class RefreshSessionService {
    constructor(flowHelper, configurationProvider, flowsDataService, loggerService, silentRenewService, authStateService, authWellKnownService, refreshSessionIframeService, refreshSessionRefreshTokenService, tabsSynchronizationService) {
        this.flowHelper = flowHelper;
        this.configurationProvider = configurationProvider;
        this.flowsDataService = flowsDataService;
        this.loggerService = loggerService;
        this.silentRenewService = silentRenewService;
        this.authStateService = authStateService;
        this.authWellKnownService = authWellKnownService;
        this.refreshSessionIframeService = refreshSessionIframeService;
        this.refreshSessionRefreshTokenService = refreshSessionRefreshTokenService;
        this.tabsSynchronizationService = tabsSynchronizationService;
    }
    forceRefreshSession(customParams) {
        if (this.flowHelper.isCurrentFlowCodeFlowWithRefreshTokens()) {
            return this.startRefreshSession(customParams).pipe(map(() => {
                const isAuthenticated = this.authStateService.areAuthStorageTokensValid();
                if (isAuthenticated) {
                    return {
                        idToken: this.authStateService.getIdToken(),
                        accessToken: this.authStateService.getAccessToken(),
                    };
                }
                return null;
            }));
        }
        return this.silentRenewCase();
    }
    silentRenewCase(customParams, currentRetry) {
        this.loggerService.logDebug(`silentRenewCase CURRENT RETRY ATTEMPT #${currentRetry}`);
        if (currentRetry && currentRetry > MAX_RETRY_ATTEMPTS) {
            return throwError(new Error('Initializatin has been failed. Exceeded max retry attepmts.'));
        }
        return from(this.tabsSynchronizationService.isLeaderCheck()).pipe(timeout(2000), take(1), switchMap((isLeader) => {
            if (isLeader) {
                this.loggerService.logDebug(`forceRefreshSession WE ARE LEADER`);
                return forkJoin([
                    this.startRefreshSession(customParams),
                    this.silentRenewService.refreshSessionWithIFrameCompleted$.pipe(take(1)),
                ]).pipe(timeout(5000), map(([_, callbackContext]) => {
                    var _a, _b;
                    const isAuthenticated = this.authStateService.areAuthStorageTokensValid();
                    if (isAuthenticated) {
                        return {
                            idToken: (_a = callbackContext === null || callbackContext === void 0 ? void 0 : callbackContext.authResult) === null || _a === void 0 ? void 0 : _a.id_token,
                            accessToken: (_b = callbackContext === null || callbackContext === void 0 ? void 0 : callbackContext.authResult) === null || _b === void 0 ? void 0 : _b.access_token,
                        };
                    }
                    return null;
                }), catchError((error) => {
                    if (error instanceof TimeoutError) {
                        this.loggerService.logWarning(`forceRefreshSession WE ARE LEADER > occured TIMEOUT ERROR SO WE RETRY: this.forceRefreshSession(customParams)`);
                        if (currentRetry) {
                            currentRetry++;
                        }
                        else {
                            currentRetry = 1;
                        }
                        return this.silentRenewCase(customParams, currentRetry).pipe(take(1));
                    }
                    throw error;
                }));
            }
            else {
                this.loggerService.logDebug(`forceRefreshSession WE ARE NOT NOT NOT LEADER`);
                return this.tabsSynchronizationService.getSilentRenewFinishedObservable().pipe(take(1), timeout(5000), catchError((error) => {
                    if (error instanceof TimeoutError) {
                        this.loggerService.logWarning(`forceRefreshSession WE ARE NOT NOT NOT LEADER > occured TIMEOUT ERROR SO WE RETRY: this.forceRefreshSession(customParams)`);
                        if (currentRetry) {
                            currentRetry++;
                        }
                        else {
                            currentRetry = 1;
                        }
                        return this.silentRenewCase(customParams, currentRetry).pipe(take(1));
                    }
                    throw error;
                }), map(() => {
                    const isAuthenticated = this.authStateService.areAuthStorageTokensValid();
                    this.loggerService.logDebug(`forceRefreshSession WE ARE NOT NOT NOT LEADER > getSilentRenewFinishedObservable EMMITS VALUE > isAuthenticated = ${isAuthenticated}`);
                    if (isAuthenticated) {
                        return {
                            idToken: this.authStateService.getIdToken(),
                            accessToken: this.authStateService.getAccessToken(),
                        };
                    }
                    this.loggerService.logError(`forceRefreshSession WE ARE NOT NOT NOT LEADER > getSilentRenewFinishedObservable EMMITS VALUE > isAuthenticated FALSE WE DONT KNOW WAHT TO DO WITH THIS`);
                    return null;
                }));
            }
        }), catchError((error) => {
            if (error instanceof TimeoutError) {
                this.loggerService.logWarning(`forceRefreshSession > FROM isLeaderCheck > occured TIMEOUT ERROR SO WE RETRY: this.forceRefreshSession(customParams)`);
                if (currentRetry) {
                    currentRetry++;
                }
                else {
                    currentRetry = 1;
                }
                return this.silentRenewCase(customParams, currentRetry);
            }
            throw error;
        }));
    }
    startRefreshSession(customParams) {
        var _a;
        const isSilentRenewRunning = this.flowsDataService.isSilentRenewRunning();
        this.loggerService.logDebug(`Checking: silentRenewRunning: ${isSilentRenewRunning}`);
        const shouldBeExecuted = !isSilentRenewRunning;
        if (!shouldBeExecuted) {
            return of(null);
        }
        const authWellknownEndpointAdress = (_a = this.configurationProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.authWellknownEndpoint;
        if (!authWellknownEndpointAdress) {
            this.loggerService.logError('no authwellknownendpoint given!');
            return of(null);
        }
        return this.authWellKnownService.getAuthWellKnownEndPoints(authWellknownEndpointAdress).pipe(switchMap(() => {
            this.flowsDataService.setSilentRenewRunning();
            if (this.flowHelper.isCurrentFlowCodeFlowWithRefreshTokens()) {
                // Refresh Session using Refresh tokens
                return this.refreshSessionRefreshTokenService.refreshSessionWithRefreshTokens(customParams);
            }
            return this.refreshSessionIframeService.refreshSessionWithIframe(customParams, 'login');
        }));
    }
}
RefreshSessionService.ɵfac = function RefreshSessionService_Factory(t) { return new (t || RefreshSessionService)(i0.ɵɵinject(i1.FlowHelper), i0.ɵɵinject(i2.ConfigurationProvider), i0.ɵɵinject(i3.FlowsDataService), i0.ɵɵinject(i4.LoggerService), i0.ɵɵinject(i5.SilentRenewService), i0.ɵɵinject(i6.AuthStateService), i0.ɵɵinject(i7.AuthWellKnownService), i0.ɵɵinject(i8.RefreshSessionIframeService), i0.ɵɵinject(i9.RefreshSessionRefreshTokenService), i0.ɵɵinject(i10.TabsSynchronizationService)); };
RefreshSessionService.ɵprov = i0.ɵɵdefineInjectable({ token: RefreshSessionService, factory: RefreshSessionService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(RefreshSessionService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], function () { return [{ type: i1.FlowHelper }, { type: i2.ConfigurationProvider }, { type: i3.FlowsDataService }, { type: i4.LoggerService }, { type: i5.SilentRenewService }, { type: i6.AuthStateService }, { type: i7.AuthWellKnownService }, { type: i8.RefreshSessionIframeService }, { type: i9.RefreshSessionRefreshTokenService }, { type: i10.TabsSynchronizationService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmcmVzaC1zZXNzaW9uLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy8iLCJzb3VyY2VzIjpbImxpYi9jYWxsYmFjay9yZWZyZXNoLXNlc3Npb24uc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFjLEVBQUUsRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ2hGLE9BQU8sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7Ozs7Ozs7Ozs7OztBQVkzRSxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLENBQUM7QUFFcEMsTUFBTSxPQUFPLHFCQUFxQjtJQUNoQyxZQUNVLFVBQXNCLEVBQ3RCLHFCQUE0QyxFQUM1QyxnQkFBa0MsRUFDbEMsYUFBNEIsRUFDNUIsa0JBQXNDLEVBQ3RDLGdCQUFrQyxFQUNsQyxvQkFBMEMsRUFDMUMsMkJBQXdELEVBQ3hELGlDQUFvRSxFQUNwRSwwQkFBc0Q7UUFUdEQsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUN0QiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1FBQzVDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFDNUIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtRQUN0QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBc0I7UUFDMUMsZ0NBQTJCLEdBQTNCLDJCQUEyQixDQUE2QjtRQUN4RCxzQ0FBaUMsR0FBakMsaUNBQWlDLENBQW1DO1FBQ3BFLCtCQUEwQixHQUExQiww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RTtZQUNiLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBRTlDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxzQ0FBc0MsRUFBRSxFQUFFO2dCQUM1RCx1Q0FBdUM7Z0JBQ3ZDLE9BQU8sSUFBSSxDQUFDLGlDQUFpQyxDQUFDLCtCQUErQixDQUFDLFlBQVksQ0FBQyxDQUFDO2FBQzdGO1lBRUQsT0FBTyxJQUFJLENBQUMsMkJBQTJCLENBQUMsd0JBQXdCLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzFGLENBQUMsQ0FBQyxDQUNILENBQUM7SUFDSixDQUFDOzswRkFqTFUscUJBQXFCOzZEQUFyQixxQkFBcUIsV0FBckIscUJBQXFCLG1CQURSLE1BQU07a0RBQ25CLHFCQUFxQjtjQURqQyxVQUFVO2VBQUMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBmb3JrSm9pbiwgZnJvbSwgT2JzZXJ2YWJsZSwgb2YsIHRocm93RXJyb3IsIFRpbWVvdXRFcnJvciB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBjYXRjaEVycm9yLCBtYXAsIHN3aXRjaE1hcCwgdGFrZSwgdGltZW91dCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuaW1wb3J0IHsgQXV0aFN0YXRlU2VydmljZSB9IGZyb20gJy4uL2F1dGhTdGF0ZS9hdXRoLXN0YXRlLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBBdXRoV2VsbEtub3duU2VydmljZSB9IGZyb20gJy4uL2NvbmZpZy9hdXRoLXdlbGwta25vd24uc2VydmljZSc7XHJcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25Qcm92aWRlciB9IGZyb20gJy4uL2NvbmZpZy9jb25maWcucHJvdmlkZXInO1xyXG5pbXBvcnQgeyBGbG93c0RhdGFTZXJ2aWNlIH0gZnJvbSAnLi4vZmxvd3MvZmxvd3MtZGF0YS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgUmVmcmVzaFNlc3Npb25JZnJhbWVTZXJ2aWNlIH0gZnJvbSAnLi4vaWZyYW1lL3JlZnJlc2gtc2Vzc2lvbi1pZnJhbWUuc2VydmljZSc7XHJcbmltcG9ydCB7IFNpbGVudFJlbmV3U2VydmljZSB9IGZyb20gJy4uL2lmcmFtZS9zaWxlbnQtcmVuZXcuc2VydmljZSc7XHJcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgRmxvd0hlbHBlciB9IGZyb20gJy4uL3V0aWxzL2Zsb3dIZWxwZXIvZmxvdy1oZWxwZXIuc2VydmljZSc7XHJcbmltcG9ydCB7IFRhYnNTeW5jaHJvbml6YXRpb25TZXJ2aWNlIH0gZnJvbSAnLi8uLi9pZnJhbWUvdGFicy1zeW5jaHJvbml6YXRpb24uc2VydmljZSc7XHJcbmltcG9ydCB7IFJlZnJlc2hTZXNzaW9uUmVmcmVzaFRva2VuU2VydmljZSB9IGZyb20gJy4vcmVmcmVzaC1zZXNzaW9uLXJlZnJlc2gtdG9rZW4uc2VydmljZSc7XHJcblxyXG5leHBvcnQgY29uc3QgTUFYX1JFVFJZX0FUVEVNUFRTID0gMztcclxuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiAncm9vdCcgfSlcclxuZXhwb3J0IGNsYXNzIFJlZnJlc2hTZXNzaW9uU2VydmljZSB7XHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIGZsb3dIZWxwZXI6IEZsb3dIZWxwZXIsXHJcbiAgICBwcml2YXRlIGNvbmZpZ3VyYXRpb25Qcm92aWRlcjogQ29uZmlndXJhdGlvblByb3ZpZGVyLFxyXG4gICAgcHJpdmF0ZSBmbG93c0RhdGFTZXJ2aWNlOiBGbG93c0RhdGFTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBsb2dnZXJTZXJ2aWNlOiBMb2dnZXJTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBzaWxlbnRSZW5ld1NlcnZpY2U6IFNpbGVudFJlbmV3U2VydmljZSxcclxuICAgIHByaXZhdGUgYXV0aFN0YXRlU2VydmljZTogQXV0aFN0YXRlU2VydmljZSxcclxuICAgIHByaXZhdGUgYXV0aFdlbGxLbm93blNlcnZpY2U6IEF1dGhXZWxsS25vd25TZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSByZWZyZXNoU2Vzc2lvbklmcmFtZVNlcnZpY2U6IFJlZnJlc2hTZXNzaW9uSWZyYW1lU2VydmljZSxcclxuICAgIHByaXZhdGUgcmVmcmVzaFNlc3Npb25SZWZyZXNoVG9rZW5TZXJ2aWNlOiBSZWZyZXNoU2Vzc2lvblJlZnJlc2hUb2tlblNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHRhYnNTeW5jaHJvbml6YXRpb25TZXJ2aWNlOiBUYWJzU3luY2hyb25pemF0aW9uU2VydmljZVxyXG4gICkge31cclxuXHJcbiAgZm9yY2VSZWZyZXNoU2Vzc2lvbihjdXN0b21QYXJhbXM/OiB7XHJcbiAgICBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuO1xyXG4gIH0pOiBPYnNlcnZhYmxlPHtcclxuICAgIGlkVG9rZW46IGFueTtcclxuICAgIGFjY2Vzc1Rva2VuOiBhbnk7XHJcbiAgfT4ge1xyXG4gICAgaWYgKHRoaXMuZmxvd0hlbHBlci5pc0N1cnJlbnRGbG93Q29kZUZsb3dXaXRoUmVmcmVzaFRva2VucygpKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnN0YXJ0UmVmcmVzaFNlc3Npb24oY3VzdG9tUGFyYW1zKS5waXBlKFxyXG4gICAgICAgIG1hcCgoKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBpc0F1dGhlbnRpY2F0ZWQgPSB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UuYXJlQXV0aFN0b3JhZ2VUb2tlbnNWYWxpZCgpO1xyXG4gICAgICAgICAgaWYgKGlzQXV0aGVudGljYXRlZCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgIGlkVG9rZW46IHRoaXMuYXV0aFN0YXRlU2VydmljZS5nZXRJZFRva2VuKCksXHJcbiAgICAgICAgICAgICAgYWNjZXNzVG9rZW46IHRoaXMuYXV0aFN0YXRlU2VydmljZS5nZXRBY2Nlc3NUb2tlbigpLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuc2lsZW50UmVuZXdDYXNlKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNpbGVudFJlbmV3Q2FzZShcclxuICAgIGN1c3RvbVBhcmFtcz86IHtcclxuICAgICAgW2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbjtcclxuICAgIH0sXHJcbiAgICBjdXJyZW50UmV0cnk/OiBudW1iZXJcclxuICApOiBPYnNlcnZhYmxlPHtcclxuICAgIGlkVG9rZW46IGFueTtcclxuICAgIGFjY2Vzc1Rva2VuOiBhbnk7XHJcbiAgfT4ge1xyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBzaWxlbnRSZW5ld0Nhc2UgQ1VSUkVOVCBSRVRSWSBBVFRFTVBUICMke2N1cnJlbnRSZXRyeX1gKTtcclxuICAgIGlmIChjdXJyZW50UmV0cnkgJiYgY3VycmVudFJldHJ5ID4gTUFYX1JFVFJZX0FUVEVNUFRTKSB7XHJcbiAgICAgIHJldHVybiB0aHJvd0Vycm9yKG5ldyBFcnJvcignSW5pdGlhbGl6YXRpbiBoYXMgYmVlbiBmYWlsZWQuIEV4Y2VlZGVkIG1heCByZXRyeSBhdHRlcG10cy4nKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZyb20odGhpcy50YWJzU3luY2hyb25pemF0aW9uU2VydmljZS5pc0xlYWRlckNoZWNrKCkpLnBpcGUoXHJcbiAgICAgIHRpbWVvdXQoMjAwMCksXHJcbiAgICAgIHRha2UoMSksXHJcbiAgICAgIHN3aXRjaE1hcCgoaXNMZWFkZXIpID0+IHtcclxuICAgICAgICBpZiAoaXNMZWFkZXIpIHtcclxuICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgZm9yY2VSZWZyZXNoU2Vzc2lvbiBXRSBBUkUgTEVBREVSYCk7XHJcbiAgICAgICAgICByZXR1cm4gZm9ya0pvaW4oW1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0UmVmcmVzaFNlc3Npb24oY3VzdG9tUGFyYW1zKSxcclxuICAgICAgICAgICAgdGhpcy5zaWxlbnRSZW5ld1NlcnZpY2UucmVmcmVzaFNlc3Npb25XaXRoSUZyYW1lQ29tcGxldGVkJC5waXBlKHRha2UoMSkpLFxyXG4gICAgICAgICAgXSkucGlwZShcclxuICAgICAgICAgICAgdGltZW91dCg1MDAwKSxcclxuICAgICAgICAgICAgbWFwKChbXywgY2FsbGJhY2tDb250ZXh0XSkgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGlzQXV0aGVudGljYXRlZCA9IHRoaXMuYXV0aFN0YXRlU2VydmljZS5hcmVBdXRoU3RvcmFnZVRva2Vuc1ZhbGlkKCk7XHJcbiAgICAgICAgICAgICAgaWYgKGlzQXV0aGVudGljYXRlZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgaWRUb2tlbjogY2FsbGJhY2tDb250ZXh0Py5hdXRoUmVzdWx0Py5pZF90b2tlbixcclxuICAgICAgICAgICAgICAgICAgYWNjZXNzVG9rZW46IGNhbGxiYWNrQ29udGV4dD8uYXV0aFJlc3VsdD8uYWNjZXNzX3Rva2VuLFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgY2F0Y2hFcnJvcigoZXJyb3IpID0+IHtcclxuICAgICAgICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBUaW1lb3V0RXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKFxyXG4gICAgICAgICAgICAgICAgICBgZm9yY2VSZWZyZXNoU2Vzc2lvbiBXRSBBUkUgTEVBREVSID4gb2NjdXJlZCBUSU1FT1VUIEVSUk9SIFNPIFdFIFJFVFJZOiB0aGlzLmZvcmNlUmVmcmVzaFNlc3Npb24oY3VzdG9tUGFyYW1zKWBcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudFJldHJ5KSB7XHJcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRSZXRyeSsrO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgY3VycmVudFJldHJ5ID0gMTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNpbGVudFJlbmV3Q2FzZShjdXN0b21QYXJhbXMsIGN1cnJlbnRSZXRyeSkucGlwZSh0YWtlKDEpKTtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIHRocm93IGVycm9yO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBmb3JjZVJlZnJlc2hTZXNzaW9uIFdFIEFSRSBOT1QgTk9UIE5PVCBMRUFERVJgKTtcclxuICAgICAgICAgIHJldHVybiB0aGlzLnRhYnNTeW5jaHJvbml6YXRpb25TZXJ2aWNlLmdldFNpbGVudFJlbmV3RmluaXNoZWRPYnNlcnZhYmxlKCkucGlwZShcclxuICAgICAgICAgICAgdGFrZSgxKSxcclxuICAgICAgICAgICAgdGltZW91dCg1MDAwKSxcclxuICAgICAgICAgICAgY2F0Y2hFcnJvcigoZXJyb3IpID0+IHtcclxuICAgICAgICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBUaW1lb3V0RXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKFxyXG4gICAgICAgICAgICAgICAgICBgZm9yY2VSZWZyZXNoU2Vzc2lvbiBXRSBBUkUgTk9UIE5PVCBOT1QgTEVBREVSID4gb2NjdXJlZCBUSU1FT1VUIEVSUk9SIFNPIFdFIFJFVFJZOiB0aGlzLmZvcmNlUmVmcmVzaFNlc3Npb24oY3VzdG9tUGFyYW1zKWBcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudFJldHJ5KSB7XHJcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRSZXRyeSsrO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgY3VycmVudFJldHJ5ID0gMTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNpbGVudFJlbmV3Q2FzZShjdXN0b21QYXJhbXMsIGN1cnJlbnRSZXRyeSkucGlwZSh0YWtlKDEpKTtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIHRocm93IGVycm9yO1xyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgbWFwKCgpID0+IHtcclxuICAgICAgICAgICAgICBjb25zdCBpc0F1dGhlbnRpY2F0ZWQgPSB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UuYXJlQXV0aFN0b3JhZ2VUb2tlbnNWYWxpZCgpO1xyXG4gICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhcclxuICAgICAgICAgICAgICAgIGBmb3JjZVJlZnJlc2hTZXNzaW9uIFdFIEFSRSBOT1QgTk9UIE5PVCBMRUFERVIgPiBnZXRTaWxlbnRSZW5ld0ZpbmlzaGVkT2JzZXJ2YWJsZSBFTU1JVFMgVkFMVUUgPiBpc0F1dGhlbnRpY2F0ZWQgPSAke2lzQXV0aGVudGljYXRlZH1gXHJcbiAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICBpZiAoaXNBdXRoZW50aWNhdGVkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICBpZFRva2VuOiB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UuZ2V0SWRUb2tlbigpLFxyXG4gICAgICAgICAgICAgICAgICBhY2Nlc3NUb2tlbjogdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLmdldEFjY2Vzc1Rva2VuKCksXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKFxyXG4gICAgICAgICAgICAgICAgYGZvcmNlUmVmcmVzaFNlc3Npb24gV0UgQVJFIE5PVCBOT1QgTk9UIExFQURFUiA+IGdldFNpbGVudFJlbmV3RmluaXNoZWRPYnNlcnZhYmxlIEVNTUlUUyBWQUxVRSA+IGlzQXV0aGVudGljYXRlZCBGQUxTRSBXRSBET05UIEtOT1cgV0FIVCBUTyBETyBXSVRIIFRISVNgXHJcbiAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KSxcclxuICAgICAgY2F0Y2hFcnJvcigoZXJyb3IpID0+IHtcclxuICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBUaW1lb3V0RXJyb3IpIHtcclxuICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKFxyXG4gICAgICAgICAgICBgZm9yY2VSZWZyZXNoU2Vzc2lvbiA+IEZST00gaXNMZWFkZXJDaGVjayA+IG9jY3VyZWQgVElNRU9VVCBFUlJPUiBTTyBXRSBSRVRSWTogdGhpcy5mb3JjZVJlZnJlc2hTZXNzaW9uKGN1c3RvbVBhcmFtcylgXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgaWYgKGN1cnJlbnRSZXRyeSkge1xyXG4gICAgICAgICAgICBjdXJyZW50UmV0cnkrKztcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRSZXRyeSA9IDE7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5zaWxlbnRSZW5ld0Nhc2UoY3VzdG9tUGFyYW1zLCBjdXJyZW50UmV0cnkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzdGFydFJlZnJlc2hTZXNzaW9uKGN1c3RvbVBhcmFtcz86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB9KSB7XHJcbiAgICBjb25zdCBpc1NpbGVudFJlbmV3UnVubmluZyA9IHRoaXMuZmxvd3NEYXRhU2VydmljZS5pc1NpbGVudFJlbmV3UnVubmluZygpO1xyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBDaGVja2luZzogc2lsZW50UmVuZXdSdW5uaW5nOiAke2lzU2lsZW50UmVuZXdSdW5uaW5nfWApO1xyXG4gICAgY29uc3Qgc2hvdWxkQmVFeGVjdXRlZCA9ICFpc1NpbGVudFJlbmV3UnVubmluZztcclxuXHJcbiAgICBpZiAoIXNob3VsZEJlRXhlY3V0ZWQpIHtcclxuICAgICAgcmV0dXJuIG9mKG51bGwpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGF1dGhXZWxsa25vd25FbmRwb2ludEFkcmVzcyA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24/LmF1dGhXZWxsa25vd25FbmRwb2ludDtcclxuXHJcbiAgICBpZiAoIWF1dGhXZWxsa25vd25FbmRwb2ludEFkcmVzcykge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoJ25vIGF1dGh3ZWxsa25vd25lbmRwb2ludCBnaXZlbiEnKTtcclxuICAgICAgcmV0dXJuIG9mKG51bGwpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzLmF1dGhXZWxsS25vd25TZXJ2aWNlLmdldEF1dGhXZWxsS25vd25FbmRQb2ludHMoYXV0aFdlbGxrbm93bkVuZHBvaW50QWRyZXNzKS5waXBlKFxyXG4gICAgICBzd2l0Y2hNYXAoKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuZmxvd3NEYXRhU2VydmljZS5zZXRTaWxlbnRSZW5ld1J1bm5pbmcoKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZmxvd0hlbHBlci5pc0N1cnJlbnRGbG93Q29kZUZsb3dXaXRoUmVmcmVzaFRva2VucygpKSB7XHJcbiAgICAgICAgICAvLyBSZWZyZXNoIFNlc3Npb24gdXNpbmcgUmVmcmVzaCB0b2tlbnNcclxuICAgICAgICAgIHJldHVybiB0aGlzLnJlZnJlc2hTZXNzaW9uUmVmcmVzaFRva2VuU2VydmljZS5yZWZyZXNoU2Vzc2lvbldpdGhSZWZyZXNoVG9rZW5zKGN1c3RvbVBhcmFtcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5yZWZyZXNoU2Vzc2lvbklmcmFtZVNlcnZpY2UucmVmcmVzaFNlc3Npb25XaXRoSWZyYW1lKGN1c3RvbVBhcmFtcywgJ2xvZ2luJyk7XHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLy8gcHJpdmF0ZSB0aW1lb3V0UmV0cnlTdHJhdGVneShlcnJvckF0dGVtcHRzOiBPYnNlcnZhYmxlPGFueT4pIHtcclxuICAvLyAgIHJldHVybiBlcnJvckF0dGVtcHRzLnBpcGUoXHJcbiAgLy8gICAgIG1lcmdlTWFwKChlcnJvciwgaW5kZXgpID0+IHtcclxuICAvLyAgICAgICBjb25zdCBzY2FsaW5nRHVyYXRpb24gPSAxMDAwO1xyXG4gIC8vICAgICAgIGNvbnN0IGN1cnJlbnRBdHRlbXB0ID0gaW5kZXggKyAxO1xyXG5cclxuICAvLyAgICAgICBpZiAoIShlcnJvciBpbnN0YW5jZW9mIFRpbWVvdXRFcnJvcikgfHwgY3VycmVudEF0dGVtcHQgPiBNQVhfUkVUUllfQVRURU1QVFMpIHtcclxuICAvLyAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yKTtcclxuICAvLyAgICAgICB9XHJcblxyXG4gIC8vICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgZm9yY2VSZWZyZXNoU2Vzc2lvbiB0aW1lb3V0LiBBdHRlbXB0ICMke2N1cnJlbnRBdHRlbXB0fWApO1xyXG5cclxuICAvLyAgICAgICB0aGlzLmZsb3dzRGF0YVNlcnZpY2UucmVzZXRTaWxlbnRSZW5ld1J1bm5pbmcoKTtcclxuICAvLyAgICAgICByZXR1cm4gdGltZXIoY3VycmVudEF0dGVtcHQgKiBzY2FsaW5nRHVyYXRpb24pO1xyXG4gIC8vICAgICB9KVxyXG4gIC8vICAgKTtcclxuICAvLyB9XHJcbn1cclxuIl19