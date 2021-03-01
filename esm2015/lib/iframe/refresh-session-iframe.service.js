import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "../logging/logger.service";
import * as i2 from "../utils/url/url.service";
import * as i3 from "./silent-renew.service";
export class RefreshSessionIframeService {
    constructor(doc, loggerService, urlService, silentRenewService, rendererFactory) {
        this.doc = doc;
        this.loggerService = loggerService;
        this.urlService = urlService;
        this.silentRenewService = silentRenewService;
        this.renderer = rendererFactory.createRenderer(null, null);
    }
    refreshSessionWithIframe(customParams, authStateLauchedType) {
        this.loggerService.logDebug('BEGIN refresh session Authorize Iframe renew');
        const url = this.urlService.getRefreshSessionSilentRenewUrl(customParams, authStateLauchedType);
        return this.sendAuthorizeReqestUsingSilentRenew(url);
    }
    sendAuthorizeReqestUsingSilentRenew(url) {
        const sessionIframe = this.silentRenewService.getOrCreateIframe();
        this.initSilentRenewRequest();
        this.loggerService.logDebug('sendAuthorizeReqestUsingSilentRenew for URL:' + url);
        return new Observable((observer) => {
            const onLoadHandler = () => {
                sessionIframe.removeEventListener('load', onLoadHandler);
                this.loggerService.logDebug('removed event listener from IFrame');
                observer.next(true);
                observer.complete();
            };
            sessionIframe.addEventListener('load', onLoadHandler);
            sessionIframe.contentWindow.location.replace(url);
        });
    }
    initSilentRenewRequest() {
        const instanceId = Math.random();
        const initDestroyHandler = this.renderer.listen('window', 'oidc-silent-renew-init', (e) => {
            if (e.detail !== instanceId) {
                initDestroyHandler();
                renewDestroyHandler();
            }
        });
        const renewDestroyHandler = this.renderer.listen('window', 'oidc-silent-renew-message', (e) => this.silentRenewService.silentRenewEventHandler(e));
        this.doc.defaultView.dispatchEvent(new CustomEvent('oidc-silent-renew-init', {
            detail: instanceId,
        }));
    }
}
RefreshSessionIframeService.ɵfac = function RefreshSessionIframeService_Factory(t) { return new (t || RefreshSessionIframeService)(i0.ɵɵinject(DOCUMENT), i0.ɵɵinject(i1.LoggerService), i0.ɵɵinject(i2.UrlService), i0.ɵɵinject(i3.SilentRenewService), i0.ɵɵinject(i0.RendererFactory2)); };
RefreshSessionIframeService.ɵprov = i0.ɵɵdefineInjectable({ token: RefreshSessionIframeService, factory: RefreshSessionIframeService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(RefreshSessionIframeService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], function () { return [{ type: undefined, decorators: [{
                type: Inject,
                args: [DOCUMENT]
            }] }, { type: i1.LoggerService }, { type: i2.UrlService }, { type: i3.SilentRenewService }, { type: i0.RendererFactory2 }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmcmVzaC1zZXNzaW9uLWlmcmFtZS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvIiwic291cmNlcyI6WyJsaWIvaWZyYW1lL3JlZnJlc2gtc2Vzc2lvbi1pZnJhbWUuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDM0MsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQStCLE1BQU0sZUFBZSxDQUFDO0FBQ2hGLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxNQUFNLENBQUM7Ozs7O0FBT2xDLE1BQU0sT0FBTywyQkFBMkI7SUFHdEMsWUFDcUMsR0FBUSxFQUNuQyxhQUE0QixFQUM1QixVQUFzQixFQUN0QixrQkFBc0MsRUFDOUMsZUFBaUM7UUFKRSxRQUFHLEdBQUgsR0FBRyxDQUFLO1FBQ25DLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLGVBQVUsR0FBVixVQUFVLENBQVk7UUFDdEIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtRQUc5QyxJQUFJLENBQUMsUUFBUSxHQUFHLGVBQWUsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFRCx3QkFBd0IsQ0FDdEIsWUFBMkQsRUFDM0Qsb0JBQTJDO1FBRTNDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLDhDQUE4QyxDQUFDLENBQUM7UUFDNUUsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQywrQkFBK0IsQ0FBQyxZQUFZLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztRQUNoRyxPQUFPLElBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRU8sbUNBQW1DLENBQUMsR0FBVztRQUNyRCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUNsRSxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztRQUM5QixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyw4Q0FBOEMsR0FBRyxHQUFHLENBQUMsQ0FBQztRQUVsRixPQUFPLElBQUksVUFBVSxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUU7WUFDakMsTUFBTSxhQUFhLEdBQUcsR0FBRyxFQUFFO2dCQUN6QixhQUFhLENBQUMsbUJBQW1CLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUN6RCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO2dCQUNsRSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNwQixRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDdEIsQ0FBQyxDQUFDO1lBQ0YsYUFBYSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsQ0FBQztZQUN0RCxhQUFhLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDcEQsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU8sc0JBQXNCO1FBQzVCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUVqQyxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSx3QkFBd0IsRUFBRSxDQUFDLENBQWMsRUFBRSxFQUFFO1lBQ3JHLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxVQUFVLEVBQUU7Z0JBQzNCLGtCQUFrQixFQUFFLENBQUM7Z0JBQ3JCLG1CQUFtQixFQUFFLENBQUM7YUFDdkI7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLDJCQUEyQixFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FDNUYsSUFBSSxDQUFDLGtCQUFrQixDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUNuRCxDQUFDO1FBRUYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUNoQyxJQUFJLFdBQVcsQ0FBQyx3QkFBd0IsRUFBRTtZQUN4QyxNQUFNLEVBQUUsVUFBVTtTQUNuQixDQUFDLENBQ0gsQ0FBQztJQUNKLENBQUM7O3NHQXpEVSwyQkFBMkIsY0FJNUIsUUFBUTttRUFKUCwyQkFBMkIsV0FBM0IsMkJBQTJCLG1CQURkLE1BQU07a0RBQ25CLDJCQUEyQjtjQUR2QyxVQUFVO2VBQUMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFOztzQkFLN0IsTUFBTTt1QkFBQyxRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRE9DVU1FTlQgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xyXG5pbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUsIFJlbmRlcmVyMiwgUmVuZGVyZXJGYWN0b3J5MiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IEF1dGhTdGF0ZUxhdWNoZWRUeXBlIH0gZnJvbSAnLi4vZmxvd3MvZmxvd3MtZGF0YS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBVcmxTZXJ2aWNlIH0gZnJvbSAnLi4vdXRpbHMvdXJsL3VybC5zZXJ2aWNlJztcclxuaW1wb3J0IHsgU2lsZW50UmVuZXdTZXJ2aWNlIH0gZnJvbSAnLi9zaWxlbnQtcmVuZXcuc2VydmljZSc7XHJcblxyXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxyXG5leHBvcnQgY2xhc3MgUmVmcmVzaFNlc3Npb25JZnJhbWVTZXJ2aWNlIHtcclxuICBwcml2YXRlIHJlbmRlcmVyOiBSZW5kZXJlcjI7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgQEluamVjdChET0NVTUVOVCkgcHJpdmF0ZSByZWFkb25seSBkb2M6IGFueSxcclxuICAgIHByaXZhdGUgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZSxcclxuICAgIHByaXZhdGUgdXJsU2VydmljZTogVXJsU2VydmljZSxcclxuICAgIHByaXZhdGUgc2lsZW50UmVuZXdTZXJ2aWNlOiBTaWxlbnRSZW5ld1NlcnZpY2UsXHJcbiAgICByZW5kZXJlckZhY3Rvcnk6IFJlbmRlcmVyRmFjdG9yeTJcclxuICApIHtcclxuICAgIHRoaXMucmVuZGVyZXIgPSByZW5kZXJlckZhY3RvcnkuY3JlYXRlUmVuZGVyZXIobnVsbCwgbnVsbCk7XHJcbiAgfVxyXG5cclxuICByZWZyZXNoU2Vzc2lvbldpdGhJZnJhbWUoXHJcbiAgICBjdXN0b21QYXJhbXM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfSxcclxuICAgIGF1dGhTdGF0ZUxhdWNoZWRUeXBlPzogQXV0aFN0YXRlTGF1Y2hlZFR5cGVcclxuICApOiBPYnNlcnZhYmxlPGJvb2xlYW4+IHtcclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnQkVHSU4gcmVmcmVzaCBzZXNzaW9uIEF1dGhvcml6ZSBJZnJhbWUgcmVuZXcnKTtcclxuICAgIGNvbnN0IHVybCA9IHRoaXMudXJsU2VydmljZS5nZXRSZWZyZXNoU2Vzc2lvblNpbGVudFJlbmV3VXJsKGN1c3RvbVBhcmFtcywgYXV0aFN0YXRlTGF1Y2hlZFR5cGUpO1xyXG4gICAgcmV0dXJuIHRoaXMuc2VuZEF1dGhvcml6ZVJlcWVzdFVzaW5nU2lsZW50UmVuZXcodXJsKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2VuZEF1dGhvcml6ZVJlcWVzdFVzaW5nU2lsZW50UmVuZXcodXJsOiBzdHJpbmcpOiBPYnNlcnZhYmxlPGJvb2xlYW4+IHtcclxuICAgIGNvbnN0IHNlc3Npb25JZnJhbWUgPSB0aGlzLnNpbGVudFJlbmV3U2VydmljZS5nZXRPckNyZWF0ZUlmcmFtZSgpO1xyXG4gICAgdGhpcy5pbml0U2lsZW50UmVuZXdSZXF1ZXN0KCk7XHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ3NlbmRBdXRob3JpemVSZXFlc3RVc2luZ1NpbGVudFJlbmV3IGZvciBVUkw6JyArIHVybCk7XHJcblxyXG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKChvYnNlcnZlcikgPT4ge1xyXG4gICAgICBjb25zdCBvbkxvYWRIYW5kbGVyID0gKCkgPT4ge1xyXG4gICAgICAgIHNlc3Npb25JZnJhbWUucmVtb3ZlRXZlbnRMaXN0ZW5lcignbG9hZCcsIG9uTG9hZEhhbmRsZXIpO1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygncmVtb3ZlZCBldmVudCBsaXN0ZW5lciBmcm9tIElGcmFtZScpO1xyXG4gICAgICAgIG9ic2VydmVyLm5leHQodHJ1ZSk7XHJcbiAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcclxuICAgICAgfTtcclxuICAgICAgc2Vzc2lvbklmcmFtZS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgb25Mb2FkSGFuZGxlcik7XHJcbiAgICAgIHNlc3Npb25JZnJhbWUuY29udGVudFdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKHVybCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaW5pdFNpbGVudFJlbmV3UmVxdWVzdCgpIHtcclxuICAgIGNvbnN0IGluc3RhbmNlSWQgPSBNYXRoLnJhbmRvbSgpO1xyXG5cclxuICAgIGNvbnN0IGluaXREZXN0cm95SGFuZGxlciA9IHRoaXMucmVuZGVyZXIubGlzdGVuKCd3aW5kb3cnLCAnb2lkYy1zaWxlbnQtcmVuZXctaW5pdCcsIChlOiBDdXN0b21FdmVudCkgPT4ge1xyXG4gICAgICBpZiAoZS5kZXRhaWwgIT09IGluc3RhbmNlSWQpIHtcclxuICAgICAgICBpbml0RGVzdHJveUhhbmRsZXIoKTtcclxuICAgICAgICByZW5ld0Rlc3Ryb3lIYW5kbGVyKCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgY29uc3QgcmVuZXdEZXN0cm95SGFuZGxlciA9IHRoaXMucmVuZGVyZXIubGlzdGVuKCd3aW5kb3cnLCAnb2lkYy1zaWxlbnQtcmVuZXctbWVzc2FnZScsIChlKSA9PlxyXG4gICAgICB0aGlzLnNpbGVudFJlbmV3U2VydmljZS5zaWxlbnRSZW5ld0V2ZW50SGFuZGxlcihlKVxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLmRvYy5kZWZhdWx0Vmlldy5kaXNwYXRjaEV2ZW50KFxyXG4gICAgICBuZXcgQ3VzdG9tRXZlbnQoJ29pZGMtc2lsZW50LXJlbmV3LWluaXQnLCB7XHJcbiAgICAgICAgZGV0YWlsOiBpbnN0YW5jZUlkLFxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcbn1cclxuIl19