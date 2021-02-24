import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import * as i0 from "@angular/core";
export class PopUpService {
    constructor() {
        this.receivedUrlInternal$ = new Subject();
    }
    get receivedUrl$() {
        return this.receivedUrlInternal$.asObservable();
    }
    isCurrentlyInPopup() {
        return !!window.opener && window.opener !== window;
    }
    openPopUp(url, popupOptions) {
        const optionsToPass = this.getOptions(popupOptions);
        this.popUp = window.open(url, '_blank', optionsToPass);
        const listener = (event) => {
            if (!(event === null || event === void 0 ? void 0 : event.data) || typeof event.data !== 'string') {
                return;
            }
            this.receivedUrlInternal$.next(event.data);
            this.cleanUp(listener);
        };
        window.addEventListener('message', listener, false);
    }
    sendMessageToMainWindow(url) {
        if (window.opener) {
            this.sendMessage(url, window.location.href);
        }
    }
    cleanUp(listener) {
        window.removeEventListener('message', listener, false);
        if (this.popUp) {
            this.popUp.close();
            this.popUp = null;
        }
    }
    sendMessage(url, href) {
        window.opener.postMessage(url, href);
    }
    getOptions(popupOptions) {
        const popupDefaultOptions = { width: 500, height: 500, left: 50, top: 50 };
        const options = Object.assign(Object.assign({}, popupDefaultOptions), (popupOptions || {}));
        return Object.entries(options)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join(',');
    }
}
PopUpService.ɵfac = function PopUpService_Factory(t) { return new (t || PopUpService)(); };
PopUpService.ɵprov = i0.ɵɵdefineInjectable({ token: PopUpService, factory: PopUpService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(PopUpService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wdXAuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjLyIsInNvdXJjZXMiOlsibGliL2xvZ2luL3BvcHVwLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDOztBQUkvQixNQUFNLE9BQU8sWUFBWTtJQUR6QjtRQUdVLHlCQUFvQixHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7S0F1RDlDO0lBckRDLElBQUksWUFBWTtRQUNkLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ2xELENBQUM7SUFFRCxrQkFBa0I7UUFDaEIsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLE1BQU0sQ0FBQztJQUNyRCxDQUFDO0lBRUQsU0FBUyxDQUFDLEdBQVcsRUFBRSxZQUEyQjtRQUNoRCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBRXZELE1BQU0sUUFBUSxHQUFHLENBQUMsS0FBbUIsRUFBRSxFQUFFO1lBQ3ZDLElBQUksRUFBQyxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsSUFBSSxDQUFBLElBQUksT0FBTyxLQUFLLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRTtnQkFDbEQsT0FBTzthQUNSO1lBRUQsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFM0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN6QixDQUFDLENBQUM7UUFFRixNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRUQsdUJBQXVCLENBQUMsR0FBVztRQUNqQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFDakIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM3QztJQUNILENBQUM7SUFFTyxPQUFPLENBQUMsUUFBYTtRQUMzQixNQUFNLENBQUMsbUJBQW1CLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV2RCxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDZCxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ25CLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1NBQ25CO0lBQ0gsQ0FBQztJQUVPLFdBQVcsQ0FBQyxHQUFXLEVBQUUsSUFBWTtRQUMzQyxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVPLFVBQVUsQ0FBQyxZQUEyQjtRQUM1QyxNQUFNLG1CQUFtQixHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDO1FBRTNFLE1BQU0sT0FBTyxtQ0FBUSxtQkFBbUIsR0FBSyxDQUFDLFlBQVksSUFBSSxFQUFFLENBQUMsQ0FBRSxDQUFDO1FBRXBFLE9BQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7YUFDM0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsa0JBQWtCLENBQUMsR0FBRyxDQUFDLElBQUksa0JBQWtCLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQzthQUNoRixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDZixDQUFDOzt3RUF4RFUsWUFBWTtvREFBWixZQUFZLFdBQVosWUFBWSxtQkFEQyxNQUFNO2tEQUNuQixZQUFZO2NBRHhCLFVBQVU7ZUFBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IFN1YmplY3QgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgUG9wdXBPcHRpb25zIH0gZnJvbSAnLi9wb3B1cC1vcHRpb25zJztcclxuXHJcbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogJ3Jvb3QnIH0pXHJcbmV4cG9ydCBjbGFzcyBQb3BVcFNlcnZpY2Uge1xyXG4gIHByaXZhdGUgcG9wVXA6IFdpbmRvdztcclxuICBwcml2YXRlIHJlY2VpdmVkVXJsSW50ZXJuYWwkID0gbmV3IFN1YmplY3QoKTtcclxuXHJcbiAgZ2V0IHJlY2VpdmVkVXJsJCgpIHtcclxuICAgIHJldHVybiB0aGlzLnJlY2VpdmVkVXJsSW50ZXJuYWwkLmFzT2JzZXJ2YWJsZSgpO1xyXG4gIH1cclxuXHJcbiAgaXNDdXJyZW50bHlJblBvcHVwKCkge1xyXG4gICAgcmV0dXJuICEhd2luZG93Lm9wZW5lciAmJiB3aW5kb3cub3BlbmVyICE9PSB3aW5kb3c7XHJcbiAgfVxyXG5cclxuICBvcGVuUG9wVXAodXJsOiBzdHJpbmcsIHBvcHVwT3B0aW9ucz86IFBvcHVwT3B0aW9ucykge1xyXG4gICAgY29uc3Qgb3B0aW9uc1RvUGFzcyA9IHRoaXMuZ2V0T3B0aW9ucyhwb3B1cE9wdGlvbnMpO1xyXG4gICAgdGhpcy5wb3BVcCA9IHdpbmRvdy5vcGVuKHVybCwgJ19ibGFuaycsIG9wdGlvbnNUb1Bhc3MpO1xyXG5cclxuICAgIGNvbnN0IGxpc3RlbmVyID0gKGV2ZW50OiBNZXNzYWdlRXZlbnQpID0+IHtcclxuICAgICAgaWYgKCFldmVudD8uZGF0YSB8fCB0eXBlb2YgZXZlbnQuZGF0YSAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMucmVjZWl2ZWRVcmxJbnRlcm5hbCQubmV4dChldmVudC5kYXRhKTtcclxuXHJcbiAgICAgIHRoaXMuY2xlYW5VcChsaXN0ZW5lcik7XHJcbiAgICB9O1xyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgbGlzdGVuZXIsIGZhbHNlKTtcclxuICB9XHJcblxyXG4gIHNlbmRNZXNzYWdlVG9NYWluV2luZG93KHVybDogc3RyaW5nKSB7XHJcbiAgICBpZiAod2luZG93Lm9wZW5lcikge1xyXG4gICAgICB0aGlzLnNlbmRNZXNzYWdlKHVybCwgd2luZG93LmxvY2F0aW9uLmhyZWYpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjbGVhblVwKGxpc3RlbmVyOiBhbnkpIHtcclxuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgbGlzdGVuZXIsIGZhbHNlKTtcclxuXHJcbiAgICBpZiAodGhpcy5wb3BVcCkge1xyXG4gICAgICB0aGlzLnBvcFVwLmNsb3NlKCk7XHJcbiAgICAgIHRoaXMucG9wVXAgPSBudWxsO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzZW5kTWVzc2FnZSh1cmw6IHN0cmluZywgaHJlZjogc3RyaW5nKSB7XHJcbiAgICB3aW5kb3cub3BlbmVyLnBvc3RNZXNzYWdlKHVybCwgaHJlZik7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldE9wdGlvbnMocG9wdXBPcHRpb25zPzogUG9wdXBPcHRpb25zKSB7XHJcbiAgICBjb25zdCBwb3B1cERlZmF1bHRPcHRpb25zID0geyB3aWR0aDogNTAwLCBoZWlnaHQ6IDUwMCwgbGVmdDogNTAsIHRvcDogNTAgfTtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0geyAuLi5wb3B1cERlZmF1bHRPcHRpb25zLCAuLi4ocG9wdXBPcHRpb25zIHx8IHt9KSB9O1xyXG5cclxuICAgIHJldHVybiBPYmplY3QuZW50cmllcyhvcHRpb25zKVxyXG4gICAgICAubWFwKChba2V5LCB2YWx1ZV0pID0+IGAke2VuY29kZVVSSUNvbXBvbmVudChrZXkpfT0ke2VuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSl9YClcclxuICAgICAgLmpvaW4oJywnKTtcclxuICB9XHJcbn1cclxuIl19