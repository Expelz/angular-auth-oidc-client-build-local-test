import { ConfigurationProvider } from '../config/config.provider';
import * as i0 from "@angular/core";
export declare class TabsSynchronizationService {
    private readonly configurationProvider;
    private _isLeaderSubjectInitialized;
    private _elector;
    private _silentRenewFinishedChannel;
    private _currentRandomId;
    private _prefix;
    constructor(configurationProvider: ConfigurationProvider);
    private Initialization;
    isLeaderCheck(): Promise<boolean>;
    addHandlerOnSilentRenewFinishedChannel(handler: any): void;
    silentRenewFinishedNotification(): void;
    static ɵfac: i0.ɵɵFactoryDef<TabsSynchronizationService, never>;
    static ɵprov: i0.ɵɵInjectableDef<TabsSynchronizationService>;
}
//# sourceMappingURL=tabs-synchronization.service.d.ts.map