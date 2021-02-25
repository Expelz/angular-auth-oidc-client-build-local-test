import { Injectable } from '@angular/core';
import { forkJoin, from, of, TimeoutError } from 'rxjs';
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
    silentRenewCase(customParams) {
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
                        return this.silentRenewCase(customParams);
                    }
                    throw error;
                }));
            }
            else {
                this.loggerService.logDebug(`forceRefreshSession WE ARE NOT NOT NOT LEADER`);
                return this.tabsSynchronizationService.getSilentRenewFinishedObservable().pipe(take(1), timeout(this.configurationProvider.openIDConfiguration.silentRenewTimeoutInSeconds * 1000), catchError((error) => {
                    if (error instanceof TimeoutError) {
                        this.loggerService.logWarning(`forceRefreshSession WE ARE NOT NOT NOT LEADER > occured TIMEOUT ERROR SO WE RETRY: this.forceRefreshSession(customParams)`);
                        return this.silentRenewCase(customParams);
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
            return this.refreshSessionIframeService.refreshSessionWithIframe(customParams);
        }));
    }
}
RefreshSessionService.ɵfac = function RefreshSessionService_Factory(t) { return new (t || RefreshSessionService)(i0.ɵɵinject(i1.FlowHelper), i0.ɵɵinject(i2.ConfigurationProvider), i0.ɵɵinject(i3.FlowsDataService), i0.ɵɵinject(i4.LoggerService), i0.ɵɵinject(i5.SilentRenewService), i0.ɵɵinject(i6.AuthStateService), i0.ɵɵinject(i7.AuthWellKnownService), i0.ɵɵinject(i8.RefreshSessionIframeService), i0.ɵɵinject(i9.RefreshSessionRefreshTokenService), i0.ɵɵinject(i10.TabsSynchronizationService)); };
RefreshSessionService.ɵprov = i0.ɵɵdefineInjectable({ token: RefreshSessionService, factory: RefreshSessionService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(RefreshSessionService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], function () { return [{ type: i1.FlowHelper }, { type: i2.ConfigurationProvider }, { type: i3.FlowsDataService }, { type: i4.LoggerService }, { type: i5.SilentRenewService }, { type: i6.AuthStateService }, { type: i7.AuthWellKnownService }, { type: i8.RefreshSessionIframeService }, { type: i9.RefreshSessionRefreshTokenService }, { type: i10.TabsSynchronizationService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmcmVzaC1zZXNzaW9uLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy8iLCJzb3VyY2VzIjpbImxpYi9jYWxsYmFjay9yZWZyZXNoLXNlc3Npb24uc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFjLEVBQUUsRUFBRSxZQUFZLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDcEUsT0FBTyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQzs7Ozs7Ozs7Ozs7O0FBWTNFLE1BQU0sQ0FBQyxNQUFNLGtCQUFrQixHQUFHLENBQUMsQ0FBQztBQUVwQyxNQUFNLE9BQU8scUJBQXFCO0lBQ2hDLFlBQ1UsVUFBc0IsRUFDdEIscUJBQTRDLEVBQzVDLGdCQUFrQyxFQUNsQyxhQUE0QixFQUM1QixrQkFBc0MsRUFDdEMsZ0JBQWtDLEVBQ2xDLG9CQUEwQyxFQUMxQywyQkFBd0QsRUFDeEQsaUNBQW9FLEVBQ3BFLDBCQUFzRDtRQVR0RCxlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQ3RCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7UUFDNUMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUM1Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1FBQ3RDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtRQUMxQyxnQ0FBMkIsR0FBM0IsMkJBQTJCLENBQTZCO1FBQ3hELHNDQUFpQyxHQUFqQyxpQ0FBaUMsQ0FBbUM7UUFDcEUsK0JBQTBCLEdBQTFCLDBCQUEwQixDQUE0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QixFQUFFO1lBQ2hDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLGlDQUFpQyxDQUFDLENBQUM7WUFDL0QsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDakI7UUFFRCxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyx5QkFBeUIsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLElBQUksQ0FDMUYsU0FBUyxDQUFDLEdBQUcsRUFBRTtZQUNiLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBRTlDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxzQ0FBc0MsRUFBRSxFQUFFO2dCQUM1RCx1Q0FBdUM7Z0JBQ3ZDLE9BQU8sSUFBSSxDQUFDLGlDQUFpQyxDQUFDLCtCQUErQixDQUFDLFlBQVksQ0FBQyxDQUFDO2FBQzdGO1lBRUQsT0FBTyxJQUFJLENBQUMsMkJBQTJCLENBQUMsd0JBQXdCLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDakYsQ0FBQyxDQUFDLENBQ0gsQ0FBQztJQUNKLENBQUM7OzBGQS9JVSxxQkFBcUI7NkRBQXJCLHFCQUFxQixXQUFyQixxQkFBcUIsbUJBRFIsTUFBTTtrREFDbkIscUJBQXFCO2NBRGpDLFVBQVU7ZUFBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IGZvcmtKb2luLCBmcm9tLCBPYnNlcnZhYmxlLCBvZiwgVGltZW91dEVycm9yIH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IGNhdGNoRXJyb3IsIG1hcCwgc3dpdGNoTWFwLCB0YWtlLCB0aW1lb3V0IH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQgeyBBdXRoU3RhdGVTZXJ2aWNlIH0gZnJvbSAnLi4vYXV0aFN0YXRlL2F1dGgtc3RhdGUuc2VydmljZSc7XHJcbmltcG9ydCB7IEF1dGhXZWxsS25vd25TZXJ2aWNlIH0gZnJvbSAnLi4vY29uZmlnL2F1dGgtd2VsbC1rbm93bi5zZXJ2aWNlJztcclxuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi4vY29uZmlnL2NvbmZpZy5wcm92aWRlcic7XHJcbmltcG9ydCB7IEZsb3dzRGF0YVNlcnZpY2UgfSBmcm9tICcuLi9mbG93cy9mbG93cy1kYXRhLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBSZWZyZXNoU2Vzc2lvbklmcmFtZVNlcnZpY2UgfSBmcm9tICcuLi9pZnJhbWUvcmVmcmVzaC1zZXNzaW9uLWlmcmFtZS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgU2lsZW50UmVuZXdTZXJ2aWNlIH0gZnJvbSAnLi4vaWZyYW1lL3NpbGVudC1yZW5ldy5zZXJ2aWNlJztcclxuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBGbG93SGVscGVyIH0gZnJvbSAnLi4vdXRpbHMvZmxvd0hlbHBlci9mbG93LWhlbHBlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgVGFic1N5bmNocm9uaXphdGlvblNlcnZpY2UgfSBmcm9tICcuLy4uL2lmcmFtZS90YWJzLXN5bmNocm9uaXphdGlvbi5zZXJ2aWNlJztcclxuaW1wb3J0IHsgUmVmcmVzaFNlc3Npb25SZWZyZXNoVG9rZW5TZXJ2aWNlIH0gZnJvbSAnLi9yZWZyZXNoLXNlc3Npb24tcmVmcmVzaC10b2tlbi5zZXJ2aWNlJztcclxuXHJcbmV4cG9ydCBjb25zdCBNQVhfUkVUUllfQVRURU1QVFMgPSAzO1xyXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxyXG5leHBvcnQgY2xhc3MgUmVmcmVzaFNlc3Npb25TZXJ2aWNlIHtcclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgZmxvd0hlbHBlcjogRmxvd0hlbHBlcixcclxuICAgIHByaXZhdGUgY29uZmlndXJhdGlvblByb3ZpZGVyOiBDb25maWd1cmF0aW9uUHJvdmlkZXIsXHJcbiAgICBwcml2YXRlIGZsb3dzRGF0YVNlcnZpY2U6IEZsb3dzRGF0YVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHNpbGVudFJlbmV3U2VydmljZTogU2lsZW50UmVuZXdTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBhdXRoU3RhdGVTZXJ2aWNlOiBBdXRoU3RhdGVTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBhdXRoV2VsbEtub3duU2VydmljZTogQXV0aFdlbGxLbm93blNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHJlZnJlc2hTZXNzaW9uSWZyYW1lU2VydmljZTogUmVmcmVzaFNlc3Npb25JZnJhbWVTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSByZWZyZXNoU2Vzc2lvblJlZnJlc2hUb2tlblNlcnZpY2U6IFJlZnJlc2hTZXNzaW9uUmVmcmVzaFRva2VuU2VydmljZSxcclxuICAgIHByaXZhdGUgdGFic1N5bmNocm9uaXphdGlvblNlcnZpY2U6IFRhYnNTeW5jaHJvbml6YXRpb25TZXJ2aWNlXHJcbiAgKSB7fVxyXG5cclxuICBmb3JjZVJlZnJlc2hTZXNzaW9uKGN1c3RvbVBhcmFtcz86IHtcclxuICAgIFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW47XHJcbiAgfSk6IE9ic2VydmFibGU8e1xyXG4gICAgaWRUb2tlbjogYW55O1xyXG4gICAgYWNjZXNzVG9rZW46IGFueTtcclxuICB9PiB7XHJcbiAgICBpZiAodGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dDb2RlRmxvd1dpdGhSZWZyZXNoVG9rZW5zKCkpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuc3RhcnRSZWZyZXNoU2Vzc2lvbihjdXN0b21QYXJhbXMpLnBpcGUoXHJcbiAgICAgICAgbWFwKCgpID0+IHtcclxuICAgICAgICAgIGNvbnN0IGlzQXV0aGVudGljYXRlZCA9IHRoaXMuYXV0aFN0YXRlU2VydmljZS5hcmVBdXRoU3RvcmFnZVRva2Vuc1ZhbGlkKCk7XHJcbiAgICAgICAgICBpZiAoaXNBdXRoZW50aWNhdGVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgaWRUb2tlbjogdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLmdldElkVG9rZW4oKSxcclxuICAgICAgICAgICAgICBhY2Nlc3NUb2tlbjogdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLmdldEFjY2Vzc1Rva2VuKCksXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfSlcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5zaWxlbnRSZW5ld0Nhc2UoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2lsZW50UmVuZXdDYXNlKGN1c3RvbVBhcmFtcz86IHtcclxuICAgIFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW47XHJcbiAgfSk6IE9ic2VydmFibGU8e1xyXG4gICAgaWRUb2tlbjogYW55O1xyXG4gICAgYWNjZXNzVG9rZW46IGFueTtcclxuICB9PiB7XHJcbiAgICByZXR1cm4gZnJvbSh0aGlzLnRhYnNTeW5jaHJvbml6YXRpb25TZXJ2aWNlLmlzTGVhZGVyQ2hlY2soKSkucGlwZShcclxuICAgICAgdGFrZSgxKSxcclxuICAgICAgc3dpdGNoTWFwKChpc0xlYWRlcikgPT4ge1xyXG4gICAgICAgIGlmIChpc0xlYWRlcikge1xyXG4gICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBmb3JjZVJlZnJlc2hTZXNzaW9uIFdFIEFSRSBMRUFERVJgKTtcclxuICAgICAgICAgIHJldHVybiBmb3JrSm9pbihbXHJcbiAgICAgICAgICAgIHRoaXMuc3RhcnRSZWZyZXNoU2Vzc2lvbihjdXN0b21QYXJhbXMpLFxyXG4gICAgICAgICAgICB0aGlzLnNpbGVudFJlbmV3U2VydmljZS5yZWZyZXNoU2Vzc2lvbldpdGhJRnJhbWVDb21wbGV0ZWQkLnBpcGUodGFrZSgxKSksXHJcbiAgICAgICAgICBdKS5waXBlKFxyXG4gICAgICAgICAgICB0aW1lb3V0KHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uc2lsZW50UmVuZXdUaW1lb3V0SW5TZWNvbmRzICogMTAwMCksXHJcbiAgICAgICAgICAgIG1hcCgoW18sIGNhbGxiYWNrQ29udGV4dF0pID0+IHtcclxuICAgICAgICAgICAgICBjb25zdCBpc0F1dGhlbnRpY2F0ZWQgPSB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UuYXJlQXV0aFN0b3JhZ2VUb2tlbnNWYWxpZCgpO1xyXG4gICAgICAgICAgICAgIGlmIChpc0F1dGhlbnRpY2F0ZWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgIGlkVG9rZW46IGNhbGxiYWNrQ29udGV4dD8uYXV0aFJlc3VsdD8uaWRfdG9rZW4sXHJcbiAgICAgICAgICAgICAgICAgIGFjY2Vzc1Rva2VuOiBjYWxsYmFja0NvbnRleHQ/LmF1dGhSZXN1bHQ/LmFjY2Vzc190b2tlbixcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgIGNhdGNoRXJyb3IoKGVycm9yKSA9PiB7XHJcbiAgICAgICAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgVGltZW91dEVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZyhcclxuICAgICAgICAgICAgICAgICAgYGZvcmNlUmVmcmVzaFNlc3Npb24gV0UgQVJFIExFQURFUiA+IG9jY3VyZWQgVElNRU9VVCBFUlJPUiBTTyBXRSBSRVRSWTogdGhpcy5mb3JjZVJlZnJlc2hTZXNzaW9uKGN1c3RvbVBhcmFtcylgXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2lsZW50UmVuZXdDYXNlKGN1c3RvbVBhcmFtcyk7XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgZm9yY2VSZWZyZXNoU2Vzc2lvbiBXRSBBUkUgTk9UIE5PVCBOT1QgTEVBREVSYCk7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy50YWJzU3luY2hyb25pemF0aW9uU2VydmljZS5nZXRTaWxlbnRSZW5ld0ZpbmlzaGVkT2JzZXJ2YWJsZSgpLnBpcGUoXHJcbiAgICAgICAgICAgIHRha2UoMSksXHJcbiAgICAgICAgICAgIHRpbWVvdXQodGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5zaWxlbnRSZW5ld1RpbWVvdXRJblNlY29uZHMgKiAxMDAwKSxcclxuICAgICAgICAgICAgY2F0Y2hFcnJvcigoZXJyb3IpID0+IHtcclxuICAgICAgICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBUaW1lb3V0RXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKFxyXG4gICAgICAgICAgICAgICAgICBgZm9yY2VSZWZyZXNoU2Vzc2lvbiBXRSBBUkUgTk9UIE5PVCBOT1QgTEVBREVSID4gb2NjdXJlZCBUSU1FT1VUIEVSUk9SIFNPIFdFIFJFVFJZOiB0aGlzLmZvcmNlUmVmcmVzaFNlc3Npb24oY3VzdG9tUGFyYW1zKWBcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zaWxlbnRSZW5ld0Nhc2UoY3VzdG9tUGFyYW1zKTtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIHRocm93IGVycm9yO1xyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgbWFwKCgpID0+IHtcclxuICAgICAgICAgICAgICBjb25zdCBpc0F1dGhlbnRpY2F0ZWQgPSB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UuYXJlQXV0aFN0b3JhZ2VUb2tlbnNWYWxpZCgpO1xyXG4gICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhcclxuICAgICAgICAgICAgICAgIGBmb3JjZVJlZnJlc2hTZXNzaW9uIFdFIEFSRSBOT1QgTk9UIE5PVCBMRUFERVIgPiBnZXRTaWxlbnRSZW5ld0ZpbmlzaGVkT2JzZXJ2YWJsZSBFTU1JVFMgVkFMVUUgPiBpc0F1dGhlbnRpY2F0ZWQgPSAke2lzQXV0aGVudGljYXRlZH1gXHJcbiAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICBpZiAoaXNBdXRoZW50aWNhdGVkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICBpZFRva2VuOiB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UuZ2V0SWRUb2tlbigpLFxyXG4gICAgICAgICAgICAgICAgICBhY2Nlc3NUb2tlbjogdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLmdldEFjY2Vzc1Rva2VuKCksXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKFxyXG4gICAgICAgICAgICAgICAgYGZvcmNlUmVmcmVzaFNlc3Npb24gV0UgQVJFIE5PVCBOT1QgTk9UIExFQURFUiA+IGdldFNpbGVudFJlbmV3RmluaXNoZWRPYnNlcnZhYmxlIEVNTUlUUyBWQUxVRSA+IGlzQXV0aGVudGljYXRlZCBGQUxTRSBXRSBET05UIEtOT1cgV0FIVCBUTyBETyBXSVRIIFRISVNgXHJcbiAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc3RhcnRSZWZyZXNoU2Vzc2lvbihjdXN0b21QYXJhbXM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfSkge1xyXG4gICAgY29uc3QgaXNTaWxlbnRSZW5ld1J1bm5pbmcgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuaXNTaWxlbnRSZW5ld1J1bm5pbmcoKTtcclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgQ2hlY2tpbmc6IHNpbGVudFJlbmV3UnVubmluZzogJHtpc1NpbGVudFJlbmV3UnVubmluZ31gKTtcclxuICAgIGNvbnN0IHNob3VsZEJlRXhlY3V0ZWQgPSAhaXNTaWxlbnRSZW5ld1J1bm5pbmc7XHJcblxyXG4gICAgaWYgKCFzaG91bGRCZUV4ZWN1dGVkKSB7XHJcbiAgICAgIHJldHVybiBvZihudWxsKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhdXRoV2VsbGtub3duRW5kcG9pbnRBZHJlc3MgPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uPy5hdXRoV2VsbGtub3duRW5kcG9pbnQ7XHJcblxyXG4gICAgaWYgKCFhdXRoV2VsbGtub3duRW5kcG9pbnRBZHJlc3MpIHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKCdubyBhdXRod2VsbGtub3duZW5kcG9pbnQgZ2l2ZW4hJyk7XHJcbiAgICAgIHJldHVybiBvZihudWxsKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5hdXRoV2VsbEtub3duU2VydmljZS5nZXRBdXRoV2VsbEtub3duRW5kUG9pbnRzKGF1dGhXZWxsa25vd25FbmRwb2ludEFkcmVzcykucGlwZShcclxuICAgICAgc3dpdGNoTWFwKCgpID0+IHtcclxuICAgICAgICB0aGlzLmZsb3dzRGF0YVNlcnZpY2Uuc2V0U2lsZW50UmVuZXdSdW5uaW5nKCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmZsb3dIZWxwZXIuaXNDdXJyZW50Rmxvd0NvZGVGbG93V2l0aFJlZnJlc2hUb2tlbnMoKSkge1xyXG4gICAgICAgICAgLy8gUmVmcmVzaCBTZXNzaW9uIHVzaW5nIFJlZnJlc2ggdG9rZW5zXHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5yZWZyZXNoU2Vzc2lvblJlZnJlc2hUb2tlblNlcnZpY2UucmVmcmVzaFNlc3Npb25XaXRoUmVmcmVzaFRva2VucyhjdXN0b21QYXJhbXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmVmcmVzaFNlc3Npb25JZnJhbWVTZXJ2aWNlLnJlZnJlc2hTZXNzaW9uV2l0aElmcmFtZShjdXN0b21QYXJhbXMpO1xyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8vIHByaXZhdGUgdGltZW91dFJldHJ5U3RyYXRlZ3koZXJyb3JBdHRlbXB0czogT2JzZXJ2YWJsZTxhbnk+KSB7XHJcbiAgLy8gICByZXR1cm4gZXJyb3JBdHRlbXB0cy5waXBlKFxyXG4gIC8vICAgICBtZXJnZU1hcCgoZXJyb3IsIGluZGV4KSA9PiB7XHJcbiAgLy8gICAgICAgY29uc3Qgc2NhbGluZ0R1cmF0aW9uID0gMTAwMDtcclxuICAvLyAgICAgICBjb25zdCBjdXJyZW50QXR0ZW1wdCA9IGluZGV4ICsgMTtcclxuXHJcbiAgLy8gICAgICAgaWYgKCEoZXJyb3IgaW5zdGFuY2VvZiBUaW1lb3V0RXJyb3IpIHx8IGN1cnJlbnRBdHRlbXB0ID4gTUFYX1JFVFJZX0FUVEVNUFRTKSB7XHJcbiAgLy8gICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvcik7XHJcbiAgLy8gICAgICAgfVxyXG5cclxuICAvLyAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYGZvcmNlUmVmcmVzaFNlc3Npb24gdGltZW91dC4gQXR0ZW1wdCAjJHtjdXJyZW50QXR0ZW1wdH1gKTtcclxuXHJcbiAgLy8gICAgICAgdGhpcy5mbG93c0RhdGFTZXJ2aWNlLnJlc2V0U2lsZW50UmVuZXdSdW5uaW5nKCk7XHJcbiAgLy8gICAgICAgcmV0dXJuIHRpbWVyKGN1cnJlbnRBdHRlbXB0ICogc2NhbGluZ0R1cmF0aW9uKTtcclxuICAvLyAgICAgfSlcclxuICAvLyAgICk7XHJcbiAgLy8gfVxyXG59XHJcbiJdfQ==