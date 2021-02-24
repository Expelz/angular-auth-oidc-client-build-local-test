import { Observable } from 'rxjs';
import { AuthStateService } from './authState/auth-state.service';
import { CallbackService } from './callback/callback.service';
import { RefreshSessionService } from './callback/refresh-session.service';
import { CheckAuthService } from './check-auth.service';
import { ConfigurationProvider } from './config/config.provider';
import { PublicConfiguration } from './config/public-configuration';
import { FlowsDataService } from './flows/flows-data.service';
import { CheckSessionService } from './iframe/check-session.service';
import { AuthOptions } from './login/auth-options';
import { LoginService } from './login/login.service';
import { LogoffRevocationService } from './logoffRevoke/logoff-revocation.service';
import { StoragePersistanceService } from './storage/storage-persistance.service';
import { UserService } from './userData/user-service';
import { TokenHelperService } from './utils/tokenHelper/oidc-token-helper.service';
import * as i0 from "@angular/core";
export declare class OidcSecurityService {
    private checkSessionService;
    private checkAuthService;
    private userService;
    private tokenHelperService;
    private configurationProvider;
    private authStateService;
    private flowsDataService;
    private callbackService;
    private logoffRevocationService;
    private loginService;
    private storagePersistanceService;
    private refreshSessionService;
    get configuration(): PublicConfiguration;
    get userData$(): Observable<any>;
    get isAuthenticated$(): Observable<boolean>;
    get checkSessionChanged$(): Observable<boolean>;
    get stsCallback$(): Observable<unknown>;
    constructor(checkSessionService: CheckSessionService, checkAuthService: CheckAuthService, userService: UserService, tokenHelperService: TokenHelperService, configurationProvider: ConfigurationProvider, authStateService: AuthStateService, flowsDataService: FlowsDataService, callbackService: CallbackService, logoffRevocationService: LogoffRevocationService, loginService: LoginService, storagePersistanceService: StoragePersistanceService, refreshSessionService: RefreshSessionService);
    checkAuth(url?: string): Observable<boolean>;
    checkAuthIncludingServer(): Observable<boolean>;
    getToken(): string;
    getIdToken(): string;
    getRefreshToken(): string;
    getPayloadFromIdToken(encode?: boolean): any;
    setState(state: string): void;
    getState(): string;
    authorize(authOptions?: AuthOptions): void;
    authorizeWithPopUp(authOptions?: AuthOptions): Observable<{
        isAuthenticated: boolean;
        userData: any;
        accessToken: string;
    }>;
    forceRefreshSession(customParams?: {
        [key: string]: string | number | boolean;
    }): Observable<{
        idToken: string;
        accessToken: string;
    }>;
    logoffAndRevokeTokens(urlHandler?: (url: string) => any): Observable<any>;
    logoff(urlHandler?: (url: string) => any): void;
    logoffLocal(): void;
    revokeAccessToken(accessToken?: any): Observable<any>;
    revokeRefreshToken(refreshToken?: any): Observable<any>;
    getEndSessionUrl(): string | null;
    static ɵfac: i0.ɵɵFactoryDef<OidcSecurityService, never>;
    static ɵprov: i0.ɵɵInjectableDef<OidcSecurityService>;
}
//# sourceMappingURL=oidc.security.service.d.ts.map