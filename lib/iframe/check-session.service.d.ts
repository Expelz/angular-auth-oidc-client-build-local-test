import { NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigurationProvider } from '../config/config.provider';
import { LoggerService } from '../logging/logger.service';
import { PublicEventsService } from '../public-events/public-events.service';
import { StoragePersistanceService } from '../storage/storage-persistance.service';
import { IFrameService } from './existing-iframe.service';
import * as i0 from "@angular/core";
export declare class CheckSessionService {
    private storagePersistanceService;
    private loggerService;
    private iFrameService;
    private eventService;
    private configurationProvider;
    private zone;
    private checkSessionReceived;
    private scheduledHeartBeatRunning;
    private lastIFrameRefresh;
    private outstandingMessages;
    private heartBeatInterval;
    private iframeRefreshInterval;
    private checkSessionChangedInternal$;
    get checkSessionChanged$(): Observable<boolean>;
    constructor(storagePersistanceService: StoragePersistanceService, loggerService: LoggerService, iFrameService: IFrameService, eventService: PublicEventsService, configurationProvider: ConfigurationProvider, zone: NgZone);
    isCheckSessionConfigured(): boolean;
    start(): void;
    stop(): void;
    serverStateChanged(): boolean;
    getExistingIframe(): HTMLIFrameElement;
    private init;
    private pollServerSession;
    private clearScheduledHeartBeat;
    private messageHandler;
    private bindMessageEventToIframe;
    private getOrCreateIframe;
    static ɵfac: i0.ɵɵFactoryDef<CheckSessionService, never>;
    static ɵprov: i0.ɵɵInjectableDef<CheckSessionService>;
}
//# sourceMappingURL=check-session.service.d.ts.map