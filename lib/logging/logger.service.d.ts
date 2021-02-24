import { ConfigurationProvider } from '../config/config.provider';
import * as i0 from "@angular/core";
export declare class LoggerService {
    private configurationProvider;
    constructor(configurationProvider: ConfigurationProvider);
    logError(message: any, ...args: any[]): void;
    logWarning(message: any, ...args: string[]): void;
    logDebug(message: any, ...args: string[]): void;
    private currentLogLevelIsEqualOrSmallerThan;
    private logLevelIsSet;
    private loggingIsTurnedOff;
    static ɵfac: i0.ɵɵFactoryDef<LoggerService, never>;
    static ɵprov: i0.ɵɵInjectableDef<LoggerService>;
}
//# sourceMappingURL=logger.service.d.ts.map