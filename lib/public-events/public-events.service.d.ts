import { EventTypes } from './event-types';
import { OidcClientNotification } from './notification';
import * as i0 from "@angular/core";
export declare class PublicEventsService {
    private notify;
    fireEvent<T>(type: EventTypes, value?: T): void;
    registerForEvents(): import("rxjs").Observable<OidcClientNotification<any>>;
    static ɵfac: i0.ɵɵFactoryDef<PublicEventsService, never>;
    static ɵprov: i0.ɵɵInjectableDef<PublicEventsService>;
}
//# sourceMappingURL=public-events.service.d.ts.map