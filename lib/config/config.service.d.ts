import { ConfigValidationService } from '../config-validation/config-validation.service';
import { ConfigurationProvider } from '../config/config.provider';
import { LoggerService } from '../logging/logger.service';
import { PublicEventsService } from '../public-events/public-events.service';
import { StoragePersistanceService } from '../storage/storage-persistance.service';
import { AuthWellKnownEndpoints } from './auth-well-known-endpoints';
import { AuthWellKnownService } from './auth-well-known.service';
import { OpenIdConfiguration } from './openid-configuration';
import * as i0 from "@angular/core";
export declare class OidcConfigService {
    private loggerService;
    private publicEventsService;
    private configurationProvider;
    private authWellKnownService;
    private storagePersistanceService;
    private configValidationService;
    constructor(loggerService: LoggerService, publicEventsService: PublicEventsService, configurationProvider: ConfigurationProvider, authWellKnownService: AuthWellKnownService, storagePersistanceService: StoragePersistanceService, configValidationService: ConfigValidationService);
    withConfig(passedConfig: OpenIdConfiguration, passedAuthWellKnownEndpoints?: AuthWellKnownEndpoints): Promise<void>;
    static ɵfac: i0.ɵɵFactoryDef<OidcConfigService, never>;
    static ɵprov: i0.ɵɵInjectableDef<OidcConfigService>;
}
//# sourceMappingURL=config.service.d.ts.map