import { Injectable } from '@angular/core';
import { BroadcastChannel, createLeaderElection } from 'broadcast-channel';
import { of, ReplaySubject } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
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
        this._silentRenewFinished$ = new ReplaySubject(1);
        this._leaderSubjectInitialized$ = new ReplaySubject(1);
        this._currentRandomId = `${Math.random().toString(36).substr(2, 9)}_${new Date().getUTCMilliseconds()}`;
        this.Initialization();
    }
    isLeaderCheck() {
        this.loggerService.logDebug(`isLeaderCheck > prefix: ${this._prefix} > currentRandomId: ${this._currentRandomId}`);
        if (!this._isLeaderSubjectInitialized) {
            this.loggerService.logDebug(`isLeaderCheck > IS LEADER IS NOT INITIALIZED > prefix: ${this._prefix} > currentRandomId: ${this._currentRandomId}`);
            return this._leaderSubjectInitialized$
                .asObservable()
                .pipe(take(1), switchMap(() => {
                return of(this._elector.isLeader);
            }))
                .toPromise();
        }
        this.loggerService.logDebug(`isLeaderCheck > IS LEADER IS ALREADY INITIALIZED SUCCESSFULLY> prefix: ${this._prefix} > currentRandomId: ${this._currentRandomId}`);
        return new Promise((resolve) => {
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
        this._elector.applyOnce().then((isLeader) => {
            this.loggerService.logDebug('FIRST applyOnce finished...');
            this._isLeaderSubjectInitialized = true;
            this._leaderSubjectInitialized$.next(true);
            if (!isLeader) {
                this._elector.awaitLeadership().then(() => {
                    this.loggerService.logDebug(`FROM awaitLeadership > this tab is now leader > prefix: ${this._prefix} > currentRandomId: ${this._currentRandomId}`);
                });
            }
            else {
                this.loggerService.logDebug(`FROM INITIALIZATION FIRST applyOnce > this tab is now leader > prefix: ${this._prefix} > currentRandomId: ${this._currentRandomId}`);
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFicy1zeW5jaHJvbml6YXRpb24uc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjLyIsInNvdXJjZXMiOlsibGliL2lmcmFtZS90YWJzLXN5bmNocm9uaXphdGlvbi5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLGdCQUFnQixFQUFFLG9CQUFvQixFQUFpQixNQUFNLG1CQUFtQixDQUFDO0FBQzFGLE9BQU8sRUFBYyxFQUFFLEVBQUUsYUFBYSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ3JELE9BQU8sRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFakQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDhCQUE4QixDQUFDOzs7OztBQUsxRCxNQUFNLE9BQU8sMEJBQTBCO0lBVXJDLFlBQ21CLHFCQUE0QyxFQUM1QyxtQkFBd0MsRUFDeEMsYUFBNEI7UUFGNUIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQUM1Qyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1FBQ3hDLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBWnZDLGdDQUEyQixHQUFHLEtBQUssQ0FBQztRQUdwQywwQkFBcUIsR0FBRyxJQUFJLGFBQWEsQ0FBVSxDQUFDLENBQUMsQ0FBQztRQUN0RCwrQkFBMEIsR0FBRyxJQUFJLGFBQWEsQ0FBVSxDQUFDLENBQUMsQ0FBQztRQUUzRCxxQkFBZ0IsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDLGtCQUFrQixFQUFFLEVBQUUsQ0FBQztRQVF6RyxJQUFJLENBQUMsY0FBYyxF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Q0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO29CQUN4QyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FDekIsMkRBQTJELElBQUksQ0FBQyxPQUFPLHVCQUF1QixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FDdEgsQ0FBQztnQkFDSixDQUFDLENBQUMsQ0FBQzthQUNKO2lCQUFNO2dCQUNMLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUN6QiwwRUFBMEUsSUFBSSxDQUFDLE9BQU8sdUJBQXVCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUNySSxDQUFDO2FBQ0g7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQywrQ0FBK0MsRUFBRSxDQUFDO0lBQ3pELENBQUM7SUFFTywrQ0FBK0M7UUFDckQsSUFBSSxDQUFDLDJCQUEyQixHQUFHLElBQUksZ0JBQWdCLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyx3QkFBd0IsQ0FBQyxDQUFDO1FBQ2pHLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxTQUFTLEdBQUcsR0FBRyxFQUFFO1lBQ2hELElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUN6QixzREFBc0QsSUFBSSxDQUFDLE9BQU8sdUJBQXVCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUNqSCxDQUFDO1lBQ0YsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN0QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMzRSxDQUFDLENBQUM7SUFDSixDQUFDOztvR0F2R1UsMEJBQTBCO2tFQUExQiwwQkFBMEIsV0FBMUIsMEJBQTBCO2tEQUExQiwwQkFBMEI7Y0FEdEMsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgQnJvYWRjYXN0Q2hhbm5lbCwgY3JlYXRlTGVhZGVyRWxlY3Rpb24sIExlYWRlckVsZWN0b3IgfSBmcm9tICdicm9hZGNhc3QtY2hhbm5lbCc7XHJcbmltcG9ydCB7IE9ic2VydmFibGUsIG9mLCBSZXBsYXlTdWJqZWN0IH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IHN3aXRjaE1hcCwgdGFrZSB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi4vY29uZmlnL2NvbmZpZy5wcm92aWRlcic7XHJcbmltcG9ydCB7IEV2ZW50VHlwZXMgfSBmcm9tICcuLi9wdWJsaWMtZXZlbnRzL2V2ZW50LXR5cGVzJztcclxuaW1wb3J0IHsgUHVibGljRXZlbnRzU2VydmljZSB9IGZyb20gJy4uL3B1YmxpYy1ldmVudHMvcHVibGljLWV2ZW50cy5zZXJ2aWNlJztcclxuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4vLi4vbG9nZ2luZy9sb2dnZXIuc2VydmljZSc7XHJcblxyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBUYWJzU3luY2hyb25pemF0aW9uU2VydmljZSB7XHJcbiAgcHJpdmF0ZSBfaXNMZWFkZXJTdWJqZWN0SW5pdGlhbGl6ZWQgPSBmYWxzZTtcclxuICBwcml2YXRlIF9lbGVjdG9yOiBMZWFkZXJFbGVjdG9yO1xyXG4gIHByaXZhdGUgX3NpbGVudFJlbmV3RmluaXNoZWRDaGFubmVsOiBCcm9hZGNhc3RDaGFubmVsO1xyXG4gIHByaXZhdGUgX3NpbGVudFJlbmV3RmluaXNoZWQkID0gbmV3IFJlcGxheVN1YmplY3Q8Ym9vbGVhbj4oMSk7XHJcbiAgcHJpdmF0ZSBfbGVhZGVyU3ViamVjdEluaXRpYWxpemVkJCA9IG5ldyBSZXBsYXlTdWJqZWN0PGJvb2xlYW4+KDEpO1xyXG5cclxuICBwcml2YXRlIF9jdXJyZW50UmFuZG9tSWQgPSBgJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSl9XyR7bmV3IERhdGUoKS5nZXRVVENNaWxsaXNlY29uZHMoKX1gO1xyXG4gIHByaXZhdGUgX3ByZWZpeDogc3RyaW5nO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgY29uZmlndXJhdGlvblByb3ZpZGVyOiBDb25maWd1cmF0aW9uUHJvdmlkZXIsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IHB1YmxpY0V2ZW50c1NlcnZpY2U6IFB1YmxpY0V2ZW50c1NlcnZpY2UsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2VcclxuICApIHtcclxuICAgIHRoaXMuSW5pdGlhbGl6YXRpb24oKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBpc0xlYWRlckNoZWNrKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBpc0xlYWRlckNoZWNrID4gcHJlZml4OiAke3RoaXMuX3ByZWZpeH0gPiBjdXJyZW50UmFuZG9tSWQ6ICR7dGhpcy5fY3VycmVudFJhbmRvbUlkfWApO1xyXG5cclxuICAgIGlmICghdGhpcy5faXNMZWFkZXJTdWJqZWN0SW5pdGlhbGl6ZWQpIHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKFxyXG4gICAgICAgIGBpc0xlYWRlckNoZWNrID4gSVMgTEVBREVSIElTIE5PVCBJTklUSUFMSVpFRCA+IHByZWZpeDogJHt0aGlzLl9wcmVmaXh9ID4gY3VycmVudFJhbmRvbUlkOiAke3RoaXMuX2N1cnJlbnRSYW5kb21JZH1gXHJcbiAgICAgICk7XHJcbiAgICAgIHJldHVybiB0aGlzLl9sZWFkZXJTdWJqZWN0SW5pdGlhbGl6ZWQkXHJcbiAgICAgICAgLmFzT2JzZXJ2YWJsZSgpXHJcbiAgICAgICAgLnBpcGUoXHJcbiAgICAgICAgICB0YWtlKDEpLFxyXG4gICAgICAgICAgc3dpdGNoTWFwKCgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIG9mKHRoaXMuX2VsZWN0b3IuaXNMZWFkZXIpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICApXHJcbiAgICAgICAgLnRvUHJvbWlzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhcclxuICAgICAgYGlzTGVhZGVyQ2hlY2sgPiBJUyBMRUFERVIgSVMgQUxSRUFEWSBJTklUSUFMSVpFRCBTVUNDRVNTRlVMTFk+IHByZWZpeDogJHt0aGlzLl9wcmVmaXh9ID4gY3VycmVudFJhbmRvbUlkOiAke3RoaXMuX2N1cnJlbnRSYW5kb21JZH1gXHJcbiAgICApO1xyXG5cclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBjb25zdCBpc0xlYWRlciA9IHRoaXMuX2VsZWN0b3IuaXNMZWFkZXI7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoXHJcbiAgICAgICAgICBgaXNMZWFkZXJDaGVjayA+IHByZWZpeDogJHt0aGlzLl9wcmVmaXh9ID4gY3VycmVudFJhbmRvbUlkOiAke3RoaXMuX2N1cnJlbnRSYW5kb21JZH0gPiBpbnNpZGUgc2V0VGltZW91dCBpc0xlYWRlciA9ICR7aXNMZWFkZXJ9YFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgcmVzb2x2ZShpc0xlYWRlcik7XHJcbiAgICAgIH0sIDEwMDApO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0U2lsZW50UmVuZXdGaW5pc2hlZE9ic2VydmFibGUoKTogT2JzZXJ2YWJsZTxib29sZWFuPiB7XHJcbiAgICByZXR1cm4gdGhpcy5fc2lsZW50UmVuZXdGaW5pc2hlZCQuYXNPYnNlcnZhYmxlKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2VuZFNpbGVudFJlbmV3RmluaXNoZWROb3RpZmljYXRpb24oKSB7XHJcbiAgICBpZiAoIXRoaXMuX3NpbGVudFJlbmV3RmluaXNoZWRDaGFubmVsKSB7XHJcbiAgICAgIHRoaXMuX3NpbGVudFJlbmV3RmluaXNoZWRDaGFubmVsID0gbmV3IEJyb2FkY2FzdENoYW5uZWwoYCR7dGhpcy5fcHJlZml4fV9zaWxlbnRfcmVuZXdfZmluaXNoZWRgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9zaWxlbnRSZW5ld0ZpbmlzaGVkQ2hhbm5lbC5wb3N0TWVzc2FnZShgU2lsZW50IHJlbmV3IGZpbmlzaGVkIGJ5IF9jdXJyZW50UmFuZG9tSWQgJHt0aGlzLl9jdXJyZW50UmFuZG9tSWR9YCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIEluaXRpYWxpemF0aW9uKCk6IHZvaWQge1xyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdUYWJzU3luY2hyb25pemF0aW9uU2VydmljZSA+IEluaXRpYWxpemF0aW9uIHN0YXJ0ZWQnKTtcclxuICAgIHRoaXMuX3ByZWZpeCA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24/LmNsaWVudElkIHx8ICcnO1xyXG4gICAgY29uc3QgY2hhbm5lbCA9IG5ldyBCcm9hZGNhc3RDaGFubmVsKGAke3RoaXMuX3ByZWZpeH1fbGVhZGVyYCk7XHJcblxyXG4gICAgdGhpcy5fZWxlY3RvciA9IGNyZWF0ZUxlYWRlckVsZWN0aW9uKGNoYW5uZWwsIHtcclxuICAgICAgZmFsbGJhY2tJbnRlcnZhbDogMjAwMCwgLy8gb3B0aW9uYWwgY29uZmlndXJhdGlvbiBmb3IgaG93IG9mdGVuIHdpbGwgcmVuZWdvdGlhdGlvbiBmb3IgbGVhZGVyIG9jY3VyXHJcbiAgICAgIHJlc3BvbnNlVGltZTogMTAwMCwgLy8gb3B0aW9uYWwgY29uZmlndXJhdGlvbiBmb3IgaG93IGxvbmcgd2lsbCBpbnN0YW5jZXMgaGF2ZSB0byByZXNwb25kXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLl9lbGVjdG9yLmFwcGx5T25jZSgpLnRoZW4oKGlzTGVhZGVyKSA9PiB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnRklSU1QgYXBwbHlPbmNlIGZpbmlzaGVkLi4uJyk7XHJcbiAgICAgIHRoaXMuX2lzTGVhZGVyU3ViamVjdEluaXRpYWxpemVkID0gdHJ1ZTtcclxuICAgICAgdGhpcy5fbGVhZGVyU3ViamVjdEluaXRpYWxpemVkJC5uZXh0KHRydWUpO1xyXG5cclxuICAgICAgaWYgKCFpc0xlYWRlcikge1xyXG4gICAgICAgIHRoaXMuX2VsZWN0b3IuYXdhaXRMZWFkZXJzaGlwKCkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoXHJcbiAgICAgICAgICAgIGBGUk9NIGF3YWl0TGVhZGVyc2hpcCA+IHRoaXMgdGFiIGlzIG5vdyBsZWFkZXIgPiBwcmVmaXg6ICR7dGhpcy5fcHJlZml4fSA+IGN1cnJlbnRSYW5kb21JZDogJHt0aGlzLl9jdXJyZW50UmFuZG9tSWR9YFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoXHJcbiAgICAgICAgICBgRlJPTSBJTklUSUFMSVpBVElPTiBGSVJTVCBhcHBseU9uY2UgPiB0aGlzIHRhYiBpcyBub3cgbGVhZGVyID4gcHJlZml4OiAke3RoaXMuX3ByZWZpeH0gPiBjdXJyZW50UmFuZG9tSWQ6ICR7dGhpcy5fY3VycmVudFJhbmRvbUlkfWBcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmluaXRpYWxpemVTaWxlbnRSZW5ld0ZpbmlzaGVkQ2hhbm5lbFdpdGhIYW5kbGVyKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGluaXRpYWxpemVTaWxlbnRSZW5ld0ZpbmlzaGVkQ2hhbm5lbFdpdGhIYW5kbGVyKCk6IHZvaWQge1xyXG4gICAgdGhpcy5fc2lsZW50UmVuZXdGaW5pc2hlZENoYW5uZWwgPSBuZXcgQnJvYWRjYXN0Q2hhbm5lbChgJHt0aGlzLl9wcmVmaXh9X3NpbGVudF9yZW5ld19maW5pc2hlZGApO1xyXG4gICAgdGhpcy5fc2lsZW50UmVuZXdGaW5pc2hlZENoYW5uZWwub25tZXNzYWdlID0gKCkgPT4ge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoXHJcbiAgICAgICAgYEZST00gU0lMRU5UIFJFTkVXIEZJTklTSEVEIFJFQ0lWRUQgRVZFTlQgPiBwcmVmaXg6ICR7dGhpcy5fcHJlZml4fSA+IGN1cnJlbnRSYW5kb21JZDogJHt0aGlzLl9jdXJyZW50UmFuZG9tSWR9YFxyXG4gICAgICApO1xyXG4gICAgICB0aGlzLl9zaWxlbnRSZW5ld0ZpbmlzaGVkJC5uZXh0KHRydWUpO1xyXG4gICAgICB0aGlzLnB1YmxpY0V2ZW50c1NlcnZpY2UuZmlyZUV2ZW50KEV2ZW50VHlwZXMuU2lsZW50UmVuZXdGaW5pc2hlZCwgdHJ1ZSk7XHJcbiAgICB9O1xyXG4gIH1cclxufVxyXG4iXX0=