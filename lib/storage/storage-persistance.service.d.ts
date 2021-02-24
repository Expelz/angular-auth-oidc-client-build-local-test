import { ConfigurationProvider } from '../config/config.provider';
import { AbstractSecurityStorage } from './abstract-security-storage';
import * as i0 from "@angular/core";
export declare type StorageKeys = 'authnResult' | 'authzData' | 'access_token_expires_at' | 'authWellKnownEndPoints' | 'userData' | 'authNonce' | 'codeVerifier' | 'authStateControl' | 'session_state' | 'storageSilentRenewRunning' | 'storageCustomRequestParams' | 'oidc-process-running-x' | 'oidc-process-running-y' | 'oidc-on-handler-running-x' | 'oidc-on-handler-running-y';
export declare class StoragePersistanceService {
    private readonly oidcSecurityStorage;
    private readonly configurationProvider;
    constructor(oidcSecurityStorage: AbstractSecurityStorage, configurationProvider: ConfigurationProvider);
    read(key: StorageKeys): any;
    write(key: StorageKeys, value: any): void;
    remove(key: StorageKeys): void;
    resetStorageFlowData(): void;
    resetAuthStateInStorage(): void;
    getAccessToken(): any;
    getIdToken(): any;
    getRefreshToken(): any;
    private createKeyWithPrefix;
    static ɵfac: i0.ɵɵFactoryDef<StoragePersistanceService, never>;
    static ɵprov: i0.ɵɵInjectableDef<StoragePersistanceService>;
}
//# sourceMappingURL=storage-persistance.service.d.ts.map