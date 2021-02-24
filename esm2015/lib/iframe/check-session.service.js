import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { EventTypes } from '../public-events/event-types';
import * as i0 from "@angular/core";
import * as i1 from "../storage/storage-persistance.service";
import * as i2 from "../logging/logger.service";
import * as i3 from "./existing-iframe.service";
import * as i4 from "../public-events/public-events.service";
import * as i5 from "../config/config.provider";
const IFRAME_FOR_CHECK_SESSION_IDENTIFIER = 'myiFrameForCheckSession';
// http://openid.net/specs/openid-connect-session-1_0-ID4.html
export class CheckSessionService {
    constructor(storagePersistanceService, loggerService, iFrameService, eventService, configurationProvider, zone) {
        this.storagePersistanceService = storagePersistanceService;
        this.loggerService = loggerService;
        this.iFrameService = iFrameService;
        this.eventService = eventService;
        this.configurationProvider = configurationProvider;
        this.zone = zone;
        this.checkSessionReceived = false;
        this.lastIFrameRefresh = 0;
        this.outstandingMessages = 0;
        this.heartBeatInterval = 3000;
        this.iframeRefreshInterval = 60000;
        this.checkSessionChangedInternal$ = new BehaviorSubject(false);
    }
    get checkSessionChanged$() {
        return this.checkSessionChangedInternal$.asObservable();
    }
    isCheckSessionConfigured() {
        return this.configurationProvider.openIDConfiguration.startCheckSession;
    }
    start() {
        if (!!this.scheduledHeartBeatRunning) {
            return;
        }
        const clientId = this.configurationProvider.openIDConfiguration.clientId;
        this.pollServerSession(clientId);
    }
    stop() {
        if (!this.scheduledHeartBeatRunning) {
            return;
        }
        this.clearScheduledHeartBeat();
        this.checkSessionReceived = false;
    }
    serverStateChanged() {
        return this.configurationProvider.openIDConfiguration.startCheckSession && this.checkSessionReceived;
    }
    getExistingIframe() {
        return this.iFrameService.getExistingIFrame(IFRAME_FOR_CHECK_SESSION_IDENTIFIER);
    }
    init() {
        if (this.lastIFrameRefresh + this.iframeRefreshInterval > Date.now()) {
            return of(undefined);
        }
        const authWellKnownEndPoints = this.storagePersistanceService.read('authWellKnownEndPoints');
        if (!authWellKnownEndPoints) {
            this.loggerService.logWarning('init check session: authWellKnownEndpoints is undefined. Returning.');
            return of();
        }
        const existingIframe = this.getOrCreateIframe();
        const checkSessionIframe = authWellKnownEndPoints.checkSessionIframe;
        if (checkSessionIframe) {
            existingIframe.contentWindow.location.replace(checkSessionIframe);
        }
        else {
            this.loggerService.logWarning('init check session: checkSessionIframe is not configured to run');
        }
        return new Observable((observer) => {
            existingIframe.onload = () => {
                this.lastIFrameRefresh = Date.now();
                observer.next();
                observer.complete();
            };
        });
    }
    pollServerSession(clientId) {
        this.outstandingMessages = 0;
        const pollServerSessionRecur = () => {
            this.init()
                .pipe(take(1))
                .subscribe(() => {
                var _a;
                const existingIframe = this.getExistingIframe();
                if (existingIframe && clientId) {
                    this.loggerService.logDebug(existingIframe);
                    const sessionState = this.storagePersistanceService.read('session_state');
                    const authWellKnownEndPoints = this.storagePersistanceService.read('authWellKnownEndPoints');
                    if (sessionState && (authWellKnownEndPoints === null || authWellKnownEndPoints === void 0 ? void 0 : authWellKnownEndPoints.checkSessionIframe)) {
                        const iframeOrigin = (_a = new URL(authWellKnownEndPoints.checkSessionIframe)) === null || _a === void 0 ? void 0 : _a.origin;
                        this.outstandingMessages++;
                        existingIframe.contentWindow.postMessage(clientId + ' ' + sessionState, iframeOrigin);
                    }
                    else {
                        this.loggerService.logDebug(`OidcSecurityCheckSession pollServerSession session_state is '${sessionState}'`);
                        this.loggerService.logDebug(`AuthWellKnownEndPoints is '${JSON.stringify(authWellKnownEndPoints)}'`);
                        this.checkSessionChangedInternal$.next(true);
                    }
                }
                else {
                    this.loggerService.logWarning('OidcSecurityCheckSession pollServerSession checkSession IFrame does not exist');
                    this.loggerService.logDebug(clientId);
                    this.loggerService.logDebug(existingIframe);
                }
                // after sending three messages with no response, fail.
                if (this.outstandingMessages > 3) {
                    this.loggerService.logError(`OidcSecurityCheckSession not receiving check session response messages.
                            Outstanding messages: ${this.outstandingMessages}. Server unreachable?`);
                }
                this.zone.runOutsideAngular(() => {
                    this.scheduledHeartBeatRunning = setTimeout(() => this.zone.run(pollServerSessionRecur), this.heartBeatInterval);
                });
            });
        };
        pollServerSessionRecur();
    }
    clearScheduledHeartBeat() {
        clearTimeout(this.scheduledHeartBeatRunning);
        this.scheduledHeartBeatRunning = null;
    }
    messageHandler(e) {
        var _a;
        const existingIFrame = this.getExistingIframe();
        const authWellKnownEndPoints = this.storagePersistanceService.read('authWellKnownEndPoints');
        const startsWith = !!((_a = authWellKnownEndPoints === null || authWellKnownEndPoints === void 0 ? void 0 : authWellKnownEndPoints.checkSessionIframe) === null || _a === void 0 ? void 0 : _a.startsWith(e.origin));
        this.outstandingMessages = 0;
        if (existingIFrame && startsWith && e.source === existingIFrame.contentWindow) {
            if (e.data === 'error') {
                this.loggerService.logWarning('error from checksession messageHandler');
            }
            else if (e.data === 'changed') {
                this.loggerService.logDebug(e);
                this.checkSessionReceived = true;
                this.eventService.fireEvent(EventTypes.CheckSessionReceived, e.data);
                this.checkSessionChangedInternal$.next(true);
            }
            else {
                this.eventService.fireEvent(EventTypes.CheckSessionReceived, e.data);
                this.loggerService.logDebug(e.data + ' from checksession messageHandler');
            }
        }
    }
    bindMessageEventToIframe() {
        const iframeMessageEvent = this.messageHandler.bind(this);
        window.addEventListener('message', iframeMessageEvent, false);
    }
    getOrCreateIframe() {
        const existingIframe = this.getExistingIframe();
        if (!existingIframe) {
            const frame = this.iFrameService.addIFrameToWindowBody(IFRAME_FOR_CHECK_SESSION_IDENTIFIER);
            this.bindMessageEventToIframe();
            return frame;
        }
        return existingIframe;
    }
}
CheckSessionService.ɵfac = function CheckSessionService_Factory(t) { return new (t || CheckSessionService)(i0.ɵɵinject(i1.StoragePersistanceService), i0.ɵɵinject(i2.LoggerService), i0.ɵɵinject(i3.IFrameService), i0.ɵɵinject(i4.PublicEventsService), i0.ɵɵinject(i5.ConfigurationProvider), i0.ɵɵinject(i0.NgZone)); };
CheckSessionService.ɵprov = i0.ɵɵdefineInjectable({ token: CheckSessionService, factory: CheckSessionService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(CheckSessionService, [{
        type: Injectable
    }], function () { return [{ type: i1.StoragePersistanceService }, { type: i2.LoggerService }, { type: i3.IFrameService }, { type: i4.PublicEventsService }, { type: i5.ConfigurationProvider }, { type: i0.NgZone }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2stc2Vzc2lvbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvIiwic291cmNlcyI6WyJsaWIvaWZyYW1lL2NoZWNrLXNlc3Npb24uc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFVLE1BQU0sZUFBZSxDQUFDO0FBQ25ELE9BQU8sRUFBRSxlQUFlLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUN2RCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFHdEMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDhCQUE4QixDQUFDOzs7Ozs7O0FBSzFELE1BQU0sbUNBQW1DLEdBQUcseUJBQXlCLENBQUM7QUFFdEUsOERBQThEO0FBRzlELE1BQU0sT0FBTyxtQkFBbUI7SUFhOUIsWUFDVSx5QkFBb0QsRUFDcEQsYUFBNEIsRUFDNUIsYUFBNEIsRUFDNUIsWUFBaUMsRUFDakMscUJBQTRDLEVBQzVDLElBQVk7UUFMWiw4QkFBeUIsR0FBekIseUJBQXlCLENBQTJCO1FBQ3BELGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLGlCQUFZLEdBQVosWUFBWSxDQUFxQjtRQUNqQywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1FBQzVDLFNBQUksR0FBSixJQUFJLENBQVE7UUFsQmQseUJBQW9CLEdBQUcsS0FBSyxDQUFDO1FBRTdCLHNCQUFpQixHQUFHLENBQUMsQ0FBQztRQUN0Qix3QkFBbUIsR0FBRyxDQUFDLENBQUM7UUFDeEIsc0JBQWlCLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLDBCQUFxQixHQUFHLEtBQUssQ0FBQztRQUM5QixpQ0FBNEIsR0FBRyxJQUFJLGVBQWUsQ0FBVSxLQUFLLENBQUMsQ0FBQztJQWF4RSxDQUFDO0lBWEos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bkIsbUJBQW1CO2NBRC9CLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlLCBOZ1pvbmUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgQmVoYXZpb3JTdWJqZWN0LCBPYnNlcnZhYmxlLCBvZiB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyB0YWtlIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuLi9jb25maWcvY29uZmlnLnByb3ZpZGVyJztcclxuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBFdmVudFR5cGVzIH0gZnJvbSAnLi4vcHVibGljLWV2ZW50cy9ldmVudC10eXBlcyc7XHJcbmltcG9ydCB7IFB1YmxpY0V2ZW50c1NlcnZpY2UgfSBmcm9tICcuLi9wdWJsaWMtZXZlbnRzL3B1YmxpYy1ldmVudHMuc2VydmljZSc7XHJcbmltcG9ydCB7IFN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UgfSBmcm9tICcuLi9zdG9yYWdlL3N0b3JhZ2UtcGVyc2lzdGFuY2Uuc2VydmljZSc7XHJcbmltcG9ydCB7IElGcmFtZVNlcnZpY2UgfSBmcm9tICcuL2V4aXN0aW5nLWlmcmFtZS5zZXJ2aWNlJztcclxuXHJcbmNvbnN0IElGUkFNRV9GT1JfQ0hFQ0tfU0VTU0lPTl9JREVOVElGSUVSID0gJ215aUZyYW1lRm9yQ2hlY2tTZXNzaW9uJztcclxuXHJcbi8vIGh0dHA6Ly9vcGVuaWQubmV0L3NwZWNzL29wZW5pZC1jb25uZWN0LXNlc3Npb24tMV8wLUlENC5odG1sXHJcblxyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBDaGVja1Nlc3Npb25TZXJ2aWNlIHtcclxuICBwcml2YXRlIGNoZWNrU2Vzc2lvblJlY2VpdmVkID0gZmFsc2U7XHJcbiAgcHJpdmF0ZSBzY2hlZHVsZWRIZWFydEJlYXRSdW5uaW5nOiBhbnk7XHJcbiAgcHJpdmF0ZSBsYXN0SUZyYW1lUmVmcmVzaCA9IDA7XHJcbiAgcHJpdmF0ZSBvdXRzdGFuZGluZ01lc3NhZ2VzID0gMDtcclxuICBwcml2YXRlIGhlYXJ0QmVhdEludGVydmFsID0gMzAwMDtcclxuICBwcml2YXRlIGlmcmFtZVJlZnJlc2hJbnRlcnZhbCA9IDYwMDAwO1xyXG4gIHByaXZhdGUgY2hlY2tTZXNzaW9uQ2hhbmdlZEludGVybmFsJCA9IG5ldyBCZWhhdmlvclN1YmplY3Q8Ym9vbGVhbj4oZmFsc2UpO1xyXG5cclxuICBnZXQgY2hlY2tTZXNzaW9uQ2hhbmdlZCQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5jaGVja1Nlc3Npb25DaGFuZ2VkSW50ZXJuYWwkLmFzT2JzZXJ2YWJsZSgpO1xyXG4gIH1cclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIHN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2U6IFN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGlGcmFtZVNlcnZpY2U6IElGcmFtZVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGV2ZW50U2VydmljZTogUHVibGljRXZlbnRzU2VydmljZSxcclxuICAgIHByaXZhdGUgY29uZmlndXJhdGlvblByb3ZpZGVyOiBDb25maWd1cmF0aW9uUHJvdmlkZXIsXHJcbiAgICBwcml2YXRlIHpvbmU6IE5nWm9uZVxyXG4gICkge31cclxuXHJcbiAgaXNDaGVja1Nlc3Npb25Db25maWd1cmVkKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uc3RhcnRDaGVja1Nlc3Npb247XHJcbiAgfVxyXG5cclxuICBzdGFydCgpOiB2b2lkIHtcclxuICAgIGlmICghIXRoaXMuc2NoZWR1bGVkSGVhcnRCZWF0UnVubmluZykge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY2xpZW50SWQgPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLmNsaWVudElkO1xyXG4gICAgdGhpcy5wb2xsU2VydmVyU2Vzc2lvbihjbGllbnRJZCk7XHJcbiAgfVxyXG5cclxuICBzdG9wKCk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLnNjaGVkdWxlZEhlYXJ0QmVhdFJ1bm5pbmcpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuY2xlYXJTY2hlZHVsZWRIZWFydEJlYXQoKTtcclxuICAgIHRoaXMuY2hlY2tTZXNzaW9uUmVjZWl2ZWQgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIHNlcnZlclN0YXRlQ2hhbmdlZCgpIHtcclxuICAgIHJldHVybiB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnN0YXJ0Q2hlY2tTZXNzaW9uICYmIHRoaXMuY2hlY2tTZXNzaW9uUmVjZWl2ZWQ7XHJcbiAgfVxyXG5cclxuICBnZXRFeGlzdGluZ0lmcmFtZSgpIHtcclxuICAgIHJldHVybiB0aGlzLmlGcmFtZVNlcnZpY2UuZ2V0RXhpc3RpbmdJRnJhbWUoSUZSQU1FX0ZPUl9DSEVDS19TRVNTSU9OX0lERU5USUZJRVIpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBpbml0KCk6IE9ic2VydmFibGU8YW55PiB7XHJcbiAgICBpZiAodGhpcy5sYXN0SUZyYW1lUmVmcmVzaCArIHRoaXMuaWZyYW1lUmVmcmVzaEludGVydmFsID4gRGF0ZS5ub3coKSkge1xyXG4gICAgICByZXR1cm4gb2YodW5kZWZpbmVkKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhdXRoV2VsbEtub3duRW5kUG9pbnRzID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQoJ2F1dGhXZWxsS25vd25FbmRQb2ludHMnKTtcclxuXHJcbiAgICBpZiAoIWF1dGhXZWxsS25vd25FbmRQb2ludHMpIHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2luaXQgY2hlY2sgc2Vzc2lvbjogYXV0aFdlbGxLbm93bkVuZHBvaW50cyBpcyB1bmRlZmluZWQuIFJldHVybmluZy4nKTtcclxuICAgICAgcmV0dXJuIG9mKCk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZXhpc3RpbmdJZnJhbWUgPSB0aGlzLmdldE9yQ3JlYXRlSWZyYW1lKCk7XHJcbiAgICBjb25zdCBjaGVja1Nlc3Npb25JZnJhbWUgPSBhdXRoV2VsbEtub3duRW5kUG9pbnRzLmNoZWNrU2Vzc2lvbklmcmFtZTtcclxuXHJcbiAgICBpZiAoY2hlY2tTZXNzaW9uSWZyYW1lKSB7XHJcbiAgICAgIGV4aXN0aW5nSWZyYW1lLmNvbnRlbnRXaW5kb3cubG9jYXRpb24ucmVwbGFjZShjaGVja1Nlc3Npb25JZnJhbWUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2luaXQgY2hlY2sgc2Vzc2lvbjogY2hlY2tTZXNzaW9uSWZyYW1lIGlzIG5vdCBjb25maWd1cmVkIHRvIHJ1bicpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZSgob2JzZXJ2ZXIpID0+IHtcclxuICAgICAgZXhpc3RpbmdJZnJhbWUub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICAgIHRoaXMubGFzdElGcmFtZVJlZnJlc2ggPSBEYXRlLm5vdygpO1xyXG4gICAgICAgIG9ic2VydmVyLm5leHQoKTtcclxuICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xyXG4gICAgICB9O1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHBvbGxTZXJ2ZXJTZXNzaW9uKGNsaWVudElkOiBzdHJpbmcpIHtcclxuICAgIHRoaXMub3V0c3RhbmRpbmdNZXNzYWdlcyA9IDA7XHJcbiAgICBjb25zdCBwb2xsU2VydmVyU2Vzc2lvblJlY3VyID0gKCkgPT4ge1xyXG4gICAgICB0aGlzLmluaXQoKVxyXG4gICAgICAgIC5waXBlKHRha2UoMSkpXHJcbiAgICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBleGlzdGluZ0lmcmFtZSA9IHRoaXMuZ2V0RXhpc3RpbmdJZnJhbWUoKTtcclxuICAgICAgICAgIGlmIChleGlzdGluZ0lmcmFtZSAmJiBjbGllbnRJZCkge1xyXG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoZXhpc3RpbmdJZnJhbWUpO1xyXG4gICAgICAgICAgICBjb25zdCBzZXNzaW9uU3RhdGUgPSB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZCgnc2Vzc2lvbl9zdGF0ZScpO1xyXG4gICAgICAgICAgICBjb25zdCBhdXRoV2VsbEtub3duRW5kUG9pbnRzID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQoJ2F1dGhXZWxsS25vd25FbmRQb2ludHMnKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChzZXNzaW9uU3RhdGUgJiYgYXV0aFdlbGxLbm93bkVuZFBvaW50cz8uY2hlY2tTZXNzaW9uSWZyYW1lKSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgaWZyYW1lT3JpZ2luID0gbmV3IFVSTChhdXRoV2VsbEtub3duRW5kUG9pbnRzLmNoZWNrU2Vzc2lvbklmcmFtZSk/Lm9yaWdpbjtcclxuICAgICAgICAgICAgICB0aGlzLm91dHN0YW5kaW5nTWVzc2FnZXMrKztcclxuICAgICAgICAgICAgICBleGlzdGluZ0lmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKGNsaWVudElkICsgJyAnICsgc2Vzc2lvblN0YXRlLCBpZnJhbWVPcmlnaW4pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgT2lkY1NlY3VyaXR5Q2hlY2tTZXNzaW9uIHBvbGxTZXJ2ZXJTZXNzaW9uIHNlc3Npb25fc3RhdGUgaXMgJyR7c2Vzc2lvblN0YXRlfSdgKTtcclxuICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYEF1dGhXZWxsS25vd25FbmRQb2ludHMgaXMgJyR7SlNPTi5zdHJpbmdpZnkoYXV0aFdlbGxLbm93bkVuZFBvaW50cyl9J2ApO1xyXG4gICAgICAgICAgICAgIHRoaXMuY2hlY2tTZXNzaW9uQ2hhbmdlZEludGVybmFsJC5uZXh0KHRydWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnT2lkY1NlY3VyaXR5Q2hlY2tTZXNzaW9uIHBvbGxTZXJ2ZXJTZXNzaW9uIGNoZWNrU2Vzc2lvbiBJRnJhbWUgZG9lcyBub3QgZXhpc3QnKTtcclxuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGNsaWVudElkKTtcclxuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGV4aXN0aW5nSWZyYW1lKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBhZnRlciBzZW5kaW5nIHRocmVlIG1lc3NhZ2VzIHdpdGggbm8gcmVzcG9uc2UsIGZhaWwuXHJcbiAgICAgICAgICBpZiAodGhpcy5vdXRzdGFuZGluZ01lc3NhZ2VzID4gMykge1xyXG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoXHJcbiAgICAgICAgICAgICAgYE9pZGNTZWN1cml0eUNoZWNrU2Vzc2lvbiBub3QgcmVjZWl2aW5nIGNoZWNrIHNlc3Npb24gcmVzcG9uc2UgbWVzc2FnZXMuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBPdXRzdGFuZGluZyBtZXNzYWdlczogJHt0aGlzLm91dHN0YW5kaW5nTWVzc2FnZXN9LiBTZXJ2ZXIgdW5yZWFjaGFibGU/YFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHRoaXMuem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVkSGVhcnRCZWF0UnVubmluZyA9IHNldFRpbWVvdXQoKCkgPT4gdGhpcy56b25lLnJ1bihwb2xsU2VydmVyU2Vzc2lvblJlY3VyKSwgdGhpcy5oZWFydEJlYXRJbnRlcnZhbCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgcG9sbFNlcnZlclNlc3Npb25SZWN1cigpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjbGVhclNjaGVkdWxlZEhlYXJ0QmVhdCgpIHtcclxuICAgIGNsZWFyVGltZW91dCh0aGlzLnNjaGVkdWxlZEhlYXJ0QmVhdFJ1bm5pbmcpO1xyXG4gICAgdGhpcy5zY2hlZHVsZWRIZWFydEJlYXRSdW5uaW5nID0gbnVsbDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgbWVzc2FnZUhhbmRsZXIoZTogYW55KSB7XHJcbiAgICBjb25zdCBleGlzdGluZ0lGcmFtZSA9IHRoaXMuZ2V0RXhpc3RpbmdJZnJhbWUoKTtcclxuICAgIGNvbnN0IGF1dGhXZWxsS25vd25FbmRQb2ludHMgPSB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZCgnYXV0aFdlbGxLbm93bkVuZFBvaW50cycpO1xyXG4gICAgY29uc3Qgc3RhcnRzV2l0aCA9ICEhYXV0aFdlbGxLbm93bkVuZFBvaW50cz8uY2hlY2tTZXNzaW9uSWZyYW1lPy5zdGFydHNXaXRoKGUub3JpZ2luKTtcclxuICAgIHRoaXMub3V0c3RhbmRpbmdNZXNzYWdlcyA9IDA7XHJcbiAgICBpZiAoZXhpc3RpbmdJRnJhbWUgJiYgc3RhcnRzV2l0aCAmJiBlLnNvdXJjZSA9PT0gZXhpc3RpbmdJRnJhbWUuY29udGVudFdpbmRvdykge1xyXG4gICAgICBpZiAoZS5kYXRhID09PSAnZXJyb3InKSB7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2Vycm9yIGZyb20gY2hlY2tzZXNzaW9uIG1lc3NhZ2VIYW5kbGVyJyk7XHJcbiAgICAgIH0gZWxzZSBpZiAoZS5kYXRhID09PSAnY2hhbmdlZCcpIHtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoZSk7XHJcbiAgICAgICAgdGhpcy5jaGVja1Nlc3Npb25SZWNlaXZlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5ldmVudFNlcnZpY2UuZmlyZUV2ZW50KEV2ZW50VHlwZXMuQ2hlY2tTZXNzaW9uUmVjZWl2ZWQsIGUuZGF0YSk7XHJcbiAgICAgICAgdGhpcy5jaGVja1Nlc3Npb25DaGFuZ2VkSW50ZXJuYWwkLm5leHQodHJ1ZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5ldmVudFNlcnZpY2UuZmlyZUV2ZW50KEV2ZW50VHlwZXMuQ2hlY2tTZXNzaW9uUmVjZWl2ZWQsIGUuZGF0YSk7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGUuZGF0YSArICcgZnJvbSBjaGVja3Nlc3Npb24gbWVzc2FnZUhhbmRsZXInKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBiaW5kTWVzc2FnZUV2ZW50VG9JZnJhbWUoKSB7XHJcbiAgICBjb25zdCBpZnJhbWVNZXNzYWdlRXZlbnQgPSB0aGlzLm1lc3NhZ2VIYW5kbGVyLmJpbmQodGhpcyk7XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGlmcmFtZU1lc3NhZ2VFdmVudCwgZmFsc2UpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRPckNyZWF0ZUlmcmFtZSgpIHtcclxuICAgIGNvbnN0IGV4aXN0aW5nSWZyYW1lID0gdGhpcy5nZXRFeGlzdGluZ0lmcmFtZSgpO1xyXG5cclxuICAgIGlmICghZXhpc3RpbmdJZnJhbWUpIHtcclxuICAgICAgY29uc3QgZnJhbWUgPSB0aGlzLmlGcmFtZVNlcnZpY2UuYWRkSUZyYW1lVG9XaW5kb3dCb2R5KElGUkFNRV9GT1JfQ0hFQ0tfU0VTU0lPTl9JREVOVElGSUVSKTtcclxuICAgICAgdGhpcy5iaW5kTWVzc2FnZUV2ZW50VG9JZnJhbWUoKTtcclxuICAgICAgcmV0dXJuIGZyYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBleGlzdGluZ0lmcmFtZTtcclxuICB9XHJcbn1cclxuIl19