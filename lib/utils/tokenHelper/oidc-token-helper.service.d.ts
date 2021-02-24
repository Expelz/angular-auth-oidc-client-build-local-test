import { LoggerService } from '../../logging/logger.service';
import * as i0 from "@angular/core";
export declare class TokenHelperService {
    private readonly loggerService;
    constructor(loggerService: LoggerService);
    getTokenExpirationDate(dataIdToken: any): Date;
    getHeaderFromToken(token: any, encoded: boolean): any;
    getPayloadFromToken(token: any, encoded: boolean): any;
    getSignatureFromToken(token: any, encoded: boolean): any;
    private getPartOfToken;
    private urlBase64Decode;
    private tokenIsValid;
    private extractPartOfToken;
    static ɵfac: i0.ɵɵFactoryDef<TokenHelperService, never>;
    static ɵprov: i0.ɵɵInjectableDef<TokenHelperService>;
}
//# sourceMappingURL=oidc-token-helper.service.d.ts.map