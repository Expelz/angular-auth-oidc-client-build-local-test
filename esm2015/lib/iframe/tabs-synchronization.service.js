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
        return new Promise((resolve) => {
            this.loggerService.logDebug(`isLeaderCheck > prefix: ${this._prefix} > currentRandomId: ${this._currentRandomId}`);
            if (!this._isLeaderSubjectInitialized) {
                return this._leaderSubjectInitialized$
                    .asObservable()
                    .pipe(take(1), switchMap(() => {
                    return of(this._elector.isLeader);
                }))
                    .toPromise();
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
                this._leaderSubjectInitialized$.next(true);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFicy1zeW5jaHJvbml6YXRpb24uc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjLyIsInNvdXJjZXMiOlsibGliL2lmcmFtZS90YWJzLXN5bmNocm9uaXphdGlvbi5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLGdCQUFnQixFQUFFLG9CQUFvQixFQUFpQixNQUFNLG1CQUFtQixDQUFDO0FBQzFGLE9BQU8sRUFBYyxFQUFFLEVBQUUsYUFBYSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ3JELE9BQU8sRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFakQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDhCQUE4QixDQUFDOzs7OztBQUsxRCxNQUFNLE9BQU8sMEJBQTBCO0lBVXJDLFlBQ21CLHFCQUE0QyxFQUM1QyxtQkFBd0MsRUFDeEMsYUFBNEI7UUFGNUIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQUM1Qyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1FBQ3hDLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBWnZDLGdDQUEyQixHQUFHLEtBQUssQ0FBQztRQUdwQywwQkFBcUIsR0FBRyxJQUFJLGFBQWEsQ0FBVSxDQUFDLENBQUMsQ0FBQztRQUN0RCwrQkFBMEIsR0FBRyxJQUFJLGFBQWEsQ0FBVSxDQUFDLENBQUMsQ0FBQztRQUUzRCxxQkFBZ0IsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDLGtCQUFrQixFQUFFLEVBQUUsQ0FBQztRQVF6RyxJQUFJLENBQUMsY0FBYyxF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QTJCLENBQUMsU0FBUyxHQUFHLEdBQUcsRUFBRTtZQUNoRCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FDekIsc0RBQXNELElBQUksQ0FBQyxPQUFPLHVCQUF1QixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FDakgsQ0FBQztZQUNGLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDM0UsQ0FBQyxDQUFDO0lBQ0osQ0FBQzs7b0dBdEZVLDBCQUEwQjtrRUFBMUIsMEJBQTBCLFdBQTFCLDBCQUEwQjtrREFBMUIsMEJBQTBCO2NBRHRDLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IEJyb2FkY2FzdENoYW5uZWwsIGNyZWF0ZUxlYWRlckVsZWN0aW9uLCBMZWFkZXJFbGVjdG9yIH0gZnJvbSAnYnJvYWRjYXN0LWNoYW5uZWwnO1xyXG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBvZiwgUmVwbGF5U3ViamVjdCB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBzd2l0Y2hNYXAsIHRha2UgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25Qcm92aWRlciB9IGZyb20gJy4uL2NvbmZpZy9jb25maWcucHJvdmlkZXInO1xyXG5pbXBvcnQgeyBFdmVudFR5cGVzIH0gZnJvbSAnLi4vcHVibGljLWV2ZW50cy9ldmVudC10eXBlcyc7XHJcbmltcG9ydCB7IFB1YmxpY0V2ZW50c1NlcnZpY2UgfSBmcm9tICcuLi9wdWJsaWMtZXZlbnRzL3B1YmxpYy1ldmVudHMuc2VydmljZSc7XHJcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xyXG5cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgVGFic1N5bmNocm9uaXphdGlvblNlcnZpY2Uge1xyXG4gIHByaXZhdGUgX2lzTGVhZGVyU3ViamVjdEluaXRpYWxpemVkID0gZmFsc2U7XHJcbiAgcHJpdmF0ZSBfZWxlY3RvcjogTGVhZGVyRWxlY3RvcjtcclxuICBwcml2YXRlIF9zaWxlbnRSZW5ld0ZpbmlzaGVkQ2hhbm5lbDogQnJvYWRjYXN0Q2hhbm5lbDtcclxuICBwcml2YXRlIF9zaWxlbnRSZW5ld0ZpbmlzaGVkJCA9IG5ldyBSZXBsYXlTdWJqZWN0PGJvb2xlYW4+KDEpO1xyXG4gIHByaXZhdGUgX2xlYWRlclN1YmplY3RJbml0aWFsaXplZCQgPSBuZXcgUmVwbGF5U3ViamVjdDxib29sZWFuPigxKTtcclxuXHJcbiAgcHJpdmF0ZSBfY3VycmVudFJhbmRvbUlkID0gYCR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfV8ke25ldyBEYXRlKCkuZ2V0VVRDTWlsbGlzZWNvbmRzKCl9YDtcclxuICBwcml2YXRlIF9wcmVmaXg6IHN0cmluZztcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNvbmZpZ3VyYXRpb25Qcm92aWRlcjogQ29uZmlndXJhdGlvblByb3ZpZGVyLFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBwdWJsaWNFdmVudHNTZXJ2aWNlOiBQdWJsaWNFdmVudHNTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBsb2dnZXJTZXJ2aWNlOiBMb2dnZXJTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgICB0aGlzLkluaXRpYWxpemF0aW9uKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaXNMZWFkZXJDaGVjaygpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYGlzTGVhZGVyQ2hlY2sgPiBwcmVmaXg6ICR7dGhpcy5fcHJlZml4fSA+IGN1cnJlbnRSYW5kb21JZDogJHt0aGlzLl9jdXJyZW50UmFuZG9tSWR9YCk7XHJcbiAgICAgIGlmICghdGhpcy5faXNMZWFkZXJTdWJqZWN0SW5pdGlhbGl6ZWQpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbGVhZGVyU3ViamVjdEluaXRpYWxpemVkJFxyXG4gICAgICAgICAgLmFzT2JzZXJ2YWJsZSgpXHJcbiAgICAgICAgICAucGlwZShcclxuICAgICAgICAgICAgdGFrZSgxKSxcclxuICAgICAgICAgICAgc3dpdGNoTWFwKCgpID0+IHtcclxuICAgICAgICAgICAgICByZXR1cm4gb2YodGhpcy5fZWxlY3Rvci5pc0xlYWRlcik7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICApXHJcbiAgICAgICAgICAudG9Qcm9taXNlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGlzTGVhZGVyID0gdGhpcy5fZWxlY3Rvci5pc0xlYWRlcjtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZyhcclxuICAgICAgICAgIGBpc0xlYWRlckNoZWNrID4gcHJlZml4OiAke3RoaXMuX3ByZWZpeH0gPiBjdXJyZW50UmFuZG9tSWQ6ICR7dGhpcy5fY3VycmVudFJhbmRvbUlkfSA+IGluc2lkZSBzZXRUaW1lb3V0IGlzTGVhZGVyID0gJHtpc0xlYWRlcn1gXHJcbiAgICAgICAgKTtcclxuICAgICAgICByZXNvbHZlKGlzTGVhZGVyKTtcclxuICAgICAgfSwgMTAwMCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRTaWxlbnRSZW5ld0ZpbmlzaGVkT2JzZXJ2YWJsZSgpOiBPYnNlcnZhYmxlPGJvb2xlYW4+IHtcclxuICAgIHJldHVybiB0aGlzLl9zaWxlbnRSZW5ld0ZpbmlzaGVkJC5hc09ic2VydmFibGUoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZW5kU2lsZW50UmVuZXdGaW5pc2hlZE5vdGlmaWNhdGlvbigpIHtcclxuICAgIGlmICghdGhpcy5fc2lsZW50UmVuZXdGaW5pc2hlZENoYW5uZWwpIHtcclxuICAgICAgdGhpcy5fc2lsZW50UmVuZXdGaW5pc2hlZENoYW5uZWwgPSBuZXcgQnJvYWRjYXN0Q2hhbm5lbChgJHt0aGlzLl9wcmVmaXh9X3NpbGVudF9yZW5ld19maW5pc2hlZGApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX3NpbGVudFJlbmV3RmluaXNoZWRDaGFubmVsLnBvc3RNZXNzYWdlKGBTaWxlbnQgcmVuZXcgZmluaXNoZWQgYnkgX2N1cnJlbnRSYW5kb21JZCAke3RoaXMuX2N1cnJlbnRSYW5kb21JZH1gKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgSW5pdGlhbGl6YXRpb24oKTogdm9pZCB7XHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ1RhYnNTeW5jaHJvbml6YXRpb25TZXJ2aWNlID4gSW5pdGlhbGl6YXRpb24gc3RhcnRlZCcpO1xyXG4gICAgdGhpcy5fcHJlZml4ID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbj8uY2xpZW50SWQgfHwgJyc7XHJcbiAgICBjb25zdCBjaGFubmVsID0gbmV3IEJyb2FkY2FzdENoYW5uZWwoYCR7dGhpcy5fcHJlZml4fV9sZWFkZXJgKTtcclxuXHJcbiAgICB0aGlzLl9lbGVjdG9yID0gY3JlYXRlTGVhZGVyRWxlY3Rpb24oY2hhbm5lbCwge1xyXG4gICAgICBmYWxsYmFja0ludGVydmFsOiAyMDAwLCAvLyBvcHRpb25hbCBjb25maWd1cmF0aW9uIGZvciBob3cgb2Z0ZW4gd2lsbCByZW5lZ290aWF0aW9uIGZvciBsZWFkZXIgb2NjdXJcclxuICAgICAgcmVzcG9uc2VUaW1lOiAxMDAwLCAvLyBvcHRpb25hbCBjb25maWd1cmF0aW9uIGZvciBob3cgbG9uZyB3aWxsIGluc3RhbmNlcyBoYXZlIHRvIHJlc3BvbmRcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuX2VsZWN0b3IuYXdhaXRMZWFkZXJzaGlwKCkudGhlbigoKSA9PiB7XHJcbiAgICAgIGlmICghdGhpcy5faXNMZWFkZXJTdWJqZWN0SW5pdGlhbGl6ZWQpIHtcclxuICAgICAgICB0aGlzLl9pc0xlYWRlclN1YmplY3RJbml0aWFsaXplZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fbGVhZGVyU3ViamVjdEluaXRpYWxpemVkJC5uZXh0KHRydWUpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYHRoaXMgdGFiIGlzIG5vdyBsZWFkZXIgPiBwcmVmaXg6ICR7dGhpcy5fcHJlZml4fSA+IGN1cnJlbnRSYW5kb21JZDogJHt0aGlzLl9jdXJyZW50UmFuZG9tSWR9YCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmluaXRpYWxpemVTaWxlbnRSZW5ld0ZpbmlzaGVkQ2hhbm5lbFdpdGhIYW5kbGVyKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGluaXRpYWxpemVTaWxlbnRSZW5ld0ZpbmlzaGVkQ2hhbm5lbFdpdGhIYW5kbGVyKCk6IHZvaWQge1xyXG4gICAgdGhpcy5fc2lsZW50UmVuZXdGaW5pc2hlZENoYW5uZWwgPSBuZXcgQnJvYWRjYXN0Q2hhbm5lbChgJHt0aGlzLl9wcmVmaXh9X3NpbGVudF9yZW5ld19maW5pc2hlZGApO1xyXG4gICAgdGhpcy5fc2lsZW50UmVuZXdGaW5pc2hlZENoYW5uZWwub25tZXNzYWdlID0gKCkgPT4ge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoXHJcbiAgICAgICAgYEZST00gU0lMRU5UIFJFTkVXIEZJTklTSEVEIFJFQ0lWRUQgRVZFTlQgPiBwcmVmaXg6ICR7dGhpcy5fcHJlZml4fSA+IGN1cnJlbnRSYW5kb21JZDogJHt0aGlzLl9jdXJyZW50UmFuZG9tSWR9YFxyXG4gICAgICApO1xyXG4gICAgICB0aGlzLl9zaWxlbnRSZW5ld0ZpbmlzaGVkJC5uZXh0KHRydWUpO1xyXG4gICAgICB0aGlzLnB1YmxpY0V2ZW50c1NlcnZpY2UuZmlyZUV2ZW50KEV2ZW50VHlwZXMuU2lsZW50UmVuZXdGaW5pc2hlZCwgdHJ1ZSk7XHJcbiAgICB9O1xyXG4gIH1cclxufVxyXG4iXX0=