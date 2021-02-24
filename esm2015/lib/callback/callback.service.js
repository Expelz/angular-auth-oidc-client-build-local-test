import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "../utils/url/url.service";
import * as i2 from "../utils/flowHelper/flow-helper.service";
import * as i3 from "./implicit-flow-callback.service";
import * as i4 from "./code-flow-callback.service";
export class CallbackService {
    constructor(urlService, flowHelper, implicitFlowCallbackService, codeFlowCallbackService) {
        this.urlService = urlService;
        this.flowHelper = flowHelper;
        this.implicitFlowCallbackService = implicitFlowCallbackService;
        this.codeFlowCallbackService = codeFlowCallbackService;
        this.stsCallbackInternal$ = new Subject();
    }
    get stsCallback$() {
        return this.stsCallbackInternal$.asObservable();
    }
    isCallback(currentUrl) {
        return this.urlService.isCallbackFromSts(currentUrl);
    }
    handleCallbackAndFireEvents(currentCallbackUrl) {
        let callback$;
        if (this.flowHelper.isCurrentFlowCodeFlow()) {
            callback$ = this.codeFlowCallbackService.authorizedCallbackWithCode(currentCallbackUrl);
        }
        else if (this.flowHelper.isCurrentFlowAnyImplicitFlow()) {
            callback$ = this.implicitFlowCallbackService.authorizedImplicitFlowCallback();
        }
        return callback$.pipe(tap(() => this.stsCallbackInternal$.next()));
    }
}
CallbackService.ɵfac = function CallbackService_Factory(t) { return new (t || CallbackService)(i0.ɵɵinject(i1.UrlService), i0.ɵɵinject(i2.FlowHelper), i0.ɵɵinject(i3.ImplicitFlowCallbackService), i0.ɵɵinject(i4.CodeFlowCallbackService)); };
CallbackService.ɵprov = i0.ɵɵdefineInjectable({ token: CallbackService, factory: CallbackService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(CallbackService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], function () { return [{ type: i1.UrlService }, { type: i2.FlowHelper }, { type: i3.ImplicitFlowCallbackService }, { type: i4.CodeFlowCallbackService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsbGJhY2suc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjLyIsInNvdXJjZXMiOlsibGliL2NhbGxiYWNrL2NhbGxiYWNrLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQWMsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQzs7Ozs7O0FBUXJDLE1BQU0sT0FBTyxlQUFlO0lBTzFCLFlBQ1UsVUFBc0IsRUFDdEIsVUFBc0IsRUFDdEIsMkJBQXdELEVBQ3hELHVCQUFnRDtRQUhoRCxlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQ3RCLGVBQVUsR0FBVixVQUFVLENBQVk7UUFDdEIsZ0NBQTJCLEdBQTNCLDJCQUEyQixDQUE2QjtRQUN4RCw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQXlCO1FBVmxELHlCQUFvQixHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7SUFXMUMsQ0FBQztJQVRKLElBQUksWUFBWTtRQUNkLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ2xELENBQUM7SUFTRCxVQUFVLENBQUMsVUFBa0I7UUFDM0IsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFRCwyQkFBMkIsQ0FBQyxrQkFBMEI7UUFDcEQsSUFBSSxTQUEwQixDQUFDO1FBRS9CLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsRUFBRSxFQUFFO1lBQzNDLFNBQVMsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsMEJBQTBCLENBQUMsa0JBQWtCLENBQUMsQ0FBQztTQUN6RjthQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyw0QkFBNEIsRUFBRSxFQUFFO1lBQ3pELFNBQVMsR0FBRyxJQUFJLENBQUMsMkJBQTJCLENBQUMsOEJBQThCLEVBQUUsQ0FBQztTQUMvRTtRQUVELE9BQU8sU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNyRSxDQUFDOzs4RUE1QlUsZUFBZTt1REFBZixlQUFlLFdBQWYsZUFBZSxtQkFERixNQUFNO2tEQUNuQixlQUFlO2NBRDNCLFVBQVU7ZUFBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IE9ic2VydmFibGUsIFN1YmplY3QgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgdGFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQgeyBDYWxsYmFja0NvbnRleHQgfSBmcm9tICcuLi9mbG93cy9jYWxsYmFjay1jb250ZXh0JztcclxuaW1wb3J0IHsgRmxvd0hlbHBlciB9IGZyb20gJy4uL3V0aWxzL2Zsb3dIZWxwZXIvZmxvdy1oZWxwZXIuc2VydmljZSc7XHJcbmltcG9ydCB7IFVybFNlcnZpY2UgfSBmcm9tICcuLi91dGlscy91cmwvdXJsLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBDb2RlRmxvd0NhbGxiYWNrU2VydmljZSB9IGZyb20gJy4vY29kZS1mbG93LWNhbGxiYWNrLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBJbXBsaWNpdEZsb3dDYWxsYmFja1NlcnZpY2UgfSBmcm9tICcuL2ltcGxpY2l0LWZsb3ctY2FsbGJhY2suc2VydmljZSc7XHJcblxyXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxyXG5leHBvcnQgY2xhc3MgQ2FsbGJhY2tTZXJ2aWNlIHtcclxuICBwcml2YXRlIHN0c0NhbGxiYWNrSW50ZXJuYWwkID0gbmV3IFN1YmplY3QoKTtcclxuXHJcbiAgZ2V0IHN0c0NhbGxiYWNrJCgpIHtcclxuICAgIHJldHVybiB0aGlzLnN0c0NhbGxiYWNrSW50ZXJuYWwkLmFzT2JzZXJ2YWJsZSgpO1xyXG4gIH1cclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIHVybFNlcnZpY2U6IFVybFNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGZsb3dIZWxwZXI6IEZsb3dIZWxwZXIsXHJcbiAgICBwcml2YXRlIGltcGxpY2l0Rmxvd0NhbGxiYWNrU2VydmljZTogSW1wbGljaXRGbG93Q2FsbGJhY2tTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBjb2RlRmxvd0NhbGxiYWNrU2VydmljZTogQ29kZUZsb3dDYWxsYmFja1NlcnZpY2VcclxuICApIHt9XHJcblxyXG4gIGlzQ2FsbGJhY2soY3VycmVudFVybDogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy51cmxTZXJ2aWNlLmlzQ2FsbGJhY2tGcm9tU3RzKGN1cnJlbnRVcmwpO1xyXG4gIH1cclxuXHJcbiAgaGFuZGxlQ2FsbGJhY2tBbmRGaXJlRXZlbnRzKGN1cnJlbnRDYWxsYmFja1VybDogc3RyaW5nKTogT2JzZXJ2YWJsZTxDYWxsYmFja0NvbnRleHQ+IHtcclxuICAgIGxldCBjYWxsYmFjayQ6IE9ic2VydmFibGU8YW55PjtcclxuXHJcbiAgICBpZiAodGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dDb2RlRmxvdygpKSB7XHJcbiAgICAgIGNhbGxiYWNrJCA9IHRoaXMuY29kZUZsb3dDYWxsYmFja1NlcnZpY2UuYXV0aG9yaXplZENhbGxiYWNrV2l0aENvZGUoY3VycmVudENhbGxiYWNrVXJsKTtcclxuICAgIH0gZWxzZSBpZiAodGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dBbnlJbXBsaWNpdEZsb3coKSkge1xyXG4gICAgICBjYWxsYmFjayQgPSB0aGlzLmltcGxpY2l0Rmxvd0NhbGxiYWNrU2VydmljZS5hdXRob3JpemVkSW1wbGljaXRGbG93Q2FsbGJhY2soKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gY2FsbGJhY2skLnBpcGUodGFwKCgpID0+IHRoaXMuc3RzQ2FsbGJhY2tJbnRlcm5hbCQubmV4dCgpKSk7XHJcbiAgfVxyXG59XHJcbiJdfQ==