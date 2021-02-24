import { Observable } from 'rxjs';
import { AuthStateService } from './authState/auth-state.service';
import { CallbackService } from './callback/callback.service';
import { PeriodicallyTokenCheckService } from './callback/periodically-token-check.service';
import { RefreshSessionService } from './callback/refresh-session.service';
import { ConfigurationProvider } from './config/config.provider';
import { CheckSessionService } from './iframe/check-session.service';
import { SilentRenewService } from './iframe/silent-renew.service';
import { LoggerService } from './logging/logger.service';
import { PopUpService } from './login/popup.service';
import { UserService } from './userData/user-service';
import * as i0 from "@angular/core";
export declare class CheckAuthService {
    private readonly doc;
    private checkSessionService;
    private silentRenewService;
    private userService;
    private loggerService;
    private configurationProvider;
    private authStateService;
    private callbackService;
    private refreshSessionService;
    private periodicallyTokenCheckService;
    private popupService;
    constructor(doc: any, checkSessionService: CheckSessionService, silentRenewService: SilentRenewService, userService: UserService, loggerService: LoggerService, configurationProvider: ConfigurationProvider, authStateService: AuthStateService, callbackService: CallbackService, refreshSessionService: RefreshSessionService, periodicallyTokenCheckService: PeriodicallyTokenCheckService, popupService: PopUpService);
    checkAuth(url?: string): Observable<boolean>;
    checkAuthIncludingServer(): Observable<boolean>;
    private startCheckSessionAndValidation;
    static ɵfac: i0.ɵɵFactoryDef<CheckAuthService, never>;
    static ɵprov: i0.ɵɵInjectableDef<CheckAuthService>;
}
//# sourceMappingURL=check-auth.service.d.ts.map