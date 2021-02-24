import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../logging/logger.service";
export class IFrameService {
    constructor(doc, loggerService) {
        this.doc = doc;
        this.loggerService = loggerService;
    }
    getExistingIFrame(identifier) {
        const iFrameOnParent = this.getIFrameFromParentWindow(identifier);
        if (this.isIFrameElement(iFrameOnParent)) {
            return iFrameOnParent;
        }
        const iFrameOnSelf = this.getIFrameFromWindow(identifier);
        if (this.isIFrameElement(iFrameOnSelf)) {
            return iFrameOnSelf;
        }
        return null;
    }
    addIFrameToWindowBody(identifier) {
        const sessionIframe = this.doc.createElement('iframe');
        sessionIframe.id = identifier;
        sessionIframe.title = identifier;
        this.loggerService.logDebug(sessionIframe);
        sessionIframe.style.display = 'none';
        this.doc.body.appendChild(sessionIframe);
        return sessionIframe;
    }
    getIFrameFromParentWindow(identifier) {
        try {
            const iFrameElement = this.doc.defaultView.parent.document.getElementById(identifier);
            if (this.isIFrameElement(iFrameElement)) {
                return iFrameElement;
            }
            return null;
        }
        catch (e) {
            return null;
        }
    }
    getIFrameFromWindow(identifier) {
        const iFrameElement = this.doc.getElementById(identifier);
        if (this.isIFrameElement(iFrameElement)) {
            return iFrameElement;
        }
        return null;
    }
    isIFrameElement(element) {
        return !!element && element instanceof HTMLIFrameElement;
    }
}
IFrameService.ɵfac = function IFrameService_Factory(t) { return new (t || IFrameService)(i0.ɵɵinject(DOCUMENT), i0.ɵɵinject(i1.LoggerService)); };
IFrameService.ɵprov = i0.ɵɵdefineInjectable({ token: IFrameService, factory: IFrameService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(IFrameService, [{
        type: Injectable
    }], function () { return [{ type: undefined, decorators: [{
                type: Inject,
                args: [DOCUMENT]
            }] }, { type: i1.LoggerService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhpc3RpbmctaWZyYW1lLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy8iLCJzb3VyY2VzIjpbImxpYi9pZnJhbWUvZXhpc3RpbmctaWZyYW1lLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzNDLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDOzs7QUFJbkQsTUFBTSxPQUFPLGFBQWE7SUFDeEIsWUFBK0MsR0FBUSxFQUFVLGFBQTRCO1FBQTlDLFFBQUcsR0FBSCxHQUFHLENBQUs7UUFBVSxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtJQUFHLENBQUM7SUFFakcsaUJBQWlCLENBQUMsVUFBa0I7UUFDbEMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2xFLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUN4QyxPQUFPLGNBQWMsQ0FBQztTQUN2QjtRQUVELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMxRCxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDdEMsT0FBTyxZQUFZLENBQUM7U0FDckI7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCxxQkFBcUIsQ0FBQyxVQUFrQjtRQUN0QyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN2RCxhQUFhLENBQUMsRUFBRSxHQUFHLFVBQVUsQ0FBQztRQUM5QixhQUFhLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQztRQUNqQyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUMzQyxhQUFhLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDckMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3pDLE9BQU8sYUFBYSxDQUFDO0lBQ3ZCLENBQUM7SUFFTyx5QkFBeUIsQ0FBQyxVQUFrQjtRQUNsRCxJQUFJO1lBQ0YsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdEYsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxFQUFFO2dCQUN2QyxPQUFPLGFBQWEsQ0FBQzthQUN0QjtZQUNELE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLE9BQU8sSUFBSSxDQUFDO1NBQ2I7SUFDSCxDQUFDO0lBRU8sbUJBQW1CLENBQUMsVUFBa0I7UUFDNUMsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDMUQsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxFQUFFO1lBQ3ZDLE9BQU8sYUFBYSxDQUFDO1NBQ3RCO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRU8sZUFBZSxDQUFDLE9BQTJCO1FBQ2pELE9BQU8sQ0FBQyxDQUFDLE9BQU8sSUFBSSxPQUFPLFlBQVksaUJBQWlCLENBQUM7SUFDM0QsQ0FBQzs7MEVBaERVLGFBQWEsY0FDSixRQUFRO3FEQURqQixhQUFhLFdBQWIsYUFBYTtrREFBYixhQUFhO2NBRHpCLFVBQVU7O3NCQUVJLE1BQU07dUJBQUMsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERPQ1VNRU5UIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcclxuaW1wb3J0IHsgSW5qZWN0LCBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcclxuXHJcbkBJbmplY3RhYmxlKClcclxuZXhwb3J0IGNsYXNzIElGcmFtZVNlcnZpY2Uge1xyXG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoRE9DVU1FTlQpIHByaXZhdGUgcmVhZG9ubHkgZG9jOiBhbnksIHByaXZhdGUgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZSkge31cclxuXHJcbiAgZ2V0RXhpc3RpbmdJRnJhbWUoaWRlbnRpZmllcjogc3RyaW5nKTogSFRNTElGcmFtZUVsZW1lbnQgfCBudWxsIHtcclxuICAgIGNvbnN0IGlGcmFtZU9uUGFyZW50ID0gdGhpcy5nZXRJRnJhbWVGcm9tUGFyZW50V2luZG93KGlkZW50aWZpZXIpO1xyXG4gICAgaWYgKHRoaXMuaXNJRnJhbWVFbGVtZW50KGlGcmFtZU9uUGFyZW50KSkge1xyXG4gICAgICByZXR1cm4gaUZyYW1lT25QYXJlbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaUZyYW1lT25TZWxmID0gdGhpcy5nZXRJRnJhbWVGcm9tV2luZG93KGlkZW50aWZpZXIpO1xyXG4gICAgaWYgKHRoaXMuaXNJRnJhbWVFbGVtZW50KGlGcmFtZU9uU2VsZikpIHtcclxuICAgICAgcmV0dXJuIGlGcmFtZU9uU2VsZjtcclxuICAgIH1cclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgYWRkSUZyYW1lVG9XaW5kb3dCb2R5KGlkZW50aWZpZXI6IHN0cmluZyk6IEhUTUxJRnJhbWVFbGVtZW50IHtcclxuICAgIGNvbnN0IHNlc3Npb25JZnJhbWUgPSB0aGlzLmRvYy5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcclxuICAgIHNlc3Npb25JZnJhbWUuaWQgPSBpZGVudGlmaWVyO1xyXG4gICAgc2Vzc2lvbklmcmFtZS50aXRsZSA9IGlkZW50aWZpZXI7XHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoc2Vzc2lvbklmcmFtZSk7XHJcbiAgICBzZXNzaW9uSWZyYW1lLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICB0aGlzLmRvYy5ib2R5LmFwcGVuZENoaWxkKHNlc3Npb25JZnJhbWUpO1xyXG4gICAgcmV0dXJuIHNlc3Npb25JZnJhbWU7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldElGcmFtZUZyb21QYXJlbnRXaW5kb3coaWRlbnRpZmllcjogc3RyaW5nKTogSFRNTElGcmFtZUVsZW1lbnQgfCBudWxsIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGlGcmFtZUVsZW1lbnQgPSB0aGlzLmRvYy5kZWZhdWx0Vmlldy5wYXJlbnQuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWRlbnRpZmllcik7XHJcbiAgICAgIGlmICh0aGlzLmlzSUZyYW1lRWxlbWVudChpRnJhbWVFbGVtZW50KSkge1xyXG4gICAgICAgIHJldHVybiBpRnJhbWVFbGVtZW50O1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0SUZyYW1lRnJvbVdpbmRvdyhpZGVudGlmaWVyOiBzdHJpbmcpOiBIVE1MSUZyYW1lRWxlbWVudCB8IG51bGwge1xyXG4gICAgY29uc3QgaUZyYW1lRWxlbWVudCA9IHRoaXMuZG9jLmdldEVsZW1lbnRCeUlkKGlkZW50aWZpZXIpO1xyXG4gICAgaWYgKHRoaXMuaXNJRnJhbWVFbGVtZW50KGlGcmFtZUVsZW1lbnQpKSB7XHJcbiAgICAgIHJldHVybiBpRnJhbWVFbGVtZW50O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGlzSUZyYW1lRWxlbWVudChlbGVtZW50OiBIVE1MRWxlbWVudCB8IG51bGwpOiBlbGVtZW50IGlzIEhUTUxJRnJhbWVFbGVtZW50IHtcclxuICAgIHJldHVybiAhIWVsZW1lbnQgJiYgZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxJRnJhbWVFbGVtZW50O1xyXG4gIH1cclxufVxyXG4iXX0=