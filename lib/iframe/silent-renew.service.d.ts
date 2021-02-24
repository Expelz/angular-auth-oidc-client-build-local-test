import { AuthStateService } from '../authState/auth-state.service';
import { ImplicitFlowCallbackService } from '../callback/implicit-flow-callback.service';
import { IntervallService } from '../callback/intervall.service';
import { ConfigurationProvider } from '../config/config.provider';
import { CallbackContext } from '../flows/callback-context';
import { FlowsDataService } from '../flows/flows-data.service';
import { FlowsService } from '../flows/flows.service';
import { LoggerService } from '../logging/logger.service';
import { PublicEventsService } from '../public-events/public-events.service';
import { FlowHelper } from '../utils/flowHelper/flow-helper.service';
import { IFrameService } from './existing-iframe.service';
import { TabsSynchronizationService } from './tabs-synchronization.service';
import * as i0 from "@angular/core";
export declare class SilentRenewService {
    private configurationProvider;
    private iFrameService;
    private flowsService;
    private flowsDataService;
    private authStateService;
    private loggerService;
    private flowHelper;
    private implicitFlowCallbackService;
    private intervallService;
    private tabsSynchronizationService;
    private publicEventsService;
    private refreshSessionWithIFrameCompletedInternal$;
    get refreshSessionWithIFrameCompleted$(): import("rxjs").Observable<CallbackContext>;
    constructor(configurationProvider: ConfigurationProvider, iFrameService: IFrameService, flowsService: FlowsService, flowsDataService: FlowsDataService, authStateService: AuthStateService, loggerService: LoggerService, flowHelper: FlowHelper, implicitFlowCallbackService: ImplicitFlowCallbackService, intervallService: IntervallService, tabsSynchronizationService: TabsSynchronizationService, publicEventsService: PublicEventsService);
    getOrCreateIframe(): HTMLIFrameElement;
    isSilentRenewConfigured(): boolean;
    codeFlowCallbackSilentRenewIframe(urlParts: any): import("rxjs").Observable<CallbackContext>;
    silentRenewEventHandler(e: CustomEvent): void;
    private getExistingIframe;
    static ɵfac: i0.ɵɵFactoryDef<SilentRenewService, never>;
    static ɵprov: i0.ɵɵInjectableDef<SilentRenewService>;
}
//# sourceMappingURL=silent-renew.service.d.ts.map