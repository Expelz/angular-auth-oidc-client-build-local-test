import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "./iframe/check-session.service";
import * as i2 from "./iframe/silent-renew.service";
import * as i3 from "./userData/user-service";
import * as i4 from "./logging/logger.service";
import * as i5 from "./config/config.provider";
import * as i6 from "./authState/auth-state.service";
import * as i7 from "./callback/callback.service";
import * as i8 from "./callback/refresh-session.service";
import * as i9 from "./callback/periodically-token-check.service";
import * as i10 from "./login/popup.service";
export class CheckAuthService {
    constructor(doc, checkSessionService, silentRenewService, userService, loggerService, configurationProvider, authStateService, callbackService, refreshSessionService, periodicallyTokenCheckService, popupService) {
        this.doc = doc;
        this.checkSessionService = checkSessionService;
        this.silentRenewService = silentRenewService;
        this.userService = userService;
        this.loggerService = loggerService;
        this.configurationProvider = configurationProvider;
        this.authStateService = authStateService;
        this.callbackService = callbackService;
        this.refreshSessionService = refreshSessionService;
        this.periodicallyTokenCheckService = periodicallyTokenCheckService;
        this.popupService = popupService;
    }
    checkAuth(url) {
        if (!this.configurationProvider.hasValidConfig()) {
            this.loggerService.logError('Please provide a configuration before setting up the module');
            return of(false);
        }
        this.loggerService.logDebug('STS server: ' + this.configurationProvider.openIDConfiguration.stsServer);
        const currentUrl = url || this.doc.defaultView.location.toString();
        if (this.popupService.isCurrentlyInPopup()) {
            this.popupService.sendMessageToMainWindow(currentUrl);
            return of(null);
        }
        const isCallback = this.callbackService.isCallback(currentUrl);
        this.loggerService.logDebug('currentUrl to check auth with: ', currentUrl);
        const callback$ = isCallback ? this.callbackService.handleCallbackAndFireEvents(currentUrl) : of(null);
        return callback$.pipe(map(() => {
            const isAuthenticated = this.authStateService.areAuthStorageTokensValid();
            if (isAuthenticated) {
                this.startCheckSessionAndValidation();
                if (!isCallback) {
                    this.authStateService.setAuthorizedAndFireEvent();
                    this.userService.publishUserDataIfExists();
                }
            }
            this.loggerService.logDebug('checkAuth completed fired events, auth: ' + isAuthenticated);
            return isAuthenticated;
        }), catchError(() => of(false)));
    }
    checkAuthIncludingServer() {
        return this.checkAuth().pipe(switchMap((isAuthenticated) => {
            if (isAuthenticated) {
                return of(isAuthenticated);
            }
            return this.refreshSessionService.forceRefreshSession().pipe(map((result) => !!(result === null || result === void 0 ? void 0 : result.idToken) && !!(result === null || result === void 0 ? void 0 : result.accessToken)), switchMap((isAuth) => {
                if (isAuth) {
                    this.startCheckSessionAndValidation();
                }
                return of(isAuth);
            }));
        }));
    }
    startCheckSessionAndValidation() {
        if (this.checkSessionService.isCheckSessionConfigured()) {
            this.checkSessionService.start();
        }
        this.periodicallyTokenCheckService.startTokenValidationPeriodically(this.configurationProvider.openIDConfiguration.tokenRefreshInSeconds);
        if (this.silentRenewService.isSilentRenewConfigured()) {
            this.silentRenewService.getOrCreateIframe();
        }
    }
}
CheckAuthService.ɵfac = function CheckAuthService_Factory(t) { return new (t || CheckAuthService)(i0.ɵɵinject(DOCUMENT), i0.ɵɵinject(i1.CheckSessionService), i0.ɵɵinject(i2.SilentRenewService), i0.ɵɵinject(i3.UserService), i0.ɵɵinject(i4.LoggerService), i0.ɵɵinject(i5.ConfigurationProvider), i0.ɵɵinject(i6.AuthStateService), i0.ɵɵinject(i7.CallbackService), i0.ɵɵinject(i8.RefreshSessionService), i0.ɵɵinject(i9.PeriodicallyTokenCheckService), i0.ɵɵinject(i10.PopUpService)); };
CheckAuthService.ɵprov = i0.ɵɵdefineInjectable({ token: CheckAuthService, factory: CheckAuthService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(CheckAuthService, [{
        type: Injectable
    }], function () { return [{ type: undefined, decorators: [{
                type: Inject,
                args: [DOCUMENT]
            }] }, { type: i1.CheckSessionService }, { type: i2.SilentRenewService }, { type: i3.UserService }, { type: i4.LoggerService }, { type: i5.ConfigurationProvider }, { type: i6.AuthStateService }, { type: i7.CallbackService }, { type: i8.RefreshSessionService }, { type: i9.PeriodicallyTokenCheckService }, { type: i10.PopUpService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2stYXV0aC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvIiwic291cmNlcyI6WyJsaWIvY2hlY2stYXV0aC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMzQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNuRCxPQUFPLEVBQWMsRUFBRSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDOzs7Ozs7Ozs7Ozs7QUFhNUQsTUFBTSxPQUFPLGdCQUFnQjtJQUMzQixZQUNxQyxHQUFRLEVBQ25DLG1CQUF3QyxFQUN4QyxrQkFBc0MsRUFDdEMsV0FBd0IsRUFDeEIsYUFBNEIsRUFDNUIscUJBQTRDLEVBQzVDLGdCQUFrQyxFQUNsQyxlQUFnQyxFQUNoQyxxQkFBNEMsRUFDNUMsNkJBQTRELEVBQzVELFlBQTBCO1FBVkMsUUFBRyxHQUFILEdBQUcsQ0FBSztRQUNuQyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1FBQ3hDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7UUFDdEMsZ0JBQVcsR0FBWCxXQUFXLENBQWE7UUFDeEIsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFDNUIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQUM1QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtRQUNoQywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1FBQzVDLGtDQUE2QixHQUE3Qiw2QkFBNkIsQ0FBK0I7UUFDNUQsaUJBQVksR0FBWixZQUFZLENBQWM7SUFDakMsQ0FBQztJQUVKLFNBQVMsQ0FBQyxHQUFZ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QUFFLEVBQUU7WUFDdkQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ2xDO1FBRUQsSUFBSSxDQUFDLDZCQUE2QixDQUFDLGdDQUFnQyxDQUNqRSxJQUFJLENBQUMscUJBQXFCLENBQUMsbUJBQW1CLENBQUMscUJBQXFCLENBQ3JFLENBQUM7UUFFRixJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyx1QkFBdUIsRUFBRSxFQUFFO1lBQ3JELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1NBQzdDO0lBQ0gsQ0FBQzs7Z0ZBekZVLGdCQUFnQixjQUVqQixRQUFRO3dEQUZQLGdCQUFnQixXQUFoQixnQkFBZ0I7a0RBQWhCLGdCQUFnQjtjQUQ1QixVQUFVOztzQkFHTixNQUFNO3VCQUFDLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBET0NVTUVOVCB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBvZiB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBjYXRjaEVycm9yLCBtYXAsIHN3aXRjaE1hcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuaW1wb3J0IHsgQXV0aFN0YXRlU2VydmljZSB9IGZyb20gJy4vYXV0aFN0YXRlL2F1dGgtc3RhdGUuc2VydmljZSc7XHJcbmltcG9ydCB7IENhbGxiYWNrU2VydmljZSB9IGZyb20gJy4vY2FsbGJhY2svY2FsbGJhY2suc2VydmljZSc7XHJcbmltcG9ydCB7IFBlcmlvZGljYWxseVRva2VuQ2hlY2tTZXJ2aWNlIH0gZnJvbSAnLi9jYWxsYmFjay9wZXJpb2RpY2FsbHktdG9rZW4tY2hlY2suc2VydmljZSc7XHJcbmltcG9ydCB7IFJlZnJlc2hTZXNzaW9uU2VydmljZSB9IGZyb20gJy4vY2FsbGJhY2svcmVmcmVzaC1zZXNzaW9uLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuL2NvbmZpZy9jb25maWcucHJvdmlkZXInO1xyXG5pbXBvcnQgeyBDaGVja1Nlc3Npb25TZXJ2aWNlIH0gZnJvbSAnLi9pZnJhbWUvY2hlY2stc2Vzc2lvbi5zZXJ2aWNlJztcclxuaW1wb3J0IHsgU2lsZW50UmVuZXdTZXJ2aWNlIH0gZnJvbSAnLi9pZnJhbWUvc2lsZW50LXJlbmV3LnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgUG9wVXBTZXJ2aWNlIH0gZnJvbSAnLi9sb2dpbi9wb3B1cC5zZXJ2aWNlJztcclxuaW1wb3J0IHsgVXNlclNlcnZpY2UgfSBmcm9tICcuL3VzZXJEYXRhL3VzZXItc2VydmljZSc7XHJcblxyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBDaGVja0F1dGhTZXJ2aWNlIHtcclxuICBjb25zdHJ1Y3RvcihcclxuICAgIEBJbmplY3QoRE9DVU1FTlQpIHByaXZhdGUgcmVhZG9ubHkgZG9jOiBhbnksXHJcbiAgICBwcml2YXRlIGNoZWNrU2Vzc2lvblNlcnZpY2U6IENoZWNrU2Vzc2lvblNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHNpbGVudFJlbmV3U2VydmljZTogU2lsZW50UmVuZXdTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSB1c2VyU2VydmljZTogVXNlclNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGNvbmZpZ3VyYXRpb25Qcm92aWRlcjogQ29uZmlndXJhdGlvblByb3ZpZGVyLFxyXG4gICAgcHJpdmF0ZSBhdXRoU3RhdGVTZXJ2aWNlOiBBdXRoU3RhdGVTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBjYWxsYmFja1NlcnZpY2U6IENhbGxiYWNrU2VydmljZSxcclxuICAgIHByaXZhdGUgcmVmcmVzaFNlc3Npb25TZXJ2aWNlOiBSZWZyZXNoU2Vzc2lvblNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHBlcmlvZGljYWxseVRva2VuQ2hlY2tTZXJ2aWNlOiBQZXJpb2RpY2FsbHlUb2tlbkNoZWNrU2VydmljZSxcclxuICAgIHByaXZhdGUgcG9wdXBTZXJ2aWNlOiBQb3BVcFNlcnZpY2VcclxuICApIHt9XHJcblxyXG4gIGNoZWNrQXV0aCh1cmw/OiBzdHJpbmcpOiBPYnNlcnZhYmxlPGJvb2xlYW4+IHtcclxuICAgIGlmICghdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIuaGFzVmFsaWRDb25maWcoKSkge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoJ1BsZWFzZSBwcm92aWRlIGEgY29uZmlndXJhdGlvbiBiZWZvcmUgc2V0dGluZyB1cCB0aGUgbW9kdWxlJyk7XHJcbiAgICAgIHJldHVybiBvZihmYWxzZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdTVFMgc2VydmVyOiAnICsgdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5zdHNTZXJ2ZXIpO1xyXG5cclxuICAgIGNvbnN0IGN1cnJlbnRVcmwgPSB1cmwgfHwgdGhpcy5kb2MuZGVmYXVsdFZpZXcubG9jYXRpb24udG9TdHJpbmcoKTtcclxuXHJcbiAgICBpZiAodGhpcy5wb3B1cFNlcnZpY2UuaXNDdXJyZW50bHlJblBvcHVwKCkpIHtcclxuICAgICAgdGhpcy5wb3B1cFNlcnZpY2Uuc2VuZE1lc3NhZ2VUb01haW5XaW5kb3coY3VycmVudFVybCk7XHJcbiAgICAgIHJldHVybiBvZihudWxsKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBpc0NhbGxiYWNrID0gdGhpcy5jYWxsYmFja1NlcnZpY2UuaXNDYWxsYmFjayhjdXJyZW50VXJsKTtcclxuXHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ2N1cnJlbnRVcmwgdG8gY2hlY2sgYXV0aCB3aXRoOiAnLCBjdXJyZW50VXJsKTtcclxuXHJcbiAgICBjb25zdCBjYWxsYmFjayQgPSBpc0NhbGxiYWNrID8gdGhpcy5jYWxsYmFja1NlcnZpY2UuaGFuZGxlQ2FsbGJhY2tBbmRGaXJlRXZlbnRzKGN1cnJlbnRVcmwpIDogb2YobnVsbCk7XHJcblxyXG4gICAgcmV0dXJuIGNhbGxiYWNrJC5waXBlKFxyXG4gICAgICBtYXAoKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGlzQXV0aGVudGljYXRlZCA9IHRoaXMuYXV0aFN0YXRlU2VydmljZS5hcmVBdXRoU3RvcmFnZVRva2Vuc1ZhbGlkKCk7XHJcbiAgICAgICAgaWYgKGlzQXV0aGVudGljYXRlZCkge1xyXG4gICAgICAgICAgdGhpcy5zdGFydENoZWNrU2Vzc2lvbkFuZFZhbGlkYXRpb24oKTtcclxuXHJcbiAgICAgICAgICBpZiAoIWlzQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLnNldEF1dGhvcml6ZWRBbmRGaXJlRXZlbnQoKTtcclxuICAgICAgICAgICAgdGhpcy51c2VyU2VydmljZS5wdWJsaXNoVXNlckRhdGFJZkV4aXN0cygpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdjaGVja0F1dGggY29tcGxldGVkIGZpcmVkIGV2ZW50cywgYXV0aDogJyArIGlzQXV0aGVudGljYXRlZCk7XHJcblxyXG4gICAgICAgIHJldHVybiBpc0F1dGhlbnRpY2F0ZWQ7XHJcbiAgICAgIH0pLFxyXG4gICAgICBjYXRjaEVycm9yKCgpID0+IG9mKGZhbHNlKSlcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBjaGVja0F1dGhJbmNsdWRpbmdTZXJ2ZXIoKTogT2JzZXJ2YWJsZTxib29sZWFuPiB7XHJcbiAgICByZXR1cm4gdGhpcy5jaGVja0F1dGgoKS5waXBlKFxyXG4gICAgICBzd2l0Y2hNYXAoKGlzQXV0aGVudGljYXRlZCkgPT4ge1xyXG4gICAgICAgIGlmIChpc0F1dGhlbnRpY2F0ZWQpIHtcclxuICAgICAgICAgIHJldHVybiBvZihpc0F1dGhlbnRpY2F0ZWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmVmcmVzaFNlc3Npb25TZXJ2aWNlLmZvcmNlUmVmcmVzaFNlc3Npb24oKS5waXBlKFxyXG4gICAgICAgICAgbWFwKChyZXN1bHQpID0+ICEhcmVzdWx0Py5pZFRva2VuICYmICEhcmVzdWx0Py5hY2Nlc3NUb2tlbiksXHJcbiAgICAgICAgICBzd2l0Y2hNYXAoKGlzQXV0aCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoaXNBdXRoKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5zdGFydENoZWNrU2Vzc2lvbkFuZFZhbGlkYXRpb24oKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG9mKGlzQXV0aCk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICk7XHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzdGFydENoZWNrU2Vzc2lvbkFuZFZhbGlkYXRpb24oKSB7XHJcbiAgICBpZiAodGhpcy5jaGVja1Nlc3Npb25TZXJ2aWNlLmlzQ2hlY2tTZXNzaW9uQ29uZmlndXJlZCgpKSB7XHJcbiAgICAgIHRoaXMuY2hlY2tTZXNzaW9uU2VydmljZS5zdGFydCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucGVyaW9kaWNhbGx5VG9rZW5DaGVja1NlcnZpY2Uuc3RhcnRUb2tlblZhbGlkYXRpb25QZXJpb2RpY2FsbHkoXHJcbiAgICAgIHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24udG9rZW5SZWZyZXNoSW5TZWNvbmRzXHJcbiAgICApO1xyXG5cclxuICAgIGlmICh0aGlzLnNpbGVudFJlbmV3U2VydmljZS5pc1NpbGVudFJlbmV3Q29uZmlndXJlZCgpKSB7XHJcbiAgICAgIHRoaXMuc2lsZW50UmVuZXdTZXJ2aWNlLmdldE9yQ3JlYXRlSWZyYW1lKCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiJdfQ==