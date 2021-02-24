import { Injectable } from '@angular/core';
import { BroadcastChannel, createLeaderElection } from 'broadcast-channel';
import * as i0 from "@angular/core";
import * as i1 from "../config/config.provider";
export class TabsSynchronizationService {
    constructor(configurationProvider) {
        this.configurationProvider = configurationProvider;
        this._isLeaderSubjectInitialized = false;
        this._currentRandomId = `${Math.random().toString(36).substr(2, 9)}_${new Date().getUTCMilliseconds()}`;
        this.Initialization();
    }
    Initialization() {
        var _a;
        console.log('TabsSynchronizationService > Initialization started');
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
            console.log(`this tab is now leader > prefix: ${this._prefix} > currentRandomId: ${this._currentRandomId}`);
        });
    }
    isLeaderCheck() {
        return new Promise((resolve) => {
            console.log(`isLeaderCheck > prefix: ${this._prefix} > currentRandomId: ${this._currentRandomId}`);
            if (!this._isLeaderSubjectInitialized) {
                console.warn(`isLeaderCheck > prefix: ${this._prefix} > currentRandomId: ${this._currentRandomId} > leader subject doesn't initialized`);
                resolve(false);
                return;
            }
            setTimeout(() => {
                const isLeader = this._elector.isLeader;
                console.warn(`isLeaderCheck > prefix: ${this._prefix} > currentRandomId: ${this._currentRandomId} > inside setTimeout isLeader = ${isLeader}`);
                resolve(isLeader);
            }, 1000);
        });
    }
    addHandlerOnSilentRenewFinishedChannel(handler) {
        if (!this._silentRenewFinishedChannel) {
            this._silentRenewFinishedChannel = new BroadcastChannel(`${this._prefix}_silent_renew_finished`);
        }
        this._silentRenewFinishedChannel.onmessage = handler;
    }
    silentRenewFinishedNotification() {
        if (!this._silentRenewFinishedChannel) {
            this._silentRenewFinishedChannel = new BroadcastChannel(`${this._prefix}_silent_renew_finished`);
        }
        this._silentRenewFinishedChannel.postMessage(`Silent renew finished by _currentRandomId ${this._currentRandomId}`);
    }
}
TabsSynchronizationService.ɵfac = function TabsSynchronizationService_Factory(t) { return new (t || TabsSynchronizationService)(i0.ɵɵinject(i1.ConfigurationProvider)); };
TabsSynchronizationService.ɵprov = i0.ɵɵdefineInjectable({ token: TabsSynchronizationService, factory: TabsSynchronizationService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(TabsSynchronizationService, [{
        type: Injectable
    }], function () { return [{ type: i1.ConfigurationProvider }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFicy1zeW5jaHJvbml6YXRpb24uc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjLyIsInNvdXJjZXMiOlsibGliL2lmcmFtZS90YWJzLXN5bmNocm9uaXphdGlvbi5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLGdCQUFnQixFQUFFLG9CQUFvQixFQUFpQixNQUFNLG1CQUFtQixDQUFDOzs7QUFJMUYsTUFBTSxPQUFPLDBCQUEwQjtJQVFyQyxZQUE2QixxQkFBNEM7UUFBNUMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQVBqRSxnQ0FBMkIsR0FBRyxLQUFLLENBQUM7UUFJcEMscUJBQWdCLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLENBQUM7UUFJekcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFFTyxjQUFjOztRQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLHFEQUFxRCxDQUFDLENBQUM7UUFDbkUsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFBLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxtQkFBbUIsMENBQUUsUUFBUSxLQUFJLEVBQUUsQ0FBQztRQUM5RSxNQUFNLE9BQU8sR0FBRyxJQUFJLGdCQUFnQixDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sU0FBUyxDQUFDLENBQUM7UUFFL0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUU7WUFDNUMsZ0JBQWdCLEVBQUUsSUFBSTtZQUN0QixZQUFZLEVBQUUsSUFBSTtTQUNuQixDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDeEMsSUFBSSxDQUFDLElBQUksQ0FBQywyQkFBMkIsRUFBRTtnQkFDckMsSUFBSSxDQUFDLDJCQUEyQixHQUFHLElBQUksQ0FBQzthQUN6QztZQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLElBQUksQ0FBQyxPQUFPLHVCQUF1QixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO1FBQzlHLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVNLGFBQWE7UUFDbEIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQzdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLElBQUksQ0FBQyxPQUFPLHVCQUF1QixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO1lBQ25HLElBQUksQ0FBQyxJQUFJLENBQUMsMkJBQTJCLEVBQUU7Z0JBQ3JDLE9BQU8sQ0FBQyxJQUFJLENBQ1YsMkJBQTJCLElBQUksQ0FBQyxPQUFPLHVCQUF1QixJQUFJLENBQUMsZ0JBQWdCLHVDQUF1QyxDQUMzSCxDQUFDO2dCQUNGLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDZixPQUFPO2FBQ1I7WUFFRCxVQUFVLENBQUMsR0FBRyxFQUFFO2dCQUNkLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO2dCQUN4QyxPQUFPLENBQUMsSUFBSSxDQUNWLDJCQUEyQixJQUFJLENBQUMsT0FBTyx1QkFBdUIsSUFBSSxDQUFDLGdCQUFnQixtQ0FBbUMsUUFBUSxFQUFFLENBQ2pJLENBQUM7Z0JBQ0YsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3BCLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNYLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVNLHNDQUFzQyxDQUFDLE9BQVk7UUFDeEQsSUFBSSxDQUFDLElBQUksQ0FBQywyQkFBMkIsRUFBRTtZQUNyQyxJQUFJLENBQUMsMkJBQTJCLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLHdCQUF3QixDQUFDLENBQUM7U0FDbEc7UUFFRCxJQUFJLENBQUMsMkJBQTJCLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQztJQUN2RCxDQUFDO0lBRU0sK0JBQStCO1FBQ3BDLElBQUksQ0FBQyxJQUFJLENBQUMsMkJBQTJCLEVBQUU7WUFDckMsSUFBSSxDQUFDLDJCQUEyQixHQUFHLElBQUksZ0JBQWdCLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyx3QkFBd0IsQ0FBQyxDQUFDO1NBQ2xHO1FBRUQsSUFBSSxDQUFDLDJCQUEyQixDQUFDLFdBQVcsQ0FBQyw2Q0FBNkMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztJQUNySCxDQUFDOztvR0FsRVUsMEJBQTBCO2tFQUExQiwwQkFBMEIsV0FBMUIsMEJBQTBCO2tEQUExQiwwQkFBMEI7Y0FEdEMsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgQnJvYWRjYXN0Q2hhbm5lbCwgY3JlYXRlTGVhZGVyRWxlY3Rpb24sIExlYWRlckVsZWN0b3IgfSBmcm9tICdicm9hZGNhc3QtY2hhbm5lbCc7XHJcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25Qcm92aWRlciB9IGZyb20gJy4uL2NvbmZpZy9jb25maWcucHJvdmlkZXInO1xyXG5cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgVGFic1N5bmNocm9uaXphdGlvblNlcnZpY2Uge1xyXG4gIHByaXZhdGUgX2lzTGVhZGVyU3ViamVjdEluaXRpYWxpemVkID0gZmFsc2U7XHJcbiAgcHJpdmF0ZSBfZWxlY3RvcjogTGVhZGVyRWxlY3RvcjtcclxuICBwcml2YXRlIF9zaWxlbnRSZW5ld0ZpbmlzaGVkQ2hhbm5lbDogQnJvYWRjYXN0Q2hhbm5lbDtcclxuXHJcbiAgcHJpdmF0ZSBfY3VycmVudFJhbmRvbUlkID0gYCR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfV8ke25ldyBEYXRlKCkuZ2V0VVRDTWlsbGlzZWNvbmRzKCl9YDtcclxuICBwcml2YXRlIF9wcmVmaXg6IHN0cmluZztcclxuXHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlcikge1xyXG4gICAgdGhpcy5Jbml0aWFsaXphdGlvbigpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBJbml0aWFsaXphdGlvbigpOiB2b2lkIHtcclxuICAgIGNvbnNvbGUubG9nKCdUYWJzU3luY2hyb25pemF0aW9uU2VydmljZSA+IEluaXRpYWxpemF0aW9uIHN0YXJ0ZWQnKTtcclxuICAgIHRoaXMuX3ByZWZpeCA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24/LmNsaWVudElkIHx8ICcnO1xyXG4gICAgY29uc3QgY2hhbm5lbCA9IG5ldyBCcm9hZGNhc3RDaGFubmVsKGAke3RoaXMuX3ByZWZpeH1fbGVhZGVyYCk7XHJcblxyXG4gICAgdGhpcy5fZWxlY3RvciA9IGNyZWF0ZUxlYWRlckVsZWN0aW9uKGNoYW5uZWwsIHtcclxuICAgICAgZmFsbGJhY2tJbnRlcnZhbDogMjAwMCwgLy8gb3B0aW9uYWwgY29uZmlndXJhdGlvbiBmb3IgaG93IG9mdGVuIHdpbGwgcmVuZWdvdGlhdGlvbiBmb3IgbGVhZGVyIG9jY3VyXHJcbiAgICAgIHJlc3BvbnNlVGltZTogMTAwMCwgLy8gb3B0aW9uYWwgY29uZmlndXJhdGlvbiBmb3IgaG93IGxvbmcgd2lsbCBpbnN0YW5jZXMgaGF2ZSB0byByZXNwb25kXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLl9lbGVjdG9yLmF3YWl0TGVhZGVyc2hpcCgpLnRoZW4oKCkgPT4ge1xyXG4gICAgICBpZiAoIXRoaXMuX2lzTGVhZGVyU3ViamVjdEluaXRpYWxpemVkKSB7XHJcbiAgICAgICAgdGhpcy5faXNMZWFkZXJTdWJqZWN0SW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zb2xlLmxvZyhgdGhpcyB0YWIgaXMgbm93IGxlYWRlciA+IHByZWZpeDogJHt0aGlzLl9wcmVmaXh9ID4gY3VycmVudFJhbmRvbUlkOiAke3RoaXMuX2N1cnJlbnRSYW5kb21JZH1gKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGlzTGVhZGVyQ2hlY2soKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgY29uc29sZS5sb2coYGlzTGVhZGVyQ2hlY2sgPiBwcmVmaXg6ICR7dGhpcy5fcHJlZml4fSA+IGN1cnJlbnRSYW5kb21JZDogJHt0aGlzLl9jdXJyZW50UmFuZG9tSWR9YCk7XHJcbiAgICAgIGlmICghdGhpcy5faXNMZWFkZXJTdWJqZWN0SW5pdGlhbGl6ZWQpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oXHJcbiAgICAgICAgICBgaXNMZWFkZXJDaGVjayA+IHByZWZpeDogJHt0aGlzLl9wcmVmaXh9ID4gY3VycmVudFJhbmRvbUlkOiAke3RoaXMuX2N1cnJlbnRSYW5kb21JZH0gPiBsZWFkZXIgc3ViamVjdCBkb2Vzbid0IGluaXRpYWxpemVkYFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBjb25zdCBpc0xlYWRlciA9IHRoaXMuX2VsZWN0b3IuaXNMZWFkZXI7XHJcbiAgICAgICAgY29uc29sZS53YXJuKFxyXG4gICAgICAgICAgYGlzTGVhZGVyQ2hlY2sgPiBwcmVmaXg6ICR7dGhpcy5fcHJlZml4fSA+IGN1cnJlbnRSYW5kb21JZDogJHt0aGlzLl9jdXJyZW50UmFuZG9tSWR9ID4gaW5zaWRlIHNldFRpbWVvdXQgaXNMZWFkZXIgPSAke2lzTGVhZGVyfWBcclxuICAgICAgICApO1xyXG4gICAgICAgIHJlc29sdmUoaXNMZWFkZXIpO1xyXG4gICAgICB9LCAxMDAwKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGFkZEhhbmRsZXJPblNpbGVudFJlbmV3RmluaXNoZWRDaGFubmVsKGhhbmRsZXI6IGFueSk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLl9zaWxlbnRSZW5ld0ZpbmlzaGVkQ2hhbm5lbCkge1xyXG4gICAgICB0aGlzLl9zaWxlbnRSZW5ld0ZpbmlzaGVkQ2hhbm5lbCA9IG5ldyBCcm9hZGNhc3RDaGFubmVsKGAke3RoaXMuX3ByZWZpeH1fc2lsZW50X3JlbmV3X2ZpbmlzaGVkYCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fc2lsZW50UmVuZXdGaW5pc2hlZENoYW5uZWwub25tZXNzYWdlID0gaGFuZGxlcjtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzaWxlbnRSZW5ld0ZpbmlzaGVkTm90aWZpY2F0aW9uKCkge1xyXG4gICAgaWYgKCF0aGlzLl9zaWxlbnRSZW5ld0ZpbmlzaGVkQ2hhbm5lbCkge1xyXG4gICAgICB0aGlzLl9zaWxlbnRSZW5ld0ZpbmlzaGVkQ2hhbm5lbCA9IG5ldyBCcm9hZGNhc3RDaGFubmVsKGAke3RoaXMuX3ByZWZpeH1fc2lsZW50X3JlbmV3X2ZpbmlzaGVkYCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fc2lsZW50UmVuZXdGaW5pc2hlZENoYW5uZWwucG9zdE1lc3NhZ2UoYFNpbGVudCByZW5ldyBmaW5pc2hlZCBieSBfY3VycmVudFJhbmRvbUlkICR7dGhpcy5fY3VycmVudFJhbmRvbUlkfWApO1xyXG4gIH1cclxufVxyXG4iXX0=