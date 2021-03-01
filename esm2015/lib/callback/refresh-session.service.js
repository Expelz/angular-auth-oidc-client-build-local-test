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
        return from(this.tabsSynchronizationService.isLeaderCheck()).pipe(take(1), switchMap((isLeader) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmcmVzaC1zZXNzaW9uLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy8iLCJzb3VyY2VzIjpbImxpYi9jYWxsYmFjay9yZWZyZXNoLXNlc3Npb24uc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFjLEVBQUUsRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ2hGLE9BQU8sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7Ozs7Ozs7Ozs7OztBQVkzRSxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLENBQUM7QUFFcEMsTUFBTSxPQUFPLHFCQUFxQjtJQUNoQyxZQUNVLFVBQXNCLEVBQ3RCLHFCQUE0QyxFQUM1QyxnQkFBa0MsRUFDbEMsYUFBNEIsRUFDNUIsa0JBQXNDLEVBQ3RDLGdCQUFrQyxFQUNsQyxvQkFBMEMsRUFDMUMsMkJBQXdELEVBQ3hELGlDQUFvRSxFQUNwRSwwQkFBc0Q7UUFUdEQsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUN0QiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1FBQzVDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFDNUIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtRQUN0QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBc0I7UUFDMUMsZ0NBQTJCLEdBQTNCLDJCQUEyQixDQUE2QjtRQUN4RCxzQ0FBaUMsR0FBakMsaUNBQWlDLENBQW1DO1FBQ3BFLCtCQUEwQixHQUExQiww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cUIsbUJBRFIsTUFBTTtrREFDbkIscUJBQXFCO2NBRGpDLFVBQVU7ZUFBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IGZvcmtKb2luLCBmcm9tLCBPYnNlcnZhYmxlLCBvZiwgdGhyb3dFcnJvciwgVGltZW91dEVycm9yIH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IGNhdGNoRXJyb3IsIG1hcCwgc3dpdGNoTWFwLCB0YWtlLCB0aW1lb3V0IH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQgeyBBdXRoU3RhdGVTZXJ2aWNlIH0gZnJvbSAnLi4vYXV0aFN0YXRlL2F1dGgtc3RhdGUuc2VydmljZSc7XHJcbmltcG9ydCB7IEF1dGhXZWxsS25vd25TZXJ2aWNlIH0gZnJvbSAnLi4vY29uZmlnL2F1dGgtd2VsbC1rbm93bi5zZXJ2aWNlJztcclxuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi4vY29uZmlnL2NvbmZpZy5wcm92aWRlcic7XHJcbmltcG9ydCB7IEZsb3dzRGF0YVNlcnZpY2UgfSBmcm9tICcuLi9mbG93cy9mbG93cy1kYXRhLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBSZWZyZXNoU2Vzc2lvbklmcmFtZVNlcnZpY2UgfSBmcm9tICcuLi9pZnJhbWUvcmVmcmVzaC1zZXNzaW9uLWlmcmFtZS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgU2lsZW50UmVuZXdTZXJ2aWNlIH0gZnJvbSAnLi4vaWZyYW1lL3NpbGVudC1yZW5ldy5zZXJ2aWNlJztcclxuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBGbG93SGVscGVyIH0gZnJvbSAnLi4vdXRpbHMvZmxvd0hlbHBlci9mbG93LWhlbHBlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgVGFic1N5bmNocm9uaXphdGlvblNlcnZpY2UgfSBmcm9tICcuLy4uL2lmcmFtZS90YWJzLXN5bmNocm9uaXphdGlvbi5zZXJ2aWNlJztcclxuaW1wb3J0IHsgUmVmcmVzaFNlc3Npb25SZWZyZXNoVG9rZW5TZXJ2aWNlIH0gZnJvbSAnLi9yZWZyZXNoLXNlc3Npb24tcmVmcmVzaC10b2tlbi5zZXJ2aWNlJztcclxuXHJcbmV4cG9ydCBjb25zdCBNQVhfUkVUUllfQVRURU1QVFMgPSAzO1xyXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxyXG5leHBvcnQgY2xhc3MgUmVmcmVzaFNlc3Npb25TZXJ2aWNlIHtcclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgZmxvd0hlbHBlcjogRmxvd0hlbHBlcixcclxuICAgIHByaXZhdGUgY29uZmlndXJhdGlvblByb3ZpZGVyOiBDb25maWd1cmF0aW9uUHJvdmlkZXIsXHJcbiAgICBwcml2YXRlIGZsb3dzRGF0YVNlcnZpY2U6IEZsb3dzRGF0YVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHNpbGVudFJlbmV3U2VydmljZTogU2lsZW50UmVuZXdTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBhdXRoU3RhdGVTZXJ2aWNlOiBBdXRoU3RhdGVTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBhdXRoV2VsbEtub3duU2VydmljZTogQXV0aFdlbGxLbm93blNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHJlZnJlc2hTZXNzaW9uSWZyYW1lU2VydmljZTogUmVmcmVzaFNlc3Npb25JZnJhbWVTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSByZWZyZXNoU2Vzc2lvblJlZnJlc2hUb2tlblNlcnZpY2U6IFJlZnJlc2hTZXNzaW9uUmVmcmVzaFRva2VuU2VydmljZSxcclxuICAgIHByaXZhdGUgdGFic1N5bmNocm9uaXphdGlvblNlcnZpY2U6IFRhYnNTeW5jaHJvbml6YXRpb25TZXJ2aWNlXHJcbiAgKSB7fVxyXG5cclxuICBmb3JjZVJlZnJlc2hTZXNzaW9uKGN1c3RvbVBhcmFtcz86IHtcclxuICAgIFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW47XHJcbiAgfSk6IE9ic2VydmFibGU8e1xyXG4gICAgaWRUb2tlbjogYW55O1xyXG4gICAgYWNjZXNzVG9rZW46IGFueTtcclxuICB9PiB7XHJcbiAgICBpZiAodGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dDb2RlRmxvd1dpdGhSZWZyZXNoVG9rZW5zKCkpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuc3RhcnRSZWZyZXNoU2Vzc2lvbihjdXN0b21QYXJhbXMpLnBpcGUoXHJcbiAgICAgICAgbWFwKCgpID0+IHtcclxuICAgICAgICAgIGNvbnN0IGlzQXV0aGVudGljYXRlZCA9IHRoaXMuYXV0aFN0YXRlU2VydmljZS5hcmVBdXRoU3RvcmFnZVRva2Vuc1ZhbGlkKCk7XHJcbiAgICAgICAgICBpZiAoaXNBdXRoZW50aWNhdGVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgaWRUb2tlbjogdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLmdldElkVG9rZW4oKSxcclxuICAgICAgICAgICAgICBhY2Nlc3NUb2tlbjogdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLmdldEFjY2Vzc1Rva2VuKCksXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfSlcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5zaWxlbnRSZW5ld0Nhc2UoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2lsZW50UmVuZXdDYXNlKFxyXG4gICAgY3VzdG9tUGFyYW1zPzoge1xyXG4gICAgICBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuO1xyXG4gICAgfSxcclxuICAgIGN1cnJlbnRSZXRyeT86IG51bWJlclxyXG4gICk6IE9ic2VydmFibGU8e1xyXG4gICAgaWRUb2tlbjogYW55O1xyXG4gICAgYWNjZXNzVG9rZW46IGFueTtcclxuICB9PiB7XHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYHNpbGVudFJlbmV3Q2FzZSBDVVJSRU5UIFJFVFJZIEFUVEVNUFQgIyR7Y3VycmVudFJldHJ5fWApO1xyXG4gICAgaWYgKGN1cnJlbnRSZXRyeSAmJiBjdXJyZW50UmV0cnkgPiBNQVhfUkVUUllfQVRURU1QVFMpIHtcclxuICAgICAgcmV0dXJuIHRocm93RXJyb3IobmV3IEVycm9yKCdJbml0aWFsaXphdGluIGhhcyBiZWVuIGZhaWxlZC4gRXhjZWVkZWQgbWF4IHJldHJ5IGF0dGVwbXRzLicpKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZnJvbSh0aGlzLnRhYnNTeW5jaHJvbml6YXRpb25TZXJ2aWNlLmlzTGVhZGVyQ2hlY2soKSkucGlwZShcclxuICAgICAgdGFrZSgxKSxcclxuICAgICAgc3dpdGNoTWFwKChpc0xlYWRlcikgPT4ge1xyXG4gICAgICAgIGlmIChpc0xlYWRlcikge1xyXG4gICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBmb3JjZVJlZnJlc2hTZXNzaW9uIFdFIEFSRSBMRUFERVJgKTtcclxuICAgICAgICAgIHJldHVybiBmb3JrSm9pbihbXHJcbiAgICAgICAgICAgIHRoaXMuc3RhcnRSZWZyZXNoU2Vzc2lvbihjdXN0b21QYXJhbXMpLFxyXG4gICAgICAgICAgICB0aGlzLnNpbGVudFJlbmV3U2VydmljZS5yZWZyZXNoU2Vzc2lvbldpdGhJRnJhbWVDb21wbGV0ZWQkLnBpcGUodGFrZSgxKSksXHJcbiAgICAgICAgICBdKS5waXBlKFxyXG4gICAgICAgICAgICB0aW1lb3V0KHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uc2lsZW50UmVuZXdUaW1lb3V0SW5TZWNvbmRzICogMTAwMCksXHJcbiAgICAgICAgICAgIG1hcCgoW18sIGNhbGxiYWNrQ29udGV4dF0pID0+IHtcclxuICAgICAgICAgICAgICBjb25zdCBpc0F1dGhlbnRpY2F0ZWQgPSB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UuYXJlQXV0aFN0b3JhZ2VUb2tlbnNWYWxpZCgpO1xyXG4gICAgICAgICAgICAgIGlmIChpc0F1dGhlbnRpY2F0ZWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgIGlkVG9rZW46IGNhbGxiYWNrQ29udGV4dD8uYXV0aFJlc3VsdD8uaWRfdG9rZW4sXHJcbiAgICAgICAgICAgICAgICAgIGFjY2Vzc1Rva2VuOiBjYWxsYmFja0NvbnRleHQ/LmF1dGhSZXN1bHQ/LmFjY2Vzc190b2tlbixcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgIGNhdGNoRXJyb3IoKGVycm9yKSA9PiB7XHJcbiAgICAgICAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgVGltZW91dEVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZyhcclxuICAgICAgICAgICAgICAgICAgYGZvcmNlUmVmcmVzaFNlc3Npb24gV0UgQVJFIExFQURFUiA+IG9jY3VyZWQgVElNRU9VVCBFUlJPUiBTTyBXRSBSRVRSWTogdGhpcy5mb3JjZVJlZnJlc2hTZXNzaW9uKGN1c3RvbVBhcmFtcylgXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRSZXRyeSkge1xyXG4gICAgICAgICAgICAgICAgICBjdXJyZW50UmV0cnkrKztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRSZXRyeSA9IDE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zaWxlbnRSZW5ld0Nhc2UoY3VzdG9tUGFyYW1zLCBjdXJyZW50UmV0cnkpO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYGZvcmNlUmVmcmVzaFNlc3Npb24gV0UgQVJFIE5PVCBOT1QgTk9UIExFQURFUmApO1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMudGFic1N5bmNocm9uaXphdGlvblNlcnZpY2UuZ2V0U2lsZW50UmVuZXdGaW5pc2hlZE9ic2VydmFibGUoKS5waXBlKFxyXG4gICAgICAgICAgICB0YWtlKDEpLFxyXG4gICAgICAgICAgICB0aW1lb3V0KHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uc2lsZW50UmVuZXdUaW1lb3V0SW5TZWNvbmRzICogMTAwMCksXHJcbiAgICAgICAgICAgIGNhdGNoRXJyb3IoKGVycm9yKSA9PiB7XHJcbiAgICAgICAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgVGltZW91dEVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZyhcclxuICAgICAgICAgICAgICAgICAgYGZvcmNlUmVmcmVzaFNlc3Npb24gV0UgQVJFIE5PVCBOT1QgTk9UIExFQURFUiA+IG9jY3VyZWQgVElNRU9VVCBFUlJPUiBTTyBXRSBSRVRSWTogdGhpcy5mb3JjZVJlZnJlc2hTZXNzaW9uKGN1c3RvbVBhcmFtcylgXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRSZXRyeSkge1xyXG4gICAgICAgICAgICAgICAgICBjdXJyZW50UmV0cnkrKztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRSZXRyeSA9IDE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zaWxlbnRSZW5ld0Nhc2UoY3VzdG9tUGFyYW1zLCBjdXJyZW50UmV0cnkpO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICBtYXAoKCkgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGlzQXV0aGVudGljYXRlZCA9IHRoaXMuYXV0aFN0YXRlU2VydmljZS5hcmVBdXRoU3RvcmFnZVRva2Vuc1ZhbGlkKCk7XHJcbiAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKFxyXG4gICAgICAgICAgICAgICAgYGZvcmNlUmVmcmVzaFNlc3Npb24gV0UgQVJFIE5PVCBOT1QgTk9UIExFQURFUiA+IGdldFNpbGVudFJlbmV3RmluaXNoZWRPYnNlcnZhYmxlIEVNTUlUUyBWQUxVRSA+IGlzQXV0aGVudGljYXRlZCA9ICR7aXNBdXRoZW50aWNhdGVkfWBcclxuICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgIGlmIChpc0F1dGhlbnRpY2F0ZWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgIGlkVG9rZW46IHRoaXMuYXV0aFN0YXRlU2VydmljZS5nZXRJZFRva2VuKCksXHJcbiAgICAgICAgICAgICAgICAgIGFjY2Vzc1Rva2VuOiB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UuZ2V0QWNjZXNzVG9rZW4oKSxcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoXHJcbiAgICAgICAgICAgICAgICBgZm9yY2VSZWZyZXNoU2Vzc2lvbiBXRSBBUkUgTk9UIE5PVCBOT1QgTEVBREVSID4gZ2V0U2lsZW50UmVuZXdGaW5pc2hlZE9ic2VydmFibGUgRU1NSVRTIFZBTFVFID4gaXNBdXRoZW50aWNhdGVkIEZBTFNFIFdFIERPTlQgS05PVyBXQUhUIFRPIERPIFdJVEggVEhJU2BcclxuICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzdGFydFJlZnJlc2hTZXNzaW9uKGN1c3RvbVBhcmFtcz86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB9KSB7XHJcbiAgICBjb25zdCBpc1NpbGVudFJlbmV3UnVubmluZyA9IHRoaXMuZmxvd3NEYXRhU2VydmljZS5pc1NpbGVudFJlbmV3UnVubmluZygpO1xyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBDaGVja2luZzogc2lsZW50UmVuZXdSdW5uaW5nOiAke2lzU2lsZW50UmVuZXdSdW5uaW5nfWApO1xyXG4gICAgY29uc3Qgc2hvdWxkQmVFeGVjdXRlZCA9ICFpc1NpbGVudFJlbmV3UnVubmluZztcclxuXHJcbiAgICBpZiAoIXNob3VsZEJlRXhlY3V0ZWQpIHtcclxuICAgICAgcmV0dXJuIG9mKG51bGwpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGF1dGhXZWxsa25vd25FbmRwb2ludEFkcmVzcyA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24/LmF1dGhXZWxsa25vd25FbmRwb2ludDtcclxuXHJcbiAgICBpZiAoIWF1dGhXZWxsa25vd25FbmRwb2ludEFkcmVzcykge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoJ25vIGF1dGh3ZWxsa25vd25lbmRwb2ludCBnaXZlbiEnKTtcclxuICAgICAgcmV0dXJuIG9mKG51bGwpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzLmF1dGhXZWxsS25vd25TZXJ2aWNlLmdldEF1dGhXZWxsS25vd25FbmRQb2ludHMoYXV0aFdlbGxrbm93bkVuZHBvaW50QWRyZXNzKS5waXBlKFxyXG4gICAgICBzd2l0Y2hNYXAoKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuZmxvd3NEYXRhU2VydmljZS5zZXRTaWxlbnRSZW5ld1J1bm5pbmcoKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZmxvd0hlbHBlci5pc0N1cnJlbnRGbG93Q29kZUZsb3dXaXRoUmVmcmVzaFRva2VucygpKSB7XHJcbiAgICAgICAgICAvLyBSZWZyZXNoIFNlc3Npb24gdXNpbmcgUmVmcmVzaCB0b2tlbnNcclxuICAgICAgICAgIHJldHVybiB0aGlzLnJlZnJlc2hTZXNzaW9uUmVmcmVzaFRva2VuU2VydmljZS5yZWZyZXNoU2Vzc2lvbldpdGhSZWZyZXNoVG9rZW5zKGN1c3RvbVBhcmFtcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5yZWZyZXNoU2Vzc2lvbklmcmFtZVNlcnZpY2UucmVmcmVzaFNlc3Npb25XaXRoSWZyYW1lKGN1c3RvbVBhcmFtcywgJ2xvZ2luJyk7XHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLy8gcHJpdmF0ZSB0aW1lb3V0UmV0cnlTdHJhdGVneShlcnJvckF0dGVtcHRzOiBPYnNlcnZhYmxlPGFueT4pIHtcclxuICAvLyAgIHJldHVybiBlcnJvckF0dGVtcHRzLnBpcGUoXHJcbiAgLy8gICAgIG1lcmdlTWFwKChlcnJvciwgaW5kZXgpID0+IHtcclxuICAvLyAgICAgICBjb25zdCBzY2FsaW5nRHVyYXRpb24gPSAxMDAwO1xyXG4gIC8vICAgICAgIGNvbnN0IGN1cnJlbnRBdHRlbXB0ID0gaW5kZXggKyAxO1xyXG5cclxuICAvLyAgICAgICBpZiAoIShlcnJvciBpbnN0YW5jZW9mIFRpbWVvdXRFcnJvcikgfHwgY3VycmVudEF0dGVtcHQgPiBNQVhfUkVUUllfQVRURU1QVFMpIHtcclxuICAvLyAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yKTtcclxuICAvLyAgICAgICB9XHJcblxyXG4gIC8vICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgZm9yY2VSZWZyZXNoU2Vzc2lvbiB0aW1lb3V0LiBBdHRlbXB0ICMke2N1cnJlbnRBdHRlbXB0fWApO1xyXG5cclxuICAvLyAgICAgICB0aGlzLmZsb3dzRGF0YVNlcnZpY2UucmVzZXRTaWxlbnRSZW5ld1J1bm5pbmcoKTtcclxuICAvLyAgICAgICByZXR1cm4gdGltZXIoY3VycmVudEF0dGVtcHQgKiBzY2FsaW5nRHVyYXRpb24pO1xyXG4gIC8vICAgICB9KVxyXG4gIC8vICAgKTtcclxuICAvLyB9XHJcbn1cclxuIl19