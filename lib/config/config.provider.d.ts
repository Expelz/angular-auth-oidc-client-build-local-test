import { PlatformProvider } from '../utils/platform-provider/platform.provider';
import { OpenIdConfiguration } from './openid-configuration';
import * as i0 from "@angular/core";
export declare class ConfigurationProvider {
    private platformProvider;
    private openIdConfigurationInternal;
    get openIDConfiguration(): OpenIdConfiguration;
    constructor(platformProvider: PlatformProvider);
    hasValidConfig(): boolean;
    setConfig(configuration: OpenIdConfiguration): OpenIdConfiguration;
    private setSpecialCases;
    static ɵfac: i0.ɵɵFactoryDef<ConfigurationProvider, never>;
    static ɵprov: i0.ɵɵInjectableDef<ConfigurationProvider>;
}
//# sourceMappingURL=config.provider.d.ts.map