import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "../api/data.service";
import * as i2 from "../storage/storage-persistance.service";
import * as i3 from "../logging/logger.service";
import * as i4 from "../utils/url/url.service";
import * as i5 from "../iframe/check-session.service";
import * as i6 from "../flows/flows.service";
import * as i7 from "../utils/redirect/redirect.service";
import * as i8 from "../iframe/tabs-synchronization.service";
export class LogoffRevocationService {
    constructor(dataService, storagePersistanceService, loggerService, urlService, checkSessionService, flowsService, redirectService, tabsSynchronizationService) {
        this.dataService = dataService;
        this.storagePersistanceService = storagePersistanceService;
        this.loggerService = loggerService;
        this.urlService = urlService;
        this.checkSessionService = checkSessionService;
        this.flowsService = flowsService;
        this.redirectService = redirectService;
        this.tabsSynchronizationService = tabsSynchronizationService;
    }
    // Logs out on the server and the local client.
    // If the server state has changed, checksession, then only a local logout.
    logoff(urlHandler) {
        this.loggerService.logDebug('logoff, remove auth ');
        this.tabsSynchronizationService.closeTabSynchronization();
        const endSessionUrl = this.getEndSessionUrl();
        this.flowsService.resetAuthorizationData();
        if (!endSessionUrl) {
            this.loggerService.logDebug('only local login cleaned up, no end_session_endpoint');
            return;
        }
        if (this.checkSessionService.serverStateChanged()) {
            this.loggerService.logDebug('only local login cleaned up, server session has changed');
        }
        else if (urlHandler) {
            urlHandler(endSessionUrl);
        }
        else {
            this.redirectService.redirectTo(endSessionUrl);
        }
    }
    logoffLocal() {
        this.tabsSynchronizationService.closeTabSynchronization();
        this.flowsService.resetAuthorizationData();
    }
    // The refresh token and and the access token are revoked on the server. If the refresh token does not exist
    // only the access token is revoked. Then the logout run.
    logoffAndRevokeTokens(urlHandler) {
        var _a;
        if (!((_a = this.storagePersistanceService.read('authWellKnownEndPoints')) === null || _a === void 0 ? void 0 : _a.revocationEndpoint)) {
            this.loggerService.logDebug('revocation endpoint not supported');
            this.logoff(urlHandler);
        }
        if (this.storagePersistanceService.getRefreshToken()) {
            return this.revokeRefreshToken().pipe(switchMap((result) => this.revokeAccessToken(result)), catchError((error) => {
                const errorMessage = `revoke token failed`;
                this.loggerService.logError(errorMessage, error);
                return throwError(errorMessage);
            }), tap(() => this.logoff(urlHandler)));
        }
        else {
            return this.revokeAccessToken().pipe(catchError((error) => {
                const errorMessage = `revoke access token failed`;
                this.loggerService.logError(errorMessage, error);
                return throwError(errorMessage);
            }), tap(() => this.logoff(urlHandler)));
        }
    }
    // https://tools.ietf.org/html/rfc7009
    // revokes an access token on the STS. If no token is provided, then the token from
    // the storage is revoked. You can pass any token to revoke. This makes it possible to
    // manage your own tokens. The is a public API.
    revokeAccessToken(accessToken) {
        const accessTok = accessToken || this.storagePersistanceService.getAccessToken();
        const body = this.urlService.createRevocationEndpointBodyAccessToken(accessTok);
        const url = this.urlService.getRevocationEndpointUrl();
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
        return this.dataService.post(url, body, headers).pipe(switchMap((response) => {
            this.loggerService.logDebug('revocation endpoint post response: ', response);
            return of(response);
        }), catchError((error) => {
            const errorMessage = `Revocation request failed`;
            this.loggerService.logError(errorMessage, error);
            return throwError(errorMessage);
        }));
    }
    // https://tools.ietf.org/html/rfc7009
    // revokes an refresh token on the STS. This is only required in the code flow with refresh tokens.
    // If no token is provided, then the token from the storage is revoked. You can pass any token to revoke.
    // This makes it possible to manage your own tokens.
    revokeRefreshToken(refreshToken) {
        const refreshTok = refreshToken || this.storagePersistanceService.getRefreshToken();
        const body = this.urlService.createRevocationEndpointBodyRefreshToken(refreshTok);
        const url = this.urlService.getRevocationEndpointUrl();
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
        return this.dataService.post(url, body, headers).pipe(switchMap((response) => {
            this.loggerService.logDebug('revocation endpoint post response: ', response);
            return of(response);
        }), catchError((error) => {
            const errorMessage = `Revocation request failed`;
            this.loggerService.logError(errorMessage, error);
            return throwError(errorMessage);
        }));
    }
    getEndSessionUrl() {
        const idToken = this.storagePersistanceService.getIdToken();
        return this.urlService.createEndSessionUrl(idToken);
    }
}
LogoffRevocationService.ɵfac = function LogoffRevocationService_Factory(t) { return new (t || LogoffRevocationService)(i0.ɵɵinject(i1.DataService), i0.ɵɵinject(i2.StoragePersistanceService), i0.ɵɵinject(i3.LoggerService), i0.ɵɵinject(i4.UrlService), i0.ɵɵinject(i5.CheckSessionService), i0.ɵɵinject(i6.FlowsService), i0.ɵɵinject(i7.RedirectService), i0.ɵɵinject(i8.TabsSynchronizationService)); };
LogoffRevocationService.ɵprov = i0.ɵɵdefineInjectable({ token: LogoffRevocationService, factory: LogoffRevocationService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(LogoffRevocationService, [{
        type: Injectable
    }], function () { return [{ type: i1.DataService }, { type: i2.StoragePersistanceService }, { type: i3.LoggerService }, { type: i4.UrlService }, { type: i5.CheckSessionService }, { type: i6.FlowsService }, { type: i7.RedirectService }, { type: i8.TabsSynchronizationService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nb2ZmLXJldm9jYXRpb24uc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjLyIsInNvdXJjZXMiOlsibGliL2xvZ29mZlJldm9rZS9sb2dvZmYtcmV2b2NhdGlvbi5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNuRCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxNQUFNLGdCQUFnQixDQUFDOzs7Ozs7Ozs7O0FBVzVELE1BQU0sT0FBTyx1QkFBdUI7SUFDbEMsWUFDVSxXQUF3QixFQUN4Qix5QkFBb0QsRUFDcEQsYUFBNEIsRUFDNUIsVUFBc0IsRUFDdEIsbUJBQXdDLEVBQ3hDLFlBQTBCLEVBQzFCLGVBQWdDLEVBQ2hDLDBCQUFzRDtRQVB0RCxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUN4Qiw4QkFBeUIsR0FBekIseUJBQXlCLENBQTJCO1FBQ3BELGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLGVBQVUsR0FBVixVQUFVLENBQVk7UUFDdEIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtRQUN4QyxpQkFBWSxHQUFaLFlBQVksQ0FBYztRQUMxQixvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUFDaEMsK0JBQTBCLEdBQTFCLDBCQUEwQixDQUE0QjtJQUM3RCxDQUFDO0lBRUosK0NBQStDO0lBQy9DLDJFQUEyRTtJQUMzRSxNQUFNLENBQUMsVUFBaUM7UUFDdEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsMEJBQTBCLENBQUMs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LG1DQUFtQyxDQUFDLENBQUM7UUFFM0UsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FDbkQsU0FBUyxDQUFDLENBQUMsUUFBYSxFQUFFLEVBQUU7WUFDMUIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMscUNBQXFDLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDN0UsT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdEIsQ0FBQyxDQUFDLEVBQ0YsVUFBVSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDbkIsTUFBTSxZQUFZLEdBQUcsMkJBQTJCLENBQUM7WUFDakQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2pELE9BQU8sVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2xDLENBQUMsQ0FBQyxDQUNILENBQUM7SUFDSixDQUFDO0lBRUQsZ0JBQWdCO1FBQ2QsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQzVELE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN0RCxDQUFDOzs4RkExSFUsdUJBQXVCOytEQUF2Qix1QkFBdUIsV0FBdkIsdUJBQXVCO2tEQUF2Qix1QkFBdUI7Y0FEbkMsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEh0dHBIZWFkZXJzIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xyXG5pbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IG9mLCB0aHJvd0Vycm9yIH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IGNhdGNoRXJyb3IsIHN3aXRjaE1hcCwgdGFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQgeyBEYXRhU2VydmljZSB9IGZyb20gJy4uL2FwaS9kYXRhLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBGbG93c1NlcnZpY2UgfSBmcm9tICcuLi9mbG93cy9mbG93cy5zZXJ2aWNlJztcclxuaW1wb3J0IHsgQ2hlY2tTZXNzaW9uU2VydmljZSB9IGZyb20gJy4uL2lmcmFtZS9jaGVjay1zZXNzaW9uLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBUYWJzU3luY2hyb25pemF0aW9uU2VydmljZSB9IGZyb20gJy4uL2lmcmFtZS90YWJzLXN5bmNocm9uaXphdGlvbi5zZXJ2aWNlJztcclxuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBTdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlIH0gZnJvbSAnLi4vc3RvcmFnZS9zdG9yYWdlLXBlcnNpc3RhbmNlLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBSZWRpcmVjdFNlcnZpY2UgfSBmcm9tICcuLi91dGlscy9yZWRpcmVjdC9yZWRpcmVjdC5zZXJ2aWNlJztcclxuaW1wb3J0IHsgVXJsU2VydmljZSB9IGZyb20gJy4uL3V0aWxzL3VybC91cmwuc2VydmljZSc7XHJcblxyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBMb2dvZmZSZXZvY2F0aW9uU2VydmljZSB7XHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIGRhdGFTZXJ2aWNlOiBEYXRhU2VydmljZSxcclxuICAgIHByaXZhdGUgc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZTogU3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZSxcclxuICAgIHByaXZhdGUgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZSxcclxuICAgIHByaXZhdGUgdXJsU2VydmljZTogVXJsU2VydmljZSxcclxuICAgIHByaXZhdGUgY2hlY2tTZXNzaW9uU2VydmljZTogQ2hlY2tTZXNzaW9uU2VydmljZSxcclxuICAgIHByaXZhdGUgZmxvd3NTZXJ2aWNlOiBGbG93c1NlcnZpY2UsXHJcbiAgICBwcml2YXRlIHJlZGlyZWN0U2VydmljZTogUmVkaXJlY3RTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSB0YWJzU3luY2hyb25pemF0aW9uU2VydmljZTogVGFic1N5bmNocm9uaXphdGlvblNlcnZpY2VcclxuICApIHt9XHJcblxyXG4gIC8vIExvZ3Mgb3V0IG9uIHRoZSBzZXJ2ZXIgYW5kIHRoZSBsb2NhbCBjbGllbnQuXHJcbiAgLy8gSWYgdGhlIHNlcnZlciBzdGF0ZSBoYXMgY2hhbmdlZCwgY2hlY2tzZXNzaW9uLCB0aGVuIG9ubHkgYSBsb2NhbCBsb2dvdXQuXHJcbiAgbG9nb2ZmKHVybEhhbmRsZXI/OiAodXJsOiBzdHJpbmcpID0+IGFueSkge1xyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdsb2dvZmYsIHJlbW92ZSBhdXRoICcpO1xyXG4gICAgdGhpcy50YWJzU3luY2hyb25pemF0aW9uU2VydmljZS5jbG9zZVRhYlN5bmNocm9uaXphdGlvbigpO1xyXG4gICAgY29uc3QgZW5kU2Vzc2lvblVybCA9IHRoaXMuZ2V0RW5kU2Vzc2lvblVybCgpO1xyXG4gICAgdGhpcy5mbG93c1NlcnZpY2UucmVzZXRBdXRob3JpemF0aW9uRGF0YSgpO1xyXG5cclxuICAgIGlmICghZW5kU2Vzc2lvblVybCkge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ29ubHkgbG9jYWwgbG9naW4gY2xlYW5lZCB1cCwgbm8gZW5kX3Nlc3Npb25fZW5kcG9pbnQnKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmNoZWNrU2Vzc2lvblNlcnZpY2Uuc2VydmVyU3RhdGVDaGFuZ2VkKCkpIHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdvbmx5IGxvY2FsIGxvZ2luIGNsZWFuZWQgdXAsIHNlcnZlciBzZXNzaW9uIGhhcyBjaGFuZ2VkJyk7XHJcbiAgICB9IGVsc2UgaWYgKHVybEhhbmRsZXIpIHtcclxuICAgICAgdXJsSGFuZGxlcihlbmRTZXNzaW9uVXJsKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMucmVkaXJlY3RTZXJ2aWNlLnJlZGlyZWN0VG8oZW5kU2Vzc2lvblVybCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBsb2dvZmZMb2NhbCgpIHtcclxuICAgIHRoaXMudGFic1N5bmNocm9uaXphdGlvblNlcnZpY2UuY2xvc2VUYWJTeW5jaHJvbml6YXRpb24oKTtcclxuICAgIHRoaXMuZmxvd3NTZXJ2aWNlLnJlc2V0QXV0aG9yaXphdGlvbkRhdGEoKTtcclxuICB9XHJcblxyXG4gIC8vIFRoZSByZWZyZXNoIHRva2VuIGFuZCBhbmQgdGhlIGFjY2VzcyB0b2tlbiBhcmUgcmV2b2tlZCBvbiB0aGUgc2VydmVyLiBJZiB0aGUgcmVmcmVzaCB0b2tlbiBkb2VzIG5vdCBleGlzdFxyXG4gIC8vIG9ubHkgdGhlIGFjY2VzcyB0b2tlbiBpcyByZXZva2VkLiBUaGVuIHRoZSBsb2dvdXQgcnVuLlxyXG4gIGxvZ29mZkFuZFJldm9rZVRva2Vucyh1cmxIYW5kbGVyPzogKHVybDogc3RyaW5nKSA9PiBhbnkpIHtcclxuICAgIGlmICghdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQoJ2F1dGhXZWxsS25vd25FbmRQb2ludHMnKT8ucmV2b2NhdGlvbkVuZHBvaW50KSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygncmV2b2NhdGlvbiBlbmRwb2ludCBub3Qgc3VwcG9ydGVkJyk7XHJcbiAgICAgIHRoaXMubG9nb2ZmKHVybEhhbmRsZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UuZ2V0UmVmcmVzaFRva2VuKCkpIHtcclxuICAgICAgcmV0dXJuIHRoaXMucmV2b2tlUmVmcmVzaFRva2VuKCkucGlwZShcclxuICAgICAgICBzd2l0Y2hNYXAoKHJlc3VsdCkgPT4gdGhpcy5yZXZva2VBY2Nlc3NUb2tlbihyZXN1bHQpKSxcclxuICAgICAgICBjYXRjaEVycm9yKChlcnJvcikgPT4ge1xyXG4gICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYHJldm9rZSB0b2tlbiBmYWlsZWRgO1xyXG4gICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGVycm9yTWVzc2FnZSwgZXJyb3IpO1xyXG4gICAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoZXJyb3JNZXNzYWdlKTtcclxuICAgICAgICB9KSxcclxuICAgICAgICB0YXAoKCkgPT4gdGhpcy5sb2dvZmYodXJsSGFuZGxlcikpXHJcbiAgICAgICk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5yZXZva2VBY2Nlc3NUb2tlbigpLnBpcGUoXHJcbiAgICAgICAgY2F0Y2hFcnJvcigoZXJyb3IpID0+IHtcclxuICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGByZXZva2UgYWNjZXNzIHRva2VuIGZhaWxlZGA7XHJcbiAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoZXJyb3JNZXNzYWdlLCBlcnJvcik7XHJcbiAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvck1lc3NhZ2UpO1xyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIHRhcCgoKSA9PiB0aGlzLmxvZ29mZih1cmxIYW5kbGVyKSlcclxuICAgICAgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmM3MDA5XHJcbiAgLy8gcmV2b2tlcyBhbiBhY2Nlc3MgdG9rZW4gb24gdGhlIFNUUy4gSWYgbm8gdG9rZW4gaXMgcHJvdmlkZWQsIHRoZW4gdGhlIHRva2VuIGZyb21cclxuICAvLyB0aGUgc3RvcmFnZSBpcyByZXZva2VkLiBZb3UgY2FuIHBhc3MgYW55IHRva2VuIHRvIHJldm9rZS4gVGhpcyBtYWtlcyBpdCBwb3NzaWJsZSB0b1xyXG4gIC8vIG1hbmFnZSB5b3VyIG93biB0b2tlbnMuIFRoZSBpcyBhIHB1YmxpYyBBUEkuXHJcbiAgcmV2b2tlQWNjZXNzVG9rZW4oYWNjZXNzVG9rZW4/OiBhbnkpIHtcclxuICAgIGNvbnN0IGFjY2Vzc1RvayA9IGFjY2Vzc1Rva2VuIHx8IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5nZXRBY2Nlc3NUb2tlbigpO1xyXG4gICAgY29uc3QgYm9keSA9IHRoaXMudXJsU2VydmljZS5jcmVhdGVSZXZvY2F0aW9uRW5kcG9pbnRCb2R5QWNjZXNzVG9rZW4oYWNjZXNzVG9rKTtcclxuICAgIGNvbnN0IHVybCA9IHRoaXMudXJsU2VydmljZS5nZXRSZXZvY2F0aW9uRW5kcG9pbnRVcmwoKTtcclxuXHJcbiAgICBsZXQgaGVhZGVyczogSHR0cEhlYWRlcnMgPSBuZXcgSHR0cEhlYWRlcnMoKTtcclxuICAgIGhlYWRlcnMgPSBoZWFkZXJzLnNldCgnQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcpO1xyXG5cclxuICAgIHJldHVybiB0aGlzLmRhdGFTZXJ2aWNlLnBvc3QodXJsLCBib2R5LCBoZWFkZXJzKS5waXBlKFxyXG4gICAgICBzd2l0Y2hNYXAoKHJlc3BvbnNlOiBhbnkpID0+IHtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ3Jldm9jYXRpb24gZW5kcG9pbnQgcG9zdCByZXNwb25zZTogJywgcmVzcG9uc2UpO1xyXG4gICAgICAgIHJldHVybiBvZihyZXNwb25zZSk7XHJcbiAgICAgIH0pLFxyXG4gICAgICBjYXRjaEVycm9yKChlcnJvcikgPT4ge1xyXG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBSZXZvY2F0aW9uIHJlcXVlc3QgZmFpbGVkYDtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoZXJyb3JNZXNzYWdlLCBlcnJvcik7XHJcbiAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoZXJyb3JNZXNzYWdlKTtcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvLyBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjNzAwOVxyXG4gIC8vIHJldm9rZXMgYW4gcmVmcmVzaCB0b2tlbiBvbiB0aGUgU1RTLiBUaGlzIGlzIG9ubHkgcmVxdWlyZWQgaW4gdGhlIGNvZGUgZmxvdyB3aXRoIHJlZnJlc2ggdG9rZW5zLlxyXG4gIC8vIElmIG5vIHRva2VuIGlzIHByb3ZpZGVkLCB0aGVuIHRoZSB0b2tlbiBmcm9tIHRoZSBzdG9yYWdlIGlzIHJldm9rZWQuIFlvdSBjYW4gcGFzcyBhbnkgdG9rZW4gdG8gcmV2b2tlLlxyXG4gIC8vIFRoaXMgbWFrZXMgaXQgcG9zc2libGUgdG8gbWFuYWdlIHlvdXIgb3duIHRva2Vucy5cclxuICByZXZva2VSZWZyZXNoVG9rZW4ocmVmcmVzaFRva2VuPzogYW55KSB7XHJcbiAgICBjb25zdCByZWZyZXNoVG9rID0gcmVmcmVzaFRva2VuIHx8IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5nZXRSZWZyZXNoVG9rZW4oKTtcclxuICAgIGNvbnN0IGJvZHkgPSB0aGlzLnVybFNlcnZpY2UuY3JlYXRlUmV2b2NhdGlvbkVuZHBvaW50Qm9keVJlZnJlc2hUb2tlbihyZWZyZXNoVG9rKTtcclxuICAgIGNvbnN0IHVybCA9IHRoaXMudXJsU2VydmljZS5nZXRSZXZvY2F0aW9uRW5kcG9pbnRVcmwoKTtcclxuXHJcbiAgICBsZXQgaGVhZGVyczogSHR0cEhlYWRlcnMgPSBuZXcgSHR0cEhlYWRlcnMoKTtcclxuICAgIGhlYWRlcnMgPSBoZWFkZXJzLnNldCgnQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcpO1xyXG5cclxuICAgIHJldHVybiB0aGlzLmRhdGFTZXJ2aWNlLnBvc3QodXJsLCBib2R5LCBoZWFkZXJzKS5waXBlKFxyXG4gICAgICBzd2l0Y2hNYXAoKHJlc3BvbnNlOiBhbnkpID0+IHtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ3Jldm9jYXRpb24gZW5kcG9pbnQgcG9zdCByZXNwb25zZTogJywgcmVzcG9uc2UpO1xyXG4gICAgICAgIHJldHVybiBvZihyZXNwb25zZSk7XHJcbiAgICAgIH0pLFxyXG4gICAgICBjYXRjaEVycm9yKChlcnJvcikgPT4ge1xyXG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBSZXZvY2F0aW9uIHJlcXVlc3QgZmFpbGVkYDtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoZXJyb3JNZXNzYWdlLCBlcnJvcik7XHJcbiAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoZXJyb3JNZXNzYWdlKTtcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBnZXRFbmRTZXNzaW9uVXJsKCk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgY29uc3QgaWRUb2tlbiA9IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5nZXRJZFRva2VuKCk7XHJcbiAgICByZXR1cm4gdGhpcy51cmxTZXJ2aWNlLmNyZWF0ZUVuZFNlc3Npb25VcmwoaWRUb2tlbik7XHJcbiAgfVxyXG59XHJcbiJdfQ==