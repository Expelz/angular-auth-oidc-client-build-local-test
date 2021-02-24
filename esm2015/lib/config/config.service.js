import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { EventTypes } from '../public-events/event-types';
import * as i0 from "@angular/core";
import * as i1 from "../logging/logger.service";
import * as i2 from "../public-events/public-events.service";
import * as i3 from "../config/config.provider";
import * as i4 from "./auth-well-known.service";
import * as i5 from "../storage/storage-persistance.service";
import * as i6 from "../config-validation/config-validation.service";
export class OidcConfigService {
    constructor(loggerService, publicEventsService, configurationProvider, authWellKnownService, storagePersistanceService, configValidationService) {
        this.loggerService = loggerService;
        this.publicEventsService = publicEventsService;
        this.configurationProvider = configurationProvider;
        this.authWellKnownService = authWellKnownService;
        this.storagePersistanceService = storagePersistanceService;
        this.configValidationService = configValidationService;
    }
    withConfig(passedConfig, passedAuthWellKnownEndpoints) {
        return new Promise((resolve, reject) => {
            if (!this.configValidationService.validateConfig(passedConfig)) {
                this.loggerService.logError('Validation of config rejected with errors. Config is NOT set.');
                resolve();
            }
            if (!passedConfig.authWellknownEndpoint) {
                passedConfig.authWellknownEndpoint = passedConfig.stsServer;
            }
            const usedConfig = this.configurationProvider.setConfig(passedConfig);
            const alreadyExistingAuthWellKnownEndpoints = this.storagePersistanceService.read('authWellKnownEndPoints');
            if (!!alreadyExistingAuthWellKnownEndpoints) {
                this.publicEventsService.fireEvent(EventTypes.ConfigLoaded, {
                    configuration: passedConfig,
                    wellknown: alreadyExistingAuthWellKnownEndpoints,
                });
                resolve();
            }
            if (!!passedAuthWellKnownEndpoints) {
                this.authWellKnownService.storeWellKnownEndpoints(passedAuthWellKnownEndpoints);
                this.publicEventsService.fireEvent(EventTypes.ConfigLoaded, {
                    configuration: passedConfig,
                    wellknown: passedAuthWellKnownEndpoints,
                });
                resolve();
            }
            if (usedConfig.eagerLoadAuthWellKnownEndpoints) {
                this.authWellKnownService
                    .getAuthWellKnownEndPoints(usedConfig.authWellknownEndpoint)
                    .pipe(catchError((error) => {
                    this.loggerService.logError('Getting auth well known endpoints failed on start', error);
                    return throwError(error);
                }), tap((wellknownEndPoints) => this.publicEventsService.fireEvent(EventTypes.ConfigLoaded, {
                    configuration: passedConfig,
                    wellknown: wellknownEndPoints,
                })))
                    .subscribe(() => resolve(), () => reject());
            }
            else {
                this.publicEventsService.fireEvent(EventTypes.ConfigLoaded, {
                    configuration: passedConfig,
                    wellknown: null,
                });
                resolve();
            }
        });
    }
}
OidcConfigService.ɵfac = function OidcConfigService_Factory(t) { return new (t || OidcConfigService)(i0.ɵɵinject(i1.LoggerService), i0.ɵɵinject(i2.PublicEventsService), i0.ɵɵinject(i3.ConfigurationProvider), i0.ɵɵinject(i4.AuthWellKnownService), i0.ɵɵinject(i5.StoragePersistanceService), i0.ɵɵinject(i6.ConfigValidationService)); };
OidcConfigService.ɵprov = i0.ɵɵdefineInjectable({ token: OidcConfigService, factory: OidcConfigService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(OidcConfigService, [{
        type: Injectable
    }], function () { return [{ type: i1.LoggerService }, { type: i2.PublicEventsService }, { type: i3.ConfigurationProvider }, { type: i4.AuthWellKnownService }, { type: i5.StoragePersistanceService }, { type: i6.ConfigValidationService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy8iLCJzb3VyY2VzIjpbImxpYi9jb25maWcvY29uZmlnLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ2xDLE9BQU8sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFJakQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDhCQUE4QixDQUFDOzs7Ozs7OztBQVMxRCxNQUFNLE9BQU8saUJBQWlCO0lBQzVCLFlBQ1UsYUFBNEIsRUFDNUIsbUJBQXdDLEVBQ3hDLHFCQUE0QyxFQUM1QyxvQkFBMEMsRUFDMUMseUJBQW9ELEVBQ3BELHVCQUFnRDtRQUxoRCxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUM1Qix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1FBQ3hDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7UUFDNUMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtRQUMxQyw4QkFBeUIsR0FBekIseUJBQXlCLENBQTJCO1FBQ3BELDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBeUI7SUFDdkQsQ0FBQztJQUVKLFVBQVUsQ0FBQyxZQUFpQyxFQUFFLDRCQUFxRDtRQUNqRyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ3JDLElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxFQUFFO2dCQUM5RCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQywrREFBK0QsQ0FBQyxDQUFDO2dCQUM3RixPQUFPLEVBQUUsQ0FBQzthQUNYO1lBRUQsSUFBSSxDQUFDLFlBQVksQ0FBQyxxQkFBcUIsRUFBRTtnQkFDdkMsWUFBWSxDQUFDLHFCQUFxQixHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUM7YUFDN0Q7WUFFRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRXRFLE1BQU0scUNBQXFDLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1lBQzVHLElBQUksQ0FBQyxDQUFDLHFDQUFxQyxFQUFFO2dCQUMzQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFzQixVQUFVLENBQUMsWUFBWSxFQUFFO29CQUMvRSxhQUFhLEVBQUUsWUFBWTtvQkFDM0IsU0FBUyxFQUFFLHFDQUFxQztpQkFDakQsQ0FBQyxDQUFDO2dCQUVILE9BQU8sRUFBRSxDQUFDO2FBQ1g7WUFFRCxJQUFJLENBQUMsQ0FBQyw0QkFBNEIsRUFBRTtnQkFDbEMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLHVCQUF1QixDQUFDLDRCQUE0QixDQUFDLENBQUM7Z0JBQ2hGLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQXNCLFVBQVUsQ0FBQyxZQUFZLEVBQUU7b0JBQy9FLGFBQWEsRUFBRSxZQUFZO29CQUMzQixTQUFTLEVBQUUsNEJBQTRCO2lCQUN4QyxDQUFDLENBQUM7Z0JBRUgsT0FBTyxFQUFFLENBQUM7YUFDWDtZQUNELElBQUksVUFBVSxDQUFDLCtCQUErQixFQUFFO2dCQUM5QyxJQUFJLENBQUMsb0JBQW9CO3FCQUN0Qix5QkFBeUIsQ0FBQyxVQUFVLENBQUMscUJBQXFCLENBQUM7cUJBQzNELElBQUksQ0FDSCxVQUFVLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtvQkFDbkIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsbURBQW1ELEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQ3hGLE9BQU8sVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMzQixDQUFDLENBQUMsRUFDRixHQUFHLENBQUMsQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLENBQ3pCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQXNCLFVBQVUsQ0FBQyxZQUFZLEVBQUU7b0JBQy9FLGFBQWEsRUFBRSxZQUFZO29CQUMzQixTQUFTLEVBQUUsa0JBQWtCO2lCQUM5QixDQUFDLENBQ0gsQ0FDRjtxQkFDQSxTQUFTLENBQ1IsR0FBRyxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQ2YsR0FBRyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQ2YsQ0FBQzthQUNMO2lCQUFNO2dCQUNMLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQXNCLFVBQVUsQ0FBQyxZQUFZLEVBQUU7b0JBQy9FLGFBQWEsRUFBRSxZQUFZO29CQUMzQixTQUFTLEVBQUUsSUFBSTtpQkFDaEIsQ0FBQyxDQUFDO2dCQUNILE9BQU8sRUFBRSxDQUFDO2FBQ1g7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7O2tGQXJFVSxpQkFBaUI7eURBQWpCLGlCQUFpQixXQUFqQixpQkFBaUI7a0RBQWpCLGlCQUFpQjtjQUQ3QixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IGNhdGNoRXJyb3IsIHRhcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuaW1wb3J0IHsgQ29uZmlnVmFsaWRhdGlvblNlcnZpY2UgfSBmcm9tICcuLi9jb25maWctdmFsaWRhdGlvbi9jb25maWctdmFsaWRhdGlvbi5zZXJ2aWNlJztcclxuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi4vY29uZmlnL2NvbmZpZy5wcm92aWRlcic7XHJcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgRXZlbnRUeXBlcyB9IGZyb20gJy4uL3B1YmxpYy1ldmVudHMvZXZlbnQtdHlwZXMnO1xyXG5pbXBvcnQgeyBQdWJsaWNFdmVudHNTZXJ2aWNlIH0gZnJvbSAnLi4vcHVibGljLWV2ZW50cy9wdWJsaWMtZXZlbnRzLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBTdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlIH0gZnJvbSAnLi4vc3RvcmFnZS9zdG9yYWdlLXBlcnNpc3RhbmNlLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBBdXRoV2VsbEtub3duRW5kcG9pbnRzIH0gZnJvbSAnLi9hdXRoLXdlbGwta25vd24tZW5kcG9pbnRzJztcclxuaW1wb3J0IHsgQXV0aFdlbGxLbm93blNlcnZpY2UgfSBmcm9tICcuL2F1dGgtd2VsbC1rbm93bi5zZXJ2aWNlJztcclxuaW1wb3J0IHsgT3BlbklkQ29uZmlndXJhdGlvbiB9IGZyb20gJy4vb3BlbmlkLWNvbmZpZ3VyYXRpb24nO1xyXG5pbXBvcnQgeyBQdWJsaWNDb25maWd1cmF0aW9uIH0gZnJvbSAnLi9wdWJsaWMtY29uZmlndXJhdGlvbic7XHJcblxyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBPaWRjQ29uZmlnU2VydmljZSB7XHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHB1YmxpY0V2ZW50c1NlcnZpY2U6IFB1YmxpY0V2ZW50c1NlcnZpY2UsXHJcbiAgICBwcml2YXRlIGNvbmZpZ3VyYXRpb25Qcm92aWRlcjogQ29uZmlndXJhdGlvblByb3ZpZGVyLFxyXG4gICAgcHJpdmF0ZSBhdXRoV2VsbEtub3duU2VydmljZTogQXV0aFdlbGxLbm93blNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2U6IFN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGNvbmZpZ1ZhbGlkYXRpb25TZXJ2aWNlOiBDb25maWdWYWxpZGF0aW9uU2VydmljZVxyXG4gICkge31cclxuXHJcbiAgd2l0aENvbmZpZyhwYXNzZWRDb25maWc6IE9wZW5JZENvbmZpZ3VyYXRpb24sIHBhc3NlZEF1dGhXZWxsS25vd25FbmRwb2ludHM/OiBBdXRoV2VsbEtub3duRW5kcG9pbnRzKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICBpZiAoIXRoaXMuY29uZmlnVmFsaWRhdGlvblNlcnZpY2UudmFsaWRhdGVDb25maWcocGFzc2VkQ29uZmlnKSkge1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcignVmFsaWRhdGlvbiBvZiBjb25maWcgcmVqZWN0ZWQgd2l0aCBlcnJvcnMuIENvbmZpZyBpcyBOT1Qgc2V0LicpO1xyXG4gICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFwYXNzZWRDb25maWcuYXV0aFdlbGxrbm93bkVuZHBvaW50KSB7XHJcbiAgICAgICAgcGFzc2VkQ29uZmlnLmF1dGhXZWxsa25vd25FbmRwb2ludCA9IHBhc3NlZENvbmZpZy5zdHNTZXJ2ZXI7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHVzZWRDb25maWcgPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5zZXRDb25maWcocGFzc2VkQ29uZmlnKTtcclxuXHJcbiAgICAgIGNvbnN0IGFscmVhZHlFeGlzdGluZ0F1dGhXZWxsS25vd25FbmRwb2ludHMgPSB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZCgnYXV0aFdlbGxLbm93bkVuZFBvaW50cycpO1xyXG4gICAgICBpZiAoISFhbHJlYWR5RXhpc3RpbmdBdXRoV2VsbEtub3duRW5kcG9pbnRzKSB7XHJcbiAgICAgICAgdGhpcy5wdWJsaWNFdmVudHNTZXJ2aWNlLmZpcmVFdmVudDxQdWJsaWNDb25maWd1cmF0aW9uPihFdmVudFR5cGVzLkNvbmZpZ0xvYWRlZCwge1xyXG4gICAgICAgICAgY29uZmlndXJhdGlvbjogcGFzc2VkQ29uZmlnLFxyXG4gICAgICAgICAgd2VsbGtub3duOiBhbHJlYWR5RXhpc3RpbmdBdXRoV2VsbEtub3duRW5kcG9pbnRzLFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghIXBhc3NlZEF1dGhXZWxsS25vd25FbmRwb2ludHMpIHtcclxuICAgICAgICB0aGlzLmF1dGhXZWxsS25vd25TZXJ2aWNlLnN0b3JlV2VsbEtub3duRW5kcG9pbnRzKHBhc3NlZEF1dGhXZWxsS25vd25FbmRwb2ludHMpO1xyXG4gICAgICAgIHRoaXMucHVibGljRXZlbnRzU2VydmljZS5maXJlRXZlbnQ8UHVibGljQ29uZmlndXJhdGlvbj4oRXZlbnRUeXBlcy5Db25maWdMb2FkZWQsIHtcclxuICAgICAgICAgIGNvbmZpZ3VyYXRpb246IHBhc3NlZENvbmZpZyxcclxuICAgICAgICAgIHdlbGxrbm93bjogcGFzc2VkQXV0aFdlbGxLbm93bkVuZHBvaW50cyxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh1c2VkQ29uZmlnLmVhZ2VyTG9hZEF1dGhXZWxsS25vd25FbmRwb2ludHMpIHtcclxuICAgICAgICB0aGlzLmF1dGhXZWxsS25vd25TZXJ2aWNlXHJcbiAgICAgICAgICAuZ2V0QXV0aFdlbGxLbm93bkVuZFBvaW50cyh1c2VkQ29uZmlnLmF1dGhXZWxsa25vd25FbmRwb2ludClcclxuICAgICAgICAgIC5waXBlKFxyXG4gICAgICAgICAgICBjYXRjaEVycm9yKChlcnJvcikgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcignR2V0dGluZyBhdXRoIHdlbGwga25vd24gZW5kcG9pbnRzIGZhaWxlZCBvbiBzdGFydCcsIGVycm9yKTtcclxuICAgICAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvcik7XHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICB0YXAoKHdlbGxrbm93bkVuZFBvaW50cykgPT5cclxuICAgICAgICAgICAgICB0aGlzLnB1YmxpY0V2ZW50c1NlcnZpY2UuZmlyZUV2ZW50PFB1YmxpY0NvbmZpZ3VyYXRpb24+KEV2ZW50VHlwZXMuQ29uZmlnTG9hZGVkLCB7XHJcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uOiBwYXNzZWRDb25maWcsXHJcbiAgICAgICAgICAgICAgICB3ZWxsa25vd246IHdlbGxrbm93bkVuZFBvaW50cyxcclxuICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgICApXHJcbiAgICAgICAgICAuc3Vic2NyaWJlKFxyXG4gICAgICAgICAgICAoKSA9PiByZXNvbHZlKCksXHJcbiAgICAgICAgICAgICgpID0+IHJlamVjdCgpXHJcbiAgICAgICAgICApO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMucHVibGljRXZlbnRzU2VydmljZS5maXJlRXZlbnQ8UHVibGljQ29uZmlndXJhdGlvbj4oRXZlbnRUeXBlcy5Db25maWdMb2FkZWQsIHtcclxuICAgICAgICAgIGNvbmZpZ3VyYXRpb246IHBhc3NlZENvbmZpZyxcclxuICAgICAgICAgIHdlbGxrbm93bjogbnVsbCxcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG4iXX0=