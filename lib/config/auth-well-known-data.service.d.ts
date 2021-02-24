import { DataService } from '../api/data.service';
import { AuthWellKnownEndpoints } from './auth-well-known-endpoints';
import * as i0 from "@angular/core";
export declare class AuthWellKnownDataService {
    private readonly http;
    constructor(http: DataService);
    getWellKnownEndPointsFromUrl(authWellknownEndpoint: string): import("rxjs").Observable<AuthWellKnownEndpoints>;
    private getWellKnownDocument;
    static ɵfac: i0.ɵɵFactoryDef<AuthWellKnownDataService, never>;
    static ɵprov: i0.ɵɵInjectableDef<AuthWellKnownDataService>;
}
//# sourceMappingURL=auth-well-known-data.service.d.ts.map