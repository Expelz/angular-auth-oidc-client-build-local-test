import { DataService } from '../api/data.service';
import { LoggerService } from '../logging/logger.service';
import { StoragePersistanceService } from '../storage/storage-persistance.service';
import { JwtKeys } from '../validation/jwtkeys';
import * as i0 from "@angular/core";
export declare class SigninKeyDataService {
    private storagePersistanceService;
    private loggerService;
    private dataService;
    constructor(storagePersistanceService: StoragePersistanceService, loggerService: LoggerService, dataService: DataService);
    getSigningKeys(): import("rxjs").Observable<JwtKeys>;
    private handleErrorGetSigningKeys;
    static ɵfac: i0.ɵɵFactoryDef<SigninKeyDataService, never>;
    static ɵprov: i0.ɵɵInjectableDef<SigninKeyDataService>;
}
//# sourceMappingURL=signin-key-data.service.d.ts.map