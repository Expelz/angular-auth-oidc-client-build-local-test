import { Observable } from 'rxjs';
import { ConfigurationProvider } from '../config/config.provider';
import { PublicEventsService } from '../public-events/public-events.service';
import { LoggerService } from './../logging/logger.service';
import * as i0 from "@angular/core";
export declare class TabsSynchronizationService {
    private readonly configurationProvider;
    private readonly publicEventsService;
    private readonly loggerService;
    private _isLeaderSubjectInitialized;
    private _isClosed;
    private _elector;
    private _silentRenewFinishedChannel;
    private _leaderChannel;
    private _silentRenewFinished$;
    private _leaderSubjectInitialized$;
    private _currentRandomId;
    private _prefix;
    constructor(configurationProvider: ConfigurationProvider, publicEventsService: PublicEventsService, loggerService: LoggerService);
    get isClosed(): boolean;
    isLeaderCheck(): Promise<boolean>;
    getSilentRenewFinishedObservable(): Observable<boolean>;
    sendSilentRenewFinishedNotification(): void;
    closeTabSynchronization(): void;
    reInitialize(): void;
    private Initialization;
    private initializeSilentRenewFinishedChannelWithHandler;
    static ɵfac: i0.ɵɵFactoryDef<TabsSynchronizationService, never>;
    static ɵprov: i0.ɵɵInjectableDef<TabsSynchronizationService>;
}
//# sourceMappingURL=tabs-synchronization.service.d.ts.map