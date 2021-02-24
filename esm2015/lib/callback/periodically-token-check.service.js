import { Injectable } from '@angular/core';
import { from, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { EventTypes } from '../public-events/event-types';
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
import * as i13 from "../public-events/public-events.service";
export class PeriodicallyTokenCheckService {
    constructor(flowsService, flowHelper, configurationProvider, flowsDataService, loggerService, userService, authStateService, refreshSessionIframeService, refreshSessionRefreshTokenService, intervalService, storagePersistanceService, tabsSynchronizationService, publicEventsService) {
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
        this.publicEventsService = publicEventsService;
    }
    startTokenValidationPeriodically(repeatAfterSeconds) {
        if (!!this.intervalService.runTokenValidationRunning || !this.configurationProvider.openIDConfiguration.silentRenew) {
            return;
        }
        this.loggerService.logDebug(`starting token validation check every ${repeatAfterSeconds}s`);
        this.tabsSynchronizationService.addHandlerOnSilentRenewFinishedChannel((message) => {
            this.loggerService.logDebug('FROM addHandlerOnSilentRenewFinishedChannel message:', message);
            this.publicEventsService.fireEvent(EventTypes.SilentRenewFinished);
        });
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
            return from(this.tabsSynchronizationService.isLeaderCheck()).pipe(switchMap((isLeader) => {
                if (isLeader && !this.flowsDataService.isSilentRenewRunning()) {
                    this.flowsDataService.setSilentRenewRunning();
                    // Retrieve Dynamically Set Custom Params
                    const customParams = this.storagePersistanceService.read('storageCustomRequestParams');
                    if (this.flowHelper.isCurrentFlowCodeFlowWithRefreshTokens()) {
                        // Refresh Session using Refresh tokens
                        return this.refreshSessionRefreshTokenService.refreshSessionWithRefreshTokens(customParams);
                    }
                    return this.refreshSessionIframeService.refreshSessionWithIframe(customParams);
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
PeriodicallyTokenCheckService.ɵfac = function PeriodicallyTokenCheckService_Factory(t) { return new (t || PeriodicallyTokenCheckService)(i0.ɵɵinject(i1.FlowsService), i0.ɵɵinject(i2.FlowHelper), i0.ɵɵinject(i3.ConfigurationProvider), i0.ɵɵinject(i4.FlowsDataService), i0.ɵɵinject(i5.LoggerService), i0.ɵɵinject(i6.UserService), i0.ɵɵinject(i7.AuthStateService), i0.ɵɵinject(i8.RefreshSessionIframeService), i0.ɵɵinject(i9.RefreshSessionRefreshTokenService), i0.ɵɵinject(i10.IntervallService), i0.ɵɵinject(i11.StoragePersistanceService), i0.ɵɵinject(i12.TabsSynchronizationService), i0.ɵɵinject(i13.PublicEventsService)); };
PeriodicallyTokenCheckService.ɵprov = i0.ɵɵdefineInjectable({ token: PeriodicallyTokenCheckService, factory: PeriodicallyTokenCheckService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(PeriodicallyTokenCheckService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], function () { return [{ type: i1.FlowsService }, { type: i2.FlowHelper }, { type: i3.ConfigurationProvider }, { type: i4.FlowsDataService }, { type: i5.LoggerService }, { type: i6.UserService }, { type: i7.AuthStateService }, { type: i8.RefreshSessionIframeService }, { type: i9.RefreshSessionRefreshTokenService }, { type: i10.IntervallService }, { type: i11.StoragePersistanceService }, { type: i12.TabsSynchronizationService }, { type: i13.PublicEventsService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyaW9kaWNhbGx5LXRva2VuLWNoZWNrLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy8iLCJzb3VyY2VzIjpbImxpYi9jYWxsYmFjay9wZXJpb2RpY2FsbHktdG9rZW4tY2hlY2suc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM1QyxPQUFPLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBT3ZELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7O0FBVTFELE1BQU0sT0FBTyw2QkFBNkI7SUFDeEMsWUFDVSxZQUEwQixFQUMxQixVQUFzQixFQUN0QixxQkFBNEMsRUFDNUMsZ0JBQWtDLEVBQ2xDLGFBQTRCLEVBQzVCLFdBQXdCLEVBQ3hCLGdCQUFrQyxFQUNsQywyQkFBd0QsRUFDeEQsaUNBQW9FLEVBQ3BFLGVBQWlDLEVBQ2pDLHlCQUFvRCxFQUNwRCwwQkFBc0QsRUFDdEQsbUJBQXdDO1FBWnhDLGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBQzFCLGVBQVUsR0FBVixVQUFVLENBQVk7UUFDdEIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQUM1QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1FBQ3hCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMsZ0NBQTJCLEdBQTNCLDJCQUEyQixDQUE2QjtRQUN4RCxzQ0FBaUMsR0FBakMsaUNBQWlDLENBQW1DO1FBQ3BFLG9CQUFlLEdBQWYsZUFBZSxD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Y29yZSc7XHJcbmltcG9ydCB7IGZyb20sIG9mLCB0aHJvd0Vycm9yIH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IGNhdGNoRXJyb3IsIHN3aXRjaE1hcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuaW1wb3J0IHsgQXV0aFN0YXRlU2VydmljZSB9IGZyb20gJy4uL2F1dGhTdGF0ZS9hdXRoLXN0YXRlLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuLi9jb25maWcvY29uZmlnLnByb3ZpZGVyJztcclxuaW1wb3J0IHsgRmxvd3NEYXRhU2VydmljZSB9IGZyb20gJy4uL2Zsb3dzL2Zsb3dzLWRhdGEuc2VydmljZSc7XHJcbmltcG9ydCB7IEZsb3dzU2VydmljZSB9IGZyb20gJy4uL2Zsb3dzL2Zsb3dzLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBSZWZyZXNoU2Vzc2lvbklmcmFtZVNlcnZpY2UgfSBmcm9tICcuLi9pZnJhbWUvcmVmcmVzaC1zZXNzaW9uLWlmcmFtZS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBFdmVudFR5cGVzIH0gZnJvbSAnLi4vcHVibGljLWV2ZW50cy9ldmVudC10eXBlcyc7XHJcbmltcG9ydCB7IFB1YmxpY0V2ZW50c1NlcnZpY2UgfSBmcm9tICcuLi9wdWJsaWMtZXZlbnRzL3B1YmxpYy1ldmVudHMuc2VydmljZSc7XHJcbmltcG9ydCB7IFN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UgfSBmcm9tICcuLi9zdG9yYWdlL3N0b3JhZ2UtcGVyc2lzdGFuY2Uuc2VydmljZSc7XHJcbmltcG9ydCB7IFVzZXJTZXJ2aWNlIH0gZnJvbSAnLi4vdXNlckRhdGEvdXNlci1zZXJ2aWNlJztcclxuaW1wb3J0IHsgRmxvd0hlbHBlciB9IGZyb20gJy4uL3V0aWxzL2Zsb3dIZWxwZXIvZmxvdy1oZWxwZXIuc2VydmljZSc7XHJcbmltcG9ydCB7IFRhYnNTeW5jaHJvbml6YXRpb25TZXJ2aWNlIH0gZnJvbSAnLi8uLi9pZnJhbWUvdGFicy1zeW5jaHJvbml6YXRpb24uc2VydmljZSc7XHJcbmltcG9ydCB7IEludGVydmFsbFNlcnZpY2UgfSBmcm9tICcuL2ludGVydmFsbC5zZXJ2aWNlJztcclxuaW1wb3J0IHsgUmVmcmVzaFNlc3Npb25SZWZyZXNoVG9rZW5TZXJ2aWNlIH0gZnJvbSAnLi9yZWZyZXNoLXNlc3Npb24tcmVmcmVzaC10b2tlbi5zZXJ2aWNlJztcclxuXHJcbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogJ3Jvb3QnIH0pXHJcbmV4cG9ydCBjbGFzcyBQZXJpb2RpY2FsbHlUb2tlbkNoZWNrU2VydmljZSB7XHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIGZsb3dzU2VydmljZTogRmxvd3NTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBmbG93SGVscGVyOiBGbG93SGVscGVyLFxyXG4gICAgcHJpdmF0ZSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlcixcclxuICAgIHByaXZhdGUgZmxvd3NEYXRhU2VydmljZTogRmxvd3NEYXRhU2VydmljZSxcclxuICAgIHByaXZhdGUgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZSxcclxuICAgIHByaXZhdGUgdXNlclNlcnZpY2U6IFVzZXJTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBhdXRoU3RhdGVTZXJ2aWNlOiBBdXRoU3RhdGVTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSByZWZyZXNoU2Vzc2lvbklmcmFtZVNlcnZpY2U6IFJlZnJlc2hTZXNzaW9uSWZyYW1lU2VydmljZSxcclxuICAgIHByaXZhdGUgcmVmcmVzaFNlc3Npb25SZWZyZXNoVG9rZW5TZXJ2aWNlOiBSZWZyZXNoU2Vzc2lvblJlZnJlc2hUb2tlblNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGludGVydmFsU2VydmljZTogSW50ZXJ2YWxsU2VydmljZSxcclxuICAgIHByaXZhdGUgc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZTogU3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZSxcclxuICAgIHByaXZhdGUgdGFic1N5bmNocm9uaXphdGlvblNlcnZpY2U6IFRhYnNTeW5jaHJvbml6YXRpb25TZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBwdWJsaWNFdmVudHNTZXJ2aWNlOiBQdWJsaWNFdmVudHNTZXJ2aWNlXHJcbiAgKSB7fVxyXG5cclxuICBzdGFydFRva2VuVmFsaWRhdGlvblBlcmlvZGljYWxseShyZXBlYXRBZnRlclNlY29uZHM6IG51bWJlcikge1xyXG4gICAgaWYgKCEhdGhpcy5pbnRlcnZhbFNlcnZpY2UucnVuVG9rZW5WYWxpZGF0aW9uUnVubmluZyB8fCAhdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5zaWxlbnRSZW5ldykge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBzdGFydGluZyB0b2tlbiB2YWxpZGF0aW9uIGNoZWNrIGV2ZXJ5ICR7cmVwZWF0QWZ0ZXJTZWNvbmRzfXNgKTtcclxuXHJcbiAgICB0aGlzLnRhYnNTeW5jaHJvbml6YXRpb25TZXJ2aWNlLmFkZEhhbmRsZXJPblNpbGVudFJlbmV3RmluaXNoZWRDaGFubmVsKChtZXNzYWdlKSA9PiB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnRlJPTSBhZGRIYW5kbGVyT25TaWxlbnRSZW5ld0ZpbmlzaGVkQ2hhbm5lbCBtZXNzYWdlOicsIG1lc3NhZ2UpO1xyXG4gICAgICB0aGlzLnB1YmxpY0V2ZW50c1NlcnZpY2UuZmlyZUV2ZW50KEV2ZW50VHlwZXMuU2lsZW50UmVuZXdGaW5pc2hlZCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBwZXJpb2RpY2FsbHlDaGVjayQgPSB0aGlzLmludGVydmFsU2VydmljZS5zdGFydFBlcmlvZGljVG9rZW5DaGVjayhyZXBlYXRBZnRlclNlY29uZHMpLnBpcGUoXHJcbiAgICAgIHN3aXRjaE1hcCgoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaWRUb2tlbiA9IHRoaXMuYXV0aFN0YXRlU2VydmljZS5nZXRJZFRva2VuKCk7XHJcbiAgICAgICAgY29uc3QgaXNTaWxlbnRSZW5ld1J1bm5pbmcgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuaXNTaWxlbnRSZW5ld1J1bm5pbmcoKTtcclxuICAgICAgICBjb25zdCB1c2VyRGF0YUZyb21TdG9yZSA9IHRoaXMudXNlclNlcnZpY2UuZ2V0VXNlckRhdGFGcm9tU3RvcmUoKTtcclxuXHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKFxyXG4gICAgICAgICAgYENoZWNraW5nOiBzaWxlbnRSZW5ld1J1bm5pbmc6ICR7aXNTaWxlbnRSZW5ld1J1bm5pbmd9IGlkX3Rva2VuOiAkeyEhaWRUb2tlbn0gdXNlckRhdGE6ICR7ISF1c2VyRGF0YUZyb21TdG9yZX1gXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgY29uc3Qgc2hvdWxkQmVFeGVjdXRlZCA9IHVzZXJEYXRhRnJvbVN0b3JlICYmICFpc1NpbGVudFJlbmV3UnVubmluZyAmJiBpZFRva2VuO1xyXG5cclxuICAgICAgICBpZiAoIXNob3VsZEJlRXhlY3V0ZWQpIHtcclxuICAgICAgICAgIHJldHVybiBvZihudWxsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGlkVG9rZW5IYXNFeHBpcmVkID0gdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLmhhc0lkVG9rZW5FeHBpcmVkKCk7XHJcbiAgICAgICAgY29uc3QgYWNjZXNzVG9rZW5IYXNFeHBpcmVkID0gdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLmhhc0FjY2Vzc1Rva2VuRXhwaXJlZElmRXhwaXJ5RXhpc3RzKCk7XHJcblxyXG4gICAgICAgIGlmICghaWRUb2tlbkhhc0V4cGlyZWQgJiYgIWFjY2Vzc1Rva2VuSGFzRXhwaXJlZCkge1xyXG4gICAgICAgICAgcmV0dXJuIG9mKG51bGwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnNpbGVudFJlbmV3KSB7XHJcbiAgICAgICAgICB0aGlzLmZsb3dzU2VydmljZS5yZXNldEF1dGhvcml6YXRpb25EYXRhKCk7XHJcbiAgICAgICAgICByZXR1cm4gb2YobnVsbCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ3N0YXJ0aW5nIHNpbGVudCByZW5ldy4uLicpO1xyXG5cclxuICAgICAgICByZXR1cm4gZnJvbSh0aGlzLnRhYnNTeW5jaHJvbml6YXRpb25TZXJ2aWNlLmlzTGVhZGVyQ2hlY2soKSkucGlwZShcclxuICAgICAgICAgIHN3aXRjaE1hcCgoaXNMZWFkZXIpID0+IHtcclxuICAgICAgICAgICAgaWYgKGlzTGVhZGVyICYmICF0aGlzLmZsb3dzRGF0YVNlcnZpY2UuaXNTaWxlbnRSZW5ld1J1bm5pbmcoKSkge1xyXG4gICAgICAgICAgICAgIHRoaXMuZmxvd3NEYXRhU2VydmljZS5zZXRTaWxlbnRSZW5ld1J1bm5pbmcoKTtcclxuICAgICAgICAgICAgICAvLyBSZXRyaWV2ZSBEeW5hbWljYWxseSBTZXQgQ3VzdG9tIFBhcmFtc1xyXG4gICAgICAgICAgICAgIGNvbnN0IGN1c3RvbVBhcmFtczogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIH0gPSB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZChcclxuICAgICAgICAgICAgICAgICdzdG9yYWdlQ3VzdG9tUmVxdWVzdFBhcmFtcydcclxuICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICBpZiAodGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dDb2RlRmxvd1dpdGhSZWZyZXNoVG9rZW5zKCkpIHtcclxuICAgICAgICAgICAgICAgIC8vIFJlZnJlc2ggU2Vzc2lvbiB1c2luZyBSZWZyZXNoIHRva2Vuc1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVmcmVzaFNlc3Npb25SZWZyZXNoVG9rZW5TZXJ2aWNlLnJlZnJlc2hTZXNzaW9uV2l0aFJlZnJlc2hUb2tlbnMoY3VzdG9tUGFyYW1zKTtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLnJlZnJlc2hTZXNzaW9uSWZyYW1lU2VydmljZS5yZWZyZXNoU2Vzc2lvbldpdGhJZnJhbWUoY3VzdG9tUGFyYW1zKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG9mKG51bGwpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICApO1xyXG4gICAgICB9KVxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLmludGVydmFsU2VydmljZS5ydW5Ub2tlblZhbGlkYXRpb25SdW5uaW5nID0gcGVyaW9kaWNhbGx5Q2hlY2skXHJcbiAgICAgIC5waXBlKFxyXG4gICAgICAgIGNhdGNoRXJyb3IoKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5mbG93c0RhdGFTZXJ2aWNlLnJlc2V0U2lsZW50UmVuZXdSdW5uaW5nKCk7XHJcbiAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcigncGVyaW9kaWNhbGx5IGNoZWNrIGZhaWxlZCcpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgIClcclxuICAgICAgLnN1YnNjcmliZShcclxuICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ3NpbGVudCByZW5ldywgcGVyaW9kaWMgY2hlY2sgZmluaXNoZWQhJyk7XHJcbiAgICAgICAgICBpZiAodGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dDb2RlRmxvd1dpdGhSZWZyZXNoVG9rZW5zKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5mbG93c0RhdGFTZXJ2aWNlLnJlc2V0U2lsZW50UmVuZXdSdW5uaW5nKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICAoZXJyKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoJ3NpbGVudCByZW5ldyBmYWlsZWQhJywgZXJyKTtcclxuICAgICAgICB9XHJcbiAgICAgICk7XHJcbiAgfVxyXG59XHJcbiJdfQ==