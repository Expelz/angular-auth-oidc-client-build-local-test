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
        this.heartBeatInterval = 15000;
        this.iframeRefreshInterval = 300000;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2stc2Vzc2lvbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvIiwic291cmNlcyI6WyJsaWIvaWZyYW1lL2NoZWNrLXNlc3Npb24uc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFVLE1BQU0sZUFBZSxDQUFDO0FBQ25ELE9BQU8sRUFBRSxlQUFlLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUN2RCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFHdEMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDhCQUE4QixDQUFDOzs7Ozs7O0FBSzFELE1BQU0sbUNBQW1DLEdBQUcseUJBQXlCLENBQUM7QUFFdEUsOERBQThEO0FBRzlELE1BQU0sT0FBTyxtQkFBbUI7SUFhOUIsWUFDVSx5QkFBb0QsRUFDcEQsYUFBNEIsRUFDNUIsYUFBNEIsRUFDNUIsWUFBaUMsRUFDakMscUJBQTRDLEVBQzVDLElBQVk7UUFMWiw4QkFBeUIsR0FBekIseUJBQXlCLENBQTJCO1FBQ3BELGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLGlCQUFZLEdBQVosWUFBWSxDQUFxQjtRQUNqQywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1FBQzVDLFNBQUksR0FBSixJQUFJLENBQVE7UUFsQmQseUJBQW9CLEdBQUcsS0FBSyxDQUFDO1FBRTdCLHNCQUFpQixHQUFHLENBQUMsQ0FBQztRQUN0Qix3QkFBbUIsR0FBRyxDQUFDLENBQUM7UUFDeEIsc0JBQWlCLEdBQUcsS0FBSyxDQUFDO1FBQzFCLDBCQUFxQixHQUFHLE1BQU0sQ0FBQztRQUMvQixpQ0FBNEIsR0FBRyxJQUFJLGVBQWUsQ0FBVSxLQUFLLENBQUMsQ0FBQztJQWF4RSxDQUFDO0lBWEos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bkIsbUJBQW1CO2NBRC9CLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlLCBOZ1pvbmUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgQmVoYXZpb3JTdWJqZWN0LCBPYnNlcnZhYmxlLCBvZiB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyB0YWtlIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuLi9jb25maWcvY29uZmlnLnByb3ZpZGVyJztcclxuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBFdmVudFR5cGVzIH0gZnJvbSAnLi4vcHVibGljLWV2ZW50cy9ldmVudC10eXBlcyc7XHJcbmltcG9ydCB7IFB1YmxpY0V2ZW50c1NlcnZpY2UgfSBmcm9tICcuLi9wdWJsaWMtZXZlbnRzL3B1YmxpYy1ldmVudHMuc2VydmljZSc7XHJcbmltcG9ydCB7IFN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UgfSBmcm9tICcuLi9zdG9yYWdlL3N0b3JhZ2UtcGVyc2lzdGFuY2Uuc2VydmljZSc7XHJcbmltcG9ydCB7IElGcmFtZVNlcnZpY2UgfSBmcm9tICcuL2V4aXN0aW5nLWlmcmFtZS5zZXJ2aWNlJztcclxuXHJcbmNvbnN0IElGUkFNRV9GT1JfQ0hFQ0tfU0VTU0lPTl9JREVOVElGSUVSID0gJ215aUZyYW1lRm9yQ2hlY2tTZXNzaW9uJztcclxuXHJcbi8vIGh0dHA6Ly9vcGVuaWQubmV0L3NwZWNzL29wZW5pZC1jb25uZWN0LXNlc3Npb24tMV8wLUlENC5odG1sXHJcblxyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBDaGVja1Nlc3Npb25TZXJ2aWNlIHtcclxuICBwcml2YXRlIGNoZWNrU2Vzc2lvblJlY2VpdmVkID0gZmFsc2U7XHJcbiAgcHJpdmF0ZSBzY2hlZHVsZWRIZWFydEJlYXRSdW5uaW5nOiBhbnk7XHJcbiAgcHJpdmF0ZSBsYXN0SUZyYW1lUmVmcmVzaCA9IDA7XHJcbiAgcHJpdmF0ZSBvdXRzdGFuZGluZ01lc3NhZ2VzID0gMDtcclxuICBwcml2YXRlIGhlYXJ0QmVhdEludGVydmFsID0gMTUwMDA7XHJcbiAgcHJpdmF0ZSBpZnJhbWVSZWZyZXNoSW50ZXJ2YWwgPSAzMDAwMDA7XHJcbiAgcHJpdmF0ZSBjaGVja1Nlc3Npb25DaGFuZ2VkSW50ZXJuYWwkID0gbmV3IEJlaGF2aW9yU3ViamVjdDxib29sZWFuPihmYWxzZSk7XHJcblxyXG4gIGdldCBjaGVja1Nlc3Npb25DaGFuZ2VkJCgpIHtcclxuICAgIHJldHVybiB0aGlzLmNoZWNrU2Vzc2lvbkNoYW5nZWRJbnRlcm5hbCQuYXNPYnNlcnZhYmxlKCk7XHJcbiAgfVxyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZTogU3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZSxcclxuICAgIHByaXZhdGUgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZSxcclxuICAgIHByaXZhdGUgaUZyYW1lU2VydmljZTogSUZyYW1lU2VydmljZSxcclxuICAgIHByaXZhdGUgZXZlbnRTZXJ2aWNlOiBQdWJsaWNFdmVudHNTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlcixcclxuICAgIHByaXZhdGUgem9uZTogTmdab25lXHJcbiAgKSB7fVxyXG5cclxuICBpc0NoZWNrU2Vzc2lvbkNvbmZpZ3VyZWQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5zdGFydENoZWNrU2Vzc2lvbjtcclxuICB9XHJcblxyXG4gIHN0YXJ0KCk6IHZvaWQge1xyXG4gICAgaWYgKCEhdGhpcy5zY2hlZHVsZWRIZWFydEJlYXRSdW5uaW5nKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjbGllbnRJZCA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uY2xpZW50SWQ7XHJcbiAgICB0aGlzLnBvbGxTZXJ2ZXJTZXNzaW9uKGNsaWVudElkKTtcclxuICB9XHJcblxyXG4gIHN0b3AoKTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuc2NoZWR1bGVkSGVhcnRCZWF0UnVubmluZykge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jbGVhclNjaGVkdWxlZEhlYXJ0QmVhdCgpO1xyXG4gICAgdGhpcy5jaGVja1Nlc3Npb25SZWNlaXZlZCA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgc2VydmVyU3RhdGVDaGFuZ2VkKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uc3RhcnRDaGVja1Nlc3Npb24gJiYgdGhpcy5jaGVja1Nlc3Npb25SZWNlaXZlZDtcclxuICB9XHJcblxyXG4gIGdldEV4aXN0aW5nSWZyYW1lKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuaUZyYW1lU2VydmljZS5nZXRFeGlzdGluZ0lGcmFtZShJRlJBTUVfRk9SX0NIRUNLX1NFU1NJT05fSURFTlRJRklFUik7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGluaXQoKTogT2JzZXJ2YWJsZTxhbnk+IHtcclxuICAgIGlmICh0aGlzLmxhc3RJRnJhbWVSZWZyZXNoICsgdGhpcy5pZnJhbWVSZWZyZXNoSW50ZXJ2YWwgPiBEYXRlLm5vdygpKSB7XHJcbiAgICAgIHJldHVybiBvZih1bmRlZmluZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGF1dGhXZWxsS25vd25FbmRQb2ludHMgPSB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZCgnYXV0aFdlbGxLbm93bkVuZFBvaW50cycpO1xyXG5cclxuICAgIGlmICghYXV0aFdlbGxLbm93bkVuZFBvaW50cykge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnaW5pdCBjaGVjayBzZXNzaW9uOiBhdXRoV2VsbEtub3duRW5kcG9pbnRzIGlzIHVuZGVmaW5lZC4gUmV0dXJuaW5nLicpO1xyXG4gICAgICByZXR1cm4gb2YoKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBleGlzdGluZ0lmcmFtZSA9IHRoaXMuZ2V0T3JDcmVhdGVJZnJhbWUoKTtcclxuICAgIGNvbnN0IGNoZWNrU2Vzc2lvbklmcmFtZSA9IGF1dGhXZWxsS25vd25FbmRQb2ludHMuY2hlY2tTZXNzaW9uSWZyYW1lO1xyXG5cclxuICAgIGlmIChjaGVja1Nlc3Npb25JZnJhbWUpIHtcclxuICAgICAgZXhpc3RpbmdJZnJhbWUuY29udGVudFdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKGNoZWNrU2Vzc2lvbklmcmFtZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnaW5pdCBjaGVjayBzZXNzaW9uOiBjaGVja1Nlc3Npb25JZnJhbWUgaXMgbm90IGNvbmZpZ3VyZWQgdG8gcnVuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKChvYnNlcnZlcikgPT4ge1xyXG4gICAgICBleGlzdGluZ0lmcmFtZS5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5sYXN0SUZyYW1lUmVmcmVzaCA9IERhdGUubm93KCk7XHJcbiAgICAgICAgb2JzZXJ2ZXIubmV4dCgpO1xyXG4gICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XHJcbiAgICAgIH07XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcG9sbFNlcnZlclNlc3Npb24oY2xpZW50SWQ6IHN0cmluZykge1xyXG4gICAgdGhpcy5vdXRzdGFuZGluZ01lc3NhZ2VzID0gMDtcclxuICAgIGNvbnN0IHBvbGxTZXJ2ZXJTZXNzaW9uUmVjdXIgPSAoKSA9PiB7XHJcbiAgICAgIHRoaXMuaW5pdCgpXHJcbiAgICAgICAgLnBpcGUodGFrZSgxKSlcclxuICAgICAgICAuc3Vic2NyaWJlKCgpID0+IHtcclxuICAgICAgICAgIGNvbnN0IGV4aXN0aW5nSWZyYW1lID0gdGhpcy5nZXRFeGlzdGluZ0lmcmFtZSgpO1xyXG4gICAgICAgICAgaWYgKGV4aXN0aW5nSWZyYW1lICYmIGNsaWVudElkKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhleGlzdGluZ0lmcmFtZSk7XHJcbiAgICAgICAgICAgIGNvbnN0IHNlc3Npb25TdGF0ZSA9IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5yZWFkKCdzZXNzaW9uX3N0YXRlJyk7XHJcbiAgICAgICAgICAgIGNvbnN0IGF1dGhXZWxsS25vd25FbmRQb2ludHMgPSB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZCgnYXV0aFdlbGxLbm93bkVuZFBvaW50cycpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHNlc3Npb25TdGF0ZSAmJiBhdXRoV2VsbEtub3duRW5kUG9pbnRzPy5jaGVja1Nlc3Npb25JZnJhbWUpIHtcclxuICAgICAgICAgICAgICBjb25zdCBpZnJhbWVPcmlnaW4gPSBuZXcgVVJMKGF1dGhXZWxsS25vd25FbmRQb2ludHMuY2hlY2tTZXNzaW9uSWZyYW1lKT8ub3JpZ2luO1xyXG4gICAgICAgICAgICAgIHRoaXMub3V0c3RhbmRpbmdNZXNzYWdlcysrO1xyXG4gICAgICAgICAgICAgIGV4aXN0aW5nSWZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoY2xpZW50SWQgKyAnICcgKyBzZXNzaW9uU3RhdGUsIGlmcmFtZU9yaWdpbik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBPaWRjU2VjdXJpdHlDaGVja1Nlc3Npb24gcG9sbFNlcnZlclNlc3Npb24gc2Vzc2lvbl9zdGF0ZSBpcyAnJHtzZXNzaW9uU3RhdGV9J2ApO1xyXG4gICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgQXV0aFdlbGxLbm93bkVuZFBvaW50cyBpcyAnJHtKU09OLnN0cmluZ2lmeShhdXRoV2VsbEtub3duRW5kUG9pbnRzKX0nYCk7XHJcbiAgICAgICAgICAgICAgdGhpcy5jaGVja1Nlc3Npb25DaGFuZ2VkSW50ZXJuYWwkLm5leHQodHJ1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdPaWRjU2VjdXJpdHlDaGVja1Nlc3Npb24gcG9sbFNlcnZlclNlc3Npb24gY2hlY2tTZXNzaW9uIElGcmFtZSBkb2VzIG5vdCBleGlzdCcpO1xyXG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoY2xpZW50SWQpO1xyXG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoZXhpc3RpbmdJZnJhbWUpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIGFmdGVyIHNlbmRpbmcgdGhyZWUgbWVzc2FnZXMgd2l0aCBubyByZXNwb25zZSwgZmFpbC5cclxuICAgICAgICAgIGlmICh0aGlzLm91dHN0YW5kaW5nTWVzc2FnZXMgPiAzKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihcclxuICAgICAgICAgICAgICBgT2lkY1NlY3VyaXR5Q2hlY2tTZXNzaW9uIG5vdCByZWNlaXZpbmcgY2hlY2sgc2Vzc2lvbiByZXNwb25zZSBtZXNzYWdlcy5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE91dHN0YW5kaW5nIG1lc3NhZ2VzOiAke3RoaXMub3V0c3RhbmRpbmdNZXNzYWdlc30uIFNlcnZlciB1bnJlYWNoYWJsZT9gXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgdGhpcy56b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZWRIZWFydEJlYXRSdW5uaW5nID0gc2V0VGltZW91dCgoKSA9PiB0aGlzLnpvbmUucnVuKHBvbGxTZXJ2ZXJTZXNzaW9uUmVjdXIpLCB0aGlzLmhlYXJ0QmVhdEludGVydmFsKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBwb2xsU2VydmVyU2Vzc2lvblJlY3VyKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNsZWFyU2NoZWR1bGVkSGVhcnRCZWF0KCkge1xyXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuc2NoZWR1bGVkSGVhcnRCZWF0UnVubmluZyk7XHJcbiAgICB0aGlzLnNjaGVkdWxlZEhlYXJ0QmVhdFJ1bm5pbmcgPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBtZXNzYWdlSGFuZGxlcihlOiBhbnkpIHtcclxuICAgIGNvbnN0IGV4aXN0aW5nSUZyYW1lID0gdGhpcy5nZXRFeGlzdGluZ0lmcmFtZSgpO1xyXG4gICAgY29uc3QgYXV0aFdlbGxLbm93bkVuZFBvaW50cyA9IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5yZWFkKCdhdXRoV2VsbEtub3duRW5kUG9pbnRzJyk7XHJcbiAgICBjb25zdCBzdGFydHNXaXRoID0gISFhdXRoV2VsbEtub3duRW5kUG9pbnRzPy5jaGVja1Nlc3Npb25JZnJhbWU/LnN0YXJ0c1dpdGgoZS5vcmlnaW4pO1xyXG4gICAgdGhpcy5vdXRzdGFuZGluZ01lc3NhZ2VzID0gMDtcclxuICAgIGlmIChleGlzdGluZ0lGcmFtZSAmJiBzdGFydHNXaXRoICYmIGUuc291cmNlID09PSBleGlzdGluZ0lGcmFtZS5jb250ZW50V2luZG93KSB7XHJcbiAgICAgIGlmIChlLmRhdGEgPT09ICdlcnJvcicpIHtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnZXJyb3IgZnJvbSBjaGVja3Nlc3Npb24gbWVzc2FnZUhhbmRsZXInKTtcclxuICAgICAgfSBlbHNlIGlmIChlLmRhdGEgPT09ICdjaGFuZ2VkJykge1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhlKTtcclxuICAgICAgICB0aGlzLmNoZWNrU2Vzc2lvblJlY2VpdmVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmV2ZW50U2VydmljZS5maXJlRXZlbnQoRXZlbnRUeXBlcy5DaGVja1Nlc3Npb25SZWNlaXZlZCwgZS5kYXRhKTtcclxuICAgICAgICB0aGlzLmNoZWNrU2Vzc2lvbkNoYW5nZWRJbnRlcm5hbCQubmV4dCh0cnVlKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmV2ZW50U2VydmljZS5maXJlRXZlbnQoRXZlbnRUeXBlcy5DaGVja1Nlc3Npb25SZWNlaXZlZCwgZS5kYXRhKTtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoZS5kYXRhICsgJyBmcm9tIGNoZWNrc2Vzc2lvbiBtZXNzYWdlSGFuZGxlcicpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGJpbmRNZXNzYWdlRXZlbnRUb0lmcmFtZSgpIHtcclxuICAgIGNvbnN0IGlmcmFtZU1lc3NhZ2VFdmVudCA9IHRoaXMubWVzc2FnZUhhbmRsZXIuYmluZCh0aGlzKTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgaWZyYW1lTWVzc2FnZUV2ZW50LCBmYWxzZSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldE9yQ3JlYXRlSWZyYW1lKCkge1xyXG4gICAgY29uc3QgZXhpc3RpbmdJZnJhbWUgPSB0aGlzLmdldEV4aXN0aW5nSWZyYW1lKCk7XHJcblxyXG4gICAgaWYgKCFleGlzdGluZ0lmcmFtZSkge1xyXG4gICAgICBjb25zdCBmcmFtZSA9IHRoaXMuaUZyYW1lU2VydmljZS5hZGRJRnJhbWVUb1dpbmRvd0JvZHkoSUZSQU1FX0ZPUl9DSEVDS19TRVNTSU9OX0lERU5USUZJRVIpO1xyXG4gICAgICB0aGlzLmJpbmRNZXNzYWdlRXZlbnRUb0lmcmFtZSgpO1xyXG4gICAgICByZXR1cm4gZnJhbWU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGV4aXN0aW5nSWZyYW1lO1xyXG4gIH1cclxufVxyXG4iXX0=