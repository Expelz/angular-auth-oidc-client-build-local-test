import { RendererFactory2 } from '@angular/core';
import { Observable } from 'rxjs';
import { LoggerService } from '../logging/logger.service';
import { UrlService } from '../utils/url/url.service';
import { SilentRenewService } from './silent-renew.service';
import * as i0 from "@angular/core";
export declare class RefreshSessionIframeService {
    private readonly doc;
    private loggerService;
    private urlService;
    private silentRenewService;
    private renderer;
    constructor(doc: any, loggerService: LoggerService, urlService: UrlService, silentRenewService: SilentRenewService, rendererFactory: RendererFactory2);
    refreshSessionWithIframe(customParams?: {
        [key: string]: string | number | boolean;
    }): Observable<boolean>;
    private sendAuthorizeReqestUsingSilentRenew;
    private initSilentRenewRequest;
    static ɵfac: i0.ɵɵFactoryDef<RefreshSessionIframeService, never>;
    static ɵprov: i0.ɵɵInjectableDef<RefreshSessionIframeService>;
}
//# sourceMappingURL=refresh-session-iframe.service.d.ts.map