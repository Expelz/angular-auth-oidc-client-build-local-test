import { FlowsService } from '../flows/flows.service';
import { LoggerService } from '../logging/logger.service';
import { IntervallService } from './intervall.service';
import * as i0 from "@angular/core";
export declare class RefreshSessionRefreshTokenService {
    private loggerService;
    private flowsService;
    private intervallService;
    constructor(loggerService: LoggerService, flowsService: FlowsService, intervallService: IntervallService);
    refreshSessionWithRefreshTokens(customParams?: {
        [key: string]: string | number | boolean;
    }): import("rxjs").Observable<import("../flows/callback-context").CallbackContext>;
    static ɵfac: i0.ɵɵFactoryDef<RefreshSessionRefreshTokenService, never>;
    static ɵprov: i0.ɵɵInjectableDef<RefreshSessionRefreshTokenService>;
}
//# sourceMappingURL=refresh-session-refresh-token.service.d.ts.map