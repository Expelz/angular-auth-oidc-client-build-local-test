import { Injectable } from '@angular/core';
import { map, switchMap } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "../logging/logger.service";
import * as i2 from "../validation/token-validation.service";
import * as i3 from "../utils/url/url.service";
import * as i4 from "../utils/redirect/redirect.service";
import * as i5 from "../config/config.provider";
import * as i6 from "../config/auth-well-known.service";
import * as i7 from "./popup.service";
import * as i8 from "./../check-auth.service";
import * as i9 from "./../userData/user-service";
import * as i10 from "../authState/auth-state.service";
export class LoginService {
    constructor(loggerService, tokenValidationService, urlService, redirectService, configurationProvider, authWellKnownService, popupService, checkAuthService, userService, authStateService) {
        this.loggerService = loggerService;
        this.tokenValidationService = tokenValidationService;
        this.urlService = urlService;
        this.redirectService = redirectService;
        this.configurationProvider = configurationProvider;
        this.authWellKnownService = authWellKnownService;
        this.popupService = popupService;
        this.checkAuthService = checkAuthService;
        this.userService = userService;
        this.authStateService = authStateService;
    }
    login(authOptions) {
        if (!this.tokenValidationService.hasConfigValidResponseType()) {
            this.loggerService.logError('Invalid response type!');
            return;
        }
        const authWellknownEndpoint = this.configurationProvider.openIDConfiguration.authWellknownEndpoint;
        if (!authWellknownEndpoint) {
            this.loggerService.logError('no authWellknownEndpoint given!');
            return;
        }
        this.loggerService.logDebug('BEGIN Authorize OIDC Flow, no auth data');
        this.authWellKnownService.getAuthWellKnownEndPoints(authWellknownEndpoint).subscribe(() => {
            const { urlHandler, customParams } = authOptions || {};
            const url = this.urlService.getAuthorizeUrl(customParams);
            if (!url) {
                this.loggerService.logError('Could not create url', url);
                return;
            }
            if (urlHandler) {
                urlHandler(url);
            }
            else {
                this.redirectService.redirectTo(url);
            }
        });
    }
    loginWithPopUp(authOptions, popupOptions) {
        if (!this.tokenValidationService.hasConfigValidResponseType()) {
            this.loggerService.logError('Invalid response type!');
            return;
        }
        const authWellknownEndpoint = this.configurationProvider.openIDConfiguration.authWellknownEndpoint;
        if (!authWellknownEndpoint) {
            this.loggerService.logError('no authWellknownEndpoint given!');
            return;
        }
        this.loggerService.logDebug('BEGIN Authorize OIDC Flow with popup, no auth data');
        return this.authWellKnownService.getAuthWellKnownEndPoints(authWellknownEndpoint).pipe(switchMap(() => {
            const { customParams } = authOptions || {};
            const authUrl = this.urlService.getAuthorizeUrl(customParams);
            this.popupService.openPopUp(authUrl, popupOptions);
            return this.popupService.receivedUrl$.pipe(switchMap((url) => this.checkAuthService.checkAuth(url)), map((isAuthenticated) => ({
                isAuthenticated,
                userData: this.userService.getUserDataFromStore(),
                accessToken: this.authStateService.getAccessToken(),
            })));
        }));
    }
}
LoginService.ɵfac = function LoginService_Factory(t) { return new (t || LoginService)(i0.ɵɵinject(i1.LoggerService), i0.ɵɵinject(i2.TokenValidationService), i0.ɵɵinject(i3.UrlService), i0.ɵɵinject(i4.RedirectService), i0.ɵɵinject(i5.ConfigurationProvider), i0.ɵɵinject(i6.AuthWellKnownService), i0.ɵɵinject(i7.PopUpService), i0.ɵɵinject(i8.CheckAuthService), i0.ɵɵinject(i9.UserService), i0.ɵɵinject(i10.AuthStateService)); };
LoginService.ɵprov = i0.ɵɵdefineInjectable({ token: LoginService, factory: LoginService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(LoginService, [{
        type: Injectable
    }], function () { return [{ type: i1.LoggerService }, { type: i2.TokenValidationService }, { type: i3.UrlService }, { type: i4.RedirectService }, { type: i5.ConfigurationProvider }, { type: i6.AuthWellKnownService }, { type: i7.PopUpService }, { type: i8.CheckAuthService }, { type: i9.UserService }, { type: i10.AuthStateService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4uc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjLyIsInNvdXJjZXMiOlsibGliL2xvZ2luL2xvZ2luLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDOzs7Ozs7Ozs7Ozs7QUFlaEQsTUFBTSxPQUFPLFlBQVk7SUFDdkIsWUFDVSxhQUE0QixFQUM1QixzQkFBOEMsRUFDOUMsVUFBc0IsRUFDdEIsZUFBZ0MsRUFDaEMscUJBQTRDLEVBQzVDLG9CQUEwQyxFQUMxQyxZQUEwQixFQUMxQixnQkFBa0MsRUFDbEMsV0FBd0IsRUFDeEIsZ0JBQWtDO1FBVGxDLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBd0I7UUFDOUMsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUN0QixvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUFDaEMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQUM1Qyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1FBQzFDLGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBQzFCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMsZ0JBQVcsR0FBWCxXQUFXLENBQWE7UUFDeEIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtJQUN6QyxDQUFDO0lBRUosS0FBSyxDQUFDLFdBQXlCO1FBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsMEJBQTBCLEVBQUUsRUFBRTtZQUM3RCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1lBQ3RELE9BQU87U0FDUjtRQUVELE1BQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLG1CQUFtQixDQUFDLHFCQUFxQixDQUFDO1FBRW5HLElBQUksQ0FBQyxxQkFBcUIsRUFBRTtZQUMxQixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1lBQy9ELE9BQU87U0FDUjtRQUVELElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLHlDQUF5QyxDQUFDLENBQUM7UUFFdkUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLHlCQUF5QixDQUFDLHFCQUFxQixDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTtZQUN4RixNQUFNLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxHQUFHLFdBQVcsSUFBSSxFQUFFLENBQUM7WUFFdkQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFMUQsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDUixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDekQsT0FBTzthQUNSO1lBRUQsSUFBSSxVQUFVLEVBQUU7Z0JBQ2QsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ2pCO2lCQUFNO2dCQUNMLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ3RDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsY0FBYyxDQUFDLFdBQXlCLEVBQUUsWUFBMkI7UUFDbkUsSUFBSSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQywwQkFBMEIsRUFBRSxFQUFFO1lBQzdELElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLHdCQUF3QixDQUFDLENBQUM7WUFDdEQsT0FBTztTQUNSO1FBRUQsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsbUJBQW1CLENBQUMscUJBQXFCLENBQUM7UUFFbkcsSUFBSSxDQUFDLHFCQUFxQixFQUFFO1lBQzFCLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLGlDQUFpQyxDQUFDLENBQUM7WUFDL0QsT0FBTztTQUNSO1FBRUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsb0RBQW9ELENBQUMsQ0FBQztRQUVsRixPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyx5QkFBeUIsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLElBQUksQ0FDcEYsU0FBUyxDQUFDLEdBQUcsRUFBRTtZQUNiLE1BQU0sRUFBRSxZQUFZLEVBQUUsR0FBRyxXQUFXLElBQUksRUFBRSxDQUFDO1lBRTNDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTlELElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQztZQUVuRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLElBQUksQ0FDeEMsU0FBUyxDQUFDLENBQUMsR0FBVyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQ2hFLEdBQUcsQ0FBQyxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDeEIsZUFBZTtnQkFDZixRQUFRLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsRUFBRTtnQkFDakQsV0FBVyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUU7YUFDcEQsQ0FBQyxDQUFDLENBQ0osQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUNILENBQUM7SUFDSixDQUFDOzt3RUFoRlUsWUFBWTtvREFBWixZQUFZLFdBQVosWUFBWTtrREFBWixZQUFZO2NBRHhCLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IG1hcCwgc3dpdGNoTWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQgeyBBdXRoU3RhdGVTZXJ2aWNlIH0gZnJvbSAnLi4vYXV0aFN0YXRlL2F1dGgtc3RhdGUuc2VydmljZSc7XHJcbmltcG9ydCB7IEF1dGhXZWxsS25vd25TZXJ2aWNlIH0gZnJvbSAnLi4vY29uZmlnL2F1dGgtd2VsbC1rbm93bi5zZXJ2aWNlJztcclxuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi4vY29uZmlnL2NvbmZpZy5wcm92aWRlcic7XHJcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgUmVkaXJlY3RTZXJ2aWNlIH0gZnJvbSAnLi4vdXRpbHMvcmVkaXJlY3QvcmVkaXJlY3Quc2VydmljZSc7XHJcbmltcG9ydCB7IFVybFNlcnZpY2UgfSBmcm9tICcuLi91dGlscy91cmwvdXJsLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBUb2tlblZhbGlkYXRpb25TZXJ2aWNlIH0gZnJvbSAnLi4vdmFsaWRhdGlvbi90b2tlbi12YWxpZGF0aW9uLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBDaGVja0F1dGhTZXJ2aWNlIH0gZnJvbSAnLi8uLi9jaGVjay1hdXRoLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBVc2VyU2VydmljZSB9IGZyb20gJy4vLi4vdXNlckRhdGEvdXNlci1zZXJ2aWNlJztcclxuaW1wb3J0IHsgQXV0aE9wdGlvbnMgfSBmcm9tICcuL2F1dGgtb3B0aW9ucyc7XHJcbmltcG9ydCB7IFBvcHVwT3B0aW9ucyB9IGZyb20gJy4vcG9wdXAtb3B0aW9ucyc7XHJcbmltcG9ydCB7IFBvcFVwU2VydmljZSB9IGZyb20gJy4vcG9wdXAuc2VydmljZSc7XHJcblxyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBMb2dpblNlcnZpY2Uge1xyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSBsb2dnZXJTZXJ2aWNlOiBMb2dnZXJTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSB0b2tlblZhbGlkYXRpb25TZXJ2aWNlOiBUb2tlblZhbGlkYXRpb25TZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSB1cmxTZXJ2aWNlOiBVcmxTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSByZWRpcmVjdFNlcnZpY2U6IFJlZGlyZWN0U2VydmljZSxcclxuICAgIHByaXZhdGUgY29uZmlndXJhdGlvblByb3ZpZGVyOiBDb25maWd1cmF0aW9uUHJvdmlkZXIsXHJcbiAgICBwcml2YXRlIGF1dGhXZWxsS25vd25TZXJ2aWNlOiBBdXRoV2VsbEtub3duU2VydmljZSxcclxuICAgIHByaXZhdGUgcG9wdXBTZXJ2aWNlOiBQb3BVcFNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGNoZWNrQXV0aFNlcnZpY2U6IENoZWNrQXV0aFNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHVzZXJTZXJ2aWNlOiBVc2VyU2VydmljZSxcclxuICAgIHByaXZhdGUgYXV0aFN0YXRlU2VydmljZTogQXV0aFN0YXRlU2VydmljZVxyXG4gICkge31cclxuXHJcbiAgbG9naW4oYXV0aE9wdGlvbnM/OiBBdXRoT3B0aW9ucykge1xyXG4gICAgaWYgKCF0aGlzLnRva2VuVmFsaWRhdGlvblNlcnZpY2UuaGFzQ29uZmlnVmFsaWRSZXNwb25zZVR5cGUoKSkge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoJ0ludmFsaWQgcmVzcG9uc2UgdHlwZSEnKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGF1dGhXZWxsa25vd25FbmRwb2ludCA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uYXV0aFdlbGxrbm93bkVuZHBvaW50O1xyXG5cclxuICAgIGlmICghYXV0aFdlbGxrbm93bkVuZHBvaW50KSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcignbm8gYXV0aFdlbGxrbm93bkVuZHBvaW50IGdpdmVuIScpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdCRUdJTiBBdXRob3JpemUgT0lEQyBGbG93LCBubyBhdXRoIGRhdGEnKTtcclxuXHJcbiAgICB0aGlzLmF1dGhXZWxsS25vd25TZXJ2aWNlLmdldEF1dGhXZWxsS25vd25FbmRQb2ludHMoYXV0aFdlbGxrbm93bkVuZHBvaW50KS5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICBjb25zdCB7IHVybEhhbmRsZXIsIGN1c3RvbVBhcmFtcyB9ID0gYXV0aE9wdGlvbnMgfHwge307XHJcblxyXG4gICAgICBjb25zdCB1cmwgPSB0aGlzLnVybFNlcnZpY2UuZ2V0QXV0aG9yaXplVXJsKGN1c3RvbVBhcmFtcyk7XHJcblxyXG4gICAgICBpZiAoIXVybCkge1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcignQ291bGQgbm90IGNyZWF0ZSB1cmwnLCB1cmwpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHVybEhhbmRsZXIpIHtcclxuICAgICAgICB1cmxIYW5kbGVyKHVybCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5yZWRpcmVjdFNlcnZpY2UucmVkaXJlY3RUbyh1cmwpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGxvZ2luV2l0aFBvcFVwKGF1dGhPcHRpb25zPzogQXV0aE9wdGlvbnMsIHBvcHVwT3B0aW9ucz86IFBvcHVwT3B0aW9ucykge1xyXG4gICAgaWYgKCF0aGlzLnRva2VuVmFsaWRhdGlvblNlcnZpY2UuaGFzQ29uZmlnVmFsaWRSZXNwb25zZVR5cGUoKSkge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoJ0ludmFsaWQgcmVzcG9uc2UgdHlwZSEnKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGF1dGhXZWxsa25vd25FbmRwb2ludCA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uYXV0aFdlbGxrbm93bkVuZHBvaW50O1xyXG5cclxuICAgIGlmICghYXV0aFdlbGxrbm93bkVuZHBvaW50KSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcignbm8gYXV0aFdlbGxrbm93bkVuZHBvaW50IGdpdmVuIScpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdCRUdJTiBBdXRob3JpemUgT0lEQyBGbG93IHdpdGggcG9wdXAsIG5vIGF1dGggZGF0YScpO1xyXG5cclxuICAgIHJldHVybiB0aGlzLmF1dGhXZWxsS25vd25TZXJ2aWNlLmdldEF1dGhXZWxsS25vd25FbmRQb2ludHMoYXV0aFdlbGxrbm93bkVuZHBvaW50KS5waXBlKFxyXG4gICAgICBzd2l0Y2hNYXAoKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHsgY3VzdG9tUGFyYW1zIH0gPSBhdXRoT3B0aW9ucyB8fCB7fTtcclxuXHJcbiAgICAgICAgY29uc3QgYXV0aFVybCA9IHRoaXMudXJsU2VydmljZS5nZXRBdXRob3JpemVVcmwoY3VzdG9tUGFyYW1zKTtcclxuXHJcbiAgICAgICAgdGhpcy5wb3B1cFNlcnZpY2Uub3BlblBvcFVwKGF1dGhVcmwsIHBvcHVwT3B0aW9ucyk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLnBvcHVwU2VydmljZS5yZWNlaXZlZFVybCQucGlwZShcclxuICAgICAgICAgIHN3aXRjaE1hcCgodXJsOiBzdHJpbmcpID0+IHRoaXMuY2hlY2tBdXRoU2VydmljZS5jaGVja0F1dGgodXJsKSksXHJcbiAgICAgICAgICBtYXAoKGlzQXV0aGVudGljYXRlZCkgPT4gKHtcclxuICAgICAgICAgICAgaXNBdXRoZW50aWNhdGVkLFxyXG4gICAgICAgICAgICB1c2VyRGF0YTogdGhpcy51c2VyU2VydmljZS5nZXRVc2VyRGF0YUZyb21TdG9yZSgpLFxyXG4gICAgICAgICAgICBhY2Nlc3NUb2tlbjogdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLmdldEFjY2Vzc1Rva2VuKCksXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICApO1xyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcbn1cclxuIl19