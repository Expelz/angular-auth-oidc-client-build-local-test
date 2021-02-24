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
    refreshSessionWithIframe(customParams) {
        this.loggerService.logDebug('BEGIN refresh session Authorize Iframe renew');
        const url = this.urlService.getRefreshSessionSilentRenewUrl(customParams);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmcmVzaC1zZXNzaW9uLWlmcmFtZS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvIiwic291cmNlcyI6WyJsaWIvaWZyYW1lL3JlZnJlc2gtc2Vzc2lvbi1pZnJhbWUuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDM0MsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQStCLE1BQU0sZUFBZSxDQUFDO0FBQ2hGLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxNQUFNLENBQUM7Ozs7O0FBTWxDLE1BQU0sT0FBTywyQkFBMkI7SUFHdEMsWUFDcUMsR0FBUSxFQUNuQyxhQUE0QixFQUM1QixVQUFzQixFQUN0QixrQkFBc0MsRUFDOUMsZUFBaUM7UUFKRSxRQUFHLEdBQUgsR0FBRyxDQUFLO1FBQ25DLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLGVBQVUsR0FBVixVQUFVLENBQVk7UUFDdEIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtRQUc5QyxJQUFJLENBQUMsUUFBUSxHQUFHLGVBQWUsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFRCx3QkFBd0IsQ0FBQyxZQUEyRDtRQUNsRixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO1FBQzVFLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsK0JBQStCLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUUsT0FBTyxJQUFJLENBQUMsbUNBQW1DLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVPLG1DQUFtQyxDQUFDLEdBQVc7UUFDckQsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDbEUsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsOENBQThDLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFFbEYsT0FBTyxJQUFJLFVBQVUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFO1lBQ2pDLE1BQU0sYUFBYSxHQUFHLEdBQUcsRUFBRTtnQkFDekIsYUFBYSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsQ0FBQztnQkFDekQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsb0NBQW9DLENBQUMsQ0FBQztnQkFDbEUsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDcEIsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3RCLENBQUMsQ0FBQztZQUNGLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDdEQsYUFBYSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3BELENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVPLHNCQUFzQjtRQUM1QixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFFakMsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsd0JBQXdCLEVBQUUsQ0FBQyxDQUFjLEVBQUUsRUFBRTtZQUNyRyxJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssVUFBVSxFQUFFO2dCQUMzQixrQkFBa0IsRUFBRSxDQUFDO2dCQUNyQixtQkFBbUIsRUFBRSxDQUFDO2FBQ3ZCO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSwyQkFBMkIsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQzVGLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsQ0FDbkQsQ0FBQztRQUVGLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FDaEMsSUFBSSxXQUFXLENBQUMsd0JBQXdCLEVBQUU7WUFDeEMsTUFBTSxFQUFFLFVBQVU7U0FDbkIsQ0FBQyxDQUNILENBQUM7SUFDSixDQUFDOztzR0F0RFUsMkJBQTJCLGNBSTVCLFFBQVE7bUVBSlAsMkJBQTJCLFdBQTNCLDJCQUEyQixtQkFEZCxNQUFNO2tEQUNuQiwyQkFBMkI7Y0FEdkMsVUFBVTtlQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRTs7c0JBSzdCLE1BQU07dUJBQUMsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERPQ1VNRU5UIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcclxuaW1wb3J0IHsgSW5qZWN0LCBJbmplY3RhYmxlLCBSZW5kZXJlcjIsIFJlbmRlcmVyRmFjdG9yeTIgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi4vbG9nZ2luZy9sb2dnZXIuc2VydmljZSc7XHJcbmltcG9ydCB7IFVybFNlcnZpY2UgfSBmcm9tICcuLi91dGlscy91cmwvdXJsLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBTaWxlbnRSZW5ld1NlcnZpY2UgfSBmcm9tICcuL3NpbGVudC1yZW5ldy5zZXJ2aWNlJztcclxuXHJcbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogJ3Jvb3QnIH0pXHJcbmV4cG9ydCBjbGFzcyBSZWZyZXNoU2Vzc2lvbklmcmFtZVNlcnZpY2Uge1xyXG4gIHByaXZhdGUgcmVuZGVyZXI6IFJlbmRlcmVyMjtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBASW5qZWN0KERPQ1VNRU5UKSBwcml2YXRlIHJlYWRvbmx5IGRvYzogYW55LFxyXG4gICAgcHJpdmF0ZSBsb2dnZXJTZXJ2aWNlOiBMb2dnZXJTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSB1cmxTZXJ2aWNlOiBVcmxTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBzaWxlbnRSZW5ld1NlcnZpY2U6IFNpbGVudFJlbmV3U2VydmljZSxcclxuICAgIHJlbmRlcmVyRmFjdG9yeTogUmVuZGVyZXJGYWN0b3J5MlxyXG4gICkge1xyXG4gICAgdGhpcy5yZW5kZXJlciA9IHJlbmRlcmVyRmFjdG9yeS5jcmVhdGVSZW5kZXJlcihudWxsLCBudWxsKTtcclxuICB9XHJcblxyXG4gIHJlZnJlc2hTZXNzaW9uV2l0aElmcmFtZShjdXN0b21QYXJhbXM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfSk6IE9ic2VydmFibGU8Ym9vbGVhbj4ge1xyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdCRUdJTiByZWZyZXNoIHNlc3Npb24gQXV0aG9yaXplIElmcmFtZSByZW5ldycpO1xyXG4gICAgY29uc3QgdXJsID0gdGhpcy51cmxTZXJ2aWNlLmdldFJlZnJlc2hTZXNzaW9uU2lsZW50UmVuZXdVcmwoY3VzdG9tUGFyYW1zKTtcclxuICAgIHJldHVybiB0aGlzLnNlbmRBdXRob3JpemVSZXFlc3RVc2luZ1NpbGVudFJlbmV3KHVybCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNlbmRBdXRob3JpemVSZXFlc3RVc2luZ1NpbGVudFJlbmV3KHVybDogc3RyaW5nKTogT2JzZXJ2YWJsZTxib29sZWFuPiB7XHJcbiAgICBjb25zdCBzZXNzaW9uSWZyYW1lID0gdGhpcy5zaWxlbnRSZW5ld1NlcnZpY2UuZ2V0T3JDcmVhdGVJZnJhbWUoKTtcclxuICAgIHRoaXMuaW5pdFNpbGVudFJlbmV3UmVxdWVzdCgpO1xyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdzZW5kQXV0aG9yaXplUmVxZXN0VXNpbmdTaWxlbnRSZW5ldyBmb3IgVVJMOicgKyB1cmwpO1xyXG5cclxuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZSgob2JzZXJ2ZXIpID0+IHtcclxuICAgICAgY29uc3Qgb25Mb2FkSGFuZGxlciA9ICgpID0+IHtcclxuICAgICAgICBzZXNzaW9uSWZyYW1lLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBvbkxvYWRIYW5kbGVyKTtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ3JlbW92ZWQgZXZlbnQgbGlzdGVuZXIgZnJvbSBJRnJhbWUnKTtcclxuICAgICAgICBvYnNlcnZlci5uZXh0KHRydWUpO1xyXG4gICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XHJcbiAgICAgIH07XHJcbiAgICAgIHNlc3Npb25JZnJhbWUuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIG9uTG9hZEhhbmRsZXIpO1xyXG4gICAgICBzZXNzaW9uSWZyYW1lLmNvbnRlbnRXaW5kb3cubG9jYXRpb24ucmVwbGFjZSh1cmwpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGluaXRTaWxlbnRSZW5ld1JlcXVlc3QoKSB7XHJcbiAgICBjb25zdCBpbnN0YW5jZUlkID0gTWF0aC5yYW5kb20oKTtcclxuXHJcbiAgICBjb25zdCBpbml0RGVzdHJveUhhbmRsZXIgPSB0aGlzLnJlbmRlcmVyLmxpc3Rlbignd2luZG93JywgJ29pZGMtc2lsZW50LXJlbmV3LWluaXQnLCAoZTogQ3VzdG9tRXZlbnQpID0+IHtcclxuICAgICAgaWYgKGUuZGV0YWlsICE9PSBpbnN0YW5jZUlkKSB7XHJcbiAgICAgICAgaW5pdERlc3Ryb3lIYW5kbGVyKCk7XHJcbiAgICAgICAgcmVuZXdEZXN0cm95SGFuZGxlcigpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIGNvbnN0IHJlbmV3RGVzdHJveUhhbmRsZXIgPSB0aGlzLnJlbmRlcmVyLmxpc3Rlbignd2luZG93JywgJ29pZGMtc2lsZW50LXJlbmV3LW1lc3NhZ2UnLCAoZSkgPT5cclxuICAgICAgdGhpcy5zaWxlbnRSZW5ld1NlcnZpY2Uuc2lsZW50UmVuZXdFdmVudEhhbmRsZXIoZSlcclxuICAgICk7XHJcblxyXG4gICAgdGhpcy5kb2MuZGVmYXVsdFZpZXcuZGlzcGF0Y2hFdmVudChcclxuICAgICAgbmV3IEN1c3RvbUV2ZW50KCdvaWRjLXNpbGVudC1yZW5ldy1pbml0Jywge1xyXG4gICAgICAgIGRldGFpbDogaW5zdGFuY2VJZCxcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG59XHJcbiJdfQ==