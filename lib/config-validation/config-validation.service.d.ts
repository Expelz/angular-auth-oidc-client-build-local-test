import { OpenIdConfiguration } from '../angular-auth-oidc-client';
import { LoggerService } from '../logging/logger.service';
import * as i0 from "@angular/core";
export declare class ConfigValidationService {
    private loggerService;
    constructor(loggerService: LoggerService);
    validateConfig(passedConfig: OpenIdConfiguration): boolean;
    private getAllMessagesOfType;
    static ɵfac: i0.ɵɵFactoryDef<ConfigValidationService, never>;
    static ɵprov: i0.ɵɵInjectableDef<ConfigValidationService>;
}
//# sourceMappingURL=config-validation.service.d.ts.map