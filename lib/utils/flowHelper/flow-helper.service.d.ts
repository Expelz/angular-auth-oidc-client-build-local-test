import { ConfigurationProvider } from '../../config/config.provider';
import * as i0 from "@angular/core";
export declare class FlowHelper {
    private configurationProvider;
    constructor(configurationProvider: ConfigurationProvider);
    isCurrentFlowCodeFlow(): boolean;
    isCurrentFlowAnyImplicitFlow(): boolean;
    isCurrentFlowCodeFlowWithRefreshTokens(): boolean;
    isCurrentFlowImplicitFlowWithAccessToken(): boolean;
    isCurrentFlowImplicitFlowWithoutAccessToken(): boolean;
    currentFlowIs(flowTypes: string[] | string): boolean;
    static ɵfac: i0.ɵɵFactoryDef<FlowHelper, never>;
    static ɵprov: i0.ɵɵInjectableDef<FlowHelper>;
}
//# sourceMappingURL=flow-helper.service.d.ts.map