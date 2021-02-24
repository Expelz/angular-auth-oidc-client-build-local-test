import { Router } from '@angular/router';
import { ConfigurationProvider } from '../config/config.provider';
import { FlowsDataService } from '../flows/flows-data.service';
import { FlowsService } from '../flows/flows.service';
import { IntervallService } from './intervall.service';
import * as i0 from "@angular/core";
export declare class CodeFlowCallbackService {
    private flowsService;
    private flowsDataService;
    private intervallService;
    private configurationProvider;
    private router;
    constructor(flowsService: FlowsService, flowsDataService: FlowsDataService, intervallService: IntervallService, configurationProvider: ConfigurationProvider, router: Router);
    authorizedCallbackWithCode(urlToCheck: string): import("rxjs").Observable<import("../flows/callback-context").CallbackContext>;
    static ɵfac: i0.ɵɵFactoryDef<CodeFlowCallbackService, never>;
    static ɵprov: i0.ɵɵInjectableDef<CodeFlowCallbackService>;
}
//# sourceMappingURL=code-flow-callback.service.d.ts.map