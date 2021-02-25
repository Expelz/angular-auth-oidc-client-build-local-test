import { Observable } from 'rxjs';
import { AuthStateService } from '../authState/auth-state.service';
import { AuthWellKnownService } from '../config/auth-well-known.service';
import { ConfigurationProvider } from '../config/config.provider';
import { FlowsDataService } from '../flows/flows-data.service';
import { RefreshSessionIframeService } from '../iframe/refresh-session-iframe.service';
import { SilentRenewService } from '../iframe/silent-renew.service';
import { LoggerService } from '../logging/logger.service';
import { FlowHelper } from '../utils/flowHelper/flow-helper.service';
import { TabsSynchronizationService } from './../iframe/tabs-synchronization.service';
import { RefreshSessionRefreshTokenService } from './refresh-session-refresh-token.service';
import * as i0 from "@angular/core";
export declare const MAX_RETRY_ATTEMPTS = 3;
export declare class RefreshSessionService {
    private flowHelper;
    private configurationProvider;
    private flowsDataService;
    private loggerService;
    private silentRenewService;
    private authStateService;
    private authWellKnownService;
    private refreshSessionIframeService;
    private refreshSessionRefreshTokenService;
    private tabsSynchronizationService;
    constructor(flowHelper: FlowHelper, configurationProvider: ConfigurationProvider, flowsDataService: FlowsDataService, loggerService: LoggerService, silentRenewService: SilentRenewService, authStateService: AuthStateService, authWellKnownService: AuthWellKnownService, refreshSessionIframeService: RefreshSessionIframeService, refreshSessionRefreshTokenService: RefreshSessionRefreshTokenService, tabsSynchronizationService: TabsSynchronizationService);
    forceRefreshSession(customParams?: {
        [key: string]: string | number | boolean;
    }): Observable<{
        idToken: any;
        accessToken: any;
    }>;
    private silentRenewCase;
    private startRefreshSession;
    static ɵfac: i0.ɵɵFactoryDef<RefreshSessionService, never>;
    static ɵprov: i0.ɵɵInjectableDef<RefreshSessionService>;
}
//# sourceMappingURL=refresh-session.service.d.ts.map