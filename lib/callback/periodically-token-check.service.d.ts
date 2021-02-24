import { TabsSynchronizationService } from './../iframe/tabs-synchronization.service';
import { AuthStateService } from '../authState/auth-state.service';
import { ConfigurationProvider } from '../config/config.provider';
import { FlowsDataService } from '../flows/flows-data.service';
import { FlowsService } from '../flows/flows.service';
import { RefreshSessionIframeService } from '../iframe/refresh-session-iframe.service';
import { LoggerService } from '../logging/logger.service';
import { StoragePersistanceService } from '../storage/storage-persistance.service';
import { UserService } from '../userData/user-service';
import { FlowHelper } from '../utils/flowHelper/flow-helper.service';
import { IntervallService } from './intervall.service';
import { RefreshSessionRefreshTokenService } from './refresh-session-refresh-token.service';
import { PublicEventsService } from '../public-events/public-events.service';
import * as i0 from "@angular/core";
export declare class PeriodicallyTokenCheckService {
    private flowsService;
    private flowHelper;
    private configurationProvider;
    private flowsDataService;
    private loggerService;
    private userService;
    private authStateService;
    private refreshSessionIframeService;
    private refreshSessionRefreshTokenService;
    private intervalService;
    private storagePersistanceService;
    private tabsSynchronizationService;
    private publicEventsService;
    constructor(flowsService: FlowsService, flowHelper: FlowHelper, configurationProvider: ConfigurationProvider, flowsDataService: FlowsDataService, loggerService: LoggerService, userService: UserService, authStateService: AuthStateService, refreshSessionIframeService: RefreshSessionIframeService, refreshSessionRefreshTokenService: RefreshSessionRefreshTokenService, intervalService: IntervallService, storagePersistanceService: StoragePersistanceService, tabsSynchronizationService: TabsSynchronizationService, publicEventsService: PublicEventsService);
    startTokenValidationPeriodically(repeatAfterSeconds: number): void;
    static ɵfac: i0.ɵɵFactoryDef<PeriodicallyTokenCheckService, never>;
    static ɵprov: i0.ɵɵInjectableDef<PeriodicallyTokenCheckService>;
}
//# sourceMappingURL=periodically-token-check.service.d.ts.map