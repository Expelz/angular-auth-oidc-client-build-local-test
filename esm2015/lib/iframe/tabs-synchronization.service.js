import { Injectable } from '@angular/core';
import { BroadcastChannel, createLeaderElection } from 'broadcast-channel';
import { ReplaySubject } from 'rxjs';
import { EventTypes } from '../public-events/event-types';
import * as i0 from "@angular/core";
import * as i1 from "../config/config.provider";
import * as i2 from "../public-events/public-events.service";
import * as i3 from "./../logging/logger.service";
export class TabsSynchronizationService {
    constructor(configurationProvider, publicEventsService, loggerService) {
        this.configurationProvider = configurationProvider;
        this.publicEventsService = publicEventsService;
        this.loggerService = loggerService;
        this._isLeaderSubjectInitialized = false;
        this._silentRenewFinished$ = new ReplaySubject();
        this._currentRandomId = `${Math.random().toString(36).substr(2, 9)}_${new Date().getUTCMilliseconds()}`;
        this.Initialization();
    }
    isLeaderCheck() {
        return new Promise((resolve) => {
            this.loggerService.logDebug(`isLeaderCheck > prefix: ${this._prefix} > currentRandomId: ${this._currentRandomId}`);
            if (!this._isLeaderSubjectInitialized) {
                this.loggerService.logWarning(`isLeaderCheck > prefix: ${this._prefix} > currentRandomId: ${this._currentRandomId} > leader subject doesn't initialized`);
                resolve(false);
                return;
            }
            setTimeout(() => {
                const isLeader = this._elector.isLeader;
                this.loggerService.logWarning(`isLeaderCheck > prefix: ${this._prefix} > currentRandomId: ${this._currentRandomId} > inside setTimeout isLeader = ${isLeader}`);
                resolve(isLeader);
            }, 1000);
        });
    }
    getSilentRenewFinishedObservable() {
        return this._silentRenewFinished$.asObservable();
    }
    sendSilentRenewFinishedNotification() {
        if (!this._silentRenewFinishedChannel) {
            this._silentRenewFinishedChannel = new BroadcastChannel(`${this._prefix}_silent_renew_finished`);
        }
        this._silentRenewFinishedChannel.postMessage(`Silent renew finished by _currentRandomId ${this._currentRandomId}`);
    }
    Initialization() {
        var _a;
        this.loggerService.logDebug('TabsSynchronizationService > Initialization started');
        this._prefix = ((_a = this.configurationProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.clientId) || '';
        const channel = new BroadcastChannel(`${this._prefix}_leader`);
        this._elector = createLeaderElection(channel, {
            fallbackInterval: 2000,
            responseTime: 1000,
        });
        this._elector.awaitLeadership().then(() => {
            if (!this._isLeaderSubjectInitialized) {
                this._isLeaderSubjectInitialized = true;
            }
            this.loggerService.logDebug(`this tab is now leader > prefix: ${this._prefix} > currentRandomId: ${this._currentRandomId}`);
        });
        this.initializeSilentRenewFinishedChannelWithHandler();
    }
    initializeSilentRenewFinishedChannelWithHandler() {
        this._silentRenewFinishedChannel = new BroadcastChannel(`${this._prefix}_silent_renew_finished`);
        this._silentRenewFinishedChannel.onmessage = () => {
            this.loggerService.logDebug(`FROM SILENT RENEW FINISHED RECIVED EVENT > prefix: ${this._prefix} > currentRandomId: ${this._currentRandomId}`);
            this._silentRenewFinished$.next(true);
            this.publicEventsService.fireEvent(EventTypes.SilentRenewFinished, true);
        };
    }
}
TabsSynchronizationService.ɵfac = function TabsSynchronizationService_Factory(t) { return new (t || TabsSynchronizationService)(i0.ɵɵinject(i1.ConfigurationProvider), i0.ɵɵinject(i2.PublicEventsService), i0.ɵɵinject(i3.LoggerService)); };
TabsSynchronizationService.ɵprov = i0.ɵɵdefineInjectable({ token: TabsSynchronizationService, factory: TabsSynchronizationService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(TabsSynchronizationService, [{
        type: Injectable
    }], function () { return [{ type: i1.ConfigurationProvider }, { type: i2.PublicEventsService }, { type: i3.LoggerService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFicy1zeW5jaHJvbml6YXRpb24uc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjLyIsInNvdXJjZXMiOlsibGliL2lmcmFtZS90YWJzLXN5bmNocm9uaXphdGlvbi5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLGdCQUFnQixFQUFFLG9CQUFvQixFQUFpQixNQUFNLG1CQUFtQixDQUFDO0FBQzFGLE9BQU8sRUFBYyxhQUFhLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFFakQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDhCQUE4QixDQUFDOzs7OztBQUsxRCxNQUFNLE9BQU8sMEJBQTBCO0lBU3JDLFlBQ21CLHFCQUE0QyxFQUM1QyxtQkFBd0MsRUFDeEMsYUFBNEI7UUFGNUIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQUM1Qyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1FBQ3hDLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBWHZDLGdDQUEyQixHQUFHLEtBQUssQ0FBQztRQUdwQywwQkFBcUIsR0FBRyxJQUFJLGFBQWEsRUFBVyxDQUFDO1FBRXJELHFCQUFnQixHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxDQUFDO1FBUXpHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBRU0sYUFBYTtRQUNsQixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDN0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsMkJBQTJCLElB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RSxJQUFJLENBQUMsQ0FBQztRQUMzRSxDQUFDLENBQUM7SUFDSixDQUFDOztvR0FoRlUsMEJBQTBCO2tFQUExQiwwQkFBMEIsV0FBMUIsMEJBQTBCO2tEQUExQiwwQkFBMEI7Y0FEdEMsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgQnJvYWRjYXN0Q2hhbm5lbCwgY3JlYXRlTGVhZGVyRWxlY3Rpb24sIExlYWRlckVsZWN0b3IgfSBmcm9tICdicm9hZGNhc3QtY2hhbm5lbCc7XHJcbmltcG9ydCB7IE9ic2VydmFibGUsIFJlcGxheVN1YmplY3QgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi4vY29uZmlnL2NvbmZpZy5wcm92aWRlcic7XHJcbmltcG9ydCB7IEV2ZW50VHlwZXMgfSBmcm9tICcuLi9wdWJsaWMtZXZlbnRzL2V2ZW50LXR5cGVzJztcclxuaW1wb3J0IHsgUHVibGljRXZlbnRzU2VydmljZSB9IGZyb20gJy4uL3B1YmxpYy1ldmVudHMvcHVibGljLWV2ZW50cy5zZXJ2aWNlJztcclxuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4vLi4vbG9nZ2luZy9sb2dnZXIuc2VydmljZSc7XHJcblxyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBUYWJzU3luY2hyb25pemF0aW9uU2VydmljZSB7XHJcbiAgcHJpdmF0ZSBfaXNMZWFkZXJTdWJqZWN0SW5pdGlhbGl6ZWQgPSBmYWxzZTtcclxuICBwcml2YXRlIF9lbGVjdG9yOiBMZWFkZXJFbGVjdG9yO1xyXG4gIHByaXZhdGUgX3NpbGVudFJlbmV3RmluaXNoZWRDaGFubmVsOiBCcm9hZGNhc3RDaGFubmVsO1xyXG4gIHByaXZhdGUgX3NpbGVudFJlbmV3RmluaXNoZWQkID0gbmV3IFJlcGxheVN1YmplY3Q8Ym9vbGVhbj4oKTtcclxuXHJcbiAgcHJpdmF0ZSBfY3VycmVudFJhbmRvbUlkID0gYCR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfV8ke25ldyBEYXRlKCkuZ2V0VVRDTWlsbGlzZWNvbmRzKCl9YDtcclxuICBwcml2YXRlIF9wcmVmaXg6IHN0cmluZztcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNvbmZpZ3VyYXRpb25Qcm92aWRlcjogQ29uZmlndXJhdGlvblByb3ZpZGVyLFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBwdWJsaWNFdmVudHNTZXJ2aWNlOiBQdWJsaWNFdmVudHNTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBsb2dnZXJTZXJ2aWNlOiBMb2dnZXJTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgICB0aGlzLkluaXRpYWxpemF0aW9uKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaXNMZWFkZXJDaGVjaygpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYGlzTGVhZGVyQ2hlY2sgPiBwcmVmaXg6ICR7dGhpcy5fcHJlZml4fSA+IGN1cnJlbnRSYW5kb21JZDogJHt0aGlzLl9jdXJyZW50UmFuZG9tSWR9YCk7XHJcbiAgICAgIGlmICghdGhpcy5faXNMZWFkZXJTdWJqZWN0SW5pdGlhbGl6ZWQpIHtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZyhcclxuICAgICAgICAgIGBpc0xlYWRlckNoZWNrID4gcHJlZml4OiAke3RoaXMuX3ByZWZpeH0gPiBjdXJyZW50UmFuZG9tSWQ6ICR7dGhpcy5fY3VycmVudFJhbmRvbUlkfSA+IGxlYWRlciBzdWJqZWN0IGRvZXNuJ3QgaW5pdGlhbGl6ZWRgXHJcbiAgICAgICAgKTtcclxuICAgICAgICByZXNvbHZlKGZhbHNlKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGlzTGVhZGVyID0gdGhpcy5fZWxlY3Rvci5pc0xlYWRlcjtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZyhcclxuICAgICAgICAgIGBpc0xlYWRlckNoZWNrID4gcHJlZml4OiAke3RoaXMuX3ByZWZpeH0gPiBjdXJyZW50UmFuZG9tSWQ6ICR7dGhpcy5fY3VycmVudFJhbmRvbUlkfSA+IGluc2lkZSBzZXRUaW1lb3V0IGlzTGVhZGVyID0gJHtpc0xlYWRlcn1gXHJcbiAgICAgICAgKTtcclxuICAgICAgICByZXNvbHZlKGlzTGVhZGVyKTtcclxuICAgICAgfSwgMTAwMCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRTaWxlbnRSZW5ld0ZpbmlzaGVkT2JzZXJ2YWJsZSgpOiBPYnNlcnZhYmxlPGJvb2xlYW4+IHtcclxuICAgIHJldHVybiB0aGlzLl9zaWxlbnRSZW5ld0ZpbmlzaGVkJC5hc09ic2VydmFibGUoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZW5kU2lsZW50UmVuZXdGaW5pc2hlZE5vdGlmaWNhdGlvbigpIHtcclxuICAgIGlmICghdGhpcy5fc2lsZW50UmVuZXdGaW5pc2hlZENoYW5uZWwpIHtcclxuICAgICAgdGhpcy5fc2lsZW50UmVuZXdGaW5pc2hlZENoYW5uZWwgPSBuZXcgQnJvYWRjYXN0Q2hhbm5lbChgJHt0aGlzLl9wcmVmaXh9X3NpbGVudF9yZW5ld19maW5pc2hlZGApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX3NpbGVudFJlbmV3RmluaXNoZWRDaGFubmVsLnBvc3RNZXNzYWdlKGBTaWxlbnQgcmVuZXcgZmluaXNoZWQgYnkgX2N1cnJlbnRSYW5kb21JZCAke3RoaXMuX2N1cnJlbnRSYW5kb21JZH1gKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgSW5pdGlhbGl6YXRpb24oKTogdm9pZCB7XHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ1RhYnNTeW5jaHJvbml6YXRpb25TZXJ2aWNlID4gSW5pdGlhbGl6YXRpb24gc3RhcnRlZCcpO1xyXG4gICAgdGhpcy5fcHJlZml4ID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbj8uY2xpZW50SWQgfHwgJyc7XHJcbiAgICBjb25zdCBjaGFubmVsID0gbmV3IEJyb2FkY2FzdENoYW5uZWwoYCR7dGhpcy5fcHJlZml4fV9sZWFkZXJgKTtcclxuXHJcbiAgICB0aGlzLl9lbGVjdG9yID0gY3JlYXRlTGVhZGVyRWxlY3Rpb24oY2hhbm5lbCwge1xyXG4gICAgICBmYWxsYmFja0ludGVydmFsOiAyMDAwLCAvLyBvcHRpb25hbCBjb25maWd1cmF0aW9uIGZvciBob3cgb2Z0ZW4gd2lsbCByZW5lZ290aWF0aW9uIGZvciBsZWFkZXIgb2NjdXJcclxuICAgICAgcmVzcG9uc2VUaW1lOiAxMDAwLCAvLyBvcHRpb25hbCBjb25maWd1cmF0aW9uIGZvciBob3cgbG9uZyB3aWxsIGluc3RhbmNlcyBoYXZlIHRvIHJlc3BvbmRcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuX2VsZWN0b3IuYXdhaXRMZWFkZXJzaGlwKCkudGhlbigoKSA9PiB7XHJcbiAgICAgIGlmICghdGhpcy5faXNMZWFkZXJTdWJqZWN0SW5pdGlhbGl6ZWQpIHtcclxuICAgICAgICB0aGlzLl9pc0xlYWRlclN1YmplY3RJbml0aWFsaXplZCA9IHRydWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgdGhpcyB0YWIgaXMgbm93IGxlYWRlciA+IHByZWZpeDogJHt0aGlzLl9wcmVmaXh9ID4gY3VycmVudFJhbmRvbUlkOiAke3RoaXMuX2N1cnJlbnRSYW5kb21JZH1gKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuaW5pdGlhbGl6ZVNpbGVudFJlbmV3RmluaXNoZWRDaGFubmVsV2l0aEhhbmRsZXIoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaW5pdGlhbGl6ZVNpbGVudFJlbmV3RmluaXNoZWRDaGFubmVsV2l0aEhhbmRsZXIoKTogdm9pZCB7XHJcbiAgICB0aGlzLl9zaWxlbnRSZW5ld0ZpbmlzaGVkQ2hhbm5lbCA9IG5ldyBCcm9hZGNhc3RDaGFubmVsKGAke3RoaXMuX3ByZWZpeH1fc2lsZW50X3JlbmV3X2ZpbmlzaGVkYCk7XHJcbiAgICB0aGlzLl9zaWxlbnRSZW5ld0ZpbmlzaGVkQ2hhbm5lbC5vbm1lc3NhZ2UgPSAoKSA9PiB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhcclxuICAgICAgICBgRlJPTSBTSUxFTlQgUkVORVcgRklOSVNIRUQgUkVDSVZFRCBFVkVOVCA+IHByZWZpeDogJHt0aGlzLl9wcmVmaXh9ID4gY3VycmVudFJhbmRvbUlkOiAke3RoaXMuX2N1cnJlbnRSYW5kb21JZH1gXHJcbiAgICAgICk7XHJcbiAgICAgIHRoaXMuX3NpbGVudFJlbmV3RmluaXNoZWQkLm5leHQodHJ1ZSk7XHJcbiAgICAgIHRoaXMucHVibGljRXZlbnRzU2VydmljZS5maXJlRXZlbnQoRXZlbnRUeXBlcy5TaWxlbnRSZW5ld0ZpbmlzaGVkLCB0cnVlKTtcclxuICAgIH07XHJcbiAgfVxyXG59XHJcbiJdfQ==