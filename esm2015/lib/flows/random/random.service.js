import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../../logging/logger.service";
export class RandomService {
    constructor(doc, loggerService) {
        this.doc = doc;
        this.loggerService = loggerService;
    }
    createRandom(requiredLength) {
        if (requiredLength <= 0) {
            return '';
        }
        if (requiredLength > 0 && requiredLength < 7) {
            this.loggerService.logWarning(`RandomService called with ${requiredLength} but 7 chars is the minimum, returning 10 chars`);
            requiredLength = 10;
        }
        const length = requiredLength - 6;
        const arr = new Uint8Array((length || length) / 2);
        if (this.getCrypto()) {
            this.getCrypto().getRandomValues(arr);
        }
        return Array.from(arr, this.toHex).join('') + this.randomString(7);
    }
    toHex(dec) {
        return ('0' + dec.toString(16)).substr(-2);
    }
    randomString(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const values = new Uint32Array(length);
        if (this.getCrypto()) {
            this.getCrypto().getRandomValues(values);
            for (let i = 0; i < length; i++) {
                result += characters[values[i] % characters.length];
            }
        }
        return result;
    }
    getCrypto() {
        // support for IE,  (window.crypto || window.msCrypto)
        return this.doc.defaultView.crypto || this.doc.defaultView.msCrypto;
    }
}
RandomService.ɵfac = function RandomService_Factory(t) { return new (t || RandomService)(i0.ɵɵinject(DOCUMENT), i0.ɵɵinject(i1.LoggerService)); };
RandomService.ɵprov = i0.ɵɵdefineInjectable({ token: RandomService, factory: RandomService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(RandomService, [{
        type: Injectable
    }], function () { return [{ type: undefined, decorators: [{
                type: Inject,
                args: [DOCUMENT]
            }] }, { type: i1.LoggerService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZG9tLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy8iLCJzb3VyY2VzIjpbImxpYi9mbG93cy9yYW5kb20vcmFuZG9tLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzNDLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDOzs7QUFJbkQsTUFBTSxPQUFPLGFBQWE7SUFDeEIsWUFBK0MsR0FBUSxFQUFVLGFBQTRCO1FBQTlDLFFBQUcsR0FBSCxHQUFHLENBQUs7UUFBVSxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtJQUFHLENBQUM7SUFFakcsWUFBWSxDQUFDLGNBQXNCO1FBQ2pDLElBQUksY0FBYyxJQUFJLENBQUMsRUFBRTtZQUN2QixPQUFPLEVBQUUsQ0FBQztTQUNYO1FBRUQsSUFBSSxjQUFjLEdBQUcsQ0FBQyxJQUFJLGNBQWMsR0FBRyxDQUFDLEVBQUU7WUFDNUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsNkJBQTZCLGNBQWMsaURBQWlELENBQUMsQ0FBQztZQUM1SCxjQUFjLEdBQUcsRUFBRSxDQUFDO1NBQ3JCO1FBRUQsTUFBTSxNQUFNLEdBQUcsY0FBYyxHQUFHLENBQUMsQ0FBQztRQUNsQyxNQUFNLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNuRCxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRTtZQUNwQixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3ZDO1FBQ0QsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckUsQ0FBQztJQUVPLEtBQUssQ0FBQyxHQUFHO1FBQ2YsT0FBTyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVPLFlBQVksQ0FBQyxNQUFNO1FBQ3pCLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNoQixNQUFNLFVBQVUsR0FBRyxnRUFBZ0UsQ0FBQztRQUVwRixNQUFNLE1BQU0sR0FBRyxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRTtZQUNwQixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3pDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQy9CLE1BQU0sSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUNyRDtTQUNGO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUNPLFNBQVM7UUFDZixzREFBc0Q7UUFDdEQsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxNQUFNLElBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFtQixDQUFDLFFBQVEsQ0FBQztJQUMvRSxDQUFDOzswRUExQ1UsYUFBYSxjQUNKLFFBQVE7cURBRGpCLGFBQWEsV0FBYixhQUFhO2tEQUFiLGFBQWE7Y0FEekIsVUFBVTs7c0JBRUksTUFBTTt1QkFBQyxRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRE9DVU1FTlQgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xyXG5pbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uLy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xyXG5cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgUmFuZG9tU2VydmljZSB7XHJcbiAgY29uc3RydWN0b3IoQEluamVjdChET0NVTUVOVCkgcHJpdmF0ZSByZWFkb25seSBkb2M6IGFueSwgcHJpdmF0ZSBsb2dnZXJTZXJ2aWNlOiBMb2dnZXJTZXJ2aWNlKSB7fVxyXG5cclxuICBjcmVhdGVSYW5kb20ocmVxdWlyZWRMZW5ndGg6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICBpZiAocmVxdWlyZWRMZW5ndGggPD0gMCkge1xyXG4gICAgICByZXR1cm4gJyc7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHJlcXVpcmVkTGVuZ3RoID4gMCAmJiByZXF1aXJlZExlbmd0aCA8IDcpIHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoYFJhbmRvbVNlcnZpY2UgY2FsbGVkIHdpdGggJHtyZXF1aXJlZExlbmd0aH0gYnV0IDcgY2hhcnMgaXMgdGhlIG1pbmltdW0sIHJldHVybmluZyAxMCBjaGFyc2ApO1xyXG4gICAgICByZXF1aXJlZExlbmd0aCA9IDEwO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGxlbmd0aCA9IHJlcXVpcmVkTGVuZ3RoIC0gNjtcclxuICAgIGNvbnN0IGFyciA9IG5ldyBVaW50OEFycmF5KChsZW5ndGggfHwgbGVuZ3RoKSAvIDIpO1xyXG4gICAgaWYgKHRoaXMuZ2V0Q3J5cHRvKCkpIHtcclxuICAgICAgdGhpcy5nZXRDcnlwdG8oKS5nZXRSYW5kb21WYWx1ZXMoYXJyKTtcclxuICAgIH1cclxuICAgIHJldHVybiBBcnJheS5mcm9tKGFyciwgdGhpcy50b0hleCkuam9pbignJykgKyB0aGlzLnJhbmRvbVN0cmluZyg3KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgdG9IZXgoZGVjKSB7XHJcbiAgICByZXR1cm4gKCcwJyArIGRlYy50b1N0cmluZygxNikpLnN1YnN0cigtMik7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJhbmRvbVN0cmluZyhsZW5ndGgpOiBzdHJpbmcge1xyXG4gICAgbGV0IHJlc3VsdCA9ICcnO1xyXG4gICAgY29uc3QgY2hhcmFjdGVycyA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSc7XHJcblxyXG4gICAgY29uc3QgdmFsdWVzID0gbmV3IFVpbnQzMkFycmF5KGxlbmd0aCk7XHJcbiAgICBpZiAodGhpcy5nZXRDcnlwdG8oKSkge1xyXG4gICAgICB0aGlzLmdldENyeXB0bygpLmdldFJhbmRvbVZhbHVlcyh2YWx1ZXMpO1xyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgcmVzdWx0ICs9IGNoYXJhY3RlcnNbdmFsdWVzW2ldICUgY2hhcmFjdGVycy5sZW5ndGhdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcbiAgcHJpdmF0ZSBnZXRDcnlwdG8oKSB7XHJcbiAgICAvLyBzdXBwb3J0IGZvciBJRSwgICh3aW5kb3cuY3J5cHRvIHx8IHdpbmRvdy5tc0NyeXB0bylcclxuICAgIHJldHVybiB0aGlzLmRvYy5kZWZhdWx0Vmlldy5jcnlwdG8gfHwgKHRoaXMuZG9jLmRlZmF1bHRWaWV3IGFzIGFueSkubXNDcnlwdG87XHJcbiAgfVxyXG59XHJcbiJdfQ==