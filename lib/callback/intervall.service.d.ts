import { NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import * as i0 from "@angular/core";
export declare class IntervallService {
    private zone;
    runTokenValidationRunning: Subscription;
    constructor(zone: NgZone);
    stopPeriodicallTokenCheck(): void;
    startPeriodicTokenCheck(repeatAfterSeconds: number): Observable<unknown>;
    static ɵfac: i0.ɵɵFactoryDef<IntervallService, never>;
    static ɵprov: i0.ɵɵInjectableDef<IntervallService>;
}
//# sourceMappingURL=intervall.service.d.ts.map