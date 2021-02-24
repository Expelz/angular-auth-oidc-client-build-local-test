import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "./iframe/check-session.service";
import * as i2 from "./check-auth.service";
import * as i3 from "./userData/user-service";
import * as i4 from "./utils/tokenHelper/oidc-token-helper.service";
import * as i5 from "./config/config.provider";
import * as i6 from "./authState/auth-state.service";
import * as i7 from "./flows/flows-data.service";
import * as i8 from "./callback/callback.service";
import * as i9 from "./logoffRevoke/logoff-revocation.service";
import * as i10 from "./login/login.service";
import * as i11 from "./storage/storage-persistance.service";
import * as i12 from "./callback/refresh-session.service";
export class OidcSecurityService {
    constructor(checkSessionService, checkAuthService, userService, tokenHelperService, configurationProvider, authStateService, flowsDataService, callbackService, logoffRevocationService, loginService, storagePersistanceService, refreshSessionService) {
        this.checkSessionService = checkSessionService;
        this.checkAuthService = checkAuthService;
        this.userService = userService;
        this.tokenHelperService = tokenHelperService;
        this.configurationProvider = configurationProvider;
        this.authStateService = authStateService;
        this.flowsDataService = flowsDataService;
        this.callbackService = callbackService;
        this.logoffRevocationService = logoffRevocationService;
        this.loginService = loginService;
        this.storagePersistanceService = storagePersistanceService;
        this.refreshSessionService = refreshSessionService;
    }
    get configuration() {
        return {
            configuration: this.configurationProvider.openIDConfiguration,
            wellknown: this.storagePersistanceService.read('authWellKnownEndPoints'),
        };
    }
    get userData$() {
        return this.userService.userData$;
    }
    get isAuthenticated$() {
        return this.authStateService.authorized$;
    }
    get checkSessionChanged$() {
        return this.checkSessionService.checkSessionChanged$;
    }
    get stsCallback$() {
        return this.callbackService.stsCallback$;
    }
    checkAuth(url) {
        return this.checkAuthService.checkAuth(url);
    }
    checkAuthIncludingServer() {
        return this.checkAuthService.checkAuthIncludingServer();
    }
    getToken() {
        return this.authStateService.getAccessToken();
    }
    getIdToken() {
        return this.authStateService.getIdToken();
    }
    getRefreshToken() {
        return this.authStateService.getRefreshToken();
    }
    getPayloadFromIdToken(encode = false) {
        const token = this.getIdToken();
        return this.tokenHelperService.getPayloadFromToken(token, encode);
    }
    setState(state) {
        this.flowsDataService.setAuthStateControl(state);
    }
    getState() {
        return this.flowsDataService.getAuthStateControl();
    }
    // Code Flow with PCKE or Implicit Flow
    authorize(authOptions) {
        if (authOptions === null || authOptions === void 0 ? void 0 : authOptions.customParams) {
            this.storagePersistanceService.write('storageCustomRequestParams', authOptions.customParams);
        }
        this.loginService.login(authOptions);
    }
    authorizeWithPopUp(authOptions) {
        if (authOptions === null || authOptions === void 0 ? void 0 : authOptions.customParams) {
            this.storagePersistanceService.write('storageCustomRequestParams', authOptions.customParams);
        }
        return this.loginService.loginWithPopUp(authOptions);
    }
    forceRefreshSession(customParams) {
        if (customParams) {
            this.storagePersistanceService.write('storageCustomRequestParams', customParams);
        }
        return this.refreshSessionService.forceRefreshSession(customParams);
    }
    // The refresh token and and the access token are revoked on the server. If the refresh token does not exist
    // only the access token is revoked. Then the logout run.
    logoffAndRevokeTokens(urlHandler) {
        return this.logoffRevocationService.logoffAndRevokeTokens(urlHandler);
    }
    // Logs out on the server and the local client.
    // If the server state has changed, checksession, then only a local logout.
    logoff(urlHandler) {
        return this.logoffRevocationService.logoff(urlHandler);
    }
    logoffLocal() {
        return this.logoffRevocationService.logoffLocal();
    }
    // https://tools.ietf.org/html/rfc7009
    // revokes an access token on the STS. This is only required in the code flow with refresh tokens.
    // If no token is provided, then the token from the storage is revoked. You can pass any token to revoke.
    // This makes it possible to manage your own tokens.
    revokeAccessToken(accessToken) {
        return this.logoffRevocationService.revokeAccessToken(accessToken);
    }
    // https://tools.ietf.org/html/rfc7009
    // revokes a refresh token on the STS. This is only required in the code flow with refresh tokens.
    // If no token is provided, then the token from the storage is revoked. You can pass any token to revoke.
    // This makes it possible to manage your own tokens.
    revokeRefreshToken(refreshToken) {
        return this.logoffRevocationService.revokeRefreshToken(refreshToken);
    }
    getEndSessionUrl() {
        return this.logoffRevocationService.getEndSessionUrl();
    }
}
OidcSecurityService.ɵfac = function OidcSecurityService_Factory(t) { return new (t || OidcSecurityService)(i0.ɵɵinject(i1.CheckSessionService), i0.ɵɵinject(i2.CheckAuthService), i0.ɵɵinject(i3.UserService), i0.ɵɵinject(i4.TokenHelperService), i0.ɵɵinject(i5.ConfigurationProvider), i0.ɵɵinject(i6.AuthStateService), i0.ɵɵinject(i7.FlowsDataService), i0.ɵɵinject(i8.CallbackService), i0.ɵɵinject(i9.LogoffRevocationService), i0.ɵɵinject(i10.LoginService), i0.ɵɵinject(i11.StoragePersistanceService), i0.ɵɵinject(i12.RefreshSessionService)); };
OidcSecurityService.ɵprov = i0.ɵɵdefineInjectable({ token: OidcSecurityService, factory: OidcSecurityService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(OidcSecurityService, [{
        type: Injectable
    }], function () { return [{ type: i1.CheckSessionService }, { type: i2.CheckAuthService }, { type: i3.UserService }, { type: i4.TokenHelperService }, { type: i5.ConfigurationProvider }, { type: i6.AuthStateService }, { type: i7.FlowsDataService }, { type: i8.CallbackService }, { type: i9.LogoffRevocationService }, { type: i10.LoginService }, { type: i11.StoragePersistanceService }, { type: i12.RefreshSessionService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2lkYy5zZWN1cml0eS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvIiwic291cmNlcyI6WyJsaWIvb2lkYy5zZWN1cml0eS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7Ozs7Ozs7Ozs7Ozs7O0FBa0IzQyxNQUFNLE9BQU8sbUJBQW1CO0lBd0I5QixZQUNVLG1CQUF3QyxFQUN4QyxnQkFBa0MsRUFDbEMsV0FBd0IsRUFDeEIsa0JBQXNDLEVBQ3RDLHFCQUE0QyxFQUM1QyxnQkFBa0MsRUFDbEMsZ0JBQWtDLEVBQ2xDLGVBQWdDLEVBQ2hDLHVCQUFnRCxFQUNoRCxZQUEwQixFQUMxQix5QkFBb0QsRUFDcEQscUJBQTRDO1FBWDVDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7UUFDeEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUN4Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1FBQ3RDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7UUFDNUMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtRQUNoQyw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQXlCO1FBQ2hELGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBQzFCLDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBMkI7UUFDcEQsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtJQUNuRCxDQUFDO0lBcENKLElBQUksYUFBYTtRQUNmLE9BQU87WUFDTCxhQUFhLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLG1CQUFtQjtZQUM3RCxTQUFTLEVBQUUsSUFBSSxDQUFDLHlCQUF5QixDQUFD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QWlDO1FBQ3RDLE9BQU8sSUFBSSxDQUFDLHVCQUF1QixDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRUQsV0FBVztRQUNULE9BQU8sSUFBSSxDQUFDLHVCQUF1QixDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3BELENBQUM7SUFFRCxzQ0FBc0M7SUFDdEMsa0dBQWtHO0lBQ2xHLHlHQUF5RztJQUN6RyxvREFBb0Q7SUFDcEQsaUJBQWlCLENBQUMsV0FBaUI7UUFDakMsT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDckUsQ0FBQztJQUVELHNDQUFzQztJQUN0QyxrR0FBa0c7SUFDbEcseUdBQXlHO0lBQ3pHLG9EQUFvRDtJQUNwRCxrQkFBa0IsQ0FBQyxZQUFrQjtRQUNuQyxPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBRUQsZ0JBQWdCO1FBQ2QsT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUN6RCxDQUFDOztzRkFuSVUsbUJBQW1COzJEQUFuQixtQkFBbUIsV0FBbkIsbUJBQW1CO2tEQUFuQixtQkFBbUI7Y0FEL0IsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBBdXRoU3RhdGVTZXJ2aWNlIH0gZnJvbSAnLi9hdXRoU3RhdGUvYXV0aC1zdGF0ZS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgQ2FsbGJhY2tTZXJ2aWNlIH0gZnJvbSAnLi9jYWxsYmFjay9jYWxsYmFjay5zZXJ2aWNlJztcclxuaW1wb3J0IHsgUmVmcmVzaFNlc3Npb25TZXJ2aWNlIH0gZnJvbSAnLi9jYWxsYmFjay9yZWZyZXNoLXNlc3Npb24uc2VydmljZSc7XHJcbmltcG9ydCB7IENoZWNrQXV0aFNlcnZpY2UgfSBmcm9tICcuL2NoZWNrLWF1dGguc2VydmljZSc7XHJcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25Qcm92aWRlciB9IGZyb20gJy4vY29uZmlnL2NvbmZpZy5wcm92aWRlcic7XHJcbmltcG9ydCB7IFB1YmxpY0NvbmZpZ3VyYXRpb24gfSBmcm9tICcuL2NvbmZpZy9wdWJsaWMtY29uZmlndXJhdGlvbic7XHJcbmltcG9ydCB7IEZsb3dzRGF0YVNlcnZpY2UgfSBmcm9tICcuL2Zsb3dzL2Zsb3dzLWRhdGEuc2VydmljZSc7XHJcbmltcG9ydCB7IENoZWNrU2Vzc2lvblNlcnZpY2UgfSBmcm9tICcuL2lmcmFtZS9jaGVjay1zZXNzaW9uLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBBdXRoT3B0aW9ucyB9IGZyb20gJy4vbG9naW4vYXV0aC1vcHRpb25zJztcclxuaW1wb3J0IHsgTG9naW5TZXJ2aWNlIH0gZnJvbSAnLi9sb2dpbi9sb2dpbi5zZXJ2aWNlJztcclxuaW1wb3J0IHsgTG9nb2ZmUmV2b2NhdGlvblNlcnZpY2UgfSBmcm9tICcuL2xvZ29mZlJldm9rZS9sb2dvZmYtcmV2b2NhdGlvbi5zZXJ2aWNlJztcclxuaW1wb3J0IHsgU3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZSB9IGZyb20gJy4vc3RvcmFnZS9zdG9yYWdlLXBlcnNpc3RhbmNlLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBVc2VyU2VydmljZSB9IGZyb20gJy4vdXNlckRhdGEvdXNlci1zZXJ2aWNlJztcclxuaW1wb3J0IHsgVG9rZW5IZWxwZXJTZXJ2aWNlIH0gZnJvbSAnLi91dGlscy90b2tlbkhlbHBlci9vaWRjLXRva2VuLWhlbHBlci5zZXJ2aWNlJztcclxuXHJcbkBJbmplY3RhYmxlKClcclxuZXhwb3J0IGNsYXNzIE9pZGNTZWN1cml0eVNlcnZpY2Uge1xyXG4gIGdldCBjb25maWd1cmF0aW9uKCk6IFB1YmxpY0NvbmZpZ3VyYXRpb24ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29uZmlndXJhdGlvbjogdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbixcclxuICAgICAgd2VsbGtub3duOiB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZCgnYXV0aFdlbGxLbm93bkVuZFBvaW50cycpLFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGdldCB1c2VyRGF0YSQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy51c2VyU2VydmljZS51c2VyRGF0YSQ7XHJcbiAgfVxyXG5cclxuICBnZXQgaXNBdXRoZW50aWNhdGVkJCgpIHtcclxuICAgIHJldHVybiB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UuYXV0aG9yaXplZCQ7XHJcbiAgfVxyXG5cclxuICBnZXQgY2hlY2tTZXNzaW9uQ2hhbmdlZCQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5jaGVja1Nlc3Npb25TZXJ2aWNlLmNoZWNrU2Vzc2lvbkNoYW5nZWQkO1xyXG4gIH1cclxuXHJcbiAgZ2V0IHN0c0NhbGxiYWNrJCgpIHtcclxuICAgIHJldHVybiB0aGlzLmNhbGxiYWNrU2VydmljZS5zdHNDYWxsYmFjayQ7XHJcbiAgfVxyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgY2hlY2tTZXNzaW9uU2VydmljZTogQ2hlY2tTZXNzaW9uU2VydmljZSxcclxuICAgIHByaXZhdGUgY2hlY2tBdXRoU2VydmljZTogQ2hlY2tBdXRoU2VydmljZSxcclxuICAgIHByaXZhdGUgdXNlclNlcnZpY2U6IFVzZXJTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSB0b2tlbkhlbHBlclNlcnZpY2U6IFRva2VuSGVscGVyU2VydmljZSxcclxuICAgIHByaXZhdGUgY29uZmlndXJhdGlvblByb3ZpZGVyOiBDb25maWd1cmF0aW9uUHJvdmlkZXIsXHJcbiAgICBwcml2YXRlIGF1dGhTdGF0ZVNlcnZpY2U6IEF1dGhTdGF0ZVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGZsb3dzRGF0YVNlcnZpY2U6IEZsb3dzRGF0YVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGNhbGxiYWNrU2VydmljZTogQ2FsbGJhY2tTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBsb2dvZmZSZXZvY2F0aW9uU2VydmljZTogTG9nb2ZmUmV2b2NhdGlvblNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGxvZ2luU2VydmljZTogTG9naW5TZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBzdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlOiBTdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSByZWZyZXNoU2Vzc2lvblNlcnZpY2U6IFJlZnJlc2hTZXNzaW9uU2VydmljZVxyXG4gICkge31cclxuXHJcbiAgY2hlY2tBdXRoKHVybD86IHN0cmluZyk6IE9ic2VydmFibGU8Ym9vbGVhbj4ge1xyXG4gICAgcmV0dXJuIHRoaXMuY2hlY2tBdXRoU2VydmljZS5jaGVja0F1dGgodXJsKTtcclxuICB9XHJcblxyXG4gIGNoZWNrQXV0aEluY2x1ZGluZ1NlcnZlcigpOiBPYnNlcnZhYmxlPGJvb2xlYW4+IHtcclxuICAgIHJldHVybiB0aGlzLmNoZWNrQXV0aFNlcnZpY2UuY2hlY2tBdXRoSW5jbHVkaW5nU2VydmVyKCk7XHJcbiAgfVxyXG5cclxuICBnZXRUb2tlbigpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMuYXV0aFN0YXRlU2VydmljZS5nZXRBY2Nlc3NUb2tlbigpO1xyXG4gIH1cclxuXHJcbiAgZ2V0SWRUb2tlbigpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMuYXV0aFN0YXRlU2VydmljZS5nZXRJZFRva2VuKCk7XHJcbiAgfVxyXG5cclxuICBnZXRSZWZyZXNoVG9rZW4oKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UuZ2V0UmVmcmVzaFRva2VuKCk7XHJcbiAgfVxyXG5cclxuICBnZXRQYXlsb2FkRnJvbUlkVG9rZW4oZW5jb2RlID0gZmFsc2UpOiBhbnkge1xyXG4gICAgY29uc3QgdG9rZW4gPSB0aGlzLmdldElkVG9rZW4oKTtcclxuICAgIHJldHVybiB0aGlzLnRva2VuSGVscGVyU2VydmljZS5nZXRQYXlsb2FkRnJvbVRva2VuKHRva2VuLCBlbmNvZGUpO1xyXG4gIH1cclxuXHJcbiAgc2V0U3RhdGUoc3RhdGU6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgdGhpcy5mbG93c0RhdGFTZXJ2aWNlLnNldEF1dGhTdGF0ZUNvbnRyb2woc3RhdGUpO1xyXG4gIH1cclxuXHJcbiAgZ2V0U3RhdGUoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuZ2V0QXV0aFN0YXRlQ29udHJvbCgpO1xyXG4gIH1cclxuXHJcbiAgLy8gQ29kZSBGbG93IHdpdGggUENLRSBvciBJbXBsaWNpdCBGbG93XHJcbiAgYXV0aG9yaXplKGF1dGhPcHRpb25zPzogQXV0aE9wdGlvbnMpIHtcclxuICAgIGlmIChhdXRoT3B0aW9ucz8uY3VzdG9tUGFyYW1zKSB7XHJcbiAgICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZSgnc3RvcmFnZUN1c3RvbVJlcXVlc3RQYXJhbXMnLCBhdXRoT3B0aW9ucy5jdXN0b21QYXJhbXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubG9naW5TZXJ2aWNlLmxvZ2luKGF1dGhPcHRpb25zKTtcclxuICB9XHJcblxyXG4gIGF1dGhvcml6ZVdpdGhQb3BVcChhdXRoT3B0aW9ucz86IEF1dGhPcHRpb25zKSB7XHJcbiAgICBpZiAoYXV0aE9wdGlvbnM/LmN1c3RvbVBhcmFtcykge1xyXG4gICAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2Uud3JpdGUoJ3N0b3JhZ2VDdXN0b21SZXF1ZXN0UGFyYW1zJywgYXV0aE9wdGlvbnMuY3VzdG9tUGFyYW1zKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5sb2dpblNlcnZpY2UubG9naW5XaXRoUG9wVXAoYXV0aE9wdGlvbnMpO1xyXG4gIH1cclxuXHJcbiAgZm9yY2VSZWZyZXNoU2Vzc2lvbihjdXN0b21QYXJhbXM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfSkge1xyXG4gICAgaWYgKGN1c3RvbVBhcmFtcykge1xyXG4gICAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2Uud3JpdGUoJ3N0b3JhZ2VDdXN0b21SZXF1ZXN0UGFyYW1zJywgY3VzdG9tUGFyYW1zKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5yZWZyZXNoU2Vzc2lvblNlcnZpY2UuZm9yY2VSZWZyZXNoU2Vzc2lvbihjdXN0b21QYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLy8gVGhlIHJlZnJlc2ggdG9rZW4gYW5kIGFuZCB0aGUgYWNjZXNzIHRva2VuIGFyZSByZXZva2VkIG9uIHRoZSBzZXJ2ZXIuIElmIHRoZSByZWZyZXNoIHRva2VuIGRvZXMgbm90IGV4aXN0XHJcbiAgLy8gb25seSB0aGUgYWNjZXNzIHRva2VuIGlzIHJldm9rZWQuIFRoZW4gdGhlIGxvZ291dCBydW4uXHJcbiAgbG9nb2ZmQW5kUmV2b2tlVG9rZW5zKHVybEhhbmRsZXI/OiAodXJsOiBzdHJpbmcpID0+IGFueSkge1xyXG4gICAgcmV0dXJuIHRoaXMubG9nb2ZmUmV2b2NhdGlvblNlcnZpY2UubG9nb2ZmQW5kUmV2b2tlVG9rZW5zKHVybEhhbmRsZXIpO1xyXG4gIH1cclxuXHJcbiAgLy8gTG9ncyBvdXQgb24gdGhlIHNlcnZlciBhbmQgdGhlIGxvY2FsIGNsaWVudC5cclxuICAvLyBJZiB0aGUgc2VydmVyIHN0YXRlIGhhcyBjaGFuZ2VkLCBjaGVja3Nlc3Npb24sIHRoZW4gb25seSBhIGxvY2FsIGxvZ291dC5cclxuICBsb2dvZmYodXJsSGFuZGxlcj86ICh1cmw6IHN0cmluZykgPT4gYW55KSB7XHJcbiAgICByZXR1cm4gdGhpcy5sb2dvZmZSZXZvY2F0aW9uU2VydmljZS5sb2dvZmYodXJsSGFuZGxlcik7XHJcbiAgfVxyXG5cclxuICBsb2dvZmZMb2NhbCgpIHtcclxuICAgIHJldHVybiB0aGlzLmxvZ29mZlJldm9jYXRpb25TZXJ2aWNlLmxvZ29mZkxvY2FsKCk7XHJcbiAgfVxyXG5cclxuICAvLyBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjNzAwOVxyXG4gIC8vIHJldm9rZXMgYW4gYWNjZXNzIHRva2VuIG9uIHRoZSBTVFMuIFRoaXMgaXMgb25seSByZXF1aXJlZCBpbiB0aGUgY29kZSBmbG93IHdpdGggcmVmcmVzaCB0b2tlbnMuXHJcbiAgLy8gSWYgbm8gdG9rZW4gaXMgcHJvdmlkZWQsIHRoZW4gdGhlIHRva2VuIGZyb20gdGhlIHN0b3JhZ2UgaXMgcmV2b2tlZC4gWW91IGNhbiBwYXNzIGFueSB0b2tlbiB0byByZXZva2UuXHJcbiAgLy8gVGhpcyBtYWtlcyBpdCBwb3NzaWJsZSB0byBtYW5hZ2UgeW91ciBvd24gdG9rZW5zLlxyXG4gIHJldm9rZUFjY2Vzc1Rva2VuKGFjY2Vzc1Rva2VuPzogYW55KSB7XHJcbiAgICByZXR1cm4gdGhpcy5sb2dvZmZSZXZvY2F0aW9uU2VydmljZS5yZXZva2VBY2Nlc3NUb2tlbihhY2Nlc3NUb2tlbik7XHJcbiAgfVxyXG5cclxuICAvLyBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjNzAwOVxyXG4gIC8vIHJldm9rZXMgYSByZWZyZXNoIHRva2VuIG9uIHRoZSBTVFMuIFRoaXMgaXMgb25seSByZXF1aXJlZCBpbiB0aGUgY29kZSBmbG93IHdpdGggcmVmcmVzaCB0b2tlbnMuXHJcbiAgLy8gSWYgbm8gdG9rZW4gaXMgcHJvdmlkZWQsIHRoZW4gdGhlIHRva2VuIGZyb20gdGhlIHN0b3JhZ2UgaXMgcmV2b2tlZC4gWW91IGNhbiBwYXNzIGFueSB0b2tlbiB0byByZXZva2UuXHJcbiAgLy8gVGhpcyBtYWtlcyBpdCBwb3NzaWJsZSB0byBtYW5hZ2UgeW91ciBvd24gdG9rZW5zLlxyXG4gIHJldm9rZVJlZnJlc2hUb2tlbihyZWZyZXNoVG9rZW4/OiBhbnkpIHtcclxuICAgIHJldHVybiB0aGlzLmxvZ29mZlJldm9jYXRpb25TZXJ2aWNlLnJldm9rZVJlZnJlc2hUb2tlbihyZWZyZXNoVG9rZW4pO1xyXG4gIH1cclxuXHJcbiAgZ2V0RW5kU2Vzc2lvblVybCgpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLmxvZ29mZlJldm9jYXRpb25TZXJ2aWNlLmdldEVuZFNlc3Npb25VcmwoKTtcclxuICB9XHJcbn1cclxuIl19