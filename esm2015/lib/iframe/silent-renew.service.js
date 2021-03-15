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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lsZW50LXJlbmV3LnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy8iLCJzb3VyY2VzIjpbImxpYi9pZnJhbWUvc2lsZW50LXJlbmV3LnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLGlCQUFpQixFQUFFLFVBQVUsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ25FLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQy9DLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUU1QyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFTaEUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0saUNBQWlDLENBQUM7Ozs7Ozs7Ozs7OztBQUluRSxNQUFNLGtDQUFrQyxHQUFHLHdCQUF3QixDQUFDO0FBR3BFLE1BQU0sT0FBTyxrQkFBa0I7SUFPN0IsWUFDVSxxQkFBNEMsRUFDNUMsYUFBNEIsRUFDNUIsWUFBMEIsRUFDMUIsZ0JBQWtDLEVBQ2xDLGdCQUFrQyxFQUNsQyxhQUE0QixFQUM1QixVQUFzQixFQUN0QiwyQkFBd0QsRUFDeEQsZ0JBQWtDLEVBQ2xDLDBCQUFzRDtRQVR0RCwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1FBQzVDLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBQzFCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUM1QixlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQ3RCLGdDQUEyQixHQUEzQiwyQkFBMkIsQ0FB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QixrQkFBa0I7a0RBQWxCLGtCQUFrQjtjQUQ5QixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtIdHRwRXJyb3JSZXNwb25zZSwgSHR0cFBhcmFtc30gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xyXG5pbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IG9mLCBTdWJqZWN0LCB0aHJvd0Vycm9yIH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IGNhdGNoRXJyb3IgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcbmltcG9ydCB7IEF1dGhTdGF0ZVNlcnZpY2UgfSBmcm9tICcuLi9hdXRoU3RhdGUvYXV0aC1zdGF0ZS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgQXV0aG9yaXplZFN0YXRlIH0gZnJvbSAnLi4vYXV0aFN0YXRlL2F1dGhvcml6ZWQtc3RhdGUnO1xyXG5pbXBvcnQgeyBJbXBsaWNpdEZsb3dDYWxsYmFja1NlcnZpY2UgfSBmcm9tICcuLi9jYWxsYmFjay9pbXBsaWNpdC1mbG93LWNhbGxiYWNrLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBJbnRlcnZhbGxTZXJ2aWNlIH0gZnJvbSAnLi4vY2FsbGJhY2svaW50ZXJ2YWxsLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuLi9jb25maWcvY29uZmlnLnByb3ZpZGVyJztcclxuaW1wb3J0IHsgQ2FsbGJhY2tDb250ZXh0IH0gZnJvbSAnLi4vZmxvd3MvY2FsbGJhY2stY29udGV4dCc7XHJcbmltcG9ydCB7IEZsb3dzRGF0YVNlcnZpY2UgfSBmcm9tICcuLi9mbG93cy9mbG93cy1kYXRhLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBGbG93c1NlcnZpY2UgfSBmcm9tICcuLi9mbG93cy9mbG93cy5zZXJ2aWNlJztcclxuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBGbG93SGVscGVyIH0gZnJvbSAnLi4vdXRpbHMvZmxvd0hlbHBlci9mbG93LWhlbHBlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgVmFsaWRhdGlvblJlc3VsdCB9IGZyb20gJy4uL3ZhbGlkYXRpb24vdmFsaWRhdGlvbi1yZXN1bHQnO1xyXG5pbXBvcnQgeyBJRnJhbWVTZXJ2aWNlIH0gZnJvbSAnLi9leGlzdGluZy1pZnJhbWUuc2VydmljZSc7XHJcbmltcG9ydCB7IFRhYnNTeW5jaHJvbml6YXRpb25TZXJ2aWNlIH0gZnJvbSAnLi90YWJzLXN5bmNocm9uaXphdGlvbi5zZXJ2aWNlJztcclxuXHJcbmNvbnN0IElGUkFNRV9GT1JfU0lMRU5UX1JFTkVXX0lERU5USUZJRVIgPSAnbXlpRnJhbWVGb3JTaWxlbnRSZW5ldyc7XHJcblxyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBTaWxlbnRSZW5ld1NlcnZpY2Uge1xyXG4gIHByaXZhdGUgcmVmcmVzaFNlc3Npb25XaXRoSUZyYW1lQ29tcGxldGVkSW50ZXJuYWwkID0gbmV3IFN1YmplY3Q8Q2FsbGJhY2tDb250ZXh0PigpO1xyXG5cclxuICBnZXQgcmVmcmVzaFNlc3Npb25XaXRoSUZyYW1lQ29tcGxldGVkJCgpIHtcclxuICAgIHJldHVybiB0aGlzLnJlZnJlc2hTZXNzaW9uV2l0aElGcmFtZUNvbXBsZXRlZEludGVybmFsJC5hc09ic2VydmFibGUoKTtcclxuICB9XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlcixcclxuICAgIHByaXZhdGUgaUZyYW1lU2VydmljZTogSUZyYW1lU2VydmljZSxcclxuICAgIHByaXZhdGUgZmxvd3NTZXJ2aWNlOiBGbG93c1NlcnZpY2UsXHJcbiAgICBwcml2YXRlIGZsb3dzRGF0YVNlcnZpY2U6IEZsb3dzRGF0YVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGF1dGhTdGF0ZVNlcnZpY2U6IEF1dGhTdGF0ZVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGZsb3dIZWxwZXI6IEZsb3dIZWxwZXIsXHJcbiAgICBwcml2YXRlIGltcGxpY2l0Rmxvd0NhbGxiYWNrU2VydmljZTogSW1wbGljaXRGbG93Q2FsbGJhY2tTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBpbnRlcnZhbGxTZXJ2aWNlOiBJbnRlcnZhbGxTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSB0YWJzU3luY2hyb25pemF0aW9uU2VydmljZTogVGFic1N5bmNocm9uaXphdGlvblNlcnZpY2VcclxuICApIHt9XHJcblxyXG4gIGdldE9yQ3JlYXRlSWZyYW1lKCk6IEhUTUxJRnJhbWVFbGVtZW50IHtcclxuICAgIGNvbnN0IGV4aXN0aW5nSWZyYW1lID0gdGhpcy5nZXRFeGlzdGluZ0lmcmFtZSgpO1xyXG5cclxuICAgIGlmICghZXhpc3RpbmdJZnJhbWUpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuaUZyYW1lU2VydmljZS5hZGRJRnJhbWVUb1dpbmRvd0JvZHkoSUZSQU1FX0ZPUl9TSUxFTlRfUkVORVdfSURFTlRJRklFUik7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGV4aXN0aW5nSWZyYW1lO1xyXG4gIH1cclxuXHJcbiAgaXNTaWxlbnRSZW5ld0NvbmZpZ3VyZWQoKSB7XHJcbiAgICByZXR1cm4gIXRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24udXNlUmVmcmVzaFRva2VuICYmIHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uc2lsZW50UmVuZXc7XHJcbiAgfVxyXG5cclxuICBjb2RlRmxvd0NhbGxiYWNrU2lsZW50UmVuZXdJZnJhbWUodXJsUGFydHMpIHtcclxuICAgIGNvbnN0IHBhcmFtcyA9IG5ldyBIdHRwUGFyYW1zKHtcclxuICAgICAgZnJvbVN0cmluZzogdXJsUGFydHNbMV0sXHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBlcnJvciA9IHBhcmFtcy5nZXQoJ2Vycm9yJyk7XHJcblxyXG4gICAgaWYgKGVycm9yKSB7XHJcbiAgICAgIHRoaXMuYXV0aFN0YXRlU2VydmljZS51cGRhdGVBbmRQdWJsaXNoQXV0aFN0YXRlKHtcclxuICAgICAgICBhdXRob3JpemF0aW9uU3RhdGU6IEF1dGhvcml6ZWRTdGF0ZS5VbmF1dGhvcml6ZWQsXHJcbiAgICAgICAgdmFsaWRhdGlvblJlc3VsdDogVmFsaWRhdGlvblJlc3VsdC5Mb2dpblJlcXVpcmVkLFxyXG4gICAgICAgIGlzUmVuZXdQcm9jZXNzOiB0cnVlLFxyXG4gICAgICB9KTtcclxuICAgICAgdGhpcy5mbG93c1NlcnZpY2UucmVzZXRBdXRob3JpemF0aW9uRGF0YSgpO1xyXG4gICAgICB0aGlzLmZsb3dzRGF0YVNlcnZpY2Uuc2V0Tm9uY2UoJycpO1xyXG4gICAgICB0aGlzLmludGVydmFsbFNlcnZpY2Uuc3RvcFBlcmlvZGljYWxsVG9rZW5DaGVjaygpO1xyXG4gICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvcik7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY29kZSA9IHBhcmFtcy5nZXQoJ2NvZGUnKTtcclxuICAgIGNvbnN0IHN0YXRlID0gcGFyYW1zLmdldCgnc3RhdGUnKTtcclxuICAgIGNvbnN0IHNlc3Npb25TdGF0ZSA9IHBhcmFtcy5nZXQoJ3Nlc3Npb25fc3RhdGUnKTtcclxuXHJcbiAgICBjb25zdCBjYWxsYmFja0NvbnRleHQgPSB7XHJcbiAgICAgIGNvZGUsXHJcbiAgICAgIHJlZnJlc2hUb2tlbjogbnVsbCxcclxuICAgICAgc3RhdGUsXHJcbiAgICAgIHNlc3Npb25TdGF0ZSxcclxuICAgICAgYXV0aFJlc3VsdDogbnVsbCxcclxuICAgICAgaXNSZW5ld1Byb2Nlc3M6IHRydWUsXHJcbiAgICAgIGp3dEtleXM6IG51bGwsXHJcbiAgICAgIHZhbGlkYXRpb25SZXN1bHQ6IG51bGwsXHJcbiAgICAgIGV4aXN0aW5nSWRUb2tlbjogbnVsbCxcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuZmxvd3NTZXJ2aWNlLnByb2Nlc3NTaWxlbnRSZW5ld0NvZGVGbG93Q2FsbGJhY2soY2FsbGJhY2tDb250ZXh0KS5waXBlKFxyXG4gICAgICBjYXRjaEVycm9yKChlcnJvckZyb21GbG93KSA9PiB7XHJcbiAgICAgICAgaWYgKGVycm9yRnJvbUZsb3cgaW5zdGFuY2VvZiBIdHRwRXJyb3JSZXNwb25zZSAmJiBlcnJvckZyb21GbG93LnN0YXR1cyA9PT0gNTA0KXtcclxuICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcigncHJvY2Vzc1NpbGVudFJlbmV3Q29kZUZsb3dDYWxsYmFjayBjYXRjaEVycm9yIHN0YXRlbWVudCByZS10aHJvdyBlcnJvciB3aXRob3V0IGFueSByZXNldC4gT3JpZ2luYWwgZXJyb3IgJyArIGVycm9yRnJvbUZsb3cpO1xyXG4gICAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoZXJyb3JGcm9tRmxvdyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmludGVydmFsbFNlcnZpY2Uuc3RvcFBlcmlvZGljYWxsVG9rZW5DaGVjaygpO1xyXG4gICAgICAgIHRoaXMuZmxvd3NTZXJ2aWNlLnJlc2V0QXV0aG9yaXphdGlvbkRhdGEoKTtcclxuICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvckZyb21GbG93KTtcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBzaWxlbnRSZW5ld0V2ZW50SGFuZGxlcihlOiBDdXN0b21FdmVudCkge1xyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdzaWxlbnRSZW5ld0V2ZW50SGFuZGxlcicpO1xyXG4gICAgaWYgKCFlLmRldGFpbCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdXJsUGFydHMgPSBlLmRldGFpbC50b1N0cmluZygpLnNwbGl0KCc/Jyk7XHJcbiAgICBjb25zdCBwYXJhbXMgPSBuZXcgSHR0cFBhcmFtcyh7XHJcbiAgICAgIGZyb21TdHJpbmc6IHVybFBhcnRzWzFdLFxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3Qgc3RhdGVGcm9tVXJsID0gcGFyYW1zLmdldCgnc3RhdGUnKTtcclxuICAgIGNvbnN0IGN1cnJlbnRTdGF0ZSA9IHRoaXMuZmxvd3NEYXRhU2VydmljZS5nZXRBdXRoU3RhdGVDb250cm9sKCk7XHJcblxyXG4gICAgaWYgKHN0YXRlRnJvbVVybCAhPT0gY3VycmVudFN0YXRlKSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihcclxuICAgICAgICBgc2lsZW50UmVuZXdFdmVudEhhbmRsZXIgPiBzdGF0ZXMgZG9uJ3QgbWF0Y2ggc3RhdGVGcm9tVXJsOiAke3N0YXRlRnJvbVVybH0gY3VycmVudFN0YXRlOiAke2N1cnJlbnRTdGF0ZX1gXHJcbiAgICAgICk7XHJcblxyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy50YWJzU3luY2hyb25pemF0aW9uU2VydmljZS5pc0xlYWRlckNoZWNrKCkudGhlbigoaXNMZWFkZXIpID0+IHtcclxuICAgICAgaWYgKCFpc0xlYWRlcikgcmV0dXJuO1xyXG5cclxuICAgICAgbGV0IGNhbGxiYWNrJCA9IG9mKG51bGwpO1xyXG5cclxuICAgICAgY29uc3QgaXNDb2RlRmxvdyA9IHRoaXMuZmxvd0hlbHBlci5pc0N1cnJlbnRGbG93Q29kZUZsb3coKTtcclxuXHJcbiAgICAgIGlmIChpc0NvZGVGbG93KSB7XHJcbiAgICAgICAgY2FsbGJhY2skID0gdGhpcy5jb2RlRmxvd0NhbGxiYWNrU2lsZW50UmVuZXdJZnJhbWUodXJsUGFydHMpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNhbGxiYWNrJCA9IHRoaXMuaW1wbGljaXRGbG93Q2FsbGJhY2tTZXJ2aWNlLmF1dGhvcml6ZWRJbXBsaWNpdEZsb3dDYWxsYmFjayhlLmRldGFpbCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNhbGxiYWNrJC5zdWJzY3JpYmUoXHJcbiAgICAgICAgKGNhbGxiYWNrQ29udGV4dCkgPT4ge1xyXG4gICAgICAgICAgaWYgKGNhbGxiYWNrQ29udGV4dD8udmFsaWRhdGlvblJlc3VsdD8uc3RhdGUgPT09IFZhbGlkYXRpb25SZXN1bHQuU3RhdGVzRG9Ob3RNYXRjaCl7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihcclxuICAgICAgICAgICAgICBgc2lsZW50UmVuZXdFdmVudEhhbmRsZXIgPiBpbnNpZGUgc3Vic2NyaWJlIGZvciBjb2RlUmVxdWVzdENhbGxiYWNrID4gc3RhdGVzIGRvbid0IG1hdGNoIHN0YXRlRnJvbVVybDogJHtzdGF0ZUZyb21Vcmx9IGN1cnJlbnRTdGF0ZTogJHtjdXJyZW50U3RhdGV9YFxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHRoaXMucmVmcmVzaFNlc3Npb25XaXRoSUZyYW1lQ29tcGxldGVkSW50ZXJuYWwkLm5leHQoY2FsbGJhY2tDb250ZXh0KTtcclxuICAgICAgICAgIHRoaXMuZmxvd3NEYXRhU2VydmljZS5yZXNldFNpbGVudFJlbmV3UnVubmluZygpO1xyXG4gICAgICAgICAgdGhpcy50YWJzU3luY2hyb25pemF0aW9uU2VydmljZS5zZW5kU2lsZW50UmVuZXdGaW5pc2hlZE5vdGlmaWNhdGlvbigpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgKGVycjogYW55KSA9PiB7XHJcbiAgICAgICAgICBpZiAoZXJyIGluc3RhbmNlb2YgSHR0cEVycm9yUmVzcG9uc2UgJiYgZXJyLnN0YXR1cyA9PT0gNTA0KXtcclxuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKCdzaWxlbnRSZW5ld0V2ZW50SGFuZGxlciBmcm9tIENhbGxiYWNrIGNhdGNoIHRpbWVvdXQgZXJyb3Igc28gd2UgZmluaXNoIHRoaXMgcHJvY2Vzcy4gT3JpZ2luYWwgZXJyb3IgJyArIGVycik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoJ0Vycm9yOiAnICsgZXJyKTtcclxuICAgICAgICAgIHRoaXMucmVmcmVzaFNlc3Npb25XaXRoSUZyYW1lQ29tcGxldGVkSW50ZXJuYWwkLm5leHQobnVsbCk7XHJcbiAgICAgICAgICB0aGlzLmZsb3dzRGF0YVNlcnZpY2UucmVzZXRTaWxlbnRSZW5ld1J1bm5pbmcoKTtcclxuICAgICAgICB9XHJcbiAgICAgICk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0RXhpc3RpbmdJZnJhbWUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5pRnJhbWVTZXJ2aWNlLmdldEV4aXN0aW5nSUZyYW1lKElGUkFNRV9GT1JfU0lMRU5UX1JFTkVXX0lERU5USUZJRVIpO1xyXG4gIH1cclxufVxyXG4iXX0=