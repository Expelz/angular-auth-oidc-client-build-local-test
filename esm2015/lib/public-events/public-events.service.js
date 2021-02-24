import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import * as i0 from "@angular/core";
export class PublicEventsService {
    constructor() {
        this.notify = new ReplaySubject(1);
    }
    fireEvent(type, value) {
        this.notify.next({ type, value });
    }
    registerForEvents() {
        return this.notify.asObservable();
    }
}
PublicEventsService.ɵfac = function PublicEventsService_Factory(t) { return new (t || PublicEventsService)(); };
PublicEventsService.ɵprov = i0.ɵɵdefineInjectable({ token: PublicEventsService, factory: PublicEventsService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(PublicEventsService, [{
        type: Injectable
    }], null, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGljLWV2ZW50cy5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvIiwic291cmNlcyI6WyJsaWIvcHVibGljLWV2ZW50cy9wdWJsaWMtZXZlbnRzLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sTUFBTSxDQUFDOztBQUtyQyxNQUFNLE9BQU8sbUJBQW1CO0lBRGhDO1FBRVUsV0FBTSxHQUFHLElBQUksYUFBYSxDQUE4QixDQUFDLENBQUMsQ0FBQztLQVNwRTtJQVBDLFNBQVMsQ0FBSSxJQUFnQixFQUFFLEtBQVM7UUFDdEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUQsaUJBQWlCO1FBQ2YsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ3BDLENBQUM7O3NGQVRVLG1CQUFtQjsyREFBbkIsbUJBQW1CLFdBQW5CLG1CQUFtQjtrREFBbkIsbUJBQW1CO2NBRC9CLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IFJlcGxheVN1YmplY3QgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgRXZlbnRUeXBlcyB9IGZyb20gJy4vZXZlbnQtdHlwZXMnO1xyXG5pbXBvcnQgeyBPaWRjQ2xpZW50Tm90aWZpY2F0aW9uIH0gZnJvbSAnLi9ub3RpZmljYXRpb24nO1xyXG5cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgUHVibGljRXZlbnRzU2VydmljZSB7XHJcbiAgcHJpdmF0ZSBub3RpZnkgPSBuZXcgUmVwbGF5U3ViamVjdDxPaWRjQ2xpZW50Tm90aWZpY2F0aW9uPGFueT4+KDEpO1xyXG5cclxuICBmaXJlRXZlbnQ8VD4odHlwZTogRXZlbnRUeXBlcywgdmFsdWU/OiBUKSB7XHJcbiAgICB0aGlzLm5vdGlmeS5uZXh0KHsgdHlwZSwgdmFsdWUgfSk7XHJcbiAgfVxyXG5cclxuICByZWdpc3RlckZvckV2ZW50cygpIHtcclxuICAgIHJldHVybiB0aGlzLm5vdGlmeS5hc09ic2VydmFibGUoKTtcclxuICB9XHJcbn1cclxuIl19