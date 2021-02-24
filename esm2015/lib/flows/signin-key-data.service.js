import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "../storage/storage-persistance.service";
import * as i2 from "../logging/logger.service";
import * as i3 from "../api/data.service";
export class SigninKeyDataService {
    constructor(storagePersistanceService, loggerService, dataService) {
        this.storagePersistanceService = storagePersistanceService;
        this.loggerService = loggerService;
        this.dataService = dataService;
    }
    getSigningKeys() {
        const authWellKnownEndPoints = this.storagePersistanceService.read('authWellKnownEndPoints');
        const jwksUri = authWellKnownEndPoints === null || authWellKnownEndPoints === void 0 ? void 0 : authWellKnownEndPoints.jwksUri;
        if (!jwksUri) {
            const error = `getSigningKeys: authWellKnownEndpoints.jwksUri is: '${jwksUri}'`;
            this.loggerService.logWarning(error);
            return throwError(error);
        }
        this.loggerService.logDebug('Getting signinkeys from ', jwksUri);
        return this.dataService.get(jwksUri).pipe(catchError(this.handleErrorGetSigningKeys));
    }
    handleErrorGetSigningKeys(errorResponse) {
        let errMsg = '';
        if (errorResponse instanceof HttpResponse) {
            const body = errorResponse.body || {};
            const err = JSON.stringify(body);
            const { status, statusText } = errorResponse;
            errMsg = `${status || ''} - ${statusText || ''} ${err || ''}`;
        }
        else {
            const { message } = errorResponse;
            errMsg = !!message ? message : `${errorResponse}`;
        }
        this.loggerService.logError(errMsg);
        return throwError(new Error(errMsg));
    }
}
SigninKeyDataService.ɵfac = function SigninKeyDataService_Factory(t) { return new (t || SigninKeyDataService)(i0.ɵɵinject(i1.StoragePersistanceService), i0.ɵɵinject(i2.LoggerService), i0.ɵɵinject(i3.DataService)); };
SigninKeyDataService.ɵprov = i0.ɵɵdefineInjectable({ token: SigninKeyDataService, factory: SigninKeyDataService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(SigninKeyDataService, [{
        type: Injectable
    }], function () { return [{ type: i1.StoragePersistanceService }, { type: i2.LoggerService }, { type: i3.DataService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lnbmluLWtleS1kYXRhLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy8iLCJzb3VyY2VzIjpbImxpYi9mbG93cy9zaWduaW4ta2V5LWRhdGEuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDcEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ2xDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQzs7Ozs7QUFPNUMsTUFBTSxPQUFPLG9CQUFvQjtJQUMvQixZQUNVLHlCQUFvRCxFQUNwRCxhQUE0QixFQUM1QixXQUF3QjtRQUZ4Qiw4QkFBeUIsR0FBekIseUJBQXlCLENBQTJCO1FBQ3BELGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLGdCQUFXLEdBQVgsV0FBVyxDQUFhO0lBQy9CLENBQUM7SUFFSixjQUFjO1FBQ1osTUFBTSxzQkFBc0IsR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDN0YsTUFBTSxPQUFPLEdBQUcsc0JBQXNCLGFBQXRCLHNCQUFzQix1QkFBdEIsc0JBQXNCLENBQUUsT0FBTyxDQUFDO1FBQ2hELElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDWixNQUFNLEtBQUssR0FBRyx1REFBdUQsT0FBTyxHQUFHLENBQUM7WUFDaEYsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckMsT0FBTyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDMUI7UUFFRCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQywwQkFBMEIsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUVqRSxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFVLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQztJQUNqRyxDQUFDO0lBRU8seUJBQXlCLENBQUMsYUFBc0M7UUFDdEUsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLElBQUksYUFBYSxZQUFZLFlBQVksRUFBRTtZQUN6QyxNQUFNLElBQUksR0FBRyxhQUFhLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUN0QyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2pDLE1BQU0sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLEdBQUcsYUFBYSxDQUFDO1lBQzdDLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxFQUFFLE1BQU0sVUFBVSxJQUFJLEVBQUUsSUFBSSxHQUFHLElBQUksRUFBRSxFQUFFLENBQUM7U0FDL0Q7YUFBTTtZQUNMLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxhQUFhLENBQUM7WUFDbEMsTUFBTSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxhQUFhLEVBQUUsQ0FBQztTQUNuRDtRQUNELElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3BDLE9BQU8sVUFBVSxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDdkMsQ0FBQzs7d0ZBbENVLG9CQUFvQjs0REFBcEIsb0JBQW9CLFdBQXBCLG9CQUFvQjtrREFBcEIsb0JBQW9CO2NBRGhDLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIdHRwUmVzcG9uc2UgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XHJcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBjYXRjaEVycm9yIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQgeyBEYXRhU2VydmljZSB9IGZyb20gJy4uL2FwaS9kYXRhLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi4vbG9nZ2luZy9sb2dnZXIuc2VydmljZSc7XHJcbmltcG9ydCB7IFN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UgfSBmcm9tICcuLi9zdG9yYWdlL3N0b3JhZ2UtcGVyc2lzdGFuY2Uuc2VydmljZSc7XHJcbmltcG9ydCB7IEp3dEtleXMgfSBmcm9tICcuLi92YWxpZGF0aW9uL2p3dGtleXMnO1xyXG5cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgU2lnbmluS2V5RGF0YVNlcnZpY2Uge1xyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSBzdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlOiBTdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBsb2dnZXJTZXJ2aWNlOiBMb2dnZXJTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBkYXRhU2VydmljZTogRGF0YVNlcnZpY2VcclxuICApIHt9XHJcblxyXG4gIGdldFNpZ25pbmdLZXlzKCkge1xyXG4gICAgY29uc3QgYXV0aFdlbGxLbm93bkVuZFBvaW50cyA9IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5yZWFkKCdhdXRoV2VsbEtub3duRW5kUG9pbnRzJyk7XHJcbiAgICBjb25zdCBqd2tzVXJpID0gYXV0aFdlbGxLbm93bkVuZFBvaW50cz8uandrc1VyaTtcclxuICAgIGlmICghandrc1VyaSkge1xyXG4gICAgICBjb25zdCBlcnJvciA9IGBnZXRTaWduaW5nS2V5czogYXV0aFdlbGxLbm93bkVuZHBvaW50cy5qd2tzVXJpIGlzOiAnJHtqd2tzVXJpfSdgO1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZyhlcnJvcik7XHJcbiAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ0dldHRpbmcgc2lnbmlua2V5cyBmcm9tICcsIGp3a3NVcmkpO1xyXG5cclxuICAgIHJldHVybiB0aGlzLmRhdGFTZXJ2aWNlLmdldDxKd3RLZXlzPihqd2tzVXJpKS5waXBlKGNhdGNoRXJyb3IodGhpcy5oYW5kbGVFcnJvckdldFNpZ25pbmdLZXlzKSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZUVycm9yR2V0U2lnbmluZ0tleXMoZXJyb3JSZXNwb25zZTogSHR0cFJlc3BvbnNlPGFueT4gfCBhbnkpIHtcclxuICAgIGxldCBlcnJNc2cgPSAnJztcclxuICAgIGlmIChlcnJvclJlc3BvbnNlIGluc3RhbmNlb2YgSHR0cFJlc3BvbnNlKSB7XHJcbiAgICAgIGNvbnN0IGJvZHkgPSBlcnJvclJlc3BvbnNlLmJvZHkgfHwge307XHJcbiAgICAgIGNvbnN0IGVyciA9IEpTT04uc3RyaW5naWZ5KGJvZHkpO1xyXG4gICAgICBjb25zdCB7IHN0YXR1cywgc3RhdHVzVGV4dCB9ID0gZXJyb3JSZXNwb25zZTtcclxuICAgICAgZXJyTXNnID0gYCR7c3RhdHVzIHx8ICcnfSAtICR7c3RhdHVzVGV4dCB8fCAnJ30gJHtlcnIgfHwgJyd9YDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IHsgbWVzc2FnZSB9ID0gZXJyb3JSZXNwb25zZTtcclxuICAgICAgZXJyTXNnID0gISFtZXNzYWdlID8gbWVzc2FnZSA6IGAke2Vycm9yUmVzcG9uc2V9YDtcclxuICAgIH1cclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihlcnJNc2cpO1xyXG4gICAgcmV0dXJuIHRocm93RXJyb3IobmV3IEVycm9yKGVyck1zZykpO1xyXG4gIH1cclxufVxyXG4iXX0=