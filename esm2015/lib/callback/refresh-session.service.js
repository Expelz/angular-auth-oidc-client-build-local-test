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
                ]).pipe(timeout(this.configurationProvider.openIDConfiguration.silentRenewTimeoutInSeconds * 1000), map(([_, callbackContext]) => {
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
                        return this.silentRenewCase(customParams, currentRetry);
                    }
                    throw error;
                }));
            }
            else {
                this.loggerService.logDebug(`forceRefreshSession WE ARE NOT NOT NOT LEADER`);
                return this.tabsSynchronizationService.getSilentRenewFinishedObservable().pipe(take(1), timeout(this.configurationProvider.openIDConfiguration.silentRenewTimeoutInSeconds * 1000), catchError((error) => {
                    if (error instanceof TimeoutError) {
                        this.loggerService.logWarning(`forceRefreshSession WE ARE NOT NOT NOT LEADER > occured TIMEOUT ERROR SO WE RETRY: this.forceRefreshSession(customParams)`);
                        if (currentRetry) {
                            currentRetry++;
                        }
                        else {
                            currentRetry = 1;
                        }
                        return this.silentRenewCase(customParams, currentRetry);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmcmVzaC1zZXNzaW9uLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy8iLCJzb3VyY2VzIjpbImxpYi9jYWxsYmFjay9yZWZyZXNoLXNlc3Npb24uc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFjLEVBQUUsRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ2hGLE9BQU8sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7Ozs7Ozs7Ozs7OztBQVkzRSxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLENBQUM7QUFFcEMsTUFBTSxPQUFPLHFCQUFxQjtJQUNoQyxZQUNVLFVBQXNCLEVBQ3RCLHFCQUE0QyxFQUM1QyxnQkFBa0MsRUFDbEMsYUFBNEIsRUFDNUIsa0JBQXNDLEVBQ3RDLGdCQUFrQyxFQUNsQyxvQkFBMEMsRUFDMUMsMkJBQXdELEVBQ3hELGlDQUFvRSxFQUNwRSwwQkFBc0Q7UUFUdEQsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUN0QiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1FBQzVDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFDNUIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtRQUN0QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBc0I7UUFDMUMsZ0NBQTJCLEdBQTNCLDJCQUEyQixDQUE2QjtRQUN4RCxzQ0FBaUMsR0FBakMsaUNBQWlDLENBQW1DO1FBQ3BFLCtCQUEwQixHQUExQiww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LENBQUMsR0FBRyxFQUFFO1lBQ2IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFFOUMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLHNDQUFzQyxFQUFFLEVBQUU7Z0JBQzVELHVDQUF1QztnQkFDdkMsT0FBTyxJQUFJLENBQUMsaUNBQWlDLENBQUMsK0JBQStCLENBQUMsWUFBWSxDQUFDLENBQUM7YUFDN0Y7WUFFRCxPQUFPLElBQUksQ0FBQywyQkFBMkIsQ0FBQyx3QkFBd0IsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDMUYsQ0FBQyxDQUFDLENBQ0gsQ0FBQztJQUNKLENBQUM7OzBGQWpMVSxxQkFBcUI7NkRBQXJCLHFCQUFxQixXQUFyQixxQkFBcUIsbUJBRFIsTUFBTTtrREFDbkIscUJBQXFCO2NBRGpDLFVBQVU7ZUFBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IGZvcmtKb2luLCBmcm9tLCBPYnNlcnZhYmxlLCBvZiwgdGhyb3dFcnJvciwgVGltZW91dEVycm9yIH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IGNhdGNoRXJyb3IsIG1hcCwgc3dpdGNoTWFwLCB0YWtlLCB0aW1lb3V0IH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQgeyBBdXRoU3RhdGVTZXJ2aWNlIH0gZnJvbSAnLi4vYXV0aFN0YXRlL2F1dGgtc3RhdGUuc2VydmljZSc7XHJcbmltcG9ydCB7IEF1dGhXZWxsS25vd25TZXJ2aWNlIH0gZnJvbSAnLi4vY29uZmlnL2F1dGgtd2VsbC1rbm93bi5zZXJ2aWNlJztcclxuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi4vY29uZmlnL2NvbmZpZy5wcm92aWRlcic7XHJcbmltcG9ydCB7IEZsb3dzRGF0YVNlcnZpY2UgfSBmcm9tICcuLi9mbG93cy9mbG93cy1kYXRhLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBSZWZyZXNoU2Vzc2lvbklmcmFtZVNlcnZpY2UgfSBmcm9tICcuLi9pZnJhbWUvcmVmcmVzaC1zZXNzaW9uLWlmcmFtZS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgU2lsZW50UmVuZXdTZXJ2aWNlIH0gZnJvbSAnLi4vaWZyYW1lL3NpbGVudC1yZW5ldy5zZXJ2aWNlJztcclxuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBGbG93SGVscGVyIH0gZnJvbSAnLi4vdXRpbHMvZmxvd0hlbHBlci9mbG93LWhlbHBlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgVGFic1N5bmNocm9uaXphdGlvblNlcnZpY2UgfSBmcm9tICcuLy4uL2lmcmFtZS90YWJzLXN5bmNocm9uaXphdGlvbi5zZXJ2aWNlJztcclxuaW1wb3J0IHsgUmVmcmVzaFNlc3Npb25SZWZyZXNoVG9rZW5TZXJ2aWNlIH0gZnJvbSAnLi9yZWZyZXNoLXNlc3Npb24tcmVmcmVzaC10b2tlbi5zZXJ2aWNlJztcclxuXHJcbmV4cG9ydCBjb25zdCBNQVhfUkVUUllfQVRURU1QVFMgPSAzO1xyXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxyXG5leHBvcnQgY2xhc3MgUmVmcmVzaFNlc3Npb25TZXJ2aWNlIHtcclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgZmxvd0hlbHBlcjogRmxvd0hlbHBlcixcclxuICAgIHByaXZhdGUgY29uZmlndXJhdGlvblByb3ZpZGVyOiBDb25maWd1cmF0aW9uUHJvdmlkZXIsXHJcbiAgICBwcml2YXRlIGZsb3dzRGF0YVNlcnZpY2U6IEZsb3dzRGF0YVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHNpbGVudFJlbmV3U2VydmljZTogU2lsZW50UmVuZXdTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBhdXRoU3RhdGVTZXJ2aWNlOiBBdXRoU3RhdGVTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBhdXRoV2VsbEtub3duU2VydmljZTogQXV0aFdlbGxLbm93blNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHJlZnJlc2hTZXNzaW9uSWZyYW1lU2VydmljZTogUmVmcmVzaFNlc3Npb25JZnJhbWVTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSByZWZyZXNoU2Vzc2lvblJlZnJlc2hUb2tlblNlcnZpY2U6IFJlZnJlc2hTZXNzaW9uUmVmcmVzaFRva2VuU2VydmljZSxcclxuICAgIHByaXZhdGUgdGFic1N5bmNocm9uaXphdGlvblNlcnZpY2U6IFRhYnNTeW5jaHJvbml6YXRpb25TZXJ2aWNlXHJcbiAgKSB7fVxyXG5cclxuICBmb3JjZVJlZnJlc2hTZXNzaW9uKGN1c3RvbVBhcmFtcz86IHtcclxuICAgIFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW47XHJcbiAgfSk6IE9ic2VydmFibGU8e1xyXG4gICAgaWRUb2tlbjogYW55O1xyXG4gICAgYWNjZXNzVG9rZW46IGFueTtcclxuICB9PiB7XHJcbiAgICBpZiAodGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dDb2RlRmxvd1dpdGhSZWZyZXNoVG9rZW5zKCkpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuc3RhcnRSZWZyZXNoU2Vzc2lvbihjdXN0b21QYXJhbXMpLnBpcGUoXHJcbiAgICAgICAgbWFwKCgpID0+IHtcclxuICAgICAgICAgIGNvbnN0IGlzQXV0aGVudGljYXRlZCA9IHRoaXMuYXV0aFN0YXRlU2VydmljZS5hcmVBdXRoU3RvcmFnZVRva2Vuc1ZhbGlkKCk7XHJcbiAgICAgICAgICBpZiAoaXNBdXRoZW50aWNhdGVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgaWRUb2tlbjogdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLmdldElkVG9rZW4oKSxcclxuICAgICAgICAgICAgICBhY2Nlc3NUb2tlbjogdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLmdldEFjY2Vzc1Rva2VuKCksXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfSlcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5zaWxlbnRSZW5ld0Nhc2UoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2lsZW50UmVuZXdDYXNlKFxyXG4gICAgY3VzdG9tUGFyYW1zPzoge1xyXG4gICAgICBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuO1xyXG4gICAgfSxcclxuICAgIGN1cnJlbnRSZXRyeT86IG51bWJlclxyXG4gICk6IE9ic2VydmFibGU8e1xyXG4gICAgaWRUb2tlbjogYW55O1xyXG4gICAgYWNjZXNzVG9rZW46IGFueTtcclxuICB9PiB7XHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYHNpbGVudFJlbmV3Q2FzZSBDVVJSRU5UIFJFVFJZIEFUVEVNUFQgIyR7Y3VycmVudFJldHJ5fWApO1xyXG4gICAgaWYgKGN1cnJlbnRSZXRyeSAmJiBjdXJyZW50UmV0cnkgPiBNQVhfUkVUUllfQVRURU1QVFMpIHtcclxuICAgICAgcmV0dXJuIHRocm93RXJyb3IobmV3IEVycm9yKCdJbml0aWFsaXphdGluIGhhcyBiZWVuIGZhaWxlZC4gRXhjZWVkZWQgbWF4IHJldHJ5IGF0dGVwbXRzLicpKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZnJvbSh0aGlzLnRhYnNTeW5jaHJvbml6YXRpb25TZXJ2aWNlLmlzTGVhZGVyQ2hlY2soKSkucGlwZShcclxuICAgICAgdGltZW91dCgyMDAwKSxcclxuICAgICAgdGFrZSgxKSxcclxuICAgICAgc3dpdGNoTWFwKChpc0xlYWRlcikgPT4ge1xyXG4gICAgICAgIGlmIChpc0xlYWRlcikge1xyXG4gICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBmb3JjZVJlZnJlc2hTZXNzaW9uIFdFIEFSRSBMRUFERVJgKTtcclxuICAgICAgICAgIHJldHVybiBmb3JrSm9pbihbXHJcbiAgICAgICAgICAgIHRoaXMuc3RhcnRSZWZyZXNoU2Vzc2lvbihjdXN0b21QYXJhbXMpLFxyXG4gICAgICAgICAgICB0aGlzLnNpbGVudFJlbmV3U2VydmljZS5yZWZyZXNoU2Vzc2lvbldpdGhJRnJhbWVDb21wbGV0ZWQkLnBpcGUodGFrZSgxKSksXHJcbiAgICAgICAgICBdKS5waXBlKFxyXG4gICAgICAgICAgICB0aW1lb3V0KHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uc2lsZW50UmVuZXdUaW1lb3V0SW5TZWNvbmRzICogMTAwMCksXHJcbiAgICAgICAgICAgIG1hcCgoW18sIGNhbGxiYWNrQ29udGV4dF0pID0+IHtcclxuICAgICAgICAgICAgICBjb25zdCBpc0F1dGhlbnRpY2F0ZWQgPSB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UuYXJlQXV0aFN0b3JhZ2VUb2tlbnNWYWxpZCgpO1xyXG4gICAgICAgICAgICAgIGlmIChpc0F1dGhlbnRpY2F0ZWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgIGlkVG9rZW46IGNhbGxiYWNrQ29udGV4dD8uYXV0aFJlc3VsdD8uaWRfdG9rZW4sXHJcbiAgICAgICAgICAgICAgICAgIGFjY2Vzc1Rva2VuOiBjYWxsYmFja0NvbnRleHQ/LmF1dGhSZXN1bHQ/LmFjY2Vzc190b2tlbixcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgIGNhdGNoRXJyb3IoKGVycm9yKSA9PiB7XHJcbiAgICAgICAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgVGltZW91dEVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZyhcclxuICAgICAgICAgICAgICAgICAgYGZvcmNlUmVmcmVzaFNlc3Npb24gV0UgQVJFIExFQURFUiA+IG9jY3VyZWQgVElNRU9VVCBFUlJPUiBTTyBXRSBSRVRSWTogdGhpcy5mb3JjZVJlZnJlc2hTZXNzaW9uKGN1c3RvbVBhcmFtcylgXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRSZXRyeSkge1xyXG4gICAgICAgICAgICAgICAgICBjdXJyZW50UmV0cnkrKztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRSZXRyeSA9IDE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zaWxlbnRSZW5ld0Nhc2UoY3VzdG9tUGFyYW1zLCBjdXJyZW50UmV0cnkpO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYGZvcmNlUmVmcmVzaFNlc3Npb24gV0UgQVJFIE5PVCBOT1QgTk9UIExFQURFUmApO1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMudGFic1N5bmNocm9uaXphdGlvblNlcnZpY2UuZ2V0U2lsZW50UmVuZXdGaW5pc2hlZE9ic2VydmFibGUoKS5waXBlKFxyXG4gICAgICAgICAgICB0YWtlKDEpLFxyXG4gICAgICAgICAgICB0aW1lb3V0KHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uc2lsZW50UmVuZXdUaW1lb3V0SW5TZWNvbmRzICogMTAwMCksXHJcbiAgICAgICAgICAgIGNhdGNoRXJyb3IoKGVycm9yKSA9PiB7XHJcbiAgICAgICAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgVGltZW91dEVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZyhcclxuICAgICAgICAgICAgICAgICAgYGZvcmNlUmVmcmVzaFNlc3Npb24gV0UgQVJFIE5PVCBOT1QgTk9UIExFQURFUiA+IG9jY3VyZWQgVElNRU9VVCBFUlJPUiBTTyBXRSBSRVRSWTogdGhpcy5mb3JjZVJlZnJlc2hTZXNzaW9uKGN1c3RvbVBhcmFtcylgXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRSZXRyeSkge1xyXG4gICAgICAgICAgICAgICAgICBjdXJyZW50UmV0cnkrKztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRSZXRyeSA9IDE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zaWxlbnRSZW5ld0Nhc2UoY3VzdG9tUGFyYW1zLCBjdXJyZW50UmV0cnkpO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICBtYXAoKCkgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGlzQXV0aGVudGljYXRlZCA9IHRoaXMuYXV0aFN0YXRlU2VydmljZS5hcmVBdXRoU3RvcmFnZVRva2Vuc1ZhbGlkKCk7XHJcbiAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKFxyXG4gICAgICAgICAgICAgICAgYGZvcmNlUmVmcmVzaFNlc3Npb24gV0UgQVJFIE5PVCBOT1QgTk9UIExFQURFUiA+IGdldFNpbGVudFJlbmV3RmluaXNoZWRPYnNlcnZhYmxlIEVNTUlUUyBWQUxVRSA+IGlzQXV0aGVudGljYXRlZCA9ICR7aXNBdXRoZW50aWNhdGVkfWBcclxuICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgIGlmIChpc0F1dGhlbnRpY2F0ZWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgIGlkVG9rZW46IHRoaXMuYXV0aFN0YXRlU2VydmljZS5nZXRJZFRva2VuKCksXHJcbiAgICAgICAgICAgICAgICAgIGFjY2Vzc1Rva2VuOiB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UuZ2V0QWNjZXNzVG9rZW4oKSxcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoXHJcbiAgICAgICAgICAgICAgICBgZm9yY2VSZWZyZXNoU2Vzc2lvbiBXRSBBUkUgTk9UIE5PVCBOT1QgTEVBREVSID4gZ2V0U2lsZW50UmVuZXdGaW5pc2hlZE9ic2VydmFibGUgRU1NSVRTIFZBTFVFID4gaXNBdXRoZW50aWNhdGVkIEZBTFNFIFdFIERPTlQgS05PVyBXQUhUIFRPIERPIFdJVEggVEhJU2BcclxuICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pLFxyXG4gICAgICBjYXRjaEVycm9yKChlcnJvcikgPT4ge1xyXG4gICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIFRpbWVvdXRFcnJvcikge1xyXG4gICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoXHJcbiAgICAgICAgICAgIGBmb3JjZVJlZnJlc2hTZXNzaW9uID4gRlJPTSBpc0xlYWRlckNoZWNrID4gb2NjdXJlZCBUSU1FT1VUIEVSUk9SIFNPIFdFIFJFVFJZOiB0aGlzLmZvcmNlUmVmcmVzaFNlc3Npb24oY3VzdG9tUGFyYW1zKWBcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICBpZiAoY3VycmVudFJldHJ5KSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRSZXRyeSsrO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY3VycmVudFJldHJ5ID0gMTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiB0aGlzLnNpbGVudFJlbmV3Q2FzZShjdXN0b21QYXJhbXMsIGN1cnJlbnRSZXRyeSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aHJvdyBlcnJvcjtcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHN0YXJ0UmVmcmVzaFNlc3Npb24oY3VzdG9tUGFyYW1zPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIH0pIHtcclxuICAgIGNvbnN0IGlzU2lsZW50UmVuZXdSdW5uaW5nID0gdGhpcy5mbG93c0RhdGFTZXJ2aWNlLmlzU2lsZW50UmVuZXdSdW5uaW5nKCk7XHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYENoZWNraW5nOiBzaWxlbnRSZW5ld1J1bm5pbmc6ICR7aXNTaWxlbnRSZW5ld1J1bm5pbmd9YCk7XHJcbiAgICBjb25zdCBzaG91bGRCZUV4ZWN1dGVkID0gIWlzU2lsZW50UmVuZXdSdW5uaW5nO1xyXG5cclxuICAgIGlmICghc2hvdWxkQmVFeGVjdXRlZCkge1xyXG4gICAgICByZXR1cm4gb2YobnVsbCk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYXV0aFdlbGxrbm93bkVuZHBvaW50QWRyZXNzID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbj8uYXV0aFdlbGxrbm93bkVuZHBvaW50O1xyXG5cclxuICAgIGlmICghYXV0aFdlbGxrbm93bkVuZHBvaW50QWRyZXNzKSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcignbm8gYXV0aHdlbGxrbm93bmVuZHBvaW50IGdpdmVuIScpO1xyXG4gICAgICByZXR1cm4gb2YobnVsbCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuYXV0aFdlbGxLbm93blNlcnZpY2UuZ2V0QXV0aFdlbGxLbm93bkVuZFBvaW50cyhhdXRoV2VsbGtub3duRW5kcG9pbnRBZHJlc3MpLnBpcGUoXHJcbiAgICAgIHN3aXRjaE1hcCgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5mbG93c0RhdGFTZXJ2aWNlLnNldFNpbGVudFJlbmV3UnVubmluZygpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dDb2RlRmxvd1dpdGhSZWZyZXNoVG9rZW5zKCkpIHtcclxuICAgICAgICAgIC8vIFJlZnJlc2ggU2Vzc2lvbiB1c2luZyBSZWZyZXNoIHRva2Vuc1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMucmVmcmVzaFNlc3Npb25SZWZyZXNoVG9rZW5TZXJ2aWNlLnJlZnJlc2hTZXNzaW9uV2l0aFJlZnJlc2hUb2tlbnMoY3VzdG9tUGFyYW1zKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLnJlZnJlc2hTZXNzaW9uSWZyYW1lU2VydmljZS5yZWZyZXNoU2Vzc2lvbldpdGhJZnJhbWUoY3VzdG9tUGFyYW1zLCAnbG9naW4nKTtcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvLyBwcml2YXRlIHRpbWVvdXRSZXRyeVN0cmF0ZWd5KGVycm9yQXR0ZW1wdHM6IE9ic2VydmFibGU8YW55Pikge1xyXG4gIC8vICAgcmV0dXJuIGVycm9yQXR0ZW1wdHMucGlwZShcclxuICAvLyAgICAgbWVyZ2VNYXAoKGVycm9yLCBpbmRleCkgPT4ge1xyXG4gIC8vICAgICAgIGNvbnN0IHNjYWxpbmdEdXJhdGlvbiA9IDEwMDA7XHJcbiAgLy8gICAgICAgY29uc3QgY3VycmVudEF0dGVtcHQgPSBpbmRleCArIDE7XHJcblxyXG4gIC8vICAgICAgIGlmICghKGVycm9yIGluc3RhbmNlb2YgVGltZW91dEVycm9yKSB8fCBjdXJyZW50QXR0ZW1wdCA+IE1BWF9SRVRSWV9BVFRFTVBUUykge1xyXG4gIC8vICAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoZXJyb3IpO1xyXG4gIC8vICAgICAgIH1cclxuXHJcbiAgLy8gICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBmb3JjZVJlZnJlc2hTZXNzaW9uIHRpbWVvdXQuIEF0dGVtcHQgIyR7Y3VycmVudEF0dGVtcHR9YCk7XHJcblxyXG4gIC8vICAgICAgIHRoaXMuZmxvd3NEYXRhU2VydmljZS5yZXNldFNpbGVudFJlbmV3UnVubmluZygpO1xyXG4gIC8vICAgICAgIHJldHVybiB0aW1lcihjdXJyZW50QXR0ZW1wdCAqIHNjYWxpbmdEdXJhdGlvbik7XHJcbiAgLy8gICAgIH0pXHJcbiAgLy8gICApO1xyXG4gIC8vIH1cclxufVxyXG4iXX0=