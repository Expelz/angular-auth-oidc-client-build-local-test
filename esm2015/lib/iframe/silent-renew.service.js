import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of, Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthorizedState } from '../authState/authorized-state';
import { EventTypes } from '../public-events/event-types';
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
import * as i11 from "../public-events/public-events.service";
const IFRAME_FOR_SILENT_RENEW_IDENTIFIER = 'myiFrameForSilentRenew';
export class SilentRenewService {
    constructor(configurationProvider, iFrameService, flowsService, flowsDataService, authStateService, loggerService, flowHelper, implicitFlowCallbackService, intervallService, tabsSynchronizationService, publicEventsService) {
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
        this.publicEventsService = publicEventsService;
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
                this.refreshSessionWithIFrameCompletedInternal$.next(callbackContext);
                this.flowsDataService.resetSilentRenewRunning();
                this.publicEventsService.fireEvent(EventTypes.CheckSessionReceived);
            }, (err) => {
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
SilentRenewService.ɵfac = function SilentRenewService_Factory(t) { return new (t || SilentRenewService)(i0.ɵɵinject(i1.ConfigurationProvider), i0.ɵɵinject(i2.IFrameService), i0.ɵɵinject(i3.FlowsService), i0.ɵɵinject(i4.FlowsDataService), i0.ɵɵinject(i5.AuthStateService), i0.ɵɵinject(i6.LoggerService), i0.ɵɵinject(i7.FlowHelper), i0.ɵɵinject(i8.ImplicitFlowCallbackService), i0.ɵɵinject(i9.IntervallService), i0.ɵɵinject(i10.TabsSynchronizationService), i0.ɵɵinject(i11.PublicEventsService)); };
SilentRenewService.ɵprov = i0.ɵɵdefineInjectable({ token: SilentRenewService, factory: SilentRenewService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(SilentRenewService, [{
        type: Injectable
    }], function () { return [{ type: i1.ConfigurationProvider }, { type: i2.IFrameService }, { type: i3.FlowsService }, { type: i4.FlowsDataService }, { type: i5.AuthStateService }, { type: i6.LoggerService }, { type: i7.FlowHelper }, { type: i8.ImplicitFlowCallbackService }, { type: i9.IntervallService }, { type: i10.TabsSynchronizationService }, { type: i11.PublicEventsService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lsZW50LXJlbmV3LnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy8iLCJzb3VyY2VzIjpbImxpYi9pZnJhbWUvc2lsZW50LXJlbmV3LnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQy9DLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUU1QyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFRaEUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRzFELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGlDQUFpQyxDQUFDOzs7Ozs7Ozs7Ozs7O0FBSW5FLE1BQU0sa0NBQWtDLEdBQUcsd0JBQXdCLENBQUM7QUFHcEUsTUFBTSxPQUFPLGtCQUFrQjtJQU83QixZQUNVLHFCQUE0QyxFQUM1QyxhQUE0QixFQUM1QixZQUEwQixFQUMxQixnQkFBa0MsRUFDbEMsZ0JBQWtDLEVBQ2xDLGFBQTRCLEVBQzVCLFVBQXNCLEVBQ3RCLDJCQUF3RCxFQUN4RCxnQkFBa0MsRUFDbEMsMEJBQXNELEVBQ3RELG1CQUF3QztRQVZ4QywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1FBQzVDLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBQzFCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUM1QixlQUFV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QUMsQ0FBQztnQkFDdEUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLHVCQUF1QixFQUFFLENBQUM7Z0JBQ2hELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDLENBQUE7WUFFckUsQ0FBQyxFQUNELENBQUMsR0FBUSxFQUFFLEVBQUU7Z0JBQ1gsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUM3QyxJQUFJLENBQUMsMENBQTBDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMzRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztZQUNsRCxDQUFDLENBQ0YsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVPLGlCQUFpQjtRQUN2QixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLENBQUMsa0NBQWtDLENBQUMsQ0FBQztJQUNsRixDQUFDOztvRkFqSVUsa0JBQWtCOzBEQUFsQixrQkFBa0IsV0FBbEIsa0JBQWtCO2tEQUFsQixrQkFBa0I7Y0FEOUIsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEh0dHBQYXJhbXMgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XHJcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgb2YsIFN1YmplY3QsIHRocm93RXJyb3IgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgY2F0Y2hFcnJvciB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuaW1wb3J0IHsgQXV0aFN0YXRlU2VydmljZSB9IGZyb20gJy4uL2F1dGhTdGF0ZS9hdXRoLXN0YXRlLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBBdXRob3JpemVkU3RhdGUgfSBmcm9tICcuLi9hdXRoU3RhdGUvYXV0aG9yaXplZC1zdGF0ZSc7XHJcbmltcG9ydCB7IEltcGxpY2l0Rmxvd0NhbGxiYWNrU2VydmljZSB9IGZyb20gJy4uL2NhbGxiYWNrL2ltcGxpY2l0LWZsb3ctY2FsbGJhY2suc2VydmljZSc7XHJcbmltcG9ydCB7IEludGVydmFsbFNlcnZpY2UgfSBmcm9tICcuLi9jYWxsYmFjay9pbnRlcnZhbGwuc2VydmljZSc7XHJcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25Qcm92aWRlciB9IGZyb20gJy4uL2NvbmZpZy9jb25maWcucHJvdmlkZXInO1xyXG5pbXBvcnQgeyBDYWxsYmFja0NvbnRleHQgfSBmcm9tICcuLi9mbG93cy9jYWxsYmFjay1jb250ZXh0JztcclxuaW1wb3J0IHsgRmxvd3NEYXRhU2VydmljZSB9IGZyb20gJy4uL2Zsb3dzL2Zsb3dzLWRhdGEuc2VydmljZSc7XHJcbmltcG9ydCB7IEZsb3dzU2VydmljZSB9IGZyb20gJy4uL2Zsb3dzL2Zsb3dzLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi4vbG9nZ2luZy9sb2dnZXIuc2VydmljZSc7XHJcbmltcG9ydCB7IEV2ZW50VHlwZXMgfSBmcm9tICcuLi9wdWJsaWMtZXZlbnRzL2V2ZW50LXR5cGVzJztcclxuaW1wb3J0IHsgUHVibGljRXZlbnRzU2VydmljZSB9IGZyb20gJy4uL3B1YmxpYy1ldmVudHMvcHVibGljLWV2ZW50cy5zZXJ2aWNlJztcclxuaW1wb3J0IHsgRmxvd0hlbHBlciB9IGZyb20gJy4uL3V0aWxzL2Zsb3dIZWxwZXIvZmxvdy1oZWxwZXIuc2VydmljZSc7XHJcbmltcG9ydCB7IFZhbGlkYXRpb25SZXN1bHQgfSBmcm9tICcuLi92YWxpZGF0aW9uL3ZhbGlkYXRpb24tcmVzdWx0JztcclxuaW1wb3J0IHsgSUZyYW1lU2VydmljZSB9IGZyb20gJy4vZXhpc3RpbmctaWZyYW1lLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBUYWJzU3luY2hyb25pemF0aW9uU2VydmljZSB9IGZyb20gJy4vdGFicy1zeW5jaHJvbml6YXRpb24uc2VydmljZSc7XHJcblxyXG5jb25zdCBJRlJBTUVfRk9SX1NJTEVOVF9SRU5FV19JREVOVElGSUVSID0gJ215aUZyYW1lRm9yU2lsZW50UmVuZXcnO1xyXG5cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgU2lsZW50UmVuZXdTZXJ2aWNlIHtcclxuICBwcml2YXRlIHJlZnJlc2hTZXNzaW9uV2l0aElGcmFtZUNvbXBsZXRlZEludGVybmFsJCA9IG5ldyBTdWJqZWN0PENhbGxiYWNrQ29udGV4dD4oKTtcclxuXHJcbiAgZ2V0IHJlZnJlc2hTZXNzaW9uV2l0aElGcmFtZUNvbXBsZXRlZCQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5yZWZyZXNoU2Vzc2lvbldpdGhJRnJhbWVDb21wbGV0ZWRJbnRlcm5hbCQuYXNPYnNlcnZhYmxlKCk7XHJcbiAgfVxyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgY29uZmlndXJhdGlvblByb3ZpZGVyOiBDb25maWd1cmF0aW9uUHJvdmlkZXIsXHJcbiAgICBwcml2YXRlIGlGcmFtZVNlcnZpY2U6IElGcmFtZVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGZsb3dzU2VydmljZTogRmxvd3NTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBmbG93c0RhdGFTZXJ2aWNlOiBGbG93c0RhdGFTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBhdXRoU3RhdGVTZXJ2aWNlOiBBdXRoU3RhdGVTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBsb2dnZXJTZXJ2aWNlOiBMb2dnZXJTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBmbG93SGVscGVyOiBGbG93SGVscGVyLFxyXG4gICAgcHJpdmF0ZSBpbXBsaWNpdEZsb3dDYWxsYmFja1NlcnZpY2U6IEltcGxpY2l0Rmxvd0NhbGxiYWNrU2VydmljZSxcclxuICAgIHByaXZhdGUgaW50ZXJ2YWxsU2VydmljZTogSW50ZXJ2YWxsU2VydmljZSxcclxuICAgIHByaXZhdGUgdGFic1N5bmNocm9uaXphdGlvblNlcnZpY2U6IFRhYnNTeW5jaHJvbml6YXRpb25TZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBwdWJsaWNFdmVudHNTZXJ2aWNlOiBQdWJsaWNFdmVudHNTZXJ2aWNlLFxyXG4gICkge31cclxuXHJcbiAgZ2V0T3JDcmVhdGVJZnJhbWUoKTogSFRNTElGcmFtZUVsZW1lbnQge1xyXG4gICAgY29uc3QgZXhpc3RpbmdJZnJhbWUgPSB0aGlzLmdldEV4aXN0aW5nSWZyYW1lKCk7XHJcblxyXG4gICAgaWYgKCFleGlzdGluZ0lmcmFtZSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5pRnJhbWVTZXJ2aWNlLmFkZElGcmFtZVRvV2luZG93Qm9keShJRlJBTUVfRk9SX1NJTEVOVF9SRU5FV19JREVOVElGSUVSKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZXhpc3RpbmdJZnJhbWU7XHJcbiAgfVxyXG5cclxuICBpc1NpbGVudFJlbmV3Q29uZmlndXJlZCgpIHtcclxuICAgIHJldHVybiAhdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi51c2VSZWZyZXNoVG9rZW4gJiYgdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5zaWxlbnRSZW5ldztcclxuICB9XHJcblxyXG4gIGNvZGVGbG93Q2FsbGJhY2tTaWxlbnRSZW5ld0lmcmFtZSh1cmxQYXJ0cykge1xyXG4gICAgY29uc3QgcGFyYW1zID0gbmV3IEh0dHBQYXJhbXMoe1xyXG4gICAgICBmcm9tU3RyaW5nOiB1cmxQYXJ0c1sxXSxcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGVycm9yID0gcGFyYW1zLmdldCgnZXJyb3InKTtcclxuXHJcbiAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLnVwZGF0ZUFuZFB1Ymxpc2hBdXRoU3RhdGUoe1xyXG4gICAgICAgIGF1dGhvcml6YXRpb25TdGF0ZTogQXV0aG9yaXplZFN0YXRlLlVuYXV0aG9yaXplZCxcclxuICAgICAgICB2YWxpZGF0aW9uUmVzdWx0OiBWYWxpZGF0aW9uUmVzdWx0LkxvZ2luUmVxdWlyZWQsXHJcbiAgICAgICAgaXNSZW5ld1Byb2Nlc3M6IHRydWUsXHJcbiAgICAgIH0pO1xyXG4gICAgICB0aGlzLmZsb3dzU2VydmljZS5yZXNldEF1dGhvcml6YXRpb25EYXRhKCk7XHJcbiAgICAgIHRoaXMuZmxvd3NEYXRhU2VydmljZS5zZXROb25jZSgnJyk7XHJcbiAgICAgIHRoaXMuaW50ZXJ2YWxsU2VydmljZS5zdG9wUGVyaW9kaWNhbGxUb2tlbkNoZWNrKCk7XHJcbiAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjb2RlID0gcGFyYW1zLmdldCgnY29kZScpO1xyXG4gICAgY29uc3Qgc3RhdGUgPSBwYXJhbXMuZ2V0KCdzdGF0ZScpO1xyXG4gICAgY29uc3Qgc2Vzc2lvblN0YXRlID0gcGFyYW1zLmdldCgnc2Vzc2lvbl9zdGF0ZScpO1xyXG5cclxuICAgIGNvbnN0IGNhbGxiYWNrQ29udGV4dCA9IHtcclxuICAgICAgY29kZSxcclxuICAgICAgcmVmcmVzaFRva2VuOiBudWxsLFxyXG4gICAgICBzdGF0ZSxcclxuICAgICAgc2Vzc2lvblN0YXRlLFxyXG4gICAgICBhdXRoUmVzdWx0OiBudWxsLFxyXG4gICAgICBpc1JlbmV3UHJvY2VzczogdHJ1ZSxcclxuICAgICAgand0S2V5czogbnVsbCxcclxuICAgICAgdmFsaWRhdGlvblJlc3VsdDogbnVsbCxcclxuICAgICAgZXhpc3RpbmdJZFRva2VuOiBudWxsLFxyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5mbG93c1NlcnZpY2UucHJvY2Vzc1NpbGVudFJlbmV3Q29kZUZsb3dDYWxsYmFjayhjYWxsYmFja0NvbnRleHQpLnBpcGUoXHJcbiAgICAgIGNhdGNoRXJyb3IoKGVycm9yRnJvbUZsb3cpID0+IHtcclxuICAgICAgICB0aGlzLmludGVydmFsbFNlcnZpY2Uuc3RvcFBlcmlvZGljYWxsVG9rZW5DaGVjaygpO1xyXG4gICAgICAgIHRoaXMuZmxvd3NTZXJ2aWNlLnJlc2V0QXV0aG9yaXphdGlvbkRhdGEoKTtcclxuICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvckZyb21GbG93KTtcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBzaWxlbnRSZW5ld0V2ZW50SGFuZGxlcihlOiBDdXN0b21FdmVudCkge1xyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdzaWxlbnRSZW5ld0V2ZW50SGFuZGxlcicpO1xyXG4gICAgaWYgKCFlLmRldGFpbCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdXJsUGFydHMgPSBlLmRldGFpbC50b1N0cmluZygpLnNwbGl0KCc/Jyk7XHJcbiAgICBjb25zdCBwYXJhbXMgPSBuZXcgSHR0cFBhcmFtcyh7XHJcbiAgICAgIGZyb21TdHJpbmc6IHVybFBhcnRzWzFdLFxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3Qgc3RhdGVGcm9tVXJsID0gcGFyYW1zLmdldCgnc3RhdGUnKTtcclxuICAgIGNvbnN0IGN1cnJlbnRTdGF0ZSA9IHRoaXMuZmxvd3NEYXRhU2VydmljZS5nZXRBdXRoU3RhdGVDb250cm9sKCk7XHJcbiAgICBcclxuICAgIGlmIChzdGF0ZUZyb21VcmwgIT09IGN1cnJlbnRTdGF0ZSl7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihgc2lsZW50UmVuZXdFdmVudEhhbmRsZXIgPiBzdGF0ZXMgZG9uJ3QgbWF0Y2ggc3RhdGVGcm9tVXJsOiAke3N0YXRlRnJvbVVybH0gY3VycmVudFN0YXRlOiAke2N1cnJlbnRTdGF0ZX1gKVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudGFic1N5bmNocm9uaXphdGlvblNlcnZpY2UuaXNMZWFkZXJDaGVjaygpLnRoZW4oKGlzTGVhZGVyKSA9PiB7XHJcbiAgICAgIGlmICghaXNMZWFkZXIpIHJldHVybjtcclxuXHJcbiAgICAgIGxldCBjYWxsYmFjayQgPSBvZihudWxsKTtcclxuXHJcbiAgICAgIGNvbnN0IGlzQ29kZUZsb3cgPSB0aGlzLmZsb3dIZWxwZXIuaXNDdXJyZW50Rmxvd0NvZGVGbG93KCk7XHJcblxyXG4gICAgICBpZiAoaXNDb2RlRmxvdykge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNhbGxiYWNrJCA9IHRoaXMuY29kZUZsb3dDYWxsYmFja1NpbGVudFJlbmV3SWZyYW1lKHVybFBhcnRzKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjYWxsYmFjayQgPSB0aGlzLmltcGxpY2l0Rmxvd0NhbGxiYWNrU2VydmljZS5hdXRob3JpemVkSW1wbGljaXRGbG93Q2FsbGJhY2soZS5kZXRhaWwpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjYWxsYmFjayQuc3Vic2NyaWJlKFxyXG4gICAgICAgIChjYWxsYmFja0NvbnRleHQpID0+IHtcclxuICAgICAgICAgIHRoaXMucmVmcmVzaFNlc3Npb25XaXRoSUZyYW1lQ29tcGxldGVkSW50ZXJuYWwkLm5leHQoY2FsbGJhY2tDb250ZXh0KTtcclxuICAgICAgICAgIHRoaXMuZmxvd3NEYXRhU2VydmljZS5yZXNldFNpbGVudFJlbmV3UnVubmluZygpO1xyXG4gICAgICAgICAgdGhpcy5wdWJsaWNFdmVudHNTZXJ2aWNlLmZpcmVFdmVudChFdmVudFR5cGVzLkNoZWNrU2Vzc2lvblJlY2VpdmVkKVxyXG5cclxuICAgICAgICB9LFxyXG4gICAgICAgIChlcnI6IGFueSkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKCdFcnJvcjogJyArIGVycik7XHJcbiAgICAgICAgICB0aGlzLnJlZnJlc2hTZXNzaW9uV2l0aElGcmFtZUNvbXBsZXRlZEludGVybmFsJC5uZXh0KG51bGwpO1xyXG4gICAgICAgICAgdGhpcy5mbG93c0RhdGFTZXJ2aWNlLnJlc2V0U2lsZW50UmVuZXdSdW5uaW5nKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICApO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldEV4aXN0aW5nSWZyYW1lKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuaUZyYW1lU2VydmljZS5nZXRFeGlzdGluZ0lGcmFtZShJRlJBTUVfRk9SX1NJTEVOVF9SRU5FV19JREVOVElGSUVSKTtcclxuICB9XHJcbn1cclxuIl19