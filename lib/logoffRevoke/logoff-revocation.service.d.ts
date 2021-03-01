import { DataService } from '../api/data.service';
import { FlowsService } from '../flows/flows.service';
import { CheckSessionService } from '../iframe/check-session.service';
import { TabsSynchronizationService } from '../iframe/tabs-synchronization.service';
import { LoggerService } from '../logging/logger.service';
import { StoragePersistanceService } from '../storage/storage-persistance.service';
import { RedirectService } from '../utils/redirect/redirect.service';
import { UrlService } from '../utils/url/url.service';
import * as i0 from "@angular/core";
export declare class LogoffRevocationService {
    private dataService;
    private storagePersistanceService;
    private loggerService;
    private urlService;
    private checkSessionService;
    private flowsService;
    private redirectService;
    private tabsSynchronizationService;
    constructor(dataService: DataService, storagePersistanceService: StoragePersistanceService, loggerService: LoggerService, urlService: UrlService, checkSessionService: CheckSessionService, flowsService: FlowsService, redirectService: RedirectService, tabsSynchronizationService: TabsSynchronizationService);
    logoff(urlHandler?: (url: string) => any): void;
    logoffLocal(): void;
    logoffAndRevokeTokens(urlHandler?: (url: string) => any): import("rxjs").Observable<any>;
    revokeAccessToken(accessToken?: any): import("rxjs").Observable<any>;
    revokeRefreshToken(refreshToken?: any): import("rxjs").Observable<any>;
    getEndSessionUrl(): string | null;
    static ɵfac: i0.ɵɵFactoryDef<LogoffRevocationService, never>;
    static ɵprov: i0.ɵɵInjectableDef<LogoffRevocationService>;
}
//# sourceMappingURL=logoff-revocation.service.d.ts.map