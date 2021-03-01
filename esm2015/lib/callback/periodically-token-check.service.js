import { Injectable } from '@angular/core';
import { from, of, throwError } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "../flows/flows.service";
import * as i2 from "../utils/flowHelper/flow-helper.service";
import * as i3 from "../config/config.provider";
import * as i4 from "../flows/flows-data.service";
import * as i5 from "../logging/logger.service";
import * as i6 from "../userData/user-service";
import * as i7 from "../authState/auth-state.service";
import * as i8 from "../iframe/refresh-session-iframe.service";
import * as i9 from "./refresh-session-refresh-token.service";
import * as i10 from "./intervall.service";
import * as i11 from "../storage/storage-persistance.service";
import * as i12 from "./../iframe/tabs-synchronization.service";
export class PeriodicallyTokenCheckService {
    constructor(flowsService, flowHelper, configurationProvider, flowsDataService, loggerService, userService, authStateService, refreshSessionIframeService, refreshSessionRefreshTokenService, intervalService, storagePersistanceService, tabsSynchronizationService) {
        this.flowsService = flowsService;
        this.flowHelper = flowHelper;
        this.configurationProvider = configurationProvider;
        this.flowsDataService = flowsDataService;
        this.loggerService = loggerService;
        this.userService = userService;
        this.authStateService = authStateService;
        this.refreshSessionIframeService = refreshSessionIframeService;
        this.refreshSessionRefreshTokenService = refreshSessionRefreshTokenService;
        this.intervalService = intervalService;
        this.storagePersistanceService = storagePersistanceService;
        this.tabsSynchronizationService = tabsSynchronizationService;
    }
    startTokenValidationPeriodically(repeatAfterSeconds) {
        if (!!this.intervalService.runTokenValidationRunning || !this.configurationProvider.openIDConfiguration.silentRenew) {
            return;
        }
        this.loggerService.logDebug(`starting token validation check every ${repeatAfterSeconds}s`);
        const periodicallyCheck$ = this.intervalService.startPeriodicTokenCheck(repeatAfterSeconds).pipe(switchMap(() => {
            const idToken = this.authStateService.getIdToken();
            const isSilentRenewRunning = this.flowsDataService.isSilentRenewRunning();
            const userDataFromStore = this.userService.getUserDataFromStore();
            this.loggerService.logDebug(`Checking: silentRenewRunning: ${isSilentRenewRunning} id_token: ${!!idToken} userData: ${!!userDataFromStore}`);
            const shouldBeExecuted = userDataFromStore && !isSilentRenewRunning && idToken;
            if (!shouldBeExecuted) {
                return of(null);
            }
            const idTokenHasExpired = this.authStateService.hasIdTokenExpired();
            const accessTokenHasExpired = this.authStateService.hasAccessTokenExpiredIfExpiryExists();
            if (!idTokenHasExpired && !accessTokenHasExpired) {
                return of(null);
            }
            if (!this.configurationProvider.openIDConfiguration.silentRenew) {
                this.flowsService.resetAuthorizationData();
                return of(null);
            }
            this.loggerService.logDebug('starting silent renew...');
            return from(this.tabsSynchronizationService.isLeaderCheck()).pipe(take(1), switchMap((isLeader) => {
                if (isLeader && !this.flowsDataService.isSilentRenewRunning()) {
                    this.flowsDataService.setSilentRenewRunning();
                    // Retrieve Dynamically Set Custom Params
                    const customParams = this.storagePersistanceService.read('storageCustomRequestParams');
                    if (this.flowHelper.isCurrentFlowCodeFlowWithRefreshTokens()) {
                        // Refresh Session using Refresh tokens
                        return this.refreshSessionRefreshTokenService.refreshSessionWithRefreshTokens(customParams);
                    }
                    return this.refreshSessionIframeService.refreshSessionWithIframe(customParams, 'silent-renew-code');
                }
                return of(null);
            }));
        }));
        this.intervalService.runTokenValidationRunning = periodicallyCheck$
            .pipe(catchError(() => {
            this.flowsDataService.resetSilentRenewRunning();
            return throwError('periodically check failed');
        }))
            .subscribe(() => {
            this.loggerService.logDebug('silent renew, periodic check finished!');
            if (this.flowHelper.isCurrentFlowCodeFlowWithRefreshTokens()) {
                this.flowsDataService.resetSilentRenewRunning();
            }
        }, (err) => {
            this.loggerService.logError('silent renew failed!', err);
        });
    }
}
PeriodicallyTokenCheckService.ɵfac = function PeriodicallyTokenCheckService_Factory(t) { return new (t || PeriodicallyTokenCheckService)(i0.ɵɵinject(i1.FlowsService), i0.ɵɵinject(i2.FlowHelper), i0.ɵɵinject(i3.ConfigurationProvider), i0.ɵɵinject(i4.FlowsDataService), i0.ɵɵinject(i5.LoggerService), i0.ɵɵinject(i6.UserService), i0.ɵɵinject(i7.AuthStateService), i0.ɵɵinject(i8.RefreshSessionIframeService), i0.ɵɵinject(i9.RefreshSessionRefreshTokenService), i0.ɵɵinject(i10.IntervallService), i0.ɵɵinject(i11.StoragePersistanceService), i0.ɵɵinject(i12.TabsSynchronizationService)); };
PeriodicallyTokenCheckService.ɵprov = i0.ɵɵdefineInjectable({ token: PeriodicallyTokenCheckService, factory: PeriodicallyTokenCheckService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(PeriodicallyTokenCheckService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], function () { return [{ type: i1.FlowsService }, { type: i2.FlowHelper }, { type: i3.ConfigurationProvider }, { type: i4.FlowsDataService }, { type: i5.LoggerService }, { type: i6.UserService }, { type: i7.AuthStateService }, { type: i8.RefreshSessionIframeService }, { type: i9.RefreshSessionRefreshTokenService }, { type: i10.IntervallService }, { type: i11.StoragePersistanceService }, { type: i12.TabsSynchronizationService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyaW9kaWNhbGx5LXRva2VuLWNoZWNrLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy8iLCJzb3VyY2VzIjpbImxpYi9jYWxsYmFjay9wZXJpb2RpY2FsbHktdG9rZW4tY2hlY2suc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM1QyxPQUFPLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7QUFlN0QsTUFBTSxPQUFPLDZCQUE2QjtJQUN4QyxZQUNVLFlBQTBCLEVBQzFCLFVBQXNCLEVBQ3RCLHFCQUE0QyxFQUM1QyxnQkFBa0MsRUFDbEMsYUFBNEIsRUFDNUIsV0FBd0IsRUFDeEIsZ0JBQWtDLEVBQ2xDLDJCQUF3RCxFQUN4RCxpQ0FBb0UsRUFDcEUsZUFBaUMsRUFDakMseUJBQW9ELEVBQ3BELDBCQUFzRDtRQVh0RCxpQkFBWSxHQUFaLFlBQVksQ0FBYztRQUMxQixlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQ3RCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7UUFDNUMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUM1QixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUN4QixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLGdDQUEyQixHQUEzQiwyQkFBMkIsQ0FBNkI7UUFDeEQsc0NBQWlDLEdBQWpDLGlDQUFpQyxDQUFtQztRQUNwRSxvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7UUFDakMsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUEyQjtRQUNwRCwrQkFB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LElBQUksQ0FBQyxlQUFlLENBQUMseUJBQXlCLEdBQUcsa0JBQWtCO2FBQ2hFLElBQUksQ0FDSCxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ2QsSUFBSSxDQUFDLGdCQUFnQixDQUFDLHVCQUF1QixFQUFFLENBQUM7WUFDaEQsT0FBTyxVQUFVLENBQUMsMkJBQTJCLENBQUMsQ0FBQztRQUNqRCxDQUFDLENBQUMsQ0FDSDthQUNBLFNBQVMsQ0FDUixHQUFHLEVBQUU7WUFDSCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO1lBQ3RFLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxzQ0FBc0MsRUFBRSxFQUFFO2dCQUM1RCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsdUJBQXVCLEVBQUUsQ0FBQzthQUNqRDtRQUNILENBQUMsRUFDRCxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ04sSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsc0JBQXNCLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDM0QsQ0FBQyxDQUNGLENBQUM7SUFDTixDQUFDOzswR0EvRlUsNkJBQTZCO3FFQUE3Qiw2QkFBNkIsV0FBN0IsNkJBQTZCLG1CQURoQixNQUFNO2tEQUNuQiw2QkFBNkI7Y0FEekMsVUFBVTtlQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgZnJvbSwgb2YsIHRocm93RXJyb3IgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgY2F0Y2hFcnJvciwgc3dpdGNoTWFwLCB0YWtlIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQgeyBBdXRoU3RhdGVTZXJ2aWNlIH0gZnJvbSAnLi4vYXV0aFN0YXRlL2F1dGgtc3RhdGUuc2VydmljZSc7XHJcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25Qcm92aWRlciB9IGZyb20gJy4uL2NvbmZpZy9jb25maWcucHJvdmlkZXInO1xyXG5pbXBvcnQgeyBGbG93c0RhdGFTZXJ2aWNlIH0gZnJvbSAnLi4vZmxvd3MvZmxvd3MtZGF0YS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgRmxvd3NTZXJ2aWNlIH0gZnJvbSAnLi4vZmxvd3MvZmxvd3Muc2VydmljZSc7XHJcbmltcG9ydCB7IFJlZnJlc2hTZXNzaW9uSWZyYW1lU2VydmljZSB9IGZyb20gJy4uL2lmcmFtZS9yZWZyZXNoLXNlc3Npb24taWZyYW1lLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi4vbG9nZ2luZy9sb2dnZXIuc2VydmljZSc7XHJcbmltcG9ydCB7IFN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UgfSBmcm9tICcuLi9zdG9yYWdlL3N0b3JhZ2UtcGVyc2lzdGFuY2Uuc2VydmljZSc7XHJcbmltcG9ydCB7IFVzZXJTZXJ2aWNlIH0gZnJvbSAnLi4vdXNlckRhdGEvdXNlci1zZXJ2aWNlJztcclxuaW1wb3J0IHsgRmxvd0hlbHBlciB9IGZyb20gJy4uL3V0aWxzL2Zsb3dIZWxwZXIvZmxvdy1oZWxwZXIuc2VydmljZSc7XHJcbmltcG9ydCB7IFRhYnNTeW5jaHJvbml6YXRpb25TZXJ2aWNlIH0gZnJvbSAnLi8uLi9pZnJhbWUvdGFicy1zeW5jaHJvbml6YXRpb24uc2VydmljZSc7XHJcbmltcG9ydCB7IEludGVydmFsbFNlcnZpY2UgfSBmcm9tICcuL2ludGVydmFsbC5zZXJ2aWNlJztcclxuaW1wb3J0IHsgUmVmcmVzaFNlc3Npb25SZWZyZXNoVG9rZW5TZXJ2aWNlIH0gZnJvbSAnLi9yZWZyZXNoLXNlc3Npb24tcmVmcmVzaC10b2tlbi5zZXJ2aWNlJztcclxuXHJcbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogJ3Jvb3QnIH0pXHJcbmV4cG9ydCBjbGFzcyBQZXJpb2RpY2FsbHlUb2tlbkNoZWNrU2VydmljZSB7XHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIGZsb3dzU2VydmljZTogRmxvd3NTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBmbG93SGVscGVyOiBGbG93SGVscGVyLFxyXG4gICAgcHJpdmF0ZSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlcixcclxuICAgIHByaXZhdGUgZmxvd3NEYXRhU2VydmljZTogRmxvd3NEYXRhU2VydmljZSxcclxuICAgIHByaXZhdGUgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZSxcclxuICAgIHByaXZhdGUgdXNlclNlcnZpY2U6IFVzZXJTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBhdXRoU3RhdGVTZXJ2aWNlOiBBdXRoU3RhdGVTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSByZWZyZXNoU2Vzc2lvbklmcmFtZVNlcnZpY2U6IFJlZnJlc2hTZXNzaW9uSWZyYW1lU2VydmljZSxcclxuICAgIHByaXZhdGUgcmVmcmVzaFNlc3Npb25SZWZyZXNoVG9rZW5TZXJ2aWNlOiBSZWZyZXNoU2Vzc2lvblJlZnJlc2hUb2tlblNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGludGVydmFsU2VydmljZTogSW50ZXJ2YWxsU2VydmljZSxcclxuICAgIHByaXZhdGUgc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZTogU3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZSxcclxuICAgIHByaXZhdGUgdGFic1N5bmNocm9uaXphdGlvblNlcnZpY2U6IFRhYnNTeW5jaHJvbml6YXRpb25TZXJ2aWNlXHJcbiAgKSB7fVxyXG5cclxuICBzdGFydFRva2VuVmFsaWRhdGlvblBlcmlvZGljYWxseShyZXBlYXRBZnRlclNlY29uZHM6IG51bWJlcikge1xyXG4gICAgaWYgKCEhdGhpcy5pbnRlcnZhbFNlcnZpY2UucnVuVG9rZW5WYWxpZGF0aW9uUnVubmluZyB8fCAhdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5zaWxlbnRSZW5ldykge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBzdGFydGluZyB0b2tlbiB2YWxpZGF0aW9uIGNoZWNrIGV2ZXJ5ICR7cmVwZWF0QWZ0ZXJTZWNvbmRzfXNgKTtcclxuXHJcbiAgICBjb25zdCBwZXJpb2RpY2FsbHlDaGVjayQgPSB0aGlzLmludGVydmFsU2VydmljZS5zdGFydFBlcmlvZGljVG9rZW5DaGVjayhyZXBlYXRBZnRlclNlY29uZHMpLnBpcGUoXHJcbiAgICAgIHN3aXRjaE1hcCgoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaWRUb2tlbiA9IHRoaXMuYXV0aFN0YXRlU2VydmljZS5nZXRJZFRva2VuKCk7XHJcbiAgICAgICAgY29uc3QgaXNTaWxlbnRSZW5ld1J1bm5pbmcgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuaXNTaWxlbnRSZW5ld1J1bm5pbmcoKTtcclxuICAgICAgICBjb25zdCB1c2VyRGF0YUZyb21TdG9yZSA9IHRoaXMudXNlclNlcnZpY2UuZ2V0VXNlckRhdGFGcm9tU3RvcmUoKTtcclxuXHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKFxyXG4gICAgICAgICAgYENoZWNraW5nOiBzaWxlbnRSZW5ld1J1bm5pbmc6ICR7aXNTaWxlbnRSZW5ld1J1bm5pbmd9IGlkX3Rva2VuOiAkeyEhaWRUb2tlbn0gdXNlckRhdGE6ICR7ISF1c2VyRGF0YUZyb21TdG9yZX1gXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgY29uc3Qgc2hvdWxkQmVFeGVjdXRlZCA9IHVzZXJEYXRhRnJvbVN0b3JlICYmICFpc1NpbGVudFJlbmV3UnVubmluZyAmJiBpZFRva2VuO1xyXG5cclxuICAgICAgICBpZiAoIXNob3VsZEJlRXhlY3V0ZWQpIHtcclxuICAgICAgICAgIHJldHVybiBvZihudWxsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGlkVG9rZW5IYXNFeHBpcmVkID0gdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLmhhc0lkVG9rZW5FeHBpcmVkKCk7XHJcbiAgICAgICAgY29uc3QgYWNjZXNzVG9rZW5IYXNFeHBpcmVkID0gdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLmhhc0FjY2Vzc1Rva2VuRXhwaXJlZElmRXhwaXJ5RXhpc3RzKCk7XHJcblxyXG4gICAgICAgIGlmICghaWRUb2tlbkhhc0V4cGlyZWQgJiYgIWFjY2Vzc1Rva2VuSGFzRXhwaXJlZCkge1xyXG4gICAgICAgICAgcmV0dXJuIG9mKG51bGwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnNpbGVudFJlbmV3KSB7XHJcbiAgICAgICAgICB0aGlzLmZsb3dzU2VydmljZS5yZXNldEF1dGhvcml6YXRpb25EYXRhKCk7XHJcbiAgICAgICAgICByZXR1cm4gb2YobnVsbCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ3N0YXJ0aW5nIHNpbGVudCByZW5ldy4uLicpO1xyXG5cclxuICAgICAgICByZXR1cm4gZnJvbSh0aGlzLnRhYnNTeW5jaHJvbml6YXRpb25TZXJ2aWNlLmlzTGVhZGVyQ2hlY2soKSkucGlwZShcclxuICAgICAgICAgIHRha2UoMSksXHJcbiAgICAgICAgICBzd2l0Y2hNYXAoKGlzTGVhZGVyKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChpc0xlYWRlciAmJiAhdGhpcy5mbG93c0RhdGFTZXJ2aWNlLmlzU2lsZW50UmVuZXdSdW5uaW5nKCkpIHtcclxuICAgICAgICAgICAgICB0aGlzLmZsb3dzRGF0YVNlcnZpY2Uuc2V0U2lsZW50UmVuZXdSdW5uaW5nKCk7XHJcbiAgICAgICAgICAgICAgLy8gUmV0cmlldmUgRHluYW1pY2FsbHkgU2V0IEN1c3RvbSBQYXJhbXNcclxuICAgICAgICAgICAgICBjb25zdCBjdXN0b21QYXJhbXM6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB9ID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQoXHJcbiAgICAgICAgICAgICAgICAnc3RvcmFnZUN1c3RvbVJlcXVlc3RQYXJhbXMnXHJcbiAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgaWYgKHRoaXMuZmxvd0hlbHBlci5pc0N1cnJlbnRGbG93Q29kZUZsb3dXaXRoUmVmcmVzaFRva2VucygpKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBSZWZyZXNoIFNlc3Npb24gdXNpbmcgUmVmcmVzaCB0b2tlbnNcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnJlZnJlc2hTZXNzaW9uUmVmcmVzaFRva2VuU2VydmljZS5yZWZyZXNoU2Vzc2lvbldpdGhSZWZyZXNoVG9rZW5zKGN1c3RvbVBhcmFtcyk7XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yZWZyZXNoU2Vzc2lvbklmcmFtZVNlcnZpY2UucmVmcmVzaFNlc3Npb25XaXRoSWZyYW1lKGN1c3RvbVBhcmFtcywgJ3NpbGVudC1yZW5ldy1jb2RlJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBvZihudWxsKTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgKTtcclxuICAgICAgfSlcclxuICAgICk7XHJcblxyXG4gICAgdGhpcy5pbnRlcnZhbFNlcnZpY2UucnVuVG9rZW5WYWxpZGF0aW9uUnVubmluZyA9IHBlcmlvZGljYWxseUNoZWNrJFxyXG4gICAgICAucGlwZShcclxuICAgICAgICBjYXRjaEVycm9yKCgpID0+IHtcclxuICAgICAgICAgIHRoaXMuZmxvd3NEYXRhU2VydmljZS5yZXNldFNpbGVudFJlbmV3UnVubmluZygpO1xyXG4gICAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoJ3BlcmlvZGljYWxseSBjaGVjayBmYWlsZWQnKTtcclxuICAgICAgICB9KVxyXG4gICAgICApXHJcbiAgICAgIC5zdWJzY3JpYmUoXHJcbiAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdzaWxlbnQgcmVuZXcsIHBlcmlvZGljIGNoZWNrIGZpbmlzaGVkIScpO1xyXG4gICAgICAgICAgaWYgKHRoaXMuZmxvd0hlbHBlci5pc0N1cnJlbnRGbG93Q29kZUZsb3dXaXRoUmVmcmVzaFRva2VucygpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZmxvd3NEYXRhU2VydmljZS5yZXNldFNpbGVudFJlbmV3UnVubmluZygpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgKGVycikgPT4ge1xyXG4gICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKCdzaWxlbnQgcmVuZXcgZmFpbGVkIScsIGVycik7XHJcbiAgICAgICAgfVxyXG4gICAgICApO1xyXG4gIH1cclxufVxyXG4iXX0=