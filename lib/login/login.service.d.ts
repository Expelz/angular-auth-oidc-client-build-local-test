import { AuthStateService } from '../authState/auth-state.service';
import { AuthWellKnownService } from '../config/auth-well-known.service';
import { ConfigurationProvider } from '../config/config.provider';
import { LoggerService } from '../logging/logger.service';
import { RedirectService } from '../utils/redirect/redirect.service';
import { UrlService } from '../utils/url/url.service';
import { TokenValidationService } from '../validation/token-validation.service';
import { CheckAuthService } from './../check-auth.service';
import { UserService } from './../userData/user-service';
import { AuthOptions } from './auth-options';
import { PopupOptions } from './popup-options';
import { PopUpService } from './popup.service';
import * as i0 from "@angular/core";
export declare class LoginService {
    private loggerService;
    private tokenValidationService;
    private urlService;
    private redirectService;
    private configurationProvider;
    private authWellKnownService;
    private popupService;
    private checkAuthService;
    private userService;
    private authStateService;
    constructor(loggerService: LoggerService, tokenValidationService: TokenValidationService, urlService: UrlService, redirectService: RedirectService, configurationProvider: ConfigurationProvider, authWellKnownService: AuthWellKnownService, popupService: PopUpService, checkAuthService: CheckAuthService, userService: UserService, authStateService: AuthStateService);
    login(authOptions?: AuthOptions): void;
    loginWithPopUp(authOptions?: AuthOptions, popupOptions?: PopupOptions): import("rxjs").Observable<{
        isAuthenticated: boolean;
        userData: any;
        accessToken: string;
    }>;
    static ɵfac: i0.ɵɵFactoryDef<LoginService, never>;
    static ɵprov: i0.ɵɵInjectableDef<LoginService>;
}
//# sourceMappingURL=login.service.d.ts.map