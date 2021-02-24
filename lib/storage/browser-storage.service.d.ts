import { ConfigurationProvider } from '../config/config.provider';
import { LoggerService } from '../logging/logger.service';
import { AbstractSecurityStorage } from './abstract-security-storage';
import * as i0 from "@angular/core";
export declare class BrowserStorageService implements AbstractSecurityStorage {
    private configProvider;
    private loggerService;
    constructor(configProvider: ConfigurationProvider, loggerService: LoggerService);
    read(key: string): any;
    write(key: string, value: any): boolean;
    remove(key: string): boolean;
    private getStorage;
    private hasStorage;
    static ɵfac: i0.ɵɵFactoryDef<BrowserStorageService, never>;
    static ɵprov: i0.ɵɵInjectableDef<BrowserStorageService>;
}
//# sourceMappingURL=browser-storage.service.d.ts.map