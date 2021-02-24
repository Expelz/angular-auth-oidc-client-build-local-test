import { ConfigurationProvider } from '../config/config.provider';
import { LoggerService } from '../logging/logger.service';
import { PublicEventsService } from '../public-events/public-events.service';
import { StoragePersistanceService } from '../storage/storage-persistance.service';
import { TokenValidationService } from '../validation/token-validation.service';
import { AuthorizationResult } from './authorization-result';
import * as i0 from "@angular/core";
export declare class AuthStateService {
    private storagePersistanceService;
    private loggerService;
    private publicEventsService;
    private configurationProvider;
    private tokenValidationService;
    private authorizedInternal$;
    get authorized$(): import("rxjs").Observable<boolean>;
    private get isAuthorized();
    constructor(storagePersistanceService: StoragePersistanceService, loggerService: LoggerService, publicEventsService: PublicEventsService, configurationProvider: ConfigurationProvider, tokenValidationService: TokenValidationService);
    setAuthorizedAndFireEvent(): void;
    setUnauthorizedAndFireEvent(): void;
    updateAndPublishAuthState(authorizationResult: AuthorizationResult): void;
    setAuthorizationData(accessToken: any, authResult: any): void;
    getAccessToken(): string;
    getIdToken(): string;
    getRefreshToken(): string;
    areAuthStorageTokensValid(): boolean;
    hasIdTokenExpired(): boolean;
    hasAccessTokenExpiredIfExpiryExists(): boolean;
    private decodeURIComponentSafely;
    private persistAccessTokenExpirationTime;
    static ɵfac: i0.ɵɵFactoryDef<AuthStateService, never>;
    static ɵprov: i0.ɵɵInjectableDef<AuthStateService>;
}
//# sourceMappingURL=auth-state.service.d.ts.map