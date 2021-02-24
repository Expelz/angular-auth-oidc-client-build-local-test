import { Router } from '@angular/router';
import { ConfigurationProvider } from '../config/config.provider';
import { FlowsDataService } from '../flows/flows-data.service';
import { FlowsService } from '../flows/flows.service';
import { IntervallService } from './intervall.service';
import * as i0 from "@angular/core";
export declare class ImplicitFlowCallbackService {
    private flowsService;
    private configurationProvider;
    private router;
    private flowsDataService;
    private intervallService;
    constructor(flowsService: FlowsService, configurationProvider: ConfigurationProvider, router: Router, flowsDataService: FlowsDataService, intervallService: IntervallService);
    authorizedImplicitFlowCallback(hash?: string): import("rxjs").Observable<import("../flows/callback-context").CallbackContext>;
    static ɵfac: i0.ɵɵFactoryDef<ImplicitFlowCallbackService, never>;
    static ɵprov: i0.ɵɵInjectableDef<ImplicitFlowCallbackService>;
}
//# sourceMappingURL=implicit-flow-callback.service.d.ts.map