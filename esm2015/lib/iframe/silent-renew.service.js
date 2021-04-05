import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of, Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthorizedState } from '../authState/authorized-state';
import { ValidationResult } from '../validation/validation-result';
import * as i0 from "@angular/core";
import * as i1 from "../config/config.provider";
import * as i2 from "./existing-iframe.service";
import * as i3 from "../flows/flows.service";
import * as i4 from "../flows/flows-data.service";
import * as i5 from "../authState/auth-state.service";
import * as i6 from "../logging/logger.service";
import * as i7 from "../utils/flowHelper/flow-helper.service";
import * as i8 from "../callback/implicit-flow-callback.service";
import * as i9 from "../callback/intervall.service";
import * as i10 from "./tabs-synchronization.service";
const IFRAME_FOR_SILENT_RENEW_IDENTIFIER = 'myiFrameForSilentRenew';
export class SilentRenewService {
    constructor(configurationProvider, iFrameService, flowsService, flowsDataService, authStateService, loggerService, flowHelper, implicitFlowCallbackService, intervallService, tabsSynchronizationService) {
        this.configurationProvider = configurationProvider;
        this.iFrameService = iFrameService;
        this.flowsService = flowsService;
        this.flowsDataService = flowsDataService;
        this.authStateService = authStateService;
        this.loggerService = loggerService;
        this.flowHelper = flowHelper;
        this.implicitFlowCallbackService = implicitFlowCallbackService;
        this.intervallService = intervallService;
        this.tabsSynchronizationService = tabsSynchronizationService;
        this.refreshSessionWithIFrameCompletedInternal$ = new Subject();
    }
    get refreshSessionWithIFrameCompleted$() {
        return this.refreshSessionWithIFrameCompletedInternal$.asObservable();
    }
    getOrCreateIframe() {
        const existingIframe = this.getExistingIframe();
        if (!existingIframe) {
            return this.iFrameService.addIFrameToWindowBody(IFRAME_FOR_SILENT_RENEW_IDENTIFIER);
        }
        return existingIframe;
    }
    isSilentRenewConfigured() {
        return !this.configurationProvider.openIDConfiguration.useRefreshToken && this.configurationProvider.openIDConfiguration.silentRenew;
    }
    codeFlowCallbackSilentRenewIframe(urlParts) {
        const params = new HttpParams({
            fromString: urlParts[1],
        });
        const error = params.get('error');
        if (error) {
            this.authStateService.updateAndPublishAuthState({
                authorizationState: AuthorizedState.Unauthorized,
                validationResult: ValidationResult.LoginRequired,
                isRenewProcess: true,
            });
            this.flowsService.resetAuthorizationData();
            this.flowsDataService.setNonce('');
            this.intervallService.stopPeriodicallTokenCheck();
            return throwError(error);
        }
        const code = params.get('code');
        const state = params.get('state');
        const sessionState = params.get('session_state');
        const callbackContext = {
            code,
            refreshToken: null,
            state,
            sessionState,
            authResult: null,
            isRenewProcess: true,
            jwtKeys: null,
            validationResult: null,
            existingIdToken: null,
        };
        return this.flowsService.processSilentRenewCodeFlowCallback(callbackContext).pipe(catchError((errorFromFlow) => {
            if (errorFromFlow instanceof HttpErrorResponse && errorFromFlow.status === 504) {
                this.loggerService.logError('processSilentRenewCodeFlowCallback catchError statement re-throw error without any reset. Original error ' + errorFromFlow);
                return throwError(errorFromFlow);
            }
            this.intervallService.stopPeriodicallTokenCheck();
            this.flowsService.resetAuthorizationData();
            return throwError(errorFromFlow);
        }));
    }
    silentRenewEventHandler(e) {
        this.loggerService.logDebug('silentRenewEventHandler');
        if (!e.detail) {
            return;
        }
        const urlParts = e.detail.toString().split('?');
        const params = new HttpParams({
            fromString: urlParts[1],
        });
        const stateFromUrl = params.get('state');
        const currentState = this.flowsDataService.getAuthStateControl();
        if (stateFromUrl !== currentState) {
            this.loggerService.logError(`silentRenewEventHandler > states don't match stateFromUrl: ${stateFromUrl} currentState: ${currentState}`);
            return;
        }
        this.tabsSynchronizationService.isLeaderCheck().then((isLeader) => {
            if (!isLeader)
                return;
            let callback$ = of(null);
            const isCodeFlow = this.flowHelper.isCurrentFlowCodeFlow();
            if (isCodeFlow) {
                callback$ = this.codeFlowCallbackSilentRenewIframe(urlParts);
            }
            else {
                callback$ = this.implicitFlowCallbackService.authorizedImplicitFlowCallback(e.detail);
            }
            callback$.subscribe((callbackContext) => {
                var _a;
                if (((_a = callbackContext === null || callbackContext === void 0 ? void 0 : callbackContext.validationResult) === null || _a === void 0 ? void 0 : _a.state) === ValidationResult.StatesDoNotMatch) {
                    this.loggerService.logError(`silentRenewEventHandler > inside subscribe for codeRequestCallback > states don't match stateFromUrl: ${stateFromUrl} currentState: ${currentState}`);
                    return;
                }
                this.refreshSessionWithIFrameCompletedInternal$.next(callbackContext);
                this.flowsDataService.resetSilentRenewRunning();
                this.tabsSynchronizationService.sendSilentRenewFinishedNotification();
            }, (err) => {
                if (err instanceof HttpErrorResponse && err.status === 504) {
                    this.loggerService.logError('silentRenewEventHandler from Callback catch timeout error so we finish this process. Original error ' + err);
                    return;
                }
                this.loggerService.logError('Error: ' + err);
                this.refreshSessionWithIFrameCompletedInternal$.next(null);
                this.flowsDataService.resetSilentRenewRunning();
            });
        });
    }
    getExistingIframe() {
        return this.iFrameService.getExistingIFrame(IFRAME_FOR_SILENT_RENEW_IDENTIFIER);
    }
}
SilentRenewService.ɵfac = function SilentRenewService_Factory(t) { return new (t || SilentRenewService)(i0.ɵɵinject(i1.ConfigurationProvider), i0.ɵɵinject(i2.IFrameService), i0.ɵɵinject(i3.FlowsService), i0.ɵɵinject(i4.FlowsDataService), i0.ɵɵinject(i5.AuthStateService), i0.ɵɵinject(i6.LoggerService), i0.ɵɵinject(i7.FlowHelper), i0.ɵɵinject(i8.ImplicitFlowCallbackService), i0.ɵɵinject(i9.IntervallService), i0.ɵɵinject(i10.TabsSynchronizationService)); };
SilentRenewService.ɵprov = i0.ɵɵdefineInjectable({ token: SilentRenewService, factory: SilentRenewService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(SilentRenewService, [{
        type: Injectable
    }], function () { return [{ type: i1.ConfigurationProvider }, { type: i2.IFrameService }, { type: i3.FlowsService }, { type: i4.FlowsDataService }, { type: i5.AuthStateService }, { type: i6.LoggerService }, { type: i7.FlowHelper }, { type: i8.ImplicitFlowCallbackService }, { type: i9.IntervallService }, { type: i10.TabsSynchronizationService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lsZW50LXJlbmV3LnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy8iLCJzb3VyY2VzIjpbImxpYi9pZnJhbWUvc2lsZW50LXJlbmV3LnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGlCQUFpQixFQUFFLFVBQVUsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3JFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQy9DLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUU1QyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFTaEUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0saUNBQWlDLENBQUM7Ozs7Ozs7Ozs7OztBQUluRSxNQUFNLGtDQUFrQyxHQUFHLHdCQUF3QixDQUFDO0FBR3BFLE1BQU0sT0FBTyxrQkFBa0I7SUFPN0IsWUFDVSxxQkFBNEMsRUFDNUMsYUFBNEIsRUFDNUIsWUFBMEIsRUFDMUIsZ0JBQWtDLEVBQ2xDLGdCQUFrQyxFQUNsQyxhQUE0QixFQUM1QixVQUFzQixFQUN0QiwyQkFBd0QsRUFDeEQsZ0JBQWtDLEVBQ2xDLDBCQUFzRDtRQVR0RCwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1FBQzVDLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBQzFCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUM1QixlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQ3RCLGdDQUEyQixHQUEzQiwyQkFBMkIsQ0FBNkI7UUFDeEQscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQywrQkFBMEIsR0FBMUIsMEJBQTBCLENBQTRCO1FBaEJ4RCwrQ0FBMEMsR0FBRyxJQUFJLE9BQU8sRUFBbUIsQ0FBQztJQWlCakYsQ0FBQztJQWZKLElBQUksa0NBQWtDO1FBQ3BDLE9BQU8sSUFBSSxDQUFDLDBDQUEwQyxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ3hFLENBQUM7SUFlRCxpQkFBaUI7UUFDZixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUVoRCxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ25CLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO1NBQ3JGO1FBRUQsT0FBTyxjQUFjLENBQUM7SUFDeEIsQ0FBQztJQUVELHVCQUF1QjtRQUNyQixPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLG1CQUFtQixDQUFDLGVBQWUsSUFBSSxJQUFJLENBQUMscUJBQXFCLENBQUMsbUJBQW1CLENBQUMsV0FBVyxDQUFDO0lBQ3ZJLENBQUM7SUFFRCxpQ0FBaUMsQ0FBQyxRQUFRO1FBQ3hDLE1BQU0sTUFBTSxHQUFHLElBQUksVUFBVSxDQUFDO1lBQzVCLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1NBQ3hCLENBQUMsQ0FBQztRQUVILE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFbEMsSUFBSSxLQUFLLEVBQUU7WUFDVCxJQUFJLENBQUMsZ0JBQWdCLENBQUMseUJBQXlCLENBQUM7Z0JBQzlDLGtCQUFrQixFQUFFLGVBQWUsQ0FBQyxZQUFZO2dCQUNoRCxnQkFBZ0IsRUFBRSxnQkFBZ0IsQ0FBQyxhQUFhO2dCQUNoRCxjQUFjLEVBQUUsSUFBSTthQUNyQixDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsWUFBWSxDQUFDLHNCQUFzQixFQUFFLENBQUM7WUFDM0MsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNuQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMseUJBQXlCLEVBQUUsQ0FBQztZQUNsRCxPQUFPLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUMxQjtRQUVELE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDaEMsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsQyxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBRWpELE1BQU0sZUFBZSxHQUFHO1lBQ3RCLElBQUk7WUFDSixZQUFZLEVBQUUsSUFBSTtZQUNsQixLQUFLO1lBQ0wsWUFBWTtZQUNaLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLGNBQWMsRUFBRSxJQUFJO1lBQ3BCLE9BQU8sRUFBRSxJQUFJO1lBQ2IsZ0JBQWdCLEVBQUUsSUFBSTtZQUN0QixlQUFlLEVBQUUsSUFBSTtTQUN0QixDQUFDO1FBRUYsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLGtDQUFrQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLElBQUksQ0FDL0UsVUFBVSxDQUFDLENBQUMsYUFBYSxFQUFFLEVBQUU7WUFDM0IsSUFBSSxhQUFhLFlBQVksaUJBQWlCLElBQUksYUFBYSxDQUFDLE1BQU0sS0FBSyxHQUFHLEVBQUU7Z0JBQzlFLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUN6QiwyR0FBMkcsR0FBRyxhQUFhLENBQzVILENBQUM7Z0JBQ0YsT0FBTyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUM7YUFDbEM7WUFDRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMseUJBQXlCLEVBQUUsQ0FBQztZQUNsRCxJQUFJLENBQUMsWUFBWSxDQUFDLHNCQUFzQixFQUFFLENBQUM7WUFDM0MsT0FBTyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDbkMsQ0FBQyxDQUFDLENBQ0gsQ0FBQztJQUNKLENBQUM7SUFFRCx1QkFBdUIsQ0FBQyxDQUFjO1FBQ3BDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDdkQsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUU7WUFDYixPQUFPO1NBQ1I7UUFFRCxNQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNoRCxNQUFNLE1BQU0sR0FBRyxJQUFJLFVBQVUsQ0FBQztZQUM1QixVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztTQUN4QixDQUFDLENBQUM7UUFFSCxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3pDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBRWpFLElBQUksWUFBWSxLQUFLLFlBQVksRUFBRTtZQUNqQyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FDekIsOERBQThELFlBQVksa0JBQWtCLFlBQVksRUFBRSxDQUMzRyxDQUFDO1lBRUYsT0FBTztTQUNSO1FBRUQsSUFBSSxDQUFDLDBCQUEwQixDQUFDLGFBQWEsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFO1lBQ2hFLElBQUksQ0FBQyxRQUFRO2dCQUFFLE9BQU87WUFFdEIsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXpCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUUzRCxJQUFJLFVBQVUsRUFBRTtnQkFDZCxTQUFTLEdBQUcsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQzlEO2lCQUFNO2dCQUNMLFNBQVMsR0FBRyxJQUFJLENBQUMsMkJBQTJCLENBQUMsOEJBQThCLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ3ZGO1lBRUQsU0FBUyxDQUFDLFNBQVMsQ0FDakIsQ0FBQyxlQUFlLEVBQUUsRUFBRTs7Z0JBQ2xCLElBQUksT0FBQSxlQUFlLGFBQWYsZUFBZSx1QkFBZixlQUFlLENBQUUsZ0JBQWdCLDBDQUFFLEtBQUssTUFBSyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsRUFBRTtvQkFDbEYsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQ3pCLHlHQUF5RyxZQUFZLGtCQUFrQixZQUFZLEVBQUUsQ0FDdEosQ0FBQztvQkFFRixPQUFPO2lCQUNSO2dCQUVELElBQUksQ0FBQywwQ0FBMEMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQ3RFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO2dCQUNoRCxJQUFJLENBQUMsMEJBQTBCLENBQUMsbUNBQW1DLEVBQUUsQ0FBQztZQUN4RSxDQUFDLEVBQ0QsQ0FBQyxHQUFRLEVBQUUsRUFBRTtnQkFDWCxJQUFJLEdBQUcsWUFBWSxpQkFBaUIsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBRTtvQkFDMUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQ3pCLHNHQUFzRyxHQUFHLEdBQUcsQ0FDN0csQ0FBQztvQkFDRixPQUFPO2lCQUNSO2dCQUNELElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDN0MsSUFBSSxDQUFDLDBDQUEwQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDM0QsSUFBSSxDQUFDLGdCQUFnQixDQUFDLHVCQUF1QixFQUFFLENBQUM7WUFDbEQsQ0FBQyxDQUNGLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTyxpQkFBaUI7UUFDdkIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLGtDQUFrQyxDQUFDLENBQUM7SUFDbEYsQ0FBQzs7b0ZBdEpVLGtCQUFrQjswREFBbEIsa0JBQWtCLFdBQWxCLGtCQUFrQjtrREFBbEIsa0JBQWtCO2NBRDlCLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIdHRwRXJyb3JSZXNwb25zZSwgSHR0cFBhcmFtcyB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcclxuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBvZiwgU3ViamVjdCwgdGhyb3dFcnJvciB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBjYXRjaEVycm9yIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQgeyBBdXRoU3RhdGVTZXJ2aWNlIH0gZnJvbSAnLi4vYXV0aFN0YXRlL2F1dGgtc3RhdGUuc2VydmljZSc7XHJcbmltcG9ydCB7IEF1dGhvcml6ZWRTdGF0ZSB9IGZyb20gJy4uL2F1dGhTdGF0ZS9hdXRob3JpemVkLXN0YXRlJztcclxuaW1wb3J0IHsgSW1wbGljaXRGbG93Q2FsbGJhY2tTZXJ2aWNlIH0gZnJvbSAnLi4vY2FsbGJhY2svaW1wbGljaXQtZmxvdy1jYWxsYmFjay5zZXJ2aWNlJztcclxuaW1wb3J0IHsgSW50ZXJ2YWxsU2VydmljZSB9IGZyb20gJy4uL2NhbGxiYWNrL2ludGVydmFsbC5zZXJ2aWNlJztcclxuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi4vY29uZmlnL2NvbmZpZy5wcm92aWRlcic7XHJcbmltcG9ydCB7IENhbGxiYWNrQ29udGV4dCB9IGZyb20gJy4uL2Zsb3dzL2NhbGxiYWNrLWNvbnRleHQnO1xyXG5pbXBvcnQgeyBGbG93c0RhdGFTZXJ2aWNlIH0gZnJvbSAnLi4vZmxvd3MvZmxvd3MtZGF0YS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgRmxvd3NTZXJ2aWNlIH0gZnJvbSAnLi4vZmxvd3MvZmxvd3Muc2VydmljZSc7XHJcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgRmxvd0hlbHBlciB9IGZyb20gJy4uL3V0aWxzL2Zsb3dIZWxwZXIvZmxvdy1oZWxwZXIuc2VydmljZSc7XHJcbmltcG9ydCB7IFZhbGlkYXRpb25SZXN1bHQgfSBmcm9tICcuLi92YWxpZGF0aW9uL3ZhbGlkYXRpb24tcmVzdWx0JztcclxuaW1wb3J0IHsgSUZyYW1lU2VydmljZSB9IGZyb20gJy4vZXhpc3RpbmctaWZyYW1lLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBUYWJzU3luY2hyb25pemF0aW9uU2VydmljZSB9IGZyb20gJy4vdGFicy1zeW5jaHJvbml6YXRpb24uc2VydmljZSc7XHJcblxyXG5jb25zdCBJRlJBTUVfRk9SX1NJTEVOVF9SRU5FV19JREVOVElGSUVSID0gJ215aUZyYW1lRm9yU2lsZW50UmVuZXcnO1xyXG5cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgU2lsZW50UmVuZXdTZXJ2aWNlIHtcclxuICBwcml2YXRlIHJlZnJlc2hTZXNzaW9uV2l0aElGcmFtZUNvbXBsZXRlZEludGVybmFsJCA9IG5ldyBTdWJqZWN0PENhbGxiYWNrQ29udGV4dD4oKTtcclxuXHJcbiAgZ2V0IHJlZnJlc2hTZXNzaW9uV2l0aElGcmFtZUNvbXBsZXRlZCQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5yZWZyZXNoU2Vzc2lvbldpdGhJRnJhbWVDb21wbGV0ZWRJbnRlcm5hbCQuYXNPYnNlcnZhYmxlKCk7XHJcbiAgfVxyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgY29uZmlndXJhdGlvblByb3ZpZGVyOiBDb25maWd1cmF0aW9uUHJvdmlkZXIsXHJcbiAgICBwcml2YXRlIGlGcmFtZVNlcnZpY2U6IElGcmFtZVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGZsb3dzU2VydmljZTogRmxvd3NTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBmbG93c0RhdGFTZXJ2aWNlOiBGbG93c0RhdGFTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBhdXRoU3RhdGVTZXJ2aWNlOiBBdXRoU3RhdGVTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBsb2dnZXJTZXJ2aWNlOiBMb2dnZXJTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBmbG93SGVscGVyOiBGbG93SGVscGVyLFxyXG4gICAgcHJpdmF0ZSBpbXBsaWNpdEZsb3dDYWxsYmFja1NlcnZpY2U6IEltcGxpY2l0Rmxvd0NhbGxiYWNrU2VydmljZSxcclxuICAgIHByaXZhdGUgaW50ZXJ2YWxsU2VydmljZTogSW50ZXJ2YWxsU2VydmljZSxcclxuICAgIHByaXZhdGUgdGFic1N5bmNocm9uaXphdGlvblNlcnZpY2U6IFRhYnNTeW5jaHJvbml6YXRpb25TZXJ2aWNlXHJcbiAgKSB7fVxyXG5cclxuICBnZXRPckNyZWF0ZUlmcmFtZSgpOiBIVE1MSUZyYW1lRWxlbWVudCB7XHJcbiAgICBjb25zdCBleGlzdGluZ0lmcmFtZSA9IHRoaXMuZ2V0RXhpc3RpbmdJZnJhbWUoKTtcclxuXHJcbiAgICBpZiAoIWV4aXN0aW5nSWZyYW1lKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmlGcmFtZVNlcnZpY2UuYWRkSUZyYW1lVG9XaW5kb3dCb2R5KElGUkFNRV9GT1JfU0lMRU5UX1JFTkVXX0lERU5USUZJRVIpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBleGlzdGluZ0lmcmFtZTtcclxuICB9XHJcblxyXG4gIGlzU2lsZW50UmVuZXdDb25maWd1cmVkKCkge1xyXG4gICAgcmV0dXJuICF0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnVzZVJlZnJlc2hUb2tlbiAmJiB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnNpbGVudFJlbmV3O1xyXG4gIH1cclxuXHJcbiAgY29kZUZsb3dDYWxsYmFja1NpbGVudFJlbmV3SWZyYW1lKHVybFBhcnRzKSB7XHJcbiAgICBjb25zdCBwYXJhbXMgPSBuZXcgSHR0cFBhcmFtcyh7XHJcbiAgICAgIGZyb21TdHJpbmc6IHVybFBhcnRzWzFdLFxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgZXJyb3IgPSBwYXJhbXMuZ2V0KCdlcnJvcicpO1xyXG5cclxuICAgIGlmIChlcnJvcikge1xyXG4gICAgICB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UudXBkYXRlQW5kUHVibGlzaEF1dGhTdGF0ZSh7XHJcbiAgICAgICAgYXV0aG9yaXphdGlvblN0YXRlOiBBdXRob3JpemVkU3RhdGUuVW5hdXRob3JpemVkLFxyXG4gICAgICAgIHZhbGlkYXRpb25SZXN1bHQ6IFZhbGlkYXRpb25SZXN1bHQuTG9naW5SZXF1aXJlZCxcclxuICAgICAgICBpc1JlbmV3UHJvY2VzczogdHJ1ZSxcclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMuZmxvd3NTZXJ2aWNlLnJlc2V0QXV0aG9yaXphdGlvbkRhdGEoKTtcclxuICAgICAgdGhpcy5mbG93c0RhdGFTZXJ2aWNlLnNldE5vbmNlKCcnKTtcclxuICAgICAgdGhpcy5pbnRlcnZhbGxTZXJ2aWNlLnN0b3BQZXJpb2RpY2FsbFRva2VuQ2hlY2soKTtcclxuICAgICAgcmV0dXJuIHRocm93RXJyb3IoZXJyb3IpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNvZGUgPSBwYXJhbXMuZ2V0KCdjb2RlJyk7XHJcbiAgICBjb25zdCBzdGF0ZSA9IHBhcmFtcy5nZXQoJ3N0YXRlJyk7XHJcbiAgICBjb25zdCBzZXNzaW9uU3RhdGUgPSBwYXJhbXMuZ2V0KCdzZXNzaW9uX3N0YXRlJyk7XHJcblxyXG4gICAgY29uc3QgY2FsbGJhY2tDb250ZXh0ID0ge1xyXG4gICAgICBjb2RlLFxyXG4gICAgICByZWZyZXNoVG9rZW46IG51bGwsXHJcbiAgICAgIHN0YXRlLFxyXG4gICAgICBzZXNzaW9uU3RhdGUsXHJcbiAgICAgIGF1dGhSZXN1bHQ6IG51bGwsXHJcbiAgICAgIGlzUmVuZXdQcm9jZXNzOiB0cnVlLFxyXG4gICAgICBqd3RLZXlzOiBudWxsLFxyXG4gICAgICB2YWxpZGF0aW9uUmVzdWx0OiBudWxsLFxyXG4gICAgICBleGlzdGluZ0lkVG9rZW46IG51bGwsXHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiB0aGlzLmZsb3dzU2VydmljZS5wcm9jZXNzU2lsZW50UmVuZXdDb2RlRmxvd0NhbGxiYWNrKGNhbGxiYWNrQ29udGV4dCkucGlwZShcclxuICAgICAgY2F0Y2hFcnJvcigoZXJyb3JGcm9tRmxvdykgPT4ge1xyXG4gICAgICAgIGlmIChlcnJvckZyb21GbG93IGluc3RhbmNlb2YgSHR0cEVycm9yUmVzcG9uc2UgJiYgZXJyb3JGcm9tRmxvdy5zdGF0dXMgPT09IDUwNCkge1xyXG4gICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKFxyXG4gICAgICAgICAgICAncHJvY2Vzc1NpbGVudFJlbmV3Q29kZUZsb3dDYWxsYmFjayBjYXRjaEVycm9yIHN0YXRlbWVudCByZS10aHJvdyBlcnJvciB3aXRob3V0IGFueSByZXNldC4gT3JpZ2luYWwgZXJyb3IgJyArIGVycm9yRnJvbUZsb3dcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvckZyb21GbG93KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5pbnRlcnZhbGxTZXJ2aWNlLnN0b3BQZXJpb2RpY2FsbFRva2VuQ2hlY2soKTtcclxuICAgICAgICB0aGlzLmZsb3dzU2VydmljZS5yZXNldEF1dGhvcml6YXRpb25EYXRhKCk7XHJcbiAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoZXJyb3JGcm9tRmxvdyk7XHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgc2lsZW50UmVuZXdFdmVudEhhbmRsZXIoZTogQ3VzdG9tRXZlbnQpIHtcclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zygnc2lsZW50UmVuZXdFdmVudEhhbmRsZXInKTtcclxuICAgIGlmICghZS5kZXRhaWwpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHVybFBhcnRzID0gZS5kZXRhaWwudG9TdHJpbmcoKS5zcGxpdCgnPycpO1xyXG4gICAgY29uc3QgcGFyYW1zID0gbmV3IEh0dHBQYXJhbXMoe1xyXG4gICAgICBmcm9tU3RyaW5nOiB1cmxQYXJ0c1sxXSxcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IHN0YXRlRnJvbVVybCA9IHBhcmFtcy5nZXQoJ3N0YXRlJyk7XHJcbiAgICBjb25zdCBjdXJyZW50U3RhdGUgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuZ2V0QXV0aFN0YXRlQ29udHJvbCgpO1xyXG5cclxuICAgIGlmIChzdGF0ZUZyb21VcmwgIT09IGN1cnJlbnRTdGF0ZSkge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoXHJcbiAgICAgICAgYHNpbGVudFJlbmV3RXZlbnRIYW5kbGVyID4gc3RhdGVzIGRvbid0IG1hdGNoIHN0YXRlRnJvbVVybDogJHtzdGF0ZUZyb21Vcmx9IGN1cnJlbnRTdGF0ZTogJHtjdXJyZW50U3RhdGV9YFxyXG4gICAgICApO1xyXG5cclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudGFic1N5bmNocm9uaXphdGlvblNlcnZpY2UuaXNMZWFkZXJDaGVjaygpLnRoZW4oKGlzTGVhZGVyKSA9PiB7XHJcbiAgICAgIGlmICghaXNMZWFkZXIpIHJldHVybjtcclxuXHJcbiAgICAgIGxldCBjYWxsYmFjayQgPSBvZihudWxsKTtcclxuXHJcbiAgICAgIGNvbnN0IGlzQ29kZUZsb3cgPSB0aGlzLmZsb3dIZWxwZXIuaXNDdXJyZW50Rmxvd0NvZGVGbG93KCk7XHJcblxyXG4gICAgICBpZiAoaXNDb2RlRmxvdykge1xyXG4gICAgICAgIGNhbGxiYWNrJCA9IHRoaXMuY29kZUZsb3dDYWxsYmFja1NpbGVudFJlbmV3SWZyYW1lKHVybFBhcnRzKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjYWxsYmFjayQgPSB0aGlzLmltcGxpY2l0Rmxvd0NhbGxiYWNrU2VydmljZS5hdXRob3JpemVkSW1wbGljaXRGbG93Q2FsbGJhY2soZS5kZXRhaWwpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjYWxsYmFjayQuc3Vic2NyaWJlKFxyXG4gICAgICAgIChjYWxsYmFja0NvbnRleHQpID0+IHtcclxuICAgICAgICAgIGlmIChjYWxsYmFja0NvbnRleHQ/LnZhbGlkYXRpb25SZXN1bHQ/LnN0YXRlID09PSBWYWxpZGF0aW9uUmVzdWx0LlN0YXRlc0RvTm90TWF0Y2gpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKFxyXG4gICAgICAgICAgICAgIGBzaWxlbnRSZW5ld0V2ZW50SGFuZGxlciA+IGluc2lkZSBzdWJzY3JpYmUgZm9yIGNvZGVSZXF1ZXN0Q2FsbGJhY2sgPiBzdGF0ZXMgZG9uJ3QgbWF0Y2ggc3RhdGVGcm9tVXJsOiAke3N0YXRlRnJvbVVybH0gY3VycmVudFN0YXRlOiAke2N1cnJlbnRTdGF0ZX1gXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgdGhpcy5yZWZyZXNoU2Vzc2lvbldpdGhJRnJhbWVDb21wbGV0ZWRJbnRlcm5hbCQubmV4dChjYWxsYmFja0NvbnRleHQpO1xyXG4gICAgICAgICAgdGhpcy5mbG93c0RhdGFTZXJ2aWNlLnJlc2V0U2lsZW50UmVuZXdSdW5uaW5nKCk7XHJcbiAgICAgICAgICB0aGlzLnRhYnNTeW5jaHJvbml6YXRpb25TZXJ2aWNlLnNlbmRTaWxlbnRSZW5ld0ZpbmlzaGVkTm90aWZpY2F0aW9uKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAoZXJyOiBhbnkpID0+IHtcclxuICAgICAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBIdHRwRXJyb3JSZXNwb25zZSAmJiBlcnIuc3RhdHVzID09PSA1MDQpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKFxyXG4gICAgICAgICAgICAgICdzaWxlbnRSZW5ld0V2ZW50SGFuZGxlciBmcm9tIENhbGxiYWNrIGNhdGNoIHRpbWVvdXQgZXJyb3Igc28gd2UgZmluaXNoIHRoaXMgcHJvY2Vzcy4gT3JpZ2luYWwgZXJyb3IgJyArIGVyclxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoJ0Vycm9yOiAnICsgZXJyKTtcclxuICAgICAgICAgIHRoaXMucmVmcmVzaFNlc3Npb25XaXRoSUZyYW1lQ29tcGxldGVkSW50ZXJuYWwkLm5leHQobnVsbCk7XHJcbiAgICAgICAgICB0aGlzLmZsb3dzRGF0YVNlcnZpY2UucmVzZXRTaWxlbnRSZW5ld1J1bm5pbmcoKTtcclxuICAgICAgICB9XHJcbiAgICAgICk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0RXhpc3RpbmdJZnJhbWUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5pRnJhbWVTZXJ2aWNlLmdldEV4aXN0aW5nSUZyYW1lKElGUkFNRV9GT1JfU0lMRU5UX1JFTkVXX0lERU5USUZJRVIpO1xyXG4gIH1cclxufVxyXG4iXX0=