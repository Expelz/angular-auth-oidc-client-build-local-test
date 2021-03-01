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
        setTimeout(() => {
            this.tabsSynchronizationService.closeTabSynchronization();
        }, 1000);
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
        setTimeout(() => {
            this.tabsSynchronizationService.closeTabSynchronization();
        }, 1000);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nb2ZmLXJldm9jYXRpb24uc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjLyIsInNvdXJjZXMiOlsibGliL2xvZ29mZlJldm9rZS9sb2dvZmYtcmV2b2NhdGlvbi5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNuRCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxNQUFNLGdCQUFnQixDQUFDOzs7Ozs7Ozs7O0FBVzVELE1BQU0sT0FBTyx1QkFBdUI7SUFDbEMsWUFDVSxXQUF3QixFQUN4Qix5QkFBb0QsRUFDcEQsYUFBNEIsRUFDNUIsVUFBc0IsRUFDdEIsbUJBQXdDLEVBQ3hDLFlBQTBCLEVBQzFCLGVBQWdDLEVBQ2hDLDBCQUFzRDtRQVB0RCxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUN4Qiw4QkFBeUIsR0FBekIseUJBQXlCLENBQTJCO1FBQ3BELGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLGVBQVUsR0FBVixVQUFVLENBQVk7UUFDdEIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtRQUN4QyxpQkFBWSxHQUFaLFlBQVksQ0FBYztRQUMxQixvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUFDaEMsK0JBQTBCLEdBQTFCLDBCQUEwQixDQUE0QjtJQUM3RCxDQUFDO0lBRUosK0NBQStDO0lBQy9DLDJFQUEyRTtJQUMzRSxNQUFNLENBQUMsVUFBaUM7UUFDdEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUNwRCxVQUFVLENBQUMsR0FBRyxFQUFFO1lB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LENBQUMsd0JBQXdCLEVBQUUsQ0FBQztRQUV2RCxJQUFJLE9BQU8sR0FBZ0IsSUFBSSxXQUFXLEVBQUUsQ0FBQztRQUM3QyxPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsbUNBQW1DLENBQUMsQ0FBQztRQUUzRSxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUNuRCxTQUFTLENBQUMsQ0FBQyxRQUFhLEVBQUUsRUFBRTtZQUMxQixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxxQ0FBcUMsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUM3RSxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN0QixDQUFDLENBQUMsRUFDRixVQUFVLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUNuQixNQUFNLFlBQVksR0FBRywyQkFBMkIsQ0FBQztZQUNqRCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDakQsT0FBTyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDbEMsQ0FBQyxDQUFDLENBQ0gsQ0FBQztJQUNKLENBQUM7SUFFRCxnQkFBZ0I7UUFDZCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDNUQsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3RELENBQUM7OzhGQS9IVSx1QkFBdUI7K0RBQXZCLHVCQUF1QixXQUF2Qix1QkFBdUI7a0RBQXZCLHVCQUF1QjtjQURuQyxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSHR0cEhlYWRlcnMgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XHJcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgb2YsIHRocm93RXJyb3IgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgY2F0Y2hFcnJvciwgc3dpdGNoTWFwLCB0YXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcbmltcG9ydCB7IERhdGFTZXJ2aWNlIH0gZnJvbSAnLi4vYXBpL2RhdGEuc2VydmljZSc7XHJcbmltcG9ydCB7IEZsb3dzU2VydmljZSB9IGZyb20gJy4uL2Zsb3dzL2Zsb3dzLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBDaGVja1Nlc3Npb25TZXJ2aWNlIH0gZnJvbSAnLi4vaWZyYW1lL2NoZWNrLXNlc3Npb24uc2VydmljZSc7XHJcbmltcG9ydCB7IFRhYnNTeW5jaHJvbml6YXRpb25TZXJ2aWNlIH0gZnJvbSAnLi4vaWZyYW1lL3RhYnMtc3luY2hyb25pemF0aW9uLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi4vbG9nZ2luZy9sb2dnZXIuc2VydmljZSc7XHJcbmltcG9ydCB7IFN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UgfSBmcm9tICcuLi9zdG9yYWdlL3N0b3JhZ2UtcGVyc2lzdGFuY2Uuc2VydmljZSc7XHJcbmltcG9ydCB7IFJlZGlyZWN0U2VydmljZSB9IGZyb20gJy4uL3V0aWxzL3JlZGlyZWN0L3JlZGlyZWN0LnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBVcmxTZXJ2aWNlIH0gZnJvbSAnLi4vdXRpbHMvdXJsL3VybC5zZXJ2aWNlJztcclxuXHJcbkBJbmplY3RhYmxlKClcclxuZXhwb3J0IGNsYXNzIExvZ29mZlJldm9jYXRpb25TZXJ2aWNlIHtcclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgZGF0YVNlcnZpY2U6IERhdGFTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBzdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlOiBTdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBsb2dnZXJTZXJ2aWNlOiBMb2dnZXJTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSB1cmxTZXJ2aWNlOiBVcmxTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBjaGVja1Nlc3Npb25TZXJ2aWNlOiBDaGVja1Nlc3Npb25TZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBmbG93c1NlcnZpY2U6IEZsb3dzU2VydmljZSxcclxuICAgIHByaXZhdGUgcmVkaXJlY3RTZXJ2aWNlOiBSZWRpcmVjdFNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHRhYnNTeW5jaHJvbml6YXRpb25TZXJ2aWNlOiBUYWJzU3luY2hyb25pemF0aW9uU2VydmljZVxyXG4gICkge31cclxuXHJcbiAgLy8gTG9ncyBvdXQgb24gdGhlIHNlcnZlciBhbmQgdGhlIGxvY2FsIGNsaWVudC5cclxuICAvLyBJZiB0aGUgc2VydmVyIHN0YXRlIGhhcyBjaGFuZ2VkLCBjaGVja3Nlc3Npb24sIHRoZW4gb25seSBhIGxvY2FsIGxvZ291dC5cclxuICBsb2dvZmYodXJsSGFuZGxlcj86ICh1cmw6IHN0cmluZykgPT4gYW55KSB7XHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ2xvZ29mZiwgcmVtb3ZlIGF1dGggJyk7XHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgdGhpcy50YWJzU3luY2hyb25pemF0aW9uU2VydmljZS5jbG9zZVRhYlN5bmNocm9uaXphdGlvbigpO1xyXG4gICAgfSwgMTAwMCk7XHJcbiAgICBjb25zdCBlbmRTZXNzaW9uVXJsID0gdGhpcy5nZXRFbmRTZXNzaW9uVXJsKCk7XHJcbiAgICB0aGlzLmZsb3dzU2VydmljZS5yZXNldEF1dGhvcml6YXRpb25EYXRhKCk7XHJcblxyXG4gICAgaWYgKCFlbmRTZXNzaW9uVXJsKSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zygnb25seSBsb2NhbCBsb2dpbiBjbGVhbmVkIHVwLCBubyBlbmRfc2Vzc2lvbl9lbmRwb2ludCcpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuY2hlY2tTZXNzaW9uU2VydmljZS5zZXJ2ZXJTdGF0ZUNoYW5nZWQoKSkge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ29ubHkgbG9jYWwgbG9naW4gY2xlYW5lZCB1cCwgc2VydmVyIHNlc3Npb24gaGFzIGNoYW5nZWQnKTtcclxuICAgIH0gZWxzZSBpZiAodXJsSGFuZGxlcikge1xyXG4gICAgICB1cmxIYW5kbGVyKGVuZFNlc3Npb25VcmwpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5yZWRpcmVjdFNlcnZpY2UucmVkaXJlY3RUbyhlbmRTZXNzaW9uVXJsKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGxvZ29mZkxvY2FsKCkge1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIHRoaXMudGFic1N5bmNocm9uaXphdGlvblNlcnZpY2UuY2xvc2VUYWJTeW5jaHJvbml6YXRpb24oKTtcclxuICAgIH0sIDEwMDApO1xyXG5cclxuICAgIHRoaXMuZmxvd3NTZXJ2aWNlLnJlc2V0QXV0aG9yaXphdGlvbkRhdGEoKTtcclxuICB9XHJcblxyXG4gIC8vIFRoZSByZWZyZXNoIHRva2VuIGFuZCBhbmQgdGhlIGFjY2VzcyB0b2tlbiBhcmUgcmV2b2tlZCBvbiB0aGUgc2VydmVyLiBJZiB0aGUgcmVmcmVzaCB0b2tlbiBkb2VzIG5vdCBleGlzdFxyXG4gIC8vIG9ubHkgdGhlIGFjY2VzcyB0b2tlbiBpcyByZXZva2VkLiBUaGVuIHRoZSBsb2dvdXQgcnVuLlxyXG4gIGxvZ29mZkFuZFJldm9rZVRva2Vucyh1cmxIYW5kbGVyPzogKHVybDogc3RyaW5nKSA9PiBhbnkpIHtcclxuICAgIGlmICghdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQoJ2F1dGhXZWxsS25vd25FbmRQb2ludHMnKT8ucmV2b2NhdGlvbkVuZHBvaW50KSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygncmV2b2NhdGlvbiBlbmRwb2ludCBub3Qgc3VwcG9ydGVkJyk7XHJcbiAgICAgIHRoaXMubG9nb2ZmKHVybEhhbmRsZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UuZ2V0UmVmcmVzaFRva2VuKCkpIHtcclxuICAgICAgcmV0dXJuIHRoaXMucmV2b2tlUmVmcmVzaFRva2VuKCkucGlwZShcclxuICAgICAgICBzd2l0Y2hNYXAoKHJlc3VsdCkgPT4gdGhpcy5yZXZva2VBY2Nlc3NUb2tlbihyZXN1bHQpKSxcclxuICAgICAgICBjYXRjaEVycm9yKChlcnJvcikgPT4ge1xyXG4gICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYHJldm9rZSB0b2tlbiBmYWlsZWRgO1xyXG4gICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGVycm9yTWVzc2FnZSwgZXJyb3IpO1xyXG4gICAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoZXJyb3JNZXNzYWdlKTtcclxuICAgICAgICB9KSxcclxuICAgICAgICB0YXAoKCkgPT4gdGhpcy5sb2dvZmYodXJsSGFuZGxlcikpXHJcbiAgICAgICk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5yZXZva2VBY2Nlc3NUb2tlbigpLnBpcGUoXHJcbiAgICAgICAgY2F0Y2hFcnJvcigoZXJyb3IpID0+IHtcclxuICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGByZXZva2UgYWNjZXNzIHRva2VuIGZhaWxlZGA7XHJcbiAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoZXJyb3JNZXNzYWdlLCBlcnJvcik7XHJcbiAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvck1lc3NhZ2UpO1xyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIHRhcCgoKSA9PiB0aGlzLmxvZ29mZih1cmxIYW5kbGVyKSlcclxuICAgICAgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmM3MDA5XHJcbiAgLy8gcmV2b2tlcyBhbiBhY2Nlc3MgdG9rZW4gb24gdGhlIFNUUy4gSWYgbm8gdG9rZW4gaXMgcHJvdmlkZWQsIHRoZW4gdGhlIHRva2VuIGZyb21cclxuICAvLyB0aGUgc3RvcmFnZSBpcyByZXZva2VkLiBZb3UgY2FuIHBhc3MgYW55IHRva2VuIHRvIHJldm9rZS4gVGhpcyBtYWtlcyBpdCBwb3NzaWJsZSB0b1xyXG4gIC8vIG1hbmFnZSB5b3VyIG93biB0b2tlbnMuIFRoZSBpcyBhIHB1YmxpYyBBUEkuXHJcbiAgcmV2b2tlQWNjZXNzVG9rZW4oYWNjZXNzVG9rZW4/OiBhbnkpIHtcclxuICAgIGNvbnN0IGFjY2Vzc1RvayA9IGFjY2Vzc1Rva2VuIHx8IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5nZXRBY2Nlc3NUb2tlbigpO1xyXG4gICAgY29uc3QgYm9keSA9IHRoaXMudXJsU2VydmljZS5jcmVhdGVSZXZvY2F0aW9uRW5kcG9pbnRCb2R5QWNjZXNzVG9rZW4oYWNjZXNzVG9rKTtcclxuICAgIGNvbnN0IHVybCA9IHRoaXMudXJsU2VydmljZS5nZXRSZXZvY2F0aW9uRW5kcG9pbnRVcmwoKTtcclxuXHJcbiAgICBsZXQgaGVhZGVyczogSHR0cEhlYWRlcnMgPSBuZXcgSHR0cEhlYWRlcnMoKTtcclxuICAgIGhlYWRlcnMgPSBoZWFkZXJzLnNldCgnQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcpO1xyXG5cclxuICAgIHJldHVybiB0aGlzLmRhdGFTZXJ2aWNlLnBvc3QodXJsLCBib2R5LCBoZWFkZXJzKS5waXBlKFxyXG4gICAgICBzd2l0Y2hNYXAoKHJlc3BvbnNlOiBhbnkpID0+IHtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ3Jldm9jYXRpb24gZW5kcG9pbnQgcG9zdCByZXNwb25zZTogJywgcmVzcG9uc2UpO1xyXG4gICAgICAgIHJldHVybiBvZihyZXNwb25zZSk7XHJcbiAgICAgIH0pLFxyXG4gICAgICBjYXRjaEVycm9yKChlcnJvcikgPT4ge1xyXG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBSZXZvY2F0aW9uIHJlcXVlc3QgZmFpbGVkYDtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoZXJyb3JNZXNzYWdlLCBlcnJvcik7XHJcbiAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoZXJyb3JNZXNzYWdlKTtcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvLyBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjNzAwOVxyXG4gIC8vIHJldm9rZXMgYW4gcmVmcmVzaCB0b2tlbiBvbiB0aGUgU1RTLiBUaGlzIGlzIG9ubHkgcmVxdWlyZWQgaW4gdGhlIGNvZGUgZmxvdyB3aXRoIHJlZnJlc2ggdG9rZW5zLlxyXG4gIC8vIElmIG5vIHRva2VuIGlzIHByb3ZpZGVkLCB0aGVuIHRoZSB0b2tlbiBmcm9tIHRoZSBzdG9yYWdlIGlzIHJldm9rZWQuIFlvdSBjYW4gcGFzcyBhbnkgdG9rZW4gdG8gcmV2b2tlLlxyXG4gIC8vIFRoaXMgbWFrZXMgaXQgcG9zc2libGUgdG8gbWFuYWdlIHlvdXIgb3duIHRva2Vucy5cclxuICByZXZva2VSZWZyZXNoVG9rZW4ocmVmcmVzaFRva2VuPzogYW55KSB7XHJcbiAgICBjb25zdCByZWZyZXNoVG9rID0gcmVmcmVzaFRva2VuIHx8IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5nZXRSZWZyZXNoVG9rZW4oKTtcclxuICAgIGNvbnN0IGJvZHkgPSB0aGlzLnVybFNlcnZpY2UuY3JlYXRlUmV2b2NhdGlvbkVuZHBvaW50Qm9keVJlZnJlc2hUb2tlbihyZWZyZXNoVG9rKTtcclxuICAgIGNvbnN0IHVybCA9IHRoaXMudXJsU2VydmljZS5nZXRSZXZvY2F0aW9uRW5kcG9pbnRVcmwoKTtcclxuXHJcbiAgICBsZXQgaGVhZGVyczogSHR0cEhlYWRlcnMgPSBuZXcgSHR0cEhlYWRlcnMoKTtcclxuICAgIGhlYWRlcnMgPSBoZWFkZXJzLnNldCgnQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcpO1xyXG5cclxuICAgIHJldHVybiB0aGlzLmRhdGFTZXJ2aWNlLnBvc3QodXJsLCBib2R5LCBoZWFkZXJzKS5waXBlKFxyXG4gICAgICBzd2l0Y2hNYXAoKHJlc3BvbnNlOiBhbnkpID0+IHtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ3Jldm9jYXRpb24gZW5kcG9pbnQgcG9zdCByZXNwb25zZTogJywgcmVzcG9uc2UpO1xyXG4gICAgICAgIHJldHVybiBvZihyZXNwb25zZSk7XHJcbiAgICAgIH0pLFxyXG4gICAgICBjYXRjaEVycm9yKChlcnJvcikgPT4ge1xyXG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBSZXZvY2F0aW9uIHJlcXVlc3QgZmFpbGVkYDtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoZXJyb3JNZXNzYWdlLCBlcnJvcik7XHJcbiAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoZXJyb3JNZXNzYWdlKTtcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBnZXRFbmRTZXNzaW9uVXJsKCk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgY29uc3QgaWRUb2tlbiA9IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5nZXRJZFRva2VuKCk7XHJcbiAgICByZXR1cm4gdGhpcy51cmxTZXJ2aWNlLmNyZWF0ZUVuZFNlc3Npb25VcmwoaWRUb2tlbik7XHJcbiAgfVxyXG59XHJcbiJdfQ==