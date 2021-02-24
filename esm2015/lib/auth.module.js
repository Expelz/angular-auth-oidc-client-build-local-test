import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { DataService } from './api/data.service';
import { HttpBaseService } from './api/http-base.service';
import { AuthStateService } from './authState/auth-state.service';
import { CheckAuthService } from './check-auth.service';
import { ConfigValidationService } from './config-validation/config-validation.service';
import { AuthWellKnownDataService } from './config/auth-well-known-data.service';
import { AuthWellKnownService } from './config/auth-well-known.service';
import { ConfigurationProvider } from './config/config.provider';
import { OidcConfigService } from './config/config.service';
import { FlowsDataService } from './flows/flows-data.service';
import { FlowsService } from './flows/flows.service';
import { RandomService } from './flows/random/random.service';
import { SigninKeyDataService } from './flows/signin-key-data.service';
import { CheckSessionService } from './iframe/check-session.service';
import { IFrameService } from './iframe/existing-iframe.service';
import { SilentRenewService } from './iframe/silent-renew.service';
import { TabsSynchronizationService } from './iframe/tabs-synchronization.service';
import { LoggerService } from './logging/logger.service';
import { LoginService } from './login/login.service';
import { LogoffRevocationService } from './logoffRevoke/logoff-revocation.service';
import { OidcSecurityService } from './oidc.security.service';
import { PublicEventsService } from './public-events/public-events.service';
import { AbstractSecurityStorage } from './storage/abstract-security-storage';
import { BrowserStorageService } from './storage/browser-storage.service';
import { StoragePersistanceService } from './storage/storage-persistance.service';
import { UserService } from './userData/user-service';
import { EqualityService } from './utils/equality/equality.service';
import { FlowHelper } from './utils/flowHelper/flow-helper.service';
import { PlatformProvider } from './utils/platform-provider/platform.provider';
import { TokenHelperService } from './utils/tokenHelper/oidc-token-helper.service';
import { UrlService } from './utils/url/url.service';
import { StateValidationService } from './validation/state-validation.service';
import { TokenValidationService } from './validation/token-validation.service';
import * as i0 from "@angular/core";
export class AuthModule {
    static forRoot(token = {}) {
        return {
            ngModule: AuthModule,
            providers: [
                OidcConfigService,
                PublicEventsService,
                FlowHelper,
                OidcSecurityService,
                TokenValidationService,
                PlatformProvider,
                CheckSessionService,
                FlowsDataService,
                FlowsService,
                SilentRenewService,
                ConfigurationProvider,
                LogoffRevocationService,
                UserService,
                RandomService,
                HttpBaseService,
                UrlService,
                AuthStateService,
                SigninKeyDataService,
                StoragePersistanceService,
                TokenHelperService,
                LoggerService,
                IFrameService,
                EqualityService,
                LoginService,
                AuthWellKnownDataService,
                AuthWellKnownService,
                DataService,
                StateValidationService,
                ConfigValidationService,
                CheckAuthService,
                {
                    provide: AbstractSecurityStorage,
                    useClass: token.storage || BrowserStorageService,
                },
                TabsSynchronizationService,
            ],
        };
    }
}
AuthModule.ɵmod = i0.ɵɵdefineNgModule({ type: AuthModule });
AuthModule.ɵinj = i0.ɵɵdefineInjector({ factory: function AuthModule_Factory(t) { return new (t || AuthModule)(); }, imports: [[CommonModule, HttpClientModule]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(AuthModule, { imports: [CommonModule, HttpClientModule] }); })();
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(AuthModule, [{
        type: NgModule,
        args: [{
                imports: [CommonModule, HttpClientModule],
                declarations: [],
                exports: [],
            }]
    }], null, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy8iLCJzb3VyY2VzIjpbImxpYi9hdXRoLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDeEQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDakQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQzFELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ2xFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3hELE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLCtDQUErQyxDQUFDO0FBQ3hGLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQ2pGLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQ3hFLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ2pFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQzVELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzlELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNyRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDOUQsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDdkUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDckUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQ2pFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ25FLE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQ25GLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDckQsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sMENBQTBDLENBQUM7QUFDbkYsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDOUQsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDNUUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDOUUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDMUUsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDbEYsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3RELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUNwRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDcEUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sNkNBQTZDLENBQUM7QUFDL0UsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sK0NBQStDLENBQUM7QUFDbkYsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3JELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQy9FLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHVDQUF1QyxDQUFDOztBQU8vRSxNQUFNLE9BQU8sVUFBVTtJQUNyQixNQUFNLENBQUMsT0FBTyxDQUFDLFFBQWUsRUFBRTtRQUM5QixPQUFPO1lBQ0wsUUFBUSxFQUFFLFVBQVU7WUFDcEIsU0FBUyxFQUFFO2dCQUNULGlCQUFpQjtnQkFDakIsbUJBQW1CO2dCQUNuQixVQUFVO2dCQUNWLG1CQUFtQjtnQkFDbkIsc0JBQXNCO2dCQUN0QixnQkFBZ0I7Z0JBQ2hCLG1CQUFtQjtnQkFDbkIsZ0JBQWdCO2dCQUNoQixZQUFZO2dCQUNaLGtCQUFrQjtnQkFDbEIscUJBQXFCO2dCQUNyQix1QkFBdUI7Z0JBQ3ZCLFdBQVc7Z0JBQ1gsYUFBYTtnQkFDYixlQUFlO2dCQUNmLFVBQVU7Z0JBQ1YsZ0JBQWdCO2dCQUNoQixvQkFBb0I7Z0JBQ3BCLHlCQUF5QjtnQkFDekIsa0JBQWtCO2dCQUNsQixhQUFhO2dCQUNiLGFBQWE7Z0JBQ2IsZUFBZTtnQkFDZixZQUFZO2dCQUNaLHdCQUF3QjtnQkFDeEIsb0JBQW9CO2dCQUNwQixXQUFXO2dCQUNYLHNCQUFzQjtnQkFDdEIsdUJBQXVCO2dCQUN2QixnQkFBZ0I7Z0JBQ2hCO29CQUNFLE9BQU8sRUFBRSx1QkFBdUI7b0JBQ2hDLFFBQVEsRUFBRSxLQUFLLENBQUMsT0FBTyxJQUFJLHFCQUFxQjtpQkFDakQ7Z0JBQ0QsMEJBQTBCO2FBQzNCO1NBQ0YsQ0FBQztJQUNKLENBQUM7OzhDQTFDVSxVQUFVO21HQUFWLFVBQVUsa0JBSlosQ0FBQyxZQUFZLEVBQUUsZ0JBQWdCLENBQUM7d0ZBSTlCLFVBQVUsY0FKWCxZQUFZLEVBQUUsZ0JBQWdCO2tEQUk3QixVQUFVO2NBTHRCLFFBQVE7ZUFBQztnQkFDUixPQUFPLEVBQUUsQ0FBQyxZQUFZLEVBQUUsZ0JBQWdCLENBQUM7Z0JBQ3pDLFlBQVksRUFBRSxFQUFFO2dCQUNoQixPQUFPLEVBQUUsRUFBRTthQUNaIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcclxuaW1wb3J0IHsgSHR0cENsaWVudE1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcclxuaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgRGF0YVNlcnZpY2UgfSBmcm9tICcuL2FwaS9kYXRhLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBIdHRwQmFzZVNlcnZpY2UgfSBmcm9tICcuL2FwaS9odHRwLWJhc2Uuc2VydmljZSc7XHJcbmltcG9ydCB7IEF1dGhTdGF0ZVNlcnZpY2UgfSBmcm9tICcuL2F1dGhTdGF0ZS9hdXRoLXN0YXRlLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBDaGVja0F1dGhTZXJ2aWNlIH0gZnJvbSAnLi9jaGVjay1hdXRoLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBDb25maWdWYWxpZGF0aW9uU2VydmljZSB9IGZyb20gJy4vY29uZmlnLXZhbGlkYXRpb24vY29uZmlnLXZhbGlkYXRpb24uc2VydmljZSc7XHJcbmltcG9ydCB7IEF1dGhXZWxsS25vd25EYXRhU2VydmljZSB9IGZyb20gJy4vY29uZmlnL2F1dGgtd2VsbC1rbm93bi1kYXRhLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBBdXRoV2VsbEtub3duU2VydmljZSB9IGZyb20gJy4vY29uZmlnL2F1dGgtd2VsbC1rbm93bi5zZXJ2aWNlJztcclxuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi9jb25maWcvY29uZmlnLnByb3ZpZGVyJztcclxuaW1wb3J0IHsgT2lkY0NvbmZpZ1NlcnZpY2UgfSBmcm9tICcuL2NvbmZpZy9jb25maWcuc2VydmljZSc7XHJcbmltcG9ydCB7IEZsb3dzRGF0YVNlcnZpY2UgfSBmcm9tICcuL2Zsb3dzL2Zsb3dzLWRhdGEuc2VydmljZSc7XHJcbmltcG9ydCB7IEZsb3dzU2VydmljZSB9IGZyb20gJy4vZmxvd3MvZmxvd3Muc2VydmljZSc7XHJcbmltcG9ydCB7IFJhbmRvbVNlcnZpY2UgfSBmcm9tICcuL2Zsb3dzL3JhbmRvbS9yYW5kb20uc2VydmljZSc7XHJcbmltcG9ydCB7IFNpZ25pbktleURhdGFTZXJ2aWNlIH0gZnJvbSAnLi9mbG93cy9zaWduaW4ta2V5LWRhdGEuc2VydmljZSc7XHJcbmltcG9ydCB7IENoZWNrU2Vzc2lvblNlcnZpY2UgfSBmcm9tICcuL2lmcmFtZS9jaGVjay1zZXNzaW9uLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBJRnJhbWVTZXJ2aWNlIH0gZnJvbSAnLi9pZnJhbWUvZXhpc3RpbmctaWZyYW1lLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBTaWxlbnRSZW5ld1NlcnZpY2UgfSBmcm9tICcuL2lmcmFtZS9zaWxlbnQtcmVuZXcuc2VydmljZSc7XHJcbmltcG9ydCB7IFRhYnNTeW5jaHJvbml6YXRpb25TZXJ2aWNlIH0gZnJvbSAnLi9pZnJhbWUvdGFicy1zeW5jaHJvbml6YXRpb24uc2VydmljZSc7XHJcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBMb2dpblNlcnZpY2UgfSBmcm9tICcuL2xvZ2luL2xvZ2luLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBMb2dvZmZSZXZvY2F0aW9uU2VydmljZSB9IGZyb20gJy4vbG9nb2ZmUmV2b2tlL2xvZ29mZi1yZXZvY2F0aW9uLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBPaWRjU2VjdXJpdHlTZXJ2aWNlIH0gZnJvbSAnLi9vaWRjLnNlY3VyaXR5LnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBQdWJsaWNFdmVudHNTZXJ2aWNlIH0gZnJvbSAnLi9wdWJsaWMtZXZlbnRzL3B1YmxpYy1ldmVudHMuc2VydmljZSc7XHJcbmltcG9ydCB7IEFic3RyYWN0U2VjdXJpdHlTdG9yYWdlIH0gZnJvbSAnLi9zdG9yYWdlL2Fic3RyYWN0LXNlY3VyaXR5LXN0b3JhZ2UnO1xyXG5pbXBvcnQgeyBCcm93c2VyU3RvcmFnZVNlcnZpY2UgfSBmcm9tICcuL3N0b3JhZ2UvYnJvd3Nlci1zdG9yYWdlLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBTdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlIH0gZnJvbSAnLi9zdG9yYWdlL3N0b3JhZ2UtcGVyc2lzdGFuY2Uuc2VydmljZSc7XHJcbmltcG9ydCB7IFVzZXJTZXJ2aWNlIH0gZnJvbSAnLi91c2VyRGF0YS91c2VyLXNlcnZpY2UnO1xyXG5pbXBvcnQgeyBFcXVhbGl0eVNlcnZpY2UgfSBmcm9tICcuL3V0aWxzL2VxdWFsaXR5L2VxdWFsaXR5LnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBGbG93SGVscGVyIH0gZnJvbSAnLi91dGlscy9mbG93SGVscGVyL2Zsb3ctaGVscGVyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBQbGF0Zm9ybVByb3ZpZGVyIH0gZnJvbSAnLi91dGlscy9wbGF0Zm9ybS1wcm92aWRlci9wbGF0Zm9ybS5wcm92aWRlcic7XHJcbmltcG9ydCB7IFRva2VuSGVscGVyU2VydmljZSB9IGZyb20gJy4vdXRpbHMvdG9rZW5IZWxwZXIvb2lkYy10b2tlbi1oZWxwZXIuc2VydmljZSc7XHJcbmltcG9ydCB7IFVybFNlcnZpY2UgfSBmcm9tICcuL3V0aWxzL3VybC91cmwuc2VydmljZSc7XHJcbmltcG9ydCB7IFN0YXRlVmFsaWRhdGlvblNlcnZpY2UgfSBmcm9tICcuL3ZhbGlkYXRpb24vc3RhdGUtdmFsaWRhdGlvbi5zZXJ2aWNlJztcclxuaW1wb3J0IHsgVG9rZW5WYWxpZGF0aW9uU2VydmljZSB9IGZyb20gJy4vdmFsaWRhdGlvbi90b2tlbi12YWxpZGF0aW9uLnNlcnZpY2UnO1xyXG5cclxuQE5nTW9kdWxlKHtcclxuICBpbXBvcnRzOiBbQ29tbW9uTW9kdWxlLCBIdHRwQ2xpZW50TW9kdWxlXSxcclxuICBkZWNsYXJhdGlvbnM6IFtdLFxyXG4gIGV4cG9ydHM6IFtdLFxyXG59KVxyXG5leHBvcnQgY2xhc3MgQXV0aE1vZHVsZSB7XHJcbiAgc3RhdGljIGZvclJvb3QodG9rZW46IFRva2VuID0ge30pIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIG5nTW9kdWxlOiBBdXRoTW9kdWxlLFxyXG4gICAgICBwcm92aWRlcnM6IFtcclxuICAgICAgICBPaWRjQ29uZmlnU2VydmljZSxcclxuICAgICAgICBQdWJsaWNFdmVudHNTZXJ2aWNlLFxyXG4gICAgICAgIEZsb3dIZWxwZXIsXHJcbiAgICAgICAgT2lkY1NlY3VyaXR5U2VydmljZSxcclxuICAgICAgICBUb2tlblZhbGlkYXRpb25TZXJ2aWNlLFxyXG4gICAgICAgIFBsYXRmb3JtUHJvdmlkZXIsXHJcbiAgICAgICAgQ2hlY2tTZXNzaW9uU2VydmljZSxcclxuICAgICAgICBGbG93c0RhdGFTZXJ2aWNlLFxyXG4gICAgICAgIEZsb3dzU2VydmljZSxcclxuICAgICAgICBTaWxlbnRSZW5ld1NlcnZpY2UsXHJcbiAgICAgICAgQ29uZmlndXJhdGlvblByb3ZpZGVyLFxyXG4gICAgICAgIExvZ29mZlJldm9jYXRpb25TZXJ2aWNlLFxyXG4gICAgICAgIFVzZXJTZXJ2aWNlLFxyXG4gICAgICAgIFJhbmRvbVNlcnZpY2UsXHJcbiAgICAgICAgSHR0cEJhc2VTZXJ2aWNlLFxyXG4gICAgICAgIFVybFNlcnZpY2UsXHJcbiAgICAgICAgQXV0aFN0YXRlU2VydmljZSxcclxuICAgICAgICBTaWduaW5LZXlEYXRhU2VydmljZSxcclxuICAgICAgICBTdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLFxyXG4gICAgICAgIFRva2VuSGVscGVyU2VydmljZSxcclxuICAgICAgICBMb2dnZXJTZXJ2aWNlLFxyXG4gICAgICAgIElGcmFtZVNlcnZpY2UsXHJcbiAgICAgICAgRXF1YWxpdHlTZXJ2aWNlLFxyXG4gICAgICAgIExvZ2luU2VydmljZSxcclxuICAgICAgICBBdXRoV2VsbEtub3duRGF0YVNlcnZpY2UsXHJcbiAgICAgICAgQXV0aFdlbGxLbm93blNlcnZpY2UsXHJcbiAgICAgICAgRGF0YVNlcnZpY2UsXHJcbiAgICAgICAgU3RhdGVWYWxpZGF0aW9uU2VydmljZSxcclxuICAgICAgICBDb25maWdWYWxpZGF0aW9uU2VydmljZSxcclxuICAgICAgICBDaGVja0F1dGhTZXJ2aWNlLFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHByb3ZpZGU6IEFic3RyYWN0U2VjdXJpdHlTdG9yYWdlLFxyXG4gICAgICAgICAgdXNlQ2xhc3M6IHRva2VuLnN0b3JhZ2UgfHwgQnJvd3NlclN0b3JhZ2VTZXJ2aWNlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgVGFic1N5bmNocm9uaXphdGlvblNlcnZpY2UsXHJcbiAgICAgIF0sXHJcbiAgICB9O1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IHR5cGUgVHlwZTxUPiA9IG5ldyAoLi4uYXJnczogYW55W10pID0+IFQ7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFRva2VuIHtcclxuICBzdG9yYWdlPzogVHlwZTxhbnk+O1xyXG59XHJcbiJdfQ==