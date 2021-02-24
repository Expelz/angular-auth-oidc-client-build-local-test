import { ConfigurationProvider } from '../config/config.provider';
import { LoggerService } from '../logging/logger.service';
import { StorageKeys, StoragePersistanceService } from '../storage/storage-persistance.service';
import { RandomService } from './random/random.service';
import * as i0 from "@angular/core";
export interface MutualExclusionLockingModel {
    xKey: StorageKeys;
    yKey: StorageKeys;
    state: string;
}
export declare class FlowsDataService {
    private storagePersistanceService;
    private randomService;
    private configurationProvider;
    private loggerService;
    constructor(storagePersistanceService: StoragePersistanceService, randomService: RandomService, configurationProvider: ConfigurationProvider, loggerService: LoggerService);
    createNonce(): string;
    setNonce(nonce: string): void;
    getAuthStateControl(): any;
    setAuthStateControl(authStateControl: string): void;
    getExistingOrCreateAuthStateControl(): any;
    createAuthStateControl(): any;
    setSessionState(sessionState: any): void;
    resetStorageFlowData(): void;
    getCodeVerifier(): any;
    createCodeVerifier(): string;
    setSilentRenewRunning(): void;
    resetSilentRenewRunning(): void;
    isSilentRenewRunning(): boolean;
    static ɵfac: i0.ɵɵFactoryDef<FlowsDataService, never>;
    static ɵprov: i0.ɵɵInjectableDef<FlowsDataService>;
}
//# sourceMappingURL=flows-data.service.d.ts.map