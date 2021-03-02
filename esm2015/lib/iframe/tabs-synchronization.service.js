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
        this._isClosed = false;
        this._silentRenewFinished$ = new ReplaySubject(1);
        this._leaderSubjectInitialized$ = new ReplaySubject(1);
        this._currentRandomId = `${Math.random().toString(36).substr(2, 9)}_${new Date().getUTCMilliseconds()}`;
        this.Initialization();
    }
    get isClosed() {
        return this._isClosed;
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
    closeTabSynchronization() {
        this.loggerService.logWarning(`Tab synchronization has been closed > prefix: ${this._prefix} > currentRandomId: ${this._currentRandomId}`);
        this._elector.die();
        this._silentRenewFinishedChannel.close();
        this._leaderChannel.close();
        this._isLeaderSubjectInitialized = false;
        this._isClosed = true;
    }
    reInitialize() {
        this.loggerService.logDebug('TabsSynchronizationService re-initialization process started...');
        if (!this._isClosed) {
            throw Error('TabsSynchronizationService cannot be re-initialized when it is not closed.');
        }
        this._silentRenewFinished$ = new ReplaySubject(1);
        this._leaderSubjectInitialized$ = new ReplaySubject(1);
        this.Initialization();
        this._isClosed = false;
    }
    Initialization() {
        var _a;
        this.loggerService.logDebug('TabsSynchronizationService > Initialization started');
        this._prefix = ((_a = this.configurationProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.clientId) || '';
        this._leaderChannel = new BroadcastChannel(`${this._prefix}_leader`);
        this._elector = createLeaderElection(this._leaderChannel, {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFicy1zeW5jaHJvbml6YXRpb24uc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjLyIsInNvdXJjZXMiOlsibGliL2lmcmFtZS90YWJzLXN5bmNocm9uaXphdGlvbi5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLGdCQUFnQixFQUFFLG9CQUFvQixFQUFpQixNQUFNLG1CQUFtQixDQUFDO0FBQzFGLE9BQU8sRUFBYyxFQUFFLEVBQUUsYUFBYSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ3JELE9BQU8sRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFakQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDhCQUE4QixDQUFDOzs7OztBQUsxRCxNQUFNLE9BQU8sMEJBQTBCO0lBWXJDLFlBQ21CLHFCQUE0QyxFQUM1QyxtQkFBd0MsRUFDeEMsYUFBNEI7UUFGNUIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQUM1Qyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1FBQ3hDLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBZHZDLGdDQUEyQixHQUFHLEtBQUssQ0FBQztRQUNwQyxjQUFTLEdBQUcsS0FBSyxDQUFDO1FBSWxCLDBCQUFxQixHQUFHLElBQUksYUFBYSxDQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ3RELCtCQUEwQixHQUFHLElBQUksYUFBYSxDQUFVLENBQUMsQ0FBQyxDQUFDO1FBRTNELHFCQUFnQixHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxD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YUFDSjtpQkFBTTtnQkFDTCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FDekIsMEVBQTBFLElBQUksQ0FBQyxPQUFPLHVCQUF1QixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FDckksQ0FBQzthQUNIO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsK0NBQStDLEVBQUUsQ0FBQztJQUN6RCxDQUFDO0lBRU8sK0NBQStDO1FBQ3JELElBQUksQ0FBQywyQkFBMkIsR0FBRyxJQUFJLGdCQUFnQixDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sd0JBQXdCLENBQUMsQ0FBQztRQUNqRyxJQUFJLENBQUMsMkJBQTJCLENBQUMsU0FBUyxHQUFHLEdBQUcsRUFBRTtZQUNoRCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FDekIsc0RBQXNELElBQUksQ0FBQyxPQUFPLHVCQUF1QixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FDakgsQ0FBQztZQUNGLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDM0UsQ0FBQyxDQUFDO0lBQ0osQ0FBQzs7b0dBeElVLDBCQUEwQjtrRUFBMUIsMEJBQTBCLFdBQTFCLDBCQUEwQjtrREFBMUIsMEJBQTBCO2NBRHRDLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IEJyb2FkY2FzdENoYW5uZWwsIGNyZWF0ZUxlYWRlckVsZWN0aW9uLCBMZWFkZXJFbGVjdG9yIH0gZnJvbSAnYnJvYWRjYXN0LWNoYW5uZWwnO1xyXG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBvZiwgUmVwbGF5U3ViamVjdCB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBzd2l0Y2hNYXAsIHRha2UgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25Qcm92aWRlciB9IGZyb20gJy4uL2NvbmZpZy9jb25maWcucHJvdmlkZXInO1xyXG5pbXBvcnQgeyBFdmVudFR5cGVzIH0gZnJvbSAnLi4vcHVibGljLWV2ZW50cy9ldmVudC10eXBlcyc7XHJcbmltcG9ydCB7IFB1YmxpY0V2ZW50c1NlcnZpY2UgfSBmcm9tICcuLi9wdWJsaWMtZXZlbnRzL3B1YmxpYy1ldmVudHMuc2VydmljZSc7XHJcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xyXG5cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgVGFic1N5bmNocm9uaXphdGlvblNlcnZpY2Uge1xyXG4gIHByaXZhdGUgX2lzTGVhZGVyU3ViamVjdEluaXRpYWxpemVkID0gZmFsc2U7XHJcbiAgcHJpdmF0ZSBfaXNDbG9zZWQgPSBmYWxzZTtcclxuICBwcml2YXRlIF9lbGVjdG9yOiBMZWFkZXJFbGVjdG9yO1xyXG4gIHByaXZhdGUgX3NpbGVudFJlbmV3RmluaXNoZWRDaGFubmVsOiBCcm9hZGNhc3RDaGFubmVsO1xyXG4gIHByaXZhdGUgX2xlYWRlckNoYW5uZWw6IEJyb2FkY2FzdENoYW5uZWw7XHJcbiAgcHJpdmF0ZSBfc2lsZW50UmVuZXdGaW5pc2hlZCQgPSBuZXcgUmVwbGF5U3ViamVjdDxib29sZWFuPigxKTtcclxuICBwcml2YXRlIF9sZWFkZXJTdWJqZWN0SW5pdGlhbGl6ZWQkID0gbmV3IFJlcGxheVN1YmplY3Q8Ym9vbGVhbj4oMSk7XHJcblxyXG4gIHByaXZhdGUgX2N1cnJlbnRSYW5kb21JZCA9IGAke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1fJHtuZXcgRGF0ZSgpLmdldFVUQ01pbGxpc2Vjb25kcygpfWA7XHJcbiAgcHJpdmF0ZSBfcHJlZml4OiBzdHJpbmc7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlcixcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgcHVibGljRXZlbnRzU2VydmljZTogUHVibGljRXZlbnRzU2VydmljZSxcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZVxyXG4gICkge1xyXG4gICAgdGhpcy5Jbml0aWFsaXphdGlvbigpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBpc0Nsb3NlZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl9pc0Nsb3NlZDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBpc0xlYWRlckNoZWNrKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBpc0xlYWRlckNoZWNrID4gcHJlZml4OiAke3RoaXMuX3ByZWZpeH0gPiBjdXJyZW50UmFuZG9tSWQ6ICR7dGhpcy5fY3VycmVudFJhbmRvbUlkfWApO1xyXG5cclxuICAgIGlmICghdGhpcy5faXNMZWFkZXJTdWJqZWN0SW5pdGlhbGl6ZWQpIHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKFxyXG4gICAgICAgIGBpc0xlYWRlckNoZWNrID4gSVMgTEVBREVSIElTIE5PVCBJTklUSUFMSVpFRCA+IHByZWZpeDogJHt0aGlzLl9wcmVmaXh9ID4gY3VycmVudFJhbmRvbUlkOiAke3RoaXMuX2N1cnJlbnRSYW5kb21JZH1gXHJcbiAgICAgICk7XHJcbiAgICAgIHJldHVybiB0aGlzLl9sZWFkZXJTdWJqZWN0SW5pdGlhbGl6ZWQkXHJcbiAgICAgICAgLmFzT2JzZXJ2YWJsZSgpXHJcbiAgICAgICAgLnBpcGUoXHJcbiAgICAgICAgICB0YWtlKDEpLFxyXG4gICAgICAgICAgc3dpdGNoTWFwKCgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIG9mKHRoaXMuX2VsZWN0b3IuaXNMZWFkZXIpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICApXHJcbiAgICAgICAgLnRvUHJvbWlzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhcclxuICAgICAgYGlzTGVhZGVyQ2hlY2sgPiBJUyBMRUFERVIgSVMgQUxSRUFEWSBJTklUSUFMSVpFRCBTVUNDRVNTRlVMTFk+IHByZWZpeDogJHt0aGlzLl9wcmVmaXh9ID4gY3VycmVudFJhbmRvbUlkOiAke3RoaXMuX2N1cnJlbnRSYW5kb21JZH1gXHJcbiAgICApO1xyXG5cclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBjb25zdCBpc0xlYWRlciA9IHRoaXMuX2VsZWN0b3IuaXNMZWFkZXI7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoXHJcbiAgICAgICAgICBgaXNMZWFkZXJDaGVjayA+IHByZWZpeDogJHt0aGlzLl9wcmVmaXh9ID4gY3VycmVudFJhbmRvbUlkOiAke3RoaXMuX2N1cnJlbnRSYW5kb21JZH0gPiBpbnNpZGUgc2V0VGltZW91dCBpc0xlYWRlciA9ICR7aXNMZWFkZXJ9YFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgcmVzb2x2ZShpc0xlYWRlcik7XHJcbiAgICAgIH0sIDEwMDApO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0U2lsZW50UmVuZXdGaW5pc2hlZE9ic2VydmFibGUoKTogT2JzZXJ2YWJsZTxib29sZWFuPiB7XHJcbiAgICByZXR1cm4gdGhpcy5fc2lsZW50UmVuZXdGaW5pc2hlZCQuYXNPYnNlcnZhYmxlKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2VuZFNpbGVudFJlbmV3RmluaXNoZWROb3RpZmljYXRpb24oKSB7XHJcbiAgICBpZiAoIXRoaXMuX3NpbGVudFJlbmV3RmluaXNoZWRDaGFubmVsKSB7XHJcbiAgICAgIHRoaXMuX3NpbGVudFJlbmV3RmluaXNoZWRDaGFubmVsID0gbmV3IEJyb2FkY2FzdENoYW5uZWwoYCR7dGhpcy5fcHJlZml4fV9zaWxlbnRfcmVuZXdfZmluaXNoZWRgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9zaWxlbnRSZW5ld0ZpbmlzaGVkQ2hhbm5lbC5wb3N0TWVzc2FnZShgU2lsZW50IHJlbmV3IGZpbmlzaGVkIGJ5IF9jdXJyZW50UmFuZG9tSWQgJHt0aGlzLl9jdXJyZW50UmFuZG9tSWR9YCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgY2xvc2VUYWJTeW5jaHJvbml6YXRpb24oKTogdm9pZCB7XHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZyhcclxuICAgICAgYFRhYiBzeW5jaHJvbml6YXRpb24gaGFzIGJlZW4gY2xvc2VkID4gcHJlZml4OiAke3RoaXMuX3ByZWZpeH0gPiBjdXJyZW50UmFuZG9tSWQ6ICR7dGhpcy5fY3VycmVudFJhbmRvbUlkfWBcclxuICAgICk7XHJcbiAgICB0aGlzLl9lbGVjdG9yLmRpZSgpO1xyXG4gICAgdGhpcy5fc2lsZW50UmVuZXdGaW5pc2hlZENoYW5uZWwuY2xvc2UoKTtcclxuICAgIHRoaXMuX2xlYWRlckNoYW5uZWwuY2xvc2UoKTtcclxuICAgIHRoaXMuX2lzTGVhZGVyU3ViamVjdEluaXRpYWxpemVkID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5faXNDbG9zZWQgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlSW5pdGlhbGl6ZSgpOiB2b2lkIHtcclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnVGFic1N5bmNocm9uaXphdGlvblNlcnZpY2UgcmUtaW5pdGlhbGl6YXRpb24gcHJvY2VzcyBzdGFydGVkLi4uJyk7XHJcblxyXG4gICAgaWYgKCF0aGlzLl9pc0Nsb3NlZCkge1xyXG4gICAgICB0aHJvdyBFcnJvcignVGFic1N5bmNocm9uaXphdGlvblNlcnZpY2UgY2Fubm90IGJlIHJlLWluaXRpYWxpemVkIHdoZW4gaXQgaXMgbm90IGNsb3NlZC4nKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9zaWxlbnRSZW5ld0ZpbmlzaGVkJCA9IG5ldyBSZXBsYXlTdWJqZWN0PGJvb2xlYW4+KDEpO1xyXG4gICAgdGhpcy5fbGVhZGVyU3ViamVjdEluaXRpYWxpemVkJCA9IG5ldyBSZXBsYXlTdWJqZWN0PGJvb2xlYW4+KDEpO1xyXG5cclxuICAgIHRoaXMuSW5pdGlhbGl6YXRpb24oKTtcclxuXHJcbiAgICB0aGlzLl9pc0Nsb3NlZCA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBJbml0aWFsaXphdGlvbigpOiB2b2lkIHtcclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnVGFic1N5bmNocm9uaXphdGlvblNlcnZpY2UgPiBJbml0aWFsaXphdGlvbiBzdGFydGVkJyk7XHJcbiAgICB0aGlzLl9wcmVmaXggPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uPy5jbGllbnRJZCB8fCAnJztcclxuICAgIHRoaXMuX2xlYWRlckNoYW5uZWwgPSBuZXcgQnJvYWRjYXN0Q2hhbm5lbChgJHt0aGlzLl9wcmVmaXh9X2xlYWRlcmApO1xyXG5cclxuICAgIHRoaXMuX2VsZWN0b3IgPSBjcmVhdGVMZWFkZXJFbGVjdGlvbih0aGlzLl9sZWFkZXJDaGFubmVsLCB7XHJcbiAgICAgIGZhbGxiYWNrSW50ZXJ2YWw6IDIwMDAsIC8vIG9wdGlvbmFsIGNvbmZpZ3VyYXRpb24gZm9yIGhvdyBvZnRlbiB3aWxsIHJlbmVnb3RpYXRpb24gZm9yIGxlYWRlciBvY2N1clxyXG4gICAgICByZXNwb25zZVRpbWU6IDEwMDAsIC8vIG9wdGlvbmFsIGNvbmZpZ3VyYXRpb24gZm9yIGhvdyBsb25nIHdpbGwgaW5zdGFuY2VzIGhhdmUgdG8gcmVzcG9uZFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5fZWxlY3Rvci5hcHBseU9uY2UoKS50aGVuKChpc0xlYWRlcikgPT4ge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ0ZJUlNUIGFwcGx5T25jZSBmaW5pc2hlZC4uLicpO1xyXG4gICAgICB0aGlzLl9pc0xlYWRlclN1YmplY3RJbml0aWFsaXplZCA9IHRydWU7XHJcbiAgICAgIHRoaXMuX2xlYWRlclN1YmplY3RJbml0aWFsaXplZCQubmV4dCh0cnVlKTtcclxuXHJcbiAgICAgIGlmICghaXNMZWFkZXIpIHtcclxuICAgICAgICB0aGlzLl9lbGVjdG9yLmF3YWl0TGVhZGVyc2hpcCgpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKFxyXG4gICAgICAgICAgICBgRlJPTSBhd2FpdExlYWRlcnNoaXAgPiB0aGlzIHRhYiBpcyBub3cgbGVhZGVyID4gcHJlZml4OiAke3RoaXMuX3ByZWZpeH0gPiBjdXJyZW50UmFuZG9tSWQ6ICR7dGhpcy5fY3VycmVudFJhbmRvbUlkfWBcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKFxyXG4gICAgICAgICAgYEZST00gSU5JVElBTElaQVRJT04gRklSU1QgYXBwbHlPbmNlID4gdGhpcyB0YWIgaXMgbm93IGxlYWRlciA+IHByZWZpeDogJHt0aGlzLl9wcmVmaXh9ID4gY3VycmVudFJhbmRvbUlkOiAke3RoaXMuX2N1cnJlbnRSYW5kb21JZH1gXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5pbml0aWFsaXplU2lsZW50UmVuZXdGaW5pc2hlZENoYW5uZWxXaXRoSGFuZGxlcigpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBpbml0aWFsaXplU2lsZW50UmVuZXdGaW5pc2hlZENoYW5uZWxXaXRoSGFuZGxlcigpOiB2b2lkIHtcclxuICAgIHRoaXMuX3NpbGVudFJlbmV3RmluaXNoZWRDaGFubmVsID0gbmV3IEJyb2FkY2FzdENoYW5uZWwoYCR7dGhpcy5fcHJlZml4fV9zaWxlbnRfcmVuZXdfZmluaXNoZWRgKTtcclxuICAgIHRoaXMuX3NpbGVudFJlbmV3RmluaXNoZWRDaGFubmVsLm9ubWVzc2FnZSA9ICgpID0+IHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKFxyXG4gICAgICAgIGBGUk9NIFNJTEVOVCBSRU5FVyBGSU5JU0hFRCBSRUNJVkVEIEVWRU5UID4gcHJlZml4OiAke3RoaXMuX3ByZWZpeH0gPiBjdXJyZW50UmFuZG9tSWQ6ICR7dGhpcy5fY3VycmVudFJhbmRvbUlkfWBcclxuICAgICAgKTtcclxuICAgICAgdGhpcy5fc2lsZW50UmVuZXdGaW5pc2hlZCQubmV4dCh0cnVlKTtcclxuICAgICAgdGhpcy5wdWJsaWNFdmVudHNTZXJ2aWNlLmZpcmVFdmVudChFdmVudFR5cGVzLlNpbGVudFJlbmV3RmluaXNoZWQsIHRydWUpO1xyXG4gICAgfTtcclxuICB9XHJcbn1cclxuIl19