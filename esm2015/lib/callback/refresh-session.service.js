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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmcmVzaC1zZXNzaW9uLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy8iLCJzb3VyY2VzIjpbImxpYi9jYWxsYmFjay9yZWZyZXNoLXNlc3Npb24uc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFjLEVBQUUsRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ2hGLE9BQU8sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7Ozs7Ozs7Ozs7OztBQVkzRSxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLENBQUM7QUFFcEMsTUFBTSxPQUFPLHFCQUFxQjtJQUNoQyxZQUNVLFVBQXNCLEVBQ3RCLHFCQUE0QyxFQUM1QyxnQkFBa0MsRUFDbEMsYUFBNEIsRUFDNUIsa0JBQXNDLEVBQ3RDLGdCQUFrQyxFQUNsQyxvQkFBMEMsRUFDMUMsMkJBQXdELEVBQ3hELGlDQUFvRSxFQUNwRSwwQkFBc0Q7UUFUdEQsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUN0QiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1FBQzVDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFDNUIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtRQUN0QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBc0I7UUFDMUMsZ0NBQTJCLEdBQTNCLDJCQUEyQixDQUE2QjtRQUN4RCxzQ0FBaUMsR0FBakMsaUNBQWlDLENBQW1DO1FBQ3BFLCtCQUEwQixHQUExQiww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QUFNO2tEQUNuQixxQkFBcUI7Y0FEakMsVUFBVTtlQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgZm9ya0pvaW4sIGZyb20sIE9ic2VydmFibGUsIG9mLCB0aHJvd0Vycm9yLCBUaW1lb3V0RXJyb3IgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgY2F0Y2hFcnJvciwgbWFwLCBzd2l0Y2hNYXAsIHRha2UsIHRpbWVvdXQgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcbmltcG9ydCB7IEF1dGhTdGF0ZVNlcnZpY2UgfSBmcm9tICcuLi9hdXRoU3RhdGUvYXV0aC1zdGF0ZS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgQXV0aFdlbGxLbm93blNlcnZpY2UgfSBmcm9tICcuLi9jb25maWcvYXV0aC13ZWxsLWtub3duLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuLi9jb25maWcvY29uZmlnLnByb3ZpZGVyJztcclxuaW1wb3J0IHsgRmxvd3NEYXRhU2VydmljZSB9IGZyb20gJy4uL2Zsb3dzL2Zsb3dzLWRhdGEuc2VydmljZSc7XHJcbmltcG9ydCB7IFJlZnJlc2hTZXNzaW9uSWZyYW1lU2VydmljZSB9IGZyb20gJy4uL2lmcmFtZS9yZWZyZXNoLXNlc3Npb24taWZyYW1lLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBTaWxlbnRSZW5ld1NlcnZpY2UgfSBmcm9tICcuLi9pZnJhbWUvc2lsZW50LXJlbmV3LnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi4vbG9nZ2luZy9sb2dnZXIuc2VydmljZSc7XHJcbmltcG9ydCB7IEZsb3dIZWxwZXIgfSBmcm9tICcuLi91dGlscy9mbG93SGVscGVyL2Zsb3ctaGVscGVyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBUYWJzU3luY2hyb25pemF0aW9uU2VydmljZSB9IGZyb20gJy4vLi4vaWZyYW1lL3RhYnMtc3luY2hyb25pemF0aW9uLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBSZWZyZXNoU2Vzc2lvblJlZnJlc2hUb2tlblNlcnZpY2UgfSBmcm9tICcuL3JlZnJlc2gtc2Vzc2lvbi1yZWZyZXNoLXRva2VuLnNlcnZpY2UnO1xyXG5cclxuZXhwb3J0IGNvbnN0IE1BWF9SRVRSWV9BVFRFTVBUUyA9IDM7XHJcbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogJ3Jvb3QnIH0pXHJcbmV4cG9ydCBjbGFzcyBSZWZyZXNoU2Vzc2lvblNlcnZpY2Uge1xyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSBmbG93SGVscGVyOiBGbG93SGVscGVyLFxyXG4gICAgcHJpdmF0ZSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlcixcclxuICAgIHByaXZhdGUgZmxvd3NEYXRhU2VydmljZTogRmxvd3NEYXRhU2VydmljZSxcclxuICAgIHByaXZhdGUgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZSxcclxuICAgIHByaXZhdGUgc2lsZW50UmVuZXdTZXJ2aWNlOiBTaWxlbnRSZW5ld1NlcnZpY2UsXHJcbiAgICBwcml2YXRlIGF1dGhTdGF0ZVNlcnZpY2U6IEF1dGhTdGF0ZVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGF1dGhXZWxsS25vd25TZXJ2aWNlOiBBdXRoV2VsbEtub3duU2VydmljZSxcclxuICAgIHByaXZhdGUgcmVmcmVzaFNlc3Npb25JZnJhbWVTZXJ2aWNlOiBSZWZyZXNoU2Vzc2lvbklmcmFtZVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHJlZnJlc2hTZXNzaW9uUmVmcmVzaFRva2VuU2VydmljZTogUmVmcmVzaFNlc3Npb25SZWZyZXNoVG9rZW5TZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSB0YWJzU3luY2hyb25pemF0aW9uU2VydmljZTogVGFic1N5bmNocm9uaXphdGlvblNlcnZpY2VcclxuICApIHt9XHJcblxyXG4gIGZvcmNlUmVmcmVzaFNlc3Npb24oY3VzdG9tUGFyYW1zPzoge1xyXG4gICAgW2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbjtcclxuICB9KTogT2JzZXJ2YWJsZTx7XHJcbiAgICBpZFRva2VuOiBhbnk7XHJcbiAgICBhY2Nlc3NUb2tlbjogYW55O1xyXG4gIH0+IHtcclxuICAgIGlmICh0aGlzLmZsb3dIZWxwZXIuaXNDdXJyZW50Rmxvd0NvZGVGbG93V2l0aFJlZnJlc2hUb2tlbnMoKSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5zdGFydFJlZnJlc2hTZXNzaW9uKGN1c3RvbVBhcmFtcykucGlwZShcclxuICAgICAgICBtYXAoKCkgPT4ge1xyXG4gICAgICAgICAgY29uc3QgaXNBdXRoZW50aWNhdGVkID0gdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLmFyZUF1dGhTdG9yYWdlVG9rZW5zVmFsaWQoKTtcclxuICAgICAgICAgIGlmIChpc0F1dGhlbnRpY2F0ZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICBpZFRva2VuOiB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UuZ2V0SWRUb2tlbigpLFxyXG4gICAgICAgICAgICAgIGFjY2Vzc1Rva2VuOiB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UuZ2V0QWNjZXNzVG9rZW4oKSxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9KVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzLnNpbGVudFJlbmV3Q2FzZSgpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzaWxlbnRSZW5ld0Nhc2UoXHJcbiAgICBjdXN0b21QYXJhbXM/OiB7XHJcbiAgICAgIFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW47XHJcbiAgICB9LFxyXG4gICAgY3VycmVudFJldHJ5PzogbnVtYmVyXHJcbiAgKTogT2JzZXJ2YWJsZTx7XHJcbiAgICBpZFRva2VuOiBhbnk7XHJcbiAgICBhY2Nlc3NUb2tlbjogYW55O1xyXG4gIH0+IHtcclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhgc2lsZW50UmVuZXdDYXNlIENVUlJFTlQgUkVUUlkgQVRURU1QVCAjJHtjdXJyZW50UmV0cnl9YCk7XHJcbiAgICBpZiAoY3VycmVudFJldHJ5ICYmIGN1cnJlbnRSZXRyeSA+IE1BWF9SRVRSWV9BVFRFTVBUUykge1xyXG4gICAgICByZXR1cm4gdGhyb3dFcnJvcihuZXcgRXJyb3IoJ0luaXRpYWxpemF0aW4gaGFzIGJlZW4gZmFpbGVkLiBFeGNlZWRlZCBtYXggcmV0cnkgYXR0ZXBtdHMuJykpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmcm9tKHRoaXMudGFic1N5bmNocm9uaXphdGlvblNlcnZpY2UuaXNMZWFkZXJDaGVjaygpKS5waXBlKFxyXG4gICAgICB0YWtlKDEpLFxyXG4gICAgICBzd2l0Y2hNYXAoKGlzTGVhZGVyKSA9PiB7XHJcbiAgICAgICAgaWYgKGlzTGVhZGVyKSB7XHJcbiAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYGZvcmNlUmVmcmVzaFNlc3Npb24gV0UgQVJFIExFQURFUmApO1xyXG4gICAgICAgICAgcmV0dXJuIGZvcmtKb2luKFtcclxuICAgICAgICAgICAgdGhpcy5zdGFydFJlZnJlc2hTZXNzaW9uKGN1c3RvbVBhcmFtcyksXHJcbiAgICAgICAgICAgIHRoaXMuc2lsZW50UmVuZXdTZXJ2aWNlLnJlZnJlc2hTZXNzaW9uV2l0aElGcmFtZUNvbXBsZXRlZCQucGlwZSh0YWtlKDEpKSxcclxuICAgICAgICAgIF0pLnBpcGUoXHJcbiAgICAgICAgICAgIHRpbWVvdXQodGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5zaWxlbnRSZW5ld1RpbWVvdXRJblNlY29uZHMgKiAxMDAwKSxcclxuICAgICAgICAgICAgbWFwKChbXywgY2FsbGJhY2tDb250ZXh0XSkgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGlzQXV0aGVudGljYXRlZCA9IHRoaXMuYXV0aFN0YXRlU2VydmljZS5hcmVBdXRoU3RvcmFnZVRva2Vuc1ZhbGlkKCk7XHJcbiAgICAgICAgICAgICAgaWYgKGlzQXV0aGVudGljYXRlZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgaWRUb2tlbjogY2FsbGJhY2tDb250ZXh0Py5hdXRoUmVzdWx0Py5pZF90b2tlbixcclxuICAgICAgICAgICAgICAgICAgYWNjZXNzVG9rZW46IGNhbGxiYWNrQ29udGV4dD8uYXV0aFJlc3VsdD8uYWNjZXNzX3Rva2VuLFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgY2F0Y2hFcnJvcigoZXJyb3IpID0+IHtcclxuICAgICAgICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBUaW1lb3V0RXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKFxyXG4gICAgICAgICAgICAgICAgICBgZm9yY2VSZWZyZXNoU2Vzc2lvbiBXRSBBUkUgTEVBREVSID4gb2NjdXJlZCBUSU1FT1VUIEVSUk9SIFNPIFdFIFJFVFJZOiB0aGlzLmZvcmNlUmVmcmVzaFNlc3Npb24oY3VzdG9tUGFyYW1zKWBcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudFJldHJ5KSB7XHJcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRSZXRyeSsrO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgY3VycmVudFJldHJ5ID0gMTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNpbGVudFJlbmV3Q2FzZShjdXN0b21QYXJhbXMsIGN1cnJlbnRSZXRyeSk7XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgZm9yY2VSZWZyZXNoU2Vzc2lvbiBXRSBBUkUgTk9UIE5PVCBOT1QgTEVBREVSYCk7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy50YWJzU3luY2hyb25pemF0aW9uU2VydmljZS5nZXRTaWxlbnRSZW5ld0ZpbmlzaGVkT2JzZXJ2YWJsZSgpLnBpcGUoXHJcbiAgICAgICAgICAgIHRha2UoMSksXHJcbiAgICAgICAgICAgIHRpbWVvdXQodGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5zaWxlbnRSZW5ld1RpbWVvdXRJblNlY29uZHMgKiAxMDAwKSxcclxuICAgICAgICAgICAgY2F0Y2hFcnJvcigoZXJyb3IpID0+IHtcclxuICAgICAgICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBUaW1lb3V0RXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKFxyXG4gICAgICAgICAgICAgICAgICBgZm9yY2VSZWZyZXNoU2Vzc2lvbiBXRSBBUkUgTk9UIE5PVCBOT1QgTEVBREVSID4gb2NjdXJlZCBUSU1FT1VUIEVSUk9SIFNPIFdFIFJFVFJZOiB0aGlzLmZvcmNlUmVmcmVzaFNlc3Npb24oY3VzdG9tUGFyYW1zKWBcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudFJldHJ5KSB7XHJcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRSZXRyeSsrO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgY3VycmVudFJldHJ5ID0gMTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNpbGVudFJlbmV3Q2FzZShjdXN0b21QYXJhbXMsIGN1cnJlbnRSZXRyeSk7XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgIG1hcCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc3QgaXNBdXRoZW50aWNhdGVkID0gdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLmFyZUF1dGhTdG9yYWdlVG9rZW5zVmFsaWQoKTtcclxuICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoXHJcbiAgICAgICAgICAgICAgICBgZm9yY2VSZWZyZXNoU2Vzc2lvbiBXRSBBUkUgTk9UIE5PVCBOT1QgTEVBREVSID4gZ2V0U2lsZW50UmVuZXdGaW5pc2hlZE9ic2VydmFibGUgRU1NSVRTIFZBTFVFID4gaXNBdXRoZW50aWNhdGVkID0gJHtpc0F1dGhlbnRpY2F0ZWR9YFxyXG4gICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgaWYgKGlzQXV0aGVudGljYXRlZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgaWRUb2tlbjogdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLmdldElkVG9rZW4oKSxcclxuICAgICAgICAgICAgICAgICAgYWNjZXNzVG9rZW46IHRoaXMuYXV0aFN0YXRlU2VydmljZS5nZXRBY2Nlc3NUb2tlbigpLFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihcclxuICAgICAgICAgICAgICAgIGBmb3JjZVJlZnJlc2hTZXNzaW9uIFdFIEFSRSBOT1QgTk9UIE5PVCBMRUFERVIgPiBnZXRTaWxlbnRSZW5ld0ZpbmlzaGVkT2JzZXJ2YWJsZSBFTU1JVFMgVkFMVUUgPiBpc0F1dGhlbnRpY2F0ZWQgRkFMU0UgV0UgRE9OVCBLTk9XIFdBSFQgVE8gRE8gV0lUSCBUSElTYFxyXG4gICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHN0YXJ0UmVmcmVzaFNlc3Npb24oY3VzdG9tUGFyYW1zPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIH0pIHtcclxuICAgIGNvbnN0IGlzU2lsZW50UmVuZXdSdW5uaW5nID0gdGhpcy5mbG93c0RhdGFTZXJ2aWNlLmlzU2lsZW50UmVuZXdSdW5uaW5nKCk7XHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYENoZWNraW5nOiBzaWxlbnRSZW5ld1J1bm5pbmc6ICR7aXNTaWxlbnRSZW5ld1J1bm5pbmd9YCk7XHJcbiAgICBjb25zdCBzaG91bGRCZUV4ZWN1dGVkID0gIWlzU2lsZW50UmVuZXdSdW5uaW5nO1xyXG5cclxuICAgIGlmICghc2hvdWxkQmVFeGVjdXRlZCkge1xyXG4gICAgICByZXR1cm4gb2YobnVsbCk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYXV0aFdlbGxrbm93bkVuZHBvaW50QWRyZXNzID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbj8uYXV0aFdlbGxrbm93bkVuZHBvaW50O1xyXG5cclxuICAgIGlmICghYXV0aFdlbGxrbm93bkVuZHBvaW50QWRyZXNzKSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcignbm8gYXV0aHdlbGxrbm93bmVuZHBvaW50IGdpdmVuIScpO1xyXG4gICAgICByZXR1cm4gb2YobnVsbCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuYXV0aFdlbGxLbm93blNlcnZpY2UuZ2V0QXV0aFdlbGxLbm93bkVuZFBvaW50cyhhdXRoV2VsbGtub3duRW5kcG9pbnRBZHJlc3MpLnBpcGUoXHJcbiAgICAgIHN3aXRjaE1hcCgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5mbG93c0RhdGFTZXJ2aWNlLnNldFNpbGVudFJlbmV3UnVubmluZygpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dDb2RlRmxvd1dpdGhSZWZyZXNoVG9rZW5zKCkpIHtcclxuICAgICAgICAgIC8vIFJlZnJlc2ggU2Vzc2lvbiB1c2luZyBSZWZyZXNoIHRva2Vuc1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMucmVmcmVzaFNlc3Npb25SZWZyZXNoVG9rZW5TZXJ2aWNlLnJlZnJlc2hTZXNzaW9uV2l0aFJlZnJlc2hUb2tlbnMoY3VzdG9tUGFyYW1zKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLnJlZnJlc2hTZXNzaW9uSWZyYW1lU2VydmljZS5yZWZyZXNoU2Vzc2lvbldpdGhJZnJhbWUoY3VzdG9tUGFyYW1zKTtcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvLyBwcml2YXRlIHRpbWVvdXRSZXRyeVN0cmF0ZWd5KGVycm9yQXR0ZW1wdHM6IE9ic2VydmFibGU8YW55Pikge1xyXG4gIC8vICAgcmV0dXJuIGVycm9yQXR0ZW1wdHMucGlwZShcclxuICAvLyAgICAgbWVyZ2VNYXAoKGVycm9yLCBpbmRleCkgPT4ge1xyXG4gIC8vICAgICAgIGNvbnN0IHNjYWxpbmdEdXJhdGlvbiA9IDEwMDA7XHJcbiAgLy8gICAgICAgY29uc3QgY3VycmVudEF0dGVtcHQgPSBpbmRleCArIDE7XHJcblxyXG4gIC8vICAgICAgIGlmICghKGVycm9yIGluc3RhbmNlb2YgVGltZW91dEVycm9yKSB8fCBjdXJyZW50QXR0ZW1wdCA+IE1BWF9SRVRSWV9BVFRFTVBUUykge1xyXG4gIC8vICAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoZXJyb3IpO1xyXG4gIC8vICAgICAgIH1cclxuXHJcbiAgLy8gICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBmb3JjZVJlZnJlc2hTZXNzaW9uIHRpbWVvdXQuIEF0dGVtcHQgIyR7Y3VycmVudEF0dGVtcHR9YCk7XHJcblxyXG4gIC8vICAgICAgIHRoaXMuZmxvd3NEYXRhU2VydmljZS5yZXNldFNpbGVudFJlbmV3UnVubmluZygpO1xyXG4gIC8vICAgICAgIHJldHVybiB0aW1lcihjdXJyZW50QXR0ZW1wdCAqIHNjYWxpbmdEdXJhdGlvbik7XHJcbiAgLy8gICAgIH0pXHJcbiAgLy8gICApO1xyXG4gIC8vIH1cclxufVxyXG4iXX0=