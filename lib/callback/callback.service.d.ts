import { Observable } from 'rxjs';
import { CallbackContext } from '../flows/callback-context';
import { FlowHelper } from '../utils/flowHelper/flow-helper.service';
import { UrlService } from '../utils/url/url.service';
import { CodeFlowCallbackService } from './code-flow-callback.service';
import { ImplicitFlowCallbackService } from './implicit-flow-callback.service';
import * as i0 from "@angular/core";
export declare class CallbackService {
    private urlService;
    private flowHelper;
    private implicitFlowCallbackService;
    private codeFlowCallbackService;
    private stsCallbackInternal$;
    get stsCallback$(): Observable<unknown>;
    constructor(urlService: UrlService, flowHelper: FlowHelper, implicitFlowCallbackService: ImplicitFlowCallbackService, codeFlowCallbackService: CodeFlowCallbackService);
    isCallback(currentUrl: string): boolean;
    handleCallbackAndFireEvents(currentCallbackUrl: string): Observable<CallbackContext>;
    static ɵfac: i0.ɵɵFactoryDef<CallbackService, never>;
    static ɵprov: i0.ɵɵInjectableDef<CallbackService>;
}
//# sourceMappingURL=callback.service.d.ts.map