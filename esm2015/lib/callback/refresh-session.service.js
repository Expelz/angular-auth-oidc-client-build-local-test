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
                        return this.silentRenewCase(customParams, currentRetry);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmcmVzaC1zZXNzaW9uLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy8iLCJzb3VyY2VzIjpbImxpYi9jYWxsYmFjay9yZWZyZXNoLXNlc3Npb24uc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFjLEVBQUUsRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ2hGLE9BQU8sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7Ozs7Ozs7Ozs7OztBQVkzRSxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLENBQUM7QUFFcEMsTUFBTSxPQUFPLHFCQUFxQjtJQUNoQyxZQUNVLFVBQXNCLEVBQ3RCLHFCQUE0QyxFQUM1QyxnQkFBa0MsRUFDbEMsYUFBNEIsRUFDNUIsa0JBQXNDLEVBQ3RDLGdCQUFrQyxFQUNsQyxvQkFBMEMsRUFDMUMsMkJBQXdELEVBQ3hELGlDQUFvRSxFQUNwRSwwQkFBc0Q7UUFUdEQsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUN0QiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1FBQzVDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFDNUIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtRQUN0QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBc0I7UUFDMUMsZ0NBQTJCLEdBQTNCLDJCQUEyQixDQUE2QjtRQUN4RCxzQ0FBaUMsR0FBakMsaUNBQWlDLENBQW1DO1FBQ3BFLCtCQUEwQixHQUExQiww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QXNDLEVBQUUsRUFBRTtnQkFDNUQsdUNBQXVDO2dCQUN2QyxPQUFPLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQywrQkFBK0IsQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUM3RjtZQUVELE9BQU8sSUFBSSxDQUFDLDJCQUEyQixDQUFDLHdCQUF3QixDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMxRixDQUFDLENBQUMsQ0FDSCxDQUFDO0lBQ0osQ0FBQzs7MEZBakxVLHFCQUFxQjs2REFBckIscUJBQXFCLFdBQXJCLHFCQUFxQixtQkFEUixNQUFNO2tEQUNuQixxQkFBcUI7Y0FEakMsVUFBVTtlQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgZm9ya0pvaW4sIGZyb20sIE9ic2VydmFibGUsIG9mLCB0aHJvd0Vycm9yLCBUaW1lb3V0RXJyb3IgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgY2F0Y2hFcnJvciwgbWFwLCBzd2l0Y2hNYXAsIHRha2UsIHRpbWVvdXQgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcbmltcG9ydCB7IEF1dGhTdGF0ZVNlcnZpY2UgfSBmcm9tICcuLi9hdXRoU3RhdGUvYXV0aC1zdGF0ZS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgQXV0aFdlbGxLbm93blNlcnZpY2UgfSBmcm9tICcuLi9jb25maWcvYXV0aC13ZWxsLWtub3duLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuLi9jb25maWcvY29uZmlnLnByb3ZpZGVyJztcclxuaW1wb3J0IHsgRmxvd3NEYXRhU2VydmljZSB9IGZyb20gJy4uL2Zsb3dzL2Zsb3dzLWRhdGEuc2VydmljZSc7XHJcbmltcG9ydCB7IFJlZnJlc2hTZXNzaW9uSWZyYW1lU2VydmljZSB9IGZyb20gJy4uL2lmcmFtZS9yZWZyZXNoLXNlc3Npb24taWZyYW1lLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBTaWxlbnRSZW5ld1NlcnZpY2UgfSBmcm9tICcuLi9pZnJhbWUvc2lsZW50LXJlbmV3LnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi4vbG9nZ2luZy9sb2dnZXIuc2VydmljZSc7XHJcbmltcG9ydCB7IEZsb3dIZWxwZXIgfSBmcm9tICcuLi91dGlscy9mbG93SGVscGVyL2Zsb3ctaGVscGVyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBUYWJzU3luY2hyb25pemF0aW9uU2VydmljZSB9IGZyb20gJy4vLi4vaWZyYW1lL3RhYnMtc3luY2hyb25pemF0aW9uLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBSZWZyZXNoU2Vzc2lvblJlZnJlc2hUb2tlblNlcnZpY2UgfSBmcm9tICcuL3JlZnJlc2gtc2Vzc2lvbi1yZWZyZXNoLXRva2VuLnNlcnZpY2UnO1xyXG5cclxuZXhwb3J0IGNvbnN0IE1BWF9SRVRSWV9BVFRFTVBUUyA9IDM7XHJcbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogJ3Jvb3QnIH0pXHJcbmV4cG9ydCBjbGFzcyBSZWZyZXNoU2Vzc2lvblNlcnZpY2Uge1xyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSBmbG93SGVscGVyOiBGbG93SGVscGVyLFxyXG4gICAgcHJpdmF0ZSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlcixcclxuICAgIHByaXZhdGUgZmxvd3NEYXRhU2VydmljZTogRmxvd3NEYXRhU2VydmljZSxcclxuICAgIHByaXZhdGUgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZSxcclxuICAgIHByaXZhdGUgc2lsZW50UmVuZXdTZXJ2aWNlOiBTaWxlbnRSZW5ld1NlcnZpY2UsXHJcbiAgICBwcml2YXRlIGF1dGhTdGF0ZVNlcnZpY2U6IEF1dGhTdGF0ZVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGF1dGhXZWxsS25vd25TZXJ2aWNlOiBBdXRoV2VsbEtub3duU2VydmljZSxcclxuICAgIHByaXZhdGUgcmVmcmVzaFNlc3Npb25JZnJhbWVTZXJ2aWNlOiBSZWZyZXNoU2Vzc2lvbklmcmFtZVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHJlZnJlc2hTZXNzaW9uUmVmcmVzaFRva2VuU2VydmljZTogUmVmcmVzaFNlc3Npb25SZWZyZXNoVG9rZW5TZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSB0YWJzU3luY2hyb25pemF0aW9uU2VydmljZTogVGFic1N5bmNocm9uaXphdGlvblNlcnZpY2VcclxuICApIHt9XHJcblxyXG4gIGZvcmNlUmVmcmVzaFNlc3Npb24oY3VzdG9tUGFyYW1zPzoge1xyXG4gICAgW2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbjtcclxuICB9KTogT2JzZXJ2YWJsZTx7XHJcbiAgICBpZFRva2VuOiBhbnk7XHJcbiAgICBhY2Nlc3NUb2tlbjogYW55O1xyXG4gIH0+IHtcclxuICAgIGlmICh0aGlzLmZsb3dIZWxwZXIuaXNDdXJyZW50Rmxvd0NvZGVGbG93V2l0aFJlZnJlc2hUb2tlbnMoKSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5zdGFydFJlZnJlc2hTZXNzaW9uKGN1c3RvbVBhcmFtcykucGlwZShcclxuICAgICAgICBtYXAoKCkgPT4ge1xyXG4gICAgICAgICAgY29uc3QgaXNBdXRoZW50aWNhdGVkID0gdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLmFyZUF1dGhTdG9yYWdlVG9rZW5zVmFsaWQoKTtcclxuICAgICAgICAgIGlmIChpc0F1dGhlbnRpY2F0ZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICBpZFRva2VuOiB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UuZ2V0SWRUb2tlbigpLFxyXG4gICAgICAgICAgICAgIGFjY2Vzc1Rva2VuOiB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UuZ2V0QWNjZXNzVG9rZW4oKSxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9KVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzLnNpbGVudFJlbmV3Q2FzZSgpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzaWxlbnRSZW5ld0Nhc2UoXHJcbiAgICBjdXN0b21QYXJhbXM/OiB7XHJcbiAgICAgIFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW47XHJcbiAgICB9LFxyXG4gICAgY3VycmVudFJldHJ5PzogbnVtYmVyXHJcbiAgKTogT2JzZXJ2YWJsZTx7XHJcbiAgICBpZFRva2VuOiBhbnk7XHJcbiAgICBhY2Nlc3NUb2tlbjogYW55O1xyXG4gIH0+IHtcclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhgc2lsZW50UmVuZXdDYXNlIENVUlJFTlQgUkVUUlkgQVRURU1QVCAjJHtjdXJyZW50UmV0cnl9YCk7XHJcbiAgICBpZiAoY3VycmVudFJldHJ5ICYmIGN1cnJlbnRSZXRyeSA+IE1BWF9SRVRSWV9BVFRFTVBUUykge1xyXG4gICAgICByZXR1cm4gdGhyb3dFcnJvcihuZXcgRXJyb3IoJ0luaXRpYWxpemF0aW4gaGFzIGJlZW4gZmFpbGVkLiBFeGNlZWRlZCBtYXggcmV0cnkgYXR0ZXBtdHMuJykpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmcm9tKHRoaXMudGFic1N5bmNocm9uaXphdGlvblNlcnZpY2UuaXNMZWFkZXJDaGVjaygpKS5waXBlKFxyXG4gICAgICB0aW1lb3V0KDIwMDApLFxyXG4gICAgICB0YWtlKDEpLFxyXG4gICAgICBzd2l0Y2hNYXAoKGlzTGVhZGVyKSA9PiB7XHJcbiAgICAgICAgaWYgKGlzTGVhZGVyKSB7XHJcbiAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYGZvcmNlUmVmcmVzaFNlc3Npb24gV0UgQVJFIExFQURFUmApO1xyXG4gICAgICAgICAgcmV0dXJuIGZvcmtKb2luKFtcclxuICAgICAgICAgICAgdGhpcy5zdGFydFJlZnJlc2hTZXNzaW9uKGN1c3RvbVBhcmFtcyksXHJcbiAgICAgICAgICAgIHRoaXMuc2lsZW50UmVuZXdTZXJ2aWNlLnJlZnJlc2hTZXNzaW9uV2l0aElGcmFtZUNvbXBsZXRlZCQucGlwZSh0YWtlKDEpKSxcclxuICAgICAgICAgIF0pLnBpcGUoXHJcbiAgICAgICAgICAgIHRpbWVvdXQoNTAwMCksXHJcbiAgICAgICAgICAgIG1hcCgoW18sIGNhbGxiYWNrQ29udGV4dF0pID0+IHtcclxuICAgICAgICAgICAgICBjb25zdCBpc0F1dGhlbnRpY2F0ZWQgPSB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UuYXJlQXV0aFN0b3JhZ2VUb2tlbnNWYWxpZCgpO1xyXG4gICAgICAgICAgICAgIGlmIChpc0F1dGhlbnRpY2F0ZWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgIGlkVG9rZW46IGNhbGxiYWNrQ29udGV4dD8uYXV0aFJlc3VsdD8uaWRfdG9rZW4sXHJcbiAgICAgICAgICAgICAgICAgIGFjY2Vzc1Rva2VuOiBjYWxsYmFja0NvbnRleHQ/LmF1dGhSZXN1bHQ/LmFjY2Vzc190b2tlbixcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgIGNhdGNoRXJyb3IoKGVycm9yKSA9PiB7XHJcbiAgICAgICAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgVGltZW91dEVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZyhcclxuICAgICAgICAgICAgICAgICAgYGZvcmNlUmVmcmVzaFNlc3Npb24gV0UgQVJFIExFQURFUiA+IG9jY3VyZWQgVElNRU9VVCBFUlJPUiBTTyBXRSBSRVRSWTogdGhpcy5mb3JjZVJlZnJlc2hTZXNzaW9uKGN1c3RvbVBhcmFtcylgXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRSZXRyeSkge1xyXG4gICAgICAgICAgICAgICAgICBjdXJyZW50UmV0cnkrKztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRSZXRyeSA9IDE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zaWxlbnRSZW5ld0Nhc2UoY3VzdG9tUGFyYW1zLCBjdXJyZW50UmV0cnkpO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYGZvcmNlUmVmcmVzaFNlc3Npb24gV0UgQVJFIE5PVCBOT1QgTk9UIExFQURFUmApO1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMudGFic1N5bmNocm9uaXphdGlvblNlcnZpY2UuZ2V0U2lsZW50UmVuZXdGaW5pc2hlZE9ic2VydmFibGUoKS5waXBlKFxyXG4gICAgICAgICAgICB0YWtlKDEpLFxyXG4gICAgICAgICAgICB0aW1lb3V0KDUwMDApLFxyXG4gICAgICAgICAgICBjYXRjaEVycm9yKChlcnJvcikgPT4ge1xyXG4gICAgICAgICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIFRpbWVvdXRFcnJvcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoXHJcbiAgICAgICAgICAgICAgICAgIGBmb3JjZVJlZnJlc2hTZXNzaW9uIFdFIEFSRSBOT1QgTk9UIE5PVCBMRUFERVIgPiBvY2N1cmVkIFRJTUVPVVQgRVJST1IgU08gV0UgUkVUUlk6IHRoaXMuZm9yY2VSZWZyZXNoU2Vzc2lvbihjdXN0b21QYXJhbXMpYFxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50UmV0cnkpIHtcclxuICAgICAgICAgICAgICAgICAgY3VycmVudFJldHJ5Kys7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBjdXJyZW50UmV0cnkgPSAxO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2lsZW50UmVuZXdDYXNlKGN1c3RvbVBhcmFtcywgY3VycmVudFJldHJ5KTtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIHRocm93IGVycm9yO1xyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgbWFwKCgpID0+IHtcclxuICAgICAgICAgICAgICBjb25zdCBpc0F1dGhlbnRpY2F0ZWQgPSB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UuYXJlQXV0aFN0b3JhZ2VUb2tlbnNWYWxpZCgpO1xyXG4gICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhcclxuICAgICAgICAgICAgICAgIGBmb3JjZVJlZnJlc2hTZXNzaW9uIFdFIEFSRSBOT1QgTk9UIE5PVCBMRUFERVIgPiBnZXRTaWxlbnRSZW5ld0ZpbmlzaGVkT2JzZXJ2YWJsZSBFTU1JVFMgVkFMVUUgPiBpc0F1dGhlbnRpY2F0ZWQgPSAke2lzQXV0aGVudGljYXRlZH1gXHJcbiAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICBpZiAoaXNBdXRoZW50aWNhdGVkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICBpZFRva2VuOiB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UuZ2V0SWRUb2tlbigpLFxyXG4gICAgICAgICAgICAgICAgICBhY2Nlc3NUb2tlbjogdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLmdldEFjY2Vzc1Rva2VuKCksXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKFxyXG4gICAgICAgICAgICAgICAgYGZvcmNlUmVmcmVzaFNlc3Npb24gV0UgQVJFIE5PVCBOT1QgTk9UIExFQURFUiA+IGdldFNpbGVudFJlbmV3RmluaXNoZWRPYnNlcnZhYmxlIEVNTUlUUyBWQUxVRSA+IGlzQXV0aGVudGljYXRlZCBGQUxTRSBXRSBET05UIEtOT1cgV0FIVCBUTyBETyBXSVRIIFRISVNgXHJcbiAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KSxcclxuICAgICAgY2F0Y2hFcnJvcigoZXJyb3IpID0+IHtcclxuICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBUaW1lb3V0RXJyb3IpIHtcclxuICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKFxyXG4gICAgICAgICAgICBgZm9yY2VSZWZyZXNoU2Vzc2lvbiA+IEZST00gaXNMZWFkZXJDaGVjayA+IG9jY3VyZWQgVElNRU9VVCBFUlJPUiBTTyBXRSBSRVRSWTogdGhpcy5mb3JjZVJlZnJlc2hTZXNzaW9uKGN1c3RvbVBhcmFtcylgXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgaWYgKGN1cnJlbnRSZXRyeSkge1xyXG4gICAgICAgICAgICBjdXJyZW50UmV0cnkrKztcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRSZXRyeSA9IDE7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5zaWxlbnRSZW5ld0Nhc2UoY3VzdG9tUGFyYW1zLCBjdXJyZW50UmV0cnkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzdGFydFJlZnJlc2hTZXNzaW9uKGN1c3RvbVBhcmFtcz86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB9KSB7XHJcbiAgICBjb25zdCBpc1NpbGVudFJlbmV3UnVubmluZyA9IHRoaXMuZmxvd3NEYXRhU2VydmljZS5pc1NpbGVudFJlbmV3UnVubmluZygpO1xyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBDaGVja2luZzogc2lsZW50UmVuZXdSdW5uaW5nOiAke2lzU2lsZW50UmVuZXdSdW5uaW5nfWApO1xyXG4gICAgY29uc3Qgc2hvdWxkQmVFeGVjdXRlZCA9ICFpc1NpbGVudFJlbmV3UnVubmluZztcclxuXHJcbiAgICBpZiAoIXNob3VsZEJlRXhlY3V0ZWQpIHtcclxuICAgICAgcmV0dXJuIG9mKG51bGwpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGF1dGhXZWxsa25vd25FbmRwb2ludEFkcmVzcyA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24/LmF1dGhXZWxsa25vd25FbmRwb2ludDtcclxuXHJcbiAgICBpZiAoIWF1dGhXZWxsa25vd25FbmRwb2ludEFkcmVzcykge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoJ25vIGF1dGh3ZWxsa25vd25lbmRwb2ludCBnaXZlbiEnKTtcclxuICAgICAgcmV0dXJuIG9mKG51bGwpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzLmF1dGhXZWxsS25vd25TZXJ2aWNlLmdldEF1dGhXZWxsS25vd25FbmRQb2ludHMoYXV0aFdlbGxrbm93bkVuZHBvaW50QWRyZXNzKS5waXBlKFxyXG4gICAgICBzd2l0Y2hNYXAoKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuZmxvd3NEYXRhU2VydmljZS5zZXRTaWxlbnRSZW5ld1J1bm5pbmcoKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZmxvd0hlbHBlci5pc0N1cnJlbnRGbG93Q29kZUZsb3dXaXRoUmVmcmVzaFRva2VucygpKSB7XHJcbiAgICAgICAgICAvLyBSZWZyZXNoIFNlc3Npb24gdXNpbmcgUmVmcmVzaCB0b2tlbnNcclxuICAgICAgICAgIHJldHVybiB0aGlzLnJlZnJlc2hTZXNzaW9uUmVmcmVzaFRva2VuU2VydmljZS5yZWZyZXNoU2Vzc2lvbldpdGhSZWZyZXNoVG9rZW5zKGN1c3RvbVBhcmFtcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5yZWZyZXNoU2Vzc2lvbklmcmFtZVNlcnZpY2UucmVmcmVzaFNlc3Npb25XaXRoSWZyYW1lKGN1c3RvbVBhcmFtcywgJ2xvZ2luJyk7XHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLy8gcHJpdmF0ZSB0aW1lb3V0UmV0cnlTdHJhdGVneShlcnJvckF0dGVtcHRzOiBPYnNlcnZhYmxlPGFueT4pIHtcclxuICAvLyAgIHJldHVybiBlcnJvckF0dGVtcHRzLnBpcGUoXHJcbiAgLy8gICAgIG1lcmdlTWFwKChlcnJvciwgaW5kZXgpID0+IHtcclxuICAvLyAgICAgICBjb25zdCBzY2FsaW5nRHVyYXRpb24gPSAxMDAwO1xyXG4gIC8vICAgICAgIGNvbnN0IGN1cnJlbnRBdHRlbXB0ID0gaW5kZXggKyAxO1xyXG5cclxuICAvLyAgICAgICBpZiAoIShlcnJvciBpbnN0YW5jZW9mIFRpbWVvdXRFcnJvcikgfHwgY3VycmVudEF0dGVtcHQgPiBNQVhfUkVUUllfQVRURU1QVFMpIHtcclxuICAvLyAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yKTtcclxuICAvLyAgICAgICB9XHJcblxyXG4gIC8vICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgZm9yY2VSZWZyZXNoU2Vzc2lvbiB0aW1lb3V0LiBBdHRlbXB0ICMke2N1cnJlbnRBdHRlbXB0fWApO1xyXG5cclxuICAvLyAgICAgICB0aGlzLmZsb3dzRGF0YVNlcnZpY2UucmVzZXRTaWxlbnRSZW5ld1J1bm5pbmcoKTtcclxuICAvLyAgICAgICByZXR1cm4gdGltZXIoY3VycmVudEF0dGVtcHQgKiBzY2FsaW5nRHVyYXRpb24pO1xyXG4gIC8vICAgICB9KVxyXG4gIC8vICAgKTtcclxuICAvLyB9XHJcbn1cclxuIl19