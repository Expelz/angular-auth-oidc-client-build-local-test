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
import * as i11 from "./iframe/tabs-synchronization.service";
export class CheckAuthService {
    constructor(doc, checkSessionService, silentRenewService, userService, loggerService, configurationProvider, authStateService, callbackService, refreshSessionService, periodicallyTokenCheckService, popupService, tabsSynchronizationService) {
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
        this.tabsSynchronizationService = tabsSynchronizationService;
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
                if (this.tabsSynchronizationService.isClosed) {
                    this.loggerService.logDebug('this.tabsSynchronizationService.isClosed = TRUE - so we re-initialize');
                    this.tabsSynchronizationService.reInitialize();
                }
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
CheckAuthService.ɵfac = function CheckAuthService_Factory(t) { return new (t || CheckAuthService)(i0.ɵɵinject(DOCUMENT), i0.ɵɵinject(i1.CheckSessionService), i0.ɵɵinject(i2.SilentRenewService), i0.ɵɵinject(i3.UserService), i0.ɵɵinject(i4.LoggerService), i0.ɵɵinject(i5.ConfigurationProvider), i0.ɵɵinject(i6.AuthStateService), i0.ɵɵinject(i7.CallbackService), i0.ɵɵinject(i8.RefreshSessionService), i0.ɵɵinject(i9.PeriodicallyTokenCheckService), i0.ɵɵinject(i10.PopUpService), i0.ɵɵinject(i11.TabsSynchronizationService)); };
CheckAuthService.ɵprov = i0.ɵɵdefineInjectable({ token: CheckAuthService, factory: CheckAuthService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(CheckAuthService, [{
        type: Injectable
    }], function () { return [{ type: undefined, decorators: [{
                type: Inject,
                args: [DOCUMENT]
            }] }, { type: i1.CheckSessionService }, { type: i2.SilentRenewService }, { type: i3.UserService }, { type: i4.LoggerService }, { type: i5.ConfigurationProvider }, { type: i6.AuthStateService }, { type: i7.CallbackService }, { type: i8.RefreshSessionService }, { type: i9.PeriodicallyTokenCheckService }, { type: i10.PopUpService }, { type: i11.TabsSynchronizationService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2stYXV0aC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvIiwic291cmNlcyI6WyJsaWIvY2hlY2stYXV0aC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMzQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNuRCxPQUFPLEVBQWMsRUFBRSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDOzs7Ozs7Ozs7Ozs7O0FBYzVELE1BQU0sT0FBTyxnQkFBZ0I7SUFDM0IsWUFDcUMsR0FBUSxFQUNuQyxtQkFBd0MsRUFDeEMsa0JBQXNDLEVBQ3RDLFdBQXdCLEVBQ3hCLGFBQTRCLEVBQzVCLHFCQUE0QyxFQUM1QyxnQkFBa0MsRUFDbEMsZUFBZ0MsRUFDaEMscUJBQTRDLEVBQzVDLDZCQUE0RCxFQUM1RCxZQUEwQixFQUMxQiwwQkFBc0Q7UUFYM0IsUUFBRyxHQUFILEdBQUcsQ0FBSztRQUNuQyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1FBQ3hDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7UUFDdEMsZ0JBQVcsR0FBWCxXQUFXLENBQWE7UUFDeEIsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFDNUIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQUM1QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtRQUNoQywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1FBQzVDLGtDQUE2QixHQUE3Qiw2QkFBNkIsQ0FBK0I7UUFDNUQsaUJBQVksR0FBWixZQUFZLENBQWM7UUFDMUIsK0JBQTBCLEdB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RUFBRTtvQkFDVixJQUFJLENBQUMsOEJBQThCLEVBQUUsQ0FBQztpQkFDdkM7Z0JBRUQsT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDcEIsQ0FBQyxDQUFDLENBQ0gsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUNILENBQUM7SUFDSixDQUFDO0lBRU8sOEJBQThCO1FBQ3BDLElBQUksSUFBSSxDQUFDLG1CQUFtQixDQUFDLHdCQUF3QixFQUFFLEVBQUU7WUFDdkQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ2xDO1FBRUQsSUFBSSxDQUFDLDZCQUE2QixDQUFDLGdDQUFnQyxDQUNqRSxJQUFJLENBQUMscUJBQXFCLENBQUMsbUJBQW1CLENBQUMscUJBQXFCLENBQ3JFLENBQUM7UUFFRixJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyx1QkFBdUIsRUFBRSxFQUFFO1lBQ3JELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1NBQzdDO0lBQ0gsQ0FBQzs7Z0ZBL0ZVLGdCQUFnQixjQUVqQixRQUFRO3dEQUZQLGdCQUFnQixXQUFoQixnQkFBZ0I7a0RBQWhCLGdCQUFnQjtjQUQ1QixVQUFVOztzQkFHTixNQUFNO3VCQUFDLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBET0NVTUVOVCB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBvZiB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBjYXRjaEVycm9yLCBtYXAsIHN3aXRjaE1hcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuaW1wb3J0IHsgQXV0aFN0YXRlU2VydmljZSB9IGZyb20gJy4vYXV0aFN0YXRlL2F1dGgtc3RhdGUuc2VydmljZSc7XHJcbmltcG9ydCB7IENhbGxiYWNrU2VydmljZSB9IGZyb20gJy4vY2FsbGJhY2svY2FsbGJhY2suc2VydmljZSc7XHJcbmltcG9ydCB7IFBlcmlvZGljYWxseVRva2VuQ2hlY2tTZXJ2aWNlIH0gZnJvbSAnLi9jYWxsYmFjay9wZXJpb2RpY2FsbHktdG9rZW4tY2hlY2suc2VydmljZSc7XHJcbmltcG9ydCB7IFJlZnJlc2hTZXNzaW9uU2VydmljZSB9IGZyb20gJy4vY2FsbGJhY2svcmVmcmVzaC1zZXNzaW9uLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuL2NvbmZpZy9jb25maWcucHJvdmlkZXInO1xyXG5pbXBvcnQgeyBDaGVja1Nlc3Npb25TZXJ2aWNlIH0gZnJvbSAnLi9pZnJhbWUvY2hlY2stc2Vzc2lvbi5zZXJ2aWNlJztcclxuaW1wb3J0IHsgU2lsZW50UmVuZXdTZXJ2aWNlIH0gZnJvbSAnLi9pZnJhbWUvc2lsZW50LXJlbmV3LnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBUYWJzU3luY2hyb25pemF0aW9uU2VydmljZSB9IGZyb20gJy4vaWZyYW1lL3RhYnMtc3luY2hyb25pemF0aW9uLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgUG9wVXBTZXJ2aWNlIH0gZnJvbSAnLi9sb2dpbi9wb3B1cC5zZXJ2aWNlJztcclxuaW1wb3J0IHsgVXNlclNlcnZpY2UgfSBmcm9tICcuL3VzZXJEYXRhL3VzZXItc2VydmljZSc7XHJcblxyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBDaGVja0F1dGhTZXJ2aWNlIHtcclxuICBjb25zdHJ1Y3RvcihcclxuICAgIEBJbmplY3QoRE9DVU1FTlQpIHByaXZhdGUgcmVhZG9ubHkgZG9jOiBhbnksXHJcbiAgICBwcml2YXRlIGNoZWNrU2Vzc2lvblNlcnZpY2U6IENoZWNrU2Vzc2lvblNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHNpbGVudFJlbmV3U2VydmljZTogU2lsZW50UmVuZXdTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSB1c2VyU2VydmljZTogVXNlclNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGNvbmZpZ3VyYXRpb25Qcm92aWRlcjogQ29uZmlndXJhdGlvblByb3ZpZGVyLFxyXG4gICAgcHJpdmF0ZSBhdXRoU3RhdGVTZXJ2aWNlOiBBdXRoU3RhdGVTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBjYWxsYmFja1NlcnZpY2U6IENhbGxiYWNrU2VydmljZSxcclxuICAgIHByaXZhdGUgcmVmcmVzaFNlc3Npb25TZXJ2aWNlOiBSZWZyZXNoU2Vzc2lvblNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHBlcmlvZGljYWxseVRva2VuQ2hlY2tTZXJ2aWNlOiBQZXJpb2RpY2FsbHlUb2tlbkNoZWNrU2VydmljZSxcclxuICAgIHByaXZhdGUgcG9wdXBTZXJ2aWNlOiBQb3BVcFNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHRhYnNTeW5jaHJvbml6YXRpb25TZXJ2aWNlOiBUYWJzU3luY2hyb25pemF0aW9uU2VydmljZVxyXG4gICkge31cclxuXHJcbiAgY2hlY2tBdXRoKHVybD86IHN0cmluZyk6IE9ic2VydmFibGU8Ym9vbGVhbj4ge1xyXG4gICAgaWYgKCF0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5oYXNWYWxpZENvbmZpZygpKSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcignUGxlYXNlIHByb3ZpZGUgYSBjb25maWd1cmF0aW9uIGJlZm9yZSBzZXR0aW5nIHVwIHRoZSBtb2R1bGUnKTtcclxuICAgICAgcmV0dXJuIG9mKGZhbHNlKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ1NUUyBzZXJ2ZXI6ICcgKyB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnN0c1NlcnZlcik7XHJcblxyXG4gICAgY29uc3QgY3VycmVudFVybCA9IHVybCB8fCB0aGlzLmRvYy5kZWZhdWx0Vmlldy5sb2NhdGlvbi50b1N0cmluZygpO1xyXG5cclxuICAgIGlmICh0aGlzLnBvcHVwU2VydmljZS5pc0N1cnJlbnRseUluUG9wdXAoKSkge1xyXG4gICAgICB0aGlzLnBvcHVwU2VydmljZS5zZW5kTWVzc2FnZVRvTWFpbldpbmRvdyhjdXJyZW50VXJsKTtcclxuICAgICAgcmV0dXJuIG9mKG51bGwpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGlzQ2FsbGJhY2sgPSB0aGlzLmNhbGxiYWNrU2VydmljZS5pc0NhbGxiYWNrKGN1cnJlbnRVcmwpO1xyXG5cclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnY3VycmVudFVybCB0byBjaGVjayBhdXRoIHdpdGg6ICcsIGN1cnJlbnRVcmwpO1xyXG5cclxuICAgIGNvbnN0IGNhbGxiYWNrJCA9IGlzQ2FsbGJhY2sgPyB0aGlzLmNhbGxiYWNrU2VydmljZS5oYW5kbGVDYWxsYmFja0FuZEZpcmVFdmVudHMoY3VycmVudFVybCkgOiBvZihudWxsKTtcclxuXHJcbiAgICByZXR1cm4gY2FsbGJhY2skLnBpcGUoXHJcbiAgICAgIG1hcCgoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaXNBdXRoZW50aWNhdGVkID0gdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLmFyZUF1dGhTdG9yYWdlVG9rZW5zVmFsaWQoKTtcclxuICAgICAgICBpZiAoaXNBdXRoZW50aWNhdGVkKSB7XHJcbiAgICAgICAgICB0aGlzLnN0YXJ0Q2hlY2tTZXNzaW9uQW5kVmFsaWRhdGlvbigpO1xyXG5cclxuICAgICAgICAgIGlmICh0aGlzLnRhYnNTeW5jaHJvbml6YXRpb25TZXJ2aWNlLmlzQ2xvc2VkKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygndGhpcy50YWJzU3luY2hyb25pemF0aW9uU2VydmljZS5pc0Nsb3NlZCA9IFRSVUUgLSBzbyB3ZSByZS1pbml0aWFsaXplJyk7XHJcbiAgICAgICAgICAgIHRoaXMudGFic1N5bmNocm9uaXphdGlvblNlcnZpY2UucmVJbml0aWFsaXplKCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKCFpc0NhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYXV0aFN0YXRlU2VydmljZS5zZXRBdXRob3JpemVkQW5kRmlyZUV2ZW50KCk7XHJcbiAgICAgICAgICAgIHRoaXMudXNlclNlcnZpY2UucHVibGlzaFVzZXJEYXRhSWZFeGlzdHMoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnY2hlY2tBdXRoIGNvbXBsZXRlZCBmaXJlZCBldmVudHMsIGF1dGg6ICcgKyBpc0F1dGhlbnRpY2F0ZWQpO1xyXG5cclxuICAgICAgICByZXR1cm4gaXNBdXRoZW50aWNhdGVkO1xyXG4gICAgICB9KSxcclxuICAgICAgY2F0Y2hFcnJvcigoKSA9PiBvZihmYWxzZSkpXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgY2hlY2tBdXRoSW5jbHVkaW5nU2VydmVyKCk6IE9ic2VydmFibGU8Ym9vbGVhbj4ge1xyXG4gICAgcmV0dXJuIHRoaXMuY2hlY2tBdXRoKCkucGlwZShcclxuICAgICAgc3dpdGNoTWFwKChpc0F1dGhlbnRpY2F0ZWQpID0+IHtcclxuICAgICAgICBpZiAoaXNBdXRoZW50aWNhdGVkKSB7XHJcbiAgICAgICAgICByZXR1cm4gb2YoaXNBdXRoZW50aWNhdGVkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLnJlZnJlc2hTZXNzaW9uU2VydmljZS5mb3JjZVJlZnJlc2hTZXNzaW9uKCkucGlwZShcclxuICAgICAgICAgIG1hcCgocmVzdWx0KSA9PiAhIXJlc3VsdD8uaWRUb2tlbiAmJiAhIXJlc3VsdD8uYWNjZXNzVG9rZW4pLFxyXG4gICAgICAgICAgc3dpdGNoTWFwKChpc0F1dGgpID0+IHtcclxuICAgICAgICAgICAgaWYgKGlzQXV0aCkge1xyXG4gICAgICAgICAgICAgIHRoaXMuc3RhcnRDaGVja1Nlc3Npb25BbmRWYWxpZGF0aW9uKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBvZihpc0F1dGgpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICApO1xyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc3RhcnRDaGVja1Nlc3Npb25BbmRWYWxpZGF0aW9uKCkge1xyXG4gICAgaWYgKHRoaXMuY2hlY2tTZXNzaW9uU2VydmljZS5pc0NoZWNrU2Vzc2lvbkNvbmZpZ3VyZWQoKSkge1xyXG4gICAgICB0aGlzLmNoZWNrU2Vzc2lvblNlcnZpY2Uuc3RhcnQoKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnBlcmlvZGljYWxseVRva2VuQ2hlY2tTZXJ2aWNlLnN0YXJ0VG9rZW5WYWxpZGF0aW9uUGVyaW9kaWNhbGx5KFxyXG4gICAgICB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnRva2VuUmVmcmVzaEluU2Vjb25kc1xyXG4gICAgKTtcclxuXHJcbiAgICBpZiAodGhpcy5zaWxlbnRSZW5ld1NlcnZpY2UuaXNTaWxlbnRSZW5ld0NvbmZpZ3VyZWQoKSkge1xyXG4gICAgICB0aGlzLnNpbGVudFJlbmV3U2VydmljZS5nZXRPckNyZWF0ZUlmcmFtZSgpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXX0=