import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "../logging/logger.service";
import * as i2 from "../flows/flows.service";
import * as i3 from "./intervall.service";
export class RefreshSessionRefreshTokenService {
    constructor(loggerService, flowsService, intervallService) {
        this.loggerService = loggerService;
        this.flowsService = flowsService;
        this.intervallService = intervallService;
    }
    refreshSessionWithRefreshTokens(customParams) {
        this.loggerService.logDebug('BEGIN refresh session Authorize');
        return this.flowsService.processRefreshToken(customParams).pipe(catchError((error) => {
            this.intervallService.stopPeriodicallTokenCheck();
            this.flowsService.resetAuthorizationData();
            return throwError(error);
        }));
    }
}
RefreshSessionRefreshTokenService.ɵfac = function RefreshSessionRefreshTokenService_Factory(t) { return new (t || RefreshSessionRefreshTokenService)(i0.ɵɵinject(i1.LoggerService), i0.ɵɵinject(i2.FlowsService), i0.ɵɵinject(i3.IntervallService)); };
RefreshSessionRefreshTokenService.ɵprov = i0.ɵɵdefineInjectable({ token: RefreshSessionRefreshTokenService, factory: RefreshSessionRefreshTokenService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(RefreshSessionRefreshTokenService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], function () { return [{ type: i1.LoggerService }, { type: i2.FlowsService }, { type: i3.IntervallService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmcmVzaC1zZXNzaW9uLXJlZnJlc2gtdG9rZW4uc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjLyIsInNvdXJjZXMiOlsibGliL2NhbGxiYWNrL3JlZnJlc2gtc2Vzc2lvbi1yZWZyZXNoLXRva2VuLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ2xDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQzs7Ozs7QUFNNUMsTUFBTSxPQUFPLGlDQUFpQztJQUM1QyxZQUFvQixhQUE0QixFQUFVLFlBQTBCLEVBQVUsZ0JBQWtDO1FBQTVHLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQVUsaUJBQVksR0FBWixZQUFZLENBQWM7UUFBVSxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO0lBQUcsQ0FBQztJQUVwSSwrQkFBK0IsQ0FBQyxZQUEyRDtRQUN6RixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1FBRS9ELE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQzdELFVBQVUsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ25CLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1lBQ2xELElBQUksQ0FBQyxZQUFZLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztZQUMzQyxPQUFPLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzQixDQUFDLENBQUMsQ0FDSCxDQUFDO0lBQ0osQ0FBQzs7a0hBYlUsaUNBQWlDO3lFQUFqQyxpQ0FBaUMsV0FBakMsaUNBQWlDLG1CQURwQixNQUFNO2tEQUNuQixpQ0FBaUM7Y0FEN0MsVUFBVTtlQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBjYXRjaEVycm9yIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQgeyBGbG93c1NlcnZpY2UgfSBmcm9tICcuLi9mbG93cy9mbG93cy5zZXJ2aWNlJztcclxuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBJbnRlcnZhbGxTZXJ2aWNlIH0gZnJvbSAnLi9pbnRlcnZhbGwuc2VydmljZSc7XHJcblxyXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxyXG5leHBvcnQgY2xhc3MgUmVmcmVzaFNlc3Npb25SZWZyZXNoVG9rZW5TZXJ2aWNlIHtcclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsIHByaXZhdGUgZmxvd3NTZXJ2aWNlOiBGbG93c1NlcnZpY2UsIHByaXZhdGUgaW50ZXJ2YWxsU2VydmljZTogSW50ZXJ2YWxsU2VydmljZSkge31cclxuXHJcbiAgcmVmcmVzaFNlc3Npb25XaXRoUmVmcmVzaFRva2VucyhjdXN0b21QYXJhbXM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfSkge1xyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdCRUdJTiByZWZyZXNoIHNlc3Npb24gQXV0aG9yaXplJyk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuZmxvd3NTZXJ2aWNlLnByb2Nlc3NSZWZyZXNoVG9rZW4oY3VzdG9tUGFyYW1zKS5waXBlKFxyXG4gICAgICBjYXRjaEVycm9yKChlcnJvcikgPT4ge1xyXG4gICAgICAgIHRoaXMuaW50ZXJ2YWxsU2VydmljZS5zdG9wUGVyaW9kaWNhbGxUb2tlbkNoZWNrKCk7XHJcbiAgICAgICAgdGhpcy5mbG93c1NlcnZpY2UucmVzZXRBdXRob3JpemF0aW9uRGF0YSgpO1xyXG4gICAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yKTtcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG59XHJcbiJdfQ==