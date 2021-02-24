import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as i0 from "@angular/core";
export class IntervallService {
    constructor(zone) {
        this.zone = zone;
        this.runTokenValidationRunning = null;
    }
    stopPeriodicallTokenCheck() {
        if (this.runTokenValidationRunning) {
            this.runTokenValidationRunning.unsubscribe();
            this.runTokenValidationRunning = null;
        }
    }
    startPeriodicTokenCheck(repeatAfterSeconds) {
        const millisecondsDelayBetweenTokenCheck = repeatAfterSeconds * 1000;
        return new Observable((subscriber) => {
            let intervalId;
            this.zone.runOutsideAngular(() => {
                intervalId = setInterval(() => subscriber.next(), millisecondsDelayBetweenTokenCheck);
            });
            return () => {
                clearInterval(intervalId);
            };
        });
    }
}
IntervallService.ɵfac = function IntervallService_Factory(t) { return new (t || IntervallService)(i0.ɵɵinject(i0.NgZone)); };
IntervallService.ɵprov = i0.ɵɵdefineInjectable({ token: IntervallService, factory: IntervallService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(IntervallService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], function () { return [{ type: i0.NgZone }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJ2YWxsLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy8iLCJzb3VyY2VzIjpbImxpYi9jYWxsYmFjay9pbnRlcnZhbGwuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFVLE1BQU0sZUFBZSxDQUFDO0FBQ25ELE9BQU8sRUFBRSxVQUFVLEVBQWdCLE1BQU0sTUFBTSxDQUFDOztBQUdoRCxNQUFNLE9BQU8sZ0JBQWdCO0lBRzNCLFlBQW9CLElBQVk7UUFBWixTQUFJLEdBQUosSUFBSSxDQUFRO1FBRmhDLDhCQUF5QixHQUFpQixJQUFJLENBQUM7SUFFWixDQUFDO0lBRXBDLHlCQUF5QjtRQUN2QixJQUFJLElBQUksQ0FBQyx5QkFBeUIsRUFBRTtZQUNsQyxJQUFJLENBQUMseUJBQXlCLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDN0MsSUFBSSxDQUFDLHlCQUF5QixHQUFHLElBQUksQ0FBQztTQUN2QztJQUNILENBQUM7SUFFRCx1QkFBdUIsQ0FBQyxrQkFBMEI7UUFDaEQsTUFBTSxrQ0FBa0MsR0FBRyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7UUFFckUsT0FBTyxJQUFJLFVBQVUsQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFO1lBQ25DLElBQUksVUFBVSxDQUFDO1lBQ2YsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUU7Z0JBQy9CLFVBQVUsR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFLGtDQUFrQyxDQUFDLENBQUM7WUFDeEYsQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPLEdBQUcsRUFBRTtnQkFDVixhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDNUIsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDOztnRkF6QlUsZ0JBQWdCO3dEQUFoQixnQkFBZ0IsV0FBaEIsZ0JBQWdCLG1CQURILE1BQU07a0RBQ25CLGdCQUFnQjtjQUQ1QixVQUFVO2VBQUMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSwgTmdab25lIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IE9ic2VydmFibGUsIFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xyXG5cclxuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiAncm9vdCcgfSlcclxuZXhwb3J0IGNsYXNzIEludGVydmFsbFNlcnZpY2Uge1xyXG4gIHJ1blRva2VuVmFsaWRhdGlvblJ1bm5pbmc6IFN1YnNjcmlwdGlvbiA9IG51bGw7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgem9uZTogTmdab25lKSB7fVxyXG5cclxuICBzdG9wUGVyaW9kaWNhbGxUb2tlbkNoZWNrKCk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMucnVuVG9rZW5WYWxpZGF0aW9uUnVubmluZykge1xyXG4gICAgICB0aGlzLnJ1blRva2VuVmFsaWRhdGlvblJ1bm5pbmcudW5zdWJzY3JpYmUoKTtcclxuICAgICAgdGhpcy5ydW5Ub2tlblZhbGlkYXRpb25SdW5uaW5nID0gbnVsbDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHN0YXJ0UGVyaW9kaWNUb2tlbkNoZWNrKHJlcGVhdEFmdGVyU2Vjb25kczogbnVtYmVyKSB7XHJcbiAgICBjb25zdCBtaWxsaXNlY29uZHNEZWxheUJldHdlZW5Ub2tlbkNoZWNrID0gcmVwZWF0QWZ0ZXJTZWNvbmRzICogMTAwMDtcclxuXHJcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGUoKHN1YnNjcmliZXIpID0+IHtcclxuICAgICAgbGV0IGludGVydmFsSWQ7XHJcbiAgICAgIHRoaXMuem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XHJcbiAgICAgICAgaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKCgpID0+IHN1YnNjcmliZXIubmV4dCgpLCBtaWxsaXNlY29uZHNEZWxheUJldHdlZW5Ub2tlbkNoZWNrKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZCk7XHJcbiAgICAgIH07XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuIl19