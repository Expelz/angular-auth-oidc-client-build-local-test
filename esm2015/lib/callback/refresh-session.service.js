import { Injectable } from '@angular/core';
import { forkJoin, of, throwError, TimeoutError, timer } from 'rxjs';
import { map, mergeMap, retryWhen, switchMap, take, timeout } from 'rxjs/operators';
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
export const MAX_RETRY_ATTEMPTS = 3;
export class RefreshSessionService {
    constructor(flowHelper, configurationProvider, flowsDataService, loggerService, silentRenewService, authStateService, authWellKnownService, refreshSessionIframeService, refreshSessionRefreshTokenService) {
        this.flowHelper = flowHelper;
        this.configurationProvider = configurationProvider;
        this.flowsDataService = flowsDataService;
        this.loggerService = loggerService;
        this.silentRenewService = silentRenewService;
        this.authStateService = authStateService;
        this.authWellKnownService = authWellKnownService;
        this.refreshSessionIframeService = refreshSessionIframeService;
        this.refreshSessionRefreshTokenService = refreshSessionRefreshTokenService;
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
        return forkJoin([
            this.startRefreshSession(customParams),
            this.silentRenewService.refreshSessionWithIFrameCompleted$.pipe(take(1)),
        ]).pipe(timeout(this.configurationProvider.openIDConfiguration.silentRenewTimeoutInSeconds * 1000), retryWhen(this.timeoutRetryStrategy.bind(this)), map(([_, callbackContext]) => {
            var _a, _b;
            const isAuthenticated = this.authStateService.areAuthStorageTokensValid();
            if (isAuthenticated) {
                return {
                    idToken: (_a = callbackContext === null || callbackContext === void 0 ? void 0 : callbackContext.authResult) === null || _a === void 0 ? void 0 : _a.id_token,
                    accessToken: (_b = callbackContext === null || callbackContext === void 0 ? void 0 : callbackContext.authResult) === null || _b === void 0 ? void 0 : _b.access_token,
                };
            }
            return null;
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
    timeoutRetryStrategy(errorAttempts) {
        return errorAttempts.pipe(mergeMap((error, index) => {
            const scalingDuration = 1000;
            const currentAttempt = index + 1;
            if (!(error instanceof TimeoutError) || currentAttempt > MAX_RETRY_ATTEMPTS) {
                return throwError(error);
            }
            this.loggerService.logDebug(`forceRefreshSession timeout. Attempt #${currentAttempt}`);
            this.flowsDataService.resetSilentRenewRunning();
            return timer(currentAttempt * scalingDuration);
        }));
    }
}
RefreshSessionService.ɵfac = function RefreshSessionService_Factory(t) { return new (t || RefreshSessionService)(i0.ɵɵinject(i1.FlowHelper), i0.ɵɵinject(i2.ConfigurationProvider), i0.ɵɵinject(i3.FlowsDataService), i0.ɵɵinject(i4.LoggerService), i0.ɵɵinject(i5.SilentRenewService), i0.ɵɵinject(i6.AuthStateService), i0.ɵɵinject(i7.AuthWellKnownService), i0.ɵɵinject(i8.RefreshSessionIframeService), i0.ɵɵinject(i9.RefreshSessionRefreshTokenService)); };
RefreshSessionService.ɵprov = i0.ɵɵdefineInjectable({ token: RefreshSessionService, factory: RefreshSessionService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(RefreshSessionService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], function () { return [{ type: i1.FlowHelper }, { type: i2.ConfigurationProvider }, { type: i3.FlowsDataService }, { type: i4.LoggerService }, { type: i5.SilentRenewService }, { type: i6.AuthStateService }, { type: i7.AuthWellKnownService }, { type: i8.RefreshSessionIframeService }, { type: i9.RefreshSessionRefreshTokenService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmcmVzaC1zZXNzaW9uLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy8iLCJzb3VyY2VzIjpbImxpYi9jYWxsYmFjay9yZWZyZXNoLXNlc3Npb24uc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxRQUFRLEVBQWMsRUFBRSxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ2pGLE9BQU8sRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxNQUFNLGdCQUFnQixDQUFDOzs7Ozs7Ozs7OztBQVdwRixNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLENBQUM7QUFFcEMsTUFBTSxPQUFPLHFCQUFxQjtJQUNoQyxZQUNVLFVBQXNCLEVBQ3RCLHFCQUE0QyxFQUM1QyxnQkFBa0MsRUFDbEMsYUFBNEIsRUFDNUIsa0JBQXNDLEVBQ3RDLGdCQUFrQyxFQUNsQyxvQkFBMEMsRUFDMUMsMkJBQXdELEVBQ3hELGlDQUFvRTtRQVJwRSxlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQ3RCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7UUFDNUMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUM1Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1FBQ3RDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtRQUMxQyxnQ0FBMkIsR0FBM0IsMkJBQTJCLENBQTZCO1FBQ3hELHNDQUFpQyxHQUFqQyxpQ0FBaUMsQ0FBbUM7SUFDM0UsQ0FBQztJQUVKLG1CQUFtQixD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Q0FBQyxDQUFDO1FBQ2pGLENBQUMsQ0FBQyxDQUNILENBQUM7SUFDSixDQUFDO0lBRU8sb0JBQW9CLENBQUMsYUFBOEI7UUFDekQsT0FBTyxhQUFhLENBQUMsSUFBSSxDQUN2QixRQUFRLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDeEIsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDO1lBQzdCLE1BQU0sY0FBYyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUM7WUFFakMsSUFBSSxDQUFDLENBQUMsS0FBSyxZQUFZLFlBQVksQ0FBQyxJQUFJLGNBQWMsR0FBRyxrQkFBa0IsRUFBRTtnQkFDM0UsT0FBTyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDMUI7WUFFRCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyx5Q0FBeUMsY0FBYyxFQUFFLENBQUMsQ0FBQztZQUV2RixJQUFJLENBQUMsZ0JBQWdCLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztZQUNoRCxPQUFPLEtBQUssQ0FBQyxjQUFjLEdBQUcsZUFBZSxDQUFDLENBQUM7UUFDakQsQ0FBQyxDQUFDLENBQ0gsQ0FBQztJQUNKLENBQUM7OzBGQS9GVSxxQkFBcUI7NkRBQXJCLHFCQUFxQixXQUFyQixxQkFBcUIsbUJBRFIsTUFBTTtrREFDbkIscUJBQXFCO2NBRGpDLFVBQVU7ZUFBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IGZvcmtKb2luLCBPYnNlcnZhYmxlLCBvZiwgdGhyb3dFcnJvciwgVGltZW91dEVycm9yLCB0aW1lciB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBtYXAsIG1lcmdlTWFwLCByZXRyeVdoZW4sIHN3aXRjaE1hcCwgdGFrZSwgdGltZW91dCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuaW1wb3J0IHsgQXV0aFN0YXRlU2VydmljZSB9IGZyb20gJy4uL2F1dGhTdGF0ZS9hdXRoLXN0YXRlLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBBdXRoV2VsbEtub3duU2VydmljZSB9IGZyb20gJy4uL2NvbmZpZy9hdXRoLXdlbGwta25vd24uc2VydmljZSc7XHJcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25Qcm92aWRlciB9IGZyb20gJy4uL2NvbmZpZy9jb25maWcucHJvdmlkZXInO1xyXG5pbXBvcnQgeyBGbG93c0RhdGFTZXJ2aWNlIH0gZnJvbSAnLi4vZmxvd3MvZmxvd3MtZGF0YS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgUmVmcmVzaFNlc3Npb25JZnJhbWVTZXJ2aWNlIH0gZnJvbSAnLi4vaWZyYW1lL3JlZnJlc2gtc2Vzc2lvbi1pZnJhbWUuc2VydmljZSc7XHJcbmltcG9ydCB7IFNpbGVudFJlbmV3U2VydmljZSB9IGZyb20gJy4uL2lmcmFtZS9zaWxlbnQtcmVuZXcuc2VydmljZSc7XHJcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgRmxvd0hlbHBlciB9IGZyb20gJy4uL3V0aWxzL2Zsb3dIZWxwZXIvZmxvdy1oZWxwZXIuc2VydmljZSc7XHJcbmltcG9ydCB7IFJlZnJlc2hTZXNzaW9uUmVmcmVzaFRva2VuU2VydmljZSB9IGZyb20gJy4vcmVmcmVzaC1zZXNzaW9uLXJlZnJlc2gtdG9rZW4uc2VydmljZSc7XHJcblxyXG5leHBvcnQgY29uc3QgTUFYX1JFVFJZX0FUVEVNUFRTID0gMztcclxuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiAncm9vdCcgfSlcclxuZXhwb3J0IGNsYXNzIFJlZnJlc2hTZXNzaW9uU2VydmljZSB7XHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIGZsb3dIZWxwZXI6IEZsb3dIZWxwZXIsXHJcbiAgICBwcml2YXRlIGNvbmZpZ3VyYXRpb25Qcm92aWRlcjogQ29uZmlndXJhdGlvblByb3ZpZGVyLFxyXG4gICAgcHJpdmF0ZSBmbG93c0RhdGFTZXJ2aWNlOiBGbG93c0RhdGFTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBsb2dnZXJTZXJ2aWNlOiBMb2dnZXJTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBzaWxlbnRSZW5ld1NlcnZpY2U6IFNpbGVudFJlbmV3U2VydmljZSxcclxuICAgIHByaXZhdGUgYXV0aFN0YXRlU2VydmljZTogQXV0aFN0YXRlU2VydmljZSxcclxuICAgIHByaXZhdGUgYXV0aFdlbGxLbm93blNlcnZpY2U6IEF1dGhXZWxsS25vd25TZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSByZWZyZXNoU2Vzc2lvbklmcmFtZVNlcnZpY2U6IFJlZnJlc2hTZXNzaW9uSWZyYW1lU2VydmljZSxcclxuICAgIHByaXZhdGUgcmVmcmVzaFNlc3Npb25SZWZyZXNoVG9rZW5TZXJ2aWNlOiBSZWZyZXNoU2Vzc2lvblJlZnJlc2hUb2tlblNlcnZpY2VcclxuICApIHt9XHJcblxyXG4gIGZvcmNlUmVmcmVzaFNlc3Npb24oY3VzdG9tUGFyYW1zPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIH0pIHtcclxuICAgIGlmICh0aGlzLmZsb3dIZWxwZXIuaXNDdXJyZW50Rmxvd0NvZGVGbG93V2l0aFJlZnJlc2hUb2tlbnMoKSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5zdGFydFJlZnJlc2hTZXNzaW9uKGN1c3RvbVBhcmFtcykucGlwZShcclxuICAgICAgICBtYXAoKCkgPT4ge1xyXG4gICAgICAgICAgY29uc3QgaXNBdXRoZW50aWNhdGVkID0gdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLmFyZUF1dGhTdG9yYWdlVG9rZW5zVmFsaWQoKTtcclxuICAgICAgICAgIGlmIChpc0F1dGhlbnRpY2F0ZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICBpZFRva2VuOiB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UuZ2V0SWRUb2tlbigpLFxyXG4gICAgICAgICAgICAgIGFjY2Vzc1Rva2VuOiB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UuZ2V0QWNjZXNzVG9rZW4oKSxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9KVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmb3JrSm9pbihbXHJcbiAgICAgIHRoaXMuc3RhcnRSZWZyZXNoU2Vzc2lvbihjdXN0b21QYXJhbXMpLFxyXG4gICAgICB0aGlzLnNpbGVudFJlbmV3U2VydmljZS5yZWZyZXNoU2Vzc2lvbldpdGhJRnJhbWVDb21wbGV0ZWQkLnBpcGUodGFrZSgxKSksXHJcbiAgICBdKS5waXBlKFxyXG4gICAgICB0aW1lb3V0KHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uc2lsZW50UmVuZXdUaW1lb3V0SW5TZWNvbmRzICogMTAwMCksXHJcbiAgICAgIHJldHJ5V2hlbih0aGlzLnRpbWVvdXRSZXRyeVN0cmF0ZWd5LmJpbmQodGhpcykpLFxyXG4gICAgICBtYXAoKFtfLCBjYWxsYmFja0NvbnRleHRdKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaXNBdXRoZW50aWNhdGVkID0gdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLmFyZUF1dGhTdG9yYWdlVG9rZW5zVmFsaWQoKTtcclxuICAgICAgICBpZiAoaXNBdXRoZW50aWNhdGVkKSB7XHJcbiAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpZFRva2VuOiBjYWxsYmFja0NvbnRleHQ/LmF1dGhSZXN1bHQ/LmlkX3Rva2VuLFxyXG4gICAgICAgICAgICBhY2Nlc3NUb2tlbjogY2FsbGJhY2tDb250ZXh0Py5hdXRoUmVzdWx0Py5hY2Nlc3NfdG9rZW4sXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBwcml2YXRlIHN0YXJ0UmVmcmVzaFNlc3Npb24oY3VzdG9tUGFyYW1zPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIH0pIHtcclxuICAgIGNvbnN0IGlzU2lsZW50UmVuZXdSdW5uaW5nID0gdGhpcy5mbG93c0RhdGFTZXJ2aWNlLmlzU2lsZW50UmVuZXdSdW5uaW5nKCk7XHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYENoZWNraW5nOiBzaWxlbnRSZW5ld1J1bm5pbmc6ICR7aXNTaWxlbnRSZW5ld1J1bm5pbmd9YCk7XHJcbiAgICBjb25zdCBzaG91bGRCZUV4ZWN1dGVkID0gIWlzU2lsZW50UmVuZXdSdW5uaW5nO1xyXG5cclxuICAgIGlmICghc2hvdWxkQmVFeGVjdXRlZCkge1xyXG4gICAgICByZXR1cm4gb2YobnVsbCk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYXV0aFdlbGxrbm93bkVuZHBvaW50QWRyZXNzID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbj8uYXV0aFdlbGxrbm93bkVuZHBvaW50O1xyXG5cclxuICAgIGlmICghYXV0aFdlbGxrbm93bkVuZHBvaW50QWRyZXNzKSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcignbm8gYXV0aHdlbGxrbm93bmVuZHBvaW50IGdpdmVuIScpO1xyXG4gICAgICByZXR1cm4gb2YobnVsbCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuYXV0aFdlbGxLbm93blNlcnZpY2UuZ2V0QXV0aFdlbGxLbm93bkVuZFBvaW50cyhhdXRoV2VsbGtub3duRW5kcG9pbnRBZHJlc3MpLnBpcGUoXHJcbiAgICAgIHN3aXRjaE1hcCgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5mbG93c0RhdGFTZXJ2aWNlLnNldFNpbGVudFJlbmV3UnVubmluZygpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dDb2RlRmxvd1dpdGhSZWZyZXNoVG9rZW5zKCkpIHtcclxuICAgICAgICAgIC8vIFJlZnJlc2ggU2Vzc2lvbiB1c2luZyBSZWZyZXNoIHRva2Vuc1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMucmVmcmVzaFNlc3Npb25SZWZyZXNoVG9rZW5TZXJ2aWNlLnJlZnJlc2hTZXNzaW9uV2l0aFJlZnJlc2hUb2tlbnMoY3VzdG9tUGFyYW1zKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLnJlZnJlc2hTZXNzaW9uSWZyYW1lU2VydmljZS5yZWZyZXNoU2Vzc2lvbldpdGhJZnJhbWUoY3VzdG9tUGFyYW1zKTtcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHRpbWVvdXRSZXRyeVN0cmF0ZWd5KGVycm9yQXR0ZW1wdHM6IE9ic2VydmFibGU8YW55Pikge1xyXG4gICAgcmV0dXJuIGVycm9yQXR0ZW1wdHMucGlwZShcclxuICAgICAgbWVyZ2VNYXAoKGVycm9yLCBpbmRleCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHNjYWxpbmdEdXJhdGlvbiA9IDEwMDA7XHJcbiAgICAgICAgY29uc3QgY3VycmVudEF0dGVtcHQgPSBpbmRleCArIDE7XHJcblxyXG4gICAgICAgIGlmICghKGVycm9yIGluc3RhbmNlb2YgVGltZW91dEVycm9yKSB8fCBjdXJyZW50QXR0ZW1wdCA+IE1BWF9SRVRSWV9BVFRFTVBUUykge1xyXG4gICAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoZXJyb3IpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBmb3JjZVJlZnJlc2hTZXNzaW9uIHRpbWVvdXQuIEF0dGVtcHQgIyR7Y3VycmVudEF0dGVtcHR9YCk7XHJcblxyXG4gICAgICAgIHRoaXMuZmxvd3NEYXRhU2VydmljZS5yZXNldFNpbGVudFJlbmV3UnVubmluZygpO1xyXG4gICAgICAgIHJldHVybiB0aW1lcihjdXJyZW50QXR0ZW1wdCAqIHNjYWxpbmdEdXJhdGlvbik7XHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG4iXX0=