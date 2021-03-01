import { ConfigurationProvider } from '../../config/config.provider';
import { AuthStateLauchedType, FlowsDataService } from '../../flows/flows-data.service';
import { LoggerService } from '../../logging/logger.service';
import { StoragePersistanceService } from '../../storage/storage-persistance.service';
import { TokenValidationService } from '../../validation/token-validation.service';
import { FlowHelper } from '../flowHelper/flow-helper.service';
import * as i0 from "@angular/core";
export declare class UrlService {
    private readonly configurationProvider;
    private readonly loggerService;
    private readonly flowsDataService;
    private readonly flowHelper;
    private tokenValidationService;
    private storagePersistanceService;
    constructor(configurationProvider: ConfigurationProvider, loggerService: LoggerService, flowsDataService: FlowsDataService, flowHelper: FlowHelper, tokenValidationService: TokenValidationService, storagePersistanceService: StoragePersistanceService);
    getUrlParameter(urlToCheck: any, name: any): string;
    isCallbackFromSts(currentUrl: string): boolean;
    getRefreshSessionSilentRenewUrl(customParams?: {
        [key: string]: string | number | boolean;
    }, authStateLauchedType?: AuthStateLauchedType): string;
    getAuthorizeUrl(customParams?: {
        [key: string]: string | number | boolean;
    }): string;
    createEndSessionUrl(idTokenHint: string): string;
    createRevocationEndpointBodyAccessToken(token: any): string;
    createRevocationEndpointBodyRefreshToken(token: any): string;
    getRevocationEndpointUrl(): any;
    createBodyForCodeFlowCodeRequest(code: string): string;
    createBodyForCodeFlowRefreshTokensRequest(refreshtoken: string, customParams?: {
        [key: string]: string | number | boolean;
    }): string;
    private createAuthorizeUrl;
    private createUrlImplicitFlowWithSilentRenew;
    private createUrlCodeFlowWithSilentRenew;
    private createUrlImplicitFlowAuthorize;
    private createUrlCodeFlowAuthorize;
    private getRedirectUrl;
    private getSilentRenewUrl;
    private getPostLogoutRedirectUrl;
    private getClientId;
    static ɵfac: i0.ɵɵFactoryDef<UrlService, never>;
    static ɵprov: i0.ɵɵInjectableDef<UrlService>;
}
//# sourceMappingURL=url.service.d.ts.map